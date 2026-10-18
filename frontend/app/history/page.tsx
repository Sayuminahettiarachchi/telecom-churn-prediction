
"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8001";

type HistoryRecord = {
  id: number;
  customer_id: string;
  created_at: string;
  churn_probability: number;
  risk_level: string;
  prediction_result: string;
};

type HistoryResponse = {
  total_records: number;
  records: HistoryRecord[];
};

export default function PredictionHistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/prediction-history?limit=100`
      );

      if (!response.ok) {
        throw new Error("Unable to load prediction history.");
      }

      const data: HistoryResponse = await response.json();

      setRecords(data.records);
      setTotalRecords(data.total_records);
    } catch {
      setError(
        "Unable to connect to FastAPI. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function deleteRecord(record: HistoryRecord) {
    const confirmed = window.confirm(
      `Delete the history record for ${record.customer_id}?`
    );

    if (!confirmed) return;

    setDeletingId(record.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/prediction-history/${record.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete record.");
      }

      setMessage(`History record for ${record.customer_id} deleted.`);
      await loadHistory();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete record."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function clearAllHistory() {
    if (totalRecords === 0) return;

    const confirmed = window.confirm(
      "Delete ALL prediction history records? This action cannot be undone."
    );

    if (!confirmed) return;

    setClearing(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/prediction-history`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to clear history.");
      }

      setMessage(
        `Successfully deleted ${data.deleted_count} history records.`
      );
      setSearch("");
      setRiskFilter("All");
      await loadHistory();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to clear history."
      );
    } finally {
      setClearing(false);
    }
  }

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.customer_id
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesRisk =
      riskFilter === "All" || record.risk_level === riskFilter;

    return matchesSearch && matchesRisk;
  });

  function riskClass(level: string) {
    if (level === "High") {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    if (level === "Medium") {
      return "border-amber-500/30 bg-amber-500/10 text-amber-400";
    }

    return "border-green-500/30 bg-green-500/10 text-green-400";
  }

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white md:p-10">
      <div className="mx-auto max-w-7xl">
        <a
          href="/"
          className="text-sm text-green-400 hover:text-green-300"
        >
          ← Back to Dashboard
        </a>

        <header className="mb-8 mt-5">
          <p className="text-sm font-medium text-green-400">
            TELECOM INTELLIGENCE
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Prediction History
          </h1>

          <p className="mt-3 text-slate-400">
            Review and manage previously saved customer churn predictions.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Total Saved Predictions
            </p>
            <p className="mt-2 text-3xl font-bold">
              {totalRecords.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Records Displayed
            </p>
            <p className="mt-2 text-3xl font-bold">
              {filteredRecords.length.toLocaleString()}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by customer ID"
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-green-500"
            />

            <select
              value={riskFilter}
              onChange={(event) => setRiskFilter(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-green-500"
            >
              <option value="All">All risk levels</option>
              <option value="High">High risk</option>
              <option value="Medium">Medium risk</option>
              <option value="Low">Low risk</option>
            </select>

            <button
              type="button"
              onClick={loadHistory}
              disabled={loading || clearing}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={clearAllHistory}
              disabled={clearing || loading || totalRecords === 0}
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {clearing ? "Deleting..." : "Clear All History"}
            </button>
          </div>
        </section>

        {message && (
          <div
            role="status"
            className="mt-6 rounded-lg border border-green-800 bg-green-950 p-4 text-green-300"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-800 bg-red-950 p-5 text-red-300"
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Loading prediction history...
          </div>
        )}

        {!loading && !error && (
          <section className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-4 text-sm text-slate-400">
                      Customer ID
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-sm text-slate-400">
                      Date &amp; Time
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-sm text-slate-400">
                      Churn Probability
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-sm text-slate-400">
                      Risk Level
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-sm text-slate-400">
                      Prediction
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-sm text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-t border-slate-800 hover:bg-slate-800/60"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-medium">
                        {record.customer_id}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">
                        {new Date(record.created_at).toLocaleString()}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold">
                        {Number(record.churn_probability).toFixed(2)}%
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskClass(record.risk_level)}`}
                        >
                          {record.risk_level}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        {record.prediction_result}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <button
                          type="button"
                          onClick={() => deleteRecord(record)}
                          disabled={deletingId !== null || clearing}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === record.id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-slate-300">
                  No prediction records found.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Run a customer analysis on the Retention Recommendations
                  page, then refresh this page.
                </p>
              </div>
            )}

            {records.length > 0 && (
              <p className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">
                Showing up to the latest 100 records. Use Refresh
                to load the latest saved predictions.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
