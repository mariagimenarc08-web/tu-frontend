import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import { Clock, MapPin, Calendar, User, Phone, Check, X, Filter, TrendingUp, BookOpen, Users } from 'lucide-react';

const TeacherPanel = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useNotification();

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      const data = await api.get('/solicitudes');
      setRequests(data);
    } catch (e) { showError(e.message); }
    finally { setLoading(false); }
  };

  const accept = async (id, horarios) => {
    try {
      await api.post(`/solicitudes/${id}/aceptar`, { horarioSeleccionado: horarios[0] });
      success('Solicitud aceptada y clase creada');
      loadRequests();
    } catch (e) { showError(e.message); }
  };

  const reject = async (id) => {
    try {
      await api.post(`/solicitudes/${id}/rechazar`);
      success('Solicitud rechazada');
      loadRequests();
    } catch (e) { showError(e.message); }
  };

  const filtered = requests.filter(r => filter === 'all' || r.estado === filter);
  const stats = {
    pending: requests.filter(r => r.estado === 'pendiente').length,
    accepted: requests.filter(r => r.estado === 'aceptado').length,
    total: requests.length
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });

  const statusBadge = (s) => {
    switch (s) {
      case 'pendiente': return <span className="badge-pending">Pendiente</span>;
      case 'aceptado': return <span className="badge-accepted">Aceptada</span>;
      case 'rechazado': return <span className="badge-rejected">Rechazada</span>;
      default: return null;
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Panel Docente</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600" /></div>
          <div><p className="text-2xl font-bold text-surface-900">{stats.pending}</p><p className="text-sm text-surface-500">Pendientes</p></div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-emerald-600" /></div>
          <div><p className="text-2xl font-bold text-surface-900">{stats.accepted}</p><p className="text-sm text-surface-500">Aceptadas</p></div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center"><Users className="w-6 h-6 text-primary-600" /></div>
          <div><p className="text-2xl font-bold text-surface-900">{stats.total}</p><p className="text-sm text-surface-500">Total solicitudes</p></div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-surface-400" />
        {['all', 'pendiente', 'aceptado', 'rechazado'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 hover:bg-surface-100 border border-surface-200'}`}
          >
            {f === 'all' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">Sin solicitudes</h3>
          <p className="text-surface-500">No hay solicitudes {filter !== 'all' ? 'con ese filtro' : 'todavia'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <div key={req._id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-surface-900">{req.materia}</h3>
                    {statusBadge(req.estado)}
                  </div>

                  <div className="space-y-2 text-sm text-surface-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-surface-400" />
                      <span className="font-medium">{req.cliente?.nombre}</span>
                    </div>
                    {req.cliente?.telefono && (
                      <div className="flex items-center gap-2 text-surface-500">
                        <Phone className="w-4 h-4 text-emerald-500" />
                        <span>{req.cliente.telefono}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-surface-500">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{fmtDate(req.fecha)}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{req.ubicacion}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {req.horarios.map((h, i) => (
                        <span key={i} className="px-2 py-0.5 bg-surface-100 text-surface-600 rounded text-xs font-medium">{h.horaInicio}-{h.horaFin}</span>
                      ))}
                    </div>
                    {req.observaciones && <p className="text-surface-400 mt-1">{req.observaciones}</p>}
                  </div>
                </div>

                {req.estado === 'pendiente' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => accept(req._id, req.horarios)} className="btn-success flex items-center gap-1.5 text-sm">
                      <Check className="w-4 h-4" /> Aceptar
                    </button>
                    <button onClick={() => reject(req._id)} className="btn-danger flex items-center gap-1.5 text-sm">
                      <X className="w-4 h-4" /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherPanel;
