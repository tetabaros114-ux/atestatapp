import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { setJob } from '@/lib/redis'
import { qstash, getWorkerUrl } from '@/lib/qstash'
import type { SimpleFormData } from '@/types/atestat'

export const maxDuration = 10

export async function POST(req: NextRequest) {
  try {
    const formData: SimpleFormData = await req.json()
    if (!formData.student_name || !formData.tema || !formData.firma_nume) {
      return NextResponse.json({ error: 'Câmpuri lipsă.' }, { status: 400 })
    }

    const jobId = uuidv4()
    const workerUrl = getWorkerUrl()
    if (!workerUrl) {
      return NextResponse.json({ error: 'APP_URL not configured.' }, { status: 500 })
    }

    // Save job state to Redis
    await setJob(jobId, {
      status: 'pending',
      step: 0,
      createdAt: Date.now(),
    })

    // Publish to QStash — QStash will call our worker webhook
    const messageId = await qstash.publish({
      url: workerUrl,
      body: JSON.stringify({ jobId, formData }),
      contentType: 'application/json',
      retries: 2,
      timeout: 600,
    })

    return NextResponse.json({ jobId, messageId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}