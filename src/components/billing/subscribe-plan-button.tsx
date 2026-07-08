"use client";

import { useState } from "react";

type SubscribePlanLabels = {
  freePlan: string;
  subscribe: string;
  openingCheckout: string;
  checkoutError: string;
};

export function SubscribePlanButton({
  planId,
  locale,
  disabled,
  labels,
}: {
  planId: string;
  locale: string;
  disabled?: boolean;
  labels: SubscribePlanLabels;
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
      if (!response.ok || !payload.url) throw new Error(payload.error ?? labels.checkoutError);
      window.location.href = payload.url;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : labels.checkoutError);
      setPending(false);
    }
  }

  return (
    <div className="subscribe-action" aria-live="polite">
      <button type="button" className="button button-primary" onClick={checkout} disabled={pending || disabled}>
        {disabled ? labels.freePlan : pending ? labels.openingCheckout : labels.subscribe}
      </button>
      {error ? <small className="error-text">{error}</small> : null}
    </div>
  );
}
