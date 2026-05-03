import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { api } from '../utils/api';
import { Trash2, Eye, Image as ImageIcon, HardDrive, CreditCard, QrCode, User, Receipt } from 'lucide-react';

const AdminFiles = () => {
  const { success, error: showError } = useNotification();
  const [archivos, setArchivos] = useState({ archivos: [], total: 0, sizeTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [viewingFile, setViewingFile] = useState(null);
  const [activeSection, setActiveSection] = useState('comprobante');

  useEffect(() => { loadFiles(); }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/archivos');
      setArchivos(data);
    } catch (e) { showError(e.message); }
    finally { setLoading(false); }
  };

  const deleteFile = async (nombre) => {
    if (!confirm('Eliminar este archivo?')) return;
    try {
      await api.del(`/admin/archivos/${encodeURIComponent(nombre)}`);
      success('Archivo eliminado');
      loadFiles();
    } catch (e) { showError(e.message); }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFilesByType = (tipo) => archivos.archivos?.filter(f => f.tipo === tipo) || [];

  const comprobantes = getFilesByType('comprobante');
  const qrs = getFilesByType('qr');
  const perfiles = getFilesByType('perfil');
  const otros = getFilesByType('otro');

  const sections = [
    { key: 'comprobante', label: 'Comprobantes de Pago', icon: Receipt, color: 'blue', files: comprobantes, desc: 'Archivos de comprobantes subidos por los clientes para pago de clases' },
    { key: 'qr', label: 'Codigos QR de Metodos de Pago', icon: QrCode, color: 'purple', files: qrs, desc: 'Imagenes QR de Yape, Plin o Transferencia configurados por el docente' },
    { key: 'perfil', label: 'Fotos de Perfil', icon: User, color: 'emerald', files: perfiles, desc: 'Fotografias de perfil subidas por los usuarios' }
  ];

  if (otros.length > 0) {
    sections.push({ key: 'otro', label: 'Otros Archivos', icon: ImageIcon, color: 'gray', files: otros, desc: 'Otros archivos subidos al sistema' });
  }

  const FileGrid = ({ files }) => {
    if (files.length === 0) {
      return <p className="text-sm text-surface-400 py-4 text-center">No hay archivos en esta seccion</p>;
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {files.map((f, i) => (
          <div key={i} className="card overflow-hidden group">
            <div className="aspect-square bg-surface-100 relative overflow-hidden">
              <img src={f.url} alt={f.nombre} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => setViewingFile(f.url)} className="p-2 bg-white rounded-full hover:bg-primary-50">
                  <Eye className="w-4 h-4 text-surface-700" />
                </button>
                <button onClick={() => deleteFile(f.nombre)} className="p-2 bg-white rounded-full hover:bg-red-50">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
            <div className="p-2">
              <p className="text-xs text-surface-700 truncate" title={f.nombre}>{f.nombre}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-surface-400">{formatSize(f.tamano)}</span>
                <span className="text-xs text-surface-400">{new Date(f.fecha).toLocaleDateString('es-AR')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl sm:text-2xl font-bold text-surface-900 mb-4 sm:mb-6">Archivos del Sistema</h1>

      {/* Storage info */}
      <div className="card p-4 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <HardDrive className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-surface-900">{formatSize(archivos.sizeTotal || 0)}</p>
          <p className="text-sm text-surface-500">{archivos.total || 0} archivos en total</p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 mb-6 border-b border-surface-200 pb-1">
        {sections.map(s => {
          const Icon = s.icon;
          const isActive = activeSection === s.key;
          const colorMap = {
            blue: isActive ? 'text-blue-600 border-blue-600' : 'text-surface-400 hover:text-surface-600',
            purple: isActive ? 'text-purple-600 border-purple-600' : 'text-surface-400 hover:text-surface-600',
            emerald: isActive ? 'text-emerald-600 border-emerald-600' : 'text-surface-400 hover:text-surface-600',
            gray: isActive ? 'text-gray-600 border-gray-600' : 'text-surface-400 hover:text-surface-600'
          };
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${colorMap[s.color]}`}
            >
              <Icon className="w-4 h-4" />
              {s.label}
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-surface-100' : 'bg-surface-50'}`}>
                {s.files.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active section content */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="animate-fade-in">
          {sections.filter(s => s.key === activeSection).map(s => (
            <div key={s.key}>
              <div className="mb-4">
                <p className="text-sm text-surface-500">{s.desc}</p>
              </div>
              <FileGrid files={s.files} />
            </div>
          ))}
        </div>
      )}

      {/* File viewer modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setViewingFile(null)}>
          <div className="bg-white rounded-2xl p-4 max-w-2xl w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary-600" /> Vista previa</h3>
              <button onClick={() => setViewingFile(null)} className="p-1 hover:bg-surface-100 rounded-lg"><span className="text-surface-400 hover:text-surface-600">X</span></button>
            </div>
            <img src={viewingFile} alt="Vista previa" className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFiles;
