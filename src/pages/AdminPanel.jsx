import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  Users, GraduationCap, BookOpen, CreditCard, TrendingUp, Clock,
  FileText, CheckCircle, XCircle, AlertCircle, User, Calendar, Wallet,
  PieChart, ArrowUpRight, BarChart3
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [actividad, setActividad] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, actData] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/actividad')
      ]);
      setStats(statsData);
      setActividad(actData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!stats) return null;

  const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora mismo';
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    return date.toLocaleDateString('es-AR');
  };

  const estadoBadge = (estado) => {
    const map = {
      pendiente: 'bg-amber-100 text-amber-700',
      aceptado: 'bg-emerald-100 text-emerald-700',
      rechazado: 'bg-red-100 text-red-700',
      confirmada: 'bg-blue-100 text-blue-700',
      completada: 'bg-emerald-100 text-emerald-700',
      cancelada: 'bg-red-100 text-red-700',
      aprobado: 'bg-emerald-100 text-emerald-700',
      cliente: 'bg-primary-100 text-primary-700',
      docente: 'bg-purple-100 text-purple-700',
      admin: 'bg-red-100 text-red-700'
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[estado] || 'bg-gray-100 text-gray-700'}`}>{estado}</span>;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900">Panel de Administrador</h1>
          <p className="text-sm text-surface-500 mt-1">Vista general del sistema</p>
        </div>
        <button onClick={loadData} className="btn-primary flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-surface-900">{stats.usuarios.total}</p>
              <p className="text-xs sm:text-sm text-surface-500 mt-1">Usuarios</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-surface-400">
            <span>{stats.usuarios.clientes} clientes</span>
            <span>{stats.usuarios.docentes} docentes</span>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-surface-900">{stats.solicitudes.total}</p>
              <p className="text-xs sm:text-sm text-surface-500 mt-1">Solicitudes</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-surface-400">
            <span className="text-amber-600 font-medium">{stats.solicitudes.pendientes} pendientes</span>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-surface-900">{stats.clases.total}</p>
              <p className="text-xs sm:text-sm text-surface-500 mt-1">Clases</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-surface-400">
            <span>{stats.clases.completadas} completadas</span>
            <span className="text-blue-600 font-medium">{stats.clases.confirmadas} activas</span>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-surface-900">S/ {stats.pagos.montoTotal.toFixed(2)}</p>
              <p className="text-xs sm:text-sm text-surface-500 mt-1">Ingresos</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-surface-400">
            <span className="text-amber-600 font-medium">{stats.pagos.pendientes} pendientes</span>
          </div>
        </div>
      </div>

      {/* Charts and activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Activity feed */}
        <div className="lg:col-span-2 card p-4 sm:p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-surface-400" /> Actividad reciente
          </h3>
          <div className="space-y-3">
            {actividad.map((act, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-50">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  act.tipo === 'solicitud' ? 'bg-amber-100' :
                  act.tipo === 'clase' ? 'bg-blue-100' :
                  act.tipo === 'pago' ? 'bg-green-100' : 'bg-primary-100'
                }`}>
                  {act.tipo === 'solicitud' && <FileText className="w-4 h-4 text-amber-600" />}
                  {act.tipo === 'clase' && <BookOpen className="w-4 h-4 text-blue-600" />}
                  {act.tipo === 'pago' && <CreditCard className="w-4 h-4 text-green-600" />}
                  {act.tipo === 'usuario' && <User className="w-4 h-4 text-primary-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800">{act.accion}</p>
                  <p className="text-xs text-surface-400">{act.usuario}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {estadoBadge(act.estado)}
                  <span className="text-xs text-surface-400">{formatDate(act.fecha)}</span>
                </div>
              </div>
            ))}
            {actividad.length === 0 && <p className="text-sm text-surface-400 text-center py-8">Sin actividad reciente</p>}
          </div>
        </div>

        {/* Side panels */}
        <div className="space-y-4 sm:space-y-6">
          {/* Por materia */}
          <div className="card p-4 sm:p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-surface-400" /> Por materia
            </h3>
            <div className="space-y-2">
              {stats.porMateria.map((m, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-surface-700 truncate">{m._id}</span>
                  <span className="text-sm font-semibold text-surface-900">{m.count}</span>
                </div>
              ))}
              {stats.porMateria.length === 0 && <p className="text-xs text-surface-400">Sin datos</p>}
            </div>
          </div>

          {/* Top clientes */}
          <div className="card p-4 sm:p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-surface-400" /> Top clientes
            </h3>
            <div className="space-y-2">
              {stats.porCliente.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-surface-700 truncate">{c.cliente || 'Anonimo'}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary-600 ml-2">{c.count}</span>
                </div>
              ))}
              {stats.porCliente.length === 0 && <p className="text-xs text-surface-400">Sin datos</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
