import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNav from '../components/AppNav.jsx'
import { authService } from '../services/investment.service.js'
import { useAuthStore } from '../store/auth.store.js'

const INPUT = 'w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, token, setAuth } = useAuthStore()
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto de perfil (archivo)</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setProfileImage(e.target.files?.[0] || null)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>

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
