
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = "http://127.0.0.1:8001";

type Customer = {
  customer_id: string;
  tenure: number;
  recharge: number;
  incoming_minutes: number;
  previous_incoming_minutes: number;
  last_day_recharge: number;
};

type Prediction = {
  result?: string;
  prediction?: number;
  churn_probability?: number;
  probability?: number;
};

export default function CustomerDetails() {
  const params = useParams<{ customer_id: string }>();
  const customerId = params.customer_id;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/customers/${encodeURIComponent(customerId)}`
        );

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.detail || data.error || "Customer not found.");
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
      const response = await fetch(`${API_URL}/predict`, {
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
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail ?? "Prediction failed.")
        );
      }

      setPrediction(data);
    } catch (err) {
      setPredictionError(
        err instanceof Error
          ? err.message
          : "Unable to predict churn."
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
          Unable to Load Customer
        </h1>
        <p className="mt-3 text-slate-400">{error || "Customer not found."}</p>
        <a href="/customers" className="mt-5 inline-block text-blue-400">
          ← Back to Customers
        </a>
      </main>
    );
  }

  const churnProbability =
    prediction?.churn_probability ?? prediction?.probability;

  const predictionResult =
    prediction?.result ??
    (prediction?.prediction === 1
      ? "Churn"
      : prediction?.prediction === 0
        ? "Not Churn"
        : "Unknown");

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl">
        <a href="/customers" className="text-blue-400 hover:text-blue-300">
          ← Back to Customers
        </a>

        <h1 className="mt-6 text-3xl font-bold">Customer Details</h1>
        <p className="mt-2 text-slate-400">
          Detailed information for {customer.customer_id}
        </p>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Customer ID</p>
          <p className="mt-2 text-2xl font-bold text-blue-400">
            {customer.customer_id}
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Tenure</p>
            <p className="mt-2 text-2xl font-bold">
              {customer.tenure.toLocaleString()} days
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Recharge Amount</p>
            <p className="mt-2 text-2xl font-bold">
              Rs. {customer.recharge.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Incoming Minutes</p>
            <p className="mt-2 text-2xl font-bold">
              {customer.incoming_minutes.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Previous Month Incoming
            </p>
            <p className="mt-2 text-2xl font-bold">
              {customer.previous_incoming_minutes.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Last Day Recharge</p>
            <p className="mt-2 text-2xl font-bold">
              Rs. {customer.last_day_recharge.toLocaleString()}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Churn Prediction</h2>
          <p className="mt-2 text-slate-400">
            Estimate this customer's risk of leaving using the ML model.
          </p>

          <button
            onClick={handlePredictChurn}
            disabled={predicting}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {predicting ? "Predicting..." : "Predict Churn"}
          </button>

          {predictionError && (
            <p className="mt-4 text-red-400">{predictionError}</p>
          )}

          {prediction && (
            <div className="mt-5 rounded-lg border border-slate-700 p-5">
              <h3 className="font-semibold">Prediction Result</h3>

              <p
                className={`mt-3 text-2xl font-bold ${
                  predictionResult === "Churn"
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {predictionResult}
              </p>

              {churnProbability !== undefined && (
                <p className="mt-2 text-slate-300">
                  Churn Probability:{" "}
                  {(Number(churnProbability) * 100).toFixed(2)}%
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
