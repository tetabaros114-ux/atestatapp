import { NextRequest, NextResponse } from 'next/server'
import { getJob } from '@/lib/redis'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Job ID missing' }, { status: 400 })
  }

  try {
    const job = await getJob(id)

    if (!job) {
      return NextResponse.json({ error: 'Job negăsit' }, { status: 404 })
    }

    if (job.status === 'completed') {
      return NextResponse.json({
        status: 'completed',
        downloadUrl: job.downloadUrl ?? '',
        filename: job.filename ?? 'atestat.docx',
        step: job.step,
      })
    }

    if (job.status === 'failed') {
      return NextResponse.json({
        status: 'failed',
        error: job.error ?? 'Generarea a eșuat.',
        step: job.step,
      })
    }

    // pending or running
    return NextResponse.json({
      status: job.status,
      step: job.step,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}