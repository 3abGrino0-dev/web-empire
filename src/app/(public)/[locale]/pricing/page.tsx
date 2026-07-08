import { notFound } from "next/navigation";

import { SubscribePlanButton } from "@/components/billing/subscribe-plan-button";
import { translate } from "@/localization/messages";
import { getLocaleByCode, getUiMessages } from "@/localization/repository";
import { getActivePlans } from "@/repositories/catalog";

const intro: Record<string, { kicker: string; title: string; body: string }> = {
  ar: { kicker: "الخطط والنقاط", title: "ادفع للاستخدام. لا للضوضاء.", body: "رصيد واضح للأدوات المدفوعة، مع إبقاء تكلفة المزود داخل النظام." },
  en: { kicker: "PLANS & CREDITS", title: "Pay for usage. Not noise.", body: "A clear credit balance for paid tools while provider cost stays inside the system." },
  fr: { kicker: "OFFRES & CRÉDITS", title: "Payez pour l’usage. Pas pour le bruit.", body: "Un solde de crédits clair pour les outils payants." },
  tr: { kicker: "PLANLAR & KREDİLER", title: "Kullanıma öde. Gürültüye değil.", body: "Ücretli araçlar için açık bir kredi bakiyesi." },
  ur: { kicker: "پلان اور کریڈٹس", title: "استعمال کے لیے ادائیگی کریں۔ شور کے لیے نہیں۔", body: "ادائیگی والے ٹولز کے لیے واضح کریڈٹ بیلنس۔" },
};

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();
  const [plans, messages] = await Promise.all([getActivePlans(locale.code), getUiMessages(locale)]);
  const copy = intro[locale.code] ?? intro.en;

  return (
    <main className="editorial-pricing-page">
      <section className="editorial-page-hero"><div className="container editorial-page-hero-grid"><div><p className="empire-section-kicker">{copy.kicker}</p><h1 className="editorial-page-title">{copy.title}</h1></div><p className="editorial-page-intro">{copy.body}</p></div></section>
      <section className="container editorial-pricing-grid">
        {plans.map((plan) => <article key={plan.id} className={`editorial-price-card ${plan.slug === "pro" ? "featured" : ""}`}><span className="empire-capability-code">{plan.slug.toUpperCase()}</span><h3>{plan.localizedName}</h3><p>{plan.localizedDescription}</p><div className="editorial-price-value"><strong>{plan.price_sar}</strong><span>SAR</span></div><div className="editorial-credit-line">{Number(plan.monthly_credits).toLocaleString(locale.locale_code)} {translate(messages, "common.points")}</div><SubscribePlanButton planId={plan.id} locale={locale.code} disabled={plan.slug === "free"} /></article>)}
      </section>
    </main>
  );
}
