import Link from "next/link";

type PricingPreviewPlan = {
  key: string;
  slug: string;
  name: string;
  description: string;
  monthlyCredits: number;
  priceSar: number;
  featured: boolean;
};

function planLayoutClass(index: number, total: number): string {
  if (total <= 1) return "layout-single";
  if (total === 2) return index === 0 ? "layout-two-major" : "layout-two-minor";
  if (index === 0) return "layout-first";
  if (index === 1) return "layout-middle";
  return "layout-last";
}

export function PricingPreview({
  kicker,
  title,
  body,
  linkLabel,
  locale,
  pointsLabel,
  plans,
}: {
  kicker: string;
  title: string;
  body: string;
  linkLabel: string;
  locale: string;
  pointsLabel: string;
  plans: readonly PricingPreviewPlan[];
}) {
  if (!plans.length) return null;

  return (
    <section className="empire-section empire-access-preview" aria-labelledby="empire-access-title">
      <div className="container empire-access-shell">
        <header className="empire-access-intro">
          <p className="empire-section-kicker">{kicker}</p>
          <h2 id="empire-access-title" className="empire-access-title">
            {title}
          </h2>
          <div className="empire-access-support">
            <p className="empire-access-body">{body}</p>
            <Link href={`/${locale}/pricing`} className="empire-section-link empire-access-link">
              {linkLabel}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </header>

        <div className="empire-access-grid" role="list">
          {plans.map((plan, index) => (
            <article
              key={plan.key}
              role="listitem"
              className={`empire-access-plan ${planLayoutClass(index, plans.length)} ${plan.featured ? "is-featured" : ""}`}
            >
              <p className="empire-access-slug" dir="ltr">
                {plan.slug}
              </p>

              <div className="empire-access-credits" aria-label={`${Number(plan.monthlyCredits).toLocaleString(locale)} ${pointsLabel}`}>
                <strong>{Number(plan.monthlyCredits).toLocaleString(locale)}</strong>
                <span className="empire-access-points">{pointsLabel}</span>
              </div>

              <h3>{plan.name}</h3>
              <p className="empire-access-description">{plan.description}</p>

              <p className="empire-access-price" dir="ltr">
                <strong>{plan.priceSar}</strong>
                <span>SAR</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
