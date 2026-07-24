import sqlite3
conn = sqlite3.connect('Backend/database.db')
cursor = conn.cursor()
cursor.execute("UPDATE users SET role='technician'")
conn.commit()
print('Updated users')
