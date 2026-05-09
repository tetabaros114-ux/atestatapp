// @ts-nocheck
import { step } from 'inngest'
import { inngest } from '@/lib/inngest-client'
import { lookupFirmaSafe } from '@/lib/claude'
import { generateContent } from '@/lib/claude'
import { buildDocx } from '@/lib/docx-builder'
import { updateJob } from '@/lib/job-store'
import { put } from '@vercel/blob'
import type { AtestateInput } from '@/types/atestat'

export const generateAtestatJob = inngest.createFunction(
  { id: 'generate-atestat', retries: 2, triggers: [{ event: 'atestat/generate' }] },
  async ({ event, step }) => {
    const d = event.data as Record<string, unknown>
    const jobId = d.jobId as string

    const lookedUp = await step.run('lookup-company', async () => {
      await updateJob(jobId, { status: 'lookup', progress: 'Se caută datele firmei...', progressPct: 5 })
      let data: Record<string, unknown> = {}
      try {
        data = await lookupFirmaSafe(
          d.firma_nume as string,
          d.firma_forma_juridica as string,
          d.firma_domeniu as string
        ) as Record<string, unknown>
      } catch { /* continue with minimal data */ }
      return data
    })

    const input: AtestateInput = {
      student_name: d.student_name as string,
      clasa: d.clasa as string,
      profesor_coordonator: d.profesor_coordonator as string,
      liceu: d.liceu as string,
      specializare: d.specializare as string,
      tema: d.tema as string,
      firma: {
        nume: d.firma_nume as string,
        forma_juridica: d.firma_forma_juridica as string,
        domeniu: d.firma_domeniu as string,
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
      an: d.an as string,
      emblema_base64: d.emblema_base64 as string | undefined,
      extra_info: d.extra_info as string | undefined,
    }

    const content = await step.run('generate-content', async () => {
      await updateJob(jobId, { status: 'generating', progress: 'AI-ul scrie documentul (~60 secunde)...', progressPct: 30 })
      return await generateContent(input)
    })

    const docxBuffer = await step.run('build-docx', async () => {
      await updateJob(jobId, { status: 'building', progress: 'Se construiește fișierul Word...', progressPct: 80 })
      return await buildDocx(content, input)
    })

    const blob = await step.run('upload-blob', async () => {
      await updateJob(jobId, { progress: 'Se încarcă fișierul...', progressPct: 90 })
      const lastName = (d.student_name as string).split(' ')[0] ?? 'Student'
      const firmaShort = (d.firma_nume as string).replace(/SC\s+/i, '').replace(/\s+S\.[AR]\.L\./i, '').trim().split(' ')[0]
      const filename = `Atestat_${lastName}_${firmaShort}.docx`
      return await put(filename, docxBuffer, {
        access: 'public',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
    })

    await updateJob(jobId, {
      status: 'done',
      downloadUrl: blob.url,
      filename: blob.pathname,
      progress: 'Gata!',
      progressPct: 100,
    })
  }
)
