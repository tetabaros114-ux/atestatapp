import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from './system-prompt'
import type { AtestateInput, AtestateContent, AtestateResponse } from '@/types/atestat'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

  // Strip any accidental markdown code fences Claude might add
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
