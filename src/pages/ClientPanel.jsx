import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import { Plus, Clock, MapPin, FileText, Calendar, ChevronDown, X, Check } from 'lucide-react';

const HORARIOS = [
  { inicio: '08:00', fin: '09:00' }, { inicio: '09:00', fin: '10:00' },
  { inicio: '10:00', fin: '11:00' }, { inicio: '11:00', fin: '12:00' },
  { inicio: '14:00', fin: '15:00' }, { inicio: '15:00', fin: '16:00' },
  { inicio: '16:00', fin: '17:00' }, { inicio: '17:00', fin: '18:00' },
  { inicio: '18:00', fin: '19:00' }, { inicio: '19:00', fin: '20:00' }
];

const MATERIAS = ['Matematicas', 'Fisica', 'Quimica', 'Biologia', 'Ingles', 'Español', 'Historia', 'Programacion', 'Musica', 'Estimulacion temprana', 'Otra'];

const ClientPanel = () => {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ materia: '', otraMateria: '', fecha: '', horarios: [], ubicacion: '', observaciones: '' });
  const [loading, setLoading] = useState(true);
  const [horariosInfo, setHorariosInfo] = useState([]);
  const [checkingHorarios, setCheckingHorarios] = useState(false);
  const { success, error: showError } = useNotification();

  useEffect(() => { loadRequests(); }, []);

  const checkHorarios = async (fecha) => {
    if (!fecha) {
      setHorariosInfo([]);
      return;
    }
    setCheckingHorarios(true);
    try {
      const data = await api.post('/solicitudes/horarios-disponibles', { fecha });
      setHorariosInfo(data.horarios || []);
    } catch (e) {
      console.error(e);
      setHorariosInfo([]);
    } finally {
      setCheckingHorarios(false);
    }
  };

  const handleFechaChange = (e) => {
    const fecha = e.target.value;
    setForm(prev => ({ ...prev, fecha, horarios: [] }));
    checkHorarios(fecha);
  };

  const loadRequests = async () => {
    try {
      const data = await api.get('/solicitudes/mis-solicitudes');
      setRequests(data);
    } catch (e) { showError(e.message); }
    finally { setLoading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.horarios.length === 0) { showError('Selecciona al menos un horario'); return; }
    if (form.materia === 'Otra' && !form.otraMateria.trim()) { showError('Especifica la materia'); return; }
    try {
      const payload = {
        ...form,
        materia: form.materia === 'Otra' ? form.otraMateria.trim() : form.materia
      };
      delete payload.otraMateria;
      await api.post('/solicitudes', payload);
      success('Solicitud creada correctamente');
        setForm({ materia: '', otraMateria: '', fecha: '', horarios: [], ubicacion: '', observaciones: '' });
      setShowForm(false);
      loadRequests();
    } catch (e) { showError(e.message); }
  };

  const toggleTime = (h) => {
    setForm(prev => ({
      ...prev,
      horarios: prev.horarios.find(x => x.horaInicio === h.inicio)
        ? prev.horarios.filter(x => x.horaInicio !== h.inicio)
        : [...prev.horarios, { horaInicio: h.inicio, horaFin: h.fin }]
    }));
  };

  const statusBadge = (s) => {
    switch (s) {
      case 'pendiente': return <span className="badge-pending"><Clock className="w-3 h-3" /> Pendiente</span>;
      case 'aceptado': return <span className="badge-accepted"><Check className="w-3 h-3" /> Aceptada</span>;
      case 'rechazado': return <span className="badge-rejected"><X className="w-3 h-3" /> Rechazada</span>;
      default: return null;
    }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const acceptedCount = requests.filter(r => r.estado === 'aceptado').length;
  const pendingCount = requests.filter(r => r.estado === 'pendiente').length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Mis Solicitudes</h1>
          <p className="text-surface-500 mt-1">{pendingCount} pendientes, {acceptedCount} aceptadas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nueva solicitud
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-6 animate-scale-in">
          <div className="modal-header">
            <h3 className="text-lg font-semibold">Solicitar nueva clase</h3>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-surface-100 rounded-lg"><X className="w-5 h-5 text-surface-500" /></button>
          </div>
          <form onSubmit={submit} className="p-5 sm:p-6 space-y-5">
            <div>
              <label className="input-label">Materia *</label>
              <select value={form.materia} onChange={e => setForm(prev => ({ ...prev, materia: e.target.value }))} className="input-field" required>
                <option value="">Seleccionar materia</option>
                {MATERIAS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {form.materia === 'Otra' && (
                <input type="text" value={form.otraMateria} onChange={e => setForm(prev => ({ ...prev, otraMateria: e.target.value }))} className="input-field mt-3" placeholder="Especifica la materia" autoFocus />
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Fecha *</label>
                <input type="date" value={form.fecha} onChange={handleFechaChange} className="input-field" min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div>
                <label className="input-label">Ubicacion *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input type="text" value={form.ubicacion} onChange={e => setForm(prev => ({ ...prev, ubicacion: e.target.value }))} className="input-field pl-11" placeholder="Direccion o zona" required />
                </div>
              </div>
            </div>

            <div>
              <label className="input-label">Horarios disponibles * ({form.horarios.length} seleccionados)</label>
              {checkingHorarios && <p className="text-xs text-surface-400 mb-2">Verificando disponibilidad...</p>}
              {horariosInfo.length > 0 && (
                <p className="text-xs text-surface-400 mb-2">
                  {horariosInfo.filter(h => h.disponible).length} de {horariosInfo.length} horarios con al menos un docente disponible
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {HORARIOS.map((h, idx) => {
                  const sel = form.horarios.find(x => x.horaInicio === h.inicio);
                  const info = horariosInfo.find(hi => hi.horaInicio === h.inicio);
                  const noDisponible = info && !info.disponible;

                  return (
                    <button
                      key={h.inicio}
                      type="button"
                      onClick={() => !noDisponible && toggleTime(h)}
                      disabled={noDisponible}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all relative ${
                        noDisponible
                          ? 'bg-surface-100 text-surface-400 border-surface-200 cursor-not-allowed opacity-50'
                          : sel
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-surface-700 border-surface-200 hover:border-primary-300'
                      }`}
                    >
                      <div>{h.inicio}-{h.fin}</div>
                      {info && !noDisponible && (
                        <div className="text-xs opacity-75">{info.docentesDisponibles} doc.</div>
                      )}
                      {noDisponible && (
                        <div className="text-xs text-red-500 font-medium">Agotado</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="input-label">Observaciones</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 w-5 h-5 text-surface-400" />
                <textarea value={form.observaciones} onChange={e => setForm(prev => ({ ...prev, observaciones: e.target.value }))} className="input-field pl-11" rows="3" placeholder="Temas especificos, nivel, etc." />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">Enviar solicitud</button>
          </form>
        </div>
      )}

      {/* Requests list */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
      ) : requests.length === 0 ? (
        <div className="card text-center py-16">
          <Calendar className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">Sin solicitudes</h3>
          <p className="text-surface-500">Crea tu primera solicitud de clase para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req._id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-surface-900">{req.materia}</h3>
                    {statusBadge(req.estado)}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-surface-500">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{fmtDate(req.fecha)}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{req.ubicacion}</span>
                    <span>{req.horarios.map(h => `${h.horaInicio}-${h.horaFin}`).join(', ')}</span>
                  </div>
                  {req.observaciones && <p className="text-sm text-surface-400 mt-2">{req.observaciones}</p>}
                  {req.docente && <p className="text-sm text-primary-600 mt-2 font-medium">Docente: {req.docente.nombre}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientPanel;
