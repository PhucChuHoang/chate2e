# chat_server.py

from flask import Flask, request
import socketio
from typing import List
from pydantic import BaseModel

app = Flask(__name__)

# Create a Socket.IO server
sio = socketio.Server(cors_allowed_origins="http://localhost:3000", async_mode="eventlet")
socket_app = socketio.WSGIApp(sio, app)

# Store connected users and messages in memory
connected_users = {}
messages = []

class Message(BaseModel):
    message: str
    from_user: str
    to_user: str

@app.route("/")
def index():
    return {"message": "Chat server is running"}

@app.route("/messages")
def get_messages():
    return {"messages": messages}

@sio.event
def connect(sid, environ):
    print(f"Client {sid} connected with environ: {environ}")
    sio.emit('users', list(connected_users.values()), room=sid)

@sio.event
def disconnect(sid):
    print(f"Client {sid} disconnected")
    user = connected_users.pop(sid, None)
    if user:
        sio.emit('users', list(connected_users.values()))

@sio.on('register_user')
def handle_register_user(sid, data):
    username = data['name']
    connected_users[sid] = {'id': sid, 'name': username}
    sio.emit('users', list(connected_users.values()))

@sio.on('chat_message')
def handle_chat_message(sid, data):
    message = Message(**data)
    print(f"Received message from {message.from_user} to {message.to_user}: {message.message}")
    messages.append({
        'message': message.message,
        'from_user': message.from_user,
        'to_user': message.to_user
    })
    recipient_sid = next((key for key, value in connected_users.items() if value['name'] == message.to_user), None)
    if recipient_sid:
        sio.emit('receive_message', data, room=recipient_sid)

if __name__ == "__main__":
    import eventlet
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 8000)), socket_app)
