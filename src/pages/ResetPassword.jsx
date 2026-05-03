import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import { Lock, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) { showError('Las contrasenas no coinciden'); return; }
    if (password.length < 6) { showError('Minimo 6 caracteres'); return; }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      success('Contrasena actualizada correctamente');
      setDone(true);
    } catch (err) { showError(err.message); }
    finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="card p-8 max-w-sm text-center animate-scale-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 mb-2">Contrasena actualizada</h2>
          <p className="text-surface-500 mb-6">Tu contrasena ha sido cambiada exitosamente</p>
          <button onClick={() => navigate('/login')} className="btn-primary w-full flex items-center justify-center gap-2">
            Iniciar sesion <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div className="card p-6 w-full max-w-sm animate-scale-in">
        <h2 className="text-2xl font-bold text-surface-900 mb-2">Nueva contrasena</h2>
        <p className="text-surface-500 text-sm mb-6">Ingresa tu nueva contrasena</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Nueva contrasena</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-11 pr-11" placeholder="Min. 6 caracteres" required />
              <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="input-label">Confirmar contrasena</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input type={showPw ? 'text' : 'password'} value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} className="input-field pl-11" placeholder="Repetir contrasena" required />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Cambiar contrasena <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
