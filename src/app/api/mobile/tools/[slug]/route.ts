import { corsJson, corsOptions } from "@/lib/api-cors";
import { getToolBySlug } from "@/repositories/catalog";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return corsOptions();
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const locale = new URL(request.url).searchParams.get("locale") ?? "en";
    const tool = await getToolBySlug(slug, locale);
    if (!tool) return corsJson({ error: "TOOL_NOT_FOUND" }, { status: 404 });

    return corsJson({
      id: tool.id,
      slug: tool.slug,
      title: tool.title,
      description: tool.localizedDescription,
      engineType: tool.engine_type,
      inputSchema: tool.localizedInputSchema,
      pricingMode: tool.pricing_mode,
      fixedPoints: tool.fixed_points,
      minimumPoints: tool.minimum_points,
      requiresAuth: tool.requires_auth,
      categoryId: tool.category_id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "MOBILE_TOOL_FAILED";
    return corsJson({ error: message }, { status: 500 });
  }
}
