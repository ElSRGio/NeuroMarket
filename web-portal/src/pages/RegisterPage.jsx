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

const REGISTER_STEPS = [
  { title: 'Perfil', description: 'Quien usara XAZIA' },
  { title: 'Mercado', description: 'Intereses de negocio' },
  { title: 'Acceso', description: 'Credenciales seguras' },
  { title: 'Confirmar', description: 'Revisa y crea tu cuenta' },
]

function HexLogo() {
  return (
    <img
      src="/logo.png"
      alt="XAZIA"
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
    average_investment: '',
    password: '',
    confirm_password: '',
  })
  const [step, setStep] = useState(0)
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

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validateStep(targetStep = step) {
    if (targetStep === 0 && (!form.name.trim() || !form.last_name.trim())) {
      setError('Completa nombre y apellidos para continuar.')
      return false
    }

    if (targetStep === 1 && selectedNiches.length === 0) {
      setError('Selecciona al menos un nicho para personalizar tu dashboard.')
      return false
    }

    if (targetStep === 2) {
      if (!form.email.trim() || !form.password || !form.confirm_password) {
        setError('Completa email, contraseña y confirmacion.')
        return false
      }
      if (form.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.')
        return false
      }
      if (form.password !== form.confirm_password) {
        setError('La confirmación de contraseña no coincide.')
        return false
      }
    }

    setError('')
    return true
  }

  function goNext() {
    if (!validateStep(step)) return
    setStep((current) => Math.min(current + 1, REGISTER_STEPS.length - 1))
  }

  function goBack() {
    setError('')
    setStep((current) => Math.max(current - 1, 0))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    for (let index = 0; index < REGISTER_STEPS.length - 1; index += 1) {
      if (!validateStep(index)) {
        setStep(index)
        return
      }
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name.trim())
      formData.append('last_name', form.last_name.trim())
      formData.append('email', form.email.trim())
      formData.append('password', form.password)
      if (form.age) formData.append('age', form.age)
      if (selectedNiches.length > 0) formData.append('preferred_niches', selectedNiches.join(', '))
      if (form.average_investment) formData.append('average_investment', form.average_investment)
      if (profileImage) formData.append('profile_image', profileImage)

      const { data } = await authService.register(formData)
      setAuth(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse. Verifica tus datos.')
    } finally {
      setLoading(false)
    }
  }

  const activeStep = REGISTER_STEPS[step]
  const progress = ((step + 1) / REGISTER_STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <HexLogo />
          <span className="font-black text-lg text-gray-900">XAZIA</span>
        </Link>
        <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
          Ya tengo cuenta
        </Link>
      </nav>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          <aside className="bg-gray-950 text-white rounded-3xl overflow-hidden shadow-xl">
            <div className="p-8 border-b border-white/10">
              <p className="text-sm font-black text-green-400">Registro guiado</p>
              <h1 className="text-4xl font-black mt-3 leading-tight">Crea tu cuenta sin saturarte de campos</h1>
              <p className="text-gray-300 mt-4 text-sm leading-6">
                XAZIA separa tu perfil, mercado y acceso para preparar un dashboard de social listening con datos utiles desde el inicio.
              </p>
            </div>

            <div className="p-6 space-y-3">
              {REGISTER_STEPS.map((item, index) => (
                <div
                  key={item.title}
                  className={`rounded-2xl border p-4 transition-colors ${
                    index === step
                      ? 'border-green-400 bg-green-400/10'
                      : index < step
                        ? 'border-white/20 bg-white/10'
                        : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                      index <= step ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-black">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black text-green-700 uppercase tracking-wide">Paso {step + 1} de {REGISTER_STEPS.length}</p>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-1">{activeStep.title}</h2>
                </div>
                <div className="w-28 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              {step === 0 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-[180px_1fr] gap-6 items-center">
                    <div className="bg-gray-900 text-white rounded-2xl p-5 text-center">
                      <img
                        src={registerAvatarSrc}
                        alt="Preview perfil"
                        className="w-28 h-28 rounded-full object-cover border-4 border-white/70 mx-auto"
                        onError={(e) => {
                          e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(`${form.name} ${form.last_name}`.trim() || form.email || 'User')}`
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 w-full border border-white/40 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10"
                      >
                        Cambiar foto
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(event) => setProfileImage(event.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">Datos principales</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Estos datos identifican al usuario dentro del dashboard y ayudan a personalizar la experiencia.
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="block text-sm font-bold text-gray-700 mb-1.5">Nombre (s)</span>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(event) => updateField('name', event.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-green-500"
                        placeholder="Tus nombres"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-sm font-bold text-gray-700 mb-1.5">Apellidos</span>
                      <input
                        type="text"
                        required
                        value={form.last_name}
                        onChange={(event) => updateField('last_name', event.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-green-500"
                        placeholder="Tus apellidos"
                      />
                    </label>
                  </div>

                  <label className="block max-w-xs">
                    <span className="block text-sm font-bold text-gray-700 mb-1.5">Edad</span>
                    <input
                      type="number"
                      min="16"
                      max="100"
                      value={form.age}
                      onChange={(event) => updateField('age', event.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-green-500"
                      placeholder="24"
                    />
                  </label>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Mercados que quieres observar</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Selecciona los sectores donde quieres detectar demanda, reputacion y oportunidades locales.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {NICHE_OPTIONS.map((niche) => {
                      const active = selectedNiches.includes(niche)
                      return (
                        <button
                          key={niche}
                          type="button"
                          onClick={() => setSelectedNiches((prev) => active ? prev.filter((item) => item !== niche) : [...prev, niche])}
                          className={`text-left px-4 py-4 rounded-2xl text-sm font-bold border transition-colors ${
                            active
                              ? 'bg-green-600 text-white border-green-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-green-500 hover:text-green-700'
                          }`}
                        >
                          {niche}
                        </button>
                      )
                    })}
                  </div>

                  <label className="block max-w-sm">
                    <span className="block text-sm font-bold text-gray-700 mb-1.5">Inversion promedio estimada</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={form.average_investment}
                      onChange={(event) => updateField('average_investment', event.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-green-500"
                      placeholder="50000"
                    />
                  </label>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Crea tus credenciales</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Usa un correo real y una contraseña que no reutilices en otras plataformas.
                    </p>
                  </div>

                  <label className="block">
                    <span className="block text-sm font-bold text-gray-700 mb-1.5">Email</span>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(event) => updateField('email', event.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-green-500"
                      placeholder="tu@email.com"
                    />
                  </label>

                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="block text-sm font-bold text-gray-700 mb-1.5">Contraseña</span>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={form.password}
                          onChange={(event) => updateField('password', event.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-16 text-gray-900 text-sm focus:outline-none focus:border-green-500"
                          placeholder="Minimo 6 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 hover:text-gray-900"
                        >
                          {showPassword ? 'Ocultar' : 'Ver'}
                        </button>
                      </div>
                    </label>
                    <label className="block">
                      <span className="block text-sm font-bold text-gray-700 mb-1.5">Confirmar contraseña</span>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={form.confirm_password}
                          onChange={(event) => updateField('confirm_password', event.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-16 text-gray-900 text-sm focus:outline-none focus:border-green-500"
                          placeholder="Repite tu contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((value) => !value)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 hover:text-gray-900"
                        >
                          {showConfirmPassword ? 'Ocultar' : 'Ver'}
                        </button>
                      </div>
                    </label>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
                    Recomendacion de seguridad: combina letras, numeros y simbolos. El sistema no muestra tu contraseña despues de guardarla.
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Revisa antes de crear tu cuenta</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Estos datos se usaran para preparar tu primer dashboard privado.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-gray-200 p-4">
                      <p className="text-xs font-black text-gray-500 uppercase">Usuario</p>
                      <p className="font-black text-gray-900 mt-2">{form.name || 'Sin nombre'} {form.last_name}</p>
                      <p className="text-sm text-gray-500 mt-1">{form.email || 'Email pendiente'}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 p-4">
                      <p className="text-xs font-black text-gray-500 uppercase">Mercado</p>
                      <p className="font-black text-gray-900 mt-2">{selectedNiches.length} nichos seleccionados</p>
                      <p className="text-sm text-gray-500 mt-1">{selectedNiches.join(', ')}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 p-4">
                      <p className="text-xs font-black text-gray-500 uppercase">Inversion</p>
                      <p className="font-black text-gray-900 mt-2">
                        {form.average_investment ? `$${Number(form.average_investment).toLocaleString('es-MX')}` : 'No definida'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 p-4">
                      <p className="text-xs font-black text-gray-500 uppercase">Privacidad</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Tu sesion se abre con token privado y las rutas de analisis quedan protegidas.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0 || loading}
                  className="px-5 py-3 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Atras
                </button>

                {step < REGISTER_STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800"
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-60"
                  >
                    {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
