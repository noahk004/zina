# server.py
from flask import Flask, render_template
import socketio
from PIL import Image

js_object = {
    "image": Image.open('img_aud\\image.png'),
    "audio": 'img_aug\\audio.mp3',
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
    print(f'Received message from {sid}: {data}')
    # Broadcast the received message to all clients
    sio.emit('message', f'User {sid} says: {data}', skip_sid=None)

# Emit an array to the client
@sio.event
def request_array(data):
    sio.emit('response_array', data)

@sio.event
def create_course(data):
    # Give course "data" to ML model
    js_return_val = sio.sendModel(data); # placeholder

    # Add new course received from ML model in courses
    courses.append(js_return_val)

    # Send 200 HTTP Code to client
    sio.emit('create_course', js_return_val)

if __name__ == '__main__':
    # Run the app with eventlet's WSGI server
    import eventlet
    import eventlet.wsgi
    from werkzeug.middleware.dispatcher import DispatcherMiddleware

    # Wrap Flask app for eventlet
    app = DispatcherMiddleware(app)
    eventlet.wsgi.server(eventlet.listen(('', 5050)), app)