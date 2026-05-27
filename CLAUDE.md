# AtestatApp — Claude Code / AI Agent Instructions

See `.claude/projects/c--Users-Erika-Desktop-Atestat-App-atestat-app/MEMORY.md` for full context (user profile, project overview, critical feedback).

## Critical Rules
- **Inngest for >60s work** — Vercel kills containers immediately on response. Heavy work goes in `lib/inngest/generate-atestat.ts`
- **Streaming is mandatory** — `client.messages.stream()` with `max_tokens: 48000`. Never `client.messages.create()`
- **Don't reduce max_tokens** — The 55–60 page JSON is large. Truncation breaks docx builder
- **"Skip Deployment Protection"** — All Vercel env vars need this so Inngest can reach `/api/inngest`
- **No @vercel/kv** — Not needed. Inngest handles job state internally

## Project Overview
**atestatapp.ro** — Romanian web platform that generates 55–60 page professional high-school graduation project documents (.docx). Users fill a form → AI looks up company data → AI generates structured JSON → Node.js builds a `.docx` file → user downloads it.

## Live URL
https://atestatapp.ro

## Tech Stack
- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Vercel Pro** ($20/month — required for 300s serverless timeout)
- **Inngest** — Background job queue (handles the 5–10 min generation that exceeds Vercel's limits)
  - Integration: https://vercel.com/integrations/inngest
  - Dashboard: https://app.inngest.com
  - Serves at `/api/inngest`
- **Claude API** (`claude-sonnet-4-6`) — Streaming with `max_tokens: 48000` (mandatory for requests exceeding 10 min)
- **`docx` npm library (v9.6.1)** — Builds `.docx` server-side from Claude JSON
- **`@vercel/blob`** — Stores generated `.docx` files, returns public download URLs
- **`uuid`** — Generates unique job IDs

## Critical Architecture Notes

### Why Inngest?
The full pipeline (lookup ~15s + Claude streaming generate ~5–10min + docx build ~5s + blob upload ~5s = ~6–10 min total) **cannot run in a Vercel serverless function**. Vercel Pro maxes at 300s and the `keepalive` background fetch trick is unreliable. Inngest runs the job in its own long-running infrastructure, completely outside Vercel's container lifecycle.

### Why Streaming?
Anthropic requires streaming (`client.messages.stream()`) when `max_tokens` is high enough that the request may exceed 10 minutes. With `max_tokens: 48000`, we must stream and accumulate chunks. Never use `client.messages.create()` with high max_tokens — it will error with "Streaming is required."

## Environment Variables (Vercel — Production + Development)
| Name | Notes |
|------|-------|
| `ANTHROPIC_API_KEY` | From console.anthropic.com |
| `INNGEST_API_KEY` | `signkey-prod-...` from app.inngest.com → Settings → API Keys |
| `INNGEST_SIGNING_KEY` | Same as INNGEST_API_KEY |

All env vars must have **"Skip Deployment Protection"** enabled on Vercel so Inngest can reach `/api/inngest`.

## API Routes

### `/api/generate-single` (POST)
- Fast endpoint (10s timeout)
- Validates form data
- Calls `inngest.send({ name: 'atestat/generate', data: { formData } })`
- Returns `{ runId }`
- Never do heavy work here

### `/api/inngest` (GET/POST/PUT)
- Inngest serve handler
- Receives webhook calls from Inngest when jobs start/complete
- DO NOT set `maxDuration` here — Inngest handles its own timeout

### `/api/run/[id]` (GET)
- Polls Inngest API (`https://api.inngest.com/v1/runs/${id}`) with `INNGEST_API_KEY`
- Returns `{ status: 'completed'|'failed'|'running', downloadUrl?, filename?, error? }`
- Used by frontend to poll for completion

## Key Source Files

| File | Purpose |
|------|---------|
| `lib/claude.ts` | Claude API client — `generateContent()` (streaming, 48k tokens) and `lookupFirmaSafe()` |
| `lib/docx-builder.ts` | Builds `.docx` from `AtestateContent` JSON using `docx` v9 |
| `lib/system-prompt.ts` | Full system prompt — document structure, topic engine, accounting rules (OMFP 1802/2014), JSON schema |
| `lib/inngest/client.ts` | Inngest client instance (`new Inngest({ id: 'atestat-app' })`) |
| `lib/inngest/generate-atestat.ts` | Inngest function — 3 steps: lookup → generate → build-docx+upload |
| `app/success/page.tsx` | Loading/done/error UI — polls `/api/run/[id]` every 10s for up to 10 min |
| `app/genereaza/page.tsx` | Form page |
| `types/atestat.ts` | All TypeScript interfaces (`SimpleFormData`, `AtestateInput`, `AtestateContent`, etc.) |

## Frontend Flow
1. `/genereaza` → submit form → data saved to `sessionStorage` → redirect to `/success`
2. `/success` → POST to `/api/generate-single` → get `runId` → poll `/api/run/[id]` every 10s
3. On `completed` → show download link (Vercel Blob URL)
4. On `failed` → show error + retry button
5. On timeout (10 min) → show timeout error with link to app.inngest.com

## Common Issues & Fixes

### "Streaming is required" error from Anthropic
Use `client.messages.stream()` with `for await (const event of stream)`. Never `client.messages.create()` with high `max_tokens`.

### Download URL empty on done phase
Check if `@vercel/blob` `put()` succeeded. The blob upload happens in the Inngest function's `build-docx` step. Ensure Vercel Blob is configured in the project.

### Inngest not triggering
1. Check `INNGEST_API_KEY` is in Vercel env vars
2. Check "Skip Deployment Protection" is enabled on env vars
3. Check `/api/inngest` is reachable from outside Vercel
4. Check Inngest dashboard at app.inngest.com

### Vercel Timeout (300s)
This means the Inngest job isn't running and something fell back to the synchronous path. Check Inngest is connected and the job was queued. The heavy work must run in Inngest, NOT in the API route.

## Build & Deploy
```bash
npm run build
npx vercel --prod
```

## Debugging
1. Vercel logs → `/api/generate-single` — did it return `runId`?
2. Inngest dashboard: https://app.inngest.com
3. `/api/inngest` — did Inngest webhook arrive?
