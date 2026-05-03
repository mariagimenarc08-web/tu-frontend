import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { CreditCard, Check, X, Clock, MapPin, Calendar, Eye, Upload, ArrowUpCircle, AlertCircle, User, Wallet, QrCode, Phone } from 'lucide-react';

const METODOS_LABELS = { yape: 'Yape', plin: 'Plin', transferencia: 'Transferencia bancaria' };
const METODOS_COLORS = { yape: '#7C3AED', plin: '#06B6D4', transferencia: '#2563EB' };

const Payments = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [unpaidClasses, setUnpaidClasses] = useState([]);
  const [tab, setTab] = useState('pending');
  const [clientTab, setClientTab] = useState('pending');
  const [viewImage, setViewImage] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [payForm, setPayForm] = useState({ file: null, metodoPago: 'yape', monto: '' });
  const [teacherMetodos, setTeacherMetodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { success, error: showError } = useNotification();
  const isTeacher = user?.rol === 'docente';

  useEffect(() => { loadData(); }, [isTeacher]);

  const loadData = async () => {
    try {
      if (isTeacher) {
        const [pend, hist] = await Promise.all([
          api.get('/pagos/pendientes'),
          api.get('/pagos/historial')
        ]);
        setPendingPayments(pend);
        setAllPayments(hist);
      } else {
        const clases = await api.get('/clases/mis-clases');
        const conPago = clases.filter(c => c.pago?.comprobanteUrl);
        const sinPago = clases.filter(c =>
          (c.estado === 'confirmada' || c.estado === 'completada') && (!c.pago?.comprobanteUrl || c.pago.estado === 'rechazado')
        );
        setAllPayments(conPago);
        setUnpaidClasses(sinPago);
      }
    } catch (e) { showError(e.message); }
    finally { setLoading(false); }
  };

  const reviewPayment = async (claseId, estado) => {
    try {
      await api.post(`/pagos/revisar/${claseId}`, { estado, notaRevision: reviewNote });
      success(estado === 'aprobado' ? 'Pago aprobado correctamente' : 'Pago rechazado');
      setReviewModal(null);
      setReviewNote('');
      loadData();
    } catch (e) { showError(e.message); }
  };

  const uploadPayment = async (e) => {
    e.preventDefault();
    if (!payForm.file || !payForm.monto) { showError('Completa todos los campos'); return; }
    if (parseFloat(payForm.monto) <= 0) { showError('El monto debe ser mayor a 0'); return; }
    try {
      const fd = new FormData();
      fd.append('comprobante', payForm.file);
      fd.append('metodoPago', payForm.metodoPago);
      fd.append('monto', payForm.monto);
      await api.upload(`/pagos/subir/${payModal._id}`, fd);
      success('Comprobante enviado correctamente. Esperando confirmacion del docente.');
      setPayModal(null);
      setPayForm({ file: null, metodoPago: 'yape', monto: '' });
      loadData();
    } catch (e) { showError(e.message); }
  };

  const openPayModal = async (cls) => {
    setPayModal(cls);
    setPayForm({ file: null, metodoPago: 'yape', monto: '' });
    try {
      const data = await api.get(`/auth/docente/${cls.docente?._id}/metodos-pago`);
      setTeacherMetodos(data);
    } catch { setTeacherMetodos([]); }
  };

  const pagoBadge = (estado) => {
    switch (estado) {
      case 'pendiente': return <span className="badge-pending"><Clock className="w-3 h-3" /> Pendiente</span>;
      case 'aprobado': return <span className="badge-accepted"><Check className="w-3 h-3" /> Aprobado</span>;
      case 'rechazado': return <span className="badge-rejected"><X className="w-3 h-3" /> Rechazado</span>;
      default: return null;
    }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

  const teacherItems = tab === 'pending' ? pendingPayments : allPayments;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-surface-900 mb-6 flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-primary-600" />
        {isTeacher ? 'Gestion de Pagos' : 'Mis Pagos'}
      </h1>

      {/* ========== DOCENTE ========== */}
      {isTeacher && (
        <>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'pending' ? 'bg-amber-500 text-white' : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'}`}>
              <Clock className="w-4 h-4 inline mr-1" /> Pendientes ({pendingPayments.length})
            </button>
            <button onClick={() => setTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'history' ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'}`}>
              Historial ({allPayments.length})
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
          ) : teacherItems.length === 0 ? (
            <div className="card text-center py-16">
              <CreditCard className="w-12 h-12 text-surface-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-surface-700 mb-2">
                {tab === 'pending' ? 'Sin pagos pendientes' : 'Sin historial'}
              </h3>
              <p className="text-surface-500">{tab === 'pending' ? 'No hay comprobantes por revisar' : 'Aun no hay pagos'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teacherItems.map(cls => (
                <div key={cls._id} className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-surface-900">{cls.materia}</h3>
                        {pagoBadge(cls.pago?.estado)}
                      </div>
                      <div className="space-y-1.5 text-sm text-surface-500">
                        <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{fmtDate(cls.fecha)} — {cls.horaInicio} a {cls.horaFin}</p>
                        <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{cls.ubicacion}</p>
                        <div className="flex gap-3 mt-2">
                          <span className="font-semibold text-surface-700">S/. {cls.pago?.monto}</span>
                          <span className="text-surface-400">|</span>
                          <span className="text-surface-600 capitalize">{cls.pago?.metodoPago}</span>
                        </div>
                      </div>
                      {cls.cliente && <p className="text-sm text-surface-600 mt-2 font-medium">Cliente: {cls.cliente.nombre}</p>}
                      {cls.cliente?.telefono && <p className="flex items-center gap-1.5 text-sm text-surface-500"><Phone className="w-3.5 h-3.5" />{cls.cliente.telefono}</p>}
                      {cls.pago?.notaRevision && <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-2 py-1 rounded inline-block">Nota: {cls.pago.notaRevision}</p>}
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {cls.pago?.comprobanteUrl && (
                        <button onClick={() => setViewImage(cls.pago.comprobanteUrl)} className="btn-secondary flex items-center gap-1.5 text-sm justify-center">
                          <Eye className="w-4 h-4" /> Ver comprobante
                        </button>
                      )}
                      {cls.pago?.estado === 'pendiente' && (
                        <button onClick={() => { setReviewModal(cls); setReviewNote(''); }}
                          className="btn-primary flex items-center gap-1.5 text-sm justify-center">
                          <Check className="w-4 h-4" /> Revisar pago
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ========== CLIENTE ========== */}
      {!isTeacher && (
        <>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setClientTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${clientTab === 'pending' ? 'bg-amber-500 text-white' : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'}`}>
              <AlertCircle className="w-4 h-4 inline mr-1" /> Pendientes ({unpaidClasses.length})
            </button>
            <button onClick={() => setClientTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${clientTab === 'history' ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'}`}>
              Historial ({allPayments.length})
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
          ) : (
            <>
              {clientTab === 'pending' && (
                unpaidClasses.length === 0 ? (
                  <div className="card text-center py-16">
                    <Check className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-surface-700 mb-2">Todo al dia</h3>
                    <p className="text-surface-500">No tienes clases pendientes de pago</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unpaidClasses.map(cls => (
                      <div key={cls._id} className={`card p-5 ${cls.pago?.estado === 'rechazado' ? 'border-red-200 bg-red-50/30' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-surface-900">{cls.materia}</h3>
                              {cls.pago?.estado === 'rechazado' && <span className="badge-rejected">Pago rechazado — Reenviar</span>}
                              {!cls.pago?.comprobanteUrl && <span className="badge-pending">Sin comprobante</span>}
                            </div>
                            <div className="text-sm text-surface-500 space-y-1">
                              <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{fmtDate(cls.fecha)} — {cls.horaInicio} a {cls.horaFin}</p>
                              <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{cls.ubicacion}</p>
                              {cls.docente && <p className="flex items-center gap-1.5"><User className="w-4 h-4" />Docente: {cls.docente.nombre}</p>}
                            </div>
                            {cls.pago?.notaRevision && (
                              <p className="text-sm text-red-600 mt-2 bg-red-50 px-3 py-1.5 rounded-lg">
                                Motivo del rechazo: {cls.pago.notaRevision}
                              </p>
                            )}
                          </div>
                          <button onClick={() => openPayModal(cls)} className="btn-primary flex items-center gap-1.5 flex-shrink-0">
                            <ArrowUpCircle className="w-4 h-4" /> Subir comprobante
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {clientTab === 'history' && (
                allPayments.length === 0 ? (
                  <div className="card text-center py-16">
                    <CreditCard className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-surface-700 mb-2">Sin historial</h3>
                    <p className="text-surface-500">Aun no has registrado pagos</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allPayments.map(cls => (
                      <div key={cls._id} className="card p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-surface-900">{cls.materia}</h3>
                              {pagoBadge(cls.pago?.estado)}
                            </div>
                            <div className="text-sm text-surface-500 space-y-1">
                              <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{fmtDate(cls.fecha)} — {cls.horaInicio} a {cls.horaFin}</p>
                              <div className="flex gap-3 mt-1">
                                <span className="font-semibold text-surface-700">S/. {cls.pago?.monto}</span>
                                <span className="text-surface-400">|</span>
                                <span className="text-surface-600 capitalize">{cls.pago?.metodoPago}</span>
                              </div>
                              {cls.pago?.fechaPago && <p className="text-xs text-surface-400">Enviado: {new Date(cls.pago.fechaPago).toLocaleDateString('es-AR')}</p>}
                            </div>
                            {cls.pago?.notaRevision && <p className="text-sm text-surface-500 mt-2">Nota: {cls.pago.notaRevision}</p>}
                          </div>
                          {cls.pago?.comprobanteUrl && (
                            <button onClick={() => setViewImage(cls.pago.comprobanteUrl)} className="btn-secondary flex items-center gap-1.5 text-sm">
                              <Eye className="w-4 h-4" /> Ver
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </>
      )}

      {/* ========== MODAL: Cliente sube comprobante ========== */}
      {payModal && (
        <div className="modal-overlay" onClick={() => setPayModal(null)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold">Enviar comprobante de pago</h3>
              <button onClick={() => setPayModal(null)} className="p-1 hover:bg-surface-100 rounded-lg"><X className="w-5 h-5 text-surface-500" /></button>
            </div>
            <div className="modal-body space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 text-sm text-primary-700">
                <p className="font-semibold">{payModal.materia}</p>
                <p>{fmtDate(payModal.fecha)} — {payModal.horaInicio} a {payModal.horaFin}</p>
              </div>

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
                  <option value="transferencia">Transferencia bancaria</option>
                </select>
              </div>
              <div>
                <label className="input-label">Monto (S/.)</label>
                <input type="number" step="0.01" min="0.01" value={payForm.monto} onChange={e => setPayForm(p => ({ ...p, monto: e.target.value }))} className="input-field" placeholder="0.00" required />
              </div>
              <div>
                <label className="input-label">Captura del comprobante</label>
                <div className="border-2 border-dashed border-surface-200 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer" onClick={() => document.getElementById('pay-file-input').click()}>
                  <Upload className="w-10 h-10 text-surface-300 mx-auto mb-3" />
                  <p className="text-sm text-surface-500 mb-2">Haz clic o arrastra una imagen aqui</p>
                  <p className="text-xs text-surface-400">JPG, PNG o WebP — Max 5MB</p>
                  <input type="file" accept="image/*" onChange={e => setPayForm(p => ({ ...p, file: e.target.files[0] }))} className="hidden" id="pay-file-input" required />
                  {payForm.file && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-emerald-600 font-medium text-sm">
                      <Check className="w-4 h-4" /> {payForm.file.name}
                    </div>
                  )}
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Enviar comprobante</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL: Docente revisa pago ========== */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold">Revisar pago</h3>
              <button onClick={() => setReviewModal(null)} className="p-1 hover:bg-surface-100 rounded-lg"><X className="w-5 h-5 text-surface-500" /></button>
            </div>
            <div className="modal-body space-y-4">
              <div className="bg-surface-50 rounded-xl p-4">
                <p className="font-semibold text-surface-900">{reviewModal.materia}</p>
                <p className="text-sm text-surface-500">{reviewModal.cliente?.nombre} — {fmtDate(reviewModal.fecha)}</p>
                <p className="text-sm text-surface-500 capitalize">{reviewModal.pago?.metodoPago} — S/. {reviewModal.pago?.monto}</p>
              </div>

              {reviewModal.pago?.comprobanteUrl && (
                <div>
                  <label className="input-label">Comprobante del cliente</label>
                  <button onClick={() => setViewImage(reviewModal.pago.comprobanteUrl)} className="w-full border-2 border-surface-200 rounded-xl p-4 hover:border-primary-300 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-5 h-5 text-primary-600" />
                    <span className="text-primary-600 font-medium">Ver captura del pago</span>
                  </button>
                </div>
              )}

              <div>
                <label className="input-label">Nota de revision (opcional)</label>
                <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} className="input-field" rows="2" placeholder="Ej: Monto incorrecto, captura borrosa..." />
              </div>

              <div className="flex gap-3">
                <button onClick={() => reviewPayment(reviewModal._id, 'aprobado')} className="btn-success flex-1 flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" /> Aprobar
                </button>
                <button onClick={() => reviewPayment(reviewModal._id, 'rechazado')} className="btn-danger flex-1 flex items-center justify-center gap-2">
                  <X className="w-5 h-5" /> Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL: Ver imagen ========== */}
      {viewImage && (
        <div className="modal-overlay" onClick={() => setViewImage(null)}>
          <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold">Comprobante</h3>
              <button onClick={() => setViewImage(null)} className="p-1 hover:bg-surface-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="modal-body p-2">
              <img src={viewImage} alt="Comprobante" className="w-full rounded-xl max-h-[70vh] object-contain bg-surface-50" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
