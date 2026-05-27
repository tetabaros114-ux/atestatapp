# AtestatApp — Project Handover

## Overview
**atestatapp.ro** — A Romanian web platform that generates 55–60 page professional high-school graduation project documents (.docx). Users fill a form → AI looks up company data → AI generates structured JSON → Node.js builds a `.docx` file → user downloads it.

## Live URL
https://atestatapp.ro

## Tech Stack
- **Next.js 15** (App Router, TypeScript)
- **Vercel Pro** ($20/month — needed for 300s serverless timeout)
- **Inngest** — Background job queue (handles the 5–10 min generation that exceeds Vercel's limits)
  - Integration: https://vercel.com/integrations/inngest
  - Dashboard: https://app.inngest.com
  - Inngest serves at `/api/inngest`
- **Claude API** (`claude-sonnet-4-6`) — Uses streaming (`client.messages.stream()`) with `max_tokens: 48000` because Anthropic requires streaming for requests that may exceed 10 minutes
- **`docx` npm library (v9.6.1)** — Builds `.docx` server-side from Claude's JSON output
- **`@vercel/blob`** — Stores generated `.docx` files, provides public download URLs
- **`uuid`** — Generates unique job IDs
- **Vercel Blob + Inngest** — No Redis/Vercel KV needed

## Key Architecture Decision
The entire pipeline (lookup ~15s + Claude generate ~5–10min + docx build ~5s + blob upload ~5s = ~6–10 min total) **cannot run in a Vercel serverless function** — the max timeout is 300s and the keepalive fetch trick is unreliable. The solution is **Inngest**: it runs the job in its own long-running infrastructure, not tied to Vercel's containers. The frontend polls for completion.

## Directory Structure
```
atestat-app/
  app/
    api/
      generate-single/route.ts   ← Triggers Inngest job, returns fast with runId
      inngest/route.ts            ← Inngest webhook receiver (GET/POST/PUT)
      run/[id]/route.ts           ← Polls Inngest API for run status + download URL
    success/page.tsx               ← Loading/done/error UI, polls for completion
    genereaza/page.tsx            ← Form page
  lib/
    claude.ts                     ← Claude API client (streaming, lookupFirmaSafe, generateContent)
    docx-builder.ts               ← Builds .docx from Claude JSON using docx library
    system-prompt.ts              ← Full system prompt for Claude (document structure, topic engine)
    inngest/
      client.ts                   ← Inngest client instance
      generate-atestat.ts         ← Inngest function (job steps: lookup → generate → build-docx → upload blob)
  types/
    atestat.ts                    ← All TypeScript interfaces
  public/                         ← Static assets
```

## Environment Variables (in Vercel)
| Name | Value | Notes |
|------|-------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Claude API key |
| `INNGEST_API_KEY` | `signkey-prod-...` | From app.inngest.com → Settings → API Keys |
| `INNGEST_SIGNING_KEY` | Same as above? | Inngest SDK needs this too — check Inngest dashboard |

## How Inngest Works
1. User submits form → `/api/generate-single` calls `inngest.send({ name: 'atestat/generate', data: { formData } })`
2. Returns fast with `{ runId }`
3. Inngest picks up the job, fires webhook to `/api/inngest` → triggers `generateAtestatJob`
4. Inngest function runs all steps in its own infrastructure (no Vercel timeout)
5. Job uploads .docx to Vercel Blob → returns `downloadUrl`
6. Frontend polls `/api/run/${runId}` every 10 seconds
7. When `status === 'completed'`, download URL is returned

## Frontend Flow
1. `/genereaza` — Form page
2. On submit → stores form data in `sessionStorage` → redirects to `/success`
3. `/success` — Calls `/api/generate-single`, gets `runId`, polls `/api/run/${runId}` every 10s
4. On `completed` → shows download link pointing to Vercel Blob URL
5. On `failed` → shows error with retry button

## Important Gotchas
- **`max_tokens: 48000`** in `generateContent` — must be high enough for the full 55–60 page JSON. Streaming is mandatory when `max_tokens` is this high.
- **`Vercel Blob`** — The .docx is uploaded there and the URL is stored as `downloadUrl`. If download URL is empty, check if Blob upload succeeded.
- **Inngest signing key** — Must be in Vercel env vars AND with "Skip Deployment Protection" enabled so Inngest can reach `/api/inngest` from outside Vercel.
- **Poll timeout** — Frontend polls for up to 10 minutes (600s), polling every 10s.

## Claude System Prompt
The system prompt in `lib/system-prompt.ts` defines:
- Document structure (Argument, Cap1–Cap4, Concluzii, Bibliografie, Anexe)
- Topic engine — maps the "tema" field to specific accounting theory and ledger entries (cls.5 for trezorerie, cls.3 for stocuri, etc.)
- Accounting rules — OMFP 1802/2014 (Romanian accounting standard)
- Exact JSON output schema for `AtestateContent`
- Table format (registru casă, NIR, facturi, extrase cont, stat salarii, etc.)

## If Something Breaks
1. Check Inngest dashboard: https://app.inngest.com → Functions tab for error logs
2. Check Vercel deployment logs for `/api/generate-single` and `/api/inngest`
3. If Claude generation is slow/failing: check `ANTHROPIC_API_KEY` env var
4. If Inngest isn't triggering: check `INNGEST_API_KEY` and that `/api/inngest` is reachable
5. If download URL is empty: check if `@vercel/blob` upload succeeded and Blob is configured in Vercel

## Claude Code Memory
If Claude Code gets context errors, the key files are:
- `lib/claude.ts` — Content generation (critical: streaming required)
- `lib/docx-builder.ts` — Docx building (needs docx v9 API)
- `lib/system-prompt.ts` — Full prompt (don't reduce max_tokens below 48000)
- `app/api/generate-single/route.ts` — Fast trigger route
- `app/api/inngest/route.ts` — Inngest serve route
- `lib/inngest/generate-atestat.ts` — The actual Inngest job function
