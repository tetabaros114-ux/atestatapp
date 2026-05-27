'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SimpleFormData } from '@/types/atestat'

type Phase = 'loading' | 'done' | 'error'
type Step = 0 | 1 | 2 | 3

const STEPS = [
  { label: 'Se caută datele firmei', doneLabel: 'Datele firmei au fost găsite' },
  { label: 'AI-ul scrie documentul', doneLabel: 'Documentul a fost scris' },
  { label: 'Se construiește fișierul Word', doneLabel: 'Fișierul Word este gata' },
]

async function pollStatus(runId: string, onStep: (step: Step) => void, timeout = 600000): Promise<{ downloadUrl: string; filename: string }> {
  const deadline = Date.now() + timeout
  let currentStep: Step = 0
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`/api/run/${runId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.status === 'completed') {
        onStep(3)
        return { downloadUrl: data.downloadUrl ?? '', filename: data.filename ?? 'atestat.docx' }
      }
      if (data.status === 'failed') throw new Error(data.error || 'Generarea a eșuat.')
      // Step-based progress: advance step based on elapsed time
      const elapsed = Date.now() - (deadline - timeout)
      if (elapsed < 20000) {
        if (currentStep !== 0) { currentStep = 0; onStep(0) }
      } else if (elapsed < 300000) {
        if (currentStep !== 1) { currentStep = 1; onStep(1) }
      } else {
        if (currentStep !== 2) { currentStep = 2; onStep(2) }
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('HTTP')) throw err
    }
    await new Promise(r => setTimeout(r, 5000))
  }
  throw new Error('Timpul a expirat. Contactează-ne la contact@atestatapp.ro.')
}

export default function SuccessPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('loading')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [filename, setFilename] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [currentStep, setCurrentStep] = useState<Step>(0)
  const runIdRef = useRef('')

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
      runIdRef.current = runId
      const result = await pollStatus(runId, setCurrentStep)
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
        setCurrentStep(0)
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

                {/* Step-based progress — honest, no fake percentages */}
                <div>
                  <p className="text-xs text-gray-600 mb-4 text-center">Pasul {currentStep + 1} din {STEPS.length}</p>

                  {/* Step indicator rows */}
                  <div className="space-y-0">
                    {STEPS.map((step, i) => {
                      const isDone = i < currentStep
                      const isActive = i === currentStep
                      return (
                        <div key={step.label} className="flex items-start gap-3 text-sm relative">
                          {/* Circle indicator */}
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0 relative z-10"
                            style={{
                              background: isDone || isActive ? 'rgba(0,255,135,0.12)' : 'rgba(255,255,255,0.04)',
                              border: isDone ? '1.5px solid rgba(0,255,135,0.5)' : isActive ? '1.5px solid rgba(0,255,135,0.3)' : '1.5px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            {isDone ? (
                              <svg className="w-3.5 h-3.5" style={{ color: 'var(--green)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            ) : isActive ? (
                              <svg className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--green)' }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full block" style={{ background: 'rgba(255,255,255,0.2)' }} />
                            )}
                          </div>
                          {/* Connecting line (not on last) */}
                          {i < STEPS.length - 1 && (
                            <div
                              className="absolute left-[13px] top-7 w-0.5 z-0"
                              style={{
                                height: 'calc(100% + 12px)',
                                background: i < currentStep ? 'rgba(0,255,135,0.25)' : 'rgba(255,255,255,0.05)',
                              }}
                            />
                          )}
                          <span className="pt-1" style={{ color: isDone ? '#aaa' : isActive ? '#fff' : '#555', fontWeight: isActive ? 500 : 400 }}>
                            {isDone ? step.doneLabel : step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <p className="text-gray-700 text-xs">
                  Nu închide această pagină — linkul de descărcare apare automat aici.
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
                    Linkul de descărcare va apărea în curând. Contactează-ne dacă nu se încarcă în 5 minute.
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
                <p className="text-xs text-gray-600">Fișierul va fi disponibil pentru descărcare 7 zile.</p>
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
                  Contactează-ne la <a href="mailto:contact@atestatapp.ro" className="underline hover:text-gray-400 transition-colors">contact@atestatapp.ro</a> dacă problema persistă.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}