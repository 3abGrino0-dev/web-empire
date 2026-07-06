# إعداد Web Empire Zero v3

## 1. Supabase

أنشئ مشروع Supabase جديد ثم نفذ الـMigrations **بالترتيب**:

1. `supabase/migrations/202607060001_web_empire_zero.sql`
2. `supabase/migrations/202607060002_localization_visual_engine.sql`
3. `supabase/migrations/202607060003_tool_builder_runtime_billing.sql`

## 2. Environment

انسخ `.env.example` إلى `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://webempire.site
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

`SUPABASE_SECRET_KEY` خادمي فقط ولا يوضع داخل أي متغير يبدأ بـ`NEXT_PUBLIC_`.

## 3. التشغيل

```bash
npm ci
npm run typecheck
npm run lint
npm run build
npm run dev
```

## 4. أول Admin

أنشئ حسابًا من `/ar/auth/login` ثم نفذ في Supabase SQL Editor:

```sql
insert into public.admin_users (user_id)
select id
from auth.users
where email = 'YOUR_EMAIL@example.com'
on conflict do nothing;
```

بعدها افتح `/admin`.

## 5. مزودات AI

من `/admin/providers`:

- أضف Provider.
- أضف API Secret.
- أضف Model Alias مثل `standard` أو `premium`.
- اضبط أسعار input/output لكل مليون token.

أسرار AI تحفظ في Supabase Vault.

## 6. Runtime Connections

من `/admin/connections` أضف API موثوقًا:

- Base URL يجب أن يكون HTTPS.
- الـHost يثبت من الأدمن.
- Secret يحفظ في Vault.
- Tool/Workflow يستخدم Path نسبيًا فقط.

## 7. Workflows

من `/admin/workflows` أنشئ خطوات متسلسلة.

الوصول للسياق:

```text
{{input.topic}}
{{steps.outline.text}}
{{steps.analysis.data.score}}
```

## 8. Visual Tool Builder

من `/admin/tools/new`:

1. المعلومات.
2. حقول الأداة.
3. المحرك.
4. Skills.
5. النقاط وحدود الخطط.
6. SEO.
7. Preview ثم Publish.

إنشاء الأداة يتم Transactionally داخل PostgreSQL عبر `create_tool_from_builder`.

## 9. Stripe Billing

راجع `docs/RUNTIME_AND_BILLING.md`.
