# Telecom Intelligence — Customer Churn Prediction Platform

An end-to-end telecom customer churn prediction project built with **Machine Learning, FastAPI, and Next.js**. The platform helps explore customer churn, predict churn risk, review prediction history, and display retention recommendations.

## Project Overview

Customer churn occurs when a customer stops using a company's services. Predicting churn risk can help telecom businesses identify customers who may need additional support or retention offers.

This project combines a machine learning model with a web-based dashboard and REST API.

## Features

- **Dashboard:** Displays customer churn summary metrics.
- **Churn Prediction:** Sends customer information to the backend to obtain a churn prediction and probability.
- **Customer Management:** Provides customer-related views.
- **Analytics:** Presents churn-related information.
- **Prediction History:** Supports reviewing saved prediction records.
- **Retention Recommendations:** Displays suggestions based on customer information and churn risk.
- **Chatbot:** Answers supported questions about the dataset using predefined rules.
- **REST API:** Uses FastAPI to provide backend endpoints.

*Note: Some dashboard figures are illustrative, and retention suggestions are based on application rules rather than a separately trained recommendation model.*

## Technology Stack

**Machine Learning and Backend**
- Python
- XGBoost
- scikit-learn
- Pandas
- Joblib
- FastAPI
- Uvicorn
- SQLite

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS

**Tools and Deployment**
- Git and GitHub
- Vercel for the frontend

## Project Structure

```text
telecom-churn-prediction/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── small_churn_model.pkl
│   ├── small_feature_columns.pkl
│   ├── telecom_churn_data.csv
│   └── prediction_history.db
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md
```

## Requirements

- Python 3.11 or another compatible Python version
- Node.js and npm
- Git

## Run the Backend Locally

Open a terminal in the project root and run:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```bash
python -m pip install -r requirements.txt
```

Start the API:

```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8001
```

Open the interactive API documentation:

http://127.0.0.1:8001/docs

## Run the Frontend Locally

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

If PowerShell blocks the `npm` script, use:

```powershell
npm.cmd run dev
```

Open the local frontend at:

http://localhost:3000

If port 3000 is already occupied, Next.js may select another port. Use the URL printed in your terminal.

## API Endpoints

The backend currently exposes these endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| `/analytics` | GET | Retrieve analytics data |
| `/chat` | POST | Ask supported dataset questions |
| `/customers` | GET | Retrieve customer information |
| `/customers/{customer_id}` | GET | Retrieve a customer record |
| `/customers/{customer_id}/recommendation` | GET | Retrieve a customer's recommendation |
| `/predict` | POST | Predict customer churn |
| `/prediction-history` | GET | Retrieve prediction history |
| `/prediction-history/{record_id}` | GET | Retrieve a history record |

See the FastAPI documentation for request parameters and response examples.

## Machine Learning

The backend loads a saved model and its associated feature columns to generate predictions.

The model returns a churn probability and a prediction result. The probability represents the model's estimated risk, not a guarantee that a customer will leave.

Model evaluation should consider accuracy, precision, recall, and F1-score. These metrics should be reported from a verified evaluation run rather than assumed from dashboard values.

## Deployment Status

- **Frontend:** Built with Next.js and prepared for Vercel deployment.
- **Backend:** FastAPI application runs locally.
- **Cloud API deployment:** Not documented as completed.
- **CI/CD:** Not documented as implemented.

For a public deployment, the frontend must use the URL of a deployed backend API rather than a local address such as `127.0.0.1`.

## Future Improvements

- Deploy the backend API to a cloud hosting service.
- Connect the deployed frontend and backend securely.
- Add automated model evaluation and monitoring.
- Improve the chatbot's natural-language capabilities.
- Expand testing and documentation.

## Author

**Sayumina Hettiarachchi**

GitHub: [@Sayuminahettiarachchi](https://github.com/Sayuminahettiarachchi)

Project repository: [telecom-churn-prediction](https://github.com/Sayuminahettiarachchi/telecom-churn-prediction)
