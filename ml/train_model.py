import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

df = pd.read_csv("sales.csv")

df["date"] = pd.to_datetime(
    df["date"],
    dayfirst=True
)

df["day"] = df["date"].dt.day
df["month"] = df["date"].dt.month
df["weekday"] = df["date"].dt.weekday

X = df[
    [
        "day",
        "month",
        "weekday"
    ]
]

y = df["quantity"]

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)

joblib.dump(
    model,
    "model.pkl"
)

print("Overall Model Trained")