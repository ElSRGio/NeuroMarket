import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store.js'

export default function AdminRoute({ children }) {
  const { token, user } = useAuthStore()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4 font-black">
            X
          </div>
          <p className="text-sm font-semibold text-gray-900">Validando permisos de acceso</p>
          <p className="text-xs text-gray-500 mt-1">Estamos confirmando tu sesion antes de mostrar administracion.</p>
        </div>
      </div>
    )
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
