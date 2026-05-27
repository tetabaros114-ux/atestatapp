import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL ?? ''
    const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? ''
    console.log('[redis] URL present:', !!url, '| Token present:', !!token)
    _redis = new Redis({ url, token })
  }
  return _redis
}

export interface JobState {
  status: 'pending' | 'running' | 'completed' | 'failed'
  step: 0 | 1 | 2 | 3
  downloadUrl?: string
  filename?: string
  error?: string
  createdAt: number
}

export async function getJob(id: string): Promise<JobState | null> {
  const redis = getRedis()
  const raw = await redis.get<string>(id)
  if (!raw) return null
  try {
    return JSON.parse(raw as string) as JobState
  } catch {
    return null
  }
}

export async function setJob(id: string, state: JobState, ttlSeconds = 3600): Promise<void> {
  const redis = getRedis()
  console.log('[redis] setJob called:', id, JSON.stringify(state))
  try {
    await redis.set(id, JSON.stringify(state), { ex: ttlSeconds })
    console.log('[redis] setJob OK:', id)
  } catch (err) {
    console.error('[redis] setJob FAILED:', id, err instanceof Error ? err.message : String(err))
    throw err
  }
}

export async function updateJobStep(
  id: string,
  step: 0 | 1 | 2 | 3,
  status: 'pending' | 'running' | 'completed' | 'failed'
): Promise<void> {
  const job = await getJob(id)
  if (!job) return
  await setJob(id, { ...job, step, status })
}
