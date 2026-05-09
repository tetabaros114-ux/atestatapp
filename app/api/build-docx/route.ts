import { NextRequest, NextResponse } from 'next/server'
import { buildDocx } from '@/lib/docx-builder'
import type { AtestateContent, AtestateInput } from '@/types/atestat'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const content: AtestateContent = body.content
    const input: AtestateInput = body.input

    if (!content || !input) {
      return NextResponse.json({ error: 'content și input sunt obligatorii.' }, { status: 400 })
    }

    const docxBuffer = await buildDocx(content, input)

    const lastName = input.student_name.split(' ')[0] ?? 'Student'
    const firmaShort = input.firma.nume.replace(/SC\s+/i, '').replace(/\s+S\.[AR]\.L\./i, '').trim().split(' ')[0]
    const filename = `Atestat_${lastName}_${firmaShort}.docx`

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(docxBuffer.length),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    console.error('[build-docx] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}