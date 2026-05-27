import { inngest } from './client'
import { lookupFirmaSafe } from '@/lib/claude'
import { generateContent } from '@/lib/claude'
import { buildDocx } from '@/lib/docx-builder'
import { put } from '@vercel/blob'
import type { AtestateInput, SimpleFormData, FirmaData } from '@/types/atestat'

function buildInput(formData: SimpleFormData, lookupData: Partial<FirmaData> = {}): AtestateInput {
  const firmaDefaults = {
    nume: formData.firma_nume,
    forma_juridica: formData.firma_forma_juridica,
    domeniu: formData.firma_domeniu,
    cif: lookupData.cif ?? '',
    rc: lookupData.rc ?? '',
    caen_cod: lookupData.caen_cod ?? '',
    caen_desc: lookupData.caen_desc ?? '',
    adresa: lookupData.adresa ?? '',
    telefon: lookupData.telefon ?? '',
    email: lookupData.email ?? '',
    iban: lookupData.iban ?? '',
    banca: lookupData.banca ?? '',
    an_infiintare: lookupData.an_infiintare ?? '',
    angajati: lookupData.angajati ?? 0,
    produse_servicii: lookupData.produse_servicii ?? [],
    clienti_principali: lookupData.clienti_principali ?? [],
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

export const generateAtestatJob = inngest.createFunction(
  {
    id: 'generate-atestat',
    retries: 0,
    throttle: { limit: 1, period: '2m' },
    triggers: [{ event: 'atestat/generate' as const }],
  },
  async ({ event, step }) => {
    const { formData } = event.data as { formData: SimpleFormData }

    const lookupData = await step.run('lookup-firma', async () => {
      try {
        return await lookupFirmaSafe(
          formData.firma_nume,
          formData.firma_forma_juridica,
          formData.firma_domeniu
        )
      } catch {
        return {}
      }
    })

    const input = buildInput(formData, lookupData)

    const content = await step.run('generate-content', async () => {
      return await generateContent(input)
    })

    const result = await step.run('build-docx', async () => {
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

      console.log(`[generate-atestat] done: ${blob.url}`)
      return { downloadUrl: blob.url, filename }
    })

    return { status: 'done', downloadUrl: result.downloadUrl, filename: result.filename }
  }
)
