import bcrypt

# Function to hash a password
def hash_password(password):
    # Generate a salt
    salt = bcrypt.gensalt()
    # Hash the password with the salt
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password


# Function to verify a password
def check_password(plain_password, hashed_password):
    # Verify the password
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

# Example usage
plain_password = "my_secret_password"
hashed = hash_password(plain_password)
print(f"Hashed Password: {hashed}")
is_correct = check_password("my_secret_password", hashed)
print(f"Is the password correct? {is_correct}")
