# WEB EMPIRE ZERO v4.0 — MOBILE APP DELIVERY REPORT

Date: 2026-07-10
Domain: https://webempire.site

## Delivery status

Web Empire v4 mobile production validation is closed for the Android preview
delivery scope documented in this report.

The merged production source has passed the web/backend production build gate,
mobile validation gate, Android Expo export gate, and Android EAS preview APK
build gate.

This report separates confirmed delivery evidence from work that has not been
claimed or completed.

## Added in v4

### Native mobile application

- Expo Router
- React Native
- Android + iOS project configuration
- Bundle/package identifier: `site.webempire.app`
- Same Web Empire Supabase Auth
- SecureStore-backed Supabase session storage
- Dynamic Tool Factory forms
- Tool execution through the Web Empire runtime
- Same credits, plans and run history
- Mobile pricing + hosted subscription checkout
- Locale bootstrap from the server country router
- Device Accept-Language
- User locale preference
- RTL/LTR-aware UI
- Light / Dark / System
- Mobile app icon and splash assets
- EAS preview profile configured for direct-install Android APK

### Backend mobile layer

- Bearer token user resolution
- Bearer auth for tool execution
- Bearer auth for billing checkout
- `/api/mobile/bootstrap`
- `/api/mobile/tools/[slug]`
- `/api/mobile/me`

The mobile catalog endpoints return sanitized tool/interface data and do not
return prompt templates, AI secrets, or runtime configuration.

## Enabled mobile screens

- Home
- Tools
- Wallet
- Settings
- Sign in / Sign up
- Pricing
- Dynamic Tool screen

## Confirmed production validation

The validation below was executed from a clean worktree created from
`web-empire-v3-production`.

Production source at validation:

```text
41e9d6082b34bcc17bf98080ce990b3adad77162
```

### Web and backend

- `npm ci`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS with final exit code `0`.

The Next.js production build gate is therefore confirmed complete.

### Mobile source

- `npm run mobile:install`: PASS.
- `npm run mobile:typecheck`: PASS.
- `npm run mobile:lint`: PASS.
- `CI=1 npx expo install --check`: PASS.

Expo SDK dependency alignment is confirmed for the validated source.

### EAS project configuration

The mobile app is linked to:

```text
@mohammedsk/web-empire
```

EAS project ID:

```text
14357042-04b3-4a69-9616-6754973c95f3
```

Configured EAS Update URL:

```text
https://u.expo.dev/14357042-04b3-4a69-9616-6754973c95f3
```

The EAS project ID and EAS Update URL project ID match.

The following EAS `preview` environment variables were confirmed present
without printing their values:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Android Expo export

Android production export was executed with the EAS `preview` environment:

```bash
npx eas-cli@latest env:exec preview \
  "npx expo export --platform android --output-dir <temporary-output-directory>" \
  --non-interactive
```

Result:

- Android Expo export exit code: `0`.
- Export artifact directory: present and non-empty.
- Android Expo export gate: PASS.

### Android EAS preview build

A direct-install Android preview APK was built through EAS.

Build evidence:

```text
Build ID: 075c926d-565f-4d55-8509-fb64d3b9a35d
Status: FINISHED
Platform: ANDROID
Distribution: INTERNAL
Build profile: preview
Git commit: dda8c9b6fc22e7a33457ad63070c81370a0118a8
```

The EAS build artifact URL was present and the APK was downloaded for artifact
verification.

### Production tree equivalence

The Android EAS build metadata points to PR head commit:

```text
dda8c9b6fc22e7a33457ad63070c81370a0118a8
```

PR #2 was squash-merged into production as:

```text
41e9d6082b34bcc17bf98080ce990b3adad77162
```

A Git tree comparison confirmed:

```text
PR_MERGE_TREE_MATCH=YES
```

Therefore the file tree built by EAS matches the file tree of the squash merge
present in `web-empire-v3-production` at the validated merge point.

This is a tree-equivalence statement. It does not claim that EAS directly built
from the squash merge SHA.

### APK artifact verification

The EAS Android artifact was downloaded to a temporary path outside the
repository.

Validation results:

- APK download: PASS.
- APK file present and non-empty: PASS.
- APK ZIP/archive integrity test: PASS.
- APK artifact verification: PASS.

The Android preview APK build and artifact-integrity delivery gate is confirmed
complete.

## EAS preview profile

The preview profile is configured for internal distribution and an Android APK:

```json
{
  "distribution": "internal",
  "channel": "preview",
  "android": {
    "buildType": "apk"
  }
}
```

## Validation commands

From the repository root:

```bash
npm ci
npm run typecheck
npm run lint
npm run build

npm run mobile:install
npm run mobile:typecheck
npm run mobile:lint
```

From `apps/mobile`:

```bash
CI=1 npx expo install --check

npx eas-cli@latest project:info

npx eas-cli@latest env:exec preview \
  "npx expo export --platform android --output-dir <temporary-output-directory>" \
  --non-interactive

npx eas-cli@latest build \
  -p android \
  --profile preview \
  --wait
```

## Delivery evidence

GitHub pull request:

```text
PR #2
chore: validate mobile production build configuration
```

Validated PR head:

```text
dda8c9b6fc22e7a33457ad63070c81370a0118a8
```

Production squash merge:

```text
41e9d6082b34bcc17bf98080ce990b3adad77162
```

Android EAS build:

```text
075c926d-565f-4d55-8509-fb64d3b9a35d
```

## Not claimed by this report

The following delivery gates are not claimed as completed:

- iOS Expo export.
- iOS EAS cloud build.
- Physical Android device functional testing.
- Physical iOS device functional testing.
- Google Play production/AAB release.
- Apple App Store/TestFlight release.

The verified Android artifact is an internally distributed `preview` APK. It is
not documented here as a Play Store production release.

## Important deployment dependency

Deploy the full v4 web/backend source before distributing the mobile app to
testers.

The mobile app depends on the Bearer-auth and mobile API endpoints included in
v4.
