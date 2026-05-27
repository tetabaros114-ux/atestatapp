import { Client } from '@upstash/qstash'

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN ?? '',
})

// Always use this exact URL — Vercel domain always points to current production
export const WORKER_URL = 'https://atestatapp.vercel.app/api/generate-worker'

export async function publishJob(jobId: string, formData: unknown): Promise<string> {
  const result = await qstash.publish({
    url: WORKER_URL,
    body: JSON.stringify({ jobId, formData }),
    contentType: 'application/json',
    retries: 2,
    timeout: 600,
  })
  return typeof result === 'object' && result !== null && 'messageId' in result
    ? String(result.messageId)
    : String(result)
}