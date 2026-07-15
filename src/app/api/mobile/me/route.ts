import { corsJson, corsOptions } from "@/lib/api-cors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserId } from "@/lib/request-auth";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return corsOptions();
}

export async function GET(request: Request) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) return corsJson({ error: "LOGIN_REQUIRED" }, { status: 401 });

    const supabase = createSupabaseAdminClient();
    const [{ data: wallet }, { data: subscription }, { data: runs }, userResult] =
      await Promise.all([
        supabase.from("credit_wallets").select("balance").eq("user_id", userId).maybeSingle(),
        supabase
          .from("user_subscriptions")
          .select("status, current_period_start, current_period_end, cancel_at_period_end, plans(id, slug, name_ar, name_en, monthly_credits)")
          .eq("user_id", userId)
          .eq("status", "active")
          .maybeSingle(),
        supabase
          .from("tool_runs")
          .select("id, status, credits_charged, created_at, tools(slug, title_ar, title_en)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase.auth.admin.getUserById(userId),
      ]);

    return corsJson({
      user: {
        id: userId,
        email: userResult.data.user?.email ?? null,
      },
      wallet: { balance: Number(wallet?.balance ?? 0) },
      subscription,
      runs: runs ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "MOBILE_ACCOUNT_FAILED";
    return corsJson({ error: message }, { status: 500 });
  }
}
