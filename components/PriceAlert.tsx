"use client";

import { useState } from "react";

interface PriceAlertProps {
  productId: string;
  productName: string;
  currentPrice: number;
}

export default function PriceAlert({ productId, productName, currentPrice }: PriceAlertProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus(data.message === "already_subscribed" ? "already" : "success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-xs text-moss font-mono">
        <span>✓</span>
        <span>We'll email you if the price drops below ${currentPrice}</span>
      </div>
    );
  }

  if (status === "already") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted font-mono">
        <span>✓</span>
        <span>You're already tracking this price</span>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1.5 text-xs bg-sand border border-sand hover:border-muted px-3 py-1.5 rounded-lg transition-all font-mono text-ink"
>
    <span>🔔</span>
    <span>Track price</span>
    </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="bg-white/60 border border-sand rounded-lg px-3 py-1.5 text-xs outline-none focus:border-muted font-body placeholder:text-muted w-44"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-secondary text-xs py-1.5 px-3 whitespace-nowrap"
      >
        {status === "loading" ? "..." : "Alert me"}
      </button>
      <button
        type="button"
        onClick={() => setShowForm(false)}
        className="text-xs text-muted hover:text-ink"
      >
        ✕
      </button>
      {status === "error" && (
        <span className="text-xs text-rust">Try again</span>
      )}
    </form>
  );
}
