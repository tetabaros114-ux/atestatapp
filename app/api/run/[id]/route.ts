import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const apiKey = process.env.INNGEST_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'INNGEST_API_KEY not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(`https://api.inngest.com/v1/runs/${id}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: 'Run negăsit' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Eroare la citirea statusului' }, { status: 502 })
    }

    const data = await res.json()

    if (data.status === 'Completed') {
      // Extract downloadUrl and filename from the function output
      const output = data.output ? JSON.parse(data.output) : {}
      return NextResponse.json({
        status: 'completed',
        downloadUrl: output.downloadUrl ?? '',
        filename: output.filename ?? 'atestat.docx',
      })
    }

    if (data.status === 'Failed' || data.status === 'Cancelled') {
      const error = data.output ? JSON.parse(data.output) : {}
      return NextResponse.json({
        status: 'failed',
        error: error?.message ?? 'Generarea a eșuat.',
      })
    }

    return NextResponse.json({ status: 'running' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}