'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SimpleFormData } from '@/types/atestat'

type Phase = 'loading' | 'done' | 'error'

export default function SuccessPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('loading')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [filename, setFilename] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const raw = sessionStorage.getItem('atestateInput')
    if (!raw) { router.replace('/genereaza'); return }

    let simple: SimpleFormData
    try { simple = JSON.parse(raw) } catch { router.replace('/genereaza'); return }

    generate(simple)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function generate(simple: SimpleFormData) {
    try {
      const res = await fetch('/api/generate-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simple),
        // IMPORTANT: signal option allows AbortController to cancel if page unloads
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Eroare server' }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setDownloadUrl(data.downloadUrl ?? '')
      setFilename(data.filename ?? 'atestat.docx')
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
        generate(simple)
      } catch {
        router.replace('/genereaza')
      }
    } else {
      router.replace('/genereaza')
    }
  }

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

          {/* Loading */}
          {phase === 'loading' && (
            <div className="relative z-10">
              <div
                className="w-16 h-16 rounded-full border-4 animate-spin mx-auto mb-6"
                style={{ borderColor: 'rgba(0,255,135,0.15)', borderTopColor: 'var(--green)' }}
              />
              <h1 className="text-xl font-bold text-white mb-2">Se generează atestatul...</h1>
              <p className="text-gray-500 text-sm mb-6">
                durează 1–2 minute. Nu închide pagina.
              </p>
              <div className="w-full bg-white/5 rounded-full h-2 mb-2 overflow-hidden">
                <div
                  className="h-2 rounded-full animate-pulse"
                  style={{ width: '60%', background: 'var(--green)' }}
                />
              </div>
              <p className="text-gray-600 text-xs">AI-ul caută firma, scrie documentul și construiește fișierul...</p>
            </div>
          )}

          {/* Done */}
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

          {/* Error */}
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
