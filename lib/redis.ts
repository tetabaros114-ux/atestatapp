import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
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
  await redis.set(id, JSON.stringify(state), { ex: ttlSeconds })
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