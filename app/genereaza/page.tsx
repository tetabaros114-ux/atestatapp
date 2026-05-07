'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { AtestateInput } from '@/types/atestat'

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
  firma_cif: '',
  firma_rc: '',
  firma_caen_cod: '',
  firma_caen_desc: '',
  firma_domeniu: '',
  firma_adresa: '',
  firma_telefon: '',
  firma_email: '',
  firma_iban: '',
  firma_banca: '',
  firma_an_infiintare: '',
  firma_angajati: '',
  firma_produse: '',
  firma_clienti: '',
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
      if (!form[key as keyof typeof form]?.trim()) errs[key] = `${label} este obligatoriu.`
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
    req('firma_cif', 'CIF-ul')
    req('firma_rc', 'Nr. Reg. Comerțului')
    req('firma_caen_cod', 'Codul CAEN')
    req('firma_caen_desc', 'Descrierea activității CAEN')
    if (!form.firma_domeniu) errs.firma_domeniu = 'Domeniul este obligatoriu.'
    req('firma_adresa', 'Adresa sediului')
    req('firma_an_infiintare', 'Anul înființării')
    req('firma_angajati', 'Numărul de angajați')
    req('firma_produse', 'Produsele / serviciile principale')
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

    const input: AtestateInput = {
      student_name: form.student_name,
      clasa: form.clasa,
      profesor_coordonator: form.profesor_coordonator,
      liceu: form.liceu,
      specializare: form.specializare,
      tema,
      firma: {
        nume: form.firma_nume,
        forma_juridica: form.firma_forma_juridica,
        cif: form.firma_cif,
        rc: form.firma_rc,
        caen_cod: form.firma_caen_cod,
        caen_desc: form.firma_caen_desc,
        domeniu: form.firma_domeniu,
        adresa: form.firma_adresa,
        telefon: form.firma_telefon,
        email: form.firma_email,
        iban: form.firma_iban,
        banca: form.firma_banca,
        an_infiintare: form.firma_an_infiintare,
        angajati: parseInt(form.firma_angajati) || 0,
        produse_servicii: form.firma_produse
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        clienti_principali: form.firma_clienti
          ? form.firma_clienti
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      },
      an: new Date().getFullYear().toString(),
      emblema_base64,
      extra_info: form.extra_info || undefined,
    }

    sessionStorage.setItem('atestateInput', JSON.stringify(input))
    router.push('/success')
  }

  // ─── Reusable input component ─────────────────────────────────────────────
  const inputCls = (field: string) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] transition-colors ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

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
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
        {!required && <span className="text-gray-400 font-normal"> (opțional)</span>}
      </label>
      <input
        type={type}
        value={form[field as keyof typeof INIT]}
        onChange={set(field)}
        placeholder={placeholder}
        className={inputCls(field)}
      />
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>
  )

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-[#1e3a5f] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <a href="/" className="text-xl font-bold">
          Atestat<span className="text-amber-400">App</span>
        </a>
        <span className="text-blue-200 text-sm hidden sm:block">Generează atestat</span>
      </nav>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Generează atestatul tău</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Completează câmpurile de mai jos. Câmpurile cu{' '}
            <span className="text-red-500">*</span> sunt obligatorii.
          </p>
        </div>

        {hasErrors && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">
            Există câmpuri incomplete. Verifică câmpurile marcate cu roșu.
          </div>
        )}

        {/* ── Date personale ── */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-[#1e3a5f] text-base border-b border-gray-100 pb-3">
            1. Date personale
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nume complet elev" field="student_name" placeholder="ex: Popescu Maria Ioana" />
            <Field label="Clasa" field="clasa" placeholder="ex: XII A" />
            <Field
              label="Profesor coordonator"
              field="profesor_coordonator"
              placeholder="ex: Ionescu Dan"
            />
            <Field
              label="Liceu"
              field="liceu"
              placeholder="ex: Colegiul Economic Virgil Madgearu"
            />
          </div>
          <Field
            label="Specializare"
            field="specializare"
            placeholder="ex: Tehnician în Activități Economice"
          />
        </section>

        {/* ── Tema ── */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-[#1e3a5f] text-base border-b border-gray-100 pb-3">
            2. Tema proiectului
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tema <span className="text-red-500">*</span>
            </label>
            <select
              value={form.tema}
              onChange={set('tema')}
              className={inputCls('tema')}
            >
              <option value="">— Alege tema —</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.tema && <p className="text-red-500 text-xs mt-1">{errors.tema}</p>}
          </div>
          {form.tema === 'Altă temă' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tema personalizată <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.tema_custom}
                onChange={set('tema_custom')}
                placeholder="ex: Gestiunea stocurilor la SC Exemplu SRL"
                className={inputCls('tema_custom')}
              />
              {errors.tema_custom && (
                <p className="text-red-500 text-xs mt-1">{errors.tema_custom}</p>
              )}
            </div>
          )}
        </section>

        {/* ── Date firmă ── */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-[#1e3a5f] text-base border-b border-gray-100 pb-3">
            3. Date firmă
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field
                label="Denumire firmă"
                field="firma_nume"
                placeholder="ex: SC KAUFLAND ROMANIA S.R.L."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forma juridică <span className="text-red-500">*</span>
              </label>
              <select
                value={form.firma_forma_juridica}
                onChange={set('firma_forma_juridica')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              >
                {FORME_JURIDICE.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domeniu activitate <span className="text-red-500">*</span>
              </label>
              <select
                value={form.firma_domeniu}
                onChange={set('firma_domeniu')}
                className={inputCls('firma_domeniu')}
              >
                <option value="">— Alege domeniu —</option>
                {DOMENII.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              {errors.firma_domeniu && (
                <p className="text-red-500 text-xs mt-1">{errors.firma_domeniu}</p>
              )}
            </div>

            <Field label="CIF" field="firma_cif" placeholder="ex: RO11740174" />
            <Field
              label="Nr. Reg. Comerțului"
              field="firma_rc"
              placeholder="ex: J40/14817/1999"
            />
            <Field label="Cod CAEN" field="firma_caen_cod" placeholder="ex: 4711" />
            <div className="md:col-span-2">
              <Field
                label="Descriere activitate CAEN"
                field="firma_caen_desc"
                placeholder="ex: Comerț cu amănuntul în magazine nespecializate"
              />
            </div>
            <div className="md:col-span-2">
              <Field
                label="Adresă sediu social"
                field="firma_adresa"
                placeholder="ex: Bd. Timișoara 26Z, Sector 6, București"
              />
            </div>
            <Field
              label="Telefon"
              field="firma_telefon"
              placeholder="ex: 021.300.10.10"
              required={false}
            />
            <Field
              label="Email firmă"
              field="firma_email"
              placeholder="ex: contact@firma.ro"
              required={false}
              type="email"
            />
            <Field
              label="IBAN"
              field="firma_iban"
              placeholder="ex: RO55RZBR0000060001234567"
              required={false}
            />
            <Field label="Bancă" field="firma_banca" placeholder="ex: Raiffeisen Bank" required={false} />
            <Field
              label="An înființare"
              field="firma_an_infiintare"
              placeholder="ex: 1999"
              type="number"
            />
            <Field
              label="Număr angajați"
              field="firma_angajati"
              placeholder="ex: 12000"
              type="number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produse / servicii principale <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal"> — câte unul pe linie</span>
            </label>
            <textarea
              value={form.firma_produse}
              onChange={set('firma_produse')}
              rows={4}
              placeholder={'Produse alimentare și băuturi\nProduse nealimentare\nServicii de brutărie proprie\nServicii de livrare la domiciliu'}
              className={inputCls('firma_produse')}
            />
            {errors.firma_produse && (
              <p className="text-red-500 text-xs mt-1">{errors.firma_produse}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clienți principali{' '}
              <span className="text-gray-400 font-normal">(opțional) — câte unul pe linie</span>
            </label>
            <textarea
              value={form.firma_clienti}
              onChange={set('firma_clienti')}
              rows={3}
              placeholder={'Populație generală\nFamilii\nRestaurante și HoReCa'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            />
          </div>
        </section>

        {/* ── Extra ── */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-[#1e3a5f] text-base border-b border-gray-100 pb-3">
            4. Informații suplimentare
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instrucțiuni extra{' '}
              <span className="text-gray-400 font-normal">(opțional)</span>
            </label>
            <textarea
              value={form.extra_info}
              onChange={set('extra_info')}
              rows={3}
              placeholder="ex: Firma are 136 magazine în toată România. Tema se concentrează pe angajații din magazine."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emblemă școală{' '}
              <span className="text-gray-400 font-normal">(opțional — PNG/JPG, fundal alb)</span>
            </label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#1e3a5f] hover:bg-blue-50/30 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {emblema ? (
                <div className="text-green-600 font-medium text-sm">✓ {emblema.name}</div>
              ) : (
                <>
                  <div className="text-gray-400 text-3xl mb-2">📷</div>
                  <div className="text-gray-500 text-sm">Click pentru a încărca emblema</div>
                  <div className="text-gray-400 text-xs mt-1">PNG sau JPG · fundal alb · max 5MB</div>
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-4">
          <div className="text-[#1e3a5f] font-bold text-lg">Totul este completat?</div>
          <div className="text-gray-600 text-sm">
            Vei fi redirecționat spre plată. Documentul se generează imediat după confirmare.
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto bg-[#1e3a5f] text-white font-bold px-10 py-4 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 text-base"
          >
            {submitting ? 'Se procesează...' : 'Continuă spre plată — 10 EUR →'}
          </button>
          <p className="text-gray-400 text-xs">Plată securizată prin Stripe · Fără abonament</p>
        </div>
      </form>
    </div>
  )
}
