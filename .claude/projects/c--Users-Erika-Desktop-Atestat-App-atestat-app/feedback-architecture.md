---
name: feedback-atestatapp-architecture
description: Critical lessons about Vercel timeouts and Inngest for this project
metadata:
  type: feedback
---

## Rule: Use Inngest for any work over 60 seconds

**Why:** Vercel Pro serverless maxes at 300s, but the full atestat generation pipeline takes 5–10 minutes. Background `keepalive` fetch is unreliable — Vercel kills containers immediately after HTTP response. Inngest runs in its own infrastructure, completely outside Vercel's lifecycle.

**How to apply:** Any heavy work (Claude API calls, docx building, blob uploads) MUST go through the Inngest function in `lib/inngest/generate-atestat.ts`. The API routes (`/api/generate-single`) should only call `inngest.send()` and return fast.

## Rule: Streaming is mandatory for max_tokens >= ~32000

**Why:** Anthropic requires streaming when a request may exceed 10 minutes. Using `client.messages.create()` with `max_tokens: 48000` will error with "Streaming is required."

**How to apply:** Always use `client.messages.stream()` and accumulate text chunks in `lib/claude.ts`.

## Rule: Don't reduce max_tokens below 48000

**Why:** The 55–60 page document JSON is large. Reducing tokens causes truncation and malformed JSON output, which breaks the docx builder.

## Rule: Env vars need "Skip Deployment Protection" on Vercel

**Why:** Inngest calls `/api/inngest` from outside Vercel. Without "Skip Deployment Protection," Vercel blocks the webhook and the job never starts.

**How to apply:** When adding any env var that Inngest or external services need to reach, always enable "Skip Deployment Protection."

## Rule: Don't use @vercel/kv / Vercel KV

**Why:** Deprecated by Vercel, moved to Upstash Redis, requires separate setup. Not needed — Inngest handles job state internally, no Redis required.

**How to apply:** Use Inngest's internal state for tracking job status. The `downloadUrl` is stored as the function's return value, read by polling `/api/run/[id]`.
