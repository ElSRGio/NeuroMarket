import { useEffect, useMemo, useRef, useState } from 'react'
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
    <img
      src="/logo.png"
      alt="XAIZA"
      style={{ width: 40, height: 40 }}
    />
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
    confirm_password: '',
  })
  const [selectedNiches, setSelectedNiches] = useState([])
  const [profileImage, setProfileImage] = useState(null)
  const fileInputRef = useRef(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const registerAvatarSrc = useMemo(() => {
    if (profileImage) return URL.createObjectURL(profileImage)
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(`${form.name} ${form.last_name}`.trim() || form.email || 'User')}`
  }, [profileImage, form.name, form.last_name, form.email])

  useEffect(() => {
    return () => {
      if (registerAvatarSrc.startsWith('blob:')) URL.revokeObjectURL(registerAvatarSrc)
    }
  }, [registerAvatarSrc])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm_password) {
      setError('La confirmación de contraseña no coincide')
      return
    }

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
          <span className="font-black text-lg text-gray-900">XAIZA</span>
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
              <div className="bg-gray-900 text-white rounded-2xl p-5 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at top, #374151 0%, transparent 60%)' }} />
                <div className="relative">
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <img
                      src={registerAvatarSrc}
                      alt="Preview perfil"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white/70"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(`${form.name} ${form.last_name}`.trim() || form.email || 'User')}`
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full border border-white/50 bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700"
                      title="Cambiar foto"
                    >
                      📷
                    </button>
                  </div>
                  <p className="text-lg font-black">Tu foto de perfil</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 border border-white/40 rounded-full px-4 py-2 text-sm font-semibold hover:bg-white/10"
                  >
                    Elegir imagen
                  </button>
                  {profileImage && (
                    <p className="text-xs text-gray-300 mt-2">Archivo: {profileImage.name}</p>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={e => setProfileImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required minLength={6} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-12 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="Minimo 6 caracteres"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'} required minLength={6} value={form.confirm_password}
                    onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-12 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="Repite tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600 hover:text-gray-900 px-2 py-1"
                  >
                    {showConfirmPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
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
