'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SimpleFormData } from '@/types/atestat'

type Phase = 'loading' | 'done' | 'error'

async function pollStatus(runId: string, onProgress: (pct: number) => void, timeout = 600000): Promise<{ downloadUrl: string; filename: string }> {
  const deadline = Date.now() + timeout
  let ticks = 0
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`/api/run/${runId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.status === 'completed') {
        return { downloadUrl: data.downloadUrl ?? '', filename: data.filename ?? 'atestat.docx' }
      }
      if (data.status === 'failed') throw new Error(data.error || 'Generarea a eșuat.')
      // Progress bar: estimate based on elapsed time
      const elapsed = Date.now() - (deadline - timeout)
      ticks++
      const pct = Math.min(80, 5 + Math.floor((elapsed / 10000) * 8))
      onProgress(pct)
    } catch (err) {
      if (err instanceof Error && err.message.includes('HTTP')) throw err
    }
    await new Promise(r => setTimeout(r, 10000))
  }
  throw new Error('Timpul a expirat. Verifică în app.inngest.com.')
}

export default function SuccessPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('loading')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [filename, setFilename] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [progress, setProgress] = useState(5)

  useEffect(() => {
    const raw = sessionStorage.getItem('atestateInput')
    if (!raw) { router.replace('/genereaza'); return }
    let simple: SimpleFormData
    try { simple = JSON.parse(raw) } catch { router.replace('/genereaza'); return }
    start(simple)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function start(formData: SimpleFormData) {
    try {
      const res = await fetch('/api/generate-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Eroare server' }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      const { runId } = await res.json()
      const result = await pollStatus(runId, setProgress)
      setDownloadUrl(result.downloadUrl)
      setFilename(result.filename)
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
        setPhase('loading')
        setErrorMsg('')
        setProgress(5)
        start(simple)
      } catch { router.replace('/genereaza') }
    } else { router.replace('/genereaza') }
  }

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/6 bg-[#080808]/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--green)', boxShadow: '0 0 16px rgba(0,255,135,0.3)' }}>
              <span className="text-xs font-black text-[#080808]">A</span>
            </div>
            <span className="text-lg font-bold tracking-tight">Atestat<span className="brand-green">App</span></span>
          </Link>
        </div>
      </nav>

      <div className="flex items-center justify-center px-4 pt-28 pb-16 min-h-screen">
        <div className="w-full max-w-lg">

          {phase === 'loading' && (
            <div className="dark-card p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,255,135,0.05) 0%, transparent 70%)' }} />
              <div className="relative z-10 space-y-6">
                {/* Animated check in progress */}
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(0,255,135,0.1)' }}>
                  <svg className="w-8 h-8 animate-spin" style={{ color: 'var(--green)' }} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>

                <div>
                  <h1 className="text-xl font-black tracking-tight mb-2">Se generează atestatul...</h1>
                  <p className="text-gray-500 text-sm">AI-ul scrie documentul. Poate dura 3–5 minute.</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%`, background: 'var(--green)' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Se caută firma...</span>
                    <span>{progress}%</span>
                  </div>
                </div>

                {/* Step indicators */}
                <div className="space-y-2 text-left">
                  {[
                    { label: 'Se caută datele firmei', pct: 20 },
                    { label: 'AI-ul scrie documentul', pct: 60 },
                    { label: 'Se construiește fișierul Word', pct: 85 },
                  ].map(({ label, pct }) => (
                    <div key={label} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                        ${progress >= pct ? '' : 'opacity-30'}`}
                        style={{ background: progress >= pct ? 'var(--green)' : 'rgba(255,255,255,0.05)', color: progress >= pct ? '#080808' : '#555' }}>
                        {progress >= pct ? '✓' : '○'}
                      </div>
                      <span style={{ color: progress >= pct ? '#ccc' : '#555' }}>{label}</span>
                    </div>
                  ))}
                </div>

                <p className="text-gray-700 text-xs">
                  Monitorizează în{" "}
                  <a href="https://app.inngest.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">
                    app.inngest.com
                  </a>
                </p>
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="dark-card p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,255,135,0.07) 0%, transparent 70%)' }} />
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(0,255,135,0.12)', boxShadow: '0 0 32px rgba(0,255,135,0.2)' }}>
                  <svg className="w-8 h-8" style={{ color: 'var(--green)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div>
                  <h1 className="text-xl font-black tracking-tight mb-2">Atestatul tău e gata!</h1>
                  <p className="text-gray-500 text-sm">Fișierul Word a fost generat cu succes.</p>
                </div>

                {downloadUrl ? (
                  <a
                    href={downloadUrl}
                    download={filename}
                    className="btn-green inline-flex items-center gap-2 px-8 py-4 text-base font-bold"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descarcă {filename || 'atestat.docx'}
                  </a>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Verifică în{" "}
                    <a href="https://app.inngest.com" target="_blank" rel="noopener noreferrer" className="underline">
                      app.inngest.com
                    </a>{" "}
                    pentru linkul de descărcare.
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/genereaza" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-center border transition-all duration-200" style={{ borderColor: 'rgba(0,255,135,0.2)', color: 'var(--green)', background: 'rgba(0,255,135,0.05)' }}>
                    Generează altul
                  </Link>
                  <Link href="/" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-center border transition-all duration-200" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#666' }}>
                    Pagina principală
                  </Link>
                </div>
              </div>
            </div>
          )}

          {phase === 'error' && (
            <div className="dark-card p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(248,113,113,0.05) 0%, transparent 70%)' }} />
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}>
                  <span className="text-2xl">✕</span>
                </div>

                <div>
                  <h1 className="text-xl font-black tracking-tight mb-2">A apărut o eroare</h1>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">{errorMsg}</p>
                </div>

                <div className="space-y-3">
                  <button onClick={retry} className="btn-green w-full py-3 font-bold text-sm">
                    Încearcă din nou
                  </button>
                  <Link href="/genereaza" className="block text-sm text-gray-500 hover:text-gray-400 text-center transition-colors">
                    ← Înapoi la formular
                  </Link>
                </div>

                <p className="text-gray-700 text-xs">
                  Verifică rularea în{" "}
                  <a href="https://app.inngest.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">
                    app.inngest.com
                  </a>
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}