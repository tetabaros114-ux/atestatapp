import { NextRequest, NextResponse } from 'next/server'
import { lookupFirma } from '@/lib/claude'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { firma_nume, forma_juridica, domeniu } = await req.json()

    if (!firma_nume?.trim()) {
      return NextResponse.json({ error: 'firma_nume este obligatoriu.' }, { status: 400 })
    }

    const firmaData = await lookupFirma(
      firma_nume.trim(),
      forma_juridica ?? 'S.R.L.',
      domeniu ?? ''
    )

    return NextResponse.json(firmaData)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare la căutarea firmei'
    console.error('[lookup-firma]', message)
    // Return empty object — caller will continue with minimal firma data
    return NextResponse.json({ _error: message }, { status: 200 })
  }
}
