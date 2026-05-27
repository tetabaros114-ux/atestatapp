import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { setJob } from '@/lib/redis'
import { publishJob } from '@/lib/qstash'
import type { SimpleFormData } from '@/types/atestat'

export const maxDuration = 10

export async function POST(req: NextRequest) {
  try {
    const formData: SimpleFormData = await req.json()
    if (!formData.student_name || !formData.tema || !formData.firma_nume) {
      return NextResponse.json({ error: 'Câmpuri lipsă.' }, { status: 400 })
    }

    const jobId = uuidv4()
    console.log('[generate-single] Generated jobId:', jobId)

    await setJob(jobId, {
      status: 'pending',
      step: 0,
      createdAt: Date.now(),
    })

    // Verify it was saved
    const saved = await getJob(jobId)
    console.log('[generate-single] Job saved, retrieved back:', saved ? 'FOUND' : 'NOT FOUND')

    const result = await publishJob(jobId, formData)
    const messageId = typeof result === 'object' && result !== null && 'messageId' in result
      ? String((result as { messageId: string }).messageId)
      : ''

    return NextResponse.json({ jobId, messageId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}