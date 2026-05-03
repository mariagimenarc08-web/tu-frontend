import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Calendar, UserCheck, Shield, Star, ArrowRight, GraduationCap } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Miss Gimena" className="w-16 h-16 object-contain" />
              <span className="text-xl font-bold text-surface-900">Miss Gimena</span>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <Link to="/" className="btn-primary">Ir a mi panel</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost">Iniciar sesion</Link>
                  <Link to="/registro" className="btn-primary">Registrarse</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-emerald-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full text-primary-700 text-sm font-medium mb-8">
              <Star className="w-4 h-4" />
              Plataforma #1 en clases personalizadas
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-surface-900 tracking-tight leading-tight">
              Clases personalizadas
              <span className="block bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
                a domicilio
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-surface-500 max-w-2xl mx-auto leading-relaxed">
              Conecta con docentes calificados que llegan hasta tu hogar.
              Aprende a tu ritmo, en el horario que prefieras.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={user ? '/cliente' : '/registro'}
                className="btn-primary px-8 py-4 text-base flex items-center gap-2"
              >
                Solicitar clase
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={user ? '/docente' : '/registro'}
                className="btn-secondary px-8 py-4 text-base flex items-center gap-2"
              >
                <GraduationCap className="w-5 h-5" />
                Soy docente
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900">
              Todo lo que necesitas
            </h2>
            <p className="mt-4 text-lg text-surface-500">
              Una plataforma completa para gestionar tu aprendizaje
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: 'Todas las materias', desc: 'Matematicas, fisica, ingles, quimica y mas' },
              { icon: Calendar, title: 'Horarios flexibles', desc: 'Elige el dia y hora que mejor te convenga' },
              { icon: UserCheck, title: 'Docentes verificados', desc: 'Profesionales calificados y con experiencia' },
              { icon: Shield, title: 'Pagos seguros', desc: 'Sube tu comprobante y gestiona tus pagos' }
            ].map((item, i) => (
              <div key={i} className="card card-body group hover:border-primary-200">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                  <item.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900">Como funciona</h2>
            <p className="mt-4 text-lg text-surface-500">Tres pasos simples para empezar</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '1', title: 'Solicita tu clase', desc: 'Elige la materia, fecha, horario y lugar donde quieres recibir la clase' },
              { step: '2', title: 'Un docente acepta', desc: 'Tu solicitud es revisada y un docente disponible la acepta' },
              { step: '3', title: 'Aprende', desc: 'Recibe tu clase personalizada en la comodidad de tu hogar' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-primary-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-surface-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Comienza a aprender hoy
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Crea tu cuenta gratis y encuentra al docente ideal para ti
          </p>
          <Link to="/registro" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl">
            Crear cuenta gratis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-surface-900 text-surface-400 text-center text-sm">
        <p> 2026 Clase a domicilio Miss Gimena. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Landing;
