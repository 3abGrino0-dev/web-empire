import { updatePlanCreditsAction } from "@/actions/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function PlansPage() {
  const supabase = createSupabaseAdminClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .order("sort_order");

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">CREDITS ENGINE</div>
        <h1>النقاط والخطط</h1>
        <p>عدل السعر والنقاط الشهرية وحدود تشغيل الذكاء الاصطناعي من اللوحة.</p>
      </div>

      <div className="pricing-grid">
        {plans?.map((plan) => (
          <form
            action={updatePlanCreditsAction}
            className="price-card admin-form"
            key={plan.id}
          >
            <input type="hidden" name="id" value={plan.id} />
            <h3>{plan.name_ar}</h3>

            <label>
              السعر ر.س
              <input
                name="price_sar"
                type="number"
                step="0.01"
                defaultValue={plan.price_sar}
              />
            </label>

            <label>
              النقاط الشهرية
              <input
                name="monthly_credits"
                type="number"
                defaultValue={plan.monthly_credits}
              />
            </label>

            <label>
              AI Runs / Day
              <input
                name="daily_ai_runs"
                type="number"
                min="1"
                defaultValue={plan.daily_ai_runs ?? ""}
                placeholder="بدون حد"
              />
            </label>

            <label>
              Max Output Tokens
              <input
                name="max_output_tokens"
                type="number"
                min="1"
                defaultValue={plan.max_output_tokens ?? ""}
                placeholder="بدون حد عام"
              />
            </label>

            <button className="button button-dark">حفظ</button>
          </form>
        ))}
      </div>
    </>
  );
}
