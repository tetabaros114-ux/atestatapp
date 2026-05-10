import { NextRequest, NextResponse } from 'next/server'
import { updateJob, createJob } from '@/lib/job-store'
import { v4 as uuidv4 } from 'uuid'
import type { SimpleFormData } from '@/types/atestat'

export const maxDuration = 10

export async function POST(req: NextRequest) {
  try {
    const formData: SimpleFormData = await req.json()
    if (!formData.student_name || !formData.tema || !formData.firma_nume) {
      return NextResponse.json({ error: 'Câmpuri lipsă.' }, { status: 400 })
    }

    const jobId = uuidv4()
    await createJob(jobId, formData)
    await updateJob(jobId, { status: 'generating', progress: 'Se inițiază generarea...', progressPct: 5 })

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL ?? ''

    if (baseUrl) {
      fetch(`${baseUrl}/api/generate-single-work`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
        keepalive: true,
      }).catch(() => {})
    }

    return NextResponse.json({ jobId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}