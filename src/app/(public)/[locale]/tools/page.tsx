import { notFound } from "next/navigation";

import {
  ToolsExplorer,
  type ToolExplorerCategory,
} from "@/components/tools/tools-explorer";
import type { ToolExplorerItem } from "@/components/tools/tool-card";
import { getLocaleByCode } from "@/localization/repository";
import { getActiveCategories, getActiveTools } from "@/repositories/catalog";

export default async function ToolsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string; q?: string }>;
}) {
  const { locale: localeCode } = await params;
  const query = await searchParams;
  const locale = await getLocaleByCode(localeCode);

  if (!locale) notFound();

  const [tools, categories] = await Promise.all([
    getActiveTools(locale.code),
    getActiveCategories(locale.code),
  ]);

  const categoryMap = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  const explorerCategories: ToolExplorerCategory[] = categories.map(
    (category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      icon: category.icon ?? "",
    }),
  );

  const explorerTools: ToolExplorerItem[] = tools.map((tool, index) => ({
    slug: tool.slug,
    title: tool.title,
    description: tool.localizedDescription,
    categoryId: tool.category_id,
    categoryName:
      categoryMap.get(tool.category_id) ??
      (locale.code === "ar" ? "أدوات عامة" : "General"),
    engineType: tool.engine_type,
    pricingMode: tool.pricing_mode,
    fixedPoints: Number(tool.fixed_points ?? 0),
    minimumPoints: Number(tool.minimum_points ?? 0),
    isFeatured: Boolean(tool.is_featured),
    order: index,
  }));

  const validCategory = categories.some(
    (category) => category.slug === query?.category,
  )
    ? query?.category
    : "";

  return (
    <main className="we-page we-tools-page">
      <div className="we-container">
        <ToolsExplorer
          categories={explorerCategories}
          initialCategory={validCategory}
          initialQuery={query?.q ?? ""}
          locale={locale.code}
          prefix={`/${locale.code}`}
          tools={explorerTools}
        />
      </div>
    </main>
  );
}
