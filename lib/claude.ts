import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from './system-prompt'
import type { AtestateInput, AtestateContent, AtestateResponse, FirmaData } from '@/types/atestat'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ─── Streaming generation ────────────────────────────────────────────────────
// Streaming is required by Anthropic when max_tokens is high enough that the
// request may exceed 10 minutes. We accumulate chunks and parse the full JSON.

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

  // Guard: extract only the JSON object (find first { and last })
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

// ─── Company lookup via web search ──────────────────────────────────────────

export async function lookupFirma(
  firmaNume: string,
  formaJuridica: string,
  domeniu: string
): Promise<Partial<FirmaData>> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
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

  // Clean markdown code fences
  let cleaned = textBlock.text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  // Guard: extract only the JSON object (find first { and last })
  const jsonStart = cleaned.indexOf('{')
  const jsonEnd = cleaned.lastIndexOf('}')
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error(`AI-ul nu a returnat JSON valid. Răspuns: ${cleaned.slice(0, 200)}`)
  }
  cleaned = cleaned.slice(jsonStart, jsonEnd + 1)

  try {
    return JSON.parse(cleaned) as Partial<FirmaData>
  } catch {
    throw new Error(`AI-ul nu a returnat JSON valid. Text: ${cleaned.slice(0, 200)}`)
  }
}

// ─── Company lookup via web search (with retry + better error handling) ──────

export async function lookupFirmaSafe(
  firmaNume: string,
  formaJuridica: string,
  domeniu: string,
  retries = 1
): Promise<Partial<FirmaData>> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await lookupFirma(firmaNume, formaJuridica, domeniu)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      // Only retry on network / timeout errors, not on JSON parsing
      if (!lastError.message.includes('nu a returnat JSON valid') && attempt < retries) {
        // small delay before retry
        await new Promise((r) => setTimeout(r, 500))
        continue
      }
      break
    }
  }

  // Return partial empty data instead of throwing — caller handles gracefully
  console.warn('[lookupFirma] All attempts failed, returning empty data:', lastError?.message)
  return {}
}