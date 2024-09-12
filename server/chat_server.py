from flask import Flask, request
from flask_socketio import SocketIO, emit
from Crypto.Util.number import getPrime
import uuid
import sqlite3

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

db_connection = None
# function to get the database connection (singleton pattern)
def get_db_connection():
    global db_connection
    if db_connection is None:
        db_connection = sqlite3.connect('database.db', check_same_thread=False)
        db_connection.row_factory = sqlite3.Row
    return db_connection


# Dictionary to store connected users
users = {}  # Format: {user_id: (user_name, session_id)}

# Save people that have chat with each other 
chats = {} # Format: {user_id: {user_id: true}}

def prime_number():
    return getPrime(128) 

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('register_user')
def handle_register_user(data):
    user_name = data.get('name')
    session_id = request.sid

    db = get_db_connection()
    
    # Check if the user already exists
    existing_user = db.execute('SELECT ID FROM User WHERE username = ?', (user_name,)).fetchone()
    
    if existing_user:
        user_id = existing_user['ID']
        print(f'User {user_name} already exists with ID {user_id}')
    else:
        user_id = str(uuid.uuid4())  # Generate a unique user ID
        db.execute('INSERT INTO User (ID, name, username, hashedPassword) VALUES (?, ?, ?, ?)',
                   (user_id, user_name, user_name, '')) 
        db.commit()
        print(f'User {user_name} registered with ID {user_id} and session ID {session_id}')
    
    # Update the users dictionary
    users[user_id] = (user_name, session_id)
    # Initialize chat records for the user
    chats[user_id] = {}
    
    # Fetch all users
    dbUsers = db.execute('SELECT ID, name FROM User').fetchall()
    
    # Send the updated list of users
    # TESTDB: broadcast for ALL USER
    emit('users', [{'id': user['ID'], 'name': user['name']} for user in dbUsers], broadcast=True)
    

    # TODO: uncomment to broadcast with all ONLINE users, not ALL users
    # Send the updated list of users with their IDs
    #emit('users', [{'id': uid, 'name': name} for uid, (name, _) in users.items()], broadcast=True)

@socketio.on('encrypt_key_message')
def handle_encrypt_key_message(data):
    print(f'Received encrypt_key_message: {data}')
    to_user = data.get('to_user')
    from_user = data.get('from_user')
    encrypted_key = data.get('message')

    db = get_db_connection()

    # Store the encryption key in the database
    db.execute('INSERT OR REPLACE INTO MessageKey (SenderID, ReceiverID, encryptedSecretKey) VALUES (?, ?, ?)',
               (from_user, to_user, encrypted_key))
    db.commit()
    
    # Fetch the session ID for the recipient
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

@socketio.on('chat_message')
def handle_chat_message(data):
    #print(f'Received chat message: {data}')
    to_user = data.get('to_user')
    from_user = data.get('from_user')
    message = data.get('message')
    #print('List of users:', users)
    
    # Find the session ID for the recipient
    to_user_sid = None
    for uid, (name, sid) in users.items():
        if uid == to_user:
            to_user_sid = sid
            break

    # Find the session ID for the sender
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
        
        #print(f'Sending message to user with ID {to_user_sid}')
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