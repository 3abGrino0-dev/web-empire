import Link from "next/link";

import type { LocalizedToolRecord } from "@/domain/types";
import { translate } from "@/localization/messages";
import type { UiMessages } from "@/localization/types";

function engineLabel(engine: LocalizedToolRecord["engine_type"]): string {
  return engine === "custom_runtime" ? "runtime" : engine.replaceAll("_", " ");
}

function priceValue(tool: LocalizedToolRecord, messages: UiMessages): string {
  if (tool.pricing_mode === "free") {
    return translate(messages, "common.free");
  }

  if (tool.pricing_mode === "fixed") {
    return `${tool.fixed_points} ${translate(messages, "common.points")}`;
  }

  return `${tool.minimum_points}+ ${translate(messages, "common.points")}`;
}

function pricingModeLabel(locale: string, mode: LocalizedToolRecord["pricing_mode"]): string {
  const labels: Record<string, Record<LocalizedToolRecord["pricing_mode"], string>> = {
    ar: { free: "مجاني", fixed: "سعر ثابت", dynamic: "ديناميكي" },
    en: { free: "free", fixed: "fixed", dynamic: "dynamic" },
    fr: { free: "gratuit", fixed: "fixe", dynamic: "dynamique" },
    tr: { free: "ucretsiz", fixed: "sabit", dynamic: "dinamik" },
    ur: { free: "مفت", fixed: "مقرر", dynamic: "متحرک" },
  };

  return labels[locale]?.[mode] ?? labels.en[mode];
}

function openToolLabel(locale: string): string {
  const labels: Record<string, string> = {
    ar: "افتح الاداة",
    en: "Open tool",
    fr: "Ouvrir l'outil",
    tr: "Araci ac",
    ur: "ٹول کھولیں",
  };

  return labels[locale] ?? labels.en;
}

function previewForEngine(engine: LocalizedToolRecord["engine_type"]) {
  if (engine === "formula") {
    return (
      <div className="ft-preview ft-preview-formula" aria-hidden="true">
        <span>75</span>
        <b>+</b>
        <span>25</span>
        <strong>= 100</strong>
      </div>
    );
  }

  if (engine === "text_transform") {
    return (
      <div className="ft-preview ft-preview-text" aria-hidden="true">
        <p>before: hello web empire</p>
        <p>after: HELLO WEB EMPIRE</p>
      </div>
    );
  }

  if (engine === "ai_text") {
    return (
      <div className="ft-preview ft-preview-ai-text" aria-hidden="true">
        <small>prompt</small>
        <p>Write a short launch copy.</p>
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (engine === "ai_structured") {
    return (
      <div className="ft-preview ft-preview-ai-structured" aria-hidden="true">
        <code>{"{"}</code>
        <p>title: &quot;...&quot;</p>
        <p>category: &quot;...&quot;</p>
        <p>tags: [...]</p>
        <code>{"}"}</code>
      </div>
    );
  }

  if (engine === "http_api") {
    return (
      <div className="ft-preview ft-preview-http" aria-hidden="true">
        <p>POST /api/run</p>
           <span>payload -&gt;</span>
        <strong>200 OK</strong>
      </div>
    );
  }

  if (engine === "webhook") {
    return (
      <div className="ft-preview ft-preview-webhook" aria-hidden="true">
        <span>event.triggered</span>
        <b>--&gt;</b>
        <span>https://endpoint</span>
      </div>
    );
  }

  if (engine === "workflow") {
    return (
      <div className="ft-preview ft-preview-workflow" aria-hidden="true">
        <span>01</span>
             <b>-&gt;</b>
        <span>02</span>
             <b>-&gt;</b>
        <span>03</span>
      </div>
    );
  }

  return (
    <div className="ft-preview ft-preview-runtime" aria-hidden="true">
      <span>runtime</span>
      <b>execute</b>
    </div>
  );
}

function FeaturedToolCard({
  tool,
  locale,
  messages,
  index,
}: {
  tool: LocalizedToolRecord;
  locale: string;
  messages: UiMessages;
  index: number;
}) {
  const variant = index % 3;
  const pricing = priceValue(tool, messages);
  const openLabel = openToolLabel(locale);
  const engine = engineLabel(tool.engine_type);
  const pricingMode = pricingModeLabel(locale, tool.pricing_mode);
  const metaBlock = (
    <div className="featured-tool-meta">
      <span className="featured-tool-engine">
        <small>{locale === "ar" ? "المحرك" : "Engine"}</small>
        <b>{engine}</b>
      </span>
      <span className="featured-tool-pricing">
        <small>{locale === "ar" ? "التسعير" : "Pricing"}</small>
        <b>{pricingMode} · {pricing}</b>
      </span>
    </div>
  );

  const contentBlock = (
    <div className="featured-tool-content">
      <h3>{tool.title}</h3>
      <p>{tool.localizedDescription}</p>
    </div>
  );

  const openBlock = (
    <span className="featured-tool-open">
      {openLabel}
      <i aria-hidden="true">↗</i>
    </span>
  );

  return (
    <Link
      href={`/${locale}/tools/${tool.slug}`}
      className={`featured-tool featured-tool-v${variant + 1}`}
    >
      <div className="featured-tool-surface">{previewForEngine(tool.engine_type)}</div>

      {variant === 0 ? (
        <>
          {contentBlock}
          {metaBlock}
          {openBlock}
        </>
      ) : null}

      {variant === 1 ? (
        <>
          {metaBlock}
          {contentBlock}
          {openBlock}
        </>
      ) : null}

      {variant === 2 ? (
        <>
          {contentBlock}
          {openBlock}
          {metaBlock}
        </>
      ) : null}
    </Link>
  );
}

export function FeaturedToolShowcase({
  tools,
  locale,
  messages,
  copy,
}: {
  tools: LocalizedToolRecord[];
  locale: string;
  messages: UiMessages;
  copy: {
    showcaseKicker: string;
    showcaseTitle: string;
    showcaseBody: string;
    allTools: string;
  };
}) {
  return (
    <>
      <div className="empire-showcase-intro">
        <div className="empire-showcase-side">
          <p className="empire-section-kicker">{copy.showcaseKicker}</p>
          <p className="empire-showcase-body">{copy.showcaseBody}</p>
          <Link href={`/${locale}/tools`} className="empire-section-link">
            {copy.allTools}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <h2 className="empire-showcase-title">{copy.showcaseTitle}</h2>
      </div>

      <div className="featured-showcase-grid" aria-label="Featured tools showcase">
        {tools.map((tool, index) => (
          <FeaturedToolCard
            key={tool.id}
            tool={tool}
            locale={locale}
            messages={messages}
            index={index}
          />
        ))}
      </div>
    </>
  );
}