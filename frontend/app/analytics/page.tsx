"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type AnalyticsData = {
  total_customers: number;
  churned_customers: number;
  active_customers: number;
  churn_rate: number;
  monthly_usage: {
    month: string;
    incoming_minutes: number;
    outgoing_minutes: number;
  }[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
   fetch("http://127.0.0.1:8001/analytics")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load analytics data.");
        }
        return response.json();
      })
      .then((result: AnalyticsData) => setData(result))
      .catch(() => {
        setError(
          "Cannot connect to FastAPI. Make sure your backend is running."
        );
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white md:flex">
      <aside className="border-b border-slate-800 bg-slate-900 p-6 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <h1 className="text-xl font-bold">Telecom Intelligence</h1>

        <nav className="mt-6 flex flex-wrap gap-2 md:flex-col">
          <a href="/" className="rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800">
            Dashboard
          </a>
          <a href="/prediction" className="rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800">
            Prediction
          </a>
          <a href="/customers" className="rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800">
            Customers
          </a>
          <a href="/analytics" className="rounded-lg bg-blue-600 px-4 py-3">
            Analytics
          </a>
        </nav>
      </aside>

      <section className="min-w-0 flex-1 p-6 md:p-10">
        <h2 className="text-3xl font-bold">Analytics</h2>
        <p className="mt-2 text-slate-400">
          Customer churn statistics and monthly usage insights.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-800 bg-red-950 p-4 text-red-300">
            {error}
          </div>
        )}

        {!data && !error && (
          <p className="mt-8 text-slate-400">Loading analytics data...</p>
        )}

        {data && (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Total Customers", data.total_customers.toLocaleString()],
                ["Active Customers", data.active_customers.toLocaleString()],
                ["Churned Customers", data.churned_customers.toLocaleString()],
                ["Churn Rate", `${data.churn_rate}%`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                >
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="mt-3 text-3xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-xl font-semibold">
                  Customer Churn Overview
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Active customers compared with churned customers.
                </p>

                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Active",
                            value: data.active_customers,
                          },
                          {
                            name: "Churned",
                            value: data.churned_customers,
                          },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={100}
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(1)}%`
                        }
                      >
                        <Cell fill="#22c55e" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-xl font-semibold">Monthly Call Usage</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Incoming and outgoing minutes across the available months.
                </p>

                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.monthly_usage}
                      margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="incoming_minutes"
                        name="Incoming Minutes"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="outgoing_minutes"
                        name="Outgoing Minutes"
                        fill="#a78bfa"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}