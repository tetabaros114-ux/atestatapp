import Link from 'next/link'

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

const PROOF = [
  { initials: 'AM', name: 'Ana M.', school: 'Colegiul Economic Buzău', year: '2024', quote: 'Atestatul a fost aproape identic cu cele ale colegilor care au lucrat luni întregi. Profesoara nu a bănuit nimic.' },
  { initials: 'RD', name: 'Radu D.', school: 'Liceul Tehnologic Ploiești', year: '2024', quote: '55 de pagini perfect formatate. Fără să scriu măcar un rând. Nimeni nu a observat că e generat de AI.' },
  { initials: 'EP', name: 'Elena P.', school: 'Colegiul Economic Mangalia', year: '2024', quote: 'Am luat 10 la BAC la partea de specialitate. Atestatul ăsta m-a salvat.' },
]

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: '55–60 pagini complete',
    desc: 'Argument, 4 capitole, înregistrări contabile, anexe — tot ce trebuie pentru nota 10.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Generare în 3–5 minute',
    desc: 'AI-ul cercetează firma și scrie totul. Tu doar descarci.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Date firme reale',
    desc: 'AI-ul caută CIF, CAEN, angajați, adresă din surse publice oficiale.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Contabilitate corectă',
    desc: 'Minim 25 înregistrări contabile corecte conform OMFP 1802/2014.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Format Word (.docx)',
    desc: 'Descarci și editezi imediat în Microsoft Word, LibreOffice sau Google Docs.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Orice liceu, orice temă',
    desc: 'Compatibil cu toate liceele economice din România și toate temele de specializare.',
  },
]

const TRUST_BADGES = [
  {
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    label: 'Date protejate',
  },
  {
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
    label: 'Format Word (.docx)',
  },
  {
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
    label: 'Generare în 3–5 min',
  },
  {
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
    label: 'Contabilitate verificată',
  },
]

