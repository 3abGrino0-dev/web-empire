"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { ToolCard, type ToolExplorerItem } from "./tool-card";
import styles from "./tools-explorer.module.css";

export interface ToolExplorerCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
}

interface ToolsExplorerProps {
  tools: ToolExplorerItem[];
  categories: ToolExplorerCategory[];
  locale: string;
  prefix: string;
  initialCategory?: string;
  initialQuery?: string;
}

type SortMode = "featured" | "title" | "free";

const copy = {
  ar: {
    title: "مكتبة الأدوات",
    description: "ابحث، صفِّ، وشغّل أدواتك من مكان واحد بسرعة ووضوح.",
    search: "ابحث عن أداة أو كلمة مفتاحية...",
    all: "الكل",
    tools: "أداة",
    results: "نتيجة",
    sortFeatured: "المميزة أولًا",
    sortTitle: "حسب الاسم",
    sortFree: "المجانية أولًا",
    filter: "التصنيفات",
    clear: "مسح الفلاتر",
    noResults: "لا توجد أدوات مطابقة",
    noResultsBody: "جرّب كلمة أخرى أو اختر تصنيفًا مختلفًا.",
    missing: "أداة مفقودة؟",
    suggestBody: "اقترح أداة جديدة تساعدك في عملك اليومي.",
    suggest: "اقترح أداة",
    searchHint: "اضغط / للبحث",
  },
  en: {
    title: "Tools Library",
    description: "Search, filter, and run your tools from one fast workspace.",
    search: "Search tools or keywords...",
    all: "All",
    tools: "tools",
    results: "results",
    sortFeatured: "Featured first",
    sortTitle: "By name",
    sortFree: "Free first",
    filter: "Categories",
    clear: "Clear filters",
    noResults: "No matching tools",
    noResultsBody: "Try another term or select a different category.",
    missing: "Missing a tool?",
    suggestBody: "Suggest a new tool for your daily workflow.",
    suggest: "Suggest tool",
    searchHint: "Press / to search",
  },
};

