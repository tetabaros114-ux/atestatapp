import { NextRequest, NextResponse } from 'next/server'
import { lookupFirmaSafe } from '@/lib/claude'
import { generateContent } from '@/lib/claude'
import { buildDocx } from '@/lib/docx-builder'
import { updateJob, getJob, createJob } from '@/lib/job-store'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'
import type { AtestateInput, SimpleFormData } from '@/types/atestat'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
    const formData: SimpleFormData = await req.json()

    if (!formData.student_name || !formData.tema || !formData.firma_nume) {
      return NextResponse.json({ error: 'Câmpuri lipsă.' }, { status: 400 })
    }

    // Create job
    const jobId = uuidv4()
    await createJob(jobId, formData)

    await updateJob(jobId, { status: 'lookup', progress: 'Se caută datele firmei...', progressPct: 5 })

    // Step 1: Lookup company data
    let lookedUp: Record<string, unknown> = {}
    try {
      const data = await lookupFirmaSafe(
        formData.firma_nume,
        formData.firma_forma_juridica,
        formData.firma_domeniu
      )
      lookedUp = data as Record<string, unknown>
    } catch { /* continue with minimal data */ }

    // Step 2: Generate content
    await updateJob(jobId, { status: 'generating', progress: 'AI-ul scrie documentul...', progressPct: 30 })

    const input: AtestateInput = {
      student_name: formData.student_name,
      clasa: formData.clasa,
      profesor_coordonator: formData.profesor_coordonator,
      liceu: formData.liceu,
      specializare: formData.specializare,
      tema: formData.tema,
      firma: {
        nume: formData.firma_nume,
        forma_juridica: formData.firma_forma_juridica,
        domeniu: formData.firma_domeniu,
        cif: (lookedUp.cif as string) ?? '',
        rc: (lookedUp.rc as string) ?? '',
        caen_cod: (lookedUp.caen_cod as string) ?? '',
        caen_desc: (lookedUp.caen_desc as string) ?? '',
        adresa: (lookedUp.adresa as string) ?? '',
        telefon: (lookedUp.telefon as string) ?? '',
        email: (lookedUp.email as string) ?? '',
        iban: (lookedUp.iban as string) ?? '',
        banca: (lookedUp.banca as string) ?? '',
        an_infiintare: (lookedUp.an_infiintare as string) ?? '',
        angajati: (lookedUp.angajati as number) ?? 0,
        produse_servicii: (lookedUp.produse_servicii as string[]) ?? [],
        clienti_principali: (lookedUp.clienti_principali as string[]) ?? [],
      },
      an: formData.an,
      emblema_base64: formData.emblema_base64,
      extra_info: formData.extra_info,
    }

    const content = await generateContent(input)

    // Step 3: Build docx
    await updateJob(jobId, { status: 'building', progress: 'Se construiește fișierul Word...', progressPct: 80 })

    const docxBuffer = await buildDocx(content, input)

    // Step 4: Upload to blob
    const lastName = formData.student_name.split(' ')[0] ?? 'Student'
    const firmaShort = formData.firma_nume.replace(/SC\s+/i, '').replace(/\s+S\.[AR]\.L\./i, '').trim().split(' ')[0]
    const filename = `Atestat_${lastName}_${firmaShort}.docx`

    const blob = await put(filename, docxBuffer, {
      access: 'public',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    await updateJob(jobId, {
      status: 'done',
      downloadUrl: blob.url,
      filename,
      progress: 'Gata!',
      progressPct: 100,
    })

    return NextResponse.json({ jobId, downloadUrl: blob.url, filename })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    console.error('[generate-single]', message)
    await updateJob(uuidv4(), { status: 'error', error: message }).catch(() => {})
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
