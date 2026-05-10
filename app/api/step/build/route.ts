import { NextRequest, NextResponse } from 'next/server'
import { updateJob, getJob } from '@/lib/job-store'

export const maxDuration = 10

export async function POST(req: NextRequest) {
  const { jobId } = await req.json()
  if (!jobId) return NextResponse.json({ error: 'jobId lipsă' }, { status: 400 })

  const job = await getJob(jobId)
  if (!job) return NextResponse.json({ error: 'Job negăsit' }, { status: 404 })

  // Fire off the build work with keepalive
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

  return NextResponse.json({ ok: true, status: 'building' })
}