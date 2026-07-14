import Link from "next/link";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  PRODUCT_CORE_VERSION,
  PRODUCT_DESIGN_VERSION,
  formatProductVersion,
} from "@/lib/product-version";

const RIYADH_TIME_ZONE = "Asia/Riyadh";
const RIYADH_OFFSET = "+03:00";

function getRiyadhDateKey(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: RIYADH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function getRiyadhStartOfDayIso(dateKey: string) {
  return `${dateKey}T00:00:00${RIYADH_OFFSET}`;
}

function getRecentRiyadhDateKeys(days: number) {
  const todayKey = getRiyadhDateKey();
  const todayStart = new Date(getRiyadhStartOfDayIso(todayKey));
  const keys: string[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const current = new Date(todayStart);
    current.setUTCDate(current.getUTCDate() - index);
    keys.push(getRiyadhDateKey(current));
  }

  return keys;
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

function formatActivityTime(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    timeZone: RIYADH_TIME_ZONE,
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminPage() {
  const supabase = createSupabaseAdminClient();
  const todayDateKey = getRiyadhDateKey();
  const todayLowerBoundIso = getRiyadhStartOfDayIso(todayDateKey);
  const recentDateKeys = getRecentRiyadhDateKeys(7);
  const recentLowerBoundIso = getRiyadhStartOfDayIso(recentDateKeys[0] ?? todayDateKey);

  const [
    activeToolsResult,
    usersResult,
    todayRunsResult,
    todayProviderUsageResult,
    recentRunsResult,
    latestRunsResult,
  ] = await Promise.all([
    supabase.from("tools").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("tool_runs")
      .select("id, status, credits_charged, created_at")
      .gte("created_at", todayLowerBoundIso)
      .limit(5000),
    supabase
      .from("provider_usage")
      .select("id, estimated_cost_usd, created_at")
      .gte("created_at", todayLowerBoundIso)
      .limit(5000),
    supabase
      .from("tool_runs")
      .select("id, status, created_at, tool_id, tools(title_ar, engine_type)")
      .gte("created_at", recentLowerBoundIso)
      .limit(5000),
    supabase
      .from("tool_runs")
      .select(
        "id, status, credits_charged, created_at, tools(title_ar, engine_type), user_id"
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const activeToolsAvailable = !activeToolsResult.error;
  const usersAvailable = !usersResult.error;
  const runsTodayAvailable = !todayRunsResult.error;
  const aiUsageAvailable = !todayProviderUsageResult.error;
  const recentRunsAvailable = !recentRunsResult.error;
  const latestRunsAvailable = !latestRunsResult.error;

  const todayRuns = runsTodayAvailable ? todayRunsResult.data ?? [] : [];
  const todayProviderUsage = aiUsageAvailable ? todayProviderUsageResult.data ?? [] : [];
  const recentRuns = recentRunsAvailable ? recentRunsResult.data ?? [] : [];
  const latestRuns = latestRunsAvailable ? latestRunsResult.data ?? [] : [];

  const userIds = Array.from(
    new Set(latestRuns.map((run) => run.user_id).filter((value): value is string => Boolean(value)))
  );

  const profileRowsResult = userIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
    : {
        data: [] as Array<{ id: string; display_name: string | null }>,
        error: null,
      };

  const profileMap = new Map(
    (profileRowsResult.data ?? []).map((profile) => [profile.id, profile.display_name])
  );

  const activeToolsCount = activeToolsAvailable ? activeToolsResult.count ?? 0 : 0;
  const usersCount = usersAvailable ? usersResult.count ?? 0 : 0;
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

  const productVersion = activeToolsAvailable
    ? formatProductVersion(activeToolsCount)
    : "VERSION UNAVAILABLE";

  const runsByDayMap = new Map<string, number>();
  for (const dayKey of recentDateKeys) runsByDayMap.set(dayKey, 0);

  for (const run of recentRuns) {
    const key = getRiyadhDateKey(new Date(run.created_at));
    runsByDayMap.set(key, (runsByDayMap.get(key) ?? 0) + 1);
  }

  const runsByDay = recentDateKeys.map((day) => ({
    day,
    total: runsByDayMap.get(day) ?? 0,
  }));
  const maxRunsByDay = Math.max(1, ...runsByDay.map((item) => item.total));

  const topToolsMap = new Map<string, number>();
  for (const run of recentRuns) {
    const toolRef = Array.isArray(run.tools) ? run.tools[0] : run.tools;
    const title = toolRef?.title_ar ?? "أداة غير معروفة";
    topToolsMap.set(title, (topToolsMap.get(title) ?? 0) + 1);
  }

  const topTools = Array.from(topToolsMap.entries())
    .map(([name, runs]) => ({ name, runs }))
    .sort((first, second) => second.runs - first.runs)
    .slice(0, 5);

  const maxTopToolRuns = Math.max(1, ...topTools.map((item) => item.runs));

  const totalRecentRuns = recentRuns.length;
  const failedRecentRuns = recentRuns.filter((run) => run.status === "failed").length;
  const errorRate = totalRecentRuns > 0 ? (failedRecentRuns / totalRecentRuns) * 100 : 0;

  const healthSources = [
    { label: "قاعدة بيانات الأدوات", healthy: activeToolsAvailable },
    { label: "حسابات المستخدمين", healthy: usersAvailable },
    { label: "عمليات التشغيل", healthy: runsTodayAvailable },
    { label: "استخدام الذكاء الاصطناعي", healthy: aiUsageAvailable },
  ];

  const allHealthy = healthSources.every((source) => source.healthy);

  const metrics = [
    {
      label: "إجمالي المستخدمين",
      value: usersAvailable ? formatNumber(usersCount) : "—",
      helper: "الحسابات المسجلة",
      tone: "purple",
    },
    {
      label: "الأدوات النشطة",
      value: activeToolsAvailable ? formatNumber(activeToolsCount) : "—",
      helper: "جاهزة للاستخدام",
      tone: "gold",
    },
    {
      label: "تشغيلات اليوم",
      value: runsTodayAvailable ? formatNumber(runsToday) : "—",
      helper: "منذ بداية اليوم",
      tone: "green",
    },
    {
      label: "استخدام AI اليوم",
      value: aiUsageAvailable ? formatNumber(aiUsageToday) : "—",
      helper: "طلبات مزودي AI",
      tone: "blue",
    },
    {
      label: "النقاط المستهلكة",
      value: runsTodayAvailable ? formatNumber(creditsConsumedToday) : "—",
      helper: "إجمالي اليوم",
      tone: "purple",
    },
    {
      label: "تكلفة AI",
      value: aiUsageAvailable ? formatUsd(estimatedAiCostToday) : "—",
      helper: "تقدير اليوم",
      tone: "gold",
    },
  ];

  return (
    <div className="adminv3-dashboard">
      <section className="adminv3-page-heading">
        <div>
          <h2>مرحبًا، هذه نظرة عامة على المنصة</h2>
          <p>مؤشرات مباشرة عن المستخدمين والأدوات والتشغيلات وحالة النظام.</p>
        </div>
        <div className="adminv3-heading-actions">
          <span className={`adminv3-status ${allHealthy ? "" : "is-warn"}`}>
            {allHealthy ? "جميع الأنظمة تعمل" : "بعض الخدمات تحتاج مراجعة"}
          </span>
          <Link href="/admin/audit" className="adminv3-secondary-link">
            سجل الإجراءات
          </Link>
        </div>
      </section>

      <section className="adminv3-kpi-grid" aria-label="المؤشرات الرئيسية">
        {metrics.map((metric, index) => (
          <article className="adminv3-kpi-card" key={metric.label}>
            <div className="adminv3-kpi-head">
              <span>{metric.label}</span>
              <span className="adminv3-kpi-icon">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <strong>{metric.value}</strong>
            <small>{metric.helper}</small>
          </article>
        ))}
      </section>

      <section className="adminv3-dashboard-grid">
        <article className="adminv3-card">
          <header className="adminv3-card-header">
            <div>
              <h3>نشاط التشغيل خلال آخر 7 أيام</h3>
              <p>عدد التشغيلات المسجلة يوميًا بتوقيت الرياض.</p>
            </div>
            <span className="adminv3-status">بيانات مباشرة</span>
          </header>

          <div className="adminv3-chart">
            {runsByDay.map((item) => {
              const height = Math.max(4, (item.total / maxRunsByDay) * 100);
              return (
                <div className="adminv3-chart-column" key={item.day}>
                  <strong>{item.total}</strong>
                  <div className="adminv3-chart-bar-wrap">
                    <span className="adminv3-chart-bar" style={{ height: `${height}%` }} />
                  </div>
                  <span>{item.day.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="adminv3-card">
          <header className="adminv3-card-header">
            <div>
              <h3>آخر النشاطات</h3>
              <p>أحدث عمليات التشغيل على المنصة.</p>
            </div>
            <Link href="/admin/runs" className="adminv3-secondary-link">
              عرض الكل
            </Link>
          </header>

          <div className="adminv3-activity-list">
            {!latestRunsAvailable ? (
              <p className="inline-note">تعذر قراءة أحدث النشاطات.</p>
            ) : latestRuns.length ? (
              latestRuns.map((run) => {
                const toolRef = Array.isArray(run.tools) ? run.tools[0] : run.tools;
                const userDisplay = run.user_id
                  ? profileMap.get(run.user_id) ?? run.user_id.slice(0, 8)
                  : "مستخدم غير معروف";

                return (
                  <div className="adminv3-activity-item" key={run.id}>
                    <span className="adminv3-activity-icon">
                      {run.status === "completed" ? "✓" : run.status === "failed" ? "!" : "•"}
                    </span>
                    <span className="adminv3-activity-copy">
                      <strong>{toolRef?.title_ar ?? "تشغيل أداة"}</strong>
                      <small>{userDisplay}</small>
                    </span>
                    <time className="adminv3-activity-time">
                      {formatActivityTime(run.created_at)}
                    </time>
                  </div>
                );
              })
            ) : (
              <p className="inline-note">لا توجد نشاطات حديثة.</p>
            )}
          </div>
        </article>
      </section>

      <section className="adminv3-bottom-grid">
        <article className="adminv3-card">
          <header className="adminv3-card-header">
            <div>
              <h3>حالة النظام</h3>
              <p>فحص مصادر البيانات الأساسية.</p>
            </div>
            <span className={`adminv3-status ${allHealthy ? "" : "is-warn"}`}>
              {allHealthy ? "سليم" : "يحتاج متابعة"}
            </span>
          </header>

          <div className="adminv3-health-list">
            {healthSources.map((source) => (
              <div className="adminv3-health-row" key={source.label}>
                <span>{source.label}</span>
                <strong className={source.healthy ? "adminv3-health-ok" : ""}>
                  {source.healthy ? "متصل" : "غير متاح"}
                </strong>
              </div>
            ))}
            <div className="adminv3-health-row">
              <span>معدل الأخطاء — 7 أيام</span>
              <strong className={errorRate <= 5 ? "adminv3-health-ok" : ""}>
                {errorRate.toFixed(2)}%
              </strong>
            </div>
          </div>
        </article>

        <article className="adminv3-card">
          <header className="adminv3-card-header">
            <div>
              <h3>الأدوات الأكثر استخدامًا</h3>
              <p>حسب تشغيلات آخر 7 أيام.</p>
            </div>
          </header>

          <div className="adminv3-ranking">
            {topTools.length ? (
              topTools.map((tool) => (
                <div className="adminv3-ranking-row" key={tool.name}>
                  <span>{tool.name}</span>
                  <div className="adminv3-inline-actions">
                    <div className="adminv3-progress">
                      <span style={{ width: `${(tool.runs / maxTopToolRuns) * 100}%` }} />
                    </div>
                    <strong>{tool.runs}</strong>
                  </div>
                </div>
              ))
            ) : (
              <p className="inline-note">لا توجد بيانات كافية حتى الآن.</p>
            )}
          </div>
        </article>

        <article className="adminv3-card">
          <header className="adminv3-card-header">
            <div>
              <h3>إجراءات سريعة</h3>
              <p>اختصارات لأكثر العمليات استخدامًا.</p>
            </div>
          </header>

          <div className="adminv3-quick-actions">
            <Link href="/admin/users" className="adminv3-quick-action">إدارة المستخدمين</Link>
            <Link href="/admin/tools/new" className="adminv3-quick-action">إضافة أداة</Link>
            <Link href="/admin/plans" className="adminv3-quick-action">الخطط والنقاط</Link>
            <Link href="/admin/audit" className="adminv3-quick-action">سجل الإجراءات</Link>
          </div>

          <div className="adminv3-health-list" style={{ marginTop: 14 }}>
            <div className="adminv3-health-row">
              <span>إصدار المنتج</span>
              <strong>{productVersion}</strong>
            </div>
            <div className="adminv3-health-row">
              <span>Core / Design</span>
              <strong>{PRODUCT_CORE_VERSION} / {PRODUCT_DESIGN_VERSION}</strong>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
