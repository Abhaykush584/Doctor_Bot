# from flask import Flask, request, jsonify
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)


# import joblib
# import pandas as pd
# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing.image import img_to_array, load_img
# import numpy as np
# import cv2
# import os

# from io import BytesIO


# app.secret_key = 'your_secret_key'
# CORS(app, supports_credentials=True)



# # --- SYMPTOM-BASED DISEASE PREDICTION ---
# SYMPTOM_MODEL_PATH = "models/symptom_model.pkl"
# SYMPTOM_CSV_PATH = "data/symptoms/symptom_disease.csv"
# symptom_model = joblib.load(SYMPTOM_MODEL_PATH)
# symptoms = pd.read_csv(SYMPTOM_CSV_PATH).drop("prognosis", axis=1).columns.tolist()

# @app.route("/predict_symptoms", methods=["POST"])
# def predict_symptoms():
#     print("predict_symptoms called")
#     data = request.json
#     print("Received data:", data)
#     input_vector = [data.get(symptom, 0) for symptom in symptoms]
#     prediction = symptom_model.predict([input_vector])
#     return jsonify({
#         "predicted_disease": prediction[0]
#     })

# # --- SKIN IMAGE DISEASE PREDICTION ---
# SKIN_MODEL_PATH = "models/skin_disease_model.h5"
# SKIN_CLASS_DIR = "data/skin_disease_dataset"
# skin_model = load_model(SKIN_MODEL_PATH)
# skin_class_names = sorted(os.listdir(SKIN_CLASS_DIR))

# @app.route("/predict_image", methods=["POST"])
# def predict_image():
#     file = request.files['image']
#     # FIX: pass file.stream, not file
#     img = load_img(BytesIO(file.read()), target_size=(224,224))
#     x = img_to_array(img) / 255.0
#     x = np.expand_dims(x, axis=0)
#     preds = skin_model.predict(x)[0]
#     idx = np.argmax(preds)
#     return jsonify({
#         "prediction": skin_class_names[idx],
#         "confidence": float(preds[idx])
#     })

# # --- EYE IMAGE CLASSIFICATION ---
# EYE_MODEL_PATH = "models/eye_model.h5"
# EYE_LABEL_ENCODER_PATH = "models/eye_label_encoder.pkl"
# eye_model = load_model(EYE_MODEL_PATH)
# eye_le = joblib.load(EYE_LABEL_ENCODER_PATH)

# @app.route("/predict_eye", methods=["POST"])
# def predict_eye():
#     file = request.files["image"]
#     img_bytes = np.frombuffer(file.read(), np.uint8)
#     img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)
#     eye_img = cv2.resize(img, (64, 32)) / 255.0
#     eye_img = np.expand_dims(eye_img, axis=0)
#     pred = eye_model.predict(eye_img)
#     label = eye_le.inverse_transform([np.argmax(pred)])[0]
#     return jsonify({"prediction": label})

# @app.route("/", methods=["GET"])
# def home():
#     return "<h2>Digital Doctor ML API is Running!</h2><ul><li>POST /predict_symptoms</li><li>POST /predict_image</li><li>POST /predict_eye</li></ul>"

# if __name__ == "__main__":
#     app.run(debug=True, port=5000)





from flask import Flask, request, jsonify, session
from flask_cors import CORS

# Import database functions
from db import create_user_table, add_user, find_user

import joblib
import pandas as pd
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array, load_img
import numpy as np
import cv2
import os
from io import BytesIO

app = Flask(__name__)
app.secret_key = 'your_secret_key'
CORS(app, supports_credentials=True)

# Create user table at startup
create_user_table()

# --- AUTH ROUTES ---
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username, password = data['username'], data['password']
    if add_user(username, password):
        session['user'] = username
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Username already exists!'}), 409

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username, password = data['username'], data['password']
    user = find_user(username, password)
    if user:
        session['user'] = username
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials!'}), 401

# --- (rest of your prediction routes here, unchanged) ---

# if __name__ == "__main__":
#     app.run(debug=True, port=5000)

# --- SYMPTOM-BASED DISEASE PREDICTION ---
SYMPTOM_MODEL_PATH = "models/symptom_model.pkl"
SYMPTOM_CSV_PATH = "data/symptoms/symptom_disease.csv"
symptom_model = joblib.load(SYMPTOM_MODEL_PATH)
symptoms = pd.read_csv(SYMPTOM_CSV_PATH).drop("prognosis", axis=1).columns.tolist()

@app.route("/predict_symptoms", methods=["POST"])
def predict_symptoms():
    print("predict_symptoms called")
    data = request.json
    print("Received data:", data)
    input_vector = [data.get(symptom, 0) for symptom in symptoms]
    prediction = symptom_model.predict([input_vector])
    return jsonify({
        "predicted_disease": prediction[0]
    })

# --- SKIN IMAGE DISEASE PREDICTION ---
SKIN_MODEL_PATH = "models/skin_disease_model.h5"
SKIN_CLASS_DIR = "data/skin_disease_dataset"
skin_model = load_model(SKIN_MODEL_PATH)
skin_class_names = sorted(os.listdir(SKIN_CLASS_DIR))

@app.route("/predict_image", methods=["POST"])
def predict_image():
    file = request.files['image']
    # FIX: pass file.stream, not file
    img = load_img(BytesIO(file.read()), target_size=(224,224))
    x = img_to_array(img) / 255.0
    x = np.expand_dims(x, axis=0)
    preds = skin_model.predict(x)[0]
    idx = np.argmax(preds)
    return jsonify({
        "prediction": skin_class_names[idx],
        "confidence": float(preds[idx])
    })

# --- EYE IMAGE CLASSIFICATION ---
EYE_MODEL_PATH = "models/eye_model.h5"
EYE_LABEL_ENCODER_PATH = "models/eye_label_encoder.pkl"
eye_model = load_model(EYE_MODEL_PATH)
eye_le = joblib.load(EYE_LABEL_ENCODER_PATH)

@app.route("/predict_eye", methods=["POST"])
def predict_eye():
    file = request.files["image"]
    img_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)
    eye_img = cv2.resize(img, (64, 32)) / 255.0
    eye_img = np.expand_dims(eye_img, axis=0)
    pred = eye_model.predict(eye_img)
    label = eye_le.inverse_transform([np.argmax(pred)])[0]
    return jsonify({"prediction": label})

@app.route("/", methods=["GET"])
def home():
    return "<h2>Digital Doctor ML API is Running!</h2><ul><li>POST /predict_symptoms</li><li>POST /predict_image</li><li>POST /predict_eye</li></ul>"

if __name__ == "__main__":
    app.run(debug=True, port=5000)