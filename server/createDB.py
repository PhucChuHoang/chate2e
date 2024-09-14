import sqlite3

# Connect to the SQLite database
conn = sqlite3.connect('database.db')
print("Connected to database successfully")

# Create the User table
conn.execute('''
CREATE TABLE User (
    ID VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    hashedPassword TEXT NOT NULL
)
''')
print("Created 'User' table successfully!")

# Create the MessageKey table
conn.execute('''
CREATE TABLE MessageKey (
    SenderID VARCHAR(255) NOT NULL,
    ReceiverID VARCHAR(255) NOT NULL,
    encryptedSecretKey TEXT NOT NULL,
    PRIMARY KEY (SenderID, ReceiverID)
)
''')
print("Created 'MessageKey' table successfully!")

# Create the Message table
conn.execute('''
CREATE TABLE Message (
    messageID VARCHAR(255) PRIMARY KEY,
    SenderID VARCHAR(255) NOT NULL,
    ReceiverID VARCHAR(255) NOT NULL,
    encryptedMessage TEXT NOT NULL
)
''')
print("Created 'Message' table successfully!")

# Close the connection
conn.close()
