import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/investment.service.js'
import { useAuthStore } from '../store/auth.store.js'

const NICHE_OPTIONS = [
  'Restaurantes',
  'Retail',
  'Salud',
  'Educación',
  'Tecnología',
  'Servicios',
  'Belleza',
  'Fitness',
  'Turismo',
  'Entretenimiento',
]

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

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    last_name: '',
    age: '',
    email: '',
    preferred_niches: '',
    average_investment: '',
    password: '',
  })
  const [selectedNiches, setSelectedNiches] = useState([])
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("last_name", form.last_name)
      formData.append("email", form.email)
      formData.append("password", form.password)
      if (form.age) formData.append("age", form.age)
      if (selectedNiches.length > 0) formData.append("preferred_niches", selectedNiches.join(', '))
      if (form.average_investment) formData.append("average_investment", form.average_investment)
      if (profileImage) formData.append("profile_image", profileImage)

      const { data } = await authService.register(formData)
      setAuth(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse. Verifica tus datos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <HexLogo/>
          <span className="font-black text-lg text-gray-900">NeuroMarket</span>
        </Link>
        <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          Ya tengo cuenta
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Crea tu cuenta gratis</h1>
            <p className="text-gray-500 text-sm">Completa tu perfil para recomendaciones mas precisas</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre (s)</label>
                  <input
                    type="text" required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="Tus nombres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellidos</label>
                  <input
                    type="text" required value={form.last_name}
                    onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="Tus apellidos"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Edad</label>
                  <input
                    type="number" min="16" max="100" value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Inversion promedio ($)</label>
                  <input
                    type="number" min="0" step="100" value={form.average_investment}
                    onChange={e => setForm(f => ({ ...f, average_investment: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="50000"
                  />
                </div>
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nichos de preferencia</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {NICHE_OPTIONS.map((niche) => {
                    const active = selectedNiches.includes(niche)
                    return (
                      <button
                        key={niche}
                        type="button"
                        onClick={() => setSelectedNiches((prev) => active ? prev.filter((n) => n !== niche) : [...prev, niche])}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          active
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-700'
                        }`}
                      >
                        {niche}
                      </button>
                    )
                  })}
                </div>
                <input
                  type="text"
                  value={selectedNiches.join(', ')}
                  readOnly
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 text-sm"
                  placeholder="Selecciona uno o más nichos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagen de perfil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setProfileImage(e.target.files[0])}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contrasena</label>
                <input
                  type="password" required minLength={6} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Minimo 6 caracteres"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#22c55e' }}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta gratis →'}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-500 mt-5 text-sm">
            Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#22c55e' }}>Iniciar sesion</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
