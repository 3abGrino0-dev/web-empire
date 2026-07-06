# Web Empire Zero Architecture

```text
Admin Tool Builder
       ↓
Database Tool Definition
       ↓
Universal Tool Runner
       ↓
Formula / AI / HTTP / Workflow
       ↓
Provider Router + Skills
       ↓
Credit Reservation
       ↓
Provider Adapter
       ↓
Usage + Credit Settlement
```

## Engine Types

`formula`, `text_transform`, `ai_text`, `ai_structured`, `http_api`,
`webhook`, `workflow`, `custom_runtime`.

## Provider Adapters

`openai_responses`, `anthropic_messages`, `gemini_generate_content`,
`openai_compatible`, `custom_http`.

## Skills

Skill مستقلة عن الأداة والمزود. النسخ محفوظة في `skill_versions`.

## Credits

Ledger-first. لا يتم تعديل الرصيد من الواجهة مباشرة.
