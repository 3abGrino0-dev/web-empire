# Tool Runtime and Billing

## Visual Tool Builder

الـWizard يبني تلقائيًا:

- `input_schema`
- `runtime_config`
- `output_schema`
- Skill bindings
- Plan access policies
- SEO metadata
- Arabic/English base translations

ويحفظها في Transaction واحدة.

## Engines المفعلة

### formula

`runtime_config`:

```json
{"expression":"(value / total) * 100"}
```

### text_transform

يدعم العمليات:

- trim
- uppercase
- lowercase
- collapse_whitespace
- prefix
- suffix

### ai_text / ai_structured

يستخدم Universal AI Provider Engine وSkills ونظام النقاط الديناميكي.

### http_api

يستخدم `runtime_connections` فقط. لا يمكن للمستخدم إرسال Base URL أو تحويل المنصة إلى proxy عام.

مثال config:

```json
{
  "connection_id": "UUID",
  "path": "/generate",
  "method": "POST",
  "body_template": "{\"topic\":\"{{input.topic}}\"}",
  "text_path": "data.text",
  "data_path": "data"
}
```

الحماية الحالية:

- HTTPS only.
- Admin-defined base URL.
- Relative path only.
- Blocks localhost/private literal IPs/metadata hosts.
- Redirects blocked.
- Timeout capped at 60 seconds and by Connection policy.
- Response body capped at 2 MB.
- Tool API request capped at 1 MB.

ملاحظة: Runtime Connections هي trust boundary. الأدمن يجب ألا يضيف Host غير موثوق.

### webhook

نفس Connection security ويجبر `POST`.

### workflow

الخطوات المدعومة:

- template
- formula
- http_api
- webhook
- ai_text
- ai_structured

كل خطوة تسجل داخل `workflow_step_runs`.

Dynamic workflow credits تجمع تكاليف AI الفعلية لكل steps. تكاليف APIs الخارجية غير المقاسة بالـtokens لا تعرف تلقائيًا؛ استخدم `fixed` pricing أو minimum points مناسبًا لها.

## Plan Limits

يوجد مستويان:

1. حدود الخطة العامة:
   - `daily_ai_runs`
   - `max_output_tokens`
2. حدود الأداة داخل الخطة:
   - allowed / denied
   - `daily_run_limit`
   - `max_output_tokens`

المحرك يطبق الحد الأضيق.

## Stripe subscriptions

### 1. Stripe Dashboard

أنشئ Products/Prices للخطط المدفوعة.

### 2. Web Empire Admin

من `/admin/billing`:

- أضف Stripe Secret Key.
- أضف Webhook Signing Secret.
- اربط كل Plan بـStripe `price_...`.

الأسرار تحفظ في Supabase Vault.

### 3. Webhook endpoint

```text
https://webempire.site/api/billing/webhooks/stripe
```

الأحداث المعالجة:

- `checkout.session.completed`
- `invoice.paid`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Stripe signature تتحقق قبل معالجة الحدث.

### 4. Idempotency

`billing_events` يمنع معالجة نفس Stripe Event مرتين.

`subscription_credit_grants.grant_key` يمنع منح نقاط أكثر من مرة لنفس subscription billing period، حتى لو وصلت فواتير أو retries متعددة.

### 5. Credits policy

عند نجاح invoice لدورة جديدة:

- تحدد الخطة `monthly_credits`.
- تضاف نقاط الدورة إلى Wallet.
- تسجل Credit Transaction.
- Grant Key يمنع التكرار.

الرصيد الحالي **rollover/additive**؛ لا يتم تصفير الرصيد غير المستخدم عند التجديد في v3.

## Billing adapter architecture

قلب المنصة لا يستدعي Stripe من صفحة التسعير مباشرة.

```text
Pricing UI
  ↓
Billing Service
  ↓
Billing Adapter Registry
  ↓
Stripe Checkout Adapter
```

إضافة بوابة دفع ثانية لاحقًا تعني Adapter جديد + normalized billing events، وليس إعادة بناء الخطط أو Wallet.
