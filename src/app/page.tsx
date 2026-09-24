"use client";

import { useState, useEffect } from "react";
import { Mail, Sparkles, CheckCircle2, Loader2 } from "lucide-react";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        <path
          d="M6 8C6 5.79086 7.79086 4 10 4H18C22.4183 4 26 7.58172 26 12C26 16.4183 22.4183 20 18 20H14L8 26V20H10C7.79086 20 6 18.2091 6 16V8Z"
          fill="url(#g)"
        />
        <circle cx="12" cy="12" r="1.5" fill="white" />
        <circle cx="17" cy="12" r="1.5" fill="white" />
      </svg>
      <span className="font-semibold tracking-tight text-neutral-900">inter-cative</span>
    </div>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
        setCount((c) => (c !== null ? c + 1 : 1));
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo />
          <a
            href="https://inter-cative.vercel.app"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition"
            target="_blank"
            rel="noreferrer"
          >
            Current product →
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          LOCAL INTELLIGENCE PLATFORM · V2
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-center text-balance max-w-3xl leading-[1.1]">
          Private Local AI,{" "}
          <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-teal-500 bg-clip-text text-transparent">
            even better.
          </span>
        </h1>

        <p className="mt-6 text-lg text-neutral-500 text-center max-w-xl text-balance">
          inter-cative v2 is coming. Same privacy-first local models, cleaner experience, and new features. Join the waitlist and be first to know when it drops.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 w-full max-w-md"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle" && status !== "loading") setStatus("idle");
                }}
                placeholder="you@example.com"
                disabled={status === "loading" || status === "success"}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="h-12 px-6 rounded-xl bg-neutral-900 text-white font-medium text-sm hover:bg-neutral-800 active:scale-[0.98] transition disabled:opacity-60 flex items-center justify-center gap-2 min-w-[140px]"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining…
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Joined
                </>
              ) : (
                "Join waitlist"
              )}
            </button>
          </div>

          {message && (
            <p
              className={`mt-3 text-sm text-center ${
                status === "success" ? "text-teal-600" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>

        {count !== null && count > 0 && (
          <p className="mt-6 text-sm text-neutral-400">
            {count} {count === 1 ? "person" : "people"} already waiting
          </p>
        )}

        {/* Features teaser */}
        <div className="mt-20 grid sm:grid-cols-3 gap-6 max-w-3xl w-full">
          {[
            { title: "Still 100% local", desc: "Models run on your device. No cloud, no sandbox." },
            { title: "Faster & cleaner", desc: "Refined UI, better performance, same minimal spirit." },
            { title: "New capabilities", desc: "More tools, better context, polished experience." },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <h3 className="font-medium text-neutral-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-400">
        <p>
          Built for privacy.{" "}
          <a href="/admin" className="underline hover:text-neutral-600">
            Admin
          </a>
        </p>
      </footer>
    </div>
  );
}
