import Link from "next/link";
import { notFound } from "next/navigation";

import { ToolCard } from "@/components/tool-card";
import { translate } from "@/localization/messages";
import {
  getActiveLocales,
  getLocaleByCode,
  getSiteIdentity,
  getUiMessages,
} from "@/localization/repository";
import { getActivePlans, getActiveTools } from "@/repositories/catalog";

const copyByLocale = {
  ar: {
    heroTop: "منصة أدوات، وليست قالب SaaS آخر",
    heroLineOne: "إمبراطورية",
    heroLineTwo: "الويب",
    heroStatement: "أدوات ذكية. نتائج حقيقية.",
    heroBody: "مكان واحد للحساب، والتحويل، والتحليل، والأتمتة، والذكاء الاصطناعي. اختر أداة، أدخل ما لديك، وخذ نتيجة قابلة للاستخدام.",
    seeHow: "شاهد كيف تعمل",
    toolsMetric: "أداة منشورة",
    enginesMetric: "محركات تشغيل",
    localesMetric: "لغات متاحة",
    plansMetric: "خطط فعالة",
    showcaseKicker: "أدوات حقيقية",
    showcaseTitle: "شاهد ما تستطيع الإمبراطورية فعله.",
    showcaseBody: "كل بطاقة تقود إلى أداة تعمل داخل نفس المنصة. لا عروض وهمية ولا أرقام عملاء مختلقة.",
    allTools: "عرض كل الأدوات",
    capabilityKicker: "قدرات المنصة",
    capabilityTitle: "إمبراطورية واحدة. قدرات بلا حدود.",
    capabilityBody: "ليست كل أداة ذكاء اصطناعي. المحرك يتغير حسب المهمة، والنتيجة هي ما يهم.",
    processKicker: "رحلة الاستخدام",
    processTitle: "خمس خطوات بينك وبين النتيجة.",
    engineKicker: "داخل المحرك",
    engineTitle: "ليس كل ما نفعله ذكاءً اصطناعيًا.",
    engineBody: "نستخدم الحساب عندما تكفي المعادلة، والتحويل عندما يكفي النص، والاتصال عندما تحتاج خدمة خارجية، والـAI عندما يكون هو الأداة الصحيحة فعلًا.",
    pricingKicker: "النقاط والخطط",
    pricingTitle: "ابدأ صغيرًا. وسّع استخدامك عندما تحتاج.",
    pricingBody: "الخطط الحقيقية من نظام إمبراطورية الويب، مع رصيد نقاط واضح للأدوات المدفوعة.",
    pricingLink: "شاهد كل الخطط",
    finalTitle: "مستعد تنجز أكثر؟",
    finalBody: "ابدأ من أداة واحدة.",
    enter: "ادخل الإمبراطورية",
    steps: [
      ["01", "اختر", "اختر الأداة المناسبة للمهمة."],
      ["02", "أدخل", "قدّم البيانات أو المحتوى الذي تحتاجه."],
      ["03", "شغّل", "دع المحرك المناسب ينفذ المهمة."],
      ["04", "راجع", "اقرأ النتيجة وتأكد أنها تخدم هدفك."],
      ["05", "أنجز", "استخدم الناتج مباشرة في عملك."],
    ],
    capabilities: [
      ["CALCULATE", "احسب", "معادلات وأدوات رقمية سريعة ودقيقة."],
      ["CREATE", "أنشئ", "توليد محتوى ومخرجات منظمة عند الحاجة."],
      ["TRANSFORM", "حوّل", "إعادة تشكيل النصوص والبيانات إلى صيغة أفضل."],
      ["ANALYZE", "حلّل", "استخراج معنى أو بنية أو نتيجة قابلة للمراجعة."],
      ["AUTOMATE", "أتمت", "سير عمل متعدد الخطوات بدل العمل المتكرر."],
      ["CONNECT", "اتصل", "ربط APIs وWebhooks عبر اتصالات موثوقة."],
    ],
  },
  en: {
    heroTop: "A tool platform, not another SaaS template",
    heroLineOne: "WEB",
    heroLineTwo: "EMPIRE",
    heroStatement: "Smart tools. Real outcomes.",
    heroBody: "One place to calculate, transform, analyze, automate and use AI. Pick a tool, provide the input and leave with an output you can use.",
    seeHow: "See how it works",
    toolsMetric: "published tools",
    enginesMetric: "runtime engines",
    localesMetric: "available locales",
    plansMetric: "active plans",
    showcaseKicker: "Real tools",
    showcaseTitle: "A taste of what the Empire can do.",
    showcaseBody: "Every card leads to a working tool inside the same platform. No fake customer numbers and no demo-only promises.",
    allTools: "Explore all tools",
    capabilityKicker: "Platform capabilities",
    capabilityTitle: "One Empire. Many capabilities.",
    capabilityBody: "Not every tool is AI. The engine changes with the job; the useful outcome is what matters.",
    processKicker: "The experience",
    processTitle: "Five steps between you and the result.",
    engineKicker: "Inside the engine",
    engineTitle: "Not everything we do is AI.",
    engineBody: "We calculate when a formula is enough, transform when text rules are enough, connect when an external service is needed and use AI when AI is actually the right tool.",
    pricingKicker: "Credits and plans",
    pricingTitle: "Start small. Scale when the work asks for more.",
    pricingBody: "Real Web Empire plans with a clear credit balance for paid tools.",
    pricingLink: "See all plans",
    finalTitle: "Ready to do more?",
    finalBody: "Start with one tool.",
    enter: "Enter the Empire",
    steps: [
      ["01", "Choose", "Pick the tool that matches the job."],
      ["02", "Input", "Provide the data or content you have."],
      ["03", "Run", "Let the right runtime engine do the work."],
      ["04", "Review", "Read the result and check the outcome."],
      ["05", "Finish", "Use the output directly in your work."],
    ],
    capabilities: [
      ["CALCULATE", "Calculate", "Fast, deterministic numeric tools and formulas."],
      ["CREATE", "Create", "Generate structured content and outputs when needed."],
      ["TRANSFORM", "Transform", "Reshape text and data into a more useful form."],
      ["ANALYZE", "Analyze", "Extract meaning, structure or a reviewable result."],
      ["AUTOMATE", "Automate", "Multi-step workflows instead of repetitive work."],
      ["CONNECT", "Connect", "Trusted API and webhook connections."],
    ],
  },
} as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const [tools, plans, locales, messages, identity] = await Promise.all([
    getActiveTools(locale.code),
    getActivePlans(locale.code),
    getActiveLocales(),
    getUiMessages(locale),
    getSiteIdentity(locale),
  ]);

  const copy = locale.code === "ar" ? copyByLocale.ar : copyByLocale.en;
  const featuredTools = tools.filter((tool) => tool.is_featured);
  const showcase = (featuredTools.length ? featuredTools : tools).slice(0, 6);
  const engineCount = new Set(tools.map((tool) => tool.engine_type)).size;
  const previewPlans = plans.slice(0, 3);

  return (
    <main className="empire-home">
      <section className="empire-hero">
        <div className="container empire-hero-grid">
          <div className="empire-hero-copy">
            <p className="empire-kicker">{copy.heroTop}</p>
            <h1 className="empire-hero-title" aria-label={identity.siteName}>
              <span>{copy.heroLineOne}</span>
              <span>{copy.heroLineTwo}</span>
            </h1>

            <div className="empire-hero-summary">
              <p className="empire-hero-statement">{copy.heroStatement}</p>
              <div>
                <p className="empire-hero-description">{copy.heroBody}</p>
                <div className="empire-actions">
                  <Link href={`/${locale.code}/tools`} className="button button-primary">
                    {translate(messages, "home.explore")}
                  </Link>
                  <a href="#empire-process" className="button button-ghost">
                    {copy.seeHow}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="empire-hero-collage" aria-hidden="true">
            <div className="empire-demo-card empire-demo-main">
              <small>FORMULA / LIVE TOOL</small>
              <h3>{locale.code === "ar" ? "حاسبة النسبة المئوية" : "Percentage calculator"}</h3>
              <div className="empire-demo-equation">
                <span>25</span>
                <b>÷</b>
                <span>200</span>
              </div>
              <div className="empire-demo-result">
                <small>{locale.code === "ar" ? "النتيجة" : "RESULT"}</small>
                <strong>12.5%</strong>
              </div>
            </div>
            <div className="empire-demo-card empire-mini-card empire-mini-ai">
              <small>AI</small>
              <strong>{locale.code === "ar" ? "مخرجات منظمة" : "Structured output"}</strong>
            </div>
            <div className="empire-demo-card empire-mini-card empire-mini-flow">
              <small>WORKFLOW</small>
              <strong>{locale.code === "ar" ? "خطوات مترابطة" : "Connected steps"}</strong>
            </div>
            <div className="empire-demo-card empire-mini-card empire-mini-credit">
              <small>CREDITS</small>
              <strong>0 / FREE</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="empire-proof" aria-label="Platform facts">
        <div className="container empire-proof-grid">
          <div className="empire-proof-item"><strong>{tools.length}</strong><span>{copy.toolsMetric}</span></div>
          <div className="empire-proof-item"><strong>{engineCount}</strong><span>{copy.enginesMetric}</span></div>
          <div className="empire-proof-item"><strong>{locales.length}</strong><span>{copy.localesMetric}</span></div>
          <div className="empire-proof-item"><strong>{plans.length}</strong><span>{copy.plansMetric}</span></div>
        </div>
      </section>

      <section className="empire-section empire-section-light">
        <div className="container">
          <div className="empire-section-head">
            <div>
              <p className="empire-section-kicker">{copy.showcaseKicker}</p>
              <h2 className="empire-display">{copy.showcaseTitle}</h2>
            </div>
            <div>
              <p>{copy.showcaseBody}</p>
              <Link href={`/${locale.code}/tools`} className="empire-section-link">
                {copy.allTools} <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          <div className="empire-showcase-grid">
            {showcase.map((tool) => (
              <ToolCard key={tool.id} tool={tool} locale={locale.code} messages={messages} />
            ))}
          </div>
        </div>
      </section>

      <section className="empire-section empire-section-dark">
        <div className="container">
          <div className="empire-section-head">
            <div>
              <p className="empire-section-kicker">{copy.capabilityKicker}</p>
              <h2 className="empire-display">{copy.capabilityTitle}</h2>
            </div>
            <p>{copy.capabilityBody}</p>
          </div>

          <div className="empire-capabilities">
            {copy.capabilities.map(([code, title, description]) => (
              <article className="empire-capability" key={code}>
                <span className="empire-capability-code">{code}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="empire-process" className="empire-section empire-process">
        <div className="container">
          <p className="empire-section-kicker">{copy.processKicker}</p>
          <h2 className="empire-display empire-process-title">{copy.processTitle}</h2>
          <div className="empire-process-grid">
            {copy.steps.map(([number, title, description]) => (
              <article className="empire-step" key={number}>
                <strong className="empire-step-number">{number}</strong>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="empire-section empire-section-dark">
        <div className="container empire-engine-layout">
          <div className="empire-engine-copy">
            <p className="empire-section-kicker">{copy.engineKicker}</p>
            <h2 className="empire-display">{copy.engineTitle}</h2>
            <p>{copy.engineBody}</p>
          </div>

          <div className="empire-engine-stack">
            {[
              ["01", "FORMULA", "DETERMINISTIC"],
              ["02", "TEXT TRANSFORM", "RULE BASED"],
              ["03", "AI TEXT", "PROVIDER ENGINE"],
              ["04", "AI STRUCTURED", "SCHEMA OUTPUT"],
              ["05", "HTTP / WEBHOOK", "CONNECTED"],
              ["06", "WORKFLOW", "MULTI STEP"],
            ].map(([number, title, label]) => (
              <div className="empire-engine-row" key={title}>
                <span>{number}</span>
                <strong>{title}</strong>
                <em>{label}</em>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="empire-section empire-section-light">
        <div className="container">
          <div className="empire-section-head">
            <div>
              <p className="empire-section-kicker">{copy.pricingKicker}</p>
              <h2 className="empire-display">{copy.pricingTitle}</h2>
            </div>
            <div>
              <p>{copy.pricingBody}</p>
              <Link href={`/${locale.code}/pricing`} className="empire-section-link">
                {copy.pricingLink} <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          <div className="empire-pricing-grid">
            {previewPlans.map((plan) => (
              <article
                className={`empire-plan ${plan.slug === "pro" ? "is-featured" : ""}`}
                key={plan.id}
              >
                <div className="empire-plan-label">
                  <span>{plan.slug}</span>
                  <span>{Number(plan.monthly_credits).toLocaleString(locale.locale_code)} {translate(messages, "common.points")}</span>
                </div>
                <h3>{plan.localizedName}</h3>
                <p>{plan.localizedDescription}</p>
                <div className="empire-plan-price">
                  <strong>{plan.price_sar}</strong>
                  <span>SAR</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="empire-final">
        <div className="container empire-final-inner">
          <div>
            <p className="empire-section-kicker">{copy.finalBody}</p>
            <h2>{copy.finalTitle}</h2>
          </div>
          <div className="empire-actions">
            <Link href={`/${locale.code}/tools`} className="button button-primary">{copy.enter}</Link>
            <Link href={`/${locale.code}/pricing`} className="button button-ghost">{translate(messages, "home.plans")}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
