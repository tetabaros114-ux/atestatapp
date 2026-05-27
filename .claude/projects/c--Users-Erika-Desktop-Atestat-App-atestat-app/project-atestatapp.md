---
name: project-atestatapp
description: AtestatApp — Romanian graduation document generator on Next.js + Vercel Pro + Inngest + Claude API + Vercel Blob
metadata:
  type: project
---

**atestatapp.ro** — generates 55–60 page Romanian high-school graduation project documents.

## Architecture
- Next.js 16 App Router + TypeScript + Vercel Pro
- Claude API (`claude-sonnet-4-6`) streaming with `max_tokens: 48000`
- Inngest for background jobs (handles 5–10 min generation)
- `@vercel/blob` for docx storage
- No Redis/Vercel KV needed

## Problem History
The biggest recurring issue is **Vercel serverless timeout (300s)**. The Claude streaming generation takes 5–10 min. Solutions tried:
1. `keepalive` background fetch → unreliable (Vercel kills container)
2. Vercel Blob upload → works but download URL sometimes empty
3. Inngest → current solution, runs outside Vercel's lifecycle
4. Synchronous 300s route → fails because generation exceeds 300s

## Key Env Vars
- `ANTHROPIC_API_KEY`
- `INNGEST_API_KEY` = `signkey-prod-990149e67fbbee0fe5418f6b9e9414f46f912f9fafdb78007c003e4f2c42ae8e`
- All vars need "Skip Deployment Protection" on Vercel

## URL
https://atestatapp.ro