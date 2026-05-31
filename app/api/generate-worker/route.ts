import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 800
import { Receiver } from '@upstash/qstash'
import { getJob, setJob } from '@/lib/redis'
import { lookupFirmaSafe, generateContent } from '@/lib/claude'
import { buildDocx } from '@/lib/docx-builder'
import { put } from '@vercel/blob'
import type { AtestateInput, SimpleFormData } from '@/types/atestat'

function buildInput(formData: SimpleFormData, lookupData: Record<string, unknown> = {}): AtestateInput {
  const firmaDefaults = {
    nume: formData.firma_nume,
    forma_juridica: formData.firma_forma_juridica,
    domeniu: formData.firma_domeniu,
    cif: (lookupData.cif as string) ?? '',
    rc: (lookupData.rc as string) ?? '',
    caen_cod: (lookupData.caen_cod as string) ?? '',
    caen_desc: (lookupData.caen_desc as string) ?? '',
    adresa: (lookupData.adresa as string) ?? '',
    telefon: (lookupData.telefon as string) ?? '',
    email: (lookupData.email as string) ?? '',
    iban: (lookupData.iban as string) ?? '',
    banca: (lookupData.banca as string) ?? '',
    an_infiintare: (lookupData.an_infiintare as string) ?? '',
    angajati: (lookupData.angajati as number) ?? 0,
    produse_servicii: (lookupData.produse_servicii as string[]) ?? [],
    clienti_principali: (lookupData.clienti_principali as string[]) ?? [],
  }
  return {
    student_name: formData.student_name,
    clasa: formData.clasa,
    profesor_coordonator: formData.profesor_coordonator,
    liceu: formData.liceu,
    specializare: formData.specializare,
    tema: formData.tema,
    firma: firmaDefaults,
    an: formData.an,
    emblema_base64: formData.emblema_base64,
    extra_info: formData.extra_info,
  }
}

export async function POST(req: NextRequest) {
  // Verify QStash signature only if header is present
  const signature = req.headers.get('upstash-signature')
  let body: { jobId: string; formData: SimpleFormData }

  if (signature) {
    try {
      const rawBody = await req.text()
      const receiver = new Receiver({
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
      })
      const isValid = await receiver.verify({ signature, body: rawBody })
      if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } else {
    // No signature — local dev only (QStash always signs in production)
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
  }

  const { jobId, formData } = body

  // Idempotency check
  const existing = await getJob(jobId)
  if (existing?.status === 'completed' || existing?.status === 'failed') {
    return NextResponse.json({ ok: true, status: existing.status })
  }

  await setJob(jobId, { status: 'running', step: 1, createdAt: Date.now() })

  try {
    // Step 1: Lookup company data
    let lookupData: Record<string, unknown> = {}
    try {
      lookupData = (await lookupFirmaSafe(
        formData.firma_nume,
        formData.firma_forma_juridica,
        formData.firma_domeniu,
      )) as Record<string, unknown>
    } catch {
      // Continue with empty lookup data
    }

    // Step 2: Generate content
    await setJob(jobId, { status: 'running', step: 2, createdAt: Date.now() })
    const input = buildInput(formData, lookupData)
    const content = await generateContent(input)

    // Step 3: Build docx and upload
    await setJob(jobId, { status: 'running', step: 3, createdAt: Date.now() })
    const docxBuffer = await buildDocx(content, input)

    const lastName = formData.student_name.split(' ')[0] ?? 'Student'
    const firmaShort = formData.firma_nume
      .replace(/SC\s+/i, '')
      .replace(/\s+S\.[AR]\.L\./i, '')
      .trim()
      .split(' ')[0]
    const filename = `Atestat_${lastName}_${firmaShort}.docx`

    const blob = await put(filename, docxBuffer, {
      access: 'public',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    await setJob(jobId, {
      status: 'completed',
      step: 3,
      downloadUrl: blob.url,
      filename,
      createdAt: Date.now(),
    })

    return NextResponse.json({ ok: true, jobId, downloadUrl: blob.url })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Generarea a eșuat.'
    await setJob(jobId, { status: 'failed', step: 3, error, createdAt: Date.now() })
    return NextResponse.json({ ok: false, error }, { status: 500 })
  }
}