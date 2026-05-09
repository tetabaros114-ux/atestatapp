import { NextRequest, NextResponse } from 'next/server'
import { getJob } from '@/lib/job-store'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const job = await getJob(id)
  if (!job) {
    return NextResponse.json({ error: 'Job negăsit.' }, { status: 404 })
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
