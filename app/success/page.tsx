'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import type { SimpleFormData } from '@/types/atestat'

type Phase = 'loading' | 'done' | 'error'
type Step = 0 | 1 | 2 | 3

const STEPS = [
  { label: 'Se caută datele firmei', doneLabel: 'Datele firmei au fost găsite' },
  { label: 'AI-ul scrie documentul', doneLabel: 'Documentul a fost scris' },
  { label: 'Se construiește fișierul Word', doneLabel: 'Fișierul Word este gata' },
]

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
}

const stepVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  }),
}

async function pollStatus(jobId: string, onStep: (step: Step) => void, timeout = 600000): Promise<{ downloadUrl: string; filename: string }> {
  const deadline = Date.now() + timeout
  let lastSeenStep: Step = 0
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`/api/status/${jobId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.status === 'completed') {
        onStep(3)
        return { downloadUrl: data.downloadUrl ?? '', filename: data.filename ?? 'atestat.docx' }
      }
      if (data.status === 'failed') throw new Error(data.error || 'Generarea a eșuat.')
      if (typeof data.step === 'number' && data.step !== lastSeenStep) {
        lastSeenStep = data.step as Step
        onStep(lastSeenStep)
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
      const { jobId } = await res.json()
      runIdRef.current = jobId
      const result = await pollStatus(jobId, setCurrentStep)
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
    <div className="flex-1 relative z-10">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[var(--bg)]/70 backdrop-blur-xl border-b border-[var(--border-soft)]">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center glow-sm">
              <span className="text-[#04140D] font-bold text-sm">A</span>
            </div>
            <span className="font-semibold tracking-tight">
              Atestat<span className="serif italic">App</span>
              <span className="text-[var(--ink-soft)]">.ro</span>
            </span>
          </Link>
          <span className="eyebrow-emerald">
            Plată confirmată · ID #{runIdRef.current?.slice(0, 8) || '...'}
          </span>
        </div>
      </header>

      <div className="container max-w-2xl py-10 md:py-16">
        <AnimatePresence mode="wait">
          {phase === 'loading' && (
            <motion.div
              key="loading"
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="card p-8 md:p-12 relative overflow-hidden"
            >
              <div
                className="absolute inset-0 -z-0"
                style={{
                  background:
                    'radial-gradient(ellipse 60% 50% at 50% 0%, var(--accent-glow-sm) 0%, transparent 70%)',
                }}
                aria-hidden
              />
              <div className="relative">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-[var(--accent-soft)] flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                        className="w-10 h-10 text-[var(--accent)]"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 6v6l4 2" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </motion.div>
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/30"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                    Se generează atestatul tău...
                  </h1>
                  <p className="text-[var(--ink-muted)]">
                    AI-ul nostru scrie cele 55-60 de pagini. Poate dura 3-5 minute.
                  </p>
                </div>

                <div className="space-y-1 mb-8">
                  <p className="eyebrow mb-3 text-center">
                    Pasul {Math.min(currentStep + 1, STEPS.length)} din {STEPS.length}
                  </p>
                  <AnimatePresence>
                    {STEPS.map((step, i) => {
                      const isDone = i < currentStep
                      const isActive = i === currentStep
                      const isPending = i > currentStep
                      if (isPending) return null
                      return (
                        <motion.div
                          key={step.label}
                          variants={stepVariants}
                          custom={i}
                          initial="hidden"
                          animate="visible"
                          className="flex items-start gap-3 text-sm relative"
                        >
                          <div className="relative">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 relative z-10 ${
                                isDone ? 'bg-[var(--accent)] text-[#04140D]' : 'bg-[var(--accent-soft)] text-[var(--accent)]'
                              }`}
                            >
                              {isDone ? (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <motion.path
                                    d="M20 6 9 17l-5-5"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                  />
                                </svg>
                              ) : (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                  className="w-4 h-4"
                                >
                                  <svg viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                </motion.div>
                              )}
                            </div>
                            {isActive && (
                              <motion.div
                                layoutId="active-step-glow"
                                className="absolute inset-0 rounded-full pointer-events-none"
                                style={{ boxShadow: '0 0 0 4px var(--accent-glow-sm)' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                              />
                            )}
                          </div>
                          {i < STEPS.length - 1 && (
                            <div
                              className="absolute left-[15px] top-8 w-px z-0"
                              style={{
                                height: 'calc(100% - 8px)',
                                background: isDone ? 'var(--accent)' : 'var(--border)',
                                opacity: isDone ? 0.5 : 1,
                              }}
                            />
                          )}
                          <span
                            className={`pt-1.5 ${isDone ? 'text-[var(--ink-muted)] line-through decoration-[var(--ink-faint)]' : 'text-[var(--ink)] font-medium'}`}
                          >
                            {isDone ? step.doneLabel : step.label}
                          </span>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>

                <div className="bg-[var(--bg-warm)] rounded-xl p-4 flex items-start gap-3 text-sm">
                  <svg
                    className="w-4 h-4 text-[var(--ink-muted)] shrink-0 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <p className="text-[var(--ink-muted)] leading-relaxed">
                    <strong className="text-[var(--ink)] font-medium">
                      Nu închide această pagină.
                    </strong>{' '}
                    Linkul de descărcare apare automat aici. Dacă durează mai mult de 5 minute,
                    scrie-ne.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div
              key="done"
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="card p-8 md:p-12 text-center relative overflow-hidden"
            >
              <div
                className="absolute inset-0 -z-0"
                style={{
                  background:
                    'radial-gradient(ellipse 60% 50% at 50% 0%, var(--accent-glow-sm) 0%, transparent 70%)',
                }}
                aria-hidden
              />

              <div className="relative">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-lg glow-pulse">
                      <svg
                        className="w-10 h-10 text-[#04140D]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <motion.path
                          d="M20 6 9 17l-5-5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
                        />
                      </svg>
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[var(--accent)]"
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl md:text-3xl font-bold tracking-tight mb-2"
                >
                  Gata! Atestatul tău e pregătit.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-[var(--ink-muted)] mb-8 max-w-md mx-auto"
                >
                  Documentul Word a fost generat cu succes. Apasă butonul de mai jos pentru a-l
                  descărca.
                </motion.p>

                {downloadUrl ? (
                  <motion.a
                    href={downloadUrl}
                    download={filename}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-accent text-base py-4 px-8 inline-flex"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
                    </svg>
                    Descarcă atestatul
                  </motion.a>
                ) : (
                  <p className="text-[var(--ink-muted)] text-sm">
                    Linkul de descărcare va apărea în curând. Contactează-ne dacă nu se încarcă în
                    5 minute.
                  </p>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
                >
                  <Link href="/genereaza" className="btn-secondary text-sm py-2.5">
                    Generează altul
                  </Link>
                  <Link href="/" className="btn-ghost text-sm py-2.5">
                    Pagina principală
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 pt-6 border-t border-[var(--border-soft)] grid sm:grid-cols-3 gap-4 text-left"
                >
                  <div className="text-center sm:text-left">
                    <div className="text-xs text-[var(--ink-soft)]">Fișier</div>
                    <div className="font-medium text-sm truncate" title={filename}>
                      {filename || 'atestat.docx'}
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-xs text-[var(--ink-soft)]">Format</div>
                    <div className="font-medium text-sm">Word .docx</div>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-xs text-[var(--ink-soft)]">Disponibil</div>
                    <div className="font-medium text-sm">7 zile</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {phase === 'error' && (
            <motion.div
              key="error"
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="card p-8 md:p-12 text-center relative overflow-hidden"
            >
              <div
                className="absolute inset-0 -z-0"
                style={{
                  background:
                    'radial-gradient(ellipse 60% 50% at 50% 0%, var(--danger-soft) 0%, transparent 70%)',
                }}
                aria-hidden
              />

              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="flex justify-center mb-6"
                >
                  <div className="w-20 h-20 rounded-full bg-[var(--danger-soft)] flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-[var(--danger)]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-bold tracking-tight mb-2"
                >
                  A apărut o problemă
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-[var(--ink-muted)] mb-2 max-w-md mx-auto"
                >
                  Nu am putut genera atestatul de data aceasta.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-[var(--ink-soft)] mb-8 max-w-md mx-auto leading-relaxed"
                >
                  {errorMsg || 'Eroare necunoscută.'}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="max-w-sm mx-auto space-y-3"
                >
                  <motion.button
                    onClick={retry}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-accent w-full justify-center text-sm py-3"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M8 16H3v5" />
                    </svg>
                    Încearcă din nou (fără re-plată)
                  </motion.button>
                  <Link
                    href="/genereaza"
                    className="block text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                  >
                    ← Înapoi la formular
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 bg-[var(--bg-warm)] rounded-xl p-4 text-left"
                >
                  <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                    <strong className="text-[var(--ink)]">Ai nevoie de ajutor?</strong> Scrie-ne la{' '}
                    <a
                      href="mailto:contact@atestatapp.ro"
                      className="underline hover:text-[var(--ink)]"
                    >
                      contact@atestatapp.ro
                    </a>{' '}
                    și rezolvăm în maxim 24h — sau îți returnăm banii.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
