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
  Package, 
  Stethoscope, 
  Lock, 
  FileText, 
  Crown, 
  Truck,
  ShieldAlert,
  Flame,
  AlertTriangle,
  GraduationCap,
  Building,
  BarChart2,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  ChevronRight,
  Plus,
  BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { isOwnerOrDeveloperEmail } from '../types';
import type { Role } from '../types';

interface NavItem {
  to: string;
  icon: any;
  label: string;
  badge?: string;
  exact?: boolean;
  allowedRoles?: Role[];
  description?: string;
  color?: string;
}

interface NavGroup {
  category: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    category: 'VISTA GENERAL',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Inicio', exact: true, description: 'Resumen y accesos directos', color: 'bg-blue-500' },
      { 
        to: '/consolidador', 
        icon: BarChart2, 
        label: 'Consolidador',
        allowedRoles: ['Super Admin', 'Propietario / Super Admin', 'Admin', 'Supervisor'],
        description: 'Métricas de todo el grupo',
        color: 'bg-indigo-500'
      }
    ]
  },
  {
    category: 'OPERACIONES & CAMPO',
    items: [
      { to: '/inspecciones', icon: ClipboardCheck, label: 'Inspecciones Técnicas', description: 'Evaluar sedes y equipos', color: 'bg-emerald-500' },
      { to: '/criterios', icon: BookOpen, label: 'Criterios y Frecuencias', badge: 'SSA', description: 'Criterios, frecuencias y ponderaciones', color: 'bg-indigo-600' },
      { to: '/plan-accion', icon: Target, label: 'Planes de Acción', description: 'Solucionar hallazgos NC y OM', color: 'bg-amber-500' },
      { to: '/transporte', icon: Truck, label: 'Transporte y Carga', badge: 'V2', description: 'Revisión de camiones', color: 'bg-sky-500' },
      { to: '/loto', icon: Lock, label: 'Bloqueo LOTO', description: 'Energía Cero y candados', color: 'bg-rose-500' }
    ]
  },
  {
    category: 'SEGURIDAD INDUSTRIAL',
    items: [
      { to: '/permisos', icon: ShieldAlert, label: 'Permisos de Trabajo (PTAR)', badge: 'ISO', description: 'Alturas, fuego y confinados', color: 'bg-orange-500' },
      { to: '/carga-fuego', icon: Flame, label: 'Carga de Fuego & Incendios', description: 'Extintores y gabinetes', color: 'bg-red-500' }
    ]
  },
  {
    category: 'SALUD & PERSONAL',
    items: [
      { to: '/trabajadores', icon: Users, label: 'Trabajadores', badge: 'RRHH', description: 'Directorio y nómina', color: 'bg-teal-500' },
      { to: '/dotacion', icon: Package, label: 'Dotación EPP y Uniformes', description: 'Entrega de equipos de protección', color: 'bg-cyan-500' },
      { 
        to: '/medico', 
        icon: Stethoscope, 
        label: 'Salud Ocupacional',
        allowedRoles: ['Super Admin', 'Propietario / Super Admin', 'Admin', 'Supervisor'],
        description: 'Plombemia, exámenes y reposos',
        color: 'bg-purple-500'
      },
      { to: '/accidentes', icon: AlertTriangle, label: 'Reporte de Accidentes', description: 'Notificaciones INPSASEL', color: 'bg-yellow-500' },
      { to: '/formacion', icon: GraduationCap, label: 'Cursos & Formación', description: 'Capacitación y horas hombre', color: 'bg-blue-600' },
      { to: '/comites', icon: Building, label: 'Comités de Seguridad', description: 'Reuniones y delegados CSSL', color: 'bg-slate-600' }
    ]
  },
  {
    category: 'SISTEMA & REPORTES',
    items: [
      { 
        to: '/reportes', 
        icon: FileText, 
        label: 'Informes Ejecutivos',
        allowedRoles: ['Super Admin', 'Propietario / Super Admin', 'Admin', 'Supervisor'],
        description: 'Exportar informes oficiales',
        color: 'bg-emerald-600'
      },
      { 
        to: '/auditoria', 
        icon: ShieldCheck, 
        label: 'Auditoría Forense', 
        badge: 'TRAZABILIDAD',
        allowedRoles: ['Super Admin', 'Propietario / Super Admin', 'Admin'],
        description: 'Registro de cambios del sistema',
        color: 'bg-violet-500'
      },
      { 
        to: '/usuarios', 
        icon: Users, 
        label: 'Usuarios y Accesos',
        allowedRoles: ['Super Admin', 'Propietario / Super Admin', 'Admin'],
        description: 'Gestionar cuentas y roles',
        color: 'bg-amber-600'
      },
      { 
        to: '/ajustes', 
        icon: Settings, 
        label: 'Ajustes & Nube',
        allowedRoles: ['Super Admin', 'Propietario / Super Admin', 'Admin'],
        description: 'Google Sheets y configuración',
        color: 'bg-slate-500'
      }
    ]
  }
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOnline, pendingSyncCount, isSyncing, syncNow, sheetsUrl, currentUser, logout, planStats } = useSGD();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

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

  const userRole = (currentUser.rol || currentUser.role || '') as Role;
  const isSuperAdminOrOwner = 
    userRole === 'Super Admin' || 
    userRole === 'Propietario / Super Admin' ||
    userRole.includes('Propietario') ||
    userRole.includes('Super Admin') ||
    isOwnerOrDeveloperEmail(currentUser.email);

  const canAccessItem = (item: NavItem) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
    if (isSuperAdminOrOwner) return true;
    return item.allowedRoles.includes(userRole);
  };

  const canManageUsers = isSuperAdminOrOwner || userRole === 'Admin';

  // Título simplificado para la barra superior
  const getHeaderInfo = () => {
    const p = location.pathname;
    if (p === '/') return { title: 'Inicio', isSubpage: false, backTo: null };
    if (p === '/inspecciones') return { title: 'Inspecciones', isSubpage: false, backTo: '/' };
    if (p === '/inspecciones/nueva') return { title: 'Nueva Inspección', isSubpage: true, backTo: '/inspecciones' };
    if (p.includes('/formulario')) return { title: 'Completar Formulario', isSubpage: true, backTo: '/inspecciones' };
    if (p.startsWith('/inspecciones/')) return { title: 'Informe de Inspección', isSubpage: true, backTo: '/inspecciones' };
    if (p.startsWith('/plan-accion')) return { title: 'Planes de Acción', isSubpage: false, backTo: '/' };
    if (p.startsWith('/trabajadores')) return { title: 'Personal & Trabajadores', isSubpage: false, backTo: '/' };
    if (p.startsWith('/dotacion')) return { title: 'Dotación & EPP', isSubpage: false, backTo: '/' };
    if (p.startsWith('/transporte')) return { title: 'Transporte y Carga', isSubpage: false, backTo: '/' };
    if (p.startsWith('/loto')) return { title: 'Bloqueo LOTO', isSubpage: false, backTo: '/' };
    if (p.startsWith('/permisos')) return { title: 'Permisos de Trabajo', isSubpage: false, backTo: '/' };
    if (p.startsWith('/carga-fuego')) return { title: 'Carga de Fuego', isSubpage: false, backTo: '/' };
    if (p.startsWith('/medico')) return { title: 'Salud Ocupacional', isSubpage: false, backTo: '/' };
    if (p.startsWith('/accidentes')) return { title: 'Accidentes', isSubpage: false, backTo: '/' };
    if (p.startsWith('/formacion')) return { title: 'Formación SSA', isSubpage: false, backTo: '/' };
    if (p.startsWith('/comites')) return { title: 'Comités de Seguridad', isSubpage: false, backTo: '/' };
    if (p.startsWith('/consolidador')) return { title: 'Consolidador', isSubpage: false, backTo: '/' };
    if (p.startsWith('/reportes')) return { title: 'Reportes Ejecutivos', isSubpage: false, backTo: '/' };
    if (p.startsWith('/usuarios')) return { title: 'Usuarios', isSubpage: false, backTo: '/' };
    if (p.startsWith('/ajustes')) return { title: 'Ajustes', isSubpage: false, backTo: '/' };
    if (p.startsWith('/auditoria')) return { title: 'Auditoría', isSubpage: false, backTo: '/' };
    return { title: 'SGD Duncan 2.0', isSubpage: false, backTo: '/' };
  };

  const headerInfo = getHeaderInfo();

  // Bottom navigation items (estilo WhatsApp / Telegram)
  const bottomTabs = [
    { to: '/', icon: LayoutDashboard, label: 'Inicio', exact: true },
    { to: '/inspecciones', icon: ClipboardCheck, label: 'Inspecciones' },
    { 
      to: '/plan-accion', 
      icon: Target, 
      label: 'Planes', 
      badge: planStats?.pendientes > 0 ? String(planStats.pendientes) : undefined 
    },
    { to: '/trabajadores', icon: Users, label: 'Personal' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans select-none sm:select-auto">
      {/* Overlay móvil para sidebar o sheet */}
      {(sidebarOpen || moreMenuOpen) && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={() => {
            setSidebarOpen(false);
            setMoreMenuOpen(false);
          }}
        />
      )}

      {/* ============================================================ */}
      {/* SIDEBAR DE ESCRITORIO (LG+) Y DRAWER CLÁSICO                 */}
      {/* ============================================================ */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 shadow-2xl',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Cabecera con Logo Oficial Duncan */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3">
            <img
              src="/duncan-logo-color.png"
              alt="Duncan"
              className="h-8 w-auto object-contain filter drop-shadow"
            />
            <div className="border-l border-slate-700 pl-2.5">
              <span className="font-black text-xs text-yellow-400 tracking-wider block leading-none">SG-SSA</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-tight block mt-0.5 leading-none">Grupo Duncan</span>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg active:scale-95 transition-transform"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Estado de sincronización en vivo */}
        <div className={cn(
          'mx-3 mt-3 px-3 py-2 rounded-xl text-xs flex items-center gap-2 border font-medium',
          isOnline ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' : 'bg-amber-950/40 text-amber-300 border-amber-800/50'
        )}>
          {isOnline ? <Wifi className="h-3.5 w-3.5 flex-shrink-0" /> : <WifiOff className="h-3.5 w-3.5 flex-shrink-0" />}
          <span className="truncate">{isOnline ? (sheetsUrl ? 'Sincronizado con Google Sheets' : 'Modo local activo') : 'Sin conexión a internet'}</span>
          {pendingSyncCount > 0 && (
            <span className="ml-auto bg-amber-500 text-slate-950 text-[10px] rounded-full px-2 py-0.5 font-black flex-shrink-0">
              {pendingSyncCount}
            </span>
          )}
        </div>

        {/* Tarjeta de Usuario Activo */}
        {currentUser && (
          <div className="mx-3 mt-2.5 flex items-center gap-1.5">
            <div className="flex-1 p-2 bg-slate-800/90 border border-slate-700/80 rounded-xl flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center flex-shrink-0 shadow ${
                isSuperAdminOrOwner ? 'bg-amber-400 text-slate-950 font-black' : 'bg-blue-600 text-white'
              }`}>
                {currentUser.nombre?.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-white truncate">
                    {currentUser.nombre}
                  </p>
                  {isSuperAdminOrOwner && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser.cargo || currentUser.rol}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-2.5 bg-slate-800/90 hover:bg-rose-950/70 hover:text-rose-400 text-slate-400 border border-slate-700/80 hover:border-rose-800 rounded-xl transition-all flex-shrink-0 active:scale-95"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        {/* Menú de Navegación por Categorías */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map((group, gIdx) => {
            const visibleItems = group.items.filter(canAccessItem);
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-black text-slate-400 tracking-wider">
                  {group.category}
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.to, item.exact);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group active:scale-98',
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
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 text-center font-medium">
          Grupo Duncan © 2026
        </div>
      </aside>

      {/* ============================================================ */}
      {/* HOJA MODAL "MÁS HERRAMIENTAS" (ESTILO TELEGRAM / WHATSAPP)   */}
      {/* ============================================================ */}
      {moreMenuOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-250 lg:hidden border-t border-slate-200">
          {/* Manija de arrastre / Handle */}
          <div className="py-2.5 flex justify-center cursor-pointer" onClick={() => setMoreMenuOpen(false)}>
            <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
          </div>

          <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Todas las Herramientas</h3>
              <p className="text-xs text-slate-500">Selecciona el módulo al que deseas acceder</p>
            </div>
            <button 
              onClick={() => setMoreMenuOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cuadrícula táctil estilo App de Mensajería */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {NAV_GROUPS.flatMap(g => g.items).filter(canAccessItem).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to, item.exact);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreMenuOpen(false)}
                  className={cn(
                    'p-3.5 rounded-2xl border flex flex-col justify-between transition-all touch-active',
                    active 
                      ? 'bg-yellow-50 border-yellow-300 shadow-xs' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs',
                      item.color || 'bg-slate-700'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className={cn('text-xs font-bold truncate', active ? 'text-slate-950' : 'text-slate-900')}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.description || 'Acceder al módulo'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Barra inferior de la hoja modal */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                {currentUser.nombre?.charAt(0) || 'U'}
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900 truncate max-w-[160px]">{currentUser.nombre}</p>
                <p className="text-[10px] text-slate-500">{currentUser.rol}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setMoreMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 active:scale-95 transition-all"
            >
              <LogOut size={14} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONTENEDOR PRINCIPAL Y PANTALLA                              */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Cabecera Superior (Estilo App Moderna / WhatsApp) */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between z-20 sticky top-0 shadow-2xs">
          <div className="flex items-center gap-2.5">
            {headerInfo.isSubpage ? (
              <button
                type="button"
                onClick={() => navigate(headerInfo.backTo || '/')}
                className="p-2 -ml-1 text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1 active:scale-95"
                title="Volver atrás"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden active:scale-95"
                title="Abrir menú"
              >
                <Menu size={22} />
              </button>
            )}

            <div>
              <h1 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span>{headerInfo.title}</span>
                {/* Indicador de conexión sutil */}
                <span 
                  className={cn(
                    'w-2 h-2 rounded-full inline-block',
                    isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                  )}
                  title={isOnline ? 'En línea' : 'Sin conexión'}
                />
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                SG-SSA Grupo Duncan · {currentUser.nombre}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOnline && pendingSyncCount > 0 && (
              <button
                onClick={syncNow}
                disabled={isSyncing}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors active:scale-95"
              >
                <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Sincronizar</span> ({pendingSyncCount})
              </button>
            )}

            {/* Avatar del usuario con acceso rápido a cerrar sesión */}
            <div className="flex items-center gap-1.5 pl-1">
              <div 
                className="w-8 h-8 rounded-full bg-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs ring-2 ring-yellow-400/30"
                title={`${currentUser.nombre} (${currentUser.rol})`}
              >
                {currentUser?.nombre?.charAt(0) || 'U'}
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors hidden sm:flex active:scale-95"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Contenido de la Página con relleno inferior para la barra móvil */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 lg:p-8 pb-28 lg:pb-8">
          <Outlet />
        </main>

        {/* ============================================================ */}
        {/* BARRA DE NAVEGACIÓN INFERIOR (MOBILE BOTTOM NAV ESTILO CHAT) */}
        {/* ============================================================ */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 bottom-nav-safe shadow-lg">
          <div className="grid grid-cols-5 items-center justify-around h-16 px-1 max-w-lg mx-auto">
            {bottomTabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.to, tab.exact);

              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={cn(
                    'flex flex-col items-center justify-center h-full py-1 px-1 transition-all touch-active relative',
                    active ? 'text-yellow-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
                  )}
                >
                  <div className={cn(
                    'p-1 rounded-xl transition-all',
                    active ? 'bg-yellow-400/20 text-yellow-700 scale-105' : ''
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                    {tab.label}
                  </span>
                  {tab.badge && (
                    <span className="absolute top-1 right-2 bg-rose-500 text-white text-[9px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-xs">
                      {tab.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Pestaña MÁS (Abre el panel de herramientas) */}
            <button
              type="button"
              onClick={() => setMoreMenuOpen(true)}
              className={cn(
                'flex flex-col items-center justify-center h-full py-1 px-1 transition-all touch-active',
                moreMenuOpen ? 'text-yellow-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
              )}
            >
              <div className={cn(
                'p-1 rounded-xl transition-all',
                moreMenuOpen ? 'bg-yellow-400/20 text-yellow-700 scale-105' : ''
              )}>
                <Menu className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                Más
              </span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
