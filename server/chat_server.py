from flask import Flask, request
from flask_socketio import SocketIO, emit
from Crypto.Util.number import getPrime
import uuid
import sqlite3
import bcrypt

# --------------------------- helper functions:-----------------------------------------------
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

def hash_password(password):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password

def check_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

db_connection = None
# function to get the database connection (singleton pattern)
def get_db_connection():
    global db_connection
    if db_connection is None:
        db_connection = sqlite3.connect('database.db', check_same_thread=False)
        db_connection.row_factory = sqlite3.Row
    return db_connection

# --------------------------- helper functions:-----------------------------------------------


# Dictionary to store connected users
users = {}  # Format: {user_id: (user_name, session_id)}

# Save people that have chat with each other 
chats = {} # Format: {user_id: {user_id: true}}

def prime_number():
    return getPrime(128) 

def handle_login_user(userName, password):
    db = get_db_connection()
    # Check if the user already exists
    userInfo = db.execute('SELECT id, hashed_password FROM User WHERE user_name = ?', (userName,)).fetchone()
    if not userInfo:
        print(f'User {userName} does not exist')
        return False, None
    if not check_password(password, userInfo['hashed_password']):
        print(f'Invalid password for user {userName}')
        return False, None
    print(f'User {userName} logged in with ID {userInfo["id"]}')
    return True, userInfo['id']

@socketio.on('connect')
def handle_connect():
    print()
    print('Client connected')

@socketio.on('authenticate')
def handle_register_user(data):
    user_name = data.get('username')
    user_password = data.get('password')
    user_email = data.get('email')
    method = data.get('method')
    session_id = request.sid
    
    if method == 'login':
        status, user_id = handle_login_user(user_name, user_password)
        if status:
            users[user_id] = (user_name, session_id)
            chats[user_id] = {}
            emit('users', [{'id': uid, 'name': name} for uid, (name, _) in users.items()], broadcast=True)
    else:
        db = get_db_connection()
        # Check if the user already exists
        existing_user = db.execute('SELECT id FROM User WHERE user_name = ?', (user_name,)).fetchone()
        
        if existing_user:
            user_id = existing_user['id']
            print(f'User {user_name} already exists with id {user_id}')
            socketio.emit('authenticate_fail', room=session_id)
            return
        
        user_id = str(uuid.uuid4())  # Generate a unique user id
        db.execute('INSERT INTO User (id, user_email, user_name, hashed_password) VALUES (?, ?, ?, ?)',
        (user_id, user_email, user_name, hash_password(user_password))) 
        db.commit()
        print(f'User {user_name} registered with id {user_id} and session id {session_id}')
        
        users[user_id] = (user_name, session_id)
        chats[user_id] = {}
        
        emit('users', [{'id': uid, 'name': name} for uid, (name, _) in users.items()], broadcast=True)

@socketio.on('encrypt_key_message')
def handle_encrypt_key_message(data):
    print(f'Received encrypt_key_message: {data}')
    to_user = data.get('to_user')
    from_user = data.get('from_user')
    encrypted_key = data.get('message')

    # Fetch the session id for the recipient
    to_user_sid = None
    for uid, (name, sid) in users.items():
        if uid == to_user:
            to_user_sid = sid
            break

    if to_user_sid:
        emit('receive_encrypt_key', {
            'message': encrypted_key,
            'from_user': from_user,
            'to_user': to_user
        }, room=to_user_sid)

    print(f'Encryption key for {to_user} from {from_user} stored and sent successfully!')

@socketio.on('get_old_messages')
def handle_get_old_messages(data):
    user_id = data.get('user_id')
    session_id = request.sid
    
    db = get_db_connection()
    messages = db.execute('SELECT encrypted_message, sender_id, receiver_id FROM Message WHERE sender_id = ? OR receiver_id = ?', (user_id, user_id)).fetchall()
    
    print(f'Sending old messages to user {user_id}')
    
    emit("old_messages", [{'message': message['encrypted_message'], 'from_user': message['sender_id'], 'to_user': message['receiver_id']} for message in messages], room=session_id)

@socketio.on('chat_message')
def handle_chat_message(data):
    #print(f'Received chat message: {data}')
    to_user = data.get('to_user')
    from_user = data.get('from_user')
    message = data.get('message')
    #print('List of users:', users)
    
    # Find the session id for the recipient
    to_user_sid = None
    for uid, (name, sid) in users.items():
        if uid == to_user:
            to_user_sid = sid
            break

    # Find the session id for the sender
    from_user_sid = None
    for uid, (name, sid) in users.items():
        if uid == from_user:
            from_user_sid = sid
    
    if to_user_sid:
        # Check if the users have chat with each other -> Send prime
        if from_user in chats:
            p = prime_number()
            if chats[from_user].get(to_user) != True:
                chats[from_user][to_user] = True
                chats[to_user][from_user] = True
                emit('prime_number_message', {
                    'prime_number': str(p),
                    'generator': 2,
                    'to_user': from_user,
                    'from_user': to_user,  
                }, room = from_user_sid)
                emit('prime_number_message', {
                    'prime_number': str(p),
                    'generator': 2,
                    'to_user': to_user,
                    'from_user': from_user,
                }, room = to_user_sid)
        
        emit('receive_message', {
            'message': message,
            'from_user': from_user,
            'to_user': to_user
        }, room=to_user_sid)
        db = get_db_connection()
        db.execute('INSERT INTO Message (message_id, sender_id, receiver_id, encrypted_message) VALUES (?, ?, ?, ?)',
                   (str(uuid.uuid4()), from_user, to_user, message))
        db.commit()
        print(f'Message from {from_user} to {to_user} sent successfully!')

@socketio.on('disconnect')
def handle_disconnect():
    disconnected_user_id = None
    for user_id, (user_name, sid) in users.items():
        if sid == request.sid:
            disconnected_user_id = user_id
            break
    if disconnected_user_id:
        del users[disconnected_user_id]
        print(f'User with id {disconnected_user_id} disconnected')
        emit('users', [{'id': uid, 'name': name} for uid, (name, _) in users.items()], broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000)