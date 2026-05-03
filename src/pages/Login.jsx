import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Mail, Lock, ArrowRight, Key } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { error: showError, success } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    setRecoveryLoading(true);
    try {
      const { api } = await import('../utils/api');
      const data = await api.post('/auth/recuperar-password', { email: recoveryEmail });
      success('Si el correo esta registrado, recibiras las instrucciones');
      if (data.link) {
        navigator.clipboard.writeText(data.link);
        success('Link copiado al portapapeles (para testing)');
      }
      setShowRecovery(false);
      setRecoveryEmail('');
    } catch (err) {
      showError(err.message);
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="Miss Gimena" className="w-36 h-36 object-contain" />
            <span className="text-2xl font-bold">Miss Gimena</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Bienvenido de vuelta</h1>
          <p className="text-primary-100 text-lg leading-relaxed">
            Accede a tu panel para gestionar clases, horarios y pagos.
            Tu proxima clase te esta esperando.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="Miss Gimena" className="w-24 h-24 object-contain" />
            <span className="text-xl font-bold text-surface-900">Miss Gimena</span>
          </div>

          <h2 className="text-3xl font-bold text-surface-900 mb-2">Iniciar sesion</h2>
          <p className="text-surface-500 mb-8">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Correo electronico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="Tu contraseña"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => setShowRecovery(true)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Olvide mi contraseña
              </button>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Iniciar sesion <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-surface-500 mt-8">
            No tienes cuenta?{' '}
            <Link to="/registro" className="text-primary-600 font-semibold hover:text-primary-700">
              Crear cuenta gratis
            </Link>
          </p>

          {/* Recovery modal */}
          {showRecovery && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowRecovery(false)}>
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-surface-900 mb-2 flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary-600" /> Recuperar contraseña
                </h3>
                <p className="text-sm text-surface-500 mb-4">Ingresa tu correo y te enviaremos las instrucciones para resetear tu contraseña.</p>
                <form onSubmit={handleRecovery} className="space-y-4">
                  <div>
                    <label className="input-label">Correo electronico</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                      <input type="email" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} className="input-field pl-11" placeholder="tu@email.com" required />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowRecovery(false)} className="btn-secondary flex-1">Cancelar</button>
                    <button type="submit" className="btn-primary flex-1" disabled={recoveryLoading}>
                      {recoveryLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                      ) : 'Enviar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
