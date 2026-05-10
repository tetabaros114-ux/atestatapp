import { NextRequest, NextResponse } from 'next/server'
import { updateJob } from '@/lib/job-store'

export const maxDuration = 10

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json()
    if (!jobId) return NextResponse.json({ error: 'jobId lipsă' }, { status: 400 })

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL ?? ''

    if (baseUrl) {
      fetch(`${baseUrl}/api/step/build-work`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
        keepalive: true,
      }).catch(() => {})
    }

    await updateJob(jobId, { status: 'building', progress: 'Se construiește fișierul Word...', progressPct: 85 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}