import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useSGD } from '../contexts/SGDContext';
import {
  LayoutDashboard, ClipboardCheck, Target, Users,
  Settings, Menu, X, Wifi, WifiOff, RefreshCw, AlertCircle,
  ChevronRight, Package, Stethoscope, Lock, FileText, Crown, User
} from 'lucide-react';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard',       exact: true },
  { to: '/inspecciones', icon: ClipboardCheck,  label: 'Inspecciones' },
  { to: '/plan-accion',  icon: Target,          label: 'Plan de Acción' },
  { to: '/dotacion',     icon: Package,         label: 'Dotación EPP' },
  { to: '/loto',         icon: Lock,            label: 'LOTO' },
  { to: '/medico',       icon: Stethoscope,     label: 'Evaluaciones Médicas' },
  { to: '/reportes',     icon: FileText,        label: 'Reportes' },
  { to: '/usuarios',     icon: Users,           label: 'Usuarios' },
  { to: '/ajustes',      icon: Settings,        label: 'Ajustes' },
];

export default function Layout() {
  const location = useLocation();
  const { isOnline, pendingSyncCount, isSyncing, syncNow, sheetsUrl, currentUser } = useSGD();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to) && to !== '/';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo Oficial Duncan en Color */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <img
              src="/duncan-logo-color.png"
              alt="Duncan"
              className="h-8 w-auto object-contain filter drop-shadow"
            />
            <div className="border-l border-slate-700 pl-2.5">
              <span className="font-extrabold text-[11px] text-yellow-400 tracking-wider block leading-none">SG-SSA</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-tight block mt-0.5 leading-none">v2.0 PWA</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Estado de conexión */}
        <div className={cn(
          'mx-3 mt-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2',
          isOnline ? 'bg-emerald-900/50 text-emerald-300' : 'bg-amber-900/50 text-amber-300'
        )}>
          {isOnline ? <Wifi className="h-3 w-3 flex-shrink-0" /> : <WifiOff className="h-3 w-3 flex-shrink-0" />}
          <span className="truncate">{isOnline ? (sheetsUrl ? 'Conectado a Sheets' : 'En línea (Local)') : 'Modo Offline'}</span>
          {pendingSyncCount > 0 && (
            <span className="ml-auto bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold flex-shrink-0">
              {pendingSyncCount}
            </span>
          )}
        </div>

        {/* Tarjeta de Usuario Activo */}
        {currentUser && (
          <Link
            to="/usuarios"
            onClick={() => setSidebarOpen(false)}
            className="mx-3 mt-2.5 p-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl flex items-center gap-2.5 transition-all group"
            title="Administrar usuarios y accesos"
          >
            <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0 shadow ${
              currentUser.rol?.includes('Propietario')
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
                {currentUser.rol?.includes('Propietario') && (
                  <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-amber-300/90 font-medium truncate font-mono">
                {currentUser.email}
              </p>
            </div>
          </Link>
        )}

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors duration-150 group',
                isActive(to, exact)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{label}</span>
              {isActive(to, exact) && <ChevronRight className="h-3 w-3 ml-auto flex-shrink-0" />}
            </Link>
          ))}
        </nav>

        {/* Pie del sidebar */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {pendingSyncCount > 0 && isOnline && (
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-300 bg-amber-900/40 rounded-lg hover:bg-amber-900/60 transition-colors"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isSyncing && 'animate-spin')} />
              <span>{isSyncing ? 'Sincronizando...' : `Sincronizar (${pendingSyncCount} pendientes)`}</span>
            </button>
          )}
          {!sheetsUrl && (
            <Link to="/ajustes" onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-orange-300 bg-orange-900/30 rounded-lg hover:bg-orange-900/50 transition-colors"
            >
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Configurar Google Sheets</span>
            </Link>
          )}
          <div className="pt-1 text-center">
            <p className="text-[11px] font-medium text-slate-400">Acumuladores Duncan, C.A.</p>
            <p className="text-[10px] text-slate-500">SGD 2.0 © 2026</p>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header móvil */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/duncan-logo-bw.png" alt="Duncan Logo" className="h-6 w-auto object-contain" />
            <span className="font-bold text-xs text-slate-700 border-l border-slate-200 pl-2">SG-SSA 2.0</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {pendingSyncCount > 0 && (
              <span className="bg-amber-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                {pendingSyncCount}
              </span>
            )}
            {!isOnline && <WifiOff className="h-4 w-4 text-amber-500" />}
            {currentUser && (
              <Link to="/usuarios" className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow">
                {currentUser.nombre.slice(0, 2).toUpperCase()}
              </Link>
            )}
          </div>
        </header>

        {/* Header escritorio */}
        <header className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sistema de Gestión SSA</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-slate-700">Acumuladores Duncan, C.A.</span>
          </div>
          <div className="flex items-center gap-4">
            {pendingSyncCount > 0 && isOnline && (
              <button
                onClick={syncNow}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <RefreshCw className={cn('h-3.5 w-3.5 text-amber-600', isSyncing && 'animate-spin')} />
                <span className="font-medium">{pendingSyncCount} pendientes</span>
              </button>
            )}
            {currentUser && (
              <Link
                to="/usuarios"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="Administrar usuarios y accesos"
              >
                <div className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                  currentUser.rol?.includes('Propietario')
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'bg-blue-600 text-white'
                }`}>
                  {currentUser.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900 leading-none">{currentUser.nombre}</span>
                    {currentUser.rol?.includes('Propietario') && <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono leading-none block mt-0.5">{currentUser.email}</span>
                </div>
              </Link>
            )}
          </div>
        </header>

        {/* Área de scroll */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
