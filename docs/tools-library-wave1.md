# Web Empire Tools Library — Wave 1

## Scope

- 13 active localized categories.
- 59 free formula tools.
- Arabic and English tool translations.
- Arabic and English field translations.
- Runtime-driven result labels, units, decimals, equations, notes, and warnings.
- Local formula execution with server verification fallback.
- Localized numeric input normalization for Arabic, Persian, and English digits.
- Copy, local save, image export, and printable PDF actions.

## Quality gates

```bash
npm run test:tools:wave1
npm run typecheck
npm run lint
npm run build
```

## Database migration

```text
supabase/migrations/202607121700_v5_tools_library_wave1.sql
```

The migration uses idempotent upserts and validates:

- Seed count: 59.
- Active free formula tool count: 59.
- Category count: 13.
- Tool translations: 118.
- Field translations for all current fields and submit actions.
- Runtime result metadata on every formula tool.

## Not included in Wave 1

- Date and Hijri runtime tools.
- QR, barcode, browser image compression, IP, and WhatsApp utilities.
- Currency and gold live-data providers.
- Production deployment.