const FAQ = [
  {
    q: 'Cât durează generarea?',
    a: 'Aproximativ 3–5 minute. AI-ul caută datele firmei (~15 secunde) și scrie cele 55–60 de pagini (~3–4 minute).',
  },
  {
    q: 'Ce conține documentul?',
    a: 'Argument complet, Capitolul 1 (studiu de caz), Capitolul 2 (parte teoretică adaptată temei), Capitolul 3 (inregistrări contabile), Capitolul 4 (analiză economico-financiară), concluzii, bibliografie, plus 16+ anexe cu documente contabile reale.',
  },
  {
    q: 'Pot alege orice firmă?',
    a: 'Da. Orice firmă înregistrată în România. Introduci doar denumirea și domeniul — AI-ul găsește automat CIF, adresa, codul CAEN și restul datelor din surse publice.',
  },
  {
    q: 'Merge și pentru licee tehnice sau non-economice?',
    a: 'Momentan documentul este optimizat pentru licee cu specializări economice (Tehnician în Activități Economice, Comerț, Contabilitate etc.). Pentru alte specializări, introdu detalii în câmpul de instrucțiuni extra.',
  },
  {
    q: 'Pot edita documentul după descărcare?',
    a: 'Absolut. Fișierul este .docx — îl deschizi în Microsoft Word, LibreOffice sau Google Docs și editezi orice vrei.',
  },
  {
    q: 'Ce se întâmplă dacă generarea eșuează?',
    a: 'Primești banii înapoi pe loc sau poți reîncerca gratuit. Contactează-ne și rezolvăm în maxim 24 de ore.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* ── Nav ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/6 bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--green)', boxShadow: '0 0 16px rgba(0,255,135,0.35)' }}>
              <span className="text-xs font-black text-[#0a0a0a]">A</span>
            </div>
            <span className="text-lg font-bold tracking-tight">Atestat<span className="brand-green">App</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="#features" className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors">Caracteristici</Link>
            <Link href="#preturi" className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors">Prețuri</Link>
            <Link href="/genereaza" className="btn-green px-4 py-2 text-sm font-semibold">
              Începe acum
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-28 px-6">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,255,135,0.07) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-15" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 text-sm text-gray-400 mb-8">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
                Peste 300 de liceeni au folosit platforma
              </div>

              <h1 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight mb-6">
                Atestatul complet,
                <br />
                <span className="brand-green">generat de AI</span>
                <br />
                <span className="text-gray-500">în câteva minute.</span>
              </h1>

              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-md">
                În 2 minute completezi formularul. AI-ul scrie cele{' '}
                <span className="text-white font-semibold">55–60 de pagini</span> — contabilitate reală, analiză de firmă, anexe complete — și descarci documentul formatat.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link href="/genereaza" className="btn-green px-7 py-3.5 text-sm font-bold text-center">
                  Generează atestatul →
                </Link>
                <Link href="#cum-functioneaza" className="px-7 py-3.5 text-sm font-semibold text-center rounded-xl border transition-all duration-200 hover:border-white/20" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                  Cum funcționează
                </Link>
              </div>

              <div className="flex items-center gap-5 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--green)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  O singură plată, fără abonament
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--green)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Gata în 3–5 minute
                </div>
              </div>
            </div>

            {/* Right: document preview mockup */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Glow behind doc */}
                <div className="absolute inset-0 blur-3xl opacity-20 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(0,255,135,0.4) 0%, transparent 70%)' }} />

                {/* Word doc mockup */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#1e1e1e', boxShadow: '0 0 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)' }}>
                  {/* Title bar */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ background: '#2d2d2d', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 text-center text-xs text-gray-500">Atestat_Popescu_Maria.docx — Microsoft Word</div>
                  </div>

                  {/* Page content */}
                  <div className="p-8 space-y-3 text-xs" style={{ fontFamily: 'Times New Roman, serif' }}>
                    <p className="text-center font-bold text-sm">COLEGIUL ECONOMIC &quot;VIRGIL MADGEARU&quot;</p>
                    <p className="text-center text-xs">Bd. Expozițiilor nr. 2, București</p>
                    <div className="border-t border-b border-black py-2 my-3 text-center font-bold text-sm">
                      ATESTAT
                    </div>
                    <p className="text-center text-xs leading-relaxed">Specializarea: <strong>Tehnician în Activități Economice</strong></p>
                    <p className="text-xs leading-relaxed">Elev/Părinți: <strong>Popescu Maria Ioana</strong>, clasa a XII-a A</p>
                    <p className="text-xs leading-relaxed">Profesor coordonator: <strong>Prof. Ionescu Dan</strong></p>
                    <p className="text-xs leading-relaxed">Tema: <em>Disponibilitățile bănești la SC Kaufland Romania SRL</em></p>
                    <div className="border-t border-dashed border-gray-600 pt-2 mt-4 space-y-1.5">
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Cuprins</p>
                      {['Argument', 'Cap. I — Studiul de caz', 'Cap. II — Partea teoretică', 'Cap. III — Contabilitate primară', 'Cap. IV — Analiză financiară', 'Concluzii', 'Bibliografie', 'Anexe (16 documente)'].map((item) => (
                        <p key={item} className="text-[10px] text-gray-400 leading-tight">{item}</p>
                      ))}
                    </div>
                    <div className="mt-4 p-3 rounded text-[10px] leading-tight space-y-1" style={{ background: 'rgba(0,255,135,0.04)', border: '1px solid rgba(0,255,135,0.12)' }}>
                      <p className="font-bold text-[10px]" style={{ color: 'var(--green)' }}>✓ Document generat de AI</p>
                      <p className="text-gray-500">55–60 pagini · Times New Roman 12pt · OMFP 1802/2014</p>
                    </div>
                  </div>
                </div>

                {/* Floating stat badges */}
                <div className="absolute -left-6 top-8 bg-[#141414] border border-white/8 rounded-xl px-4 py-2.5 shadow-xl">
                  <div className="text-xs text-gray-400 mb-0.5">Puncte contabile</div>
                  <div className="text-lg font-black" style={{ color: 'var(--green)' }}>28</div>
                </div>
                <div className="absolute -right-4 bottom-12 bg-[#141414] border border-white/8 rounded-xl px-4 py-2.5 shadow-xl">
                  <div className="text-xs text-gray-400 mb-0.5">Anexe</div>
                  <div className="text-lg font-black" style={{ color: 'var(--green)' }}>16</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ──────────────────────────────────────────────── */}
      <section className="border-y border-white/5" style={{ background: '#0d0d0d' }}>
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex flex-wrap gap-6 justify-center items-center">
            {TRUST_BADGES.map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-gray-500">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
            <div className="hidden sm:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>🇷🇴</span>
              <span>Produs în România</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" style={{ color: 'var(--green)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <span>Plată securizată</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3">Ce primești</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Tot ce trebuie pentru
              <br />
              <span className="brand-green">nota maximă</span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">Fiecare atestat este complet: teorie adaptată temei, contabilitate reală, analiză financiară și anexe oficiale.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="dark-card p-6 hover:border-white/15 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,255,135,0.1)', color: 'var(--green)' }}>
                  {icon}
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section id="cum-functioneaza" className="py-28 px-6" style={{ background: '#0d0d0d' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3">Cum funcționează</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Trei pași simpli.
              <br />
              <span className="brand-green">Zero bătăi de cap.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Completezi formularul',
                desc: '2 minute. Numele tău, liceul, profesorul și firma pe care vrei să o abordezi. AI-ul face restul.',
                tip: 'Poți alege din 15 teme predefinite sau propune orice temă economică.',
              },
              {
                step: '02',
                title: 'AI-ul lucrează',
                desc: 'În 3–5 minute, AI-ul caută datele firmei, scrie toate cele 55–60 de pagini și construiește fișierul Word.',
                tip: 'Date reale: CIF, adresă, CAEN, angajați — toate din surse publice.',
              },
              {
                step: '03',
                title: 'Descarci documentul',
                desc: 'Primești un fișier .docx complet formatat, gata de predat. Editabil în Word sau Google Docs.',
                tip: 'Include minim 25 de înregistrări contabile și 16+ anexe.',
              },
            ].map(({ step, title, desc, tip }) => (
              <div key={step} className="dark-card p-8 relative">
                <div className="text-5xl font-black mb-5 leading-none" style={{ color: 'var(--green)', opacity: 0.15 }}>{step}</div>
                <div className="absolute top-7 right-7 text-3xl font-black opacity-10">{step}</div>
                <h3 className="font-bold text-lg mb-3">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{desc}</p>
                <p className="text-xs rounded-lg px-3 py-2 text-gray-500" style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '2px solid rgba(0,255,135,0.3)' }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3">Testimoniale</p>
            <h2 className="text-4xl font-black tracking-tight">
              Ce spun{' '}
              <span className="brand-green">elevii</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {PROOF.map(({ initials, name, school, year, quote }) => (
              <div key={name} className="dark-card p-6 flex flex-col gap-4">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#fbbf24' }}>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed italic">"{quote}"</p>
                <div className="flex items-center gap-3 mt-auto pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(0,255,135,0.12)', color: 'var(--green)' }}>{initials}</div>
                  <div>
                    <div className="text-sm font-semibold">{name}</div>
                    <div className="text-xs text-gray-500">{school} · {year}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Topics ──────────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ background: '#0d0d0d' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3">Teme suportate</p>
          <h2 className="text-4xl font-black tracking-tight mb-3">15 teme predefinite</h2>
          <p className="text-gray-400 text-sm mb-12">Plus orice temă economică personalizată.</p>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {TOPICS.map((topic) => (
              <span key={topic} className="text-sm px-4 py-2 rounded-full border transition-all duration-200 cursor-default"
                style={{ borderColor: 'rgba(0,255,135,0.2)', color: 'rgba(0,255,135,0.85)', background: 'rgba(0,255,135,0.04)' }}>
                {topic}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <section id="preturi" className="py-28 px-6">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3">Prețuri</p>
          <h2 className="text-4xl font-black tracking-tight mb-4">10 EUR. Fără surprize.</h2>
          <p className="text-gray-500 text-sm mb-12">Dacă documentul nu se generează corect, contactezi-ne și primesti banii înapoi în 24 de ore.</p>

          <div className="dark-card p-10 text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, var(--green), rgba(0,255,135,0.3))' }} />

            <div className="flex items-end gap-3 mb-1">
              <span className="text-6xl font-black tracking-tight">10</span>
              <span className="text-2xl font-bold text-gray-400 mb-2">EUR</span>
            </div>
            <p className="text-gray-500 text-sm mb-8">per atestat · o singură plată · fără abonament</p>

            <ul className="space-y-3.5 mb-8">
              {[
                'Document Word complet (55–60 pagini)',
                'Toate cele 4 capitole + Argument',
                'Minim 25 înregistrări contabile',
                '16+ anexe cu documente reale',
                'Date firmă căutate automat de AI',
                'Adaptat oricărui liceu economic',
                'Format Times New Roman 12pt, spațiere 1.5',
                'Descărcare imediată după generare',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--green)' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>

            <Link href="/genereaza" className="btn-green block w-full text-center py-4 font-bold text-sm">
              Vreau atestatul meu →
            </Link>
            <p className="text-center text-gray-600 text-xs mt-4">Plată securizată · Fără taxa ascunse</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ background: '#0d0d0d' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3">Întrebări frecvente</p>
            <h2 className="text-4xl font-black tracking-tight">Ai întrebări?</h2>
          </div>

          <div className="space-y-2">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group dark-card overflow-hidden rounded-xl">
                <summary className="px-6 py-5 cursor-pointer font-semibold text-sm text-gray-200 list-none flex items-center justify-between hover:text-white transition-colors">
                  {q}
                  <svg className="w-4 h-4 shrink-0 text-gray-500 group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-gray-400 text-sm leading-relaxed pt-4">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,255,135,0.08) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5">
            Gata să termini
            <br />
            <span className="brand-green">atestatul?</span>
          </h2>
          <p className="text-gray-400 mb-10">2 minute de completat formularul. 3–5 minute de așteptat. Un atestat de nota 10.</p>
          <Link href="/genereaza" className="btn-green inline-block px-12 py-4 font-bold text-sm">
            Vreau atestatul meu →
          </Link>
          <p className="text-gray-600 text-xs mt-5">10 EUR · fără abonament · banii înapoi în 24h dacă ceva nu funcționează</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6" style={{ background: '#0d0d0d' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--green)' }}>
              <span className="text-[10px] font-black text-[#0a0a0a]">A</span>
            </div>
            <span className="text-base font-bold">Atestat<span className="brand-green">App</span></span>
          </div>
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} AtestatApp · atestatapp.ro</p>
          <p className="text-gray-600 text-sm">Platforma românilor pentru atestate profesionale</p>
        </div>
      </footer>
    </main>
  )
}
