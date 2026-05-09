import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from './system-prompt'
import type { AtestateInput, AtestateContent, AtestateResponse, FirmaData } from '@/types/atestat'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ─── Atestat generation (streaming) ──────────────────────────────────────────

export function streamContent(
  input: AtestateInput,
  onChunk: (text: string) => void
): AsyncGenerator<string> {
  // This uses Anthropic's native streaming
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: JSON.stringify(input, null, 2),
      },
    ],
  })

  return {
    async next() {
      const { done, value } = await stream.next()
      if (done) return { done: true, value: undefined }
      if (value.type === 'text') {
        onChunk(value.text)
        return { done: false, value: value.text }
      }
      return { done: false, value: undefined }
    },
    [Symbol.asyncIterator]() {
      return this
    },
  } as AsyncGenerator<string>
}

// ─── Non-streaming fallback ──────────────────────────────────────────────────

export async function generateContent(input: AtestateInput): Promise<AtestateContent> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: JSON.stringify(input, null, 2),
      },
    ],
  })

  const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  let result: AtestateResponse
  try {
    result = JSON.parse(cleaned)
  } catch {
    throw new Error(`Claude returned non-JSON response. First 200 chars: ${cleaned.slice(0, 200)}`)
  }

  if (result.status === 'error') {
    throw new Error(`Claude generation error: ${result.message}`)
  }

  return result
}

// ─── Company lookup via web search ──────────────────────────────────────────

export async function lookupFirma(
  firmaNume: string,
  formaJuridica: string,
  domeniu: string
): Promise<Partial<FirmaData>> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [{ type: 'web_search_20250305', name: 'web_search' }] as any,
    system: `Ești un cercetător de date despre companii românești. Caută pe internet informații despre compania specificată și returnează EXCLUSIV un obiect JSON valid, fără niciun text explicativ înainte sau după. Nu adăuga markdown, nu adăuga explicații.`,
    messages: [
      {
        role: 'user',
        content: `Caută pe internet toate informațiile publice despre compania românească: "${firmaNume}" (${formaJuridica}), domeniu: ${domeniu}.

Verifică: termene.ro, listafirme.ro, site-ul oficial, LinkedIn, anaf.ro, pagini de știri economice.

Returnează EXCLUSIV acest JSON (fără alt text, fără markdown):
{
  "cif": "codul fiscal ex: RO12345678",
  "rc": "nr. reg. comerțului ex: J40/1234/2005",
  "caen_cod": "4 cifre ex: 4711",
  "caen_desc": "descrierea activității principale în română",
  "adresa": "adresa completă a sediului social",
  "telefon": "telefon sau șir gol",
  "email": "email sau șir gol",
  "iban": "IBAN dacă e public sau șir gol",
  "banca": "bancă dacă e publică sau șir gol",
  "an_infiintare": "YYYY",
  "angajati": numar_intreg,
  "produse_servicii": ["produs 1", "produs 2", "produs 3", "produs 4"],
  "clienti_principali": ["segment 1", "segment 2", "segment 3"]
}

Pentru câmpurile negăsite, folosește estimări rezonabile bazate pe tipul companiei.`,
      },
    ],
  })

  // Find the final text block (after all tool calls are done)
  const textBlock = response.content.findLast((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from lookup')
  }

  const cleaned = textBlock.text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  return JSON.parse(cleaned) as Partial<FirmaData>
}