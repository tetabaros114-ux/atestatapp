# AtestatApp — Claude Code / AI Agent Instructions

See `.claude/projects/.../MEMORY.md` for full context.

## Critical Rules
- **Background jobs via QStash** — Vercel kills containers after HTTP response (300s limit). The 5–10 min generation runs as a QStash webhook at `/api/generate-worker`
- **Streaming is mandatory** — `client.messages.stream()` with `max_tokens: 48000`. Never `client.messages.create()`
- **Don't reduce max_tokens** — The 55–60 page JSON is large. Truncation breaks the docx builder
- **QStash env vars need "Skip Deployment Protection"** — QStash calls `/api/generate-worker` from outside Vercel

## Project Overview
**atestatapp.ro** — Romanian SaaS that generates 55–60 page graduation documents. Users fill a form → QStash queues a job → `/api/generate-worker` runs the full pipeline → frontend polls `/api/status/[id]`.

## Live URL
https://atestatapp.ro

## Tech Stack
- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Vercel Pro** (300s serverless timeout — QStash handles jobs outside this)
- **Upstash QStash** — HTTP webhook-based queue. QStash calls `/api/generate-worker` as a separate HTTP request, completely outside Vercel's lifecycle
- **Upstash Redis** — Stores job state (status, step, downloadUrl, filename, error) with 1h TTL
- **Claude API** (`claude-sonnet-4-6`) — Streaming with `max_tokens: 48000`
- **`docx` npm library (v9.6.1)** — Builds `.docx` server-side from Claude JSON
- **`@vercel/blob`** — Stores generated `.docx`, returns public download URLs
- **`uuid`** — Generates unique job IDs

## Architecture

```
User submits form
    ↓
POST /api/generate-single
    ↓
1. Validate form data
2. Generate jobId (uuid)
3. Save { status: 'pending', step: 0 } to Redis
4. Publish { jobId, formData } to QStash
5. Return { jobId }
    ↓
QStash (outside Vercel) calls POST /api/generate-worker
    ↓
1. Verify QStash signature
2. Check idempotency (skip if already done)
3. Lookup company data (lookupFirmaSafe)
4. Update Redis { status: 'running', step: 2 }
5. Generate content (Claude streaming)
6. Update Redis { status: 'running', step: 3 }
7. Build docx + upload to Vercel Blob
8. Update Redis { status: 'completed', downloadUrl, filename }
    ↓
Frontend polls GET /api/status/[jobId] every 5s
    ↓
Returns { status, step, downloadUrl?, filename?, error? }
```

## Environment Variables (Vercel)

| Name | Where to get it |
|------|----------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `QSTASH_TOKEN` | app.upstash.com → QStash → API Keys |
| `QSTASH_CURRENT_SIGNING_KEY` | app.upstash.com → QStash → API Keys |
| `QSTASH_NEXT_SIGNING_KEY` | app.upstash.com → QStash → API Keys (for key rotation) |
| `UPSTASH_REDIS_REST_URL` | app.upstash.com → Redis → REST API → URL |
| `UPSTASH_REDIS_REST_TOKEN` | app.upstash.com → Redis → REST API → Token |

All env vars must have **"Skip Deployment Protection"** enabled on Vercel.

## API Routes

### `POST /api/generate-single`
- maxDuration: 10s
- Validates form data
- Creates jobId, saves to Redis, publishes to QStash
- Returns `{ jobId }`

### `POST /api/generate-worker`
- QStash webhook endpoint (called by QStash, NOT by the browser)
- Verifies `upstash-signature` header
- Runs: lookup → generate → build docx → upload to blob → save to Redis
- Updates Redis step at each phase (1, 2, 3)
- Idempotent: skips if job already completed/failed

### `GET /api/status/[id]`
- Reads job from Redis
- Returns `{ status: 'pending'|'running'|'completed'|'failed', step?, downloadUrl?, filename?, error? }`

## Key Source Files

| File | Purpose |
|------|---------|
| `lib/redis.ts` | Upstash Redis client — `getJob()`, `setJob()`, `JobState` type |
| `lib/qstash.ts` | QStash client — `qstash.publish()`, `getWorkerUrl()` |
| `lib/claude.ts` | `lookupFirmaSafe()` + `generateContent()` (streaming, 48k tokens) |
| `lib/docx-builder.ts` | Builds `.docx` from `AtestateContent` JSON |
| `lib/system-prompt.ts` | System prompt + JSON schema |
| `app/success/page.tsx` | Polls `/api/status/[jobId]` every 5s |
| `types/atestat.ts` | TypeScript interfaces |

## Frontend Flow
1. `/genereaza` → submit → sessionStorage + redirect to `/success`
2. `/success` → POST `/api/generate-single` → get `jobId` → poll `/api/status/[jobId]` every 5s
3. On `completed` → show download link
4. On `failed` → show error + retry
5. On timeout (10 min) → contact message

## QStash Setup on Upstash
1. Go to https://app.upstash.com → QStash → create queue
2. Copy QSTASH_TOKEN, QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY
3. Go to Redis → copy REST_URL and REST_TOKEN
4. Add all to Vercel env vars with "Skip Deployment Protection"
5. In QStash dashboard → add your deployed URL as destination: `https://atestatapp.vercel.app/api/generate-worker`

## Common Issues

### Generation times out or never completes
1. Check QStash received the message (Upstash QStash dashboard)
2. Check `/api/generate-worker` is accessible from outside Vercel
3. Check Redis credentials are correct
4. Check QSTASH_CURRENT_SIGNING_KEY matches the dashboard

### Download URL empty
Check `@vercel/blob` `put()` succeeded and the URL is being saved to Redis in the worker.

### Worker not being called
1. Verify QStash has the correct destination URL
2. Check "Skip Deployment Protection" is on all env vars
3. Test locally: QStash won't call localhost — use ngrok or deploy first

## Build & Deploy
```bash
npm run build
# Vercel auto-deploys from GitHub push
```
