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

  const isArabic = locale.code === "ar";

  return (
    <main className="editorial-pricing-page">
      <section className="editorial-page-hero">
        <div className="container editorial-page-hero-grid">
          <div>
            <p className="empire-section-kicker">CREDITS / PLANS</p>
            <h1 className="editorial-page-title">{translate(messages, "pricing.title")}</h1>
          </div>
          <p className="editorial-page-intro">
            {isArabic
              ? "رصيد واضح للأدوات المدفوعة. تكلفة المزود تبقى داخل النظام، وأنت تتعامل مع النقاط."
              : "A clear balance for paid tools. Provider cost stays internal; members work with credits."}
          </p>
        </div>
      </section>

      <section className="container editorial-pricing-grid">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`editorial-price-card ${plan.slug === "pro" ? "featured" : ""}`}
          >
            <span className="empire-capability-code">{plan.slug.toUpperCase()}</span>
            <h3>{plan.localizedName}</h3>
            <p>{plan.localizedDescription}</p>

            <div className="editorial-price-value">
              <strong>{plan.price_sar}</strong>
              <span>SAR</span>
            </div>

            <div className="editorial-credit-line">
              {Number(plan.monthly_credits).toLocaleString(locale.locale_code)}{" "}
              {translate(messages, "common.points")}
            </div>

            <SubscribePlanButton
              planId={plan.id}
              locale={locale.code}
              disabled={plan.slug === "free"}
            />
          </article>
        ))}
      </section>
    </main>
  );
}
