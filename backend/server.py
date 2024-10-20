# server.py
import socketio
import chromadb
import requests
import getpass
import os

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
from langchain.memory import ChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.prompts import PromptTemplate
from langchain_mistralai import ChatMistralAI

course_outline = {
    'data_structures': ['Classification of Data Structures', 'Introducing Queue', 'Introducing Stack']
}
data_loader = ImageLoader()
client = chromadb.Client()
os.environ["MISTRAL_API_KEY"] = 'dmyWQ4LGbojOTdrlvWtwujkmLSScUQGo'
llm = ChatMistralAI(model="mistral-large-2407")

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


# Create a Socket.IO server
sio = socketio.Server(cors_allowed_origins="*")  # Allow all origins; adjust in production

# Create a Flask app
app = Flask(__name__)

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
    print(f'Received message from {sid}: {data}')
    images = []
    text_contents = []
    for topic in course_outline.get(data, [data]):
        # Broadcast the received message to all clients
        demo_ephemeral_chat_history.add_user_message(topic)
        image_results = image_collection.query(
            query_texts=[topic],
            n_results=1
        )
        images.append(image_results.get('documents', [None])[0][0])
        # Invoke the chain again
        response = rag_chain.invoke(
            {
                "messages": [(demo_ephemeral_chat_history.messages)[-1]],
            }
        )
        text_contents.append(response)
    sio.emit('message', f'AI says: {str(images)}', skip_sid=None)
    sio.emit('message', f'AI says: {str(text_contents)}', skip_sid=None)

if __name__ == '__main__':
    # Run the app with eventlet's WSGI server
    import eventlet
    import eventlet.wsgi
    from werkzeug.middleware.dispatcher import DispatcherMiddleware

    # Wrap Flask app for eventlet
    app = DispatcherMiddleware(app)
    eventlet.wsgi.server(eventlet.listen(('', 5050)), app)
