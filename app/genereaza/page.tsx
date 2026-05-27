'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SimpleFormData } from '@/types/atestat'

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

const SECTIONS = [
  { n: '01', label: 'Date personale', id: 'section-01' },
  { n: '02', label: 'Tema', id: 'section-02' },
  { n: '03', label: 'Firma', id: 'section-03' },
  { n: '04', label: 'Extra', id: 'section-04' },
]

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
  'Comerț cu amănuntul', 'Comerț cu ridicata', 'Producție', 'IT și Software',
  'Turism și HoReCa', 'Construcții', 'Sănătate', 'Agricultură',
  'Transport și Logistică', 'Servicii financiare', 'Educație', 'Altul',
]

const FORME_JURIDICE = ['S.R.L.', 'S.A.', 'R.A.', 'S.N.C.', 'S.C.S.', 'P.F.A.', 'Î.I.', 'Î.F.']

function Field({ label, field, placeholder, required = true, form, errors, onChange }: {
  label: string; field: string; placeholder?: string; required?: boolean
  form: typeof INIT; errors: Record<string, string>
  onChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}{required && <span className="ml-0.5" style={{ color: 'var(--green)' }}>*</span>}
      </label>
      <input
        type="text"
        value={form[field as keyof typeof INIT]}
        onChange={onChange(field)}
        placeholder={placeholder}
        className={`input-dark ${errors[field] ? 'border-red-500/60' : ''}`}
      />
      {errors[field] && <p className="text-red-400 text-xs mt-1.5">{errors[field]}</p>}
    </div>
  )
}

function SelectField({ label, field, options, required = true, placeholder, form, errors, onChange }: {
  label: string; field: string; options: string[]; required?: boolean; placeholder?: string
  form: typeof INIT; errors: Record<string, string>
  onChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}{required && <span className="ml-0.5" style={{ color: 'var(--green)' }}>*</span>}
      </label>
      <select
        value={form[field as keyof typeof INIT]}
        onChange={onChange(field)}
        className={`input-dark select-dark ${errors[field] ? 'border-red-500/60' : ''}`}
      >
        <option value="">{placeholder ?? `— Alege —`}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {errors[field] && <p className="text-red-400 text-xs mt-1.5">{errors[field]}</p>}
    </div>
  )
}

