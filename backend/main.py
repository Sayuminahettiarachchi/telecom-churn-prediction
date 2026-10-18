
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import sqlite3
from datetime import datetime
from fastapi import FastAPI, HTTPException


app = FastAPI()


# --------------------------------
# PREDICTION HISTORY DATABASE
# --------------------------------

HISTORY_DB = "prediction_history.db"


def init_history_db():
    with sqlite3.connect(HISTORY_DB) as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS prediction_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                churn_probability REAL NOT NULL,
                risk_level TEXT NOT NULL,
                prediction_result TEXT NOT NULL
            )
        """)


def save_prediction_history(
    customer_id,
    probability,
    risk_level,
    prediction_result
):
    with sqlite3.connect(HISTORY_DB) as connection:
        connection.execute("""
            INSERT INTO prediction_history (
                customer_id,
                created_at,
                churn_probability,
                risk_level,
                prediction_result
            )
            VALUES (?, ?, ?, ?, ?)
        """, (
            str(customer_id),
            datetime.now().astimezone().isoformat(timespec="seconds"),
            float(probability),
            str(risk_level),
            str(prediction_result)
        ))


init_history_db()


@app.get("/prediction-history")
def get_prediction_history(limit: int = 100):
    limit = max(1, min(limit, 500))

    with sqlite3.connect(HISTORY_DB) as connection:
        connection.row_factory = sqlite3.Row

        rows = connection.execute("""
            SELECT id, customer_id, created_at,
                   churn_probability, risk_level, prediction_result
            FROM prediction_history
            ORDER BY id DESC
            LIMIT ?
        """, (limit,)).fetchall()

        total = connection.execute(
            "SELECT COUNT(*) FROM prediction_history"
        ).fetchone()[0]

    return {
        "total_records": total,
        "records": [dict(row) for row in rows]
    }
@app.delete("/prediction-history/{record_id}")
def delete_prediction_history(record_id: int):
    with sqlite3.connect(HISTORY_DB) as connection:
        cursor = connection.execute(
            "DELETE FROM prediction_history WHERE id = ?",
            (record_id,)
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Prediction history record not found."
            )

    return {"message": "Prediction history record deleted successfully."}
@app.delete("/prediction-history")
def clear_prediction_history():
    with sqlite3.connect(HISTORY_DB) as connection:
        cursor = connection.execute(
            "DELETE FROM prediction_history"
        )
        deleted_count = cursor.rowcount

    return {
        "message": "All prediction history deleted successfully.",
        "deleted_count": deleted_count
    }

# Allow the Next.js frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load the 5-feature XGBoost model
model = joblib.load("small_churn_model.pkl")


# Load the required feature names
feature_columns = joblib.load("small_feature_columns.pkl")


# Prediction input
class CustomerData(BaseModel):
    loc_ic_mou_8: float
    total_rech_amt_8: float
    last_day_rch_amt_8: float
    loc_ic_mou_7: float
    aon: float


# --------------------------------
# CHURN PREDICTION
# --------------------------------

@app.post("/predict")
def predict(customer: CustomerData):

    input_data = pd.DataFrame([{
        "loc_ic_mou_8": customer.loc_ic_mou_8,
        "total_rech_amt_8": customer.total_rech_amt_8,
        "last_day_rch_amt_8": customer.last_day_rch_amt_8,
        "loc_ic_mou_7": customer.loc_ic_mou_7,
        "aon": customer.aon
    }])

    input_data = input_data[feature_columns]

    churn_probability = model.predict_proba(input_data)[0][1]

    threshold = 0.70

    prediction = int(churn_probability >= threshold)

    return {
        "churn_probability": round(float(churn_probability), 4),
        "prediction": prediction,
        "result": "Churn" if prediction == 1 else "Not Churn"
    }


# --------------------------------
# CUSTOMERS
# --------------------------------


@app.get("/customers")
def get_customers(
    page: int = 1,
    limit: int = 20,
    search: str = ""
):

    df = pd.read_csv("telecom_churn_data.csv")

    # Prevent invalid page numbers
    if page < 1:
        page = 1

    # Prevent invalid limits
    if limit < 1:
        limit = 20

    if limit > 100:
        limit = 100

    # Create customer IDs
    df["customer_id"] = [
        f"CUST{index + 1:05d}"
        for index in range(len(df))
    ]

    # Global customer search
    if search.strip():

        search_text = search.strip().lower()

        df = df[
            df["customer_id"]
            .str.lower()
            .str.contains(search_text, regex=False)
        ]

    total_customers = len(df)

    # Calculate total pages
    total_pages = max(
        (total_customers + limit - 1) // limit,
        1
    )

    # Calculate rows for current page
    start = (page - 1) * limit
    end = start + limit

    page_data = df.iloc[start:end]

    customers = []

    for _, row in page_data.iterrows():

        tenure = row["aon"]
        recharge = row["total_rech_amt_8"]
        incoming_minutes = row["loc_ic_mou_8"]

        # Handle missing values
        if pd.isna(tenure):
            tenure = 0

        if pd.isna(recharge):
            recharge = 0

        if pd.isna(incoming_minutes):
            incoming_minutes = 0

        # Convert to float
        tenure = float(tenure)
        recharge = float(recharge)
        incoming_minutes = float(incoming_minutes)

        # Handle infinity
        if not (-float("inf") < tenure < float("inf")):
            tenure = 0

        if not (-float("inf") < recharge < float("inf")):
            recharge = 0

        if not (-float("inf") < incoming_minutes < float("inf")):
            incoming_minutes = 0

        customers.append({
            "customer_id": row["customer_id"],
            "tenure": tenure,
            "recharge": recharge,
            "incoming_minutes": incoming_minutes
        })

    return {
        "total_customers": total_customers,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "customers": customers
    }

# --------------------------------
# CUSTOMER DETAILS
# --------------------------------

@app.get("/customers/{customer_id}")
def get_customer(customer_id: str):

    df = pd.read_csv("telecom_churn_data.csv")

    # Create customer IDs
    df["customer_id"] = [
        f"CUST{index + 1:05d}"
        for index in range(len(df))
    ]

    # Find customer
    customer = df[
        df["customer_id"].str.upper() == customer_id.upper()
    ]

    # Customer not found
    if customer.empty:
        return {
            "error": "Customer not found"
        }

    row = customer.iloc[0]

    # Get customer values
    tenure = row["aon"]
    recharge = row["total_rech_amt_8"]
    incoming_minutes = row["loc_ic_mou_8"]
    previous_incoming = row["loc_ic_mou_7"]
    last_recharge = row["last_day_rch_amt_8"]

    # Handle missing values
    if pd.isna(tenure):
        tenure = 0

    if pd.isna(recharge):
        recharge = 0

    if pd.isna(incoming_minutes):
        incoming_minutes = 0

    if pd.isna(previous_incoming):
        previous_incoming = 0

    if pd.isna(last_recharge):
        last_recharge = 0

    return {
        "customer_id": row["customer_id"],
        "tenure": float(tenure),
        "recharge": float(recharge),
        "incoming_minutes": float(incoming_minutes),
        "previous_incoming_minutes": float(previous_incoming),
        "last_day_recharge": float(last_recharge)
    }

@app.get("/analytics")
def get_analytics():
    df = pd.read_csv("telecom_churn_data.csv")

    # Identify customers classified as churned
    df["churn"] = (
        (df["total_ic_mou_9"] == 0)
        & (df["total_og_mou_9"] == 0)
        & (df["total_rech_amt_9"] == 0)
    ).astype(int)

    total_customers = len(df)
    churned_customers = int(df["churn"].sum())
    active_customers = total_customers - churned_customers

    churn_rate = (
        round(churned_customers / total_customers * 100, 2)
        if total_customers > 0
        else 0
    )

    monthly_usage = []

    for month in [6, 7, 8, 9]:
        incoming_col = f"total_ic_mou_{month}"
        outgoing_col = f"total_og_mou_{month}"

        monthly_usage.append({
            "month": f"Month {month}",
            "incoming_minutes": round(
                pd.to_numeric(df[incoming_col], errors="coerce")
                .fillna(0).mean(), 2
            ),
            "outgoing_minutes": round(
                pd.to_numeric(df[outgoing_col], errors="coerce")
                .fillna(0).mean(), 2
            ),
        })

    return {
        "total_customers": total_customers,
        "churned_customers": churned_customers,
        "active_customers": active_customers,
        "churn_rate": churn_rate,
        "monthly_usage": monthly_usage,
    }



   
    df = pd.read_csv("telecom_churn_data.csv")

    # Identify customers classified as churned
    df["churn"] = (
        (df["total_ic_mou_9"] == 0)
        & (df["total_og_mou_9"] == 0)
        & (df["total_rech_amt_9"] == 0)
    ).astype(int)

    total_customers = len(df)
    churned_customers = int(df["churn"].sum())
    active_customers = total_customers - churned_customers

    churn_rate = (
        round((churned_customers / total_customers) * 100, 2)
        if total_customers > 0
        else 0
    )

    return {
        "total_customers": total_customers,
        "churned_customers": churned_customers,
        "active_customers": active_customers,
        "churn_rate": churn_rate,
    }








@app.post("/chat")
def chat(message: dict):
    question = str(message.get("message", "")).strip().lower()

    if not question:
        return {"reply": "Please enter a question."}

    stats = get_analytics()

    total = stats["total_customers"]
    churned = stats["churned_customers"]
    active = stats["active_customers"]
    rate = stats["churn_rate"]

    if question in [
        "hi", "hii", "hello", "hey", "helo",
        "good morning", "good afternoon", "good evening"
    ]:
        reply = (
            "Hello! 👋 Welcome to Telecom Intelligence. "
            "How can I help you with customer churn and telecom analytics?"
        )

    elif "thank" in question:
        reply = "You're welcome! 😊 Feel free to ask me another question."

    elif "churn rate" in question or "churn percentage" in question:
        reply = f"The churn rate in your dataset is {rate}%."

    elif (
        question == "churn"
        or "what is churn" in question
        or "customer churn" in question
        or "explain churn" in question
        or "meaning of churn" in question
    ):
        reply = (
            "Customer churn means customers stop using a company's service. "
            "In telecom, this can mean a customer stops using a mobile or "
            "telephone service. 📱\n\n"
            f"In your dataset, {churned:,} customers are labelled as churned "
            f"and {active:,} are labelled as active. The churn rate is {rate}%.\n\n"
            "These labels are based on your project's inactivity rule, "
            "so they do not necessarily confirm actual cancellations."
        )

    elif (
        ("why" in question and "churn" in question)
        or "reason for churn" in question
        or "causes of churn" in question
    ):
        reply = (
            "Customers may leave a telecom provider because of high prices, "
            "poor network coverage, unreliable service, better offers from "
            "competitors, or poor customer support. These are possible "
            "reasons, not confirmed causes in your dataset."
        )

    elif (
        "churned customers" in question
        or "customers churned" in question
        or "how many churn" in question
        or "how many customers left" in question
    ):
        reply = f"{churned:,} customers are classified as churned."

    elif "high risk" in question or "at risk" in question:
        reply = (
            f"{churned:,} customers are labelled as churned by your "
            "dataset's inactivity-based rule. This is not the same as "
            "a model prediction of future churn risk."
        )

    elif "active customers" in question or "how many active" in question:
        reply = f"{active:,} customers are classified as active."

    elif (
        "total customers" in question
        or "number of customers" in question
        or "how many customers" in question
    ):
        reply = f"Your dataset contains {total:,} customers."

    elif "model" in question or "accuracy" in question or "f1 score" in question:
        reply = (
            "Your dashboard reports an XGBoost model with 92.87% accuracy, "
            "72% recall, and a 65% F1 score. Verify these figures against "
            "the model's actual evaluation results."
        )

    elif "help" in question or "what can you do" in question:
        reply = (
            "I can answer questions about:\n"
            "• Customer churn and its meaning\n"
            "• Churn rate\n"
            "• Active and churn-labelled customers\n"
            "• Possible reasons for churn\n"
            "• Model performance\n\n"
            "Try asking: 'What is churn?' or 'What is the churn rate?'"
        )

    else:
        reply = (
            "I'm your Telecom AI Assistant. 😊 Try asking:\n"
            "• What is customer churn?\n"
            "• What is the churn rate?\n"
            "• How many customers are active?\n"
            "• Why do customers churn?"
        )

    return {"reply": reply}
# --------------------------------
# CUSTOMER RETENTION RECOMMENDATION
# --------------------------------

@app.get("/customers/{customer_id}/recommendation")
def get_customer_recommendation(customer_id: str):

    df = pd.read_csv("telecom_churn_data.csv")

    # Generate the same customer IDs used by /customers
    df["customer_id"] = [
        f"CUST{index + 1:05d}"
        for index in range(len(df))
    ]

    # Find the selected customer
    matches = df[
        df["customer_id"].str.upper() == customer_id.upper()
    ]

    if matches.empty:
        return {"error": "Customer not found"}

    row = matches.iloc[0]

    # Get the five features required by XGBoost
    feature_values = {
        "loc_ic_mou_8": row["loc_ic_mou_8"],
        "total_rech_amt_8": row["total_rech_amt_8"],
        "last_day_rch_amt_8": row["last_day_rch_amt_8"],
        "loc_ic_mou_7": row["loc_ic_mou_7"],
        "aon": row["aon"],
    }

    # Handle missing and invalid values
    for key, value in feature_values.items():
        value = pd.to_numeric(value, errors="coerce")

        if pd.isna(value) or not (-float("inf") < value < float("inf")):
            value = 0

        feature_values[key] = float(value)

    # Prepare input in the model's expected feature order
    input_data = pd.DataFrame([feature_values])
    input_data = input_data[feature_columns]

    # Predict churn probability
    probability = float(model.predict_proba(input_data)[0][1])
    prediction = int(probability >= 0.70)

    # Assign a display risk level
    if probability >= 0.70:
        risk_level = "High"
    elif probability >= 0.40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Explainable, rule-based recommendations
    reasons = []
    recommendations = []

    current_usage = feature_values["loc_ic_mou_8"]
    previous_usage = feature_values["loc_ic_mou_7"]
    recharge = feature_values["total_rech_amt_8"]
    tenure = feature_values["aon"]

    if previous_usage > 0 and current_usage <= previous_usage * 0.70:
        reasons.append("Incoming call usage decreased by at least 30%.")
        recommendations.append(
            "Review the customer's recent usage and contact them "
            "to understand whether they need support."
        )

    if recharge < 100:
        reasons.append("Recharge amount is below the configured threshold.")
        recommendations.append(
            "Review recharge patterns and consider a suitable recharge offer."
        )

    if tenure < 180:
        reasons.append("The customer has less than 180 days of tenure.")
        recommendations.append(
            "Provide onboarding assistance and check for service difficulties."
        )

    if probability >= 0.70:
        recommendations.append(
            "Prioritize this customer for a retention follow-up."
        )
    elif probability >= 0.40:
        recommendations.append(
            "Monitor this customer's risk and review their usage regularly."
        )
    else:
        recommendations.append(
            "Continue regular customer engagement and monitor for changes."
        )

 
    if not reasons:
        reasons.append(
            "No additional risk indicators were triggered by the configured rules."
        )

    # Save prediction to SQLite history
    save_prediction_history(
        customer_id=row["customer_id"],
        probability=round(probability * 100, 2),
        risk_level=risk_level,
        prediction_result="Churn" if prediction == 1 else "Not Churn",
    )

    return {

        "customer_id": row["customer_id"],
        "churn_probability": round(probability, 4),
        "churn_probability_percent": round(probability * 100, 2),
        "prediction": prediction,
        "result": "Churn" if prediction == 1 else "Not Churn",
        "risk_level": risk_level,
        "reasons": reasons,
        "recommendations": recommendations,
        "customer_data": {
            "tenure": tenure,
            "recharge": recharge,
            "incoming_minutes": current_usage,
            "previous_incoming_minutes": previous_usage,
            "last_day_recharge": feature_values["last_day_rch_amt_8"],
        },
    }