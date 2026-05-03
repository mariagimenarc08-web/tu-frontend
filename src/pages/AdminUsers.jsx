import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { api } from '../utils/api';
import {
  Users, Search, Edit, Trash2, Ban, UserCheck, GraduationCap, User,
  Mail, Phone, Calendar, X, Save, Filter, Eye, Key, Shield, Crown
} from 'lucide-react';

const AdminUsers = () => {
  const { success, error: showError } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: '', email: '', telefono: '', rol: '' });
  const [viewingUser, setViewingUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/usuarios');
      setUsers(data);
    } catch (e) { showError(e.message); }
    finally { setLoading(false); }
  };

  const filteredUsers = users.filter(u => {
    const matchTab = activeTab === 'todos' || u.rol === activeTab;
    const matchSearch = !searchInput || u.nombre.toLowerCase().includes(searchInput.toLowerCase()) || u.email.toLowerCase().includes(searchInput.toLowerCase());
    return matchTab && matchSearch;
  });

  const roleOrder = { admin: 0, docente: 1, cliente: 2 };
  const sortedUsers = [...filteredUsers].sort((a, b) => roleOrder[a.rol] - roleOrder[b.rol]);

  const counts = {
    todos: users.length,
    admin: users.filter(u => u.rol === 'admin').length,
    docente: users.filter(u => u.rol === 'docente').length,
    cliente: users.filter(u => u.rol === 'cliente').length
  };

  const handleSearch = () => setSearch(searchInput);

  const startEdit = (u) => {
    setEditingUser(u._id);
    setEditForm({ nombre: u.nombre, email: u.email, telefono: u.telefono || '', rol: u.rol });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/admin/usuarios/${editingUser}`, editForm);
      success('Usuario actualizado');
      setEditingUser(null);
      loadUsers();
    } catch (e) { showError(e.message); }
  };

  const toggleBlock = async (u) => {
    try {
      await api.patch(`/admin/usuarios/${u._id}/bloquear`, { bloqueado: !u.bloqueado });
      success(u.bloqueado ? 'Usuario desbloqueado' : 'Usuario bloqueado');
      loadUsers();
    } catch (e) { showError(e.message); }
  };

  const deleteUser = async (u) => {
    if (!confirm(`Eliminar a ${u.nombre}? Esta accion no se puede deshacer.`)) return;
    try {
      await api.del(`/admin/usuarios/${u._id}`);
      success('Usuario eliminado');
      loadUsers();
    } catch (e) { showError(e.message); }
  };

  const viewUser = async (u) => {
    try {
      const data = await api.get(`/admin/usuarios/${u._id}`);
      setUserDetail(data);
      setViewingUser(u);
    } catch (e) { showError(e.message); }
  };

  const openResetPassword = (u) => {
    const random = Math.random().toString(36).substring(2, 8);
    setNewPassword('pass' + random.toUpperCase());
    setResettingUser(u);
  };

  const confirmResetPassword = async () => {
    try {
      await api.patch(`/admin/usuarios/${resettingUser._id}/reset-password`, { nuevaPassword: newPassword });
      success('Contraseña actualizada: ' + newPassword);
      navigator.clipboard?.writeText(newPassword);
      success('Copiada al portapapeles');
      setResettingUser(null);
      setNewPassword('');
    } catch (e) { showError(e.message); }
  };

  const rolConfig = {
    admin: { label: 'Administrador', icon: Crown, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', iconColor: 'text-red-500' },
    docente: { label: 'Docente', icon: GraduationCap, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', iconColor: 'text-purple-500' },
    cliente: { label: 'Cliente', icon: User, bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-700', badge: 'bg-primary-100 text-primary-700', iconColor: 'text-primary-500' }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl sm:text-2xl font-bold text-surface-900 mb-4 sm:mb-6">Gestion de Usuarios</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { key: 'todos', label: 'Total', icon: Users, color: 'bg-surface-900 text-white' },
          { key: 'admin', label: 'Administradores', icon: Crown, color: 'bg-red-500 text-white' },
          { key: 'docente', label: 'Docentes', icon: GraduationCap, color: 'bg-purple-500 text-white' },
          { key: 'cliente', label: 'Clientes', icon: User, color: 'bg-primary-500 text-white' }
        ].map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setActiveTab(s.key)}
              className={`card p-4 text-left transition-all ${activeTab === s.key ? 'ring-2 ring-primary-500 ring-offset-2' : 'hover:shadow-md'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${activeTab === s.key ? '' : 'text-surface-400'}`} />
                <span className={`text-2xl font-bold ${activeTab === s.key ? '' : ''}`}>{counts[s.key]}</span>
              </div>
              <p className={`text-sm font-medium ${activeTab === s.key ? 'text-primary-600' : 'text-surface-500'}`}>{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por nombre o email..."
              className="input-field pl-9"
            />
          </div>
          <button onClick={handleSearch} className="btn-primary flex items-center gap-2">
            <Filter className="w-4 h-4" /> Buscar
          </button>
        </div>
      </div>

      {/* Users list grouped by role */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
      ) : sortedUsers.length === 0 ? (
        <div className="card p-12 text-center text-surface-400">No se encontraron usuarios</div>
      ) : (
        <div className="space-y-6">
          {['admin', 'docente', 'cliente'].map(rol => {
            const cfg = rolConfig[rol];
            const Icon = cfg.icon;
            const roleUsers = sortedUsers.filter(u => u.rol === rol);
            if (roleUsers.length === 0) return null;

            return (
              <div key={rol}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 ${cfg.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                  </div>
                  <h3 className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>{roleUsers.length}</span>
                </div>

                <div className="grid gap-2">
                  {roleUsers.map(u => (
                    <div key={u._id} className={`card p-4 border-l-4 ${u.bloqueado ? 'border-l-red-400 opacity-75' : `border-l-${rol === 'admin' ? 'red' : rol === 'docente' ? 'purple' : 'primary'}-400`} hover:shadow-md transition-all`}>
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center ${u.fotoPerfil ? 'bg-surface-100' : cfg.bg}`}>
                          {u.fotoPerfil ? (
                            <img src={u.fotoPerfil} alt={u.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-surface-900 truncate">{u.nombre}</p>
                            {u.bloqueado && (
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                                <Ban className="w-2.5 h-2.5" /> Bloqueado
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                            <span className="truncate">{u.email}</span>
                            {u.telefono && <span className="hidden sm:inline">{u.telefono}</span>}
                          </div>
                        </div>

                        {/* Date */}
                        <div className="hidden lg:block text-xs text-surface-400 text-right">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(u.fechaCreacion).toLocaleDateString('es-AR')}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button onClick={() => viewUser(u)} className="p-1.5 rounded-lg hover:bg-blue-50 text-surface-400 hover:text-blue-600" title="Ver detalle">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => startEdit(u)} className="p-1.5 rounded-lg hover:bg-amber-50 text-surface-400 hover:text-amber-600" title="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                          {u.rol !== 'admin' && (
                            <button onClick={() => openResetPassword(u)} className="p-1.5 rounded-lg hover:bg-purple-50 text-surface-400 hover:text-purple-600" title="Cambiar contraseña">
                              <Key className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => toggleBlock(u)} className="p-1.5 rounded-lg hover:bg-orange-50 text-surface-400 hover:text-orange-600" title={u.bloqueado ? 'Desbloquear' : 'Bloquear'}>
                            {u.bloqueado ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                          {u.rol !== 'admin' && (
                            <button onClick={() => deleteUser(u)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-700" title="Eliminar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setEditingUser(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Edit className="w-5 h-5 text-primary-600" /> Editar Usuario</h3>
              <button onClick={() => setEditingUser(null)}><X className="w-5 h-5 text-surface-400 hover:text-surface-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="input-label">Nombre</label>
                <input type="text" value={editForm.nombre} onChange={e => setEditForm(p => ({ ...p, nombre: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="input-label">Telefono</label>
                <input type="tel" value={editForm.telefono} onChange={e => setEditForm(p => ({ ...p, telefono: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="input-label">Rol</label>
                <select value={editForm.rol} onChange={e => setEditForm(p => ({ ...p, rol: e.target.value }))} className="input-field">
                  <option value="cliente">Cliente</option>
                  <option value="docente">Docente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingUser(null)} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={saveEdit} className="btn-primary flex-1 flex items-center justify-center gap-1"><Save className="w-4 h-4" /> Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View detail modal */}
      {viewingUser && userDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => { setViewingUser(null); setUserDetail(null); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Eye className="w-5 h-5 text-primary-600" /> Detalle del Usuario</h3>
              <button onClick={() => { setViewingUser(null); setUserDetail(null); }}><X className="w-5 h-5 text-surface-400 hover:text-surface-600" /></button>
            </div>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl overflow-hidden mx-auto flex items-center justify-center">
                {userDetail.fotoPerfil ? (
                  <img src={userDetail.fotoPerfil} alt={userDetail.nombre} className="w-full h-full object-cover" />
                ) : userDetail.rol === 'docente' ? (
                  <GraduationCap className="w-8 h-8 text-primary-600" />
                ) : <User className="w-8 h-8 text-primary-600" />}
              </div>
              <h4 className="text-lg font-bold mt-2">{userDetail.nombre}</h4>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rolConfig[userDetail.rol]?.badge}`}>{rolConfig[userDetail.rol]?.label}</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-surface-400" /><span>{userDetail.email}</span></div>
              {userDetail.telefono && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-surface-400" /><span>{userDetail.telefono}</span></div>}
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-surface-400" /><span>Registrado: {new Date(userDetail.fechaCreacion).toLocaleDateString('es-AR')}</span></div>
              <div className="flex items-center gap-2"><Ban className="w-4 h-4 text-surface-400" /><span>{userDetail.bloqueado ? 'Bloqueado' : 'Activo'}</span></div>
              <hr className="my-2" />
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-surface-50 rounded-lg p-3">
                  <p className="text-xl font-bold text-primary-600">{userDetail.solicitudesCount || 0}</p>
                  <p className="text-xs text-surface-400">Solicitudes</p>
                </div>
                <div className="bg-surface-50 rounded-lg p-3">
                  <p className="text-xl font-bold text-emerald-600">{userDetail.clasesCount || 0}</p>
                  <p className="text-xs text-surface-400">Clases</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => { setResettingUser(null); setNewPassword(''); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Key className="w-5 h-5 text-amber-600" /> Cambiar contraseña</h3>
              <button onClick={() => { setResettingUser(null); setNewPassword(''); }}><X className="w-5 h-5 text-surface-400 hover:text-surface-600" /></button>
            </div>
            <p className="text-sm text-surface-500 mb-4">Se asignara una nueva contraseña a <strong>{resettingUser.nombre}</strong></p>
            <div className="mb-4">
              <label className="input-label">Nueva contraseña</label>
              <div className="flex gap-2">
                <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field font-mono" />
                <button onClick={() => {
                  const random = Math.random().toString(36).substring(2, 8);
                  setNewPassword('pass' + random.toUpperCase());
                }} className="btn-secondary whitespace-nowrap">Generar</button>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setResettingUser(null); setNewPassword(''); }} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={confirmResetPassword} className="btn-primary flex-1 flex items-center justify-center gap-1"><Key className="w-4 h-4" /> Asignar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