export default function GenereazaPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState(INIT)
  const [emblema, setEmblema] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [activeSection, setActiveSection] = useState(0)

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

  const validate = () => {
    const errs: Record<string, string> = {}
    const req = (k: string, l: string) => { if (!form[k as keyof typeof INIT]?.trim()) errs[k] = `${l} este obligatoriu.` }
    req('student_name', 'Numele elevului')
    req('clasa', 'Clasa')
    req('profesor_coordonator', 'Profesorul coordonator')
    req('liceu', 'Liceul')
    req('specializare', 'Specializarea')
    if (!form.tema) errs.tema = 'Alege o temă.'
    if (form.tema === 'Altă temă' && !form.tema_custom.trim()) errs.tema_custom = 'Scrie tema personalizată.'
    req('firma_nume', 'Denumirea firmei')
    if (!form.firma_domeniu) errs.firma_domeniu = 'Alege un domeniu.'
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
    const tema = form.tema === 'Altă temă' ? form.tema_custom : `${form.tema} la ${form.firma_nume}`
    const data: SimpleFormData = {
      student_name: form.student_name, clasa: form.clasa,
      profesor_coordonator: form.profesor_coordonator, liceu: form.liceu,
      specializare: form.specializare, tema,
      firma_nume: form.firma_nume, firma_forma_juridica: form.firma_forma_juridica,
      firma_domeniu: form.firma_domeniu, extra_info: form.extra_info || undefined,
      emblema_base64, an: new Date().getFullYear().toString(),
    }
    sessionStorage.setItem('atestateInput', JSON.stringify(data))
    router.push('/success')
  }

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/6 bg-[#080808]/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--green)', boxShadow: '0 0 16px rgba(0,255,135,0.3)' }}>
              <span className="text-xs font-black text-[#080808]">A</span>
            </div>
            <span className="text-lg font-bold tracking-tight">Atestat<span className="brand-green">App</span></span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(0,255,135,0.1)', color: 'var(--green)' }}>
              <span>✓</span>
              Plătești doar 10 EUR
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-28 pb-8 px-4 max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-black tracking-tight mb-3">
          Completează formularul
        </h1>
        <p className="text-gray-500 text-sm">Câmpurile cu <span style={{ color: 'var(--green)' }}>*</span> sunt obligatorii. Ia-ți 2 minute.</p>
      </div>

      {/* Progress steps */}
      <div className="max-w-3xl mx-auto px-4 pb-8">
        <div className="flex items-center justify-between">
          {SECTIONS.map(({ n, label, id }, i) => (
            <div key={n} className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveSection(i)
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200"
                style={{
                  background: i === activeSection
                    ? 'var(--green)'
                    : i < activeSection
                    ? 'rgba(0,255,135,0.2)'
                    : 'rgba(255,255,255,0.05)',
                  color: i <= activeSection ? '#080808' : '#555',
                  border: i === activeSection ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {i < activeSection ? '✓' : n}
              </button>
              <span className="text-[10px] hidden sm:block" style={{ color: i === activeSection ? 'var(--green)' : '#555' }}>{label}</span>
            </div>
          ))}
          {/* Connecting lines */}
          <div className="flex-1 mx-2 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,255,135,0.3) 0%, rgba(0,255,135,0.3) 100%)' }} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 pb-20 space-y-4">

        {/* ── 01: Date personale ── */}
        <div id="section-01" className="dark-card p-8 space-y-5" onClick={() => setActiveSection(0)}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(0,255,135,0.12)', color: 'var(--green)' }}>
              01
            </div>
            <h2 className="font-bold text-base">Date personale</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Nume complet elev" field="student_name" placeholder="ex: Popescu Maria Ioana" form={form} errors={errors} onChange={set} />
            <Field label="Clasa" field="clasa" placeholder="ex: XII A" form={form} errors={errors} onChange={set} />
            <Field label="Profesor coordonator" field="profesor_coordonator" placeholder="ex: Prof. Ionescu Dan" form={form} errors={errors} onChange={set} />
            <Field label="Liceu" field="liceu" placeholder="ex: Colegiul Economic Virgil Madgearu" form={form} errors={errors} onChange={set} />
          </div>
          <Field label="Specializare" field="specializare" placeholder="ex: Tehnician în Activități Economice" form={form} errors={errors} onChange={set} />
        </div>

        {/* ── 02: Tema ── */}
        <div id="section-02" className="dark-card p-8 space-y-5" onClick={() => setActiveSection(1)}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(0,255,135,0.12)', color: 'var(--green)' }}>
              02
            </div>
            <h2 className="font-bold text-base">Tema proiectului</h2>
          </div>

          <SelectField label="Tema" field="tema" options={TOPICS} placeholder="— Alege o temă —" form={form} errors={errors} onChange={set} />

          {form.tema === 'Altă temă' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descriere temă <span style={{ color: 'var(--green)' }}>*</span>
              </label>
              <textarea
                value={form.tema_custom}
                onChange={set('tema_custom')}
                rows={2}
                placeholder="ex: Gestiunea trezoreriei la SC Exemplu SRL"
                className="input-dark resize-none"
              />
              {errors.tema_custom && <p className="text-red-400 text-xs mt-1.5">{errors.tema_custom}</p>}
            </div>
          )}
        </div>

        {/* ── 03: Firma ── */}
        <div id="section-03" className="dark-card p-8 space-y-5" onClick={() => setActiveSection(2)}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(0,255,135,0.12)', color: 'var(--green)' }}>
              03
            </div>
            <h2 className="font-bold text-base">Firma aleasă</h2>
          </div>

          <div className="p-4 rounded-xl text-sm space-y-1" style={{ background: 'rgba(0,255,135,0.03)', border: '1px solid rgba(0,255,135,0.12)' }}>
            <p className="font-semibold text-gray-200">✦ AI-ul caută automat</p>
            <p className="text-gray-500 text-xs">CIF, adresă, cod CAEN, număr angajați, dată înființare — totul din surse publice.</p>
          </div>

          <Field label="Denumire firmă" field="firma_nume" placeholder="ex: SC Kaufland Romania SRL" form={form} errors={errors} onChange={set} />

          <div className="grid sm:grid-cols-2 gap-5">
            <SelectField label="Formă juridică" field="firma_forma_juridica" options={FORME_JURIDICE} required={false} placeholder="— Alege —" form={form} errors={errors} onChange={set} />
            <SelectField label="Domeniu" field="firma_domeniu" options={DOMENII} placeholder="— Alege domeniu —" form={form} errors={errors} onChange={set} />
          </div>
        </div>

        {/* ── 04: Extra ── */}
        <div id="section-04" className="dark-card p-8 space-y-5" onClick={() => setActiveSection(3)}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(0,255,135,0.12)', color: 'var(--green)' }}>
              04
            </div>
            <h2 className="font-bold text-base">Informații suplimentare</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Instrucțiuni extra <span className="text-gray-600 font-normal">(opțional)</span>
            </label>
            <textarea
              value={form.extra_info}
              onChange={set('extra_info')}
              rows={3}
              placeholder="ex: Concentrează-te pe activitatea din magazine. Firma are 136 de locații în România."
              className="input-dark resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Emblemă școală <span className="text-gray-600 font-normal">(opțional)</span>
            </label>
            <div
              className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200"
              style={{ borderColor: emblema ? 'rgba(0,255,135,0.4)' : 'rgba(255,255,255,0.1)' }}
              onClick={() => fileRef.current?.click()}
              onMouseEnter={e => { if (!emblema) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,255,135,0.3)' }}
              onMouseLeave={e => { if (!emblema) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              {emblema ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" style={{ color: 'var(--green)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span className="text-sm font-medium" style={{ color: 'var(--green)' }}>{emblema.name}</span>
                  <button type="button" className="text-xs text-gray-500 hover:text-gray-300 ml-2" onClick={e => { e.stopPropagation(); setEmblema(null) }}>×</button>
                </div>
              ) : (
                <div className="space-y-1">
                  <svg className="w-8 h-8 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="text-gray-500 text-sm">Click pentru a încărca emblema</p>
                  <p className="text-gray-700 text-xs">PNG sau JPG · max 5MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden"
              onChange={e => {
                const file = e.target.files?.[0] || null
                if (file && file.size > 5 * 1024 * 1024) { alert('Max 5MB.'); return }
                setEmblema(file)
              }} />
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="dark-card p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,255,135,0.05) 0%, transparent 70%)' }} />
          <div className="relative z-10 space-y-4">
            <div>
              <div className="text-white font-bold text-lg mb-1">Gata de generare!</div>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                10 EUR · un singur atestat · fără abonament · banii înapoi dacă documentul nu se generează corect
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-green w-full sm:w-auto px-12 py-4 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Se procesează...' : 'Continuă — 10 EUR →'}
            </button>
            <p className="text-gray-600 text-xs">Plată securizată · Inngest generează documentul în 3–5 minute</p>
          </div>
        </div>
      </form>
    </div>
  )
}