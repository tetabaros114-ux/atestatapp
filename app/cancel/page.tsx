import Link from 'next/link'

export default function CancelPage() {
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
        <div className="dark-card p-10 max-w-md w-full text-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,200,0,0.03) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
            >
              <span className="text-yellow-400 text-3xl font-bold">!</span>
            </div>

            <h1 className="text-xl font-bold text-white mb-2">Plata a fost anulată</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Nicio sumă nu a fost reținută din contul tău.
              <br />Poți încerca din nou oricând.
            </p>

            <Link
              href="/genereaza"
              className="btn-green block w-full py-3.5 text-sm mb-3"
            >
              Încearcă din nou
            </Link>
            <Link
              href="/"
              className="block text-sm text-gray-600 hover:text-gray-400 transition-colors"
            >
              ← Înapoi la pagina principală
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
