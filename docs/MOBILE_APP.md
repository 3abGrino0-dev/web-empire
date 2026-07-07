# Web Empire Mobile App

## الهدف

تطبيق React Native/Expo أصلي لـ Android وiOS. التطبيق ليس WebView.

الويب يبقى Backend وRuntime للأدوات والذكاء الاصطناعي والـWorkflow والفوترة.
التطبيق يستخدم نفس Supabase Auth ويرسل Access Token كـ Bearer Token إلى API
الخاص بـ `webempire.site`.

## ما هو موحد بين الويب والجوال؟

- المستخدم
- Supabase session
- الرصيد
- الخطة
- حدود الخطط
- الأدوات
- Tool Factory schemas
- Tool runs
- Credits reservation / settlement
- AI providers
- Skills
- Workflows
- Billing checkout

## بنية التطبيق

`apps/mobile`

المسارات الأساسية:

- `(tabs)/index` — الرئيسية
- `(tabs)/tools` — كتالوج الأدوات
- `(tabs)/wallet` — الرصيد والخطة والتشغيلات
- `(tabs)/settings` — اللغة والمظهر والحساب
- `tool/[slug]` — أداة ديناميكية
- `pricing` — الخطط والاشتراك
- `sign-in` — تسجيل الدخول وإنشاء الحساب

## Mobile API في Next.js

- `/api/mobile/bootstrap`
- `/api/mobile/tools/[slug]`
- `/api/mobile/me`
- `/api/tools/[slug]/run`
- `/api/billing/checkout`

`bootstrap` و`tool detail` يعيدان بيانات واجهة آمنة فقط. لا يعيدان
`prompt_template` أو أسرار المزود أو إعدادات Runtime الحساسة.

## البيئة

أنشئ:

`apps/mobile/.env.local`

من:

`apps/mobile/.env.example`

القيم:

```env
EXPO_PUBLIC_API_URL=https://webempire.site
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

ممنوع وضع:

- `SUPABASE_SECRET_KEY`
- Stripe Secret Key
- AI provider secrets
- Vault secrets

داخل تطبيق الجوال.

## تشغيل داخل Codespace

من جذر المشروع:

```bash
npm run mobile:install
cp apps/mobile/.env.example apps/mobile/.env.local
```

عدّل القيم العامة في `.env.local`.

ثم:

```bash
npm run mobile:typecheck
npm run mobile:lint
npm run mobile:start
```

أو:

```bash
cd apps/mobile
npm ci
npx expo start
```

## EAS Build

داخل `apps/mobile`:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

نسخة Android Preview قابلة للتثبيت مباشرة كـ APK:

```bash
npx eas-cli@latest build -p android --profile preview
```

تم ضبط `eas.json` بحيث `preview.android.buildType = apk`.

نسخة Production للمنصتين:

```bash
npx eas-cli@latest build --platform all --profile production
```

## قبل EAS Build

تأكد من إعداد قيم Expo العامة في بيئة EAS أو في إعدادات مشروع Expo:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

لا ترفع `.env.local` إلى Git.

## ترتيب النشر الصحيح

1. انشر Web Empire v4 Backend أولًا.
2. طبق Migrations الحالية في Supabase.
3. تحقق أن `webempire.site` يعمل.
4. اختبر `/api/mobile/bootstrap?locale=auto`.
5. اختبر Login من التطبيق.
6. اختبر Formula tool.
7. اختبر Wallet وRun History.
8. ابنِ Android Preview APK.
9. بعد فحص APK، ابنِ Production Android/iOS.

## Auth Storage

تخزن جلسة Supabase Native عبر `expo-secure-store`.

التنفيذ الحالي يستخدم Adapter يقسم البيانات الطويلة إلى Chunks قبل تخزينها في
SecureStore، ثم يعيد تركيبها عند القراءة.

`AsyncStorage` يستخدم فقط لتفضيل اللغة ووضع Light/Dark/System.

## اللغة

أول تشغيل بلا تفضيل محلي:

```text
Mobile
→ /api/mobile/bootstrap?locale=auto
→ Account preference
→ Cookie when applicable
→ Country mapping/group
→ Accept-Language from device
→ English
```

بعد اختيار المستخدم لغة يدويًا، تحفظ محليًا ويصبح اختيار المستخدم هو المعتمد في
التطبيق.

## الدفع

التطبيق لا يجمع بيانات البطاقة داخله في v4.

صفحة الخطط تطلب Checkout URL من Web Empire Backend ثم تفتح Hosted Checkout عبر
`expo-web-browser`.

هذا يبقي Billing Runtime وStripe secrets في الخادم.
