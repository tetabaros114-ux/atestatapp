import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { generateAtestatJob } from '@/lib/inngest/generate-atestat'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateAtestatJob],
})