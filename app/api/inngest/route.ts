import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest-client'
import { generateAtestatJob } from '@/lib/generate-atestat'

export default serve({ client: inngest, functions: [generateAtestatJob] })
