import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminPage() {
  const supabase = createSupabaseAdminClient();

  const [
    { count: tools },
    { count: providers },
    { count: skills },
    { count: runs },
    { count: users },
    { count: failedRuns }
  ] = await Promise.all([
    supabase.from("tools").select("*", { count: "exact", head: true }),
    supabase.from("ai_providers").select("*", { count: "exact", head: true }),
    supabase.from("skills").select("*", { count: "exact", head: true }),
    supabase.from("tool_runs").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("tool_runs")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed")
  ]);

  const metrics: Array<[string, number | null]> = [
    ["الأدوات", tools],
    ["مزودو AI", providers],
    ["Skills", skills],
    ["التشغيلات", runs],
    ["المستخدمون", users],
    ["فشل التشغيل", failedRuns]
  ];

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">CONTROL CENTER</div>
        <h1>لوحة التحكم</h1>
        <p>نظرة مباشرة على مصنع الأدوات والمحرك.</p>
      </div>

      <div className="metrics-grid">
        {metrics.map(([label, value]) => (
          <div className="metric" key={label}>
            <span>{label}</span>
            <h2>{value ?? 0}</h2>
          </div>
        ))}
      </div>
    </>
  );
}
