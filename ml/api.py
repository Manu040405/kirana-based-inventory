from fastapi import FastAPI
import pandas as pd
import joblib
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

    forecast_value = int(prediction[0])

    # Business Rule
    forecast_value = max(20, forecast_value)

    return {
        "forecast": forecast_value
    }