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

const commandCopy = {
  ar: {
    kicker: "WEB EMPIRE COMMAND",
    title: "كل أداة تحتاجها. في نظام واحد.",
    body:
      "احسب، قارن، شغّل، وراجع النتيجة من واجهة واحدة مبنية كلوحة أوامر رقمية.",
    search: "ابحث عن أداة...",
    primary: "ابدأ من الأدوات",
    secondary: "شاهد التصنيفات",
    live: "LIVE SYSTEM",
    tools: "أداة نشطة",
    categories: "قطاعات",
    engines: "محركات",
    locales: "لغات",
    trending: "أوامر سريعة",
    explore: "استكشف الإمبراطورية",
    featured: "أدوات جاهزة للتشغيل",
    command: "COMMAND",
    free: "FREE",
    run: "تشغيل",
    sectors: "قطاعات الإمبراطورية",
    pricing: "النقاط والخطط",
    pricingBody: "ابدأ بالأدوات المجانية، ووسّع رصيدك عندما تحتاج.",
    finalTitle: "ادخل. اختر. شغّل.",
    finalBody: "Web Empire يتحول الآن إلى نظام أدوات حقيقي، وليس صفحة تسويقية طويلة.",
  },
  en: {
    kicker: "WEB EMPIRE COMMAND",
    title: "Every tool you need. In one system.",
    body:
      "Calculate, compare, run, and review results from one digital command surface.",
    search: "Search for a tool...",
    primary: "Start with tools",
    secondary: "View sectors",
    live: "LIVE SYSTEM",
    tools: "active tools",
    categories: "sectors",
    engines: "engines",
    locales: "locales",
    trending: "Quick commands",
    explore: "Explore the Empire",
    featured: "Tools ready to run",
    command: "COMMAND",
    free: "FREE",
    run: "Run",
    sectors: "Empire sectors",
    pricing: "Plans and credits",
    pricingBody: "Start with free tools. Add more capacity when you need it.",
    finalTitle: "Enter. Choose. Run.",
    finalBody: "Web Empire is now a real tool system, not a long marketing page.",
  },
};

const glyphs = ["%", "↗", "◎", "∑", "₊", "÷", "×", "⌁"];

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
  const copy = isArabic ? commandCopy.ar : commandCopy.en;
  const prefix = `/${locale.code}`;

  const activeTools = tools;
  const featuredTools = tools.filter((tool) => tool.is_featured).slice(0, 8);
  const showcase = (featuredTools.length ? featuredTools : tools).slice(0, 8);
  const quickTools = tools.slice(0, 6);
  const engines = Array.from(new Set(tools.map((tool) => tool.engine_type)));
  const visibleCategories = categories.slice(0, 6);
  const visiblePlans = plans.slice(0, 3);

  return (
    <main className="command-home">
      <section className="command-hero empire-grid-surface">
        <div className="container command-hero-grid">
          <div className="command-hero-copy">
            <p className="empire-command-kicker">{copy.kicker}</p>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>

            <div className="command-search-shell" aria-label={copy.search}>
              <span>⌘K</span>
              <strong>{copy.search}</strong>
              <small>{copy.live}</small>
            </div>

            <div className="command-hero-actions">
              <Link href={`${prefix}/tools`} className="button button-primary">
                {copy.primary}
              </Link>
              <a href="#empire-sectors" className="button button-ghost">
                {copy.secondary}
              </a>
            </div>
          </div>

          <div className="command-panel" aria-label="Web Empire live command panel">
            <div className="command-panel-top">
              <span />
              <span />
              <span />
              <strong>WEB EMPIRE</strong>
            </div>

            <div className="command-metric-grid">
              <div>
                <strong>{activeTools.length}</strong>
                <small>{copy.tools}</small>
              </div>
              <div>
                <strong>{categories.length}</strong>
                <small>{copy.categories}</small>
              </div>
              <div>
                <strong>{engines.length}</strong>
                <small>{copy.engines}</small>
              </div>
              <div>
                <strong>{locales.length}</strong>
                <small>{copy.locales}</small>
              </div>
            </div>

            <div className="command-live-card">
              <small>{copy.trending}</small>
              <div className="command-chip-row">
                {quickTools.map((tool, index) => (
                  <Link key={tool.slug} href={`${prefix}/tools/${tool.slug}`}>
                    <span>{glyphs[index % glyphs.length]}</span>
                    {tool.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="command-strip">
        <div className="container command-strip-grid">
          {engines.slice(0, 6).map((engine) => (
            <span key={engine}>{engineLabel(engine)}</span>
          ))}
        </div>
      </section>

      <section className="command-section" id="empire-sectors">
        <div className="container">
          <div className="command-section-heading">
            <p className="empire-command-kicker">{copy.sectors}</p>
            <h2>{copy.explore}</h2>
          </div>

          <div className="command-sector-grid">
            {visibleCategories.map((category, index) => (
              <Link
                key={category.slug}
                href={`${prefix}/tools?category=${category.slug}`}
                className="command-sector-card"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="command-section command-section-dark">
        <div className="container">
          <div className="command-section-heading">
            <p className="empire-command-kicker">{copy.featured}</p>
            <h2>{copy.command}</h2>
          </div>

          <div className="command-tool-grid">
            {showcase.map((tool, index) => (
              <Link
                key={tool.slug}
                href={`${prefix}/tools/${tool.slug}`}
                className="command-tool-card"
              >
                <div className="command-tool-glyph">
                  {glyphs[index % glyphs.length]}
                </div>
                <div>
                  <small>{engineLabel(tool.engine_type)}</small>
                  <h3>{tool.title}</h3>
                  <p>{tool.localizedDescription}</p>
                </div>
                <footer>
                  <span>{tool.pricing_mode === "free" ? copy.free : tool.pricing_mode.toUpperCase()}</span>
                  <strong>{copy.run} →</strong>
                </footer>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="command-section command-pricing-section">
        <div className="container command-pricing-grid">
          <div>
            <p className="empire-command-kicker">{copy.pricing}</p>
            <h2>{copy.pricing}</h2>
            <p>{copy.pricingBody}</p>
            <Link href={`${prefix}/pricing`} className="button button-primary">
              {translate(messages, "nav.pricing")}
            </Link>
          </div>

          <div className="command-plan-grid">
            {visiblePlans.map((plan) => (
              <Link key={plan.slug} href={`${prefix}/pricing`} className="command-plan-card">
                <small>{plan.name}</small>
                <strong>{Number(plan.price_sar)} SAR</strong>
                <span>{Number(plan.monthly_credits).toLocaleString(locale.locale_code)} {translate(messages, "common.points")}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="command-final empire-grid-surface">
        <div className="container">
          <p className="empire-command-kicker">{identity.siteName}</p>
          <h2>{copy.finalTitle}</h2>
          <p>{copy.finalBody}</p>
          <Link href={`${prefix}/tools`} className="button button-primary">
            {copy.primary}
          </Link>
        </div>
      </section>
    </main>
  );
}
