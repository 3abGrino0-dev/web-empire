import { SubscribePlanButton } from "@/components/billing/subscribe-plan-button";

type AccessPlan = {
  id: string;
  slug: string;
  localizedName: string;
  localizedDescription: string;
  price_sar: number;
  monthly_credits: number;
};

type PricingCopy = {
  kicker: string;
  title: string;
  body: string;
  levelsLabel: string;
  sequenceTitle: string;
  sequenceChoose: string;
  sequenceCredits: string;
  sequenceRun: string;
  emptyTitle: string;
  emptyBody: string;
  action: {
    freePlan: string;
    subscribe: string;
    openingCheckout: string;
    checkoutError: string;
  };
};

function planRhythmClass(index: number, total: number): string {
  if (total <= 1) return "layout-single";
  if (total === 2) return index === 0 ? "layout-two-major" : "layout-two-minor";

  const cycle = index % 4;
  if (cycle === 0) return "layout-a";
  if (cycle === 1) return "layout-b";
  if (cycle === 2) return "layout-c";
  return "layout-d";
}

export function PricingAccessSystem({
  locale,
  localeNumberFormat,
  plans,
  pointsLabel,
  copy,
}: {
  locale: string;
  localeNumberFormat: string;
  plans: readonly AccessPlan[];
  pointsLabel: string;
  copy: PricingCopy;
}) {
  const count = String(plans.length).padStart(2, "0");

  return (
    <main className="empire-access-page editorial-pricing-page">
      <header className="empire-access-page-hero" aria-labelledby="empire-access-page-title">
        <div className="container empire-access-page-hero-grid">
          <div className="empire-access-page-heading">
            <p className="empire-section-kicker">{copy.kicker}</p>
            <h1 id="empire-access-page-title" className="empire-access-page-title">
              {copy.title}
            </h1>
          </div>

          <div className="empire-access-page-side">
            <p className="empire-access-page-body">{copy.body}</p>
            <p className="empire-access-page-count" aria-label={`${count} ${copy.levelsLabel}`}>
              <strong dir="ltr">{count}</strong>
              <span>{copy.levelsLabel}</span>
            </p>
          </div>
        </div>
      </header>

      <section className="empire-access-page-flow" aria-label={copy.sequenceTitle}>
        <div className="container empire-access-page-flow-shell">
          <p className="empire-access-page-flow-title">{copy.sequenceTitle}</p>
          <ol className="empire-access-page-flow-list">
            <li>
              <span>01</span>
              <b>{copy.sequenceChoose}</b>
            </li>
            <li>
              <span>02</span>
              <b>{copy.sequenceCredits}</b>
            </li>
            <li>
              <span>03</span>
              <b>{copy.sequenceRun}</b>
            </li>
          </ol>
        </div>
      </section>

      {!plans.length ? (
        <section className="container empire-access-empty" aria-live="polite">
          <h2>{copy.emptyTitle}</h2>
          <p>{copy.emptyBody}</p>
        </section>
      ) : (
        <section className="container empire-access-atlas-section" aria-label={copy.levelsLabel}>
          <ol className="empire-access-atlas">
            {plans.map((plan, index) => (
              <li key={plan.id} className={`empire-access-plan ${planRhythmClass(index, plans.length)} ${plan.slug === "pro" ? "is-pro-rhythm" : ""}`}>
                <article>
                  <p className="empire-access-plan-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <p className="empire-access-plan-code" dir="ltr">
                    {plan.slug.toUpperCase()}
                  </p>

                  <h2 className="empire-access-plan-name">{plan.localizedName}</h2>

                  <p className="empire-access-plan-credits" aria-label={`${Number(plan.monthly_credits).toLocaleString(localeNumberFormat)} ${pointsLabel}`}>
                    {Number(plan.monthly_credits).toLocaleString(localeNumberFormat)}
                  </p>

                  <p className="empire-access-plan-points">{pointsLabel}</p>

                  <p className="empire-access-plan-description">{plan.localizedDescription}</p>

                  <p className="empire-access-plan-price" dir="ltr">
                    <strong>{Number(plan.price_sar).toLocaleString(localeNumberFormat)}</strong>
                    <span>SAR</span>
                  </p>

                  <div className="empire-access-plan-action">
                    <SubscribePlanButton
                      planId={plan.id}
                      locale={locale}
                      disabled={plan.slug === "free"}
                      labels={copy.action}
                    />
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
