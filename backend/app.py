
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import logging

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the model
try:
    model = joblib.load('difficulty_model.pkl')
except Exception as e:
    logging.error(f"Failed to load model: {e}")
    model = None

# Difficulty mapping
DIFFICULTY_MAPPING = {'easy': 0, 'normal': 1, 'hard': 2}

def validate_request_data(data):
    # Validate incoming data
    if 'streak' not in data or 'current_difficulty' not in data:
        return False, "Missing 'streak' or 'current_difficulty' in request data"
    
    if data['current_difficulty'] not in DIFFICULTY_MAPPING:
        return False, f"Invalid difficulty level: {data['current_difficulty']}"
    
    return True, None

def predict_difficulty(streak, current_difficulty):
    # Perform difficulty prediction using the model
    try:
        # Prepare features for prediction
        features = pd.DataFrame([{
            'streak': streak,
            'current_difficulty': DIFFICULTY_MAPPING[current_difficulty]
        }])
        
        # Make prediction
        prediction = model.predict(features)
        return prediction[0]
    except Exception as e:
        logging.error(f"Prediction failed: {e}")
        return None

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    logging.info(f"Received data: {data}")
    
    # Validate data
    is_valid, error_message = validate_request_data(data)
    if not is_valid:
        return jsonify({'error': error_message}), 400

    # Make a prediction
    prediction = predict_difficulty(data['streak'], data['current_difficulty'])
    if prediction is None:
        return jsonify({'error': 'Failed to predict difficulty'}), 500
    
    # Map predicted difficulty back to a label
    reversed_mapping = {v: k for k, v in DIFFICULTY_MAPPING.items()}
    next_difficulty = reversed_mapping.get(prediction, 'easy')

    return jsonify({
        'next_difficulty': next_difficulty,
        'streak': data['streak'],
        'current_difficulty': data['current_difficulty']
    })

# Run the app if executed directly
if __name__ == '__main__':
    app.run(debug=True)
