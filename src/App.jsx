import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ClientPanel from './pages/ClientPanel';
import TeacherPanel from './pages/TeacherPanel';
import Calendar from './pages/Calendar';
import MyClasses from './pages/MyClasses';
import Profile from './pages/Profile';
import Payments from './pages/Payments';
import AdminPanel from './pages/AdminPanel';
import AdminUsers from './pages/AdminUsers';
import AdminRequests from './pages/AdminRequests';
import AdminClasses from './pages/AdminClasses';
import AdminPayments from './pages/AdminPayments';
import AdminFiles from './pages/AdminFiles';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.rol !== role) return <Navigate to={user.rol === 'admin' ? '/admin' : user.rol === 'docente' ? '/docente' : '/cliente'} />;
  return children;
};

function App() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<Navigate to={user.rol === 'admin' ? '/admin' : user.rol === 'docente' ? '/docente' : '/cliente'} />} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>} />
            <Route path="/admin/usuarios" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/solicitudes" element={<ProtectedRoute role="admin"><AdminRequests /></ProtectedRoute>} />
            <Route path="/admin/clases" element={<ProtectedRoute role="admin"><AdminClasses /></ProtectedRoute>} />
            <Route path="/admin/pagos" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
            <Route path="/admin/archivos" element={<ProtectedRoute role="admin"><AdminFiles /></ProtectedRoute>} />

            {/* Docente routes */}
            <Route path="/docente" element={<ProtectedRoute role="docente"><TeacherPanel /></ProtectedRoute>} />
            <Route path="/calendario" element={<ProtectedRoute role="docente"><Calendar /></ProtectedRoute>} />

            {/* Shared routes */}
            <Route path="/cliente" element={<ProtectedRoute role="cliente"><ClientPanel /></ProtectedRoute>} />
            <Route path="/mis-clases" element={<ProtectedRoute><MyClasses /></ProtectedRoute>} />
            <Route path="/pagos" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
