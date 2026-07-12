import Link from "next/link";
import { notFound } from "next/navigation";

import { webEmpireLightAssets } from "@/brand/web-empire-light-assets";
import { translate } from "@/localization/messages";
import { getLocaleByCode, getUiMessages } from "@/localization/repository";
import { getActivePlans } from "@/repositories/catalog";

const labels = {
  ar: {
    title: "خطط واضحة لنمو أعمالك",
    body: "اختر الباقة التي تناسب حجم العمل لديك وابدأ تشغيل أدوات Web Empire بكفاءة أعلى.",
    monthly: "شهريًا",
    start: "ابدأ الآن",
    choose: "اختر الباقة",
    compare: "مقارنة المزايا",
    faq: "أسئلة حول الخطط والتسعير؟",
    mostSelected: "الأكثر اختيارًا",
    points: "عدد النقاط",
    toolsAccess: "وصول الأدوات",
    runHistory: "سجل التشغيلات",
    support: "الدعم",
    contact: "تواصل معنا",
    basicSupport: "أساسي",
    prioritySupport: "أولوية",
    dedicatedSupport: "مخصص",
    limited: "محدود",
    allTools: "جميع الأدوات",
    unlimited: "غير محدود",
    feature: "الميزة",
  },
  en: {
    title: "Clear plans for real growth",
    body: "Pick a plan that matches your workload and run Web Empire tools with stronger capacity.",
    monthly: "monthly",
    start: "Start now",
    choose: "Choose plan",
    compare: "Feature comparison",
    faq: "Questions about plans and pricing?",
    mostSelected: "Most selected",
    points: "Credits",
    toolsAccess: "Tool access",
    runHistory: "Run history",
    support: "Support",
    contact: "Contact us",
    basicSupport: "Basic",
    prioritySupport: "Priority",
    dedicatedSupport: "Dedicated",
    limited: "Limited",
    allTools: "All tools",
    unlimited: "Unlimited",
    feature: "Feature",
  },
};

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const [plans, messages] = await Promise.all([getActivePlans(locale.code), getUiMessages(locale)]);
  const t = locale.code === "ar" ? labels.ar : labels.en;
  const prefix = `/${locale.code}`;
  const mainPlans = plans.slice(0, 3);

  return (
    <main className="we-page we-pricing-page">
      <section className="we-container we-pricing-shell">
        <div className="we-pricing-hero">
          <div className="we-pricing-copy">
            <h1>
              <span className="we-gradient-text">{t.title}</span>
            </h1>
            <p>{t.body}</p>
          </div>
          <div className="we-pricing-visual" aria-hidden="true">
            <img src={webEmpireLightAssets.toolsVisual} alt="" />
          </div>
        </div>

        <div className="we-plan-grid">
          {mainPlans.map((plan, index) => (
            <article className={`we-price-card ${index === 1 ? "featured" : ""}`} key={plan.slug}>
              {index === 1 ? <div className="we-plan-badge">{t.mostSelected}</div> : null}
              <h2>{plan.name}</h2>
              <p>{plan.description}</p>
              <div className="we-price">
                {Number(plan.price_sar)}
                <span>SAR / {t.monthly}</span>
              </div>
              <ul>
                <li>
                  {t.points}: {Number(plan.monthly_credits).toLocaleString(locale.locale_code)} {translate(messages, "common.points")}
                </li>
                <li>{t.toolsAccess}: {index === 0 ? t.limited : t.allTools}</li>
                <li>{t.runHistory}: {index === 0 ? t.limited : t.unlimited}</li>
                <li>
                  {t.support}: {index === 0 ? t.basicSupport : index === 1 ? t.prioritySupport : t.dedicatedSupport}
                </li>
              </ul>
              <Link
                href={`${prefix}/auth/register`}
                className={`we-pricing-card-action ${index === 1 ? "we-button-primary" : "we-button-ghost"}`}
              >
                {index === 1 ? t.start : t.choose}
              </Link>
            </article>
          ))}
        </div>

        <div className="we-compare-card">
          <h2>{t.compare}</h2>
          <div className="we-pricing-compare-scroll">
            <table>
              <thead>
                <tr>
                  <th>{t.feature}</th>
                  <th>{mainPlans[0]?.name ?? "-"}</th>
                  <th>{mainPlans[1]?.name ?? "-"}</th>
                  <th>{mainPlans[2]?.name ?? "-"}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>{t.toolsAccess}</th>
                  <td>{t.limited}</td>
                  <td>{t.allTools}</td>
                  <td>{t.allTools}</td>
                </tr>
                <tr>
                  <th>{t.runHistory}</th>
                  <td>{t.limited}</td>
                  <td>{t.unlimited}</td>
                  <td>{t.unlimited}</td>
                </tr>
                <tr>
                  <th>{t.support}</th>
                  <td>{t.basicSupport}</td>
                  <td>{t.prioritySupport}</td>
                  <td>{t.dedicatedSupport}</td>
                </tr>
                <tr>
                  <th>{t.points}</th>
                  <td>{mainPlans[0] ? Number(mainPlans[0].monthly_credits).toLocaleString(locale.locale_code) : "-"}</td>
                  <td>{mainPlans[1] ? Number(mainPlans[1].monthly_credits).toLocaleString(locale.locale_code) : "-"}</td>
                  <td>{mainPlans[2] ? Number(mainPlans[2].monthly_credits).toLocaleString(locale.locale_code) : "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="we-cta-strip">
          <h2>{t.faq}</h2>
          <Link href={`${prefix}/contact`} className="we-button-ghost">{t.contact}</Link>
        </div>
      </section>
    </main>
  );
}
