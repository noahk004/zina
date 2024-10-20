# server.py
import socketio
import chromadb
import requests
import getpass
import os
import httpx
from dotenv import load_dotenv
import threading

from deepgram import (
    DeepgramClient,
    LiveTranscriptionEvents,
    LiveOptions,
    SpeakOptions
)

from bs4 import BeautifulSoup
from urllib.parse import urljoin
from flask import Flask, render_template
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
from chromadb.utils.data_loaders import ImageLoader
from langchain import hub
from langchain_chroma import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.embeddings.base import Embeddings
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
from langchain.docstore.document import Document
from langchain.memory import ConversationBufferMemory
from langchain_community.chat_message_histories import ChatMessageHistory#from langchain.memory import ChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.prompts import PromptTemplate
from langchain_mistralai import ChatMistralAI

load_dotenv()

URL = "http://localhost:3000/courses/data-structures/classroom"

API_KEY = os.getenv("5eea543264e20ce240e0496ee8ed7abebab66d1d")



course_outline = {
    'data_structures': ['Classification of Data Structures', 'Introducing Queue', 'Introducing Stack']
}
data_loader = ImageLoader()
client = chromadb.Client()
os.environ["MISTRAL_API_KEY"] = 'dmyWQ4LGbojOTdrlvWtwujkmLSScUQGo'
llm = ChatMistralAI(model="mistral-large-2407")

def main():
    try:
        # STEP 1: Create a Deepgram client using the API key
        deepgram = DeepgramClient(API_KEY)

        # STEP 2: Create a websocket connection to Deepgram
        dg_connection = deepgram.listen.live.v("1")

        # STEP 3: Define the event handlers for the connection
        def on_message(self, result, **kwargs):
            sentence = result.channel.alternatives[0].transcript
            if len(sentence) == 0:
                return
            print(f"speaker: {sentence}")

        def on_metadata(self, metadata, **kwargs):
            print(f"\n\n{metadata}\n\n")

        def on_error(self, error, **kwargs):
            print(f"\n\n{error}\n\n")

        # STEP 4: Register the event handlers
        dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)
        dg_connection.on(LiveTranscriptionEvents.Metadata, on_metadata)
        dg_connection.on(LiveTranscriptionEvents.Error, on_error)

        # STEP 5: Configure Deepgram options for live transcription
        options = LiveOptions(
            model="nova-2", 
            language="en-US", 
            smart_format=True,
            )
        
        # STEP 6: Start the connection
        dg_connection.start(options)

        # STEP 7: Create a lock and a flag for thread synchronization
        lock_exit = threading.Lock()
        exit = False

        # STEP 8: Define a thread that streams the audio and sends it to Deepgram
        def myThread():
            with httpx.stream("GET", URL) as r:
                for data in r.iter_bytes():
                    lock_exit.acquire()
                    if exit:
                        break
                    lock_exit.release()

                    dg_connection.send(data)

        # STEP 9: Start the thread
        myHttp = threading.Thread(target=myThread)
        myHttp.start()

        # STEP 10: Wait for user input to stop recording
        input("Press Enter to stop recording...\n\n")

        # STEP 11: Set the exit flag to True to stop the thread
        lock_exit.acquire()
        exit = True
        lock_exit.release()

        # STEP 12: Wait for the thread to finish
        myHttp.join()

        # STEP 13: Close the connection to Deepgram
        dg_connection.finish()

        print("Finished")

    except Exception as e:
        print(f"Could not open socket: {e}")
        return

def scrape_text_and_images(url):
    # Fetch the content of the URL
    response = requests.get(url)
    html_content = response.content

    # Parse the HTML content
    soup = BeautifulSoup(html_content, 'html.parser')

    # # Remove <script> and <style> elements
    # for script_or_style in soup(['script', 'style']):
    #     script_or_style.decompose()

    # Extract text
    text = soup.get_text(separator=' ', strip=True)

    # Extract image URLs
    image_urls = []
    for img in soup.find_all('img'):
        img_src = img.get('src')
        if img_src:
            # Handle relative URLs
            img_url = urljoin(url, img_src)
            image_urls.append(img_url)

    return text, image_urls

class ChromaOpenCLIPEmbeddings(Embeddings):
    def __init__(self):
        self.embedding_function = OpenCLIPEmbeddingFunction()

    def embed_documents(self, texts):
        # Chroma's embedding function can handle lists of texts
        return self.embedding_function(texts)

    def embed_query(self, text):
        # For a single query, wrap it in a list and extract the first result
        return self.embedding_function([text])[0]

embeddings = ChromaOpenCLIPEmbeddings()
vectorstore = Chroma(
    collection_name='text_collection',
    embedding_function=embeddings,
)
image_collection = client.get_or_create_collection(
    name="image_collection",
    embedding_function=OpenCLIPEmbeddingFunction()
)
urls = ['https://www.programiz.com/dsa/queue', 'https://www.programiz.com/dsa/stack', 'https://www.geeksforgeeks.org/introduction-to-data-structures/']
for url in urls:
    text, image_urls = scrape_text_and_images(url)
    doc = Document(page_content=text, metadata={'source': url})
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
    splits = text_splitter.split_documents([doc])
    text_chunks = [split.page_content for split in splits]
    vectorstore.add_texts(
        texts=text_chunks,
        metadatas=[{'source': url}] * len(splits)
    )
    for img_url in image_urls:
        image_collection.add(
            documents=[img_url],
            metadatas=[{'source': url}],
            ids=[img_url]
        )
retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

