
"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8001";

type Customer = {
  customer_id: string;
  tenure: number;
  recharge: number;
  incoming_minutes: number;
};

type CustomerResponse = {
  total_customers: number;
  page: number;
  limit: number;
  total_pages: number;
  customers: Customer[];
};

type RecommendationResult = {
  customer_id: string;
  churn_probability: number;
  churn_probability_percent: number;
  prediction: number;
  result: string;
  risk_level: string;
  reasons: string[];
  recommendations: string[];
  customer_data: {
    tenure: number;
    recharge: number;
    incoming_minutes: number;
    previous_incoming_minutes: number;
    last_day_recharge: number;
  };
};

export default function RetentionPage() {
  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState("");

  const [result, setResult] =
    useState<RecommendationResult | null>(null);

  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCustomers() {
      setLoadingCustomers(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/customers?page=1&limit=20&search=${encodeURIComponent(
            searchText
          )}`
        );

        if (!response.ok) {
          throw new Error("Unable to load customers.");
        }

        const data: CustomerResponse = await response.json();

        if (!cancelled) {
          setCustomers(data.customers);
          setSelectedId((current) =>
            data.customers.some(
              (customer) => customer.customer_id === current
            )
              ? current
              : ""
          );
          setResult(null);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Unable to connect to FastAPI. Check that the backend is running on port 8001."
          );
          setCustomers([]);
          setSelectedId("");
          setResult(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingCustomers(false);
        }
      }
    }

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, [searchText]);

  async function analyzeCustomer() {
    if (!selectedId) {
      setError("Please search for and select a customer first.");
      return;
    }

    setLoadingResult(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}/customers/${encodeURIComponent(
          selectedId
        )}/recommendation`
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error || "Failed to generate recommendations."
        );
      }

      setResult(data as RecommendationResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze this customer."
      );
    } finally {
      setLoadingResult(false);
    }
  }

  function handleSearch() {
    setSearchText(search.trim());
    setResult(null);
    setSelectedId("");
    setError("");
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  const riskColor =
    result?.risk_level === "High"
      ? "text-red-400"
      : result?.risk_level === "Medium"
        ? "text-amber-400"
        : "text-green-400";

  const riskBarColor =
    result?.risk_level === "High"
      ? "bg-red-500"
      : result?.risk_level === "Medium"
        ? "bg-amber-400"
        : "bg-green-500";

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
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
            Retention Recommendations
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Analyze customers from your telecom dataset and
            generate churn-risk insights and retention actions.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customer selection */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Select a customer
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Search by customer ID, for example CUST00021.
            </p>

            <div className="mt-5 flex gap-3">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter customer ID"
                className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-green-500"
              />

              <button
                type="button"
                onClick={handleSearch}
                disabled={loadingCustomers}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                Search
              </button>
            </div>

            <div className="mt-5">
              <label
                htmlFor="customer"
                className="text-sm font-medium text-slate-200"
              >
                Matching customers
              </label>

              <select
                id="customer"
                value={selectedId}
                onChange={(event) => {
                  setSelectedId(event.target.value);
                  setResult(null);
                  setError("");
                }}
                disabled={loadingCustomers || customers.length === 0}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-green-500 disabled:opacity-50"
              >
                <option value="">
                  {loadingCustomers
                    ? "Loading customers..."
                    : customers.length === 0
                      ? "No matching customers"
                      : "Choose a customer"}
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer.customer_id}
                    value={customer.customer_id}
                  >
                    {customer.customer_id}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-slate-500">
                Showing up to 20 matching customers.
              </p>
            </div>

            {selectedId && (
              <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4">
                <p className="text-sm text-slate-400">
                  Selected customer
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {selectedId}
                </p>

                {(() => {
                  const selected = customers.find(
                    (customer) =>
                      customer.customer_id === selectedId
                  );

                  if (!selected) return null;

                  return (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-slate-500">
                          Tenure
                        </p>
                        <p className="mt-1 font-medium">
                          {selected.tenure.toLocaleString()} days
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Recharge
                        </p>
                        <p className="mt-1 font-medium">
                          Rs. {selected.recharge.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Incoming minutes
                        </p>
                        <p className="mt-1 font-medium">
                          {selected.incoming_minutes.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <button
              type="button"
              onClick={analyzeCustomer}
              disabled={!selectedId || loadingResult || loadingCustomers}
              className="mt-6 w-full rounded-lg bg-green-600 px-5 py-3 font-semibold transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingResult
                ? "Analyzing customer..."
                : "Analyze and recommend"}
            </button>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}
          </section>

          {/* Results */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Recommendation results
            </h2>

            {!result && (
              <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center">
                <p className="text-slate-300">
                  Your results will appear here.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Select a customer and run the analysis.
                </p>
              </div>
            )}

            {result && (
              <div className="mt-6 space-y-6">
                <div className="rounded-xl border border-slate-700 p-5">
                  <p className="text-sm text-slate-400">
                    Customer ID
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {result.customer_id}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">
                        Churn probability
                      </p>

                      <p className="mt-2 text-4xl font-bold">
                        {result.churn_probability_percent.toFixed(1)}%
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-slate-400">
                        Risk level
                      </p>

                      <p className={`mt-2 text-xl font-bold ${riskColor}`}>
                        {result.risk_level}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${riskBarColor}`}
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            result.churn_probability_percent
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="mt-3 text-sm text-slate-400">
                    Model classification:{" "}
                    <span className="font-medium text-white">
                      {result.result}
                    </span>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold">
                    Customer risk indicators
                  </h3>

                  <ul className="mt-3 space-y-2">
                    {result.reasons.map((reason, index) => (
                      <li
                        key={`${index}-${reason}`}
                        className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300"
                      >
                        <span className="mr-2 text-amber-400">
                          •
                        </span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">
                    Suggested retention actions
                  </h3>

                  <div className="mt-3 space-y-3">
                    {result.recommendations.map(
                      (recommendation, index) => (
                        <article
                          key={`${index}-${recommendation}`}
                          className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                        >
                          <p className="text-xs font-medium text-green-400">
                            RECOMMENDATION {index + 1}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-200">
                            {recommendation}
                          </p>
                        </article>
                      )
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 p-4 text-xs leading-5 text-slate-500">
                  These recommendations are rule-based suggestions.
                  Churn probability is a model estimate, not a
                  guarantee that a customer will leave. Validate
                  the model and business thresholds before using
                  these suggestions for real customer decisions.
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
