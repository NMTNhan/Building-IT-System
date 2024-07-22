from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
model = joblib.load('difficulty_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    print(f"Received data: {data}")  # Debugging: Log received data

    try:
        # Convert current_difficulty to numerical values
        difficulty_mapping = {'easy': 0, 'normal': 1, 'hard': 2}
        current_difficulty = difficulty_mapping.get(data['current_difficulty'], 0)

        # Prepare features for prediction
        features = pd.DataFrame([{
            'streak': data['streak'],
            'current_difficulty': current_difficulty
        }])
        print(f"Features for prediction: {features}")  # Debugging: Log features

        # Make prediction
        prediction = model.predict(features)
        print(f"Model prediction: {prediction}")  # Debugging: Log prediction

        # Convert numerical prediction back to string label
        reverse_mapping = {0: 'easy', 1: 'normal', 2: 'hard'}
        predicted_difficulty = reverse_mapping[int(prediction[0])]
        print(f"Predicted difficulty: {predicted_difficulty}")  # Debugging: Log predicted difficulty

        return jsonify({'next_difficulty': predicted_difficulty})
    except Exception as e:
        print(f"Error during prediction: {e}")  # Log any errors
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)