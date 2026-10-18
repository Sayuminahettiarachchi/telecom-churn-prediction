
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-800 bg-slate-900 p-6 md:block">
          <h1 className="text-xl font-bold">
            Telecom Intelligence
          </h1>

          <nav className="mt-10 space-y-2">
            <a
              href="/"
              className="block rounded-lg bg-blue-600 px-4 py-3"
            >
              Dashboard
            </a>

            <a
              href="/prediction"
           className="block rounded-lg px-4 py-3 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"
            >
              Prediction
            </a>

            <a
              href="/customers"
          className="block rounded-lg px-4 py-3 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"
            >
              Customers
            </a>

            <a
              href="/analytics"
            className="block rounded-lg px-4 py-3 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"
            >
              Analytics
            </a>




<a
  href="/history"
  className="block rounded-lg px-4 py-3 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"
>
  Prediction History
</a>





            {/* Retention Recommendations button */}
            <a
              href="/retention"
              className="block rounded-lg px-4 py-3 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"
            >
              Retention Recommendations
            </a>
          </nav>
        </aside>

        <section className="flex-1 p-6 md:p-10">
          <h2 className="text-3xl font-bold">Dashboard</h2>

          <p className="mt-2 text-slate-400">
            Telecom customer churn intelligence platform
          </p>

          {/* AI Assistant Welcome Section */}
          <div className="mt-8 flex flex-col items-center gap-5 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-blue-950/40 p-8 text-center md:flex-row md:text-left">
            <Image
              src="/pngtree-friendly-cartoon-man-wearing-a-suit-and-headset-png-image_17948103.webp"
              alt="Telecom AI Assistant"
              width={200}
              height={220}
              priority
              className="h-44 w-44 object-contain"
            />

            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                AI Powered Intelligence
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Meet Your Telecom AI Assistant
              </h3>

              <p className="mt-3 text-slate-400">
                Explore customer churn, discover high-risk customers,
                and understand your telecom analytics with your AI assistant.
              </p>

              <p className="mt-4 text-sm text-blue-300">
                Your intelligent telecom analytics companion
              </p>
            </div>
          </div>

          {/* Dashboard Statistics */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Total Customers", "99,999"],
              ["Churn Rate", "9.02%"],
              ["High Risk Customers", "9,020"],
              ["Model Accuracy", "92.87%"],
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

          {/* Churn Overview and Model Status */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-xl font-semibold">Churn Overview</h3>

              <p className="mt-3 text-slate-400">
                Monitor customers who may be at risk of leaving.
              </p>

              <div className="mt-6 flex justify-between">
                <span className="text-slate-400">Churned Customers</span>
                <span>9,020</span>
              </div>

              <div className="mt-3 h-3 rounded-full bg-slate-800">
                <div className="h-3 w-[9.02%] rounded-full bg-red-500" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-xl font-semibold">Model Status</h3>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Model</span>
                  <span className="text-green-400">XGBoost</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Accuracy</span>
                  <span>92.87%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Recall</span>
                  <span>72%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">F1 Score</span>
                  <span>65%</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
