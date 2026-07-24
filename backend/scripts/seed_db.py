import os
import datetime
from app import app, db, bcrypt
from database import User, PredictionRecord

def seed_database():
    with app.app_context():
        print("Dropping existing tables...")
        db.drop_all()
        print("Creating new tables...")
        db.create_all()

        print("Seeding test users...")
        
        # Seed Patient
        patient_pwd = bcrypt.generate_password_hash("password123").decode('utf-8')
        patient = User(
            patient_id="PNE-2026-000001",
            name="Test Patient",
            email="patient@akshar.ai",
            password_hash=patient_pwd,
            age=45,
            mobile="9876543210",
            role="patient"
        )
        db.session.add(patient)

        # Seed Technician
        tech_pwd = bcrypt.generate_password_hash("tech123").decode('utf-8')
        tech = User(
            patient_id="PNE-2026-000002",
            name="Lead Technician",
            email="tech@akshar.ai",
            password_hash=tech_pwd,
            age=38,
            mobile="9876543211",
            role="technician"
        )
        db.session.add(tech)

        db.session.commit()
        
        print("Seeding test prediction...")
        record = PredictionRecord(
            id="PRED-12345",
            user_id=patient.id,
            patient_id=patient.patient_id,
            name="test_xray.jpg",
            image_path="test_xray.jpg",
            size="1.2 MB",
            date=datetime.datetime.utcnow(),
            result="pneumonia",
            confidence=95.4,
            raw_score=0.954,
            model_name="MobileNetV2",
            processing_time=1.5,
            status="completed"
        )
        db.session.add(record)
        db.session.commit()

        print("Database seeded successfully.")

if __name__ == "__main__":
    seed_database()
