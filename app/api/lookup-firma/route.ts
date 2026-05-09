import { NextRequest, NextResponse } from 'next/server'
import { lookupFirmaSafe } from '@/lib/claude'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { firma_nume, forma_juridica, domeniu } = await req.json()

    if (!firma_nume?.trim()) {
      return NextResponse.json({ error: 'firma_nume este obligatoriu.' }, { status: 400 })
    }

    const firmaData = await lookupFirmaSafe(
      firma_nume.trim(),
      forma_juridica ?? 'S.R.L.',
      domeniu ?? '',
      1 // one retry on failure
    )

    // If no data came back, return _error so caller knows lookup failed
    if (!firmaData || Object.keys(firmaData).length === 0) {
      return NextResponse.json({ _error: 'Firma nu a putut fi găsită. Vei completa datele manual.' }, { status: 200 })
    }

    return NextResponse.json(firmaData)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    console.error('[lookup-firma]', message)
    // Graceful fallback — never crash the flow
    return NextResponse.json({ _error: message }, { status: 200 })
  }
}