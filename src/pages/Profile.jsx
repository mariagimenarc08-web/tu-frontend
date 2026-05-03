import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../utils/api';
import { User, Mail, Phone, GraduationCap, Shield, Calendar, BookOpen, TrendingUp, Check, X, CreditCard, Wallet, Upload, QrCode } from 'lucide-react';

const METODOS_DISPONIBLES = [
  { tipo: 'yape', label: 'Yape', color: '#7C3AED' },
  { tipo: 'plin', label: 'Plin', color: '#06B6D4' },
  { tipo: 'transferencia', label: 'Transferencia bancaria', color: '#2563EB' }
];

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const { success, error: showError } = useNotification();
  const [profile, setProfile] = useState({ nombre: '', telefono: '', email: '', fechaCreacion: '' });
  const [pw, setPw] = useState({ actual: '', nueva: '', confirmar: '' });
  const [showPw, setShowPw] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metodosPago, setMetodosPago] = useState([]);
  const [showMetodos, setShowMetodos] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileEdit, setProfileEdit] = useState({ nombre: '', telefono: '' });
  const [activeTypes, setActiveTypes] = useState(new Set());
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ nombre: user.nombre || '', telefono: user.telefono || '', email: user.email || '', fechaCreacion: user.fechaCreacion || '', fotoPerfil: user.fotoPerfil || '' });
      setProfileEdit({ nombre: user.nombre || '', telefono: user.telefono || '' });
      loadStats();
      if (user.rol === 'docente') loadMetodosPago();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const isTeacher = user.rol === 'docente';
      const [sols, clases] = await Promise.all([
        api.get(isTeacher ? '/solicitudes' : '/solicitudes/mis-solicitudes'),
        api.get('/clases/mis-clases')
      ]);
      setStats({
        totalSols: sols.length,
        pendientes: sols.filter(s => s.estado === 'pendiente').length,
        aceptadas: sols.filter(s => s.estado === 'aceptado').length,
        totalClases: clases.length,
        completadas: clases.filter(c => c.estado === 'completada').length,
        confirmadas: clases.filter(c => c.estado === 'confirmada').length
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/perfil', { nombre: profileEdit.nombre, telefono: profileEdit.telefono });
      setProfile(prev => ({ ...prev, nombre: profileEdit.nombre, telefono: profileEdit.telefono }));
      success('Perfil actualizado');
      refreshProfile();
      setEditingProfile(false);
    } catch (e) { showError(e.message); }
  };

  const cancelProfileEdit = () => {
    setProfileEdit({ nombre: profile.nombre, telefono: profile.telefono });
    setEditingProfile(false);
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (pw.nueva !== pw.confirmar) { showError('Las contrasenas no coinciden'); return; }
    if (pw.nueva.length < 6) { showError('Minimo 6 caracteres'); return; }
    try {
      await api.put('/auth/cambiar-password', { passwordActual: pw.actual, passwordNueva: pw.nueva });
      success('Contrasena actualizada');
      setPw({ actual: '', nueva: '', confirmar: '' });
      setShowPw(false);
    } catch (e) { showError(e.message); }
  };

  const loadMetodosPago = async () => {
    try {
      const data = await api.get('/auth/docente/metodos-pago');
      const loaded = data.map(m => ({ tipo: m.tipo, info: m.info || '', qrUrl: m.qrUrl || '' }));
      setMetodosPago(loaded);
      setActiveTypes(new Set(loaded.map(m => m.tipo)));
    } catch (e) { console.error(e); }
  };

  const saveMetodoIndividual = async (tipo) => {
    try {
      const cleanData = metodosPago.filter(m => m.tipo === tipo).map(m => ({ tipo: m.tipo, info: m.info || '', qrUrl: m.qrUrl || '' }));
      await api.put('/auth/docente/metodos-pago', { metodosPago: cleanData });
      setEditing(null);
      success(`${METODOS_DISPONIBLES.find(m => m.tipo === tipo)?.label} guardado`);
      await loadMetodosPago();
    } catch (e) { showError(e.message); }
  };

  const updateMetodoInfo = (tipo, valor) => {
    setMetodosPago(prev => prev.map(m => m.tipo === tipo ? { ...m, info: valor } : m));
  };

  const toggleMetodoActivo = (tipo) => {
    setActiveTypes(prev => {
      const next = new Set(prev);
      if (next.has(tipo)) next.delete(tipo);
      else next.add(tipo);
      return next;
    });
  };

  const uploadQR = async (tipo, file) => {
    try {
      const fd = new FormData();
      fd.append('qr', file);
      const data = await api.upload(`/auth/docente/metodos-pago/qr/${tipo}`, fd);
      setMetodosPago(prev => prev.map(m => m.tipo === tipo ? { ...m, qrUrl: data.qrUrl } : m));
      success('QR actualizado');
    } catch (e) {
      console.error('Error QR:', e);
      showError(e.message);
    }
  };

  const uploadFoto = async (file) => {
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('foto', file);
      const data = await api.upload('/auth/perfil/foto', fd);
      setProfile(prev => ({ ...prev, fotoPerfil: data.fotoPerfil }));
      success('Foto de perfil actualizada');
      refreshProfile();
    } catch (e) { showError(e.message); }
    finally { setUploadingPhoto(false); }
  };

  const deleteFoto = async () => {
    try {
      await api.del('/auth/perfil/foto');
      setProfile(prev => ({ ...prev, fotoPerfil: undefined }));
      success('Foto eliminada');
      refreshProfile();
    } catch (e) { showError(e.message); }
  };

  if (!user) return null;
  const isTeacher = user.rol === 'docente';

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl sm:text-2xl font-bold text-surface-900 mb-4 sm:mb-6">Mi Perfil</h1>

      {/* Profile card */}
      <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="relative group flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              {profile.fotoPerfil ? (
                <img src={profile.fotoPerfil} alt={profile.nombre} className="w-full h-full object-cover" />
              ) : isTeacher ? (
                <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              )}
            </div>
            {/* Overlay with upload/delete */}
            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <label className="cursor-pointer p-1.5 bg-white rounded-full hover:bg-primary-50">
                <Upload className="w-3.5 h-3.5 text-surface-700" />
                <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" className="hidden" onChange={e => { if (e.target.files[0]) uploadFoto(e.target.files[0]); e.target.value = ''; }} />
              </label>
              {profile.fotoPerfil && (
                <button onClick={deleteFoto} className="p-1.5 bg-red-500 rounded-full hover:bg-red-600">
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              )}
            </div>
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-surface-900">{profile.nombre}</h2>
            <span className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-semibold ${isTeacher ? 'bg-emerald-50 text-emerald-700' : 'bg-primary-50 text-primary-700'}`}>
              {isTeacher ? <GraduationCap className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              {isTeacher ? 'Docente' : 'Cliente'}
            </span>
            <div className="mt-3 space-y-1 text-sm text-surface-500">
              <p className="flex items-center gap-2 justify-center sm:justify-start"><Mail className="w-4 h-4" />{profile.email}</p>
              {profile.telefono && <p className="flex items-center gap-2 justify-center sm:justify-start"><Phone className="w-4 h-4" />{profile.telefono}</p>}
              <p className="flex items-center gap-2 justify-center sm:justify-start"><Calendar className="w-4 h-4" />Miembro desde {profile.fechaCreacion ? new Date(profile.fechaCreacion).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {!loading && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-primary-600">{stats.totalSols}</p>
            <p className="text-xs text-surface-500 mt-1">{isTeacher ? 'Solicitudes' : 'Solicitudes'}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.pendientes}</p>
            <p className="text-xs text-surface-500 mt-1">Pendientes</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.aceptadas}</p>
            <p className="text-xs text-surface-500 mt-1">Aceptadas</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-surface-700">{stats.totalClases}</p>
            <p className="text-xs text-surface-500 mt-1">Clases</p>
          </div>
        </div>
      )}

      {/* Edit profile */}
      <div className="card mb-6">
        <div className="p-5 border-b border-surface-100 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><User className="w-5 h-5 text-surface-400" /> Informacion personal</h3>
          {!editingProfile && (
            <button onClick={() => setEditingProfile(true)} className="text-sm text-primary-600 font-medium hover:text-primary-700">Editar</button>
          )}
        </div>

        {/* Modo lectura */}
        {!editingProfile && (
          <div className="p-5 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-surface-400 uppercase tracking-wide">Nombre</p>
                <p className="text-surface-900 font-medium">{profile.nombre || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400 uppercase tracking-wide">Email</p>
                <p className="text-surface-900 font-medium">{profile.email}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-surface-400 uppercase tracking-wide">Telefono</p>
              <p className="text-surface-900 font-medium">{profile.telefono || '—'}</p>
            </div>
          </div>
        )}

        {/* Modo edicion */}
        {editingProfile && (
          <form onSubmit={updateProfile} className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Nombre</label>
                <input type="text" value={profileEdit.nombre} onChange={e => setProfileEdit(p => ({ ...p, nombre: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input type="email" value={profile.email} className="input-field bg-surface-50" disabled />
              </div>
            </div>
            <div>
              <label className="input-label">Telefono</label>
              <input type="tel" value={profileEdit.telefono} onChange={e => setProfileEdit(p => ({ ...p, telefono: e.target.value }))} className="input-field" placeholder="+51 999 999 999" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={cancelProfileEdit} className="btn-secondary flex-1">Cancelar</button>
              <button type="submit" className="btn-primary flex-1">Guardar cambios</button>
            </div>
          </form>
        )}
      </div>

      {/* Password */}
      <div className="card">
        <div className="p-5 border-b border-surface-100 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><Shield className="w-5 h-5 text-surface-400" /> Seguridad</h3>
          <button onClick={() => setShowPw(!showPw)} className="text-sm text-primary-600 font-medium hover:text-primary-700">
            {showPw ? 'Cancelar' : 'Cambiar contraseña'}
          </button>
        </div>
        {showPw && (
          <form onSubmit={changePw} className="p-5 space-y-4">
            <div>
              <label className="input-label">Contrasena actual</label>
              <input type="password" value={pw.actual} onChange={e => setPw(p => ({ ...p, actual: e.target.value }))} className="input-field" required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Nueva contrasena</label>
                <input type="password" value={pw.nueva} onChange={e => setPw(p => ({ ...p, nueva: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="input-label">Confirmar</label>
                <input type="password" value={pw.confirmar} onChange={e => setPw(p => ({ ...p, confirmar: e.target.value }))} className="input-field" required />
              </div>
            </div>
            <button type="submit" className="btn-primary">Actualizar contrasena</button>
          </form>
        )}
      </div>

      {/* Metodos de pago (solo docente) */}
      {isTeacher && (
        <div className="card mt-6">
          <div className="p-5 border-b border-surface-100 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><Wallet className="w-5 h-5 text-surface-400" /> Metodos de pago</h3>
            <button onClick={() => setShowMetodos(!showMetodos)} className="text-sm text-primary-600 font-medium hover:text-primary-700">
              {showMetodos ? 'Cerrar' : 'Configurar'}
            </button>
          </div>
          {showMetodos && (
            <div className="p-5 space-y-4">
              <p className="text-sm text-surface-500">Activa los metodos de pago que desees ofrecer. Cada metodo se guarda automaticamente.</p>

              {METODOS_DISPONIBLES.map(meta => {
                const mp = metodosPago.find(m => m.tipo === meta.tipo);
                const activo = activeTypes.has(meta.tipo);
                const editando = editing === meta.tipo;
                const tieneInfo = mp?.info && mp.info.trim().length > 0;

                return (
                  <div key={meta.tipo} className="border border-surface-200 rounded-xl overflow-hidden">
                    {/* Header: nombre + toggle */}
                    <div className="flex items-center justify-between p-4 bg-surface-50">
                      <h4 className="font-semibold flex items-center gap-2" style={{ color: activo ? meta.color : undefined }}>
                        {activo ? <Check className="w-4 h-4" /> : <CreditCard className="w-4 h-4 text-surface-300" />} {meta.label}
                      </h4>
                      <button onClick={() => {
                        toggleMetodoActivo(meta.tipo);
                        if (!activo && !mp) {
                          setMetodosPago(prev => [...prev, { tipo: meta.tipo, info: '', qrUrl: '' }]);
                        }
                      }} className={`w-10 h-6 rounded-full transition-all relative ${activo ? 'bg-primary-600' : 'bg-surface-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${activo ? 'left-5' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Body */}
                    {activo && (
                      <div className="border-t border-surface-200">
                        {editando ? (
                          /* Modo edicion */
                          <div className="p-4 space-y-3">
                            <div>
                              <label className="input-label">Informacion / Instrucciones</label>
                              <textarea value={mp?.info || ''} onChange={e => updateMetodoInfo(meta.tipo, e.target.value)} className="input-field" rows="3" placeholder={`Ej: Datos para ${meta.label}`} />
                            </div>
                            <div>
                              <label className="input-label">Codigo QR (opcional)</label>
                              <div className="flex items-center gap-4">
                                {mp?.qrUrl ? (
                                  <div className="relative">
                                    <img src={mp.qrUrl} alt="QR" className="w-32 h-32 object-contain border border-surface-200 rounded-lg bg-white p-1" />
                                    <button type="button" onClick={() => setMetodosPago(prev => prev.map(m => m.tipo === meta.tipo ? { ...m, qrUrl: '' } : m))} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-surface-200 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                                    <Upload className="w-8 h-8 text-surface-300 mx-auto mb-2" />
                                    <p className="text-xs text-surface-400">Subir QR</p>
                                    <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" key={`qr-${meta.tipo}`} className="hidden" id={`qr-upload-${meta.tipo}`} onChange={e => { if (e.target.files[0]) uploadQR(meta.tipo, e.target.files[0]); e.target.value = ''; }} />
                                    <label htmlFor={`qr-upload-${meta.tipo}`} className="text-xs text-primary-600 font-medium cursor-pointer mt-1 inline-block">Seleccionar archivo</label>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button type="button" onClick={() => { setEditing(null); loadMetodosPago(); }} className="btn-secondary flex-1">Cancelar</button>
                              <button type="button" onClick={() => saveMetodoIndividual(meta.tipo)} className="btn-primary flex-1 flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> Guardar</button>
                            </div>
                          </div>
                        ) : (
                          /* Modo lectura */
                          <div className="p-4">
                            {tieneInfo || mp?.qrUrl ? (
                              <div className="space-y-3">
                                {mp?.info && <p className="text-sm text-surface-700 whitespace-pre-line bg-surface-50 rounded-lg p-3">{mp.info}</p>}
                                {mp?.qrUrl && <img src={mp.qrUrl} alt="QR" className="w-32 h-32 object-contain border border-surface-200 rounded-lg bg-white p-1" />}
                                <button type="button" onClick={() => setEditing(meta.tipo)} className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                                  Editar <CreditCard className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-surface-400 italic">Sin informacion configurada</p>
                                <button type="button" onClick={() => setEditing(meta.tipo)} className="text-sm text-primary-600 font-medium hover:text-primary-700">
                                  Configurar
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
