import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNav from '../components/AppNav.jsx'
import { authService } from '../services/investment.service.js'
import { useAuthStore } from '../store/auth.store.js'
import api from '../services/api.js'

const INPUT = 'w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, token, setAuth } = useAuthStore()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const [form, setForm] = useState({
    name: '',
    last_name: '',
    age: '',
    email: '',
    preferred_niches: '',
    average_investment: '',
    profile_image_url: '',
  })

  const resolvedImageSrc = useMemo(() => {
    if (profileImage) return URL.createObjectURL(profileImage)
    if (form.profile_image_url) {
      if (form.profile_image_url.startsWith('http')) return form.profile_image_url
      return `${api.defaults.baseURL || ''}${form.profile_image_url}`
    }
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(form.name || form.email || 'User')}`
  }, [profileImage, form.profile_image_url, form.name, form.email])

  useEffect(() => {
    return () => {
      if (profileImage) URL.revokeObjectURL(resolvedImageSrc)
    }
  }, [profileImage, resolvedImageSrc])

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    authService.me()
      .then(({ data }) => {
        setForm({
          name: data.name || '',
          last_name: data.last_name || '',
          age: data.age ?? '',
          email: data.email || '',
          preferred_niches: data.preferred_niches || '',
          average_investment: data.average_investment ?? '',
          profile_image_url: data.profile_image_url || '',
        })
      })
      .catch((err) => setError(err.response?.data?.error || 'No se pudo cargar tu perfil'))
      .finally(() => setLoading(false))
  }, [token, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setOk('')

    try {
      const data = new FormData()
      data.append('name', form.name)
      data.append('last_name', form.last_name)
      if (form.age !== '' && form.age !== null) data.append('age', form.age)
      if (form.preferred_niches) data.append('preferred_niches', form.preferred_niches)
      if (form.average_investment !== '' && form.average_investment !== null) data.append('average_investment', form.average_investment)
      if (profileImage) data.append('profile_image', profileImage)
      if (!profileImage) data.append('profile_image_url', form.profile_image_url || '')

      const { data: updated } = await authService.updateMe(data)
      setAuth(updated, token)
      setOk('Perfil actualizado correctamente')
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo actualizar tu perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav showNewAnalysis={false} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Mi perfil</h1>
          <p className="text-sm text-gray-500 mt-1">Visualiza y actualiza tu información personal.</p>
        </div>

        {loading ? (
          <div className="text-gray-400 text-sm">Cargando perfil...</div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{error}</div>}
            {ok && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">{ok}</div>}

            <div className="bg-gray-900 text-white rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at top, #374151 0%, transparent 60%)' }} />
              <div className="relative">
                <div className="relative w-28 h-28 mx-auto mb-3">
                  <img
                    src={resolvedImageSrc}
                    alt="Perfil"
                    className="w-28 h-28 rounded-full object-cover border-4 border-white/70"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(form.name || form.email || 'User')}`
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
                <p className="text-2xl font-black">¡Hola, {form.name || 'Usuario'}!</p>
                <p className="text-sm text-gray-300 mt-1">{form.email}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 border border-white/40 rounded-full px-4 py-2 text-sm font-semibold hover:bg-white/10"
                >
                  Cambiar foto de perfil
                </button>
                {profileImage && (
                  <p className="text-xs text-gray-300 mt-2">Archivo seleccionado: {profileImage.name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
                <input className={INPUT} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellidos</label>
                <input className={INPUT} value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Edad</label>
                <input className={INPUT} type="number" min="16" max="100" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input className={INPUT} value={form.email} disabled />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nichos de preferencia</label>
              <input className={INPUT} value={form.preferred_niches} onChange={e => setForm(f => ({ ...f, preferred_niches: e.target.value }))} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Inversión promedio ($)</label>
              <input className={INPUT} type="number" min="0" value={form.average_investment} onChange={e => setForm(f => ({ ...f, average_investment: e.target.value }))} />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={e => setProfileImage(e.target.files?.[0] || null)}
              className="hidden"
            />

            <div className="pt-2 flex justify-end">
              <button
                disabled={saving}
                className="px-5 py-2.5 rounded-md text-white font-semibold disabled:opacity-60"
                style={{ backgroundColor: '#22c55e' }}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
