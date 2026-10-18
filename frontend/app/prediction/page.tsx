
"use client";

import { useState } from "react";

export default function Prediction() {
  const [formData, setFormData] = useState({
    loc_ic_mou_8: "",
    total_rech_amt_8: "",
    last_day_rch_amt_8: "",
    loc_ic_mou_7: "",
    aon: "",
  });

  const [result, setResult] = useState("");
  const [probability, setProbability] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult("");
    setProbability(null);

    try {
      const response = await fetch("http://127.0.0.1:8001/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loc_ic_mou_8: Number(formData.loc_ic_mou_8),
          total_rech_amt_8: Number(formData.total_rech_amt_8),
          last_day_rch_amt_8: Number(formData.last_day_rch_amt_8),
          loc_ic_mou_7: Number(formData.loc_ic_mou_7),
          aon: Number(formData.aon),
        }),
      });

      if (!response.ok) {
        throw new Error("Prediction request failed.");
      }

      const data = await response.json();

      setResult(data.result);
      setProbability(data.churn_probability);
    } catch (error) {
      setError(
        "Unable to connect to the prediction server. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-3xl font-bold">
          Customer Churn Prediction
        </h1>

        <p className="mt-2 text-slate-400">
          Enter customer information to predict the likelihood of churn.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-6 rounded-xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-2"
        >

          <div>
            <label className="text-sm text-slate-300">
              Local Incoming Call Minutes - Month 8
            </label>

            <input
              type="number"
              name="loc_ic_mou_8"
              value={formData.loc_ic_mou_8}
              onChange={handleChange}
              placeholder="Example: 100"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">
              Total Recharge Amount - Month 8
            </label>

            <input
              type="number"
              name="total_rech_amt_8"
              value={formData.total_rech_amt_8}
              onChange={handleChange}
              placeholder="Example: 300"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">
              Last Day Recharge Amount - Month 8
            </label>

            <input
              type="number"
              name="last_day_rch_amt_8"
              value={formData.last_day_rch_amt_8}
              onChange={handleChange}
              placeholder="Example: 50"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">
              Local Incoming Call Minutes - Month 7
            </label>

            <input
              type="number"
              name="loc_ic_mou_7"
              value={formData.loc_ic_mou_7}
              onChange={handleChange}
              placeholder="Example: 120"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">
              Age on Network (Days)
            </label>

            <input
              type="number"
              name="aon"
              value={formData.aon}
              onChange={handleChange}
              placeholder="Example: 800"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Predicting..." : "Predict Churn"}
            </button>
          </div>

        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-red-800 bg-red-950 p-6">
            <h2 className="text-xl font-semibold text-red-400">
              Error
            </h2>

            <p className="mt-2 text-slate-300">
              {error}
            </p>
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-semibold">
              Prediction Result
            </h2>

            <p className="mt-4 text-2xl font-bold">
              {result}
            </p>

            {probability !== null && (
              <p className="mt-2 text-slate-400">
                Churn Probability:{" "}
                <span className="font-semibold text-white">
                  {(probability * 100).toFixed(2)}%
                </span>
              </p>
            )}

          </div>
        )}

      </div>
    </main>
  );
}
