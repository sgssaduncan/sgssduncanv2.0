import React, { useState } from 'react';
import { Link, useLocation, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useSGD } from '../contexts/SGDContext';
import {
  LayoutDashboard, 
  ClipboardCheck, 
  Target, 
  Users,
  Settings, 
  Menu, 
  X, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle,
  ChevronRight, 
  Package, 
  Stethoscope, 
  Lock, 
  FileText, 
  Crown, 
  User,
  Truck,
  ShieldAlert,
  Flame,
  AlertTriangle,
  GraduationCap,
  Building,
  BarChart2,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { isOwnerOrDeveloperEmail } from '../types';

interface NavGroup {
  category: string;
  items: {
    to: string;
    icon: any;
    label: string;
    badge?: string;
    exact?: boolean;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    category: 'VISTA GENERAL',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard Principal', exact: true },
      { to: '/consolidador', icon: BarChart2, label: 'Consolidador 70 Sedes' }
    ]
  },
  {
    category: 'OPERACIONES & LOGÍSTICA',
    items: [
      { to: '/transporte', icon: Truck, label: 'Transporte y Carga', badge: 'V2' },
      { to: '/inspecciones', icon: ClipboardCheck, label: 'Inspecciones Técnicas' },
      { to: '/loto', icon: Lock, label: 'LOTO / Energía Cero' }
    ]
  },
  {
    category: 'SEGURIDAD INDUSTRIAL',
    items: [
      { to: '/permisos', icon: ShieldAlert, label: 'Permisos PTAR (Alto Riesgo)', badge: 'ISO' },
      { to: '/carga-fuego', icon: Flame, label: 'Carga de Fuego & Incendios' },
      { to: '/plan-accion', icon: Target, label: 'Plan de Acción & Hallazgos' }
    ]
  },
  {
    category: 'SALUD & PERSONAL',
    items: [
      { to: '/trabajadores', icon: Users, label: 'Nómina & Trabajadores', badge: 'RRHH' },
      { to: '/dotacion', icon: Package, label: 'Dotación EPP y Uniformes' },
      { to: '/medico', icon: Stethoscope, label: 'Salud, Plombemia & Vacaciones' },
      { to: '/accidentes', icon: AlertTriangle, label: 'Accidentes F-465 (INPSASEL)' },
      { to: '/formacion', icon: GraduationCap, label: 'Formación & RACDA (2m)' },
      { to: '/comites', icon: Building, label: 'Comités CSSL & Delegados' }
    ]
  },
  {
    category: 'SISTEMA & REPORTES',
    items: [
      { to: '/auditoria', icon: ShieldCheck, label: 'Auditoría & Trazabilidad', badge: 'FORENSE' },
      { to: '/reportes', icon: FileText, label: 'Informes Ejecutivos' },
      { to: '/usuarios', icon: Users, label: 'Usuarios y Accesos' },
      { to: '/ajustes', icon: Settings, label: 'Ajustes & Google Sheets' }
    ]
  }
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOnline, pendingSyncCount, isSyncing, syncNow, sheetsUrl, currentUser, logout } = useSGD();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirigir al Login si no hay usuario autenticado
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to) && to !== '/';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 shadow-xl',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo Oficial Duncan en Color */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <img
              src="/duncan-logo-color.png"
              alt="Duncan"
              className="h-8 w-auto object-contain filter drop-shadow"
            />
            <div className="border-l border-slate-700 pl-2.5">
              <span className="font-black text-xs text-yellow-400 tracking-wider block leading-none">SG-SSA</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-tight block mt-0.5 leading-none">v2.0 PWA</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Estado de conexión */}
        <div className={cn(
          'mx-3 mt-3 px-3 py-2 rounded-xl text-xs flex items-center gap-2 border',
          isOnline ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' : 'bg-amber-950/40 text-amber-300 border-amber-800/50'
        )}>
          {isOnline ? <Wifi className="h-3.5 w-3.5 flex-shrink-0" /> : <WifiOff className="h-3.5 w-3.5 flex-shrink-0" />}
          <span className="truncate font-medium">{isOnline ? (sheetsUrl ? 'Google Sheets Conectado' : 'En línea (Local)') : 'Modo Offline Activo'}</span>
          {pendingSyncCount > 0 && (
            <span className="ml-auto bg-amber-500 text-slate-950 text-[10px] rounded-full px-2 py-0.5 font-black flex-shrink-0">
              {pendingSyncCount}
            </span>
          )}
        </div>

        {/* Tarjeta de Usuario Activo y Logout */}
        {currentUser && (() => {
          const isOwnerDev = isOwnerOrDeveloperEmail(currentUser.email) || currentUser.rol?.includes('Propietario');
          return (
            <div className="mx-3 mt-2.5 flex items-center gap-1.5">
              <Link
                to="/usuarios"
                onClick={() => setSidebarOpen(false)}
                className="flex-1 p-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl flex items-center gap-2.5 transition-all group shadow-sm min-w-0"
                title="Administrar usuarios y accesos"
              >
                <div className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center flex-shrink-0 shadow ${
                  isOwnerDev
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-blue-600 text-white'
                }`}>
                  {currentUser.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                      {currentUser.nombre}
                    </p>
                    {isOwnerDev && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate font-semibold">
                    {isOwnerDev ? 'Propietario / Desarrollador' : currentUser.rol}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
                title="Cerrar sesión"
                className="p-2.5 bg-slate-800/90 hover:bg-rose-950/70 hover:text-rose-400 text-slate-400 border border-slate-700/80 hover:border-rose-850 rounded-xl transition-all flex-shrink-0"
              >
                <LogOut size={16} />
              </button>
            </div>
          );
        })()}

        {/* Menú de Navegación con Categorías */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-black text-slate-400 tracking-wider">
                {group.category}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to, item.exact);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group',
                        active
                          ? 'bg-yellow-400 text-slate-950 shadow-sm font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )}
                    >
                      <Icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-slate-950' : 'text-slate-400 group-hover:text-yellow-400')} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                          active ? "bg-slate-950 text-yellow-400" : "bg-slate-800 text-yellow-400 border border-yellow-500/30"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 text-center">
          Acumuladores Duncan © 2026
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-bold text-slate-800 text-base hidden sm:block">
              Sistema de Gestión Duncan 2.0 (SGD)
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {isOnline && pendingSyncCount > 0 && (
              <button
                onClick={syncNow}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors"
              >
                <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? 'Sincronizando...' : `Sincronizar (${pendingSyncCount})`}
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 hidden md:inline">
                {currentUser?.email}
              </span>
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-slate-900 text-xs shadow-sm">
                {currentUser?.nombre?.charAt(0) || 'U'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/80 rounded-xl transition-all shadow-sm"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
