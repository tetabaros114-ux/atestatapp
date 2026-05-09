import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from '@/lib/system-prompt'
import type { AtestateInput } from '@/types/atestat'

export const runtime = 'edge'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const input: AtestateInput = await req.json()

    if (!input.student_name || !input.tema || !input.firma?.nume) {
      return new Response(
        JSON.stringify({ error: 'Câmpuri lipsă: student_name, tema, firma.nume sunt obligatorii.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

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

    const encoder = new TextEncoder()

    const streamable = new ReadableStream({
      async start(controller) {
        try {
          let fullText = ''

          for await (const event of stream) {
            // content_block_delta events carry the text chunks
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              fullText += event.delta.text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text: event.delta.text })}\n\n`))
            }
          }

          // Send the complete JSON
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', fullText })}\n\n`))
          controller.close()
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Stream error'
          console.error('[generate-stream]', errorMsg)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: errorMsg })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(streamable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare necunoscută'
    console.error('[generate-stream] Error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}