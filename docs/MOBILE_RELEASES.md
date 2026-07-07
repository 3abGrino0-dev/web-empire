# Mobile release and OTA workflow

## Preview build
- Use `npm --prefix apps/mobile run build:android:preview` to create an Android APK preview build.
- Preview builds use the `preview` EAS channel and remain suitable for internal testing.

## Production build
- Use `npm --prefix apps/mobile run build:all:production` to create production builds for the configured platforms.
- Production OTA updates are intended for JavaScript and asset-only changes.

## OTA update flow
- EAS Update is configured for the `preview` and `production` channels.
- Use `npm --prefix apps/mobile run update:preview -- "message"` or `npm --prefix apps/mobile run update:production -- "message"` to publish an OTA update.
- Native dependency, permission, or platform changes require a new native build and store review.

## Versioning and rollback
- Keep the app version in sync with the release notes and Expo configuration.
- If a rollout causes issues, publish a follow-up patch to the same channel or roll back to the previous accepted update.
- Do not put secrets in the mobile app; use server-side APIs and secure storage only.
