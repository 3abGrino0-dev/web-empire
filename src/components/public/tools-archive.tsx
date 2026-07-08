import Link from "next/link";

type ArchiveTool = {
  key: string;
  slug: string;
  title: string;
  description: string;
  engineType: string;
  pricingMode: "free" | "fixed" | "dynamic";
  fixedPoints: number;
  minimumPoints: number;
};

function pricingText({
  tool,
  localeCode,
  freeLabel,
  pointsLabel,
  fromLabel,
}: {
  tool: ArchiveTool;
  localeCode: string;
  freeLabel: string;
  pointsLabel: string;
  fromLabel: string;
}): string {
  if (tool.pricingMode === "free") return freeLabel;
  if (tool.pricingMode === "fixed") {
    return `${Number(tool.fixedPoints).toLocaleString(localeCode)} ${pointsLabel}`;
  }
  return `${fromLabel} ${Number(tool.minimumPoints).toLocaleString(localeCode)} ${pointsLabel}`;
}

export function ToolsArchive({
  locale,
  localeCode,
  tools,
  labels,
  engines,
}: {
  locale: string;
  localeCode: string;
  tools: readonly ArchiveTool[];
  labels: {
    archiveLabel: string;
    engineLabel: string;
    pricingLabel: string;
    openLabel: string;
    freeLabel: string;
    pointsLabel: string;
    fromLabel: string;
    emptyTitle: string;
    emptyBody: string;
  };
  engines: readonly string[];
}) {
  if (!tools.length) {
    return (
      <section className="empire-archive-empty" aria-live="polite">
        <h2>{labels.emptyTitle}</h2>
        <p>{labels.emptyBody}</p>
      </section>
    );
  }

  return (
    <section className="empire-archive-section" aria-label={labels.archiveLabel}>
      <p className="empire-archive-engine-rail" dir="ltr" aria-hidden="true">
        {engines.join(" · ")}
      </p>

      <ol className="empire-archive-list">
        {tools.map((tool, index) => (
          <li key={tool.key}>
            <article className={`empire-archive-item accent-${(index % 5) + 1}`}>
              <Link href={`/${locale}/tools/${tool.slug}`} className="empire-archive-link">
                <p className="empire-archive-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </p>

                <div className="empire-archive-copy">
                  <h2>{tool.title}</h2>
                  <p>{tool.description}</p>
                </div>

                <div className="empire-archive-meta">
                  <div>
                    <small>{labels.engineLabel}</small>
                    <p className="empire-archive-engine" dir="ltr">{tool.engineType.toUpperCase()}</p>
                  </div>

                  <div>
                    <small>{labels.pricingLabel}</small>
                    <p className="empire-archive-pricing">
                      {pricingText({
                        tool,
                        localeCode,
                        freeLabel: labels.freeLabel,
                        pointsLabel: labels.pointsLabel,
                        fromLabel: labels.fromLabel,
                      })}
                    </p>
                  </div>

                  <span className="empire-archive-open" aria-label={labels.openLabel}>
                    ↗
                  </span>
                </div>
              </Link>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
