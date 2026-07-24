import sqlite3
import psycopg2
import pandas as pd
from urllib.parse import urlparse

# Live PostgreSQL URL
DATABASE_URL = "postgresql://pneumonia_db_r8an_user:PSaEzTNvlWoSbb6Pe9rpWIUpVa2nmpTd@dpg-d99lvvbtqb8s73aphaa0-a.oregon-postgres.render.com/pneumonia_db_r8an"

def sync_to_sqlite():
    print("Fetching data from Live PostgreSQL...")
    try:
        # Parse URL
        result = urlparse(DATABASE_URL)
        
        # Connect to Postgres
        pg_conn = psycopg2.connect(
            database=result.path[1:],
            user=result.username,
            password=result.password,
            host=result.hostname,
            port=result.port,
            sslmode='require'
        )
        
        # Read tables into Pandas
        patients_df = pd.read_sql_query("SELECT * FROM patients", pg_conn)
        techs_df = pd.read_sql_query("SELECT * FROM technicians", pg_conn)
        records_df = pd.read_sql_query("SELECT * FROM prediction_records", pg_conn)
        pg_conn.close()
        
        import os
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'database.db')
        
        # Connect to local SQLite
        sqlite_conn = sqlite3.connect(db_path)
        
        # Save tables (replace if they exist)
        patients_df.to_sql('patients', sqlite_conn, if_exists='replace', index=False)
        techs_df.to_sql('technicians', sqlite_conn, if_exists='replace', index=False)
        records_df.to_sql('prediction_records', sqlite_conn, if_exists='replace', index=False)
        sqlite_conn.close()
        
        print("Sync complete! You can now click on 'database.db' in VSCode to view the live data in SQLite Viewer.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    sync_to_sqlite()
