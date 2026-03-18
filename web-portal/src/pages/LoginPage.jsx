import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/investment.service.js'
import { useAuthStore } from '../store/auth.store.js'

function HexLogo() {
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="#e8f5e9"/>
      <path d="M20 2 L36 11 L28 20 Z" fill="#4ade80"/>
      <path d="M36 11 L36 29 L28 20 Z" fill="#22c55e"/>
      <path d="M20 38 L36 29 L28 20 Z" fill="#16a34a"/>
      <path d="M4 29 L20 38 L12 20 Z" fill="#60a5fa"/>
      <path d="M4 11 L4 29 L12 20 Z" fill="#3b82f6"/>
      <path d="M20 2 L4 11 L12 20 Z" fill="#f97316"/>
    </svg>
  )
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authService.login(form)
      setAuth(data.user, data.token)
      if (data.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mini navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <HexLogo/>
          <span className="font-black text-lg text-gray-900">NeuroMarket</span>
        </Link>
        <Link to="/register" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          Crear cuenta →
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="https://api.dicebear.com/9.x/shapes/svg?seed=NeuroMarket"
              alt="NeuroMarket"
              className="w-20 h-20 mx-auto mb-3 rounded-2xl border border-gray-200 bg-white"
            />
            <h1 className="text-3xl font-black text-gray-900 mb-2">Bienvenido de vuelta</h1>
            <p className="text-gray-500 text-sm">Inicia sesion para ver tus analisis</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contrasena</label>
                <input
                  type="password" required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#22c55e' }}
              >
                {loading ? 'Entrando...' : 'Iniciar sesion →'}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-500 mt-5 text-sm">
            No tienes cuenta?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#22c55e' }}>Registrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
