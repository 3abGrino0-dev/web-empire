import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function RunsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: runs } = await supabase
    .from("tool_runs")
    .select(
      "id, status, input_tokens, output_tokens, credits_charged, error_message, created_at, tools(title_ar), ai_providers(name), ai_models(name)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">OBSERVABILITY</div>
        <h1>التشغيلات</h1>
        <p>استخدام المزود والتوكن والنقاط والأخطاء.</p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>الأداة</th>
              <th>الحالة</th>
              <th>المزود</th>
              <th>النموذج</th>
              <th>Input</th>
              <th>Output</th>
              <th>النقاط</th>
              <th>خطأ</th>
            </tr>
          </thead>
          <tbody>
            {runs?.map((run) => (
              <tr key={run.id}>
                <td>{Array.isArray(run.tools) ? run.tools[0]?.title_ar ?? "-" : "-"}</td>
                <td>{run.status}</td>
                <td>{Array.isArray(run.ai_providers) ? run.ai_providers[0]?.name ?? "-" : "-"}</td>
                <td>{Array.isArray(run.ai_models) ? run.ai_models[0]?.name ?? "-" : "-"}</td>
                <td>{run.input_tokens}</td>
                <td>{run.output_tokens}</td>
                <td>{run.credits_charged}</td>
                <td title={run.error_message ?? ""}>
                  {run.error_message ? "⚠" : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
