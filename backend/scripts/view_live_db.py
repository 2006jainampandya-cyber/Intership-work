import os
import psycopg2
import pandas as pd
from urllib.parse import urlparse

# Your LIVE Render PostgreSQL External URL
DATABASE_URL = "postgresql://pneumonia_db_r8an_user:PSaEzTNvlWoSbb6Pe9rpWIUpVa2nmpTd@dpg-d99lvvbtqb8s73aphaa0-a.oregon-postgres.render.com/pneumonia_db_r8an"

def view_live_database():
    print("\n" + "="*50)
    print("🌍 AKSHAR AI - LIVE POSTGRES DATABASE VIEWER")
    print("="*50 + "\n")
    
    try:
        # Connect to Live PostgreSQL database
        print("Connecting to Render PostgreSQL...")
        
        # Parse the URL to pass arguments properly with sslmode=require
        result = urlparse(DATABASE_URL)
        username = result.username
        password = result.password
        database = result.path[1:]
        hostname = result.hostname
        port = result.port
        
        conn = psycopg2.connect(
            database=database,
            user=username,
            password=password,
            host=hostname,
            port=port,
            sslmode='require' # CRITICAL for Render!
        )
        
        print("✅ Connected Successfully!\n")
        
        # 1. View Patients
        print("📋 PATIENTS TABLE:")
        try:
            patients = pd.read_sql_query("SELECT id, patient_id, name, email, age FROM patients", conn)
            if patients.empty:
                print("   No patients found.\n")
            else:
                print(patients.to_string(index=False) + "\n")
        except Exception as e:
            print(f"   [Error reading patients: {e}]\n")

        # 2. View Technicians
        print("🔬 TECHNICIANS TABLE:")
        try:
            techs = pd.read_sql_query("SELECT id, name, email FROM technicians", conn)
            if techs.empty:
                print("   No technicians found.\n")
            else:
                print(techs.to_string(index=False) + "\n")
        except Exception as e:
            print(f"   [Error reading technicians: {e}]\n")

        # 3. View Prediction Records
        print("🩻 PREDICTION RECORDS (SCANS):")
        try:
            records = pd.read_sql_query("SELECT id, patient_id, name, result, date FROM prediction_records", conn)
            if records.empty:
                print("   No scan records found.\n")
            else:
                print(records.to_string(index=False) + "\n")
        except Exception as e:
            print(f"   [Error reading prediction_records: {e}]\n")
            
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    view_live_database()
