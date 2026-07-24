import sqlite3

def upgrade_database():
    print("Connecting to database...")
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    try:
        print("Adding nickname column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN nickname VARCHAR(50);")
    except sqlite3.OperationalError as e:
        print(f"Column might already exist: {e}")
        
    print("Setting default nickname 'admin' for all existing users...")
    cursor.execute("UPDATE users SET nickname = 'admin' WHERE nickname IS NULL;")
    
    conn.commit()
    conn.close()
    print("Database upgrade complete.")

if __name__ == '__main__':
    upgrade_database()
