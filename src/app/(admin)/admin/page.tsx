import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const DESIGN_VERSION = 1;
const CORE_VERSION = 3;

function startOfTodayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function statusClass(status: string) {
  if (status === "completed") return "ok";
  if (status === "failed" || status === "cancelled") return "error";
  return "warn";
}

export default async function AdminPage() {
  const supabase = createSupabaseAdminClient();
  const todayIso = startOfTodayIso();
  const recentSince = new Date();
  recentSince.setDate(recentSince.getDate() - 7);
  const recentSinceIso = recentSince.toISOString();

  const [
    { count: activeToolsCount },
    { count: usersCount },
    { data: todayRunsRaw },
    { data: todayProviderUsageRaw },
    { data: recentRunsRaw },
    { data: latestRunsRaw },
  ] = await Promise.all([
    supabase.from("tools").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("tool_runs")
      .select("id, status, credits_charged, created_at")
      .gte("created_at", todayIso)
      .limit(5000),
    supabase
      .from("provider_usage")
      .select("id, estimated_cost_usd, provider_id, model_id, input_tokens, output_tokens, created_at")
      .gte("created_at", todayIso)
      .limit(5000),
    supabase
      .from("tool_runs")
      .select("id, status, created_at, tool_id, tools(title_ar, engine_type)")
      .gte("created_at", recentSinceIso)
      .limit(5000),
    supabase
      .from("tool_runs")
      .select("id, status, credits_charged, created_at, provider_usage(estimated_cost_usd), tools(title_ar, engine_type), ai_providers(name), ai_models(name), user_id")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const userIds = Array.from(new Set((latestRunsRaw ?? []).map((r) => r.user_id).filter(Boolean)));
  const { data: profileRows } = userIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
    : { data: [] as Array<{ id: string; display_name: string | null }> };
  const profileMap = new Map((profileRows ?? []).map((p) => [p.id, p.display_name]));

  const todayRuns = todayRunsRaw ?? [];
  const todayProviderUsage = todayProviderUsageRaw ?? [];
  const recentRuns = recentRunsRaw ?? [];
  const latestRuns = latestRunsRaw ?? [];

  const runsToday = todayRuns.length;
  const aiUsageToday = todayProviderUsage.length;
  const estimatedAiCostToday = todayProviderUsage.reduce(
    (sum, row) => sum + Number(row.estimated_cost_usd ?? 0),
    0
  );
  const creditsConsumedToday = todayRuns.reduce(
    (sum, row) => sum + Number(row.credits_charged ?? 0),
    0
  );

  const productVersion = `V${DESIGN_VERSION}.${CORE_VERSION}.${activeToolsCount ?? 0}`;

  const runsByDayMap = new Map<string, number>();
  for (const run of recentRuns) {
    const key = new Date(run.created_at).toISOString().slice(0, 10);
    runsByDayMap.set(key, (runsByDayMap.get(key) ?? 0) + 1);
  }
  const runsByDay = Array.from(runsByDayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([day, total]) => ({ day, total }));
  const maxRunsByDay = Math.max(1, ...runsByDay.map((i) => i.total));

  const engineUsageMap = new Map<string, number>();
  for (const run of recentRuns) {
    const toolRef = Array.isArray(run.tools) ? run.tools[0] : run.tools;
    const engine = toolRef?.engine_type ?? "unknown";
    engineUsageMap.set(engine, (engineUsageMap.get(engine) ?? 0) + 1);
  }
  const engineUsage = Array.from(engineUsageMap.entries())
    .map(([engine, total]) => ({ engine, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
  const maxEngine = Math.max(1, ...engineUsage.map((i) => i.total));

  const providerMap = new Map<string, { runs: number; cost: number }>();
  for (const row of todayProviderUsage) {
    const key = `${row.provider_id ?? "unknown"}:${row.model_id ?? "unknown"}`;
    const current = providerMap.get(key) ?? { runs: 0, cost: 0 };
    current.runs += 1;
    current.cost += Number(row.estimated_cost_usd ?? 0);
    providerMap.set(key, current);
  }

  const providerIds = Array.from(new Set(todayProviderUsage.map((p) => p.provider_id).filter(Boolean)));
  const modelIds = Array.from(new Set(todayProviderUsage.map((p) => p.model_id).filter(Boolean)));

  const [{ data: providerRows }, { data: modelRows }] = await Promise.all([
    providerIds.length
      ? supabase.from("ai_providers").select("id, name").in("id", providerIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
    modelIds.length
      ? supabase.from("ai_models").select("id, name").in("id", modelIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
  ]);

  const providerNameMap = new Map((providerRows ?? []).map((p) => [p.id, p.name]));
  const modelNameMap = new Map((modelRows ?? []).map((m) => [m.id, m.name]));

  const providerUsage = Array.from(providerMap.entries())
    .map(([key, value]) => {
      const [providerId, modelId] = key.split(":");
      const providerName = providerNameMap.get(providerId) ?? "Unknown Provider";
      const modelName = modelNameMap.get(modelId) ?? "Unknown Model";
      return {
        name: `${providerName} / ${modelName}`,
        runs: value.runs,
        cost: value.cost,
      };
    })
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 6);
  const maxProviderRuns = Math.max(1, ...providerUsage.map((i) => i.runs));

  const topToolsMap = new Map<string, number>();
  for (const run of recentRuns) {
    const toolRef = Array.isArray(run.tools) ? run.tools[0] : run.tools;
    const title = toolRef?.title_ar ?? "أداة غير معروفة";
    topToolsMap.set(title, (topToolsMap.get(title) ?? 0) + 1);
  }
  const topTools = Array.from(topToolsMap.entries())
    .map(([name, runs]) => ({ name, runs }))
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 8);
  const maxTopTools = Math.max(1, ...topTools.map((i) => i.runs));

  const totalRecentRuns = recentRuns.length;
  const failedRecentRuns = recentRuns.filter((run) => run.status === "failed").length;
  const errorRate = totalRecentRuns > 0 ? (failedRecentRuns / totalRecentRuns) * 100 : 0;

  const metrics = [
    { label: "Active Tools", value: formatNumber(activeToolsCount ?? 0), dataSourceMissing: false },
    { label: "Runs Today", value: formatNumber(runsToday), dataSourceMissing: false },
    { label: "Users", value: formatNumber(usersCount ?? 0), dataSourceMissing: false },
    { label: "AI Usage Today", value: formatNumber(aiUsageToday), dataSourceMissing: false },
    { label: "Estimated AI Cost", value: formatUsd(estimatedAiCostToday), dataSourceMissing: false },
    { label: "Credits Consumed", value: formatNumber(creditsConsumedToday), dataSourceMissing: false },
  ];

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">WEB EMPIRE ADMIN</div>
        <h1>نظرة عامة النظام</h1>
        <p>لوحة تشغيل حية مبنية على بيانات Supabase الفعلية.</p>
      </div>

      <div className="panel">
        <div className="chip-row">
          <span className="chip">WEB EMPIRE</span>
          <span className="chip">SYSTEM STATUS</span>
          <span className="chip">VERSION</span>
          <span className="chip" dir="ltr">{productVersion}</span>
          <span className="status-pill ok">ONLINE</span>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric) => (
          <div className="metric" key={metric.label}>
            <span>{metric.label}</span>
            <h2 dir="ltr">
              {metric.dataSourceMissing ? "DATA SOURCE NOT AVAILABLE" : metric.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <div className="card">
          <h3>RUNS - آخر 7 أيام</h3>
          <div className="bars">
            {runsByDay.length ? runsByDay.map((item) => (
              <div className="bar-row" key={item.day}>
                <div className="bar-row-head">
                  <span dir="ltr">{item.day}</span>
                  <strong dir="ltr">{item.total}</strong>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(item.total / maxRunsByDay) * 100}%` }} />
                </div>
              </div>
            )) : <p className="inline-note">لا توجد بيانات تشغيل حديثة.</p>}
          </div>
        </div>

        <div className="card">
          <h3>ENGINE USAGE</h3>
          <div className="bars">
            {engineUsage.length ? engineUsage.map((item) => (
              <div className="bar-row" key={item.engine}>
                <div className="bar-row-head">
                  <span dir="ltr">{item.engine}</span>
                  <strong dir="ltr">{item.total}</strong>
                </div>
                <div className="bar-track">
                  <div className="bar-fill gold" style={{ width: `${(item.total / maxEngine) * 100}%` }} />
                </div>
              </div>
            )) : <p className="inline-note">لا توجد بيانات كافية.</p>}
          </div>
        </div>

        <div className="card">
          <h3>AI PROVIDER USAGE / COST - اليوم</h3>
          <div className="bars">
            {providerUsage.length ? providerUsage.map((item) => (
              <div className="bar-row" key={item.name}>
                <div className="bar-row-head">
                  <span>{item.name}</span>
                  <strong dir="ltr">{item.runs} / {formatUsd(item.cost)}</strong>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(item.runs / maxProviderRuns) * 100}%` }} />
                </div>
              </div>
            )) : <p className="inline-note">لا يوجد استخدام AI مسجل اليوم.</p>}
          </div>
        </div>

        <div className="card">
          <h3>TOP TOOLS</h3>
          <div className="bars">
            {topTools.length ? topTools.map((item) => (
              <div className="bar-row" key={item.name}>
                <div className="bar-row-head">
                  <span>{item.name}</span>
                  <strong dir="ltr">{item.runs}</strong>
                </div>
                <div className="bar-track">
                  <div className="bar-fill gold" style={{ width: `${(item.runs / maxTopTools) * 100}%` }} />
                </div>
              </div>
            )) : <p className="inline-note">لا توجد بيانات أدوات كافية.</p>}
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>ERROR RATE</h3>
        <p className="inline-note">آخر 7 أيام</p>
        <div className="chip-row">
          <span className={`status-pill ${errorRate >= 15 ? "error" : errorRate > 5 ? "warn" : "ok"}`} dir="ltr">
            {errorRate.toFixed(2)}%
          </span>
          <span className="chip" dir="ltr">{failedRecentRuns} failed</span>
          <span className="chip" dir="ltr">{totalRecentRuns} total</span>
        </div>
      </div>

      <div className="section">
        <h3>LATEST RUNS</h3>
        <p className="inline-note">أحدث التشغيلات مع المزود/النموذج والتكلفة والنقاط</p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>User</th>
              <th>Engine</th>
              <th>Status</th>
              <th>AI Provider / Model</th>
              <th>Estimated Cost</th>
              <th>Credits Charged</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {latestRuns.map((run) => {
              const toolRef = Array.isArray(run.tools) ? run.tools[0] : run.tools;
              const providerRef = Array.isArray(run.ai_providers) ? run.ai_providers[0] : run.ai_providers;
              const modelRef = Array.isArray(run.ai_models) ? run.ai_models[0] : run.ai_models;
              const usageRef = Array.isArray(run.provider_usage) ? run.provider_usage : [];
              const estimatedCost = usageRef.reduce(
                (sum, usage) => sum + Number(usage.estimated_cost_usd ?? 0),
                0
              );
              const userDisplay = run.user_id ? profileMap.get(run.user_id) ?? run.user_id.slice(0, 8) : "-";

              return (
                <tr key={run.id}>
                  <td>{toolRef?.title_ar ?? "-"}</td>
                  <td dir="ltr">{userDisplay}</td>
                  <td dir="ltr">{toolRef?.engine_type ?? "-"}</td>
                  <td>
                    <span className={`status-pill ${statusClass(run.status)}`}>{run.status}</span>
                  </td>
                  <td>{providerRef?.name ?? "-"} / {modelRef?.name ?? "-"}</td>
                  <td dir="ltr">{formatUsd(estimatedCost)}</td>
                  <td dir="ltr">{formatNumber(Number(run.credits_charged ?? 0))}</td>
                  <td dir="ltr">{new Date(run.created_at).toLocaleString("en-GB", { hour12: false })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
