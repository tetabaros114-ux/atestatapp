import { Client } from '@upstash/qstash'

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN ?? '',
})

export function getWorkerUrl(): string {
  if (process.env.CUSTOM_WORKER_URL) {
    return `${process.env.CUSTOM_WORKER_URL}/api/generate-worker`
  }
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    return `https://${vercelUrl}/api/generate-worker`
  }
  // Direct Vercel domain — always points to current production deployment
  return 'https://atestatapp.vercel.app/api/generate-worker'
}