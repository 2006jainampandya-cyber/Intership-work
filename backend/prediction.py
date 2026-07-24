import os
import numpy as np
from PIL import Image
import tensorflow as tf

import keras

# Global variable to hold the model in memory
_model = None

def get_model(model_path):
    """
    Load the MobileNetV2 model once and keep it in memory.
    Uses custom_objects to handle the MobileNetV2 preprocess_input Lambda layer.
    """
    global _model
    if _model is None:
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
        
        print("Loading MobileNetV2 model...")
        
        # custom_objects is required to load a model containing a Lambda layer
        # if the Lambda layer wraps preprocess_input.
        custom_objects = {
            '<lambda>': lambda x: keras.applications.mobilenet_v2.preprocess_input(x),
            'preprocess_input': keras.applications.mobilenet_v2.preprocess_input
        }
        
        try:
            _model = keras.models.load_model(model_path, custom_objects=custom_objects)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Failed to load model: {e}")
            raise e
            
    return _model

def preprocess_image(file_path):
    """
    Prepares the image strictly as requested:
    - Resize to 224x224
    - Convert to RGB
    - Convert to NumPy array
    - Expand batch dimension
    No scaling applied here since the model handles its own preprocessing.
    """
    img = Image.open(file_path)
    img = img.convert('RGB')
    img = img.resize((224, 224))
    
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def run_inference(model_path, file_path):
    """
    Runs prediction and formats the output.
    Threshold = 0.70
    Returns: dict with prediction, confidence, raw_score
    """
    model = get_model(model_path)
    img_tensor = preprocess_image(file_path)
    
    # Run prediction
    raw_score_val = model.predict(img_tensor)[0][0]
    raw_score = float(raw_score_val)
    
    # Threshold = 0.70
    if raw_score >= 0.70:
        prediction_label = "PNEUMONIA"
        confidence = raw_score * 100
    else:
        prediction_label = "NORMAL"
        confidence = (1 - raw_score) * 100
        
    return {
        "prediction": prediction_label,
        "confidence": round(confidence, 2),
        "raw_score": round(raw_score, 4)
    }
