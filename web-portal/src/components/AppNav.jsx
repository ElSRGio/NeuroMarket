// Navbar compartido — tema claro coherente con UpgradePage
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store.js'
import api from '../services/api.js'

function HexLogo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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

const PLAN_BADGE = {
  basic:      { label: 'Basic',      bg: 'bg-gray-100 text-gray-600 border border-gray-300' },
  pro:        { label: 'Pro',        bg: 'bg-green-100 text-green-700 border border-green-300' },
  enterprise: { label: 'Enterprise', bg: 'bg-blue-100 text-blue-700 border border-blue-300' },
}

export default function AppNav({ showNewAnalysis = true }) {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const planKey = user?.plan_type || 'basic'
  const badge = PLAN_BADGE[planKey] || PLAN_BADGE.basic
  const avatarSrc = user?.profile_image_url
    ? (user.profile_image_url.startsWith('http')
      ? user.profile_image_url
      : `${api.defaults.baseURL || ''}${user.profile_image_url}`)
    : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email || 'User')}`

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <HexLogo size={30}/>
          <span className="font-black text-lg text-gray-900">NeuroMarket</span>
          {user && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-1 ${badge.bg}`}>
              {badge.label}
            </span>
          )}
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
          <Link to="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <Link to="/upgrade" className="hover:text-gray-900 transition-colors">Planes</Link>
          <Link to="/presentation" className="hover:text-gray-900 transition-colors">Demo</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3 relative">
          {planKey === 'basic' && (
            <Link to="/upgrade" className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
              ↑ Actualizar plan
            </Link>
          )}
          {showNewAnalysis && (
            <Link
              to="/analysis/new"
              className="text-sm font-semibold px-4 py-2 rounded-md text-white transition-colors"
              style={{ backgroundColor: '#22c55e' }}
            >
              + Nuevo análisis
            </Link>
          )}
          {user && (
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
            >
              <img
                src={avatarSrc}
                alt="Perfil"
                className="w-7 h-7 rounded-full object-cover border border-gray-300"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || 'User')}`
                }}
              />
              <span className="text-sm text-gray-700 font-medium">{user.name || 'Perfil'}</span>
            </button>
          )}

          {user && profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
                Ver mi perfil
              </Link>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          {showNewAnalysis && (
            <Link to="/analysis/new" className="text-xs font-semibold px-3 py-2 rounded-md text-white" style={{ backgroundColor: '#22c55e' }}>
              + Nuevo
            </Link>
          )}
          <button onClick={() => setOpen(!open)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
            {open ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 space-y-1 pt-3">
          {user && (
            <div className="mb-2 bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3">
              <img
                src={avatarSrc}
                alt="Perfil"
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || 'User')}`
                }}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'Usuario'}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <Link to="/dashboard" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Dashboard</Link>
          <Link to="/upgrade" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Planes y precios</Link>
          <Link to="/presentation" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Demo</Link>
          {user && (
            <>
              <Link to="/profile" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Ver mi perfil</Link>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">
                Cerrar sesion
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
