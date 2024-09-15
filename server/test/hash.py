import bcrypt
from flask import Flask, request
from flask_socketio import SocketIO, emit
from Crypto.Util.number import getPrime
import uuid
import sqlite3

def hash_password(password):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password

def check_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

# # Example usage
# plain_password = "my_secret_password"
# hashed = hash_password(plain_password)
# print(f"Hashed Password: {hashed}")
# is_correct = check_password("my_secret_password", hashed)
# print(f"Is the password correct? {is_correct}")



db_connection = None
# function to get the database connection (singleton pattern)
def get_db_connection():
    global db_connection
    if db_connection is None:
        db_connection = sqlite3.connect('database.db', check_same_thread=False)
        db_connection.row_factory = sqlite3.Row
    return db_connection


def handle_register_user(userName, userEmail, password):
    db = get_db_connection()
    # Check if the user already exists
    existing_user = db.execute('SELECT ID FROM User WHERE userName = ?', (userName)).fetchone()
    
    if existing_user:
        user_id = existing_user['ID']
        print(f'User {userName} already exists with ID {user_id}')
        return False
    else:
        user_id = str(uuid.uuid4())  # Generate a unique user ID
        db.execute('INSERT INTO User (ID, userEmail, userName, hashedPassword) VALUES (?, ?, ?, ?)',
                   (user_id, userEmail, userName, hash_password(password))) 
        db.commit()
        print(f'User {userName} registered with ID {user_id} ')
        return True
    

def handle_login_user(userName, password):
    db = get_db_connection()
    # Check if the user already exists
    userInfo = db.execute('SELECT ID, hashedPassword FROM User WHERE userName = ?', (userName,)).fetchone()
    if not userInfo:
        print(f'User {userName} does not exist')
        return False
    if not check_password(password, userInfo['hashedPassword']):
        print(f'Invalid password for user {userName}')
        return False
    print(f'User {userName} logged in with ID {userInfo['ID']}')
    return True

#handle_register_user('quoc', 'tlquoc03@gmail.com', 'xinchao')
handle_login_user('vinh', '')
handle_login_user('quoc', 'xinchao0')
handle_login_user('quoc', 'xinchao')

