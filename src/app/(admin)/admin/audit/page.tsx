import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminAuditPage() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("id, actor_user_id, action, entity_type, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  return (
    <div className="admin-audit-page">
      <section className="admin-page-hero">
        <div>
          <p className="admin-eyebrow">SECURITY & COMPLIANCE</p>
          <h1>سجل الإجراءات الإدارية</h1>
          <p>آخر 100 إجراء حساس داخل النظام.</p>
        </div>
      </section>
      <section className="admin-table-card">
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead><tr><th>الإجراء</th><th>الكيان</th><th>المعرّف</th><th>المدير</th><th>الوقت</th></tr></thead>
            <tbody>
              {(data ?? []).length === 0
                ? <tr><td colSpan={5}><div className="admin-empty-state"><strong>لا توجد سجلات بعد</strong></div></td></tr>
                : (data ?? []).map((item) => (
                  <tr key={item.id}>
                    <td dir="ltr">{item.action}</td>
                    <td>{item.entity_type}</td>
                    <td dir="ltr">{item.entity_id || "—"}</td>
                    <td dir="ltr">{item.actor_user_id || "system"}</td>
                    <td>{new Date(item.created_at).toLocaleString("ar-SA")}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
