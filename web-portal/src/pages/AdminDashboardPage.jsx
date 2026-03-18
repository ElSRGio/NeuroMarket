import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [deletedLog, setDeletedLog] = useState([]);
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [reportDetail, setReportDetail] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      setError('No tienes permisos de administrador. Inicia sesión con una cuenta de admin.');
      setLoading(false);
    } else {
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, deletedRes, reportsRes, summaryRes] = await Promise.all([
        api.get('/api/v2/admin/users'),
        api.get('/api/v2/admin/users/deleted-log'),
        api.get('/api/v2/admin/reports'),
        api.get('/api/v2/admin/reports/summary')
      ]);
      setUsers(usersRes.data);
      setDeletedLog(deletedRes.data);
      setReports(reportsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (id, newPlan) => {
    try {
      await api.put(`/api/v2/admin/users/${id}/plan`, { plan_type: newPlan });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, plan_type: newPlan } : u));
    } catch (err) {
      alert('Error updating plan');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.put(`/api/v2/admin/users/${id}`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.error || 'Error actualizando rol');
    }
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setEditForm({
      name: u.name || '',
      last_name: u.last_name || '',
      age: u.age ?? '',
      email: u.email || '',
      preferred_niches: u.preferred_niches || '',
      average_investment: u.average_investment ?? '',
      profile_image_url: u.profile_image_url || '',
      role: u.role || 'user',
      plan_type: u.plan_type || 'basic',
    });
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    try {
      await api.put(`/api/v2/admin/users/${editingUser.id}`, editForm);
      setEditingUser(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo guardar');
    }
  };

  const handleDelete = async (u) => {
    const ok = window.confirm(`¿Eliminar al usuario ${u.name} (${u.email})? Se guardará bitácora.`);
    if (!ok) return;
    try {
      await api.delete(`/api/v2/admin/users/${u.id}`);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo eliminar usuario');
    }
  };

  const profileImageSrc = (u) => {
    if (!u.profile_image_url) return '';
    if (u.profile_image_url.startsWith('http')) return u.profile_image_url;
    return `${api.defaults.baseURL || ''}${u.profile_image_url}`;
  };

  const openReportDetail = async (id) => {
    try {
      const { data } = await api.get(`/api/v2/admin/reports/${id}`);
      setReportDetail(data);
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo abrir el reporte');
    }
  };

  const downloadAdminPdf = async (id) => {
    try {
      const response = await api.get(`/api/v2/admin/reports/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_admin_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('No se pudo descargar PDF');
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

        <div className="mb-5 flex gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-md text-sm font-semibold ${activeTab === 'users' ? 'text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
            style={activeTab === 'users' ? { backgroundColor: '#22c55e' } : {}}
          >
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-2 rounded-md text-sm font-semibold ${activeTab === 'reports' ? 'text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
            style={activeTab === 'reports' ? { backgroundColor: '#22c55e' } : {}}
          >
            Reportes y métricas
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-4">{error}</div>}
        
        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          activeTab === 'users' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[1400px]">
              <thead className="uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-4">Foto</th>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-4 py-4">Edad</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Nichos</th>
                  <th className="px-6 py-4">Inversión</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Plan Actual</th>
                  <th className="px-6 py-4">Análisis Realizados</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      {u.profile_image_url ? (
                        <img src={profileImageSrc(u)} alt="Foto perfil" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                          {u.name?.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div>
                          {u.name} {u.last_name || ''}
                          <div className={`text-xs ${u.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                            {u.is_active ? 'Activo' : 'Inactivo'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{u.age ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate">{u.preferred_niches || '—'}</td>
                    <td className="px-6 py-4 text-gray-700">{u.average_investment ? `$${Number(u.average_investment).toLocaleString()}` : '—'}</td>
                    <td className="px-6 py-4">
                      <select
                        className="text-sm border border-gray-300 rounded bg-white text-gray-900 px-2 py-1"
                        style={{ color: '#111827', backgroundColor: '#ffffff' }}
                        value={u.role || 'user'}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option className="bg-white text-gray-900" value="user">Usuario</option>
                        <option className="bg-white text-gray-900" value="admin">Administrador</option>
                      </select>
                    </td>
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
                        className="text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 px-2 py-1"
                        style={{ color: '#111827', backgroundColor: '#ffffff' }}
                        value={u.plan_type}
                        onChange={(e) => handlePlanChange(u.id, e.target.value)}
                      >
                        <option className="bg-white text-gray-900" value="basic">Basic</option>
                        <option className="bg-white text-gray-900" value="pro">Pro</option>
                        <option className="bg-white text-gray-900" value="enterprise">Enterprise</option>
                      </select>
                      <button
                        onClick={() => openEdit(u)}
                        className="ml-2 px-2 py-1 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="ml-2 px-2 py-1 text-xs rounded border border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-8 text-center text-gray-500">No hay usuarios registrados.</div>
            )}
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <h2 className="font-bold text-gray-900">Bitácora de usuarios eliminados</h2>
              <p className="text-xs text-gray-500 mt-1">Aquí queda el registro histórico de quiénes estaban en la plataforma.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="border-b border-gray-200">
                    <tr className="text-gray-600">
                      <th className="py-2 text-left">Nombre</th>
                      <th className="py-2 text-left">Email</th>
                      <th className="py-2 text-left">Rol</th>
                      <th className="py-2 text-left">Plan</th>
                      <th className="py-2 text-left">Fecha eliminación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedLog.map((d) => (
                      <tr key={d.id} className="border-b border-gray-100 text-gray-700">
                        <td className="py-2">{d.name} {d.last_name || ''}</td>
                        <td className="py-2">{d.email}</td>
                        <td className="py-2">{d.role}</td>
                        <td className="py-2">{d.plan_type}</td>
                        <td className="py-2">{new Date(d.deleted_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {deletedLog.length === 0 && (
                      <tr>
                        <td className="py-4 text-gray-400" colSpan={5}>Sin eliminaciones registradas aún.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          ) : (
            <div className="space-y-6">
              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500">Total reportes</p>
                    <p className="text-2xl font-black text-gray-900">{summary.totals?.total_reports || 0}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500">Promedio inversión</p>
                    <p className="text-2xl font-black text-gray-900">${Number(summary.totals?.avg_inversion || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500">Promedio score viabilidad</p>
                    <p className="text-2xl font-black text-gray-900">{Number(summary.totals?.avg_viability || 0).toFixed(2)}</p>
                  </div>
                </div>
              )}

              {summary && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <SimpleListCard title="Top municipios" items={summary.top_municipios || []} keyName="municipio" />
                  <SimpleListCard title="Top sectores" items={summary.top_sectores || []} keyName="sector" />
                  <SimpleListCard title="Top estados" items={summary.top_estados || []} keyName="estado" />
                </div>
              )}

              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm min-w-[1300px]">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">Negocio</th>
                      <th className="px-4 py-3 text-left">Usuario</th>
                      <th className="px-4 py-3 text-left">Sector</th>
                      <th className="px-4 py-3 text-left">Municipio/Estado</th>
                      <th className="px-4 py-3 text-left">Inversión</th>
                      <th className="px-4 py-3 text-left">Score</th>
                      <th className="px-4 py-3 text-left">Estado</th>
                      <th className="px-4 py-3 text-left">Fecha</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{r.business_name}</td>
                        <td className="px-4 py-3 text-gray-700">
                          <div>{r.user_name}</div>
                          <div className="text-xs text-gray-400">{r.user_email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{r.sector}</td>
                        <td className="px-4 py-3 text-gray-700">{r.municipio}, {r.estado}</td>
                        <td className="px-4 py-3 text-gray-700">${Number(r.inversion_inicial || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-900 font-bold">{Number(r.viability_score || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-700">{r.status}</td>
                        <td className="px-4 py-3 text-gray-700">{new Date(r.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => openReportDetail(r.id)} className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-100">Ver opciones</button>
                          <button onClick={() => downloadAdminPdf(r.id)} className="ml-2 px-2 py-1 text-xs rounded border border-green-300 text-green-700 hover:bg-green-50">PDF</button>
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-6 text-center text-gray-400">Sin reportes aún.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </main>

      {editingUser && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-2xl p-5">
            <h3 className="text-lg font-bold text-gray-900">Editar usuario</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <input className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900" placeholder="Nombre" value={editForm.name || ''} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} />
              <input className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900" placeholder="Apellidos" value={editForm.last_name || ''} onChange={(e) => setEditForm(f => ({ ...f, last_name: e.target.value }))} />
              <input className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900" placeholder="Edad" value={editForm.age ?? ''} onChange={(e) => setEditForm(f => ({ ...f, age: e.target.value }))} />
              <input className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900" placeholder="Email" value={editForm.email || ''} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} />
              <input className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900" placeholder="Nichos" value={editForm.preferred_niches || ''} onChange={(e) => setEditForm(f => ({ ...f, preferred_niches: e.target.value }))} />
              <input className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900" placeholder="Inversión promedio" value={editForm.average_investment ?? ''} onChange={(e) => setEditForm(f => ({ ...f, average_investment: e.target.value }))} />
              <input className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 sm:col-span-2" placeholder="URL foto perfil" value={editForm.profile_image_url || ''} onChange={(e) => setEditForm(f => ({ ...f, profile_image_url: e.target.value }))} />
              <select className="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900" value={editForm.role || 'user'} onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
              <select className="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900" value={editForm.plan_type || 'basic'} onChange={(e) => setEditForm(f => ({ ...f, plan_type: e.target.value }))}>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="px-4 py-2 rounded border border-gray-300 text-gray-700" onClick={() => setEditingUser(null)}>Cancelar</button>
              <button className="px-4 py-2 rounded text-white font-semibold" style={{ backgroundColor: '#22c55e' }} onClick={saveEdit}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {reportDetail && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-4xl p-5 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Opciones seleccionadas del reporte</h3>
              <button className="px-2 py-1 text-sm border border-gray-300 rounded text-gray-700" onClick={() => setReportDetail(null)}>Cerrar</button>
            </div>
            <p className="text-sm text-gray-500 mt-1">{reportDetail.business_name} · {reportDetail.municipio}, {reportDetail.estado}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2">Parámetros enviados (formulario/opciones)</h4>
                <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700 overflow-auto max-h-[420px]">{JSON.stringify(reportDetail.params || {}, null, 2)}</pre>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2">Resultado generado</h4>
                <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700 overflow-auto max-h-[420px]">{JSON.stringify(reportDetail.result || {}, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SimpleListCard({ title, items, keyName }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-xs text-gray-400">Sin datos</p>}
        {items.map((it, idx) => (
          <div key={`${it[keyName]}-${idx}`} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{it[keyName] || '—'}</span>
            <span className="font-semibold text-gray-900">{it.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
