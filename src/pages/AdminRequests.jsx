import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { api } from '../utils/api';
import { FileText, Filter, Eye, Trash2, Search, X, Calendar, MapPin, Clock, User } from 'lucide-react';

const AdminRequests = () => {
  const { success, error: showError } = useNotification();
  const [allSolicitudes, setAllSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('todas');

  useEffect(() => { loadSolicitudes(); }, []);

  const loadSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/solicitudes?estado=todas');
      setAllSolicitudes(data);
    } catch (e) { showError(e.message); }
    finally { setLoading(false); }
  };

  const changeEstado = async (id, estado) => {
    try {
      await api.put(`/admin/solicitudes/${id}`, { estado });
      success(`Solicitud marcada como ${estado}`);
      loadSolicitudes();
    } catch (e) { showError(e.message); }
  };

  const deleteSolicitud = async (id) => {
    if (!confirm('Eliminar esta solicitud?')) return;
    try {
      await api.del(`/admin/solicitudes/${id}`);
      success('Solicitud eliminada');
      loadSolicitudes();
    } catch (e) { showError(e.message); }
  };

  const estadoBadge = (estado) => {
    const map = {
      pendiente: 'bg-amber-100 text-amber-700',
      aceptado: 'bg-emerald-100 text-emerald-700',
      rechazado: 'bg-red-100 text-red-700'
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[estado]}`}>{estado}</span>;
  };

  const solicitudes = filterEstado === 'todas' ? allSolicitudes : allSolicitudes.filter(s => s.estado === filterEstado);

  const counts = {
    todas: allSolicitudes.length,
    pendiente: allSolicitudes.filter(s => s.estado === 'pendiente').length,
    aceptado: allSolicitudes.filter(s => s.estado === 'aceptado').length,
    rechazado: allSolicitudes.filter(s => s.estado === 'rechazado').length
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl sm:text-2xl font-bold text-surface-900 mb-4 sm:mb-6">Gestion de Solicitudes</h1>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'todas', label: 'Todas', color: 'bg-surface-900 text-white' },
          { key: 'pendiente', label: 'Pendientes', color: 'bg-amber-100 text-amber-700' },
          { key: 'aceptado', label: 'Aceptadas', color: 'bg-emerald-100 text-emerald-700' },
          { key: 'rechazado', label: 'Rechazadas', color: 'bg-red-100 text-red-700' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilterEstado(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 ${filterEstado === f.key ? f.color : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
          >
            {f.label} <span className="opacity-60">({counts[f.key]})</span>
          </button>
        ))}
      </div>

      {/* Cards list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
        ) : solicitudes.length === 0 ? (
          <div className="card p-12 text-center text-surface-400">No hay solicitudes</div>
        ) : solicitudes.map(s => (
          <div key={s._id} className="card p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-surface-900">{s.materia}</h3>
                  {estadoBadge(s.estado)}
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-sm text-surface-500">
                  <p className="flex items-center gap-1.5"><User className="w-4 h-4 text-surface-300" /> {s.cliente?.nombre || 'N/A'}</p>
                  {s.docente && <p className="flex items-center gap-1.5"><User className="w-4 h-4 text-purple-400" /> {s.docente.nombre}</p>}
                  <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-surface-300" /> {new Date(s.fecha).toLocaleDateString('es-AR')}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-surface-300" /> {s.ubicacion}</p>
                  {s.horarios?.[0] && <p className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-surface-300" /> {s.horarios[0].horaInicio} - {s.horarios[0].horaFin}</p>}
                </div>
                {s.observaciones && <p className="text-xs text-surface-400 mt-2 italic">Obs: {s.observaciones}</p>}
              </div>
              <div className="flex items-center gap-1">
                {s.estado === 'pendiente' && (
                  <>
                    <button onClick={() => changeEstado(s._id, 'aceptado')} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Aceptar</button>
                    <button onClick={() => changeEstado(s._id, 'rechazado')} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Rechazar</button>
                  </>
                )}
                <button onClick={() => deleteSolicitud(s._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRequests;
