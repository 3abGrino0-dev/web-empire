# Web Empire Zero v3 — Delivery Report

Date: 2026-07-06
Domain: `https://webempire.site`

## Scope delivered in v3

### Visual Tool Builder Wizard

Seven-stage admin wizard:

1. Tool information.
2. Dynamic input fields.
3. Engine and runtime settings.
4. Skills.
5. Credits and per-plan limits.
6. SEO.
7. Preview and publish.

Tool creation is transactional through PostgreSQL RPC `create_tool_from_builder`.

### Runtime engines

Enabled:

- `formula`
- `text_transform`
- `ai_text`
- `ai_structured`
- `http_api`
- `webhook`
- `workflow`

Still intentionally disabled:

- `custom_runtime`

### Runtime Connections

Admin-managed trusted HTTPS connections with Vault-backed secrets.

Security controls:

- HTTPS required.
- Admin-defined base URL.
- Relative tool paths only.
- Common localhost/private literal IP/metadata host blocks.
- Redirects blocked.
- Timeout caps.
- 2 MB response cap.
- 1 MB tool request cap.

### Workflow Runtime

Sequential workflow execution with:

- Template steps.
- Formula steps.
- HTTP API steps.
- Webhook steps.
- AI Text steps.
- AI Structured steps.
- Previous step context references.
- Per-step run records.
- Aggregated AI provider cost and token usage.

### Plans and limits

Global plan controls:

- monthly credits.
- daily AI runs.
- max output tokens.

Per-tool/per-plan controls:

- allowed / denied.
- daily run limit.
- max output tokens.

The runtime applies the narrowest output-token limit.

### Billing and subscriptions

Billing Provider Engine with first production adapter:

- Stripe Checkout subscriptions.

Admin billing page supports:

- Vault-backed Stripe Secret Key.
- Vault-backed Stripe Webhook Signing Secret.
- Plan to Stripe Price ID mapping.
- Recent billing event visibility.

Webhook handling supports:

- `checkout.session.completed`
- `invoice.paid`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Controls:

- Stripe webhook signature verification.
- Billing event idempotency and retries.
- Subscription synchronization.
- One credit grant per subscription billing period.
- Wallet Ledger transaction on credit grant.

Current credit renewal policy is additive/rollover. Unused credits are not reset.

## New migration

`supabase/migrations/202607060003_tool_builder_runtime_billing.sql`

PostgreSQL parser result:

- PGLAST_OK
- 62 statements

All migrations:

- migration 001: 104 statements, PGLAST_OK
- migration 002: 72 statements, PGLAST_OK
- migration 003: 62 statements, PGLAST_OK

## Validation performed on working source

- `npm run typecheck` — PASS, 0 TypeScript errors.
- `npm run lint` — PASS, 0 ESLint errors/warnings.
- `npm run build` — PASS, production build exit code 0.
- `npm audit --omit=dev` — PASS, 0 vulnerabilities.
- TODO/FIXME/PLACEHOLDER scan — CLEAN.
- Old domain scan — CLEAN.

## Final ZIP clean-room validation

The delivered ZIP was extracted to a new directory and validated from its own `package-lock.json`:

- `npm ci --ignore-scripts` — PASS, 0 vulnerabilities reported during install.
- `npm run typecheck` — PASS, 0 TypeScript errors.
- `npm run lint` — PASS, 0 ESLint errors/warnings.
- `npm run build` — PASS, production build exit code 0.
- `npm audit --omit=dev` — PASS, 0 vulnerabilities.

## Routes added in v3

- `/admin/billing`
- `/admin/connections`
- `/admin/workflows`
- `/api/billing/checkout`
- `/api/billing/webhooks/[provider]`

`/admin/tools/new` is now a visual wizard.

## Honest limitations

- Stripe is the only implemented billing adapter in v3. The adapter registry is ready for additional gateways.
- External HTTP/API provider costs are not automatically metered unless that provider exposes usage through an AI adapter. Price those tools with fixed points or a suitable minimum.
- `custom_runtime` remains disabled intentionally.
- No real Supabase, AI provider, or Stripe production secret was used during build validation. Live payment behavior requires configuring real provider credentials and webhook delivery in the respective dashboards.
