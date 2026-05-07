'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AtestateInput, FirmaData, SimpleFormData } from '@/types/atestat'

type Phase = 'lookup' | 'generate' | 'success' | 'error'

const PHASE_LABELS: Record<Phase, string> = {
  lookup: 'Se caută datele firmei...',
  generate: 'Se generează documentul...',
  success: 'Gata!',
  error: 'Eroare',
}

export default function SuccessPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('lookup')
  const [errorMsg, setErrorMsg] = useState('')
  const [filename, setFilename] = useState('atestat.docx')
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

    run(simple, `Atestat_${lastName}_${firmaShort}.docx`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function run(simple: SimpleFormData, fname: string) {
    try {
      // ── Step 1: Look up company data ──────────────────────────────────────
      setPhase('lookup')

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
          // Ignore if the lookup returned an error field
          if (!data._error) lookedUp = data
        }
      } catch {
        // Lookup failed — continue with generation using minimal firma data
      }

      // ── Step 2: Build full AtestateInput ──────────────────────────────────
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

      // ── Step 3: Generate the document ─────────────────────────────────────
      setPhase('generate')

      const genRes = await fetch('/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({ error: 'Eroare server' }))
        throw new Error(err.error || `HTTP ${genRes.status}`)
      }

      const blob = await genRes.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fname
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      sessionStorage.removeItem('atestateInput')
      setPhase('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Eroare necunoscută')
      setPhase('error')
    }
  }

  const retry = () => {
    if (simpleRef.current) run(simpleRef.current, filename)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-[#1e3a5f] text-white px-6 py-4 shadow-md">
        <a href="/" className="text-xl font-bold">
          Atestat<span className="text-amber-400">App</span>
        </a>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">

          {/* ── Loading states ── */}
          {(phase === 'lookup' || phase === 'generate') && (
            <>
              <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h1 className="text-xl font-bold text-[#1e3a5f] mb-3">
                {PHASE_LABELS[phase]}
              </h1>

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-3 mb-5">
                <Step
                  label="Caută firma"
                  active={phase === 'lookup'}
                  done={phase === 'generate'}
                />
                <div className="w-8 h-px bg-gray-200" />
                <Step
                  label="Generează document"
                  active={phase === 'generate'}
                  done={false}
                />
              </div>

              {phase === 'lookup' && (
                <p className="text-gray-500 text-sm leading-relaxed">
                  AI-ul caută datele firmei din surse publice (CIF, adresă, CAEN, angajați...).
                </p>
              )}
              {phase === 'generate' && (
                <p className="text-gray-500 text-sm leading-relaxed">
                  AI-ul scrie documentul de ~55 de pagini, adaptat la firma și tema ta.
                </p>
              )}

              <p className="text-gray-400 text-xs mt-4">
                {phase === 'lookup' ? '~15 secunde' : '~45–60 secunde'} · Nu închide pagina
              </p>

              <div className="mt-5 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#1e3a5f] h-1.5 rounded-full transition-all duration-1000 animate-pulse"
                  style={{ width: phase === 'lookup' ? '30%' : '75%' }}
                />
              </div>
            </>
          )}

          {/* ── Success ── */}
          {phase === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-green-600 text-3xl">✓</span>
              </div>
              <h1 className="text-xl font-bold text-[#1e3a5f] mb-2">Atestatul a fost generat!</h1>
              <p className="text-gray-500 text-sm mb-1">Descărcarea ar fi trebuit să înceapă automat.</p>
              <p className="text-gray-400 text-xs mb-8 font-mono">{filename}</p>
              <a
                href="/genereaza"
                className="block w-full border-2 border-[#1e3a5f] text-[#1e3a5f] font-semibold py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm"
              >
                Generează un alt atestat
              </a>
            </>
          )}

          {/* ── Error ── */}
          {phase === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-red-500 text-3xl">✕</span>
              </div>
              <h1 className="text-xl font-bold text-[#1e3a5f] mb-2">A apărut o eroare</h1>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">{errorMsg}</p>
              <button
                onClick={retry}
                className="block w-full bg-[#1e3a5f] text-white font-semibold py-3 rounded-xl hover:bg-blue-900 transition-colors mb-3"
              >
                Încearcă din nou
              </button>
              <a href="/genereaza" className="block text-sm text-gray-400 hover:text-gray-600">
                ← Înapoi la formular
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Step({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          done
            ? 'bg-green-500 text-white'
            : active
            ? 'bg-[#1e3a5f] text-white'
            : 'bg-gray-200 text-gray-400'
        }`}
      >
        {done ? '✓' : active ? '●' : '○'}
      </div>
      <span className={`text-xs ${active ? 'text-[#1e3a5f] font-medium' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  )
}
