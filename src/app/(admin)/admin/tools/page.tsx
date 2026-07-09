import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminToolsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: tools } = await supabase
    .from("tools")
    .select(
      "id, slug, title_ar, engine_type, pricing_mode, is_active, is_featured, requires_auth, seo_title, seo_description, categories(name_ar)"
    )
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">TOOL CONTENT + GOVERNANCE</div>
        <h1>جميع الأدوات</h1>
        <p>قائمة تشغيلية لإدارة حالة الأداة والمحتوى والاستعداد لـ SEO و AI Assist.</p>
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
              <th>التصنيف</th>
              <th>المحرك</th>
              <th>الحالة</th>
              <th>Featured</th>
              <th>يتطلب تسجيل</th>
              <th>Pricing</th>
              <th>AI Assist</th>
              <th>SEO</th>
              <th>الترجمات</th>
            </tr>
          </thead>
          <tbody>
            {(tools ?? []).map((tool) => (
              <tr key={tool.id}>
                <td>{tool.title_ar}</td>
                <td>{tool.slug}</td>
                <td>{Array.isArray(tool.categories) ? tool.categories[0]?.name_ar ?? "-" : "-"}</td>
                <td>{tool.engine_type}</td>
                <td>
                  <span className={`status-pill ${tool.is_active ? "ok" : "warn"}`}>
                    {tool.is_active ? "نشطة" : "متوقفة"}
                  </span>
                </td>
                <td className="flag-cell">{tool.is_featured ? "نعم" : "لا"}</td>
                <td className="flag-cell">{tool.requires_auth ? "نعم" : "لا"}</td>
                <td>{tool.pricing_mode}</td>
                <td>
                  <span className="status-pill warn">لاحقًا</span>
                </td>
                <td>
                  <span className={`status-pill ${tool.seo_title && tool.seo_description ? "ok" : "warn"}`}>
                    {tool.seo_title && tool.seo_description ? "مكتمل" : "غير مكتمل"}
                  </span>
                </td>
                <td>
                  <Link className="badge" href={`/admin/tools/${tool.id}/translations`}>
                    إدارة اللغات
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
