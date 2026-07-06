# تقرير تسليم — إمبراطورية الويب من الصفر

تاريخ البناء: 6 يوليو 2026

## حالة الفحص

تم تنفيذ الفحوص التالية على المشروع الجديد:

```text
npm run typecheck      PASS — 0 TypeScript errors
npm run lint           PASS — 0 ESLint errors
npm run build          PASS — Next.js production build
npm audit --omit=dev   PASS — 0 vulnerabilities
```

تم تحليل ملف Migration بواسطة PostgreSQL parser (`pglast`):

```text
PGLAST_PARSE_OK
104 statements parsed
```

تم اختبار Formula Engine فعليًا:

```text
(value / total) * 100              PASS
((price - cost) / price) * 100     PASS
2 ^ 3 + 4 * 5                      PASS
-5 + 8                             PASS
division-by-zero guard             PASS
```

## ما يعمل فعليًا في Runtime v1

### Formula
يعمل فعليًا من قاعدة البيانات عبر `runtime_config.expression`.

### AI Text
يعمل عبر Universal Provider Router.

### AI Structured
يعمل ويطلب Structured JSON عند دعم الـAdapter.

## مزودات AI المنفذة

- OpenAI Responses API
- Anthropic Messages API
- Gemini generateContent
- OpenAI-compatible Chat Completions
- Custom HTTP mapping

## Skills

- إنشاء Skill من Admin.
- Version 1 عند الإنشاء.
- current_version_id.
- ربط Skill بعدة أدوات.
- ترتيب Skills.
- تجميع التعليمات قبل استدعاء المزود.

## النقاط

- Wallet.
- Ledger.
- Credit Reservation.
- Reserve before provider call.
- Settle after real usage.
- Release on failure.
- Extra usage adjustment supported.
- Dynamic pricing from model pricing + platform multiplier.

## الخطط

Seed:

- مجاني: 300 نقطة
- أساسي: 3,000 نقطة / 29 ر.س
- احترافي: 12,000 نقطة / 79 ر.س
- أعمال: 40,000 نقطة / 199 ر.س

يمكن تعديل السعر والنقاط من `/admin/plans`.

## Admin

المسارات:

- `/admin`
- `/admin/tools`
- `/admin/tools/new`
- `/admin/providers`
- `/admin/skills`
- `/admin/plans`
- `/admin/runs`

الحماية:

- Supabase Auth.
- `admin_users`.
- `requireAdmin()` على Admin Layout.
- Server Actions تعيد فحص Admin.
- Service secret خادمي فقط.
- Provider API Keys في Supabase Vault.

## Database-first

لا يوجد `CategorySlug` ثابت.
لا يوجد Registry يعتمد على Slug محلي لكل أداة.
الأداة تعرف من قاعدة البيانات.

## أنواع المحركات المحجوزة في Schema

الـschema يعرف:

- `text_transform`
- `http_api`
- `webhook`
- `workflow`
- `custom_runtime`

لكن Runtime v1 لا يدعي تشغيلها بعد. عند استدعائها يعيد رسالة صريحة أن المحرك غير مفعل في v1.

الهدف أن نضيف Runtime آمن لكل نوع فوق القاعدة الحالية، بدون إعادة بناء Tool Factory أو Database.

## غير مربوط في هذه النسخة

- بوابة دفع فعلية.
- تجديد شهري آلي للاشتراكات.
- شراء باقات نقاط.
- Streaming UI.
- Workflow Engine متعدد الخطوات.
- File uploads.
- AI image/audio/video adapters.

هذه ليست أزرارًا وهمية داخل المشروع. لم أضف واجهات تدعي تشغيلها.

## أول تشغيل

راجع `docs/SETUP.md`.
