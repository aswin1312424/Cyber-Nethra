from fastapi import FastAPI, File, UploadFile
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.applications.efficientnet import preprocess_input
from PIL import Image
import numpy as np
import io
import pickle
from pydantic import BaseModel

app = FastAPI()

class URLRequest(BaseModel):
    url: str

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Reconstruct the Model Architecture
def build_model():
    IMG_SIZE = 160
    base_model = EfficientNetB0(
        weights=None,
        include_top=False,
        input_shape=(IMG_SIZE, IMG_SIZE, 3)
    )

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.5)(x)
    output = Dense(1, activation='sigmoid')(x)

    model = Model(inputs=base_model.input, outputs=output)
    return model

# 2. Load Weights
print("Loading Model...")
model = build_model()
try:
    # Try loading the weights file provided by the user
    model.load_weights("DeepfakeWeights.h5")
    print("Weights Loaded Successfully!")
except Exception as e:
    print(f"Error loading weights: {e}")
    print("Using un-trained model for testing purposes if file not found.")

print("Loading URL Model & Vectorizer...")
try:
    with open("url_model.pkl", "rb") as f:
        url_model = pickle.load(f)
        
    # Fix for scikit-learn version mismatch (e.g. 1.8.0 model loaded in 1.6.1)
    # The 'multi_class' attribute was removed in newer sklearn, but older sklearn requires it.
    if hasattr(url_model, "predict_proba") and not hasattr(url_model, "multi_class"):
        url_model.multi_class = "ovr"
        
    with open("vectorizer.pkl", "rb") as f:
        url_vectorizer = pickle.load(f)
    print("URL Model and Vectorizer Loaded Successfully!")
except Exception as e:
    print(f"Error loading URL model/vectorizer: {e}")
    url_model = None
    url_vectorizer = None

@app.get("/")
def home():
    return {"message": "Deepfake Detection API is Running"}

@app.post("/detect")
async def detect_deepfake(file: UploadFile = File(...)):
    try:
        # 1. Read Image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        # 2. Preprocess
        IMG_SIZE = 160
        image = image.resize((IMG_SIZE, IMG_SIZE))
        img_array = np.array(image)
        img_array = np.expand_dims(img_array, axis=0) # (1, 160, 160, 3)
        img_array = preprocess_input(img_array) # EfficientNet specific preprocessing

        # 3. Predict
        prediction = model.predict(img_array)
        print("preddd is :",prediction,flush=True)
        confidence_score = float(prediction[0][0]) # Output between 0 and 1

        # 4. Interpret Result
        # Assuming 0 = Fake, 1 = Real based on common datasets, OR vice versa.
        # Usually datasets are Real=1, Fake=0. Let's assume this.
        # If confidence > 0.5 -> Real
        
        label = "Fake" if confidence_score <= 0.5 else "Real"
        
        # display_confidence = how confident the model is IN ITS LABEL
        # If Fake: show raw score (e.g. 0.9 = 90% fake)
        # If Real: show 1 - score (e.g. 0.2 raw = 80% real)
        display_confidence = confidence_score if label == "Real" else 1 - confidence_score

        return {
            "label": label,
            "confidence_score": round(display_confidence, 4),
            "raw_score": round(confidence_score, 4)
        }

    except Exception as e:
        return {"error": str(e)}

@app.post("/detect-url")
def detect_url(req: URLRequest):
    if not url_model or not url_vectorizer:
        return {"error": "URL model not loaded properly."}
    try:
        x = url_vectorizer.transform([req.url])
        pred = url_model.predict(x)[0]
        # Based on snippet from prediction.ipynb: Safe if pred == 1 else Malicious
        label = "Safe" if pred == 1 else "Malicious"
        
        # Check if predict_proba is applicable
        confidence_score = 1.0 # default
        if hasattr(url_model, "predict_proba"):
            proba = url_model.predict_proba(x)[0]
            confidence_score = float(proba[1] if pred == 1 else proba[0])
            
        return {
            "label": label,
            "confidence_score": round(confidence_score, 4),
            "url": req.url
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
