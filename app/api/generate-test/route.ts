import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/claude'
import { buildDocx } from '@/lib/docx-builder'
import type { AtestateInput } from '@/types/atestat'

// Allow up to 60 seconds for generation (requires Vercel Pro in production)
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const input: AtestateInput = await req.json()

    // Basic validation
    if (!input.student_name || !input.tema || !input.firma?.nume) {
      return NextResponse.json(
        { error: 'Câmpuri lipsă: student_name, tema, firma.nume sunt obligatorii.' },
        { status: 400 }
      )
    }

    // 1. Call Claude → get structured content JSON
    const content = await generateContent(input)

    // 2. Build the .docx from the content JSON
    const docxBuffer = await buildDocx(content, input)

    // 3. Stream the file back as a download
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
    console.error('[generate-test] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
