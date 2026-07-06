"use client";

import { useState } from "react";

export function SubscribePlanButton({
  planId,
  locale,
  disabled,
}: {
  planId: string;
  locale: string;
  disabled?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, locale }),
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (response.status === 401) {
        window.location.href = `/${locale}/auth/login`;
        return;
      }
      if (!response.ok || !payload.url) throw new Error(payload.error ?? "تعذر بدء الدفع");
      window.location.href = payload.url;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر بدء الدفع");
      setPending(false);
    }
  }

  return (
    <div className="subscribe-action">
      <button type="button" className="button button-primary" onClick={checkout} disabled={pending || disabled}>
        {disabled ? "الخطة المجانية" : pending ? "جاري فتح الدفع..." : "اشترك الآن"}
      </button>
      {error ? <small className="error-text">{error}</small> : null}
    </div>
  );
}
