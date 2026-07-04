from fastapi import FastAPI
import joblib
import pandas as pd
from datetime import datetime

app = FastAPI()

model = joblib.load("model.pkl")

@app.get("/forecast")
def forecast():
    today = datetime.now()

    X = pd.DataFrame([{
        "day": today.day,
        "month": today.month,
        "weekday": today.weekday()
    }])

    prediction = model.predict(X)

    return {
        "forecast": int(prediction[0])
    }