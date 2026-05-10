import { NextRequest, NextResponse } from 'next/server'
import { buildDocx } from '@/lib/docx-builder'
import { updateJob, getJob } from '@/lib/job-store'
import { put } from '@vercel/blob'
import type { AtestateInput, AtestateContent } from '@/types/atestat'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { jobId } = await req.json()
  if (!jobId) return NextResponse.json({ error: 'jobId lipsă' }, { status: 400 })

  const job = await getJob(jobId)
  if (!job) return NextResponse.json({ error: 'Job negăsit' }, { status: 404 })

  if (job.status === 'done') return NextResponse.json({ ok: true })

  await updateJob(jobId, { status: 'building', progress: 'Se construiește fișierul Word...', progressPct: 80 })

  try {
    if (!job.contentJson) throw new Error('Content lipsă — pasul de generare nu s-a finalizat.')

    const content: AtestateContent = JSON.parse(job.contentJson)

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

    const docxBuffer = await buildDocx(content, input)

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
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    console.error('[step/build-work]', message)
    await updateJob(jobId, { status: 'error', error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}