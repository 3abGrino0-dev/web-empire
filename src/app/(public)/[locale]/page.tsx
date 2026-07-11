import Link from "next/link";
import { notFound } from "next/navigation";

import { translate } from "@/localization/messages";
import {
  getActiveLocales,
  getLocaleByCode,
  getSiteIdentity,
  getUiMessages,
} from "@/localization/repository";
import {
  getActiveCategories,
  getActivePlans,
  getActiveTools,
} from "@/repositories/catalog";

const copy = {
  ar: {
    kicker: "WEB EMPIRE COMMAND",
    titleTop: "كل أداة تحتاجها.",
    titleBottom: "في نظام واحد.",
    body: "مجموعة أدوات متكاملة من الأدوات الذكية لمساعدتك على إنجاز عملك بدقة وسرعة.",
    search: "ابحث عن أداة...",
    primary: "ابدأ الآن",
    secondary: "استخدم الأدوات",
    activeTools: "أداة نشطة",
    sectors: "قطاعات رئيسية",
    accuracy: "جاهزية النظام",
    cost: "تكلفة التجربة",
    featured: "الأدوات الشائعة",
    useTool: "استخدم الأداة",
    identityTitle: "هوية WEB EMPIRE",
    identityBody: "نظام بصري داكن، هندسي، وملكي بدون رموز تقليدية. الشعار مبني كعلامة W/E داخل بوابة رقمية.",
    palette: "لوحة الألوان",
    dashboard: "لوحة التحكم",
    recent: "آخر التشغيلات",
    plan: "خطتك",
    credits: "رصيدك الحالي",
    runs: "إجمالي التشغيلات",
    categoryTitle: "التصنيفات",
    pricing: "الأسعار",
    final: "أدواتك. ذكاؤك. إمبراطوريتك.",
  },
  en: {
    kicker: "WEB EMPIRE COMMAND",
    titleTop: "Every tool you need.",
    titleBottom: "In one system.",
    body: "A connected set of intelligent tools built to help you finish work faster and with more control.",
    search: "Search for a tool...",
    primary: "Start now",
    secondary: "Use tools",
    activeTools: "active tools",
    sectors: "main sectors",
    accuracy: "system readiness",
    cost: "trial cost",
    featured: "Popular tools",
    useTool: "Use tool",
    identityTitle: "WEB EMPIRE Identity",
    identityBody: "A dark geometric imperial system without literal crowns. The mark is a W/E monogram inside a digital gate.",
    palette: "Color palette",
    dashboard: "Control dashboard",
    recent: "Recent runs",
    plan: "Your plan",
    credits: "Current credits",
    runs: "Total runs",
    categoryTitle: "Sectors",
    pricing: "Pricing",
    final: "Your tools. Your intelligence. Your empire.",
  },
};

const colorTokens = [
  ["EMPIRE BLACK", "#050713"],
  ["IMPERIAL VIOLET", "#7138F4"],
  ["CROWN GOLD", "#D6B56E"],
  ["SIGNAL CYAN", "#23C7E8"],
  ["EMPIRE IVORY", "#F4F1E8"],
];

const glyphs = ["%", "↗", "VAT", "◔", "∑", "÷", "×", "◎"];

