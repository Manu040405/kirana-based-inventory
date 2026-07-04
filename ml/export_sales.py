from pymongo import MongoClient
import pandas as pd

client = MongoClient("mongodb://localhost:27017/kirana")

db = client.get_database()

transactions = list(
    db.transactions.find(
        {"type": "OUT"}
    )
)

rows = []

for t in transactions:

    product = db.products.find_one(
        {"_id": t["product"]}
    )

    if not product:
        continue

    rows.append({
        "product": product["name"],
        "quantity": t["quantity"],
        "date": t["createdAt"].strftime("%Y-%m-%d")
    })

df = pd.DataFrame(rows)

df.to_csv(
    "sales.csv",
    index=False
)

print("CSV Created")