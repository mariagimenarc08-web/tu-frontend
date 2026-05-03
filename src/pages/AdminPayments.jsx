import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { api } from '../utils/api';
import { CreditCard, Filter, CheckCircle, XCircle, Eye } from 'lucide-react';

const AdminPayments = () => {
  const { success, error: showError } = useNotification();
  const [allPagos, setAllPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('todos');
  const [viewingReceipt, setViewingReceipt] = useState(null);

  useEffect(() => { loadPagos(); }, []);

  const loadPagos = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/pagos?estado=todos');
      setAllPagos(data);
    } catch (e) { showError(e.message); }
    finally { setLoading(false); }
  };

  const changeEstado = async (claseId, estado) => {
    try {
      await api.post(`/pagos/revisar/${claseId}`, { estado });
      success(`Pago ${estado}`);
      loadPagos();
    } catch (e) { showError(e.message); }
  };

  const estadoBadge = (estado) => {
    const map = {
      pendiente: 'bg-amber-100 text-amber-700',
      aprobado: 'bg-emerald-100 text-emerald-700',
      rechazado: 'bg-red-100 text-red-700'
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[estado]}`}>{estado}</span>;
  };

  const pagos = filterEstado === 'todos' ? allPagos : allPagos.filter(p => p.pago?.estado === filterEstado);

  const totalMonto = allPagos.reduce((sum, p) => sum + (p.pago?.monto || 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-surface-900">Gestion de Pagos</h1>
        <p className="text-lg font-bold text-emerald-600">S/ {totalMonto.toFixed(2)}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'todos', label: 'Todos', count: allPagos.length, color: 'bg-surface-900 text-white' },
          { key: 'pendiente', label: 'Pendientes', count: allPagos.filter(p => p.pago?.estado === 'pendiente').length, color: 'bg-amber-100 text-amber-700' },
          { key: 'aprobado', label: 'Aprobados', count: allPagos.filter(p => p.pago?.estado === 'aprobado').length, color: 'bg-emerald-100 text-emerald-700' },
          { key: 'rechazado', label: 'Rechazados', count: allPagos.filter(p => p.pago?.estado === 'rechazado').length, color: 'bg-red-100 text-red-700' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilterEstado(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 ${filterEstado === f.key ? f.color : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
          >
            {f.label} <span className="opacity-60">({f.count})</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
        ) : pagos.length === 0 ? (
          <div className="card p-12 text-center text-surface-400">No hay pagos registrados</div>
        ) : pagos.map(c => (
          <div key={c._id} className="card p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-surface-900">{c.materia}</h3>
                  {estadoBadge(c.pago?.estado)}
                  <span className="text-lg font-bold text-emerald-600">S/ {c.pago?.monto || 0}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-sm text-surface-500">
                  <p className="text-surface-600">{c.cliente?.nombre}</p>
                  <p className="text-surface-400">{c.docente?.nombre}</p>
                  {c.pago?.metodoPago && <p className="text-surface-400 capitalize">Metodo: {c.pago.metodoPago}</p>}
                  {c.pago?.fechaPago && <p className="text-surface-400">Fecha: {new Date(c.pago.fechaPago).toLocaleDateString('es-AR')}</p>}
                </div>
                {c.pago?.notaRevision && <p className="text-xs text-surface-400 mt-2">Nota: {c.pago.notaRevision}</p>}
              </div>
              <div className="flex items-center gap-2">
                {c.pago?.comprobanteUrl && (
                  <button onClick={() => setViewingReceipt(c.pago.comprobanteUrl)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Ver comprobante
                  </button>
                )}
                {c.pago?.estado === 'pendiente' && (
                  <>
                    <button onClick={() => changeEstado(c._id, 'aprobado')} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aprobar</button>
                    <button onClick={() => changeEstado(c._id, 'rechazado')} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rechazar</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Receipt modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setViewingReceipt(null)}>
          <div className="bg-white rounded-2xl p-4 max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary-600" /> Comprobante de Pago</h3>
              <button onClick={() => setViewingReceipt(null)} className="p-1 hover:bg-surface-100 rounded-lg"><span className="text-surface-400 hover:text-surface-600">X</span></button>
            </div>
            <img src={viewingReceipt} alt="Comprobante" className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
