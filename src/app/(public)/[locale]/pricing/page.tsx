import { notFound } from "next/navigation";

import { SubscribePlanButton } from "@/components/billing/subscribe-plan-button";

import { translate } from "@/localization/messages";
import { getLocaleByCode, getUiMessages } from "@/localization/repository";
import { getActivePlans } from "@/repositories/catalog";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const [plans, messages] = await Promise.all([
    getActivePlans(locale.code),
    getUiMessages(locale),
  ]);

  return (
    <main className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">CREDITS</div>
            <h2>{translate(messages, "pricing.title")}</h2>
            <p>Provider cost stays internal. Members use a simple credit balance.</p>
          </div>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <article key={plan.id} className={`price-card ${plan.slug === "pro" ? "featured" : ""}`}>
              <h3>{plan.localizedName}</h3>
              <p>{plan.localizedDescription}</p>
              <div className="price">{plan.price_sar} <small>SAR</small></div>
              <h2>
                {Number(plan.monthly_credits).toLocaleString(locale.locale_code)} {translate(messages, "common.points")}
              </h2>
              <SubscribePlanButton
                planId={plan.id}
                locale={locale.code}
                disabled={plan.slug === "free"}
              />
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
