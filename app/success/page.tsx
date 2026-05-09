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
  const [charsReceived, setCharsReceived] = useState(0)
  const [lastChunk, setLastChunk] = useState('')
  const simpleRef = useRef<SimpleFormData | null>(null)
  const abortRef = useRef<AbortController | null>(null)

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

      // ── Step 2: Stream content from AI ─────────────────────────────────────
      setPhase('generate')
      setCharsReceived(0)
      setLastChunk('')

      const controller = new AbortController()
      abortRef.current = controller

      const response = await fetch('/api/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Eroare server' }))
        throw new Error(err.error || `HTTP ${response.status}`)
      }

      if (!response.body) throw new Error('Răspunsul nu conține un body.')

      let fullText = ''

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const dataStr = line.slice(6)
          try {
            const data = JSON.parse(dataStr)
            if (data.type === 'chunk') {
              fullText += data.text
              setCharsReceived(fullText.length)
              // Update last visible snippet (last 20 chars)
              setLastChunk(fullText.slice(-20))
            } else if (data.type === 'done') {
              // fullText now contains the complete JSON response
              break
            } else if (data.type === 'error') {
              throw new Error(data.message)
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      // Clean and parse JSON — extract only the JSON object
      let cleaned = fullText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim()

      // Guard: find first { and last } to extract pure JSON
      const jsonStart = cleaned.indexOf('{')
      const jsonEnd = cleaned.lastIndexOf('}')
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error(`AI-ul nu a returnat JSON valid. Primele 200 caractere: ${cleaned.slice(0, 200)}`)
      }
      cleaned = cleaned.slice(jsonStart, jsonEnd + 1)

      let content: AtestateContent
      try {
        const parsed = JSON.parse(cleaned)
        if (parsed.status === 'error') throw new Error(parsed.message)
        content = parsed
      } catch {
        throw new Error(`AI-ul nu a returnat JSON valid. Primele 200 caractere: ${cleaned.slice(0, 200)}`)
      }

      // ── Step 3: Build the .docx ────────────────────────────────────────────
      setPhase('building')

      const docxRes = await fetch('/api/build-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, input }),
      })

      if (!docxRes.ok) {
        const err = await docxRes.json().catch(() => ({ error: 'Eroare la construirea documentului' }))
        throw new Error(err.error || `HTTP ${docxRes.status}`)
      }

      const blob = await docxRes.blob()
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
    if (abortRef.current) abortRef.current.abort()
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
                <Step label="Caută firma" active={phase === 'lookup'} done={phase !== 'lookup'} />
                <div className="w-6 h-px bg-white/10" />
                <Step label="Generează AI" active={phase === 'generate'} done={phase === 'building'} />
                <div className="w-6 h-px bg-white/10" />
                <Step label="Construiește .docx" active={phase === 'building'} done={false} />
              </div>

              {phase === 'lookup' && (
                <p className="text-gray-500 text-sm leading-relaxed">
                  AI-ul caută datele firmei din surse publice (CIF, adresă, CAEN...).
                </p>
              )}

              {phase === 'generate' && (
                <div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">
                    AI-ul scrie documentul de ~55 de pagini în timp real...
                  </p>
                  <div className="bg-[#1a1a1a] rounded-lg px-4 py-3 text-left mb-3">
                    <div className="text-gray-600 text-xs mb-1 font-mono">Ultimele caractere primite:</div>
                    <div className="text-gray-400 text-xs font-mono break-all">
                      <span style={{ color: 'var(--green)' }}>...{lastChunk}</span>
                      <span className="animate-pulse" style={{ color: 'var(--green)' }}>▌</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Se primește răspunsul AI...</span>
                    <span>{charsReceived.toLocaleString('ro-RO')} caractere</span>
                  </div>
                  <div className="w-full bg-[#1a1a1a] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full animate-pulse"
                      style={{
                        width: `${Math.min(100, (charsReceived / 8000) * 100)}%`,
                        background: 'var(--green)',
                        boxShadow: '0 0 8px rgba(0,255,135,0.5)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {phase === 'building' && (
                <p className="text-gray-500 text-sm leading-relaxed">
                  Se formatează documentul Word (.docx) — câteva secunde...
                </p>
              )}

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