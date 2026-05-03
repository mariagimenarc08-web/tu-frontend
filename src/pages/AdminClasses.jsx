import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { api } from '../utils/api';
import { BookOpen, Calendar, MapPin, Clock, User, Trash2, CheckCircle, XCircle } from 'lucide-react';

const AdminClasses = () => {
  const { success, error: showError } = useNotification();
  const [allClases, setAllClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('todas');

  useEffect(() => { loadClases(); }, []);

  const loadClases = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/clases?estado=todas');
      setAllClases(data);
    } catch (e) { showError(e.message); }
    finally { setLoading(false); }
  };

  const changeEstado = async (id, estado) => {
    try {
      await api.put(`/admin/clases/${id}`, { estado });
      success(`Clase marcada como ${estado}`);
      loadClases();
    } catch (e) { showError(e.message); }
  };

  const deleteClase = async (id) => {
    if (!confirm('Eliminar esta clase?')) return;
    try {
      await api.del(`/admin/clases/${id}`);
      success('Clase eliminada');
      loadClases();
    } catch (e) { showError(e.message); }
  };

  const estadoBadge = (estado) => {
    const map = {
      confirmada: 'bg-blue-100 text-blue-700',
      completada: 'bg-emerald-100 text-emerald-700',
      cancelada: 'bg-red-100 text-red-700'
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[estado]}`}>{estado}</span>;
  };

  const clases = filterEstado === 'todas' ? allClases : allClases.filter(c => c.estado === filterEstado);

  const counts = {
    todas: allClases.length,
    confirmada: allClases.filter(c => c.estado === 'confirmada').length,
    completada: allClases.filter(c => c.estado === 'completada').length,
    cancelada: allClases.filter(c => c.estado === 'cancelada').length
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl sm:text-2xl font-bold text-surface-900 mb-4 sm:mb-6">Gestion de Clases</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'todas', label: 'Todas', color: 'bg-surface-900 text-white' },
          { key: 'confirmada', label: 'Confirmadas', color: 'bg-blue-100 text-blue-700' },
          { key: 'completada', label: 'Completadas', color: 'bg-emerald-100 text-emerald-700' },
          { key: 'cancelada', label: 'Canceladas', color: 'bg-red-100 text-red-700' }
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

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
        ) : clases.length === 0 ? (
          <div className="card p-12 text-center text-surface-400">No hay clases</div>
        ) : clases.map(c => (
          <div key={c._id} className="card p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-surface-900">{c.materia}</h3>
                  {estadoBadge(c.estado)}
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-sm text-surface-500">
                  <p className="flex items-center gap-1.5"><User className="w-4 h-4 text-primary-400" /> {c.cliente?.nombre}</p>
                  <p className="flex items-center gap-1.5"><User className="w-4 h-4 text-purple-400" /> {c.docente?.nombre}</p>
                  <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-surface-300" /> {new Date(c.fecha).toLocaleDateString('es-AR')}</p>
                  <p className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-surface-300" /> {c.horaInicio} - {c.horaFin}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-surface-300" /> {c.ubicacion}</p>
                  {c.pago?.monto && <p className="flex items-center gap-1.5 text-sm"><span className="text-surface-400">Pago:</span> S/ {c.pago.monto} - {estadoBadge(c.pago.estado)}</p>}
                </div>
                {c.observaciones && <p className="text-xs text-surface-400 mt-2 italic">Obs: {c.observaciones}</p>}
              </div>
              <div className="flex items-center gap-1">
                {c.estado === 'confirmada' && (
                  <button onClick={() => changeEstado(c._id, 'completada')} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completar</button>
                )}
                {c.estado !== 'cancelada' && (
                  <button onClick={() => changeEstado(c._id, 'cancelada')} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelar</button>
                )}
                <button onClick={() => deleteClase(c._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-600">
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

export default AdminClasses;
