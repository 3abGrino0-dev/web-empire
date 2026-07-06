# Smart Localization Engine

## Public URL structure

Production domain: `https://webempire.site`

Examples:

- `/ar`
- `/en`
- `/fr`
- `/tr`
- `/ur`
- `/ar/tools/ai-content-writer`

The root `/` is a language router. Resolution order:

1. Authenticated user's saved locale preference.
2. `web-empire-locale` cookie.
3. Direct country mapping from `country_locale_rules` using `x-vercel-ip-country`.
4. Country group mapping from `country_groups` + `country_group_members`.
5. Supported browser language from `Accept-Language`.
6. English when active.
7. Configured default locale / first active locale.

A user's manual language choice is stored in a secure cookie and, when authenticated, in `user_locale_preferences`.

## Database-first translations

- `ui_translations`: navigation and public UI message keys.
- `category_translations`: category name and description.
- `tool_translations`: title, description, SEO and optional localized prompt override.
- `tool_field_translations`: labels, placeholders, help text and localized select options.
- `plan_translations`: plan name and description.
- `site_identity_translations`: site name, tagline and home SEO.

The tool's technical field keys and select values remain stable. Only user-facing labels/options are localized.

## Admin

`/admin/localization`

Supports:

- Add language.
- RTL / LTR direction.
- Locale code and fallback language.
- Set default locale.
- Country → language rule.
- Country group → language rule.
- Add country to group.
- UI translation keys.
- Category translations.
- Plan translations.

Tool-specific translations live at:

`/admin/tools/{tool-id}/translations`

## Initial country behavior

The Arabic market group includes:

`SA AE KW QA BH OM YE IQ JO LB SY PS EG`

Direct country rules are also seeded for the same Arabic markets plus Turkish, French, Urdu and English examples.

Countries without a supported country language fall through to supported browser language and then English.
