@AGENTS.md

## Critical Rules for This Project

1. **Use Inngest for any work over 60 seconds** — Vercel Pro maxes at 300s and background fetch is unreliable. Heavy work goes in `lib/inngest/generate-atestat.ts`.

2. **Streaming is mandatory** — Use `client.messages.stream()` with `max_tokens: 48000`. Never `client.messages.create()`.

3. **Don't reduce max_tokens below 48000** — The 55–60 page JSON is large. Truncation breaks the docx builder.

4. **Env vars need "Skip Deployment Protection" on Vercel** — Inngest calls `/api/inngest` from outside Vercel.

5. **Don't use @vercel/kv / Vercel KV** — Not needed, deprecated. Use Inngest's internal state.

## Key Files
- `lib/claude.ts` — Claude streaming, `generateContent()` + `lookupFirmaSafe()`
- `lib/docx-builder.ts` — Builds .docx from JSON using `docx` v9
- `lib/system-prompt.ts` — Full prompt, topic engine, JSON schema
- `lib/inngest/generate-atestat.ts` — The Inngest job function
- `app/success/page.tsx` — Polls `/api/run/[id]` every 10s
- `app/api/run/[id]/route.ts` — Polls Inngest API for run status

## Debugging
1. Check Inngest dashboard: https://app.inngest.com
2. Check Vercel logs for `/api/generate-single` (must return `runId` fast)
3. If download URL empty → check `@vercel/blob` upload in Inngest function