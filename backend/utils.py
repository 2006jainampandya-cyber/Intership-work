import os
import numpy as np
from PIL import Image

def preprocess_image(file_path):
    """
    Preprocesses the image for the MobileNetV2 model:
    - Opens image
    - Converts to RGB
    - Resizes to 224x224
    - Normalizes to 0-1
    - Expands dimensions (adds batch dimension)
    """
    try:
        # Open image
        img = Image.open(file_path)
        
        # Convert to RGB (in case of grayscale or RGBA)
        img = img.convert('RGB')
        
        # Resize to 224x224
        img = img.resize((224, 224))
        
        # Convert to numpy array (values 0-255)
        # Normalization is handled internally by the model's Rescaling(1./255) layer
        img_array = np.array(img, dtype=np.float32)
        
        # Expand dimensions to create a batch of 1: (1, 224, 224, 3)
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        print(f"Error during preprocessing: {e}")
        return None
