'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SimpleFormData } from '@/types/atestat'

const TOPICS = [
  'Disponibilitățile bănești',
  'Aprovizionarea cu mărfuri',
  'Salarizarea personalului',
  'Vânzarea mărfurilor / serviciilor',
  'Imobilizările corporale',
  'Calculul și înregistrarea TVA',
  'Cheltuielile de exploatare',
  'Finanțarea prin credite bancare',
  'Producția și costurile de producție',
  'Decontarea cu furnizorii',
  'Decontarea cu clienții',
  'Operațiuni de import / export',
  'Stocurile de materii prime',
  'Dividendele și repartizarea profitului',
  'Impozitul pe profit',
  'Altă temă',
]

const DOMENII = [
  'Comerț cu amănuntul',
  'Comerț cu ridicata',
  'Producție',
  'IT și Software',
  'Turism și HoReCa',
  'Construcții',
  'Sănătate',
  'Agricultură',
  'Transport și Logistică',
  'Servicii financiare',
  'Educație',
  'Altul',
]

const FORME_JURIDICE = ['S.R.L.', 'S.A.', 'R.A.', 'S.N.C.', 'S.C.S.', 'P.F.A.', 'Î.I.', 'Î.F.']

const INIT = {
  student_name: '',
  clasa: '',
  profesor_coordonator: '',
  liceu: '',
  specializare: '',
  tema: '',
  tema_custom: '',
  firma_nume: '',
  firma_forma_juridica: 'S.R.L.',
  firma_domeniu: '',
  extra_info: '',
}

