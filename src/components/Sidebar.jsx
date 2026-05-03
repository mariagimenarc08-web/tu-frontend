import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Calendar, BookOpen, Users, CreditCard, Settings,
  LogOut, Menu, X, GraduationCap, ChevronRight, User, FileText
} from 'lucide-react';

const sidebarItems = {
  admin: [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/usuarios', label: 'Usuarios', icon: Users },
    { path: '/admin/solicitudes', label: 'Solicitudes', icon: FileText },
    { path: '/admin/clases', label: 'Clases', icon: BookOpen },
    { path: '/admin/pagos', label: 'Pagos', icon: CreditCard },
    { path: '/admin/archivos', label: 'Archivos', icon: Settings }
  ],
  docente: [
    { path: '/docente', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/calendario', label: 'Calendario', icon: Calendar },
    { path: '/mis-clases', label: 'Mis Clases', icon: BookOpen },
    { path: '/pagos', label: 'Pagos', icon: CreditCard },
    { path: '/perfil', label: 'Mi Perfil', icon: User }
  ],
  cliente: [
    { path: '/cliente', label: 'Mis Solicitudes', icon: LayoutDashboard },
    { path: '/mis-clases', label: 'Mis Clases', icon: BookOpen },
    { path: '/pagos', label: 'Mis Pagos', icon: CreditCard },
    { path: '/perfil', label: 'Mi Perfil', icon: User }
  ]
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const items = sidebarItems[user.rol] || [];

  const SidebarContent = (
    <div className={`flex flex-col h-full ${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-surface-100 transition-all duration-300`}>
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-surface-100">
        <img src="/logo.png" alt="Miss Gimena" className="w-20 h-20 object-contain flex-shrink-0" />
        {!collapsed && <span className="font-bold text-surface-900 text-lg leading-tight">Clase a domicilio Miss Gimena</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && item.label}
            {!collapsed && <ChevronRight className="w-4 h-4 ml-auto opacity-40" />}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-surface-100">
        <div className={`flex items-center gap-3 p-3 rounded-xl ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 bg-primary-100 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
            {user?.fotoPerfil ? (
              <img src={user.fotoPerfil} alt={user.nombre} className="w-full h-full object-cover" />
            ) : user.rol === 'docente'
              ? <GraduationCap className="w-5 h-5 text-primary-600" />
              : <User className="w-5 h-5 text-primary-600" />}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-800 truncate">{user.nombre}</p>
              <p className="text-xs text-surface-500 truncate">{user.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className={`sidebar-link w-full mt-1 text-red-600 hover:bg-red-50 hover:text-red-700 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && 'Cerrar sesion'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        {SidebarContent}
      </div>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-md border border-surface-200 flex items-center justify-center"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full max-w-xs">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
