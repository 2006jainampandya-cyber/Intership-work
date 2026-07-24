import sqlite3
import os
import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, 'database.db')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE users ADD COLUMN patient_id VARCHAR(15);")
    print("Column patient_id added.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("Column patient_id already exists.")
    else:
        raise

# Assign unique patient IDs to existing users
cursor.execute("SELECT id FROM users WHERE patient_id IS NULL OR patient_id = ''")
users = cursor.fetchall()
year = datetime.datetime.now().year

if users:
    for i, user in enumerate(users):
        user_id = user[0]
        p_id = f"PNE-{year}-{990000 + i:06d}"
        cursor.execute("UPDATE users SET patient_id = ? WHERE id = ?", (p_id, user_id))
    print(f"Updated {len(users)} existing users with patient_ids.")

# Create index on patient_id
try:
    cursor.execute("CREATE UNIQUE INDEX ix_users_patient_id ON users (patient_id);")
    print("Index created on patient_id.")
except sqlite3.OperationalError as e:
    print(f"Index creation ignored: {e}")

conn.commit()
conn.close()
