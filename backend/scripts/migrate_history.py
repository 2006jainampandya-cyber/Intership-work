import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, 'database.db')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("""
    UPDATE prediction_history
    SET patient_id = (SELECT patient_id FROM users WHERE users.id = prediction_history.user_id)
    WHERE user_id IS NOT NULL
""")
print(f"Updated {cursor.rowcount} prediction history records to match the user's patient ID.")

conn.commit()
conn.close()
