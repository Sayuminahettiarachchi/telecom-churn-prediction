
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Customer = {
  customer_id: string;
  tenure: number;
  recharge: number;
  incoming_minutes: number;
  previous_incoming_minutes: number;
  last_day_recharge: number;
};

type Prediction = {
  prediction?: number;
  churn_probability?: number;
  risk?: string;
  [key: string]: unknown;
};

export default function CustomerDetails() {
  const params = useParams();
  const customerId = params.customer_id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/customers/${customerId}`
        );

        if (!response.ok) {
          throw new Error("Customer not found.");
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setCustomer(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load customer information."
        );
      } finally {
        setLoading(false);
      }
    }

    if (customerId) {
      loadCustomer();
    }
  }, [customerId]);

  async function handlePredictChurn() {
    if (!customer) return;

    setPredicting(true);
    setPrediction(null);
    setPredictionError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loc_ic_mou_8: customer.incoming_minutes,
          total_rech_amt_8: customer.recharge,
          last_day_rch_amt_8: customer.last_day_recharge,
          loc_ic_mou_7: customer.previous_incoming_minutes,
          aon: customer.tenure,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed.");
      }

      setPrediction(data);
    } catch (err) {
      setPredictionError(
        err instanceof Error ? err.message : "Unable to predict churn."
      );
    } finally {
      setPredicting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Loading customer...
      </main>
    );
  }

  if (error || !customer) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <h1 className="text-2xl font-bold text-red-400">
          Customer Not Found
        </h1>
        <p className="mt-3 text-slate-400">{error}</p>
        <a
          href="/customers"
          className="mt-5 inline-block text-blue-400"
        >
          ← Back to Customers
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl">
        <a
          href="/customers"
          className="text-blue-400 hover:text-blue-300"
        >
          ← Back to Customers
        </a>

        <h1 className="mt-6 text-3xl font-bold">Customer Details</h1>
       <div className="mt-6 rounded-xl bg-red-600 p-6 text-white">
  <h2 className="text-2xl font-bold">
    TEST — CHURN SECTION
  </h2>
  <p>If you can see this, the updated file is loading.</p>
</div>
        <p className="mt-2 text-slate-400">
          Information for {customer.customer_id}
        </p>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Customer ID</p>
          <p className="mt-2 text-2xl font-bold text-blue-400">
            {customer.customer_id}
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Tenure", `${customer.tenure.toLocaleString()} days`],
            ["Recharge Amount", `Rs. ${customer.recharge.toLocaleString()}`],
            ["Incoming Minutes", customer.incoming_minutes.toLocaleString()],
            [
              "Previous Month Incoming",
              customer.previous_incoming_minutes.toLocaleString(),
            ],
            [
              "Last Day Recharge",
              `Rs. ${customer.last_day_recharge.toLocaleString()}`,
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-3 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Churn Prediction</h2>
          <p className="mt-2 text-slate-400">
            Use the machine-learning model to estimate churn risk.
          </p>

          <button
            onClick={handlePredictChurn}
            disabled={predicting}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            {predicting ? "Predicting..." : "Predict Churn"}
          </button>

          {predictionError && (
            <p className="mt-4 text-red-400">{predictionError}</p>
          )}

          {prediction && (
            <div className="mt-5 rounded-lg border border-slate-700 p-5">
              <h3 className="font-semibold">Prediction Response</h3>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">
                {JSON.stringify(prediction, null, 2)}
              </pre>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
