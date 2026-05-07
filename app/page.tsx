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
]

const STEPS = [
  {
    n: '01',
    title: 'Completezi formularul',
    desc: 'Introduci datele tale, ale liceului și ale firmei alese. Durează ~2 minute.',
  },
  {
    n: '02',
    title: 'AI-ul cercetează firma',
    desc: 'Căutăm automat CIF, adresă, cod CAEN, angajați și toate datele necesare.',
  },
  {
    n: '03',
    title: 'Primești documentul',
    desc: '55–60 de pagini formatate profesional, gata de descărcat în ~60 de secunde.',
  },
]

const FEATURES = [
  '55–60 pagini formatate (Times New Roman, spațiere 1.5)',
  'Argument + 4 capitole + Concluzii + Bibliografie',
  'Minim 25 înregistrări contabile corecte (OMFP 1802/2014)',
  'Minim 16 anexe cu documente contabile reale',
  'Organigrama, indicatori financiari, analiză SWOT',
  'Adaptat automat la tema, firma și domeniu',
  'Format .docx — editabil în Word, LibreOffice, Google Docs',
  'Referințe legale corecte (Legea 82/1991, Codul Fiscal etc.)',
]

const FAQ = [
  {
    q: 'Cât durează generarea atestatului?',
    a: 'Aproximativ 60–90 de secunde. AI-ul caută datele firmei (~15s) și scrie toate cele 55–60 de pagini (~60s), adaptat complet la datele tale.',
  },
  {
    q: 'Documentul este compatibil cu Microsoft Word?',
    a: 'Da. Primești un fișier .docx care se deschide perfect în Microsoft Word, LibreOffice și Google Docs. Poți edita orice după descărcare.',
  },
  {
    q: 'Pot alege orice firmă?',
    a: 'Da — orice firmă înregistrată în România. AI-ul caută automat datele ei din surse publice (ANAF, termene.ro, site-ul oficial etc.).',
  },
  {
    q: 'Trebuie să am cont?',
    a: 'Nu. Completezi formularul, plătești și descarci — fără înregistrare, fără parolă, fără abonament.',
  },
  {
    q: 'Funcționează pentru orice liceu?',
    a: 'Da, pentru orice liceu economic din România. Introduci numele liceului și specializarea ta în formular.',
  },
  {
    q: 'Ce se întâmplă dacă generarea eșuează?',
    a: 'Poți reîncerca din pagina de generare fără cost suplimentar. Refundurile manuale se procesează în 24 de ore.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            Atestat<span className="brand-green">App</span>
          </span>
          <Link href="/genereaza" className="btn-green px-5 py-2 text-sm">
            Generează acum
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-28 px-6 overflow-hidden">
        {/* Green glow blob */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(0,255,135,0.13) 0%, transparent 70%)',
          }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 text-sm text-gray-400 mb-8">
            <span style={{ color: 'var(--green)' }}>✦</span>
            Compatibil cu orice liceu economic din România
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
            Atestatul tău
            <br />
            <span className="brand-green">profesional</span>
            {', '}gata în
            <br />
            60 de secunde.
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Completezi un formular simplu. AI-ul cercetează firma și scrie{' '}
            <strong className="text-white">55–60 de pagini</strong> formatate profesional. Tu descarci.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/genereaza" className="btn-green px-8 py-4 text-base">
              Generează atestatul meu →
            </Link>
            <span className="text-gray-500 text-sm">10 EUR · o singură plată · fără abonament</span>
          </div>

          {/* Social proof pill */}
          <div className="mt-12 inline-flex items-center gap-3 border border-white/8 bg-white/3 rounded-full px-5 py-2.5 text-sm text-gray-400">
            <span className="flex -space-x-1">
              {['🧑‍🎓', '👩‍🎓', '🧑‍💼'].map((e, i) => (
                <span key={i} className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs border border-[#0a0a0a]">
                  {e}
                </span>
              ))}
            </span>
            Sute de studenți au folosit AtestatApp
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0d0d0d]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3">
            Procesul
          </p>
          <h2 className="text-3xl font-bold text-center mb-14">
            Trei pași,{' '}
            <span className="brand-green">fără bătăi de cap</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="dark-card p-7 green-hover transition-all duration-200">
                <div
                  className="text-4xl font-bold mb-5 leading-none"
                  style={{ color: 'var(--green)', opacity: 0.7 }}
                >
                  {n}
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">
            Ce primești
          </p>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Un document complet,{' '}
            <span style={{ color: '#00cc6a' }}>gata de predat</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {FEATURES.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all duration-200"
              >
                <span className="shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Topics ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3">
            Teme suportate
          </p>
          <h2 className="text-3xl font-bold text-center mb-3">
            15 teme predefinite
          </h2>
          <p className="text-center text-gray-400 text-sm mb-10">
            Plus orice altă temă economică la alegere.
          </p>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {TOPICS.map((topic) => (
              <span
                key={topic}
                className="border text-sm px-4 py-2 rounded-full font-medium transition-all duration-200"
                style={{
                  borderColor: 'rgba(0,255,135,0.25)',
                  color: 'rgba(0,255,135,0.85)',
                  background: 'rgba(0,255,135,0.04)',
                }}
              >
                {topic}
              </span>
            ))}
            <span
              className="border text-sm px-4 py-2 rounded-full font-medium"
              style={{
                borderColor: 'rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              + Altă temă (text liber)
            </span>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-sm mx-auto">
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">
            Prețuri
          </p>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Simplu și transparent
          </h2>

          <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl ring-1 ring-white/10 relative overflow-hidden">
            {/* Green top bar */}
            <div
              className="absolute top-0 inset-x-0 h-1 rounded-t-2xl"
              style={{ background: 'var(--green)' }}
            />
            <div className="text-4xl font-bold text-white mb-1">
              10 <span className="text-2xl font-semibold text-gray-400">EUR</span>
            </div>
            <div className="text-gray-400 text-sm mb-7">per atestat · o singură plată</div>
            <ul className="space-y-3 mb-8">
              {[
                'Document Word complet (55–60 pag.)',
                'Toate capitolele și anexele',
                'Date firmă căutate automat de AI',
                'Descărcare imediată',
                'Fără abonament sau taxe ascunse',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-300">
                  <span style={{ color: 'var(--green)' }} className="text-base shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/genereaza" className="btn-green block w-full text-center py-3.5 text-sm">
              Generează acum →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#f8f8f8]">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">
            Întrebări frecvente
          </p>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">FAQ</h2>
          <div className="space-y-2">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group bg-white border border-gray-100 rounded-xl overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer font-medium text-gray-900 list-none flex items-center justify-between hover:bg-gray-50 transition-colors">
                  {q}
                  <span className="text-gray-400 ml-4 shrink-0 group-open:rotate-180 transition-transform duration-200 text-lg leading-none">
                    ↓
                  </span>
                </summary>
                <p className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-50 pt-4">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0a0a0a] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(0,255,135,0.09) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Gata să generezi{' '}
            <span className="brand-green">atestatul tău?</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Completezi formularul în 2 minute. AI-ul face restul.
          </p>
          <Link href="/genereaza" className="btn-green inline-block px-10 py-4 text-base">
            Generează acum — 10 EUR →
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-[#0a0a0a] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-lg font-bold">
            Atestat<span className="brand-green">App</span>
          </span>
          <span className="text-gray-600 text-sm">
            © {new Date().getFullYear()} AtestatApp · atestatapp.ro
          </span>
          <span className="text-gray-600 text-sm">
            Platforma românilor pentru atestate profesionale
          </span>
        </div>
      </footer>
    </main>
  )
}
