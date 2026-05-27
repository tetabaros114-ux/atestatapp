import { NextRequest, NextResponse } from 'next/server'
import { inngest } from '@/lib/inngest/client'
import type { SimpleFormData } from '@/types/atestat'

export const maxDuration = 10

export async function POST(req: NextRequest) {
  try {
    const formData: SimpleFormData = await req.json()
    if (!formData.student_name || !formData.tema || !formData.firma_nume) {
      return NextResponse.json({ error: 'Câmpuri lipsă.' }, { status: 400 })
    }

    const result = await inngest.send({
      name: 'atestat/generate',
      data: { formData },
    })

    const runId = result.ids?.[0] ?? ''
    return NextResponse.json({ runId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
