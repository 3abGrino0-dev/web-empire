# إمبراطورية الويب — Web Empire Zero v4

مشروع SaaS متعدد اللغات والمزودات على `webempire.site`، ومعه تطبيق جوال أصلي
لـ Android وiOS داخل `apps/mobile`.

## النواة الحالية

- Next.js 16 App Router وRTL/LTR حسب اللغة.
- Supabase Auth وRLS وVault.
- Smart Country Language Router.
- Visual Identity Engine من لوحة الإدارة.
- Database-first Tool Factory.
- Visual Tool Builder Wizard.
- Formula / Text Transform / AI Text / AI Structured.
- HTTP API وWebhook عبر Trusted Runtime Connections.
- Workflow Runtime مع Step Runs.
- Universal AI Provider Engine وSkills.
- Plans + Credits + Wallet + Ledger.
- Stripe Checkout subscriptions.
- Billing webhooks مع signature verification وidempotency.
- Expo Router + React Native mobile app.
- نفس Supabase Auth والحساب والرصيد والخطة والتشغيلات بين الويب والجوال.
- Mobile Bearer API بدون كشف Prompt Templates أو Runtime Configs.
- لغة التطبيق عند أول تشغيل تستفيد من Country Language Router ثم تحفظ اختيار المستخدم.
- Light / Dark / System على الجوال.

## تطبيق الجوال

المجلد:

`apps/mobile`

تشغيل سريع:

```bash
npm run mobile:install
cp apps/mobile/.env.example apps/mobile/.env.local
npm run mobile:typecheck
npm run mobile:lint
npm run mobile:start
```

راجع `docs/MOBILE_APP.md`.

## التشغيل والنشر

راجع:

- `docs/SETUP.md`
- `docs/RUNTIME_AND_BILLING.md`
- `docs/MOBILE_APP.md`
