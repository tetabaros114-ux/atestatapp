import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/claude'
import { updateJob, getJob } from '@/lib/job-store'
import type { AtestateInput } from '@/types/atestat'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { jobId } = await req.json()
  if (!jobId) return NextResponse.json({ error: 'jobId lipsă' }, { status: 400 })

  const job = await getJob(jobId)
  if (!job) return NextResponse.json({ error: 'Job negăsit' }, { status: 404 })

  // Prevent double-processing
  if (job.status === 'content_done') return NextResponse.json({ ok: true })

  await updateJob(jobId, { status: 'generating', progress: 'AI-ul scrie documentul (~1 minut)...', progressPct: 30 })

  try {
    const lookupData = (job as unknown as Record<string, unknown>).lookupData as Record<string, unknown> ?? {}

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
      },
      an: job.formData.an,
      emblema_base64: job.formData.emblema_base64,
      extra_info: job.formData.extra_info,
    }

    const content = await generateContent(input)

    await updateJob(jobId, {
      status: 'content_done',
      progress: 'Document scris',
      progressPct: 70,
      contentJson: JSON.stringify(content),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    console.error('[step/generate-work]', message)
    await updateJob(jobId, { status: 'error', error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}