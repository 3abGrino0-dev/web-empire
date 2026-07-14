import { notFound } from "next/navigation";

import { signOut } from "@/actions/auth";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { translate } from "@/localization/messages";
import { getLocaleByCode, getUiMessages } from "@/localization/repository";
import { getActivePlans, getActiveTools } from "@/repositories/catalog";

const dashboardLabels = {
  ar: {
    title: "مساحتي",
    subtitle: "لوحة متابعة الرصيد والباقات والتشغيلات الأخيرة داخل Web Empire.",
    credits: "الرصيد",
    plan: "الباقة",
    recentRuns: "التشغيلات الأخيرة",
    tool: "الأداة",
    status: "الحالة",
    date: "التاريخ",
    noRunsTitle: "لا توجد تشغيلات بعد",
    noRunsBody: "ابدأ أول تشغيل لأداة وسيظهر السجل هنا تلقائيًا.",
    signOut: "تسجيل الخروج",
    points: "نقطة",
    myEmpire: "Web Empire",
    completed: "مكتمل",
    failed: "فشل",
    running: "قيد التنفيذ",
  },
  en: {
    title: "My space",
    subtitle: "A quick view of credits, plan, and your latest executions in Web Empire.",
    credits: "Credits",
    plan: "Plan",
    recentRuns: "Recent runs",
    tool: "Tool",
    status: "Status",
    date: "Date",
    noRunsTitle: "No runs yet",
    noRunsBody: "Run any tool and your activity will appear here.",
    signOut: "Sign out",
    points: "points",
    myEmpire: "Web Empire",
    completed: "Completed",
    failed: "Failed",
    running: "Running",
  },
} as const;

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeCode } = await params;
  const locale = await getLocaleByCode(localeCode);
  if (!locale) notFound();

  const userId = await requireUser(`/${locale.code}/auth/login`);
  const supabase = await createSupabaseServerClient();

  const [
    { data: wallet },
    { data: subscription },
    { data: runs },
    messages,
    tools,
    plans,
  ] = await Promise.all([
    supabase.from("credit_wallets").select("*").eq("user_id", userId).single(),
    supabase
      .from("user_subscriptions")
      .select("plan_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("tool_runs")
      .select("id, tool_id, status, credits_charged, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    getUiMessages(locale),
    getActiveTools(locale.code),
    getActivePlans(locale.code),
  ]);

  const toolMap = new Map(tools.map((tool) => [tool.id, tool.title]));
  const plan = plans.find((item) => item.id === subscription?.plan_id);
  const t = locale.code === "ar" ? dashboardLabels.ar : dashboardLabels.en;

  const localizeStatus = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "completed") return t.completed;
    if (normalized === "failed") return t.failed;
    if (normalized === "running") return t.running;
    return status;
  };

  const statusTone = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "completed") return "is-completed";
    if (normalized === "failed") return "is-failed";
    if (normalized === "running") return "is-running";
    return "is-neutral";
  };

  return (
    <main className="we-dashboard-page">
      <div className="we-container we-dashboard-shell">
        <section className="we-dashboard-hero">
          <div className="we-dashboard-heading">
            <div>
              <p className="we-dashboard-kicker">{t.myEmpire}</p>
              <h1>{t.title}</h1>
              <p>{t.subtitle}</p>
            </div>
          </div>

          <div className="we-dashboard-hero-side">
            <form action={signOut}>
              <input type="hidden" name="locale" value={locale.code} />
              <button type="submit" className="we-button-ghost we-dashboard-signout">
                {t.signOut}
              </button>
            </form>
          </div>
        </section>

        <section className="we-dashboard-metrics" aria-label="Dashboard summary">
          <article className="we-dashboard-metric">
            <span className="we-dashboard-metric-icon is-violet" aria-hidden="true">◉</span>
            <div>
              <p>{t.credits}</p>
              <h2>
                {wallet?.balance ?? 0} {locale.code === "ar" ? t.points : translate(messages, "common.points")}
              </h2>
            </div>
          </article>
          <article className="we-dashboard-metric">
            <span className="we-dashboard-metric-icon is-gold" aria-hidden="true">◆</span>
            <div>
              <p>{t.plan}</p>
              <h2>{plan?.localizedName ?? translate(messages, "common.free")}</h2>
            </div>
          </article>
          <article className="we-dashboard-metric">
            <span className="we-dashboard-metric-icon is-soft" aria-hidden="true">◌</span>
            <div>
              <p>{t.recentRuns}</p>
              <h2>{runs?.length ?? 0}</h2>
            </div>
          </article>
        </section>

        <section className="we-dashboard-table-card">
          <div className="we-dashboard-table-head">
            <h2>{t.recentRuns}</h2>
            <p>{(runs ?? []).length}</p>
          </div>

          <div className="we-dashboard-table-scroll">
            <table className="we-dashboard-table">
              <thead>
                <tr>
                  <th>{t.tool}</th>
                  <th>{t.status}</th>
                  <th>{t.credits}</th>
                  <th>{t.date}</th>
                </tr>
              </thead>
              <tbody>
                {(runs ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="we-dashboard-empty">
                        <strong>{t.noRunsTitle}</strong>
                        <p>{t.noRunsBody}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  (runs ?? []).map((run) => (
                    <tr key={run.id}>
                      <td>{toolMap.get(run.tool_id) ?? t.tool}</td>
                      <td>
                        <span className={`we-dashboard-status ${statusTone(run.status)}`}>
                          {localizeStatus(run.status)}
                        </span>
                      </td>
                      <td>{run.credits_charged}</td>
                      <td>{new Date(run.created_at).toLocaleString(locale.locale_code)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
