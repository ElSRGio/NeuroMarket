import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/investment.service.js'
import { useAuthStore } from '../store/auth.store.js'

function HexLogo() {
  return (
    <img
      src="/logo.png"
      alt="XAIZA"
      style={{ width: 40, height: 40 }}
    />
  )
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
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
          <span className="font-black text-lg text-gray-900">XAIZA</span>
        </Link>
        <Link to="/register" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          Crear cuenta →
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="/logo.png"
              alt="XAIZA"
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
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-12 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600 hover:text-gray-900 px-2 py-1"
                  >
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
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
