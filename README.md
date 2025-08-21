# Digital Doctor Chatbot (Doctor Bot)

**Doctor Bot** is a web-based AI assistant designed to help users with basic medical inquiries and disease prediction using machine learning. The application supports login/sign-up with a simple user database, symptom-based disease prediction, and image-based disease detection for skin and eye conditions with live webcam accessibility.

---

## Features

- **User Authentication**: Sign up and login system with secure session handling using Flask and SQLite.
- **Symptom-Based Prediction**: Users can enter symptoms to receive a disease prediction via a trained ML model.
- **Skin Disease Prediction**: Upload a skin image to get a classification and confidence score.
- **Eye Disease Prediction**: Upload an eye image for AI-based class prediction.
- **Modern Frontend**: User-friendly login and sign-up page with clean frontend.
- **API Backend**: RESTful API endpoints for frontend integration.
- **Modular Code Structure**: Separation of database logic (db.py) and Flask app/API logic (app.py).

---

## Project Structure


ml-api/
├── app.py          # Flask API server and all endpoints
├── db.py           # SQLite3 database helper functions
├── models/         # Trained models for prediction (.pkl, .h5, etc.)
├── data/           # Supporting data (CSV files, Skin Disease image folders and Eye Disease image folder)
└── frontend/
    ├── login.html  # Login/Signup page
    ├── index.html  # Main chatbot UI
    ├── css/
    │   └── login.css
        └── style.css
    └── js/
        └── login.js
        └── main.js


---

## How It Works

1. **User Registration & Login**
   - Users can sign up for a new account or log in if already registered.
   - Credentials are securely stored in a local SQLite database.

2. **Disease Prediction**
   - **By Symptoms**: Users select symptoms; the backend predicts the most likely disease.
   - **By Skin Image**: Users upload a photo; the system classifies the skin condition.
   - **By Eye Image**: Users upload an eye image for classification by live clicks via webcam.

3. **Tech Stack**
   - **Backend**: Python, Flask, SQLite3, TensorFlow/Keras, scikit-learn, joblib, pandas, OpenCV
   - **Frontend**: HTML, CSS, JavaScript (fetch API), supports CORS



## How To Run

1. **Install dependencies**  
   Make sure you have Python, pip, and required packages:
   bash
   pip install flask flask-cors joblib pandas tensorflow opencv-python
  

2. **Start the API server**
   bash
   python app.py
   

3. **Open the Frontend**
   - Open `frontend/login.html` in your browser.



## API Endpoints

- POST /signup – Register a new user.
- POST /login – Log in a user.
- POST /logout – Log out the current session.
- POST /predict_symptoms – Predict disease based on symptoms (JSON).
- POST /predict_image – Predict skin disease from image (multipart).
- POST /predict_eye – Predict eye disease from image (multipart).

---

## Notes

- All prediction endpoints require the user to be logged in (session-based).
- Models and supporting data should be placed in the `models/` and `data/` folders, respectively.
- No medical advice is given; this project is for educational/demo purposes only.



## Credits

- Backend, ML models, and API: [Abhay Kush]
- Frontend UI: [Abhay kush]



## License

MIT License (or your preferred license)
