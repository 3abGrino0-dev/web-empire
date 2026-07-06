import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { translate } from "@/localization/messages";
import { getLocaleByCode, getUiMessages } from "@/localization/repository";
import { getActivePlans, getActiveTools } from "@/repositories/catalog";

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

  return (
    <main className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">MY EMPIRE</div>
            <h2>{translate(messages, "dashboard.title")}</h2>
            <p>Credits, plan and recent runs.</p>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric">
            <span>Credits</span>
            <h2>{wallet?.balance ?? 0} {translate(messages, "common.points")}</h2>
          </div>
          <div className="metric">
            <span>Plan</span>
            <h2>{plan?.localizedName ?? translate(messages, "common.free")}</h2>
          </div>
          <div className="metric">
            <span>Recent runs</span>
            <h2>{runs?.length ?? 0}</h2>
          </div>
        </div>

        <div className="section">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tool</th><th>Status</th><th>Credits</th><th>Date</th></tr></thead>
              <tbody>
                {(runs ?? []).map((run) => (
                  <tr key={run.id}>
                    <td>{toolMap.get(run.tool_id) ?? "Tool"}</td>
                    <td>{run.status}</td>
                    <td>{run.credits_charged}</td>
                    <td>{new Date(run.created_at).toLocaleString(locale.locale_code)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
