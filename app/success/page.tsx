'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { AtestateInput, FirmaData, SimpleFormData, AtestateContent } from '@/types/atestat'

type Phase = 'lookup' | 'generate' | 'building' | 'success' | 'error'

const PHASE_LABELS: Record<Phase, string> = {
  lookup: 'Se caută datele firmei...',
  generate: 'Se scrie documentul...',
  building: 'Se construiește fișierul...',
  success: 'Gata!',
  error: 'Eroare',
}

export default function SuccessPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('lookup')
  const [errorMsg, setErrorMsg] = useState('')
  const [filename, setFilename] = useState('atestat.docx')
  const [progress, setProgress] = useState('')
  const simpleRef = useRef<SimpleFormData | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('atestateInput')
    if (!raw) { router.replace('/genereaza'); return }

    let simple: SimpleFormData
    try { simple = JSON.parse(raw) } catch { router.replace('/genereaza'); return }

    simpleRef.current = simple
    const lastName = simple.student_name?.split(' ')[0] ?? 'Student'
    const firmaShort = simple.firma_nume?.replace(/SC\s+/i, '').trim().split(' ')[0] ?? 'Firma'
    setFilename(`Atestat_${lastName}_${firmaShort}.docx`)

    run(simple)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function run(simple: SimpleFormData) {
    try {
      setPhase('lookup')

      // ── Step 1: Lookup company data ────────────────────────────────────────
      setProgress('Căutare date firmă...')

      let lookedUp: Partial<FirmaData> = {}
      try {
        const lookupRes = await fetch('/api/lookup-firma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firma_nume: simple.firma_nume,
            forma_juridica: simple.firma_forma_juridica,
            domeniu: simple.firma_domeniu,
          }),
        })
        if (lookupRes.ok) {
          const data = await lookupRes.json()
          if (!data._error) lookedUp = data
        }
      } catch {
        // Lookup failed — continue with minimal firma data
      }

      // Build full input
      const input: AtestateInput = {
        student_name: simple.student_name,
        clasa: simple.clasa,
        profesor_coordonator: simple.profesor_coordonator,
        liceu: simple.liceu,
        specializare: simple.specializare,
        tema: simple.tema,
        firma: {
          nume: simple.firma_nume,
          forma_juridica: simple.firma_forma_juridica,
          domeniu: simple.firma_domeniu,
          cif: lookedUp.cif ?? '',
          rc: lookedUp.rc ?? '',
          caen_cod: lookedUp.caen_cod ?? '',
          caen_desc: lookedUp.caen_desc ?? '',
          adresa: lookedUp.adresa ?? '',
          telefon: lookedUp.telefon ?? '',
          email: lookedUp.email ?? '',
          iban: lookedUp.iban ?? '',
          banca: lookedUp.banca ?? '',
          an_infiintare: lookedUp.an_infiintare ?? '',
          angajati: lookedUp.angajati ?? 0,
          produse_servicii: lookedUp.produse_servicii ?? [],
          clienti_principali: lookedUp.clienti_principali,
        },
        an: simple.an,
        emblema_base64: simple.emblema_base64,
        extra_info: simple.extra_info,
      }

      // ── Step 2: Generate content (non-streaming, more reliable) ─────────────
      setPhase('generate')
      setProgress('AI-ul scrie documentul (~45-60 secunde)...')

      const genRes = await fetch('/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({ error: 'Eroare server' }))
        throw new Error(err.error || `HTTP ${genRes.status}`)
      }

      // The response IS the .docx blob directly (no streaming)
      setPhase('building')
      setProgress('Se formatează documentul Word...')

      const blob = await genRes.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      sessionStorage.removeItem('atestateInput')
      setPhase('success')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setErrorMsg(err instanceof Error ? err.message : 'Eroare necunoscută')
      setPhase('error')
    }
  }

  const retry = () => {
    if (simpleRef.current) run(simpleRef.current)
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
          {/* Subtle glow behind card content */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,255,135,0.05) 0%, transparent 70%)',
            }}
          />

          {/* ── Loading states ── */}
          {(phase === 'lookup' || phase === 'generate' || phase === 'building') && (
            <div className="relative z-10">
              {/* Spinner */}
              <div
                className="w-16 h-16 rounded-full border-4 animate-spin mx-auto mb-6"
                style={{
                  borderColor: 'rgba(0,255,135,0.15)',
                  borderTopColor: 'var(--green)',
                }}
              />
              <h1 className="text-xl font-bold text-white mb-4">
                {PHASE_LABELS[phase]}
              </h1>

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <Step label="Caută firmă" active={phase === 'lookup'} done={phase !== 'lookup'} />
                <div className="w-6 h-px bg-white/10" />
                <Step label="Generează AI" active={phase === 'generate'} done={phase === 'building'} />
                <div className="w-6 h-px bg-white/10" />
                <Step label="Construiește .docx" active={phase === 'building'} done={false} />
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                {phase === 'lookup'
                  ? 'AI-ul caută datele firmei din surse publice (CIF, adresă, CAEN...).'
                  : phase === 'generate'
                  ? progress
                  : 'Se formatează documentul Word (.docx) — câteva secunde...'}
              </p>

              <p className="text-gray-600 text-xs mt-4">Nu închide pagina.</p>
            </div>
          )}

          {/* ── Success ── */}
          {phase === 'success' && (
            <div className="relative z-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(0,255,135,0.12)', border: '1px solid rgba(0,255,135,0.3)' }}
              >
                <span className="text-3xl font-bold" style={{ color: 'var(--green)' }}>✓</span>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Atestatul a fost generat!</h1>
              <p className="text-gray-500 text-sm mb-1">Descărcarea ar fi trebuit să înceapă automat.</p>
              <p className="text-gray-600 text-xs mb-8 font-mono">{filename}</p>
              <Link
                href="/genereaza"
                className="block w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200"
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
              <button
                onClick={retry}
                className="btn-green block w-full py-3 text-sm mb-3"
              >
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

function Step({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
        style={
          done
            ? { background: 'var(--green)', color: '#0a0a0a' }
            : active
            ? { background: 'rgba(0,255,135,0.15)', border: '1px solid var(--green)', color: 'var(--green)' }
            : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#555' }
        }
      >
        {done ? '✓' : active ? '●' : '○'}
      </div>
      <span
        className="text-xs transition-colors duration-300"
        style={{ color: active ? 'var(--green)' : done ? 'rgba(0,255,135,0.6)' : '#555' }}
      >
        {label}
      </span>
    </div>
  )
}