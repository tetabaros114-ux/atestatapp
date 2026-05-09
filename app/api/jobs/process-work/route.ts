import { NextRequest, NextResponse } from 'next/server'
import { lookupFirmaSafe } from '@/lib/claude'
import { generateContent } from '@/lib/claude'
import { buildDocx } from '@/lib/docx-builder'
import { updateJob, getJob } from '@/lib/job-store'
import { put } from '@vercel/blob'
import type { AtestateInput } from '@/types/atestat'

export const maxDuration = 300

async function processJob(jobId: string) {
  // Skip if already processed
  const job = await getJob(jobId)
  if (!job) return
  if (job.status === 'done' || job.status === 'error') return

  // Mark as lookup so concurrent calls don't double-process
  if (job.status !== 'lookup' && job.status !== 'generating' && job.status !== 'building') {
    await updateJob(jobId, { status: 'lookup' })
  }

  try {
    // Step 1: Lookup company data
    await updateJob(jobId, { status: 'lookup', progress: 'Se caută datele firmei...', progressPct: 10 })

    let lookedUp: Record<string, unknown> = {}
    try {
      const data = await lookupFirmaSafe(
        job.formData.firma_nume,
        job.formData.firma_forma_juridica,
        job.formData.firma_domeniu
      )
      lookedUp = data as Record<string, unknown>
    } catch {
      // Continue with minimal data
    }

    const input: AtestateInput = {
      student_name: job.formData.student_name,
      clasa: job.formData.clasa,
      profesor_coordonator: job.formData.profesor_coordonator,
      liceu: job.formData.liceu,
      specializare: job.formData.specializare,
      tema: job.formData.tema,
      firma: {
        nume: job.formData.firma_nume,
        forma_juridica: job.formData.firma_forma_juridica,
        domeniu: job.formData.firma_domeniu,
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
      an: job.formData.an,
      emblema_base64: job.formData.emblema_base64,
      extra_info: job.formData.extra_info,
    }

    // Step 2: Generate content
    await updateJob(jobId, { status: 'generating', progress: 'AI-ul scrie documentul (~1 minut)...', progressPct: 30 })

    const content = await generateContent(input)

    // Step 3: Build .docx
    await updateJob(jobId, { status: 'building', progress: 'Se construiește fișierul Word...', progressPct: 80 })

    const docxBuffer = await buildDocx(content, input)

    // Step 4: Upload to Vercel Blob
    await updateJob(jobId, { progress: 'Se încarcă fișierul...', progressPct: 90 })

    const lastName = job.formData.student_name.split(' ')[0] ?? 'Student'
    const firmaShort = job.formData.firma_nume.replace(/SC\s+/i, '').replace(/\s+S\.[AR]\.L\./i, '').trim().split(' ')[0]
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
      input: content,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    console.error('[jobs/process-work] Error:', message)
    await updateJob(jobId, { status: 'error', error: message })
  }
}

export async function POST(req: NextRequest) {
  const { jobId } = await req.json()
  if (!jobId) {
    return NextResponse.json({ error: 'jobId lipsă.' }, { status: 400 })
  }

  await processJob(jobId)
  return NextResponse.json({ ok: true })
}
