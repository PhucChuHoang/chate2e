from flask import Flask, request
from flask_socketio import SocketIO, emit
import uuid

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Dictionary to store connected users
users = {}  # Format: {user_id: (user_name, session_id)}

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('register_user')
def handle_register_user(data):
    user_name = data.get('name')
    user_id = str(uuid.uuid4())  # Generate a unique user ID
    users[user_id] = (user_name, request.sid)  # Store user ID, name, and session ID
    print(f'User {user_name} registered with ID {user_id} and session ID {request.sid}')
    
    # Send the updated list of users with their IDs
    emit('users', [{'id': uid, 'name': name} for uid, (name, _) in users.items()], broadcast=True)

@socketio.on('chat_message')
def handle_chat_message(data):
    print(f'Received chat message: {data}')
    to_user = data.get('to_user')
    from_user = data.get('from_user')
    message = data.get('message')
    print('List of users:', users)
    
    # Find the session ID for the recipient
    to_user_sid = None
    for uid, (name, sid) in users.items():
        if uid == to_user:
            to_user_sid = sid
            break
    
    if to_user_sid:
        print(f'Sending message to user with ID {to_user_sid}')
        emit('receive_message', {
            'message': message,
            'from_user': from_user,
            'to_user': to_user
        }, room=to_user_sid)

@socketio.on('disconnect')
def handle_disconnect():
    disconnected_user_id = None
    for user_id, (user_name, sid) in users.items():
        if sid == request.sid:
            disconnected_user_id = user_id
            break
    if disconnected_user_id:
        del users[disconnected_user_id]
        print(f'User with ID {disconnected_user_id} disconnected')
        emit('users', [{'id': uid, 'name': name} for uid, (name, _) in users.items()], broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000)
