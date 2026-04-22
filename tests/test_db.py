import psycopg2
import os
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor

# Load .env from backend directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../backend/.env'))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not set")
    exit(1)

conn = psycopg2.connect(DATABASE_URL)
print("Connected successfully!")

# Create tables if they don't exist
try:
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(100) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS handwriting_samples (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            sample_name VARCHAR(100),
            ocr_text TEXT,
            style_data JSONB,
            image_base64 TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS notes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            original_content TEXT,
            processed_content TEXT,
            style_applied VARCHAR(100),
            subject VARCHAR(100),
            tags TEXT[],
            is_favorite BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
        CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_samples_user_id ON handwriting_samples(user_id);
    """)
    conn.commit()
    cur.close()
    print("Tables created or already exist.")
except Exception as e:
    print(f"Error creating tables: {e}")

def check_users():
    """Function to check and display all saved users in the database."""
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, email, username, created_at FROM users")
        users = cur.fetchall()
        print("Users in database:")
        for user in users:
            print(f"ID: {user['id']}, Email: {user['email']}, Username: {user['username']}, Created: {user['created_at']}")
        cur.close()
    except Exception as e:
        print(f"Error: {e}")

# Call the function to check users
check_users()

# Close the connection
conn.close()