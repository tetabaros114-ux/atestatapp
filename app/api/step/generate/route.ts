import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/claude'
import { updateJob, getJob } from '@/lib/job-store'
import type { AtestateInput, AtestateContent } from '@/types/atestat'

// Short timeout — returns immediately, real work continues via keepalive fetch
export const maxDuration = 10

export async function POST(req: NextRequest) {
  const { jobId } = await req.json()
  if (!jobId) return NextResponse.json({ error: 'jobId lipsă' }, { status: 400 })

  const job = await getJob(jobId)
  if (!job) return NextResponse.json({ error: 'Job negăsit' }, { status: 404 })

  // Return immediately — fire off the work as a keepalive background request
  // The function returns fast, Vercel kills the container after ~10s but
  // the keepalive connection allows the fetch to finish
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL ?? ''

  if (baseUrl) {
    fetch(`${baseUrl}/api/step/generate-work`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
      keepalive: true,
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true, status: 'generating' })
}