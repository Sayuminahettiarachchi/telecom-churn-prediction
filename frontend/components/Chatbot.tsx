
"use client";

import { useState } from "react";

type Message = {
  role: "assistant" | "user";
  text: string;
};

function getGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Colombo",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date())
  );

  if (hour < 12) {
    return "Good morning! ☀️";
  } else if (hour < 17) {
    return "Good afternoon! 🌤️";
  } else {
    return "Good evening! 🌙";
  }
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      role: "assistant",
      text: `${getGreeting()}

Welcome to Telecom Intelligence! 👋

I'm your Telecom AI Assistant. Ask me about customer churn, customer statistics, and telecom analytics.`,
    },
  ]);

  async function sendMessage() {
    const text = input.trim();

    if (!text || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", text },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8001/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: text }),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: data.reply ?? "The backend returned no reply.",
        },
      ]);
    } catch (error) {
      console.error("Chatbot connection error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "I couldn't connect to the chatbot backend. Please check that FastAPI is running and the /chat endpoint is available.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 flex h-[480px] w-[350px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-green-800 bg-slate-900 text-white shadow-2xl">
          {/* Green Header */}
          <div className="flex items-center justify-between bg-green-700 p-4">
            <div>
              <h3 className="font-semibold">
                Telecom AI Assistant
              </h3>
              <p className="text-xs text-green-100">
                Customer churn support
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-2xl hover:text-green-200"
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-xl border p-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "border-green-500 bg-green-600 text-white"
                      : "border-slate-700 bg-slate-800 text-slate-100"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <p className="text-sm text-green-400">
                Assistant is thinking...
              </p>
            )}
          </div>

          {/* Message Input */}
          <form
            className="flex gap-2 border-t border-slate-700 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a question..."
              aria-label="Type your message"
              disabled={loading}
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating Green Chatbot Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl text-white shadow-lg transition hover:scale-105 hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-400/40"
          aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
        >
          {isOpen ? "×" : "💬"}
        </button>
      </div>
    </div>
  );
}
