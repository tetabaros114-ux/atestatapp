'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SimpleFormData } from '@/types/atestat'

type Phase = 'submitting' | 'processing' | 'done' | 'error'

export default function SuccessPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('submitting')
  const [progress, setProgress] = useState('')
  const [progressPct, setProgressPct] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [filename, setFilename] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [jobId, setJobId] = useState('')

  useEffect(() => {
    const raw = sessionStorage.getItem('atestateInput')
    if (!raw) { router.replace('/genereaza'); return }

    let simple: SimpleFormData
    try { simple = JSON.parse(raw) } catch { router.replace('/genereaza'); return }

    startJob(simple)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startJob(simple: SimpleFormData) {
    try {
      // Submit job
      setPhase('submitting')
      setProgress('Se inițiază generarea...')

      const submitRes = await fetch('/api/generate-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simple),
      })

      if (!submitRes.ok) {
        const err = await submitRes.json().catch(() => ({ error: 'Eroare server' }))
        throw new Error(err.error || `HTTP ${submitRes.status}`)
      }

      const { jobId } = await submitRes.json()
      setJobId(jobId)
      sessionStorage.setItem('atestatJobId', jobId)

      // Immediately trigger the worker (POST to /api/jobs/process with jobId)
      // This bypasses the need for a separate cron/queue system
      fetch('/api/jobs/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      }).catch(() => { /* polling will pick up status */ })

      setPhase('processing')
      pollJob(jobId)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Eroare necunoscută')
      setPhase('error')
    }
  }

  async function pollJob(id: string) {
    while (true) {
      try {
        const res = await fetch(`/api/job/${id}`)
        if (!res.ok) {
          setErrorMsg(`Eroare server: ${res.status}`)
          setPhase('error')
          return
        }

        const data = await res.json()
        setProgress(data.progress)
        setProgressPct(data.progressPct ?? 0)

        if (data.status === 'done') {
          setDownloadUrl(data.downloadUrl ?? '')
          setFilename(data.filename ?? 'atestat.docx')
          sessionStorage.removeItem('atestateInput')
          setPhase('done')
          return
        }

        if (data.status === 'error') {
          setErrorMsg(data.error ?? 'Eroare necunoscută')
          setPhase('error')
          return
        }
      } catch {
        // Network error, keep polling
      }

      await new Promise((r) => setTimeout(r, 3000))
    }
  }

  const retry = () => {
    const raw = sessionStorage.getItem('atestateInput')
    if (raw) {
      try {
        const simple = JSON.parse(raw)
        setPhase('submitting')
        setErrorMsg('')
        startJob(simple)
      } catch {
        router.replace('/genereaza')
      }
    } else {
      router.replace('/genereaza')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Atestat<span className="brand-green">App</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12 pt-28">
        <div className="dark-card p-10 max-w-lg w-full text-center relative overflow-hidden">
          {/* Subtle glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,255,135,0.05) 0%, transparent 70%)',
            }}
          />

          {/* ── Submitting ── */}
          {phase === 'submitting' && (
            <div className="relative z-10">
              <div
                className="w-16 h-16 rounded-full border-4 animate-spin mx-auto mb-6"
                style={{ borderColor: 'rgba(0,255,135,0.15)', borderTopColor: 'var(--green)' }}
              />
              <h1 className="text-xl font-bold text-white mb-4">Se inițiază...</h1>
              <p className="text-gray-500 text-sm">{progress}</p>
            </div>
          )}

          {/* ── Processing ── */}
          {phase === 'processing' && (
            <div className="relative z-10">
              <div
                className="w-16 h-16 rounded-full border-4 animate-spin mx-auto mb-6"
                style={{ borderColor: 'rgba(0,255,135,0.15)', borderTopColor: 'var(--green)' }}
              />
              <h1 className="text-xl font-bold text-white mb-2">Se generează atestatul...</h1>
              <p className="text-gray-500 text-sm mb-6">{progress}</p>

              {/* Progress bar */}
              <div className="w-full bg-white/5 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%`, background: 'var(--green)' }}
                />
              </div>
              <p className="text-gray-600 text-xs">{progressPct}%</p>

              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: progressPct >= 10 ? 'var(--green)' : 'rgba(255,255,255,0.06)',
                      color: progressPct >= 10 ? '#0a0a0a' : '#555',
                      border: progressPct >= 10 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {progressPct >= 10 ? '✓' : '●'}
                  </div>
                  <span className="text-xs" style={{ color: progressPct >= 10 ? 'var(--green)' : '#555' }}>Date firmă</span>
                </div>
                <div className="w-6 h-px bg-white/10" />
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: progressPct >= 30 ? 'var(--green)' : 'rgba(255,255,255,0.06)',
                      color: progressPct >= 30 ? '#0a0a0a' : '#555',
                      border: progressPct >= 30 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {progressPct >= 30 ? '✓' : '●'}
                  </div>
                  <span className="text-xs" style={{ color: progressPct >= 30 ? 'var(--green)' : '#555' }}>AI scrie</span>
                </div>
                <div className="w-6 h-px bg-white/10" />
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: progressPct >= 80 ? 'var(--green)' : 'rgba(255,255,255,0.06)',
                      color: progressPct >= 80 ? '#0a0a0a' : '#555',
                      border: progressPct >= 80 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {progressPct >= 80 ? '✓' : '●'}
                  </div>
                  <span className="text-xs" style={{ color: progressPct >= 80 ? 'var(--green)' : '#555' }}>Word</span>
                </div>
                <div className="w-6 h-px bg-white/10" />
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: progressPct >= 90 ? 'var(--green)' : 'rgba(255,255,255,0.06)',
                      color: progressPct >= 90 ? '#0a0a0a' : '#555',
                      border: progressPct >= 90 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {progressPct >= 90 ? '✓' : '●'}
                  </div>
                  <span className="text-xs" style={{ color: progressPct >= 90 ? 'var(--green)' : '#555' }}>Upload</span>
                </div>
              </div>

              <p className="text-gray-600 text-xs mt-6">Nu închide pagina. Se repornește automat dacă pierzi conexiunea.</p>
            </div>
          )}

          {/* ── Done ── */}
          {phase === 'done' && (
            <div className="relative z-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(0,255,135,0.12)', border: '1px solid rgba(0,255,135,0.3)' }}
              >
                <span className="text-3xl font-bold" style={{ color: 'var(--green)' }}>✓</span>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Atestatul a fost generat!</h1>
              <p className="text-gray-500 text-sm mb-6">Fișierul este gata pentru descărcare.</p>

              {downloadUrl ? (
                <a
                  href={downloadUrl}
                  download={filename}
                  className="btn-green block w-full py-3.5 text-sm text-center mb-4"
                >
                  ↓ Descarcă {filename}
                </a>
              ) : (
                <p className="text-gray-500 text-sm mb-4">Se pregătește link-ul de descărcare...</p>
              )}

              <Link
                href="/genereaza"
                className="block w-full py-3 rounded-xl text-sm font-semibold text-center transition-all duration-200"
                style={{
                  border: '1px solid rgba(0,255,135,0.3)',
                  color: 'var(--green)',
                  background: 'rgba(0,255,135,0.05)',
                }}
              >
                Generează un alt atestat
              </Link>
            </div>
          )}

          {/* ── Error ── */}
          {phase === 'error' && (
            <div className="relative z-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}
              >
                <span className="text-red-400 text-3xl">✕</span>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">A apărut o eroare</h1>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">{errorMsg}</p>
              <button onClick={retry} className="btn-green block w-full py-3 text-sm mb-3">
                Încearcă din nou
              </button>
              <Link href="/genereaza" className="block text-sm text-gray-600 hover:text-gray-400 transition-colors">
                ← Înapoi la formular
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}