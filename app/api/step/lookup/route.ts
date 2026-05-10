import { NextRequest, NextResponse } from 'next/server'
import { lookupFirmaSafe } from '@/lib/claude'
import { updateJob, getJob } from '@/lib/job-store'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json()
    if (!jobId) return NextResponse.json({ error: 'jobId lipsă' }, { status: 400 })

    const job = await getJob(jobId)
    if (!job) return NextResponse.json({ error: 'Job negăsit' }, { status: 404 })

    await updateJob(jobId, { status: 'lookup', progress: 'Se caută datele firmei...', progressPct: 5 })

    let data: Record<string, unknown> = {}
    try {
      data = await lookupFirmaSafe(
        job.formData.firma_nume,
        job.formData.firma_forma_juridica,
        job.formData.firma_domeniu
      ) as Record<string, unknown>
    } catch { /* continue with minimal data */ }

    await updateJob(jobId, {
      status: 'lookup_done',
      progress: 'Date firmă găsite',
      progressPct: 20,
      lookupData: data,
    })

    return NextResponse.json({ ok: true, lookupData: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    console.error('[step/lookup]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}