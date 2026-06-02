'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import type { SimpleFormData } from '@/types/atestat'

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
}

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
  { n: '01', label: 'Date elev', id: 'section-01' },
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

function Field({ label, field, placeholder, required = true, hint, form, errors, onChange }: {
  label: string; field: string; placeholder?: string; required?: boolean; hint?: string
  form: typeof INIT; errors: Record<string, string>
  onChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}) {
  return (
    <div>
      <label className="field-label">
        {label}{required && <span className="req">*</span>}
      </label>
      <input
        type="text"
        value={form[field as keyof typeof INIT]}
        onChange={onChange(field)}
        placeholder={placeholder}
        className={`input ${errors[field] ? 'error' : ''}`}
      />
      {hint && !errors[field] && <p className="field-hint">{hint}</p>}
      {errors[field] && <p className="text-xs text-[var(--danger)] mt-1.5 flex items-center gap-1">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        {errors[field]}
      </p>}
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
      <label className="field-label">
        {label}{required && <span className="req">*</span>}
      </label>
      <select
        value={form[field as keyof typeof INIT]}
        onChange={onChange(field)}
        className={`input ${errors[field] ? 'error' : ''}`}
      >
        <option value="">{placeholder ?? `— Alege —`}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {errors[field] && <p className="text-xs text-[var(--danger)] mt-1.5 flex items-center gap-1">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        {errors[field]}
      </p>}
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
    <div className="flex-1">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[var(--bg)]/85 backdrop-blur-xl border-b border-[var(--border-soft)]">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--ink)] flex items-center justify-center">
              <span className="text-[var(--bg)] font-bold text-sm">A</span>
            </div>
            <span className="font-semibold tracking-tight">
              Atestat<span className="serif italic">App</span>
              <span className="text-[var(--ink-soft)]">.ro</span>
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <span className="badge badge-accent">
              <span className="dot bg-[var(--accent)]" />
              Plătești doar 10 EUR
            </span>
            <span className="text-[var(--ink-soft)] hidden md:inline">· 2 minute de completat</span>
          </div>
          <div className="sm:hidden">
            <span className="badge badge-accent">10 EUR</span>
          </div>
        </div>
      </header>

      {/* Header */}
      <section className="pt-10 md:pt-16 pb-6 md:pb-10">
        <div className="container max-w-3xl text-center">
          <span className="badge mb-4">
            <span className="dot bg-[var(--accent)]" />
            Pasul 1 din 2 — completezi formularul
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Spune-ne câteva detalii despre atestatul tău.
          </h1>
          <p className="text-[var(--ink-muted)]">
            Totul durează <strong className="text-[var(--ink)]">2 minute</strong>. Câmpurile cu <span className="text-[var(--accent)] font-semibold">*</span> sunt obligatorii.
          </p>
        </div>
      </section>

      {/* Progress steps */}
      <motion.div
        className="container max-w-3xl mb-8"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="card p-5 md:p-6">
          <div className="relative flex items-start justify-between gap-2">
            {/* Background line */}
            <div className="absolute top-5 left-5 right-5 h-px bg-[var(--border)]" aria-hidden />
            {/* Active portion */}
            <motion.div
              className="absolute top-5 left-5 h-px bg-[var(--accent)]"
              style={{ boxShadow: '0 0 8px var(--accent)' }}
              initial={false}
              animate={{
                width: `calc(${(activeSection / (SECTIONS.length - 1)) * 100}% - ${(activeSection / (SECTIONS.length - 1)) * 40}px)`,
              }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              aria-hidden
            />
            {SECTIONS.map(({ n, label, id }, i) => {
              const isActive = i === activeSection
              const isDone = i < activeSection
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setActiveSection(i)
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className="flex flex-col items-center gap-2 relative z-10 group"
                >
                  <div className="relative">
                    <div className={`step-circle ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                      {isDone ? (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                      ) : n}
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="step-glow"
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{ boxShadow: '0 0 0 4px var(--accent-glow-sm), 0 4px 14px var(--accent-glow)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                      />
                    )}
                  </div>
                  <span className={`text-[11px] sm:text-xs font-medium transition-colors duration-200 ${isActive ? 'text-[var(--ink)]' : isDone ? 'text-[var(--ink-muted)]' : 'text-[var(--ink-soft)]'}`}>
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="container max-w-3xl pb-32 md:pb-16 space-y-4">

        {/* ── 01: Date elev ── */}
        <motion.div
          id="section-01"
          className="card p-6 md:p-8 space-y-5"
          onClick={() => setActiveSection(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={sectionVariants}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="step-circle active">01</div>
              <div>
                <h2 className="font-semibold text-base">Date personale</h2>
                <p className="text-xs text-[var(--ink-soft)]">Apar pe coperta atestatului</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Nume complet" field="student_name" placeholder="ex: Popescu Maria Ioana" form={form} errors={errors} onChange={set} />
            <Field label="Clasa" field="clasa" placeholder="ex: XII A" form={form} errors={errors} onChange={set} />
            <Field label="Profesor coordonator" field="profesor_coordonator" placeholder="ex: Prof. Ionescu Dan" form={form} errors={errors} onChange={set} />
            <Field label="Liceu" field="liceu" placeholder="ex: Colegiul Economic Virgil Madgearu" form={form} errors={errors} onChange={set} />
          </div>
          <Field label="Specializare" field="specializare" placeholder="ex: Tehnician în Activități Economice" form={form} errors={errors} onChange={set} />
        </motion.div>

        {/* ── 02: Tema ── */}
        <motion.div
          id="section-02"
          className="card p-6 md:p-8 space-y-5"
          onClick={() => setActiveSection(1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={sectionVariants}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="step-circle active">02</div>
            <div>
              <h2 className="font-semibold text-base">Tema atestatului</h2>
              <p className="text-xs text-[var(--ink-soft)]">15 teme predefinite sau propune una</p>
            </div>
          </div>

          <SelectField label="Tema" field="tema" options={TOPICS} placeholder="— Alege o temă —" form={form} errors={errors} onChange={set} />

          {form.tema === 'Altă temă' && (
            <div>
              <label className="field-label">
                Descriere temă <span className="req">*</span>
              </label>
              <textarea
                value={form.tema_custom}
                onChange={set('tema_custom')}
                rows={2}
                placeholder="ex: Gestiunea trezoreriei la SC Exemplu SRL"
                className="input resize-none"
              />
              {errors.tema_custom && <p className="text-xs text-[var(--danger)] mt-1.5">{errors.tema_custom}</p>}
            </div>
          )}

          {form.tema && form.tema !== 'Altă temă' && (
            <div className="bg-[var(--accent-soft)] border border-[var(--accent)]/15 rounded-xl p-3.5 flex items-start gap-3">
              <svg className="w-4 h-4 mt-0.5 text-[var(--accent)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              <div className="text-sm text-[var(--ink-2)]">
                Titlul final va fi: <strong>&ldquo;{form.tema} la {form.firma_nume || 'firma ta'}&rdquo;</strong>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── 03: Firma ── */}
        <motion.div
          id="section-03"
          className="card p-6 md:p-8 space-y-5"
          onClick={() => setActiveSection(2)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={sectionVariants}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="step-circle active">03</div>
            <div>
              <h2 className="font-semibold text-base">Firma studiată</h2>
              <p className="text-xs text-[var(--ink-soft)]">Orice firmă din România</p>
            </div>
          </div>

          <div className="bg-[var(--bg-warm)] border border-[var(--border-soft)] rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-[var(--border-soft)] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[var(--ink)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <div className="text-sm">
              <p className="font-medium text-[var(--ink)]">Datele firmei se caută automat</p>
              <p className="text-[var(--ink-muted)] text-[13px] mt-0.5">CIF, adresă, CAEN, angajați, dată înființare — AI-ul le găsește singur.</p>
            </div>
          </div>

          <Field label="Denumire firmă" field="firma_nume" placeholder="ex: SC Kaufland Romania SRL" form={form} errors={errors} onChange={set} />

          <div className="grid sm:grid-cols-2 gap-5">
            <SelectField label="Formă juridică" field="firma_forma_juridica" options={FORME_JURIDICE} required={false} placeholder="— Alege —" form={form} errors={errors} onChange={set} />
            <SelectField label="Domeniu de activitate" field="firma_domeniu" options={DOMENII} placeholder="— Alege domeniu —" form={form} errors={errors} onChange={set} />
          </div>
        </motion.div>

        {/* ── 04: Extra ── */}
        <motion.div
          id="section-04"
          className="card p-6 md:p-8 space-y-5"
          onClick={() => setActiveSection(3)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={sectionVariants}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="step-circle active">04</div>
            <div>
              <h2 className="font-semibold text-base">Opționale</h2>
              <p className="text-xs text-[var(--ink-soft)]">Doar dacă vrei personalizare</p>
            </div>
          </div>

          <div>
            <label className="field-label">
              Instrucțiuni extra <span className="text-[var(--ink-soft)] font-normal">(opțional)</span>
            </label>
            <textarea
              value={form.extra_info}
              onChange={set('extra_info')}
              rows={3}
              placeholder="ex: Concentrează-te pe activitatea din magazine. Firma are 136 de locații în România."
              className="input resize-none"
            />
            <p className="field-hint">Aici poți cere focus pe un anumit aspect, menționa cifre concrete, sau indica ce să evite AI-ul.</p>
          </div>

          <div>
            <label className="field-label">
              Emblemă școală <span className="text-[var(--ink-soft)] font-normal">(opțional)</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
                emblema ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-warm)]'
              }`}
              onClick={() => fileRef.current?.click()}
            >
              {emblema ? (
                <div className="flex items-center justify-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </div>
                  <span className="text-sm font-medium text-[var(--ink)]">{emblema.name}</span>
                  <button type="button" className="text-xs text-[var(--ink-soft)] hover:text-[var(--danger)] ml-2 underline" onClick={e => { e.stopPropagation(); setEmblema(null) }}>Elimină</button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[var(--bg-warm)] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--ink-soft)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
                  </div>
                  <p className="text-sm font-medium text-[var(--ink)]">Click pentru a încărca emblema</p>
                  <p className="text-xs text-[var(--ink-soft)]">PNG sau JPG · max 5MB · fundal alb recomandat</p>
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
        </motion.div>

        {/* ── Submit (desktop only — mobile uses sticky bar) ── */}
        <motion.div
          className="hidden md:block card p-8 text-center relative overflow-hidden bg-gradient-to-b from-[var(--bg-elev)] to-[var(--bg-warm)]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={sectionVariants}
        >
          <div className="flex items-center justify-center gap-6 mb-5 text-sm text-[var(--ink-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              10 EUR · o singură plată
            </span>
            <span className="w-px h-4 bg-[var(--border)]" />
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              Gata în 3 minute
            </span>
            <span className="w-px h-4 bg-[var(--border)]" />
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              Banii înapoi în 24h
            </span>
          </div>

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="btn-accent px-12 py-4 text-base font-semibold"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Se procesează...
              </>
            ) : (
              <>
                Continuă spre plată — 10 EUR
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </>
            )}
          </motion.button>

          <p className="text-xs text-[var(--ink-soft)] mt-4 inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Plată procesată securizat prin Stripe · Cardul tău nu e stocat
          </p>
        </motion.div>
      </form>

      {/* ── Sticky mobile CTA ── */}
      <div className="sticky-mobile-cta">
        <div>
          <div className="text-xs text-[var(--ink-soft)]">Total de plată</div>
          <div className="text-lg font-bold text-[var(--ink)]">10 EUR</div>
        </div>
        <button
          type="button"
          onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
          disabled={submitting}
          className="btn-accent text-sm py-2.5 px-5"
        >
          {submitting ? 'Se procesează...' : 'Continuă →'}
        </button>
      </div>
    </div>
  )
}
