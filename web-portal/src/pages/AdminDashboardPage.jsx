import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      setError('No tienes permisos de administrador. Inicia sesión con una cuenta de admin.');
      setLoading(false);
    } else {
      loadUsers();
    }
  }, [user, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/v2/admin/users');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Se remueve el useEffect viejo que llamaba a loadUsers sin validación

  const handlePlanChange = async (id, newPlan) => {
    try {
      await api.put(`/api/v2/admin/users/${id}/plan`, { plan_type: newPlan });
      setUsers(users.map(u => u.id === id ? { ...u, plan_type: newPlan } : u));
    } catch (err) {
      alert('Error updating plan');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-black text-lg text-gray-900">NeuroMarket Admin</span>
        <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-600 hover:text-green-600">Volver a App</button>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard de Administración</h1>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-4">{error}</div>}
        
        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Plan Actual</th>
                  <th className="px-6 py-4">Análisis Realizados</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        {u.profile_image_url ? (
                          <img src={api.defaults.baseURL + u.profile_image_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            {u.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          {u.name} {u.last_name || ''}
                          <div className={`text-xs ${u.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                            {u.is_active ? 'Activo' : 'Inactivo'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${u.plan_type === 'enterprise' ? 'bg-blue-100 text-blue-800' : u.plan_type === 'pro' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {u.plan_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-gray-700">{u.analysesCount || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select 
                        className="text-sm border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                        value={u.plan_type}
                        onChange={(e) => handlePlanChange(u.id, e.target.value)}
                      >
                        <option value="basic">Basic</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-8 text-center text-gray-500">No hay usuarios registrados.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