function engineLabel(engine: string) {
  return engine.replaceAll("_", " ").toUpperCase();
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const [identity, messages, locales, tools, categories, plans] = await Promise.all([
    getSiteIdentity(locale),
    getUiMessages(locale),
    getActiveLocales(),
    getActiveTools(locale.code),
    getActiveCategories(locale.code),
    getActivePlans(locale.code),
  ]);

  const isArabic = locale.code === "ar";
  const t = isArabic ? copy.ar : copy.en;
  const prefix = `/${locale.code}`;
  const engines = Array.from(new Set(tools.map((tool) => tool.engine_type)));
  const featuredTools = (tools.filter((tool) => tool.is_featured).length
    ? tools.filter((tool) => tool.is_featured)
    : tools
  ).slice(0, 4);
  const quickTools = tools.slice(0, 3);
  const visibleCategories = categories.slice(0, 4);
  const visiblePlans = plans.slice(0, 3);

  return (
    <main className="imperial-home">
      <section className="imperial-hero">
        <div className="container imperial-hero-grid">
          <div className="imperial-hero-copy">
            <p className="imperial-kicker">{t.kicker}</p>
            <h1>
              <span>{t.titleTop}</span>
              <span>{t.titleBottom}</span>
            </h1>
            <p>{t.body}</p>

            <div className="imperial-search" aria-label={t.search}>
              <span>⌕</span>
              <strong>{t.search}</strong>
              <kbd>⌘K</kbd>
            </div>

            <div className="imperial-metrics">
              <div><strong>+{tools.length}</strong><small>{t.activeTools}</small></div>
              <div><strong>{categories.length}</strong><small>{t.sectors}</small></div>
              <div><strong>99.9%</strong><small>{t.accuracy}</small></div>
              <div><strong>0</strong><small>{t.cost}</small></div>
            </div>
          </div>

          <div className="imperial-cinematic-card" aria-hidden="true">
            <div className="imperial-sky">
              <div className="imperial-stars" />
              <div className="imperial-citadel">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="imperial-featured">
        <div className="container">
          <h2>{t.featured}</h2>
          <div className="imperial-tool-row">
            {featuredTools.map((tool, index) => (
              <Link href={`${prefix}/tools/${tool.slug}`} className="imperial-tool-card" key={tool.slug}>
                <div className="imperial-tool-icon">{glyphs[index % glyphs.length]}</div>
                <h3>{tool.title}</h3>
                <p>{tool.localizedDescription}</p>
                <span>{t.useTool}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="imperial-identity-section">
        <div className="container imperial-identity-grid">
          <aside className="imperial-brand-board">
            <p>{isArabic ? "الشعار" : "Logo"}</p>
            <img src="/brand/web-empire-mark.svg" alt="WEB EMPIRE" width="150" height="150" />
            <h2>WEB EMPIRE</h2>
            <strong>{isArabic ? "إمبراطورية الويب" : identity.siteName}</strong>
            <span>{t.final}</span>
          </aside>

          <div className="imperial-system-board">
            <p className="imperial-kicker">IMPERIAL SYSTEM</p>
            <h2>{t.identityTitle}</h2>
            <p>{t.identityBody}</p>

            <div className="imperial-palette" aria-label={t.palette}>
              {colorTokens.map(([name, color]) => (
                <div key={name}>
                  <span style={{ backgroundColor: color }} />
                  <small>{name}</small>
                  <strong>{color}</strong>
                </div>
              ))}
            </div>

            <div className="imperial-engine-strip">
              {engines.slice(0, 7).map((engine) => (
                <span key={engine}>{engineLabel(engine)}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="imperial-dashboard-section">
        <div className="container imperial-dashboard-grid">
          <div className="imperial-dashboard-nav">
            <img src="/brand/web-empire-mark.svg" alt="" width="42" height="42" />
            <strong>WEB EMPIRE</strong>
            <span>{t.dashboard}</span>
            <span>{translate(messages, "nav.tools")}</span>
            <span>{t.categoryTitle}</span>
            <span>{t.pricing}</span>
          </div>

          <div className="imperial-dashboard-panel">
            <div className="imperial-dashboard-top">
              <div>
                <p>{t.dashboard}</p>
                <small>{isArabic ? "نظرة عامة على استخدامك" : "Overview of your usage"}</small>
              </div>
              <strong>{locale.code.toUpperCase()}</strong>
            </div>

            <div className="imperial-dashboard-metrics">
              <div><span>{t.credits}</span><strong>300</strong></div>
              <div><span>{t.plan}</span><strong>{isArabic ? "مجاني" : "Free"}</strong></div>
              <div><span>{t.runs}</span><strong>5</strong></div>
            </div>

            <div className="imperial-runs">
              <h3>{t.recent}</h3>
              {quickTools.map((tool) => (
                <Link href={`${prefix}/tools/${tool.slug}`} key={tool.slug}>
                  <span>{tool.title}</span>
                  <strong>{isArabic ? "مكتمل" : "Completed"}</strong>
                  <small>0</small>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="imperial-categories" id="empire-sectors">
        <div className="container">
          <p className="imperial-kicker">{t.categoryTitle}</p>
          <div className="imperial-category-grid">
            {visibleCategories.map((category, index) => (
              <Link href={`${prefix}/tools?category=${category.slug}`} key={category.slug}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>

          <div className="imperial-plan-row">
            {visiblePlans.map((plan) => (
              <Link href={`${prefix}/pricing`} key={plan.slug}>
                <span>{plan.name}</span>
                <strong>{Number(plan.price_sar)} SAR</strong>
                <small>{Number(plan.monthly_credits).toLocaleString(locale.locale_code)} {translate(messages, "common.points")}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
