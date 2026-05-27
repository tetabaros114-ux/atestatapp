import { Client } from '@upstash/qstash'

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
})

export function getWorkerUrl(): string {
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    return `https://${vercelUrl}/api/generate-worker`
  }
  // Fallback for local development — set APP_URL env var to your public URL
  return process.env.APP_URL
    ? `${process.env.APP_URL}/api/generate-worker`
    : 'https://your-domain.vercel.app/api/generate-worker'
}