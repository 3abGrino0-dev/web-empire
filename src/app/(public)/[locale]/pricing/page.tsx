import Link from "next/link";
import { notFound } from "next/navigation";

import { translate } from "@/localization/messages";
import { getLocaleByCode, getUiMessages } from "@/localization/repository";
import { getActivePlans } from "@/repositories/catalog";

const labels = {
  ar: { title: "خطط بسيطة تناسب الجميع", body: "اختر الباقة المناسبة لاحتياجاتك وابدأ الاستفادة من أدوات الذكاء المتكاملة.", monthly: "شهريًا", start: "ابدأ الآن", choose: "اختر الباقة", compare: "مقارنة المزايا", faq: "أسئلة حول الخطط والتسعير؟" },
  en: { title: "Simple plans for everyone", body: "Choose the plan that fits your needs and start using the complete tool system.", monthly: "monthly", start: "Start now", choose: "Choose plan", compare: "Feature comparison", faq: "Questions about plans and pricing?" },
};

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const [plans, messages] = await Promise.all([getActivePlans(locale.code), getUiMessages(locale)]);
  const t = locale.code === "ar" ? labels.ar : labels.en;
  const prefix = `/${locale.code}`;

  return (
    <main className="we-page we-pricing-page">
      <section className="we-container">
        <div className="we-pricing-title">
          <h1><span className="we-gradient-text">{t.title}</span></h1>
          <p>{t.body}</p>
        </div>

        <div className="we-plan-grid">
          {plans.slice(0, 3).map((plan, index) => (
            <article className={`we-price-card ${index === 1 ? "featured" : ""}`} key={plan.slug}>
              <h2>{plan.name}</h2>
              <p>{plan.description}</p>
              <div className="we-price">{Number(plan.price_sar)} <span>SAR / {t.monthly}</span></div>
              <ul>
                <li>{Number(plan.monthly_credits).toLocaleString(locale.locale_code)} {translate(messages, "common.points")}</li>
                <li>{locale.code === "ar" ? "وصول إلى الأدوات" : "Tool access"}</li>
                <li>{locale.code === "ar" ? "سجل تشغيلات" : "Run history"}</li>
                <li>{locale.code === "ar" ? "دعم أساسي" : "Basic support"}</li>
              </ul>
              <Link href={`${prefix}/auth/register`} className={index === 1 ? "we-button-primary" : "we-button-ghost"}>
                {index === 1 ? t.start : t.choose}
              </Link>
            </article>
          ))}
        </div>

        <div className="we-compare-card">
          <h2>{t.compare}</h2>
          <table>
            <tbody>
              <tr><th>{locale.code === "ar" ? "عدد الأدوات" : "Tools"}</th><td>{locale.code === "ar" ? "محدود" : "Limited"}</td><td>{locale.code === "ar" ? "جميع الأدوات" : "All tools"}</td><td>{locale.code === "ar" ? "جميع الأدوات" : "All tools"}</td></tr>
              <tr><th>{locale.code === "ar" ? "سجل التشغيلات" : "Run history"}</th><td>{locale.code === "ar" ? "محدود" : "Limited"}</td><td>{locale.code === "ar" ? "غير محدود" : "Unlimited"}</td><td>{locale.code === "ar" ? "غير محدود" : "Unlimited"}</td></tr>
              <tr><th>{locale.code === "ar" ? "الدعم" : "Support"}</th><td>{locale.code === "ar" ? "أساسي" : "Basic"}</td><td>{locale.code === "ar" ? "أولوية" : "Priority"}</td><td>{locale.code === "ar" ? "مخصص" : "Dedicated"}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="we-cta-strip">
          <h2>{t.faq}</h2>
          <Link href={`${prefix}/contact`} className="we-button-ghost">{locale.code === "ar" ? "تواصل معنا" : "Contact us"}</Link>
        </div>
      </section>
    </main>
  );
}
