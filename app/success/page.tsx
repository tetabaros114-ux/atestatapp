'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SimpleFormData } from '@/types/atestat'

type Phase = 'submitting' | 'lookup' | 'generating' | 'building' | 'done' | 'error'

const PHASE_LABELS: Record<Phase, string> = {
  submitting: 'Se inițiază...',
  lookup: 'Se caută datele firmei...',
  generating: 'AI-ul scrie documentul...',
  building: 'Se construiește fișierul Word...',
  done: 'Gata!',
  error: 'Eroare',
}

// Poll until job reaches target status (or any terminal status)
async function pollUntil(
  jobId: string,
  target: string[],
  timeout = 120000
): Promise<Record<string, unknown>> {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const res = await fetch(`/api/job/${jobId}`)
    const data = await res.json()
    if (target.includes(data.status)) return data
    if (data.status === 'error') throw new Error((data.error as string) ?? 'Eroare necunoscută')
    await new Promise((r) => setTimeout(r, 2500))
  }
  throw new Error('Timpul a expirat. Încearcă din nou.')
}

export default function SuccessPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('submitting')
  const [progressPct, setProgressPct] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [filename, setFilename] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const raw = sessionStorage.getItem('atestateInput')
    if (!raw) { router.replace('/genereaza'); return }

    let simple: SimpleFormData
    try { simple = JSON.parse(raw) } catch { router.replace('/genereaza'); return }

    run(simple)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function run(simple: SimpleFormData) {
    try {
      // 1. Submit job
      setPhase('submitting')
      setProgressText('Se creează job-ul...')
      setProgressPct(0)

      const subRes = await fetch('/api/generate-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simple),
      })

      if (!subRes.ok) {
        const err = await subRes.json().catch(() => ({ error: 'Eroare server' }))
        throw new Error(err.error || `HTTP ${subRes.status}`)
      }

      const { jobId } = await subRes.json()

      // 2. Step 1: Lookup (returns when lookup_done is reached)
      setPhase('lookup')
      setProgressText('Se caută datele firmei...')
      setProgressPct(10)

      const lookupRes = await fetch('/api/step/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })

      if (!lookupRes.ok) throw new Error('Eroare la căutarea firmei')
      await pollUntil(jobId, ['lookup_done', 'generating', 'content_done', 'building', 'done', 'error'], 60000)

      // 3. Step 2: Generate (polls until content_done)
      setPhase('generating')
      setProgressText('AI-ul scrie documentul (~1–2 minute)...')
      setProgressPct(25)

      const genRes = await fetch('/api/step/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })

      if (!genRes.ok) throw new Error('Eroare la pornirea generării')
      await pollUntil(jobId, ['content_done', 'building', 'done', 'error'], 180000)

      // 4. Step 3: Build docx (polls until done)
      setPhase('building')
      setProgressText('Se construiește fișierul Word...')
      setProgressPct(85)

      const buildRes = await fetch('/api/step/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })

      if (!buildRes.ok) throw new Error('Eroare la pornirea construirii')
      const final = await pollUntil(jobId, ['done'], 120000)

      setDownloadUrl((final.downloadUrl as string) ?? '')
      setFilename((final.filename as string) ?? 'atestat.docx')
      sessionStorage.removeItem('atestateInput')
      setPhase('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Eroare necunoscută')
      setPhase('error')
    }
  }

  const retry = () => {
    const raw = sessionStorage.getItem('atestateInput')
    if (raw) {
      try {
        const simple = JSON.parse(raw)
        setPhase('submitting')
        setErrorMsg('')
        run(simple)
      } catch {
        router.replace('/genereaza')
      }
    } else {
      router.replace('/genereaza')
    }
  }

  const pct = progressPct

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Atestat<span className="brand-green">App</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12 pt-28">
        <div className="dark-card p-10 max-w-lg w-full text-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,255,135,0.05) 0%, transparent 70%)',
            }}
          />

          {phase !== 'done' && phase !== 'error' && (
            <div className="relative z-10">
              <div
                className="w-16 h-16 rounded-full border-4 animate-spin mx-auto mb-6"
                style={{ borderColor: 'rgba(0,255,135,0.15)', borderTopColor: 'var(--green)' }}
              />
              <h1 className="text-xl font-bold text-white mb-2">{PHASE_LABELS[phase]}</h1>
              <p className="text-gray-500 text-sm mb-6">{progressText}</p>

              <div className="w-full bg-white/5 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: 'var(--green)' }}
                />
              </div>
              <p className="text-gray-600 text-xs mb-6">{pct}%</p>

              <div className="flex items-center justify-center gap-3">
                {(['lookup', 'generating', 'building'] as const).map((s, i) => {
                  const thresholds = [10, 25, 85]
                  const labels = { lookup: 'Date firmă', generating: 'AI scrie', building: 'Word' }
                  const active = pct >= thresholds[i]
                  return (
                    <div key={s} className="flex flex-col items-center gap-1.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={
                          active
                            ? { background: 'var(--green)', color: '#0a0a0a' }
                            : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#555' }
                        }
                      >
                        {active ? '✓' : '●'}
                      </div>
                      <span className="text-xs" style={{ color: active ? 'var(--green)' : '#555' }}>
                        {labels[s]}
                      </span>
                    </div>
                  )
                })}
              </div>

              <p className="text-gray-600 text-xs mt-6">Nu închide pagina.</p>
            </div>
          )}

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
                <a href={downloadUrl} download={filename} className="btn-green block w-full py-3.5 text-sm text-center mb-4">
                  ↓ Descarcă {filename}
                </a>
              ) : (
                <p className="text-gray-500 text-sm mb-4">Se pregătește link-ul...</p>
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
