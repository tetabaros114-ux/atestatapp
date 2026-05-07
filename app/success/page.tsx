'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AtestateInput } from '@/types/atestat'

type Status = 'generating' | 'success' | 'error'

export default function SuccessPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('generating')
  const [errorMsg, setErrorMsg] = useState('')
  const [filename, setFilename] = useState('atestat.docx')
  const inputRef = useRef<AtestateInput | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('atestateInput')
    if (!raw) {
      router.replace('/genereaza')
      return
    }
    let input: AtestateInput
    try {
      input = JSON.parse(raw)
    } catch {
      router.replace('/genereaza')
      return
    }
    inputRef.current = input
    const lastName = input.student_name?.split(' ')[0] ?? 'Student'
    const firmaShort =
      input.firma?.nume
        ?.replace(/SC\s+/i, '')
        .replace(/\s+S\.[AR]\.L\./i, '')
        .trim()
        .split(' ')[0] ?? 'Firma'
    setFilename(`Atestat_${lastName}_${firmaShort}.docx`)
    generate(input)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function generate(input: AtestateInput) {
    setStatus('generating')
    try {
      const res = await fetch('/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Eroare server' }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      sessionStorage.removeItem('atestateInput')
      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Eroare necunoscută')
      setStatus('error')
    }
  }

  const retry = () => {
    if (inputRef.current) generate(inputRef.current)
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
          {status === 'generating' && (
            <>
              <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h1 className="text-xl font-bold text-[#1e3a5f] mb-2">
                Se generează atestatul tău...
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Inteligența artificială scrie documentul de ~55 de pagini, adaptat la firma și tema ta.
              </p>
              <p className="text-gray-400 text-xs mt-3">
                Durează 45–60 de secunde. Nu închide această pagină.
              </p>
              <div className="mt-6 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#1e3a5f] h-1.5 rounded-full w-3/5 animate-pulse" />
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-green-600 text-3xl">✓</span>
              </div>
              <h1 className="text-xl font-bold text-[#1e3a5f] mb-2">Atestatul a fost generat!</h1>
              <p className="text-gray-500 text-sm mb-1">
                Descărcarea ar fi trebuit să înceapă automat.
              </p>
              <p className="text-gray-400 text-xs mb-8 font-mono">{filename}</p>
              <a
                href="/genereaza"
                className="block w-full border-2 border-[#1e3a5f] text-[#1e3a5f] font-semibold py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm"
              >
                Generează un alt atestat
              </a>
            </>
          )}

          {status === 'error' && (
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
