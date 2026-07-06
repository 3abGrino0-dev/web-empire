import {
  createBillingProviderAction,
  upsertBillingPlanPriceAction,
} from "@/actions/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env";

export default async function BillingPage() {
  const supabase = createSupabaseAdminClient();
  const [{ data: providers }, { data: plans }, { data: prices }, { data: events }] = await Promise.all([
    supabase.from("billing_providers").select("id, name, slug, adapter_type, secret_id, webhook_secret_id, priority, is_active").order("priority"),
    supabase.from("plans").select("id, name_ar, price_sar, monthly_credits").eq("is_active", true).order("sort_order"),
    supabase.from("billing_plan_prices").select("id, billing_provider_id, plan_id, external_price_id, currency, is_active"),
    supabase.from("billing_events").select("id, external_event_id, event_type, status, attempt_count, created_at, error_message").order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <>
      <div className="admin-head">
        <div className="eyebrow">BILLING ENGINE</div>
        <h1>الاشتراكات والدفع</h1>
        <p>Stripe Checkout هو أول Adapter فعلي. مفاتيح API وWebhook تحفظ في Vault.</p>
      </div>

      <div className="feature-grid">
        <form action={createBillingProviderAction} className="panel admin-form">
          <h2>إضافة Stripe</h2>
          <label>الاسم<input name="name" defaultValue="Stripe" required /></label>
          <label>Slug<input name="slug" defaultValue="stripe" required /></label>
          <label>Priority<input name="priority" type="number" defaultValue="100" /></label>
          <label>Secret Key<input name="api_secret" type="password" autoComplete="new-password" required /></label>
          <label>Webhook Signing Secret<input name="webhook_secret" type="password" autoComplete="new-password" required /></label>
          <label>Config JSON<textarea name="config" defaultValue="{}" /></label>
          <label><input type="checkbox" name="is_active" defaultChecked /> نشط</label>
          <button className="button button-primary">حفظ مزود الدفع</button>
          <small>Webhook URL: {publicEnv.siteUrl}/api/billing/webhooks/stripe</small>
        </form>

        <form action={upsertBillingPlanPriceAction} className="panel admin-form">
          <h2>ربط الخطة بسعر Stripe</h2>
          <label>مزود الدفع<select name="billing_provider_id" required>{(providers ?? []).map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}</select></label>
          <label>الخطة<select name="plan_id" required>{(plans ?? []).map((plan) => <option key={plan.id} value={plan.id}>{plan.name_ar} — {plan.price_sar} ر.س</option>)}</select></label>
          <label>Stripe Price ID<input name="external_price_id" required placeholder="price_..." /></label>
          <label>Currency<input name="currency" defaultValue="sar" /></label>
          <button className="button button-dark">حفظ الربط</button>
        </form>
      </div>

      <div className="section">
        <h2>المزودون والأسعار</h2>
        <div className="table-wrap"><table><thead><tr><th>المزود</th><th>Adapter</th><th>API</th><th>Webhook</th><th>الحالة</th></tr></thead><tbody>{(providers ?? []).map((provider) => <tr key={provider.id}><td>{provider.name}</td><td>{provider.adapter_type}</td><td>{provider.secret_id ? "Vault ✓" : "Missing"}</td><td>{provider.webhook_secret_id ? "Vault ✓" : "Missing"}</td><td>{provider.is_active ? "نشط" : "متوقف"}</td></tr>)}</tbody></table></div>
        <div className="table-wrap" style={{ marginTop: 18 }}><table><thead><tr><th>المزود</th><th>الخطة</th><th>External Price</th><th>Currency</th></tr></thead><tbody>{(prices ?? []).map((price) => <tr key={price.id}><td>{(providers ?? []).find((item) => item.id === price.billing_provider_id)?.name ?? "-"}</td><td>{(plans ?? []).find((item) => item.id === price.plan_id)?.name_ar ?? "-"}</td><td>{price.external_price_id}</td><td>{price.currency}</td></tr>)}</tbody></table></div>
      </div>

      <div className="section">
        <h2>آخر أحداث الفوترة</h2>
        <div className="table-wrap"><table><thead><tr><th>Event</th><th>النوع</th><th>الحالة</th><th>Attempts</th><th>الخطأ</th></tr></thead><tbody>{(events ?? []).map((event) => <tr key={event.id}><td>{event.external_event_id}</td><td>{event.event_type}</td><td>{event.status}</td><td>{event.attempt_count}</td><td>{event.error_message ?? "-"}</td></tr>)}</tbody></table></div>
      </div>
    </>
  );
}
