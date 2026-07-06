import { publicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const [{ data: locales }, { data: tools }] = await Promise.all([
    supabase.from("locales").select("code").eq("is_active", true).order("sort_order"),
    supabase.from("tools").select("slug, updated_at").eq("is_active", true).order("sort_order"),
  ]);

  const entries: Array<{ url: string; lastmod?: string }> = [];

  for (const locale of locales ?? []) {
    const prefix = `${publicEnv.siteUrl}/${locale.code}`;
    entries.push({ url: prefix });
    entries.push({ url: `${prefix}/tools` });
    entries.push({ url: `${prefix}/pricing` });

    for (const tool of tools ?? []) {
      entries.push({
        url: `${prefix}/tools/${tool.slug}`,
        lastmod: tool.updated_at ?? undefined,
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map(
      (entry) => `  <url>\n    <loc>${escapeXml(entry.url)}</loc>${
        entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ""
      }\n  </url>`,
    )
    .join("\n")}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
