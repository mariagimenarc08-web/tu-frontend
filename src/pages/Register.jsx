import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Mail, Lock, User, Phone, ArrowRight, UserCheck, GraduationCap, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', passwordConfirm: '', rol: 'cliente', telefono: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { error: showError } = useNotification();

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const getPasswordStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(form.password);
  const strengthLabels = ['', 'Muy debil', 'Debil', 'Regular', 'Buena', 'Fuerte'];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];

  const passwordChecks = [
    { label: 'Al menos 8 caracteres', ok: form.password.length >= 8 },
    { label: 'Una letra minuscula', ok: /[a-z]/.test(form.password) },
    { label: 'Una letra mayuscula', ok: /[A-Z]/.test(form.password) },
    { label: 'Un numero', ok: /[0-9]/.test(form.password) }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordStrength < 4) {
      showError('La contrasena no cumple los requisitos minimos');
      return;
    }
    if (form.password !== form.passwordConfirm) {
      showError('Las contrasenas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-primary-700 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="Miss Gimena" className="w-36 h-36 object-contain" />
            <span className="text-2xl font-bold">Miss Gimena</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Unete a la comunidad</h1>
          <p className="text-emerald-100 text-lg leading-relaxed">
            Ya sea como estudiante o docente, encuentra las herramientas perfectas para tu aprendizaje.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="Miss Gimena" className="w-24 h-24 object-contain" />
            <span className="text-xl font-bold text-surface-900">Miss Gimena</span>
          </div>

          <h2 className="text-3xl font-bold text-surface-900 mb-2">Crear cuenta</h2>
          <p className="text-surface-500 mb-8">Completa tus datos para registrarte</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input type="text" value={form.nombre} onChange={set('nombre')} className="input-field pl-11" placeholder="Tu nombre" required />
              </div>
            </div>

            <div>
              <label className="input-label">Correo electronico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input type="email" value={form.email} onChange={set('email')} className="input-field pl-11" placeholder="tu@email.com" required />
              </div>
            </div>

            <div>
              <label className="input-label">Telefono (opcional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input type="tel" value={form.telefono} onChange={set('telefono')} className="input-field pl-11" placeholder="+51 999 999 999" />
              </div>
            </div>

            {/* Rol selector */}
            <div>
              <label className="input-label">Tipo de cuenta</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, rol: 'cliente' }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${form.rol === 'cliente' ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300'}`}
                >
                  <UserCheck className={`w-5 h-5 ${form.rol === 'cliente' ? 'text-primary-600' : 'text-surface-400'}`} />
                  <div className="text-left">
                    <div className={`font-semibold ${form.rol === 'cliente' ? 'text-primary-700' : 'text-surface-700'}`}>Cliente</div>
                    <div className="text-xs text-surface-500">Buscar clases</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, rol: 'docente' }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${form.rol === 'docente' ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300'}`}
                >
                  <GraduationCap className={`w-5 h-5 ${form.rol === 'docente' ? 'text-primary-600' : 'text-surface-400'}`} />
                  <div className="text-left">
                    <div className={`font-semibold ${form.rol === 'docente' ? 'text-primary-700' : 'text-surface-700'}`}>Docente</div>
                    <div className="text-xs text-surface-500">Ensenar</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="input-label">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} className="input-field pl-11 pr-11" placeholder="Min. 8 caracteres" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-surface-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${passwordStrength >= 4 ? 'text-emerald-600' : 'text-surface-500'}`}>
                    Seguridad: {strengthLabels[passwordStrength] || 'Muy debil'}
                  </p>
                  <div className="space-y-0.5 mt-2">
                    {passwordChecks.map((check, i) => (
                      <div key={i} className={`flex items-center gap-1.5 text-xs ${check.ok ? 'text-emerald-600' : 'text-surface-400'}`}>
                        {check.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {check.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="input-label">Confirmar contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input type={showConfirm ? 'text' : 'password'} value={form.passwordConfirm} onChange={set('passwordConfirm')} className="input-field pl-11 pr-11" placeholder="Repetir contrasena" required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.passwordConfirm && form.password !== form.passwordConfirm && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle className="w-3 h-3" /> Las contrasenas no coinciden</p>
              )}
              {form.passwordConfirm && form.password === form.passwordConfirm && (
                <p className="flex items-center gap-1 text-xs text-emerald-600 mt-1"><Check className="w-3 h-3" /> Las contrasenas coinciden</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-6" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Crear cuenta <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-surface-500 mt-6">
            Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
              Iniciar sesion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
