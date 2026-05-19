import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="XAZIA" className="w-9 h-9" />
          <span className="font-black text-lg">XAZIA</span>
        </Link>
        <Link
          to="/login"
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50"
        >
          Iniciar sesion
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <section className="max-w-xl text-center">
          <p className="text-sm font-black text-green-700 tracking-wide">404</p>
          <h1 className="text-4xl md:text-5xl font-black mt-3">Esta vista no existe</h1>
          <p className="text-gray-600 mt-4">
            La ruta que intentaste abrir no forma parte del flujo publico o privado de XAZIA.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/" className="px-5 py-3 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-gray-800">
              Ir al inicio
            </Link>
            <Link to="/dashboard" className="px-5 py-3 rounded-lg border border-gray-300 text-sm font-bold hover:bg-gray-50">
              Ir al dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
