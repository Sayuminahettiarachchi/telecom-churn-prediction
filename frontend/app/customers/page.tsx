
"use client";

import { useEffect, useState } from "react";

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

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // What the user is typing
  const [search, setSearch] = useState("");

  // What is actually searched
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 20;

  useEffect(() => {
    const getCustomers = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://127.0.0.1:8001/customers?page=${page}&limit=${limit}&search=${encodeURIComponent(
            searchText
          )}`
        );

        if (!response.ok) {
          throw new Error("Failed to load customers");
        }

        const data: CustomerResponse = await response.json();

        setCustomers(data.customers);
        setTotalCustomers(data.total_customers);
        setTotalPages(data.total_pages);
      } catch (error) {
        setError(
          "Unable to connect to FastAPI. Make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    getCustomers();
  }, [page, searchText]);

  // Search button / Enter key
  const handleSearch = () => {
    setSearchText(search);
    setPage(1);
  };

  // Press Enter to search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const startCustomer =
    customers.length > 0 ? (page - 1) * limit + 1 : 0;

  const endCustomer =
    customers.length > 0
      ? Math.min(page * limit, totalCustomers)
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <h1 className="text-3xl font-bold">
          Customers
        </h1>

        <p className="mt-2 text-slate-400">
          View real customer information from the telecom dataset.
        </p>

        {/* Statistics */}

        <div className="mt-8 grid gap-6 sm:grid-cols-2">

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              {searchText ? "Search Results" : "Total Customers"}
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalCustomers.toLocaleString()}
            </p>

          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Customers Loaded
            </p>

            <p className="mt-2 text-3xl font-bold">
              {customers.length}
            </p>

          </div>

        </div>

        {/* Search */}

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <label className="text-sm text-slate-400">
            Search Customer
          </label>

          <div className="mt-2 flex gap-3">

            <input
              type="text"
              placeholder="Example: CUST00021"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-blue-500"
            />

            <button
              onClick={handleSearch}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
            >
              Search
            </button>

          </div>

        </div>

        {/* Loading */}

        {loading && (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">

            <p className="text-slate-400">
              Loading customers...
            </p>

          </div>
        )}

        {/* Error */}

        {error && (
          <div className="mt-8 rounded-xl border border-red-800 bg-red-950 p-6">

            <h2 className="text-xl font-semibold text-red-400">
              Connection Error
            </h2>

            <p className="mt-2 text-slate-300">
              {error}
            </p>

          </div>
        )}

        {/* Table */}

        {!loading && !error && (
          <>

            <div className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead className="bg-slate-950">

                    <tr>

                      <th className="px-6 py-4 text-sm text-slate-400">
                        Customer ID
                      </th>

                      <th className="px-6 py-4 text-sm text-slate-400">
                        Tenure
                      </th>

                      <th className="px-6 py-4 text-sm text-slate-400">
                        Recharge
                      </th>

                      <th className="px-6 py-4 text-sm text-slate-400">
                        Incoming Minutes
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {customers.map((customer) => (

                      <tr
                        key={customer.customer_id}
                        className="border-t border-slate-800 hover:bg-slate-800"
                      >

        
<td className="px-6 py-4 font-medium">

  <a
    href={`/customers/${customer.customer_id}`}
    className="text-blue-400 hover:text-blue-300 hover:underline"
  >
    {customer.customer_id}
  </a>

</td>


                        <td className="px-6 py-4">
                          {customer.tenure.toLocaleString()} days
                        </td>

                        <td className="px-6 py-4">
                          Rs. {customer.recharge.toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          {customer.incoming_minutes.toLocaleString()}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* No results */}

              {customers.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  No customers found.
                </div>
              )}

            </div>

            {/* Pagination */}

            <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:flex-row">

              <p className="text-sm text-slate-400">

                Showing{" "}

                <span className="font-semibold text-white">
                  {startCustomer.toLocaleString()}
                </span>

                {" - "}

                <span className="font-semibold text-white">
                  {endCustomer.toLocaleString()}
                </span>

                {" of "}

                <span className="font-semibold text-white">
                  {totalCustomers.toLocaleString()}
                </span>

              </p>

              <div className="flex items-center gap-3">

                <button
                  onClick={() =>
                    setPage((current) =>
                      Math.max(current - 1, 1)
                    )
                  }
                  disabled={page === 1}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold">
                  {page}
                </span>

                <button
                  onClick={() =>
                    setPage((current) =>
                      Math.min(current + 1, totalPages)
                    )
                  }
                  disabled={page === totalPages}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>

              </div>

            </div>

          </>
        )}

      </div>
    </main>
  );
}
