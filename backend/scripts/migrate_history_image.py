import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, 'database.db')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE prediction_history ADD COLUMN image_path VARCHAR(255);")
    print("Column image_path added to prediction_history.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("Column image_path already exists.")
    else:
        raise

conn.commit()
conn.close()
