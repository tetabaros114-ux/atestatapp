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

const FAQ = [
  {
    q: 'Cât durează generarea atestatului?',
    a: 'Aproximativ 45–60 de secunde. Documentul este generat în timp real de inteligența artificială, care scrie toate cele 55–60 de pagini cu conținut specific firmei și temei tale.',
  },
  {
    q: 'Documentul este compatibil cu Microsoft Word?',
    a: 'Da. Primești un fișier .docx care se deschide perfect în Microsoft Word, LibreOffice și Google Docs. Poți edita orice element după descărcare.',
  },
  {
    q: 'Pot alege orice firmă?',
    a: 'Da — orice firmă din România, din orice domeniu economic. Completezi datele firmei în formular și documentul se adaptează automat.',
  },
  {
    q: 'Trebuie să am cont pentru a folosi platforma?',
    a: 'Nu. Completezi formularul, plătești și descarci documentul — fără înregistrare, fără parolă, fără abonament.',
  },
  {
    q: 'Funcționează pentru orice liceu economic?',
    a: 'Da. Platforma funcționează pentru orice liceu economic din România. Introduci numele liceului și specializarea ta în formular.',
  },
  {
    q: 'Ce se întâmplă dacă generarea eșuează?',
    a: 'Dacă apare o eroare tehnică, poți reîncerca direct din pagina de generare fără a mai plăti. Refuzul plății se face manual prin Stripe în cel mult 24 de ore.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-[#1e3a5f] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <span className="text-xl font-bold tracking-tight">
          Atestat<span className="text-amber-400">App</span>
        </span>
        <Link
          href="/genereaza"
          className="bg-amber-400 text-[#1e3a5f] font-semibold px-5 py-2 rounded-lg text-sm hover:bg-amber-300 transition-colors"
        >
          Generează acum
        </Link>
      </nav>

      {/* Hero */}
      <section className="bg-[#1e3a5f] text-white px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-amber-400/20 text-amber-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            Compatibil cu orice liceu economic din România
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Atestatul tău profesional,
            <br />
            <span className="text-amber-400">gata în 60 de secunde.</span>
          </h1>
          <p className="text-lg text-blue-200 mb-10 max-w-xl mx-auto leading-relaxed">
            Completezi un formular simplu. Plătești 10 EUR. Primești un document Word de{' '}
            <strong className="text-white">55–60 de pagini</strong>, complet formatat, gata de predat.
          </p>
          <Link
            href="/genereaza"
            className="inline-block bg-amber-400 text-[#1e3a5f] font-bold px-10 py-4 rounded-xl text-lg hover:bg-amber-300 transition-colors shadow-xl"
          >
            Generează atestatul meu →
          </Link>
          <p className="mt-5 text-blue-300 text-sm">10 EUR · o singură plată · fără abonament</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#1e3a5f] mb-14">Cum funcționează</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: '1',
                title: 'Completezi formularul',
                desc: 'Introduci datele tale, ale liceului, profesorului coordonator și ale firmei alese. Durează aproximativ 2 minute.',
              },
              {
                step: '2',
                title: 'Plătești 10 EUR',
                desc: 'Plată sigură prin card bancar, procesată de Stripe. Nu stocăm niciun date de card — totul trece prin Stripe.',
              },
              {
                step: '3',
                title: 'Descarci documentul',
                desc: 'În ~60 de secunde documentul Word de 55–60 pagini este generat de AI și descărcat automat.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#1e3a5f] text-white text-xl font-bold flex items-center justify-center mx-auto mb-5">
                  {step}
                </div>
                <h3 className="font-bold text-lg text-[#1e3a5f] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#1e3a5f] mb-4">Ce primești</h2>
          <p className="text-center text-gray-500 mb-12 text-sm">
            Un document complet, formatat profesional, cu toate capitolele obligatorii.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              '55–60 pagini formatate profesional (Times New Roman, spațiere 1.5)',
              'Argument + Capitolele 1–4 + Concluzii + Bibliografie',
              'Minim 25 înregistrări contabile corecte (OMFP 1802/2014)',
              'Minim 16 anexe cu documente contabile reale',
              'Organigrama, indicatori financiari pe 3 ani, analiză SWOT',
              'Adaptat automat la tema, firma și domeniul ales',
              'Format .docx — editabil în Word, LibreOffice, Google Docs',
              'Referințe legale corecte (Legea 82/1991, Codul Fiscal etc.)',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-green-500 font-bold text-lg mt-0.5 shrink-0">✓</span>
                <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#1e3a5f] mb-4">Teme disponibile</h2>
          <p className="text-center text-gray-500 mb-10 text-sm">
            15 teme predefinite + orice altă temă din aria economică.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {TOPICS.map((topic) => (
              <span
                key={topic}
                className="bg-blue-50 text-[#1e3a5f] border border-blue-100 px-4 py-2 rounded-full text-sm font-medium"
              >
                {topic}
              </span>
            ))}
            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-full text-sm font-medium">
              + Altă temă (text liber)
            </span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-[#1e3a5f]">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-10">Prețuri simple</h2>
          <div className="bg-white text-[#1e3a5f] rounded-2xl p-8 shadow-2xl">
            <div className="text-5xl font-bold mb-1">
              10 <span className="text-3xl">EUR</span>
            </div>
            <div className="text-gray-400 text-sm mb-7">per atestat · o singură plată</div>
            <ul className="text-left space-y-3 mb-8">
              {[
                'Document Word complet (55–60 pag.)',
                'Toate capitolele și anexele',
                'Adaptat la orice firmă și temă',
                'Descărcare imediată după plată',
                'Fără abonament sau taxe ascunse',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-500 font-bold shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/genereaza"
              className="block w-full bg-amber-400 text-[#1e3a5f] font-bold py-3.5 rounded-xl hover:bg-amber-300 transition-colors text-center"
            >
              Generează acum →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#1e3a5f] mb-12">Întrebări frecvente</h2>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="border border-gray-200 rounded-xl group overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer font-medium text-[#1e3a5f] list-none flex items-center justify-between hover:bg-gray-50 transition-colors">
                  {q}
                  <span className="text-gray-400 ml-4 shrink-0 group-open:rotate-180 transition-transform duration-200">
                    ↓
                  </span>
                </summary>
                <p className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e3a5f] text-blue-300 text-sm py-10 px-6 text-center">
        <div className="mb-2">
          <span className="text-white font-bold">
            Atestat<span className="text-amber-400">App</span>
          </span>
          {' · '}Platforma românilor pentru atestate profesionale
        </div>
        <div>© {new Date().getFullYear()} AtestatApp · atestatapp.ro</div>
      </footer>
    </main>
  )
}
