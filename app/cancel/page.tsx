import Link from 'next/link'

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-[#1e3a5f] text-white px-6 py-4 shadow-md">
        <a href="/" className="text-xl font-bold">
          Atestat<span className="text-amber-400">App</span>
        </a>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-yellow-600 text-3xl">!</span>
          </div>
          <h1 className="text-xl font-bold text-[#1e3a5f] mb-2">Plata a fost anulată</h1>
          <p className="text-gray-500 text-sm mb-8">
            Nicio sumă nu a fost reținută din contul tău. Poți încerca din nou oricând.
          </p>
          <Link
            href="/genereaza"
            className="block w-full bg-[#1e3a5f] text-white font-semibold py-3 rounded-xl hover:bg-blue-900 transition-colors mb-3"
          >
            Încearcă din nou
          </Link>
          <Link href="/" className="block text-sm text-gray-400 hover:text-gray-600">
            ← Înapoi la pagina principală
          </Link>
        </div>
      </div>
    </div>
  )
}
