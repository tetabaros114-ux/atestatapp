import { Client } from '@upstash/qstash'

let _qstash: Client | null = null

function getQStash(): Client {
  if (!_qstash) {
    _qstash = new Client({
      token: process.env.QSTASH_TOKEN ?? '',
      baseUrl: 'https://qstash.upstash.io',
    })
  }
  return _qstash
}

export const WORKER_URL = 'https://atestatapp.vercel.app/api/generate-worker'

export async function publishJob(jobId: string, formData: unknown): Promise<string> {
  const qstash = getQStash()
  const result = await qstash.publishJSON({
    url: WORKER_URL,
    body: { jobId, formData },
    retries: 2,
    timeout: 600,
  })
  return typeof result === 'object' && result !== null && 'messageId' in result
    ? String(result.messageId)
    : String(result)
}