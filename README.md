# Akshar AI - Pneumonia Detection Portal

Akshar AI is a full-stack web application designed for the classification and detection of Pneumonia from chest X-ray images. Built for clinical and research purposes, the platform provides a seamless interface for users to upload X-rays, receive an AI-generated diagnostic assessment, and review their history of scans.

**Disclaimer**: This tool is for research and demonstration purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.

## Features
- **AI-Powered Diagnostics**: Uses a MobileNetV2 deep learning model trained on chest X-rays to accurately classify images as Normal or indicating signs of Pneumonia.
- **Role-Based Authentication**: Secure sign-up and login for two roles: Patients and Clinical Technicians.
- **Clinical Dashboard**: A sleek, modern dashboard for uploading scans via drag-and-drop or file browsing.
- **Real-Time Processing**: See the precise amount of time taken by the backend inference engine to process your image.
- **Historical Archives**: Access a detailed historical log of all past diagnostic scans, including AI confidence scores and dates.
- **Profile Management**: Update your demographic details, profile picture, and security settings securely.
- **Dark/Light Mode**: Toggle between "Light Medical" and "Slate Dark" interface themes for comfortable viewing in any environment.

## Tech Stack
- **Frontend**: React (Vite), React Router, Framer Motion, Axios, Lucide Icons, Vanilla CSS
- **Backend**: Python, Flask, Flask-SQLAlchemy, Flask-Bcrypt, PyJWT
- **Machine Learning**: TensorFlow / Keras (MobileNetV2), Pillow
- **Database**: SQLite (SQLAlchemy ORM)

## Project Structure
```text
.
├── backend/
│   ├── app.py              # Main Flask server and API endpoints
│   ├── database.py         # SQLAlchemy models (Patient, Technician, PredictionRecord)
│   ├── prediction.py       # Inference logic and image preprocessing
│   ├── models/             # Directory containing the MobileNetV2 .keras model
│   └── requirements.txt    # Python dependencies
└── frontend/
    ├── src/
    │   ├── pages/          # React views (Dashboard, Auth, Landing, etc.)
    │   ├── context/        # React context providers for global state
    │   └── ...
    ├── index.css           # Global design system and styles
    └── package.json        # Node dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (3.9+)

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask server:
   ```bash
   python app.py
   ```
   The backend will start on `http://localhost:5000`.

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`. 
   *(Note: The frontend is configured to proxy `/api` requests to the Python backend).*

## Usage
1. Open your browser to `http://localhost:3000`.
2. Register a new account as a Patient or Technician.
3. Log in to access the Clinical Dashboard.
4. Go to the **Upload X-ray** tab and drag-and-drop a JPEG/PNG chest X-ray image (up to 5MB).
5. Click **Run Diagnostic** and wait for the AI to analyze the image.
6. Review the results on the **Prediction Result** tab.

## Model Details
The AI uses a **MobileNetV2** architecture, which is a lightweight, efficient Convolutional Neural Network (CNN). The model expects input images to be resized to `(224, 224)` and outputs a confidence score between `0.0` and `1.0`. A score above `0.70` is classified as indicating signs of Pneumonia.
