import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createJob } from '@/lib/job-store'
import type { SimpleFormData } from '@/types/atestat'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData: SimpleFormData = await req.json()

    if (!formData.student_name || !formData.tema || !formData.firma_nume) {
      return NextResponse.json({ error: 'Câmpuri lipsă.' }, { status: 400 })
    }

    const jobId = uuidv4()
    await createJob(jobId, formData)

    return NextResponse.json({ jobId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    console.error('[generate-job]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
