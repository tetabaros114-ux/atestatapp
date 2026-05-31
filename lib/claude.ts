import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from './system-prompt'
import type { AtestateInput, AtestateContent, AtestateResponse, FirmaData } from '@/types/atestat'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ─── Streaming generation ────────────────────────────────────────────────────

export async function generateContent(input: AtestateInput): Promise<AtestateContent> {
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 48000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: JSON.stringify(input, null, 2),
      },
    ],
  })

  let fullText = ''
  for await (const event of stream)    // eslint-disable-line no-unreachable
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullText += event.delta.text
    }

  const cleaned = fullText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const jsonStart = cleaned.indexOf('{')
  const jsonEnd = cleaned.lastIndexOf('}')
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error(`Claude did not return valid JSON. First 200 chars: ${cleaned.slice(0, 200)}`)
  }
  const jsonText = cleaned.slice(jsonStart, jsonEnd + 1)

  let result: AtestateResponse
  try {
    result = JSON.parse(jsonText)
  } catch {
    throw new Error(`Claude returned non-JSON response. First 200 chars: ${jsonText.slice(0, 200)}`)
  }

  if (result.status === 'error') {
    throw new Error(`Claude generation error: ${result.message}`)
  }

  return result
}

// ─── Company lookup without web search (fast, no blocking) ──────────────────

export async function lookupFirmaSafe(
  firmaNume: string,
  formaJuridica: string,
  domeniu: string,
  retries = 0
): Promise<Partial<FirmaData>> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: `Ești un asistent AI care cunoaște date despre companii românești. Pe baza numelui, formei juridice și domeniului, returnezi EXCLUSIV un obiect JSON valid cu date aproximative. NU căuta pe internet. Folosește cunoștințele tale.`,
        messages: [
          {
            role: 'user',
            content: `Companie românească: "${firmaNume}", ${formaJuridica}, domeniu: ${domeniu}. Returnează JSON valid: {"cif":"...","rc":"...","caen_cod":"...","caen_desc":"...","adresa":"...","telefon":"...","email":"...","iban":"...","banca":"...","an_infiintare":"...","angajati":0,"produse_servicii":["..."],"clienti_principali":["..."]}. Pentru câmpurile necunoscute, folosește șir gol sau 0. Nu adăuga text înainte sau după JSON.`,
          },
        ],
      })
      const textBlock = response.content.findLast((b) => b.type === 'text')
      if (!textBlock) throw new Error('No text from lookup')
      let cleaned = textBlock.text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
      const jsonStart = cleaned.indexOf('{')
      const jsonEnd = cleaned.lastIndexOf('}')
      if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON found')
      return JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1)) as Partial<FirmaData>
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < retries) await new Promise((r) => setTimeout(r, 500))
    }
  }
  console.warn('[lookupFirma] All attempts failed, returning empty data:', lastError?.message)
  return {}
}