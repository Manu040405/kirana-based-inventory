import joblib
import pandas as pd
from datetime import datetime

# Load overall trained model
model = joblib.load("model.pkl")

today = datetime.now()

X = pd.DataFrame([{
    "day": today.day,
    "month": today.month,
    "weekday": today.weekday()
}])

prediction = model.predict(X)

print(
    "Overall Store Forecast:",
    int(prediction[0])
)