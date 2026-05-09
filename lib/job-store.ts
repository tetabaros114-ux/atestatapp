import { promises as fs } from 'fs'
import path from 'path'
import type { SimpleFormData, AtestateContent } from '@/types/atestat'

export type JobStatus = 'pending' | 'lookup' | 'generating' | 'building' | 'done' | 'error'

export interface Job {
  id: string
  status: JobStatus
  progress: string
  progressPct: number
  formData: SimpleFormData
  input?: AtestateContent | null
  downloadUrl?: string
  filename?: string
  error?: string
  createdAt: string
  updatedAt: string
}

const JOBS_DIR = '/tmp/atestat-jobs'

async function ensureDir() {
  try {
    await fs.mkdir(JOBS_DIR, { recursive: true })
  } catch {
    // Already exists
  }
}

export async function createJob(id: string, formData: SimpleFormData): Promise<Job> {
  await ensureDir()
  const job: Job = {
    id,
    status: 'pending',
    progress: 'Colectare date...',
    progressPct: 0,
    formData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await fs.writeFile(path.join(JOBS_DIR, `${id}.json`), JSON.stringify(job), 'utf-8')
  return job
}

export async function getJob(id: string): Promise<Job | null> {
  try {
    const data = await fs.readFile(path.join(JOBS_DIR, `${id}.json`), 'utf-8')
    return JSON.parse(data) as Job
  } catch {
    return null
  }
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
  const job = await getJob(id)
  if (!job) return null
  const updated = { ...job, ...updates, updatedAt: new Date().toISOString() }
  await fs.writeFile(path.join(JOBS_DIR, `${id}.json`), JSON.stringify(updated), 'utf-8')
  return updated
}
