import Link from "next/link";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface ToolRow {
  id: string;
  title_ar: string;
  title_en: string;
  slug: string;
}

interface RelationRow {
  tool_id: string;
  related_tool_id: string;
}

export default async function AdminRelatedToolsOverviewPage() {
  const supabase = createSupabaseAdminClient();

  const [{ data: tools }, { data: relations }] = await Promise.all([
    supabase
      .from("tools")
      .select("id, title_ar, title_en, slug")
      .order("title_ar"),
    supabase
      .from("tool_related_tools")
      .select("tool_id, related_tool_id, sort_order")
      .order("sort_order", { ascending: true }),
  ]);

  const toolMap = new Map((tools ?? []).map((tool) => [tool.id, tool as ToolRow]));
  const grouped = new Map<string, RelationRow[]>();

  for (const row of (relations ?? []) as RelationRow[]) {
    const list = grouped.get(row.tool_id) ?? [];
    list.push(row);
    grouped.set(row.tool_id, list);
  }

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">RELATED TOOLS OVERVIEW</div>
        <h1>الأدوات ذات الصلة</h1>
        <p>نظرة عامة على الربط الحالي بين الأدوات. التعديل من صفحة المحتوى.</p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Related Tools Count</th>
              <th>Current Related Tools</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(tools ?? []).map((tool) => {
              const current = grouped.get(tool.id) ?? [];
              return (
                <tr key={tool.id}>
                  <td>{tool.title_ar || tool.title_en} ({tool.slug})</td>
                  <td>{current.length}</td>
                  <td>
                    <div className="chip-row">
                      {current.length
                        ? current.map((relation) => {
                            const related = toolMap.get(relation.related_tool_id);
                            if (!related) return null;
                            return (
                              <span className="chip" key={`${tool.id}-${relation.related_tool_id}`}>
                                {related.title_ar || related.title_en} ({related.slug})
                              </span>
                            );
                          })
                        : <span className="inline-note">لا توجد أدوات مرتبطة</span>}
                    </div>
                  </td>
                  <td>
                    <Link className="badge" href={`/admin/tools/${tool.id}/content#related-tools`}>
                      إدارة المحتوى
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
