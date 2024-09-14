import sqlite3

# Connect to the SQLite database
conn = sqlite3.connect('database.db')
print("Connected to database successfully")

# Create the User table
conn.execute('''
CREATE TABLE User (
    id VARCHAR(255) PRIMARY KEY,
    user_email TEXT NOT NULL,
    user_name TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL
)
''')
print("Created 'User' table successfully!")

# Create the MessageKey table
conn.execute('''
CREATE TABLE MessageKey (
    sender_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,
    encrypted_secret_key TEXT NOT NULL,
    PRIMARY KEY (sender_id, receiver_id)
)
''')
print("Created 'MessageKey' table successfully!")

# Create the Message table
conn.execute('''
CREATE TABLE Message (
    message_id VARCHAR(255) PRIMARY KEY,
    sender_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,
    encrypted_message TEXT NOT NULL
)
''')
print("Created 'Message' table successfully!")

# Close the connection
conn.close()
