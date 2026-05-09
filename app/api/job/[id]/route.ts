import { NextRequest, NextResponse } from 'next/server'
import { getJob, updateJob } from '@/lib/job-store'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const job = await getJob(id)
  if (!job) {
    return NextResponse.json({ error: 'Job negăsit.' }, { status: 404 })
  }

  // Self-heal: if job is stuck in lookup/generating/building for more than
  // 5 minutes since last update, re-trigger the background worker
  if (job.status === 'lookup' || job.status === 'generating' || job.status === 'building') {
    const updatedAt = new Date(job.updatedAt).getTime()
    const now = Date.now()
    const ageMs = now - updatedAt
    const FIVE_MIN = 5 * 60 * 1000

    if (ageMs > FIVE_MIN) {
      // Re-trigger the worker (fire-and-forget keepalive)
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_BASE_URL ?? ''

      if (baseUrl) {
        fetch(`${baseUrl}/api/jobs/process-work`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: id }),
          keepalive: true,
        }).catch(() => {})
      }
    }
  }

  return NextResponse.json({
    status: job.status,
    progress: job.progress,
    progressPct: job.progressPct,
    downloadUrl: job.downloadUrl,
    filename: job.filename,
    error: job.error,
  })
}