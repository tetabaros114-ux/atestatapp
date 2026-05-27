import { Client } from '@upstash/qstash'

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
})

export function getWorkerUrl(): string {
  // Use CUSTOM_WORKER_URL if set, otherwise fall back to VERCEL_URL
  if (process.env.CUSTOM_WORKER_URL) {
    return `${process.env.CUSTOM_WORKER_URL}/api/generate-worker`
  }
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    return `https://${vercelUrl}/api/generate-worker`
  }
  return 'https://atestatapp.vercel.app/api/generate-worker'
}