prompt_template = PromptTemplate(
    input_variables=["chat_history", "context", "question"],
    template="""
        You are a tutoring agent that summarizes retrieves documents to answer questions. Limit the answer to 50 words.
        The following is a conversation between a user and an AI assistant.

        {chat_history}

        Context:
        {context}

        Current Question:
        {question}

        Assistant:"""
    )
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def get_latest_question(messages):
    for message in reversed(messages):
        if message.type == "user":
            return message.content
    return ""

def format_chat_history(messages):
    return "\n".join([f"{msg.type.capitalize()}: {msg.content}" for msg in messages])

def scrape_text_and_images(url):
    # Fetch the content of the URL
    response = requests.get(url)
    html_content = response.content

    # Parse the HTML content
    soup = BeautifulSoup(html_content, 'html.parser')

    # # Remove <script> and <style> elements
    # for script_or_style in soup(['script', 'style']):
    #     script_or_style.decompose()

    # Extract text
    text = soup.get_text(separator=' ', strip=True)

    # Extract image URLs
    image_urls = []
    for img in soup.find_all('img'):
        img_src = img.get('src')
        if img_src:
            # Handle relative URLs
            img_url = urljoin(url, img_src)
            image_urls.append(img_url)

    return text, image_urls
    
# Create the chain
rag_chain = (
    {
        "chat_history": RunnableLambda(lambda inputs: format_chat_history(inputs["messages"])),
        "question": RunnableLambda(lambda inputs: get_latest_question(inputs["messages"])),
        "context": (RunnableLambda(lambda inputs: get_latest_question(inputs["messages"])) | retriever | format_docs),
    }
    | prompt_template
    | llm
    | StrOutputParser()
)

# Initialize the conversation history
demo_ephemeral_chat_history = ChatMessageHistory()


js_object = {
    "image": 'img_aud\\image.png',
    "audio": 'img_aud\\audio.mp3',
    "text": "text"
}

courses = []

# Create a Flask app
app = Flask(__name__)

# Create a Socket.IO server
sio = socketio.Server(cors_allowed_origins="*")  # Allow all origins; adjust in production

# Wrap the Flask app with Socket.IO's middleware
app.wsgi_app = socketio.WSGIApp(sio, app.wsgi_app)

# Optional: Define a route for the home page
@app.route('/')
def index():
    return "Socket.IO Server is running."

# Handle client connection
@sio.event
def connect(sid, environ):
    print(f'Client connected: {sid}')
    sio.emit('message', f'User {sid} has connected.', skip_sid=None)

# Handle client disconnection
@sio.event
def disconnect(sid):
    print(f'Client disconnected: {sid}')
    sio.emit('message', f'User {sid} has disconnected.', skip_sid=None)

# Handle custom events from clients
@sio.event
def send_message(sid, data):
    # BEGIN DEEPGRAM AUDIO ADDING

    filepath = "output" + sid + ".wav"

    try:

        if os.path.exists(filepath):
            os.remove(filepath)

        API_KEY = '5eea543264e20ce240e0496ee8ed7abebab66d1d'
        deepgram = DeepgramClient(api_key=API_KEY)

        audioOptions = SpeakOptions(
                model="aura-asteria-en",
                encoding="linear16",
                container="wav"
            )
        
        SPEAK_OPTIONS = {"text": data}
        
        audioResponse = deepgram.speak.v("1").save(filepath, SPEAK_OPTIONS, audioOptions)
        print(audioResponse.to_json(indent=4))

        with open(audioResponse.filename, "rb") as audio_file:
            audio_data = audio_file.read()
            # Emit the audio data as binary to the frontend
            print("YAY")

    except Exception as e:
        print(f"Exception: {e}")
    # END DEEPGRAM AUDIO ADDING

    print(f'Received message from {sid}: {data}')
    images = []
    text_contents = []
    images = [
        'https://media.geeksforgeeks.org/wp-content/uploads/20220520182504/ClassificationofDataStructure-660x347.jpg',
        'https://cdn.programiz.com/sites/tutorial2program/files/queue.png',
        'https://cdn.programiz.com/sites/tutorial2program/files/stack.png'
    ]
    text_contents = [
        'Data structures are classified into various types, including: - Linear: Arrays, Linked Lists (Singly, Doubly, Circular), Stacks, Queues. - Non-linear: Trees (Generic, Binary, BST, AVL, etc.), Graphs. - Others: Hash Tables, Heaps, Sets, Maps.',
        'A queue is a fundamental data structure in computer science that follows the First-In-First-Out (FIFO) principle. Elements are added at the rear and removed from the front. Queues are commonly used in scenarios like task scheduling and breadth-first search algorithms.',
        'Stack is a linear data structure that follows the Last In, First Out (LIFO) principle. It supports two main operations: push (add element to top) and pop (remove top element).'
    ]
    # for topic in course_outline.get(data, [data]):
    #     # Broadcast the received message to all clients
    #     demo_ephemeral_chat_history.add_user_message(topic)
    #     image_results = image_collection.query(
    #         query_texts=[topic],
    #         n_results=1
    #     )
    #     images.append(image_results.get('documents', [None])[0][0])
    #     # Invoke the chain again
    #     response = rag_chain.invoke(
    #         {
    #             "messages": [(demo_ephemeral_chat_history.messages)[-1]],
    #         }
    #     )
    #     text_contents.append(response)
    sio.emit('message', {
        'images': images,
        'text_contents': text_contents,
        'audio_data': audio_data,
    })

if __name__ == '__main__':
    # Run the app with eventlet's WSGI server
    import eventlet
    import eventlet.wsgi
    from werkzeug.middleware.dispatcher import DispatcherMiddleware

    # Wrap Flask app for eventlet
    app = DispatcherMiddleware(app)
    eventlet.wsgi.server(eventlet.listen(('', 5050)), app)
    main()