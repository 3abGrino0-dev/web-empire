import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminToolsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: tools } = await supabase
    .from("tools")
    .select(
      "id, slug, title_ar, engine_type, pricing_mode, is_active, categories(name_ar)"
    )
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">TOOL FACTORY</div>
        <h1>الأدوات</h1>
        <p>أضف أداة جديدة بدون إنشاء صفحة برمجية مستقلة.</p>
        <Link
          href="/admin/tools/new"
          className="button button-primary"
        >
          + أداة جديدة
        </Link>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>الأداة</th>
              <th>Slug</th>
              <th>المحرك</th>
              <th>التسعير</th>
              <th>الحالة</th><th>الترجمات</th>
            </tr>
          </thead>
          <tbody>
            {(tools ?? []).map((tool) => (
              <tr key={tool.id}>
                <td>{tool.title_ar}</td>
                <td>{tool.slug}</td>
                <td>{tool.engine_type}</td>
                <td>{tool.pricing_mode}</td>
                <td>{tool.is_active ? "نشطة" : "متوقفة"}</td><td><Link className="badge" href={`/admin/tools/${tool.id}/translations`}>إدارة اللغات</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
