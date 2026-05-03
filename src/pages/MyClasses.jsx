import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Calendar, MapPin, Clock, User, Phone, Check, X, CreditCard, Upload, Wallet } from 'lucide-react';

const METODOS_LABELS = { yape: 'Yape', plin: 'Plin', transferencia: 'Transferencia bancaria' };
const METODOS_COLORS = { yape: '#7C3AED', plin: '#06B6D4', transferencia: '#2563EB' };

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(null);
  const [payForm, setPayForm] = useState({ file: null, metodoPago: 'yape', monto: '' });
  const [teacherMetodos, setTeacherMetodos] = useState([]);
  const { user } = useAuth();
  const { success, error: showError } = useNotification();

  useEffect(() => { loadClasses(); }, []);

  const loadClasses = async () => {
    try {
      const data = await api.get('/clases/mis-clases');
      setClasses(data);
    } catch (e) { showError(e.message); }
    finally { setLoading(false); }
  };

  const openPayModal = async (cls) => {
    setShowPayModal(cls);
    setPayForm({ file: null, metodoPago: 'yape', monto: '' });
    try {
      const data = await api.get(`/auth/docente/${cls.docente?._id}/metodos-pago`);
      setTeacherMetodos(data);
    } catch { setTeacherMetodos([]); }
  };

  const cancel = async (id) => {
    try {
      await api.patch(`/clases/${id}/cancelar`);
      success('Clase cancelada');
      loadClasses();
    } catch (e) { showError(e.message); }
  };

  const complete = async (id) => {
    try {
      await api.patch(`/clases/${id}/completar`);
      success('Clase completada');
      loadClasses();
    } catch (e) { showError(e.message); }
  };

  const uploadPayment = async (e) => {
    e.preventDefault();
    if (!payForm.file || !payForm.monto) { showError('Completa todos los campos'); return; }
    try {
      const fd = new FormData();
      fd.append('comprobante', payForm.file);
      fd.append('metodoPago', payForm.metodoPago);
      fd.append('monto', payForm.monto);
      await api.upload(`/pagos/subir/${showPayModal._id}`, fd);
      success('Comprobante enviado');
      setShowPayModal(null);
      setPayForm({ file: null, metodoPago: 'yape', monto: '' });
      loadClasses();
    } catch (e) { showError(e.message); }
  };

  const statusBadge = (s) => {
    switch (s) {
      case 'confirmada': return <span className="badge-accepted">Confirmada</span>;
      case 'completada': return <span className="badge-info">Completada</span>;
      case 'cancelada': return <span className="badge-rejected">Cancelada</span>;
      default: return null;
    }
  };

  const pagoBadge = (p) => {
    if (!p?.comprobanteUrl) return <span className="text-xs text-surface-400">Sin pago</span>;
    switch (p.estado) {
      case 'pendiente': return <span className="badge-pending">Pago pendiente</span>;
      case 'aprobado': return <span className="badge-accepted">Pago aprobado</span>;
      case 'rechazado': return <span className="badge-rejected">Pago rechazado</span>;
      default: return null;
    }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const isTeacher = user?.rol === 'docente';

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Mis Clases</h1>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
      ) : classes.length === 0 ? (
        <div className="card text-center py-16">
          <Calendar className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">Sin clases</h3>
          <p className="text-surface-500">No tienes clases programadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map(cls => (
            <div key={cls._id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-surface-900">{cls.materia}</h3>
                    {statusBadge(cls.estado)}
                    {pagoBadge(cls.pago)}
                  </div>
                  <div className="space-y-1.5 text-sm text-surface-500">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{fmtDate(cls.fecha)}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{cls.horaInicio} - {cls.horaFin}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{cls.ubicacion}</span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      {isTeacher ? cls.cliente?.nombre : cls.docente?.nombre}
                    </span>
                    {isTeacher && cls.cliente?.telefono && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-emerald-500" />
                        {cls.cliente.telefono}
                      </span>
                    )}
                  </div>
                  {cls.observaciones && <p className="text-sm text-surface-400 mt-2">{cls.observaciones}</p>}
                  {cls.pago?.notaRevision && <p className="text-sm text-amber-600 mt-2">Nota: {cls.pago.notaRevision}</p>}
                </div>

                <div className="flex gap-2 flex-wrap flex-shrink-0">
                  {!isTeacher && cls.estado === 'confirmada' && (!cls.pago?.comprobanteUrl || cls.pago.estado === 'rechazado') && (
                    <button onClick={() => openPayModal(cls)} className="btn-secondary flex items-center gap-1.5 text-sm">
                      <CreditCard className="w-4 h-4" /> Pagar
                    </button>
                  )}
                  {isTeacher && cls.estado === 'confirmada' && (
                    <button onClick={() => complete(cls._id)} className="btn-success flex items-center gap-1.5 text-sm">
                      <Check className="w-4 h-4" /> Completar
                    </button>
                  )}
                  {cls.estado === 'confirmada' && (
                    <button onClick={() => cancel(cls._id)} className="btn-danger flex items-center gap-1.5 text-sm">
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment modal */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(null)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold">Subir comprobante de pago</h3>
              <button onClick={() => setShowPayModal(null)} className="p-1 hover:bg-surface-100 rounded-lg"><X className="w-5 h-5 text-surface-500" /></button>
            </div>
            <form onSubmit={uploadPayment} className="modal-body space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Metodos de pago del docente */}
              {teacherMetodos.length > 0 && (
                <div>
                  <label className="input-label flex items-center gap-2"><Wallet className="w-4 h-4" /> Informacion de pago</label>
                  <div className="space-y-2">
                    {teacherMetodos.filter(m => m.tipo === payForm.metodoPago).map(m => (
                      <div key={m.tipo} className="border border-surface-200 rounded-xl p-3 bg-surface-50">
                        <p className="font-semibold text-sm mb-1" style={{ color: METODOS_COLORS[m.tipo] }}>{METODOS_LABELS[m.tipo]}</p>
                        {m.info && <p className="text-sm text-surface-600 whitespace-pre-line">{m.info}</p>}
                        {m.qrUrl && (
                          <div className="mt-2 flex justify-center">
                            <img src={m.qrUrl} alt="QR" className="w-40 h-40 object-contain bg-white rounded-lg p-2 border border-surface-200" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="input-label">Metodo de pago</label>
                <select value={payForm.metodoPago} onChange={e => setPayForm(p => ({ ...p, metodoPago: e.target.value }))} className="input-field">
                  <option value="yape">Yape</option>
                  <option value="plin">Plin</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
              <div>
                <label className="input-label">Monto (S/.)</label>
                <input type="number" step="0.01" value={payForm.monto} onChange={e => setPayForm(p => ({ ...p, monto: e.target.value }))} className="input-field" placeholder="0.00" required />
              </div>
              <div>
                <label className="input-label">Comprobante (imagen)</label>
                <div className="border-2 border-dashed border-surface-200 rounded-xl p-6 text-center hover:border-primary-300 transition-colors">
                  <Upload className="w-8 h-8 text-surface-400 mx-auto mb-2" />
                  <input type="file" accept="image/*" onChange={e => setPayForm(p => ({ ...p, file: e.target.files[0] }))} className="hidden" id="file-upload" required />
                  <label htmlFor="file-upload" className="btn-secondary cursor-pointer text-sm">Seleccionar imagen</label>
                  {payForm.file && <p className="text-sm text-emerald-600 mt-2">{payForm.file.name}</p>}
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Enviar comprobante</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClasses;
