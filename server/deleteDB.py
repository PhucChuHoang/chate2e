import sqlite3

# Connect to the SQLite database
db = sqlite3.connect('database.db')
print("Connected to database successfully")

# Delete all records from the User table
db.execute('DELETE FROM User')
db.commit()
print("Deleted all records from 'User' table successfully!")

# Delete all records from the MessageKey table
db.execute('DELETE FROM MessageKey')
db.commit()
print("Deleted all records from 'MessageKey' table successfully!")

# Delete all records from the Message table
db.execute('DELETE FROM Message')
db.commit()
print("Deleted all records from 'Message' table successfully!")

# Close the connection
db.close()
