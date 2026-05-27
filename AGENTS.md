## Critical Rules for This Project

1. **Background jobs via QStash** — Vercel serverless kills containers after 300s. Heavy work (5–10 min) runs as a QStash webhook at `/api/generate-worker`. Never run the generation pipeline in an API route.

2. **Streaming is mandatory** — Use `client.messages.stream()` with `max_tokens: 48000`. Never `client.messages.create()`.

3. **Don't reduce max_tokens below 48000** — The 55–60 page JSON is large. Truncation breaks the docx builder.

4. **Env vars need "Skip Deployment Protection" on Vercel** — QStash calls `/api/generate-worker` from outside Vercel.

## Key Files
- `lib/redis.ts` — Redis client, `getJob()`, `setJob()`
- `lib/qstash.ts` — QStash client, `qstash.publish()`, `getWorkerUrl()`
- `lib/claude.ts` — `generateContent()` (streaming) + `lookupFirmaSafe()`
- `lib/docx-builder.ts` — Builds .docx from JSON using `docx` v9
- `lib/system-prompt.ts` — Full prompt + JSON schema
- `app/api/generate-single/route.ts` — Fast endpoint, saves job, publishes to QStash
- `app/api/generate-worker/route.ts` — QStash webhook, runs full pipeline
- `app/api/status/[id]/route.ts` — Polls Redis for job status
- `app/success/page.tsx` — Polls `/api/status/[id]` every 5s

## Debugging
1. Upstash QStash dashboard: message received?
2. Upstash Redis: job state updated?
3. Vercel logs: `/api/generate-worker` called?
4. Check `QSTASH_CURRENT_SIGNING_KEY` matches dashboard