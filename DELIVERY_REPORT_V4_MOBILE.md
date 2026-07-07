# WEB EMPIRE ZERO v4.0 — MOBILE APP DELIVERY REPORT

Date: 2026-07-07
Domain: https://webempire.site

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

The mobile catalog endpoints return sanitized tool/interface data and do not return
prompt templates, AI secrets or runtime configuration.

## Enabled mobile screens

- Home
- Tools
- Wallet
- Settings
- Sign in / Sign up
- Pricing
- Dynamic Tool screen

## Validation completed on the persistent v4 source

### Backend

- `npm run typecheck`: PASS — 0 TypeScript errors.
- `npm run lint`: PASS — 0 ESLint errors.
- `npm audit --omit=dev`: PASS — 0 vulnerabilities.
- Next.js Turbopack compile: PASS.
- Next.js webpack compile: PASS.
- Both Next.js build attempts reached `Compiled successfully` and entered the
  internal TypeScript/build phase, but the execution container timed out before
  `next build` returned its final exit code.

This report therefore does NOT claim a completed v4 Production Build exit code.

### Mobile

- TypeScript/TSX syntax transpile check: PASS — 19 files.
- Mobile package-lock refresh: PASS.
- `npm audit --omit=dev`: PASS — 0 vulnerabilities.
- Secret-value scan: PASS.
- No `.env` or `.env.local` files are included.

Before the execution environment reset, equivalent mobile source had passed the
full TypeScript and Expo lint commands. After the reset, a fresh Expo dependency
installation in the artifact workspace repeatedly exceeded the available
execution window. Therefore this delivery does NOT claim that Android/iOS
`expo export` or EAS cloud build completed inside this environment.

## Codespace validation commands

From the repository root:

```bash
npm ci
npm run typecheck
npm run lint

npm run mobile:install
npm run mobile:typecheck
npm run mobile:lint
```

Then build an installable Android preview:

```bash
cd apps/mobile
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build -p android --profile preview
```

The preview profile is configured with:

```json
{
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```

## Important deployment dependency

Deploy the full v4 web/backend source before distributing the mobile app. The
mobile app depends on the Bearer-auth and mobile API endpoints included in v4.