function categoryGlyph(icon: string, slug: string): string {
  const value = `${icon} ${slug}`.toLowerCase();

  if (value.includes("sparkles") || value.includes("ai")) return "✦";
  if (value.includes("calculator") || value.includes("math")) return "▦";
  if (value.includes("text") || value.includes("content")) return "T";
  if (value.includes("briefcase") || value.includes("business")) return "▣";
  if (value.includes("chart") || value.includes("marketing")) return "↗";
  if (value.includes("wallet") || value.includes("finance")) return "◈";
  if (value.includes("design")) return "✎";
  if (value.includes("code")) return "</>";

  return "◇";
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

export function ToolsExplorer({
  tools,
  categories,
  locale,
  prefix,
  initialCategory = "",
  initialQuery = "",
}: ToolsExplorerProps) {
  const isArabic = locale === "ar";
  const t = isArabic ? copy.ar : copy.en;
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortMode>("featured");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tool of tools) {
      counts.set(tool.categoryId, (counts.get(tool.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [tools]);

  const selectedCategory = categories.find((item) => item.slug === category);

  const visibleTools = useMemo(() => {
    const normalizedQuery = normalize(query);

    const filtered = tools.filter((tool) => {
      const categoryMatches = !category || tool.categoryId === selectedCategory?.id;
      if (!categoryMatches) return false;
      if (!normalizedQuery) return true;

      const haystack = normalize(
        `${tool.title} ${tool.description} ${tool.categoryName} ${tool.engineType}`,
      );

      return haystack.includes(normalizedQuery);
    });

    return [...filtered].sort((a, b) => {
      if (sort === "title") {
        return a.title.localeCompare(b.title, locale);
      }

      if (sort === "free") {
        const aFree = a.pricingMode === "free" ? 0 : 1;
        const bFree = b.pricingMode === "free" ? 0 : 1;
        return aFree - bFree || a.order - b.order;
      }

      return Number(b.isFeatured) - Number(a.isFeatured) || a.order - b.order;
    });
  }, [category, locale, query, selectedCategory?.id, sort, tools]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (event.key === "Escape" && document.activeElement === inputRef.current) {
        setQuery("");
        inputRef.current?.blur();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);

      if (category) params.set("category", category);
      else params.delete("category");

      if (query.trim()) params.set("q", query.trim());
      else params.delete("q");

      const suffix = params.toString();
      const url = `${window.location.pathname}${suffix ? `?${suffix}` : ""}`;
      window.history.replaceState(null, "", url);
    }, 180);

    return () => window.clearTimeout(timer);
  }, [category, query]);

  function selectCategory(slug: string) {
    setCategory(slug);
    setSidebarOpen(false);
  }

  function clearFilters() {
    setQuery("");
    setCategory("");
    setSort("featured");
    inputRef.current?.focus();
  }

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarSummary}>
          <span>{tools.length}</span>
          <strong>{isArabic ? "أداة" : t.tools}</strong>
          <p>{t.description}</p>
          <div className={styles.summaryBars} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <nav className={styles.categoryNav} aria-label={t.filter}>
          <button
            className={!category ? styles.categoryActive : ""}
            onClick={() => selectCategory("")}
            type="button"
          >
            <span>⌂ {t.all}</span>
            <small>{tools.length}</small>
          </button>

          {categories.map((item) => (
            <button
              className={category === item.slug ? styles.categoryActive : ""}
              key={item.id}
              onClick={() => selectCategory(item.slug)}
              type="button"
            >
              <span>
                <i className={styles.categoryIcon} aria-hidden="true">
                  {categoryGlyph(item.icon, item.slug)}
                </i>
                {item.name}
              </span>
              <small>{categoryCounts.get(item.id) ?? 0}</small>
            </button>
          ))}
        </nav>

        <div className={styles.suggestion}>
          <span aria-hidden="true">✦</span>
          <h3>{t.missing}</h3>
          <p>{t.suggestBody}</p>
          <Link href={`${prefix}/contact`}>{t.suggest}</Link>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.hero}>
          <div className={styles.heroIcon} aria-hidden="true">✣</div>
          <div>
            <h1>{selectedCategory?.name ?? t.title}</h1>
            <p>{selectedCategory?.description || t.description}</p>
          </div>
        </header>

        <div className={styles.searchBar}>
          <span aria-hidden="true">⌕</span>
          <input
            aria-label={t.search}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search}
            ref={inputRef}
            type="search"
            value={query}
          />
          <kbd>{t.searchHint}</kbd>
        </div>

        <div className={styles.mobileActions}>
          <button onClick={() => setSidebarOpen((value) => !value)} type="button">
            ☷ {t.filter}
          </button>
          <button onClick={clearFilters} type="button">
            × {t.clear}
          </button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.chips}>
            <button
              className={!category ? styles.chipActive : ""}
              onClick={() => selectCategory("")}
              type="button"
            >
              {t.all}
            </button>
            {categories.map((item) => (
              <button
                className={category === item.slug ? styles.chipActive : ""}
                key={item.id}
                onClick={() => selectCategory(item.slug)}
                type="button"
              >
                {item.name}
              </button>
            ))}
          </div>

          <select
            aria-label={isArabic ? "ترتيب الأدوات" : "Sort tools"}
            onChange={(event) => setSort(event.target.value as SortMode)}
            value={sort}
          >
            <option value="featured">{t.sortFeatured}</option>
            <option value="title">{t.sortTitle}</option>
            <option value="free">{t.sortFree}</option>
          </select>
        </div>

        <div className={styles.resultsHead}>
          <p>
            <strong>{visibleTools.length}</strong> {t.results}
          </p>
          {query || category ? (
            <button onClick={clearFilters} type="button">
              × {t.clear}
            </button>
          ) : null}
        </div>

        {visibleTools.length ? (
          <div className={styles.grid}>
            {visibleTools.map((tool) => (
              <ToolCard
                key={tool.slug}
                locale={locale}
                prefix={prefix}
                tool={tool}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty} role="status">
            <span aria-hidden="true">⌕</span>
            <h2>{t.noResults}</h2>
            <p>{t.noResultsBody}</p>
            <button onClick={clearFilters} type="button">
              {t.clear}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
