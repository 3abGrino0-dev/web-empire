import Link from "next/link";
import { notFound } from "next/navigation";

import { getLocaleByCode } from "@/localization/repository";
import { getActiveCategories, getActiveTools } from "@/repositories/catalog";
import { webEmpireLightAssets as assets } from "@/brand/web-empire-light-assets";

const labels = {
  ar: {
    title: "مكتبة الأدوات",
    body: "اكتشف مجموعة الأدوات الذكية التي تساعدك على إنجاز عملك بدقة وسرعة.",
    search: "ابحث عن أداة أو كلمة مفتاحية...",
    all: "الكل",
    sort: "الأحدث أولًا",
    missing: "أداة مفقودة؟",
    suggest: "اقترح أداة جديدة",
    use: "استخدم الأداة",
    count: "أداة",
  },
  en: {
    title: "Tools Library",
    body: "Explore smart tools that help you analyze, calculate, and grow.",
    search: "Search tools...",
    all: "All",
    sort: "Newest first",
    missing: "Missing a tool?",
    suggest: "Suggest a tool",
    use: "Use tool",
    count: "tools",
  },
};

const glyphs = ["%", "↗", "VAT", "◔", "▣", "☷", "◎", "T", "⌕"];

export default async function ToolsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string }>;
}) {
  const { locale: localeCode } = await params;
  const query = await searchParams;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const [tools, categories] = await Promise.all([
    getActiveTools(locale.code),
    getActiveCategories(locale.code),
  ]);

  const t = locale.code === "ar" ? labels.ar : labels.en;
  const prefix = `/${locale.code}`;
  const activeCategory = categories.find((category) => category.slug === query?.category);
  const visibleTools = activeCategory
    ? tools.filter((tool) => tool.category_id === activeCategory.id)
    : tools;

  const categoryCounts = new Map<string, number>();
  for (const tool of tools) {
    categoryCounts.set(tool.category_id, (categoryCounts.get(tool.category_id) ?? 0) + 1);
  }

  return (
    <main className="we-page we-tools-page">
      <div className="we-container we-tools-layout">
        <aside className="we-tools-sidebar">
          <h3>+{tools.length} {t.count}</h3>
          <img src={assets.toolsVisual} alt="" style={{ width: "100%", height: "auto" }} />

          <Link className={`we-side-item ${!activeCategory ? "active" : ""}`} href={`${prefix}/tools`}>
            <span>{t.all}</span>
            <strong>({tools.length})</strong>
          </Link>

          {categories.map((category) => (
            <Link
              className={`we-side-item ${activeCategory?.slug === category.slug ? "active" : ""}`}
              href={`${prefix}/tools?category=${category.slug}`}
              key={category.slug}
            >
              <span>{category.name}</span>
              <small>({categoryCounts.get(category.id) ?? 0})</small>
            </Link>
          ))}

          <div className="we-tools-sidebar" style={{ marginTop: 18, boxShadow: "none" }}>
            <h3>{t.missing}</h3>
            <p style={{ color: "var(--we-muted)" }}>{locale.code === "ar" ? "اقترح أداة جديدة تساعدك في عملك اليومي." : "Suggest a new tool for your workflow."}</p>
            <Link className="we-button-ghost" href={`${prefix}/contact`}>✧ {t.suggest}</Link>
          </div>
        </aside>

        <section>
          <div className="we-tools-title" id="categories">
            <h1>{activeCategory?.name ?? t.title}</h1>
            <p>{activeCategory?.description || t.body}</p>
          </div>

          <div className="we-search"><span>⌕</span><strong>{t.search}</strong><span>☷</span></div>

          <div className="we-chip-row">
            <Link className={`we-chip ${!activeCategory ? "active" : ""}`} href={`${prefix}/tools`}>{t.all}</Link>
            {categories.map((category) => (
              <Link
                className={`we-chip ${activeCategory?.slug === category.slug ? "active" : ""}`}
                href={`${prefix}/tools?category=${category.slug}`}
                key={category.slug}
              >
                {category.name}
              </Link>
            ))}
            <span className="we-chip">{t.sort}</span>
          </div>

          {visibleTools.length > 0 ? (
            <div className="we-tools-grid">
              {visibleTools.map((tool, index) => (
                <Link href={`${prefix}/tools/${tool.slug}`} className="we-tool-list-card" key={tool.slug}>
                  <div className="we-icon">{glyphs[index % glyphs.length]}</div>
                  <h3>{tool.title}</h3>
                  <p>{tool.localizedDescription}</p>
                  <span className="we-card-link">← {t.use}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="we-tools-empty" role="status">
              <strong>{locale.code === "ar" ? "لا توجد أدوات في هذا التصنيف حاليًا" : "No tools are available in this category yet."}</strong>
              <p>
                {locale.code === "ar"
                  ? "اختر تصنيفًا آخر أو اقترح أداة جديدة تناسب سير عملك."
                  : "Choose another category or suggest a new tool for your workflow."}
              </p>
              <Link className="we-button-ghost" href={`${prefix}/contact`}>
                ✧ {t.suggest}
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
