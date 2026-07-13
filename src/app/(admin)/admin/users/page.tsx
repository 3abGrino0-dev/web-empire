import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SearchParams = {
  q?: string;
  status?: string;
  plan?: string;
  page?: string;
};

type UserRow = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  profile_status: "active" | "suspended" | "blocked";
  created_at: string;
  last_sign_in_at: string | null;
  balance: number;
  plan_slug: string | null;
  plan_name_ar: string | null;
  run_count: number;
  credits_consumed: number;
  total_count: number;
};

const dateFormatter = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Riyadh",
});

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "—";
}

function statusLabel(status: UserRow["profile_status"]) {
  if (status === "suspended") return "موقوف";
  if (status === "blocked") return "محظور";
  return "نشط";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const page = Math.max(1, Number(query.page ?? 1) || 1);
  const pageSize = 20;
  const supabase = createSupabaseAdminClient();

  const [usersResult, summaryResult, plansResult] = await Promise.all([
    supabase.rpc("admin_list_users", {
      p_search: query.q?.trim() || null,
      p_status: query.status?.trim() || null,
      p_plan: query.plan?.trim() || null,
      p_limit: pageSize,
      p_offset: (page - 1) * pageSize,
    }),
    supabase.rpc("admin_user_summary"),
    supabase.from("plans").select("slug, name_ar").order("sort_order"),
  ]);

  if (usersResult.error) throw new Error(usersResult.error.message);
  if (summaryResult.error) throw new Error(summaryResult.error.message);

  const users = (usersResult.data ?? []) as UserRow[];
  const summary = Array.isArray(summaryResult.data)
    ? summaryResult.data[0]
    : summaryResult.data;
  const total = Number(users[0]?.total_count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageHref = (value: number) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.status) params.set("status", query.status);
    if (query.plan) params.set("plan", query.plan);
    params.set("page", String(value));
    return `/admin/users?${params.toString()}`;
  };

  return (
    <div className="admin-users-page">
      <section className="admin-page-hero">
        <div>
          <p className="admin-eyebrow">USER OPERATIONS</p>
          <h1>إدارة المستخدمين</h1>
          <p>متابعة الحسابات والأرصدة والباقات والتشغيلات من مركز واحد.</p>
        </div>
        <Link href="/admin/audit" className="admin-secondary-button">
          سجل الإجراءات
        </Link>
      </section>

      <section className="admin-summary-grid">
        <article><span>إجمالي المستخدمين</span><strong>{Number(summary?.total_users ?? 0).toLocaleString("ar-SA")}</strong></article>
        <article><span>الحسابات النشطة</span><strong>{Number(summary?.active_users ?? 0).toLocaleString("ar-SA")}</strong></article>
        <article><span>الموقوفة</span><strong>{Number(summary?.suspended_users ?? 0).toLocaleString("ar-SA")}</strong></article>
        <article><span>إجمالي الرصيد</span><strong>{Number(summary?.total_credits ?? 0).toLocaleString("ar-SA")}</strong></article>
        <article><span>إجمالي التشغيلات</span><strong>{Number(summary?.total_runs ?? 0).toLocaleString("ar-SA")}</strong></article>
      </section>

      <section className="admin-filter-card">
        <form method="get" className="admin-users-filters">
          <label><span>البحث</span><input name="q" defaultValue={query.q ?? ""} placeholder="الاسم، البريد أو المعرّف" /></label>
          <label>
            <span>الحالة</span>
            <select name="status" defaultValue={query.status ?? ""}>
              <option value="">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="suspended">موقوف</option>
              <option value="blocked">محظور</option>
            </select>
          </label>
          <label>
            <span>الباقة</span>
            <select name="plan" defaultValue={query.plan ?? ""}>
              <option value="">كل الباقات</option>
              {(plansResult.data ?? []).map((plan) => (
                <option key={plan.slug} value={plan.slug}>{plan.name_ar}</option>
              ))}
            </select>
          </label>
          <button className="admin-primary-button" type="submit">تطبيق</button>
          <Link className="admin-secondary-button" href="/admin/users">مسح</Link>
        </form>
      </section>

      <section className="admin-table-card">
        <div className="admin-table-heading">
          <div><h2>الحسابات</h2><p>{total.toLocaleString("ar-SA")} مستخدم</p></div>
          <span>صفحة {page.toLocaleString("ar-SA")} من {totalPages.toLocaleString("ar-SA")}</span>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>المستخدم</th><th>الحالة</th><th>الباقة</th>
                <th>الرصيد</th><th>التشغيلات</th><th>آخر دخول</th><th>التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={7}><div className="admin-empty-state"><strong>لا توجد نتائج</strong></div></td></tr>
              ) : users.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    <div className="admin-user-cell">
                      <span className="admin-user-avatar">{(user.display_name || user.email || "U").slice(0,1).toUpperCase()}</span>
                      <div><strong>{user.display_name || "بدون اسم"}</strong><small dir="ltr">{user.email || user.user_id}</small></div>
                    </div>
                  </td>
                  <td><span className={`admin-status-pill is-${user.profile_status}`}>{statusLabel(user.profile_status)}</span></td>
                  <td>{user.plan_name_ar || "مجاني"}</td>
                  <td>{Number(user.balance).toLocaleString("ar-SA")}</td>
                  <td>{Number(user.run_count).toLocaleString("ar-SA")}</td>
                  <td>{formatDate(user.last_sign_in_at)}</td>
                  <td>{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-pagination">
          {page > 1 ? <Link href={pageHref(page - 1)}>السابق</Link> : <span>السابق</span>}
          <strong>{page.toLocaleString("ar-SA")}</strong>
          {page < totalPages ? <Link href={pageHref(page + 1)}>التالي</Link> : <span>التالي</span>}
        </div>
      </section>
    </div>
  );
}
