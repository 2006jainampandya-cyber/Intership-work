import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.String(15), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    nickname = db.Column(db.String(50), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    mobile = db.Column(db.String(15), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Technician(db.Model):
    __tablename__ = 'technicians'
    
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.String(15), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    nickname = db.Column(db.String(50), nullable=True)
    mobile = db.Column(db.String(15), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class PredictionRecord(db.Model):
    __tablename__ = 'prediction_records'

    id = db.Column(db.String, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    user_role = db.Column(db.String(20), default='patient', nullable=False)
    patient_id = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    image_path = db.Column(db.String(255), nullable=True)
    size = db.Column(db.String, nullable=True)
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow, nullable=False)
    result = db.Column(db.String, nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    raw_score = db.Column(db.Float, nullable=True)
    model_name = db.Column(db.String, default='MobileNetV2')
    processing_time = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(20), default='completed', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            '_id': self.id,
            'userId': self.user_id,
            'patientId': self.patient_id,
            'name': self.name,
            'image': '/uploads/' + self.image_path if self.image_path else '',
            'gradcamImage': '/uploads/' + self.image_path if self.image_path else '',
            'size': self.size,
            'uploadDate': self.date.isoformat() if isinstance(self.date, datetime.datetime) else self.date,
            'prediction': 'Pneumonia' if self.result.lower() == 'pneumonia' else 'Normal',
            'confidence': self.confidence,
            'rawScore': self.raw_score,
            'model': self.model_name,
            'processingTime': f"{self.processing_time:.2f}s" if self.processing_time else "2.40s",
            'status': self.status
        }
