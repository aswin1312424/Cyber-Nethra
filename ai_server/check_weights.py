import tensorflow as tf
from main import build_model
import numpy as np
import os

print("--- AI DIAGNOSTIC TOOL ---")
print(f"TensorFlow Version: {tf.__version__}")

if not os.path.exists("DeepfakeWeights.h5"):
    print("ERROR: 'DeepfakeWeights.h5' not found in this directory!")
    exit(1)

print("1. Building model architecture...")
model = build_model()

try:
    print("2. Loading 'DeepfakeWeights.h5'...")
    model.load_weights("DeepfakeWeights.h5")
    print("SUCCESS: Weights successfully mapped to the architecture.")
    
    # Analyze the final layers
    final_layer = model.layers[-1]
    weights, biases = final_layer.get_weights()
    
    print("\n--- WEIGHT ANALYSIS ---")
    print(f"Final dense layer weights range: min={np.min(weights):.4f}, max={np.max(weights):.4f}")
    print(f"Final dense layer weights std-dev: {np.std(weights):.4f}")
    
    if np.std(weights) < 1e-4:
        print("WARNING: Final layer weights have near-zero variance. The model is NOT trained or collapsed during training.")
    
    print("\n--- PREDICTION TEST ---")
    
    # Test 1: Completely black image
    dummy_black = np.zeros((1, 160, 160, 3))
    pred1 = model.predict(dummy_black, verbose=0)
    print(f"Prediction on Pitch Black Image: {pred1[0][0]:.5f}")
    
    # Test 2: Completely random noise image
    dummy_noise = np.random.rand(1, 160, 160, 3) * 255
    pred2 = model.predict(dummy_noise, verbose=0)
    print(f"Prediction on Random TV Static:  {pred2[0][0]:.5f}")
    
    if abs(pred1[0][0] - pred2[0][0]) < 0.001:
        print("\nCRITICAL FAILURE: The model predicts the EXACT SAME SCORE for a black image and pure noise.")
        print("This proves the model has experienced 'Mode Collapse'. It is blindly guessing and ignoring the image entirely.")
    else:
        print("\nSUCCESS: The model predicts different values for different images. It is functioning correctly.")

except Exception as e:
    print(f"\nALIGNMENT ERROR: The structure of DeepfakeWeights.h5 does not match the code in main.py.")
    print(f"Error details: {e}")