export default function GenereazaPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState(INIT)
  const [emblema, setEmblema] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const set =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }

  const validate = () => {
    const errs: Record<string, string> = {}
    const req = (key: string, label: string) => {
      if (!form[key as keyof typeof INIT]?.trim()) errs[key] = `${label} este obligatoriu.`
    }
    req('student_name', 'Numele elevului')
    req('clasa', 'Clasa')
    req('profesor_coordonator', 'Profesorul coordonator')
    req('liceu', 'Liceul')
    req('specializare', 'Specializarea')
    if (!form.tema) errs.tema = 'Tema este obligatorie.'
    if (form.tema === 'Altă temă' && !form.tema_custom.trim())
      errs.tema_custom = 'Introdu tema personalizată.'
    req('firma_nume', 'Denumirea firmei')
    if (!form.firma_domeniu) errs.firma_domeniu = 'Domeniul este obligatoriu.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSubmitting(true)

    let emblema_base64: string | undefined
    if (emblema) {
      emblema_base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.readAsDataURL(emblema)
      })
    }

    const tema =
      form.tema === 'Altă temă'
        ? form.tema_custom
        : `${form.tema} la ${form.firma_nume}`

    const data: SimpleFormData = {
      student_name: form.student_name,
      clasa: form.clasa,
      profesor_coordonator: form.profesor_coordonator,
      liceu: form.liceu,
      specializare: form.specializare,
      tema,
      firma_nume: form.firma_nume,
      firma_forma_juridica: form.firma_forma_juridica,
      firma_domeniu: form.firma_domeniu,
      extra_info: form.extra_info || undefined,
      emblema_base64,
      an: new Date().getFullYear().toString(),
    }

    sessionStorage.setItem('atestateInput', JSON.stringify(data))
    router.push('/success')
  }

  const inputCls = (field: string) =>
    `input-dark ${errors[field] ? 'error' : ''}`

  const selectCls = (field: string) =>
    `input-dark ${errors[field] ? 'error' : ''}`

  const Field = ({
    label,
    field,
    placeholder,
    required = true,
    type = 'text',
  }: {
    label: string
    field: string
    placeholder?: string
    required?: boolean
    type?: string
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}{' '}
        {required ? (
          <span style={{ color: 'var(--green)' }}>*</span>
        ) : (
          <span className="text-gray-600 font-normal">(opțional)</span>
        )}
      </label>
      <input
        type={type}
        value={form[field as keyof typeof INIT]}
        onChange={set(field)}
        placeholder={placeholder}
        className={inputCls(field)}
      />
      {errors[field] && <p className="text-red-400 text-xs mt-1">{errors[field]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Atestat<span className="brand-green">App</span>
          </Link>
          <span className="text-gray-500 text-sm hidden sm:block">Generează atestat</span>
        </div>
      </nav>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 pt-28 pb-16 space-y-5">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Generează <span className="brand-green">atestatul tău</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Câmpurile cu <span style={{ color: 'var(--green)' }}>*</span> sunt obligatorii.
          </p>
        </div>

        {Object.keys(errors).length > 0 && (
          <div
            className="rounded-xl px-5 py-4 text-sm"
            style={{
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.25)',
              color: '#f87171',
            }}
          >
            Există câmpuri incomplete. Verifică câmpurile marcate mai jos.
          </div>
        )}

        {/* ── 1. Date personale ── */}
        <section className="dark-card p-6 space-y-4">
          <h2
            className="font-bold text-base pb-3 border-b flex items-center gap-2"
            style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--green)' }}
          >
            <span className="opacity-60 text-sm font-mono">01</span> Date personale
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nume complet elev" field="student_name" placeholder="ex: Popescu Maria Ioana" />
            <Field label="Clasa" field="clasa" placeholder="ex: XII A" />
            <Field label="Profesor coordonator" field="profesor_coordonator" placeholder="ex: Ionescu Dan" />
            <Field label="Liceu" field="liceu" placeholder="ex: Colegiul Economic Virgil Madgearu" />
          </div>
          <Field label="Specializare" field="specializare" placeholder="ex: Tehnician în Activități Economice" />
        </section>

        {/* ── 2. Tema ── */}
        <section className="dark-card p-6 space-y-4">
          <h2
            className="font-bold text-base pb-3 border-b flex items-center gap-2"
            style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--green)' }}
          >
            <span className="opacity-60 text-sm font-mono">02</span> Tema proiectului
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Tema <span style={{ color: 'var(--green)' }}>*</span>
            </label>
            <select value={form.tema} onChange={set('tema')} className={`${selectCls('tema')} select-dark`}>
              <option value="">— Alege tema —</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.tema && <p className="text-red-400 text-xs mt-1">{errors.tema}</p>}
          </div>
          {form.tema === 'Altă temă' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Tema personalizată <span style={{ color: 'var(--green)' }}>*</span>
              </label>
              <input
                type="text"
                value={form.tema_custom}
                onChange={set('tema_custom')}
                placeholder="ex: Gestiunea stocurilor la SC Exemplu SRL"
                className={inputCls('tema_custom')}
              />
              {errors.tema_custom && (
                <p className="text-red-400 text-xs mt-1">{errors.tema_custom}</p>
              )}
            </div>
          )}
        </section>

        {/* ── 3. Firma ── */}
        <section className="dark-card p-6 space-y-4">
          <div className="pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2
              className="font-bold text-base flex items-center gap-2"
              style={{ color: 'var(--green)' }}
            >
              <span className="opacity-60 text-sm font-mono">03</span> Firma aleasă
            </h2>
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
              <span style={{ color: 'var(--green)', opacity: 0.7 }}>✦</span>
              Restul datelor (CIF, adresă, CAEN, angajați etc.) sunt completate automat de AI din surse publice.
            </p>
          </div>

          <Field label="Denumire firmă" field="firma_nume" placeholder="ex: SC KAUFLAND ROMANIA S.R.L." />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Forma juridică <span style={{ color: 'var(--green)' }}>*</span>
              </label>
              <select
                value={form.firma_forma_juridica}
                onChange={set('firma_forma_juridica')}
                className="input-dark select-dark"
              >
                {FORME_JURIDICE.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Domeniu activitate <span style={{ color: 'var(--green)' }}>*</span>
              </label>
              <select
                value={form.firma_domeniu}
                onChange={set('firma_domeniu')}
                className={`${selectCls('firma_domeniu')} select-dark`}
              >
                <option value="">— Alege domeniu —</option>
                {DOMENII.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              {errors.firma_domeniu && (
                <p className="text-red-400 text-xs mt-1">{errors.firma_domeniu}</p>
              )}
            </div>
          </div>
        </section>

        {/* ── 4. Extra ── */}
        <section className="dark-card p-6 space-y-4">
          <h2
            className="font-bold text-base pb-3 border-b flex items-center gap-2"
            style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--green)' }}
          >
            <span className="opacity-60 text-sm font-mono">04</span> Informații suplimentare
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Instrucțiuni extra{' '}
              <span className="text-gray-600 font-normal">(opțional)</span>
            </label>
            <textarea
              value={form.extra_info}
              onChange={set('extra_info')}
              rows={3}
              placeholder="ex: Concentrează-te pe angajații din magazine. Firma are 136 de locații în România."
              className="input-dark resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Emblemă școală{' '}
              <span className="text-gray-600 font-normal">(opțional — PNG/JPG, fundal alb)</span>
            </label>
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200"
              style={{ borderColor: emblema ? 'rgba(0,255,135,0.4)' : 'rgba(255,255,255,0.1)' }}
              onClick={() => fileRef.current?.click()}
              onMouseEnter={(e) => {
                if (!emblema) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,255,135,0.3)'
              }}
              onMouseLeave={(e) => {
                if (!emblema) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)'
              }}
            >
              {emblema ? (
                <div className="font-medium text-sm" style={{ color: 'var(--green)' }}>
                  ✓ {emblema.name}
                </div>
              ) : (
                <>
                  <div className="text-2xl mb-2 opacity-40">📷</div>
                  <div className="text-gray-500 text-sm">Click pentru a încărca emblema</div>
                  <div className="text-gray-600 text-xs mt-1">PNG sau JPG · fundal alb · max 5MB</div>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                if (file && file.size > 5 * 1024 * 1024) {
                  alert('Fișierul este prea mare. Maxim 5MB.')
                  return
                }
                setEmblema(file)
              }}
            />
          </div>
        </section>

        {/* ── Submit ── */}
        <div
          className="dark-card p-8 text-center space-y-4 relative overflow-hidden"
          style={{ borderColor: 'rgba(0,255,135,0.15)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,255,135,0.06) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <div className="text-white font-bold text-lg mb-1">Totul este completat?</div>
            <p className="text-gray-500 text-sm mb-6">
              AI-ul caută automat datele firmei și generează documentul de ~55 de pagini.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="btn-green w-full md:w-auto px-10 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? 'Se procesează...' : 'Continuă spre plată — 10 EUR →'}
            </button>
            <p className="text-gray-600 text-xs mt-4">Plată securizată prin Stripe · Fără abonament</p>
          </div>
        </div>
      </form>
    </div>
  )
}
