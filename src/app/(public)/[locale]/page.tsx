import Link from "next/link";
import { notFound } from "next/navigation";

import { ToolCard } from "@/components/tool-card";
import { translate } from "@/localization/messages";
import {
  getLocaleByCode,
  getSiteIdentity,
  getUiMessages,
} from "@/localization/repository";
import { getActiveTools } from "@/repositories/catalog";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const [tools, messages, identity] = await Promise.all([
    getActiveTools(locale.code),
    getUiMessages(locale),
    getSiteIdentity(locale),
  ]);
  const featured = tools.filter((tool) => tool.is_featured).slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">{translate(messages, "home.eyebrow")}</div>
            <h1>{identity.siteName}</h1>
            <p>{translate(messages, "home.description")}</p>

            <div className="hero-actions">
              <Link href={`/${locale.code}/tools`} className="button button-primary">
                {translate(messages, "home.explore")}
              </Link>
              <Link href={`/${locale.code}/pricing`} className="button button-ghost">
                {translate(messages, "home.plans")}
              </Link>
            </div>

            <div className="stat-strip">
              <div className="stat"><strong>Tool Factory</strong><span>Database-first</span></div>
              <div className="stat"><strong>Multi AI</strong><span>OpenAI • Claude • Gemini</span></div>
              <div className="stat"><strong>Skills</strong><span>Reusable intelligence</span></div>
              <div className="stat"><strong>Credits</strong><span>Reserve • Run • Settle</span></div>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="orbit-card">AI</div>
            <div className="orbit-card">⌘</div>
            <div className="orbit-card">◈</div>
            <div className="orbit-card">↯</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">TOOL FACTORY</div>
              <h2>{translate(messages, "tools.title")}</h2>
              <p>{translate(messages, "tools.description")}</p>
            </div>
            <Link href={`/${locale.code}/tools`} className="button button-dark">
              {translate(messages, "home.explore")}
            </Link>
          </div>

          <div className="tools-grid">
            {featured.map((tool) => (
              <ToolCard key={tool.id} tool={tool} locale={locale.code} messages={messages} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="feature-grid">
            <div className="feature"><h3>Any AI Provider</h3><p>Provider adapters are separated from tools and models.</p></div>
            <div className="feature"><h3>Universal Skills</h3><p>One skill can power multiple tools and providers.</p></div>
            <div className="feature"><h3>{identity.tagline}</h3><p>Colors, cards, layout density, language and routing are configurable.</p></div>
          </div>
        </div>
      </section>
    </>
  );
}
