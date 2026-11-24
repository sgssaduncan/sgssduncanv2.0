import React, { useState, useEffect, useMemo } from 'react';
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
  BookOpen,
  SlidersHorizontal,
  Star,
  Search,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { isOwnerOrDeveloperEmail } from '../types';
import type { Role } from '../types';
import { menuPreferencesService, MenuPreferences } from '../services/menuPreferencesService';
import MenuCustomizerModal from './MenuCustomizerModal';

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
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearch, setMobileSearch] = useState('');
  const [menuPrefs, setMenuPrefs] = useState<MenuPreferences>(() =>
    menuPreferencesService.getPreferences(currentUser?.id)
  );

  useEffect(() => {
    const loadPrefs = () => {
      setMenuPrefs(menuPreferencesService.getPreferences(currentUser?.id));
    };
    loadPrefs();

    const handleUpdate = () => {
      loadPrefs();
    };

    window.addEventListener('sgd_menu_prefs_updated', handleUpdate);
    return () => {
      window.removeEventListener('sgd_menu_prefs_updated', handleUpdate);
    };
  }, [currentUser?.id]);

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
    if (p.startsWith('/criterios')) return { title: 'Criterios & Frecuencias', isSubpage: false, backTo: '/' };
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

  // Obtener todos los ítems accesibles para el usuario actual
  const allNavItems = useMemo(() => {
    return NAV_GROUPS.flatMap(g => g.items).filter(canAccessItem);
  }, [userRole, isSuperAdminOrOwner]);

  const itemByRoute = useMemo(() => {
    const map = new Map<string, NavItem>();
    allNavItems.forEach(it => map.set(it.to, it));
    return map;
  }, [allNavItems]);

  // Ítems marcados como favoritos accesibles
  const favoriteItems = useMemo(() => {
    return menuPrefs.favorites
      .map(route => itemByRoute.get(route))
      .filter((it): it is NavItem => Boolean(it));
  }, [menuPrefs.favorites, itemByRoute]);

  // Mapa de orden para ordenar elementos
  const orderIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    menuPrefs.itemOrder.forEach((route, idx) => map.set(route, idx));
    return map;
  }, [menuPrefs.itemOrder]);

  // Items para la barra inferior móvil (4 seleccionados por el usuario)
  const bottomTabs = useMemo(() => {
    const tabs = menuPrefs.bottomTabRoutes
      .map(route => {
        const item = itemByRoute.get(route);
        if (!item) return null;
        let badge = item.badge;
        if (route === '/plan-accion' && planStats?.pendientes > 0) {
          badge = String(planStats.pendientes);
        }
        return {
          to: item.to,
          icon: item.icon,
          label: item.label,
          exact: item.exact,
          badge
        };
      })
      .filter((it): it is NonNullable<typeof it> => Boolean(it));

    // Si por permisos faltan pestañas, rellenar con las disponibles
    if (tabs.length < 4) {
      for (const item of allNavItems) {
        if (!tabs.some(t => t.to === item.to)) {
          tabs.push({
            to: item.to,
            icon: item.icon,
            label: item.label,
            exact: item.exact,
            badge: item.to === '/plan-accion' && planStats?.pendientes > 0 ? String(planStats.pendientes) : item.badge
          });
        }
        if (tabs.length >= 4) break;
      }
    }
    return tabs.slice(0, 4);
  }, [menuPrefs.bottomTabRoutes, itemByRoute, allNavItems, planStats?.pendientes]);

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

        {/* Buscador Rápido de Módulos (Escritorio) */}
        <div className="mx-3 mt-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar módulo..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1.5 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Botón Personalizar Menús y Accesos (Escritorio) */}
        <div className="mx-3 mt-2">
          <button
            onClick={() => setCustomizerOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/70 hover:bg-yellow-400 hover:text-slate-950 text-slate-300 border border-slate-700/70 hover:border-yellow-400 rounded-xl text-xs font-bold transition-all group active:scale-98 shadow-xs"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-yellow-400 group-hover:text-slate-950 transition-colors" />
              <span>Personalizar Menú</span>
            </span>
            <span className="text-[10px] text-slate-400 group-hover:text-slate-900 font-medium">
              Ajustar
            </span>
          </button>
        </div>

        {/* Menú de Navegación por Categorías */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {/* Sección de Favoritos ⭐ */}
          {!searchQuery && favoriteItems.length > 0 && (
            <div className="space-y-1 mb-2">
              <div className="px-3 flex items-center justify-between text-[10px] font-black text-yellow-400 tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Star size={11} className="fill-yellow-400 text-yellow-400" />
                  MIS FAVORITOS
                </span>
                <span className="text-[9px] text-slate-400 font-normal">{favoriteItems.length} accesos</span>
              </div>
              <div className="space-y-0.5">
                {favoriteItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to, item.exact);
                  return (
                    <Link
                      key={`fav-${item.to}`}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group active:scale-98',
                        active
                          ? 'bg-yellow-400 text-slate-950 shadow-sm font-bold'
                          : 'text-yellow-100 hover:bg-slate-800 hover:text-white bg-slate-800/40 border border-yellow-500/20'
                      )}
                    >
                      <Icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-slate-950' : 'text-yellow-400')} />
                      <span className="flex-1 truncate">{item.label}</span>
                      <Star size={11} className={cn('flex-shrink-0 fill-current', active ? 'text-slate-950' : 'text-yellow-400/80')} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {NAV_GROUPS.map((group, gIdx) => {
            const visibleItems = group.items
              .filter(canAccessItem)
              .filter(item => {
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase();
                  return (
                    item.label.toLowerCase().includes(q) ||
                    (item.description && item.description.toLowerCase().includes(q)) ||
                    group.category.toLowerCase().includes(q)
                  );
                }
                return !menuPrefs.hiddenItems.includes(item.to);
              })
              .sort((a, b) => {
                const ordA = orderIndexMap.has(a.to) ? orderIndexMap.get(a.to)! : 999;
                const ordB = orderIndexMap.has(b.to) ? orderIndexMap.get(b.to)! : 999;
                return ordA - ordB;
              });

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
                    const isFav = menuPrefs.favorites.includes(item.to);
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
                        {isFav && !active && (
                          <Star size={10} className="text-yellow-400/60 fill-yellow-400/60 flex-shrink-0" />
                        )}
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

          {searchQuery.trim() && allNavItems.every(item => {
            const q = searchQuery.toLowerCase();
            return !item.label.toLowerCase().includes(q) && !(item.description && item.description.toLowerCase().includes(q));
          }) && (
            <div className="p-4 text-center text-xs text-slate-400">
              No se encontraron módulos con "{searchQuery}"
            </div>
          )}
        </nav>

        {/* Footer Sidebar con botón de personalización rápido */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Grupo Duncan © 2026</span>
          <button
            onClick={() => setCustomizerOpen(true)}
            className="hover:text-yellow-400 transition-colors flex items-center gap-1 text-[10px]"
            title="Ajustar orden de menús"
          >
            <SlidersHorizontal size={11} />
            <span>Configurar</span>
          </button>
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
              <p className="text-xs text-slate-500">Selecciona o personaliza tus accesos directos</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setMoreMenuOpen(false);
                  setCustomizerOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-yellow-400 hover:text-slate-950 transition-colors active:scale-95 border border-slate-200"
                title="Personalizar menús y accesos"
              >
                <SlidersHorizontal size={14} />
                <span>Personalizar</span>
              </button>
              <button 
                onClick={() => setMoreMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Buscador en vivo de Herramientas (Móvil) */}
          <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                placeholder="Buscar módulo (ej: extintores, inspección, personal...)"
                className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-yellow-400 transition-all"
              />
              {mobileSearch && (
                <button
                  onClick={() => setMobileSearch('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Carrusel rápido de Favoritos ⭐ en el Drawer Móvil */}
          {!mobileSearch && favoriteItems.length > 0 && (
            <div className="px-4 pt-3 pb-1 border-b border-slate-100">
              <p className="text-[10px] font-black text-slate-400 tracking-wider mb-2 flex items-center gap-1">
                <Star size={11} className="fill-yellow-400 text-yellow-400" />
                ACCESOS FAVORITOS
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {favoriteItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={`drawer-fav-${item.to}`}
                      to={item.to}
                      onClick={() => setMoreMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-50 hover:bg-yellow-100 border border-yellow-200/80 text-xs font-bold text-slate-800 whitespace-nowrap active:scale-95 transition-all shadow-2xs"
                    >
                      <Icon className="h-3.5 w-3.5 text-yellow-600" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cuadrícula táctil estilo App de Mensajería */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allNavItems
              .filter(item => {
                if (mobileSearch.trim()) {
                  const q = mobileSearch.toLowerCase();
                  return (
                    item.label.toLowerCase().includes(q) ||
                    (item.description && item.description.toLowerCase().includes(q))
                  );
                }
                return !menuPrefs.hiddenItems.includes(item.to);
              })
              .sort((a, b) => {
                const ordA = orderIndexMap.has(a.to) ? orderIndexMap.get(a.to)! : 999;
                const ordB = orderIndexMap.has(b.to) ? orderIndexMap.get(b.to)! : 999;
                return ordA - ordB;
              })
              .map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to, item.exact);
                const isFav = menuPrefs.favorites.includes(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreMenuOpen(false)}
                    className={cn(
                      'p-3.5 rounded-2xl border flex flex-col justify-between transition-all touch-active relative',
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
                      <div className="flex items-center gap-1">
                        {isFav && (
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        )}
                        {item.badge && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {item.badge}
                          </span>
                        )}
                      </div>
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

            {/* Botón rápido para personalizar menús (Accesible en móvil y desktop) */}
            <button
              type="button"
              onClick={() => setCustomizerOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
              title="Personalizar orden de menús y accesos rápidos"
            >
              <SlidersHorizontal size={18} />
            </button>

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

      {/* Modal de Personalización de Menú */}
      <MenuCustomizerModal
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        userId={currentUser?.id}
        allItems={allNavItems.map(it => ({
          to: it.to,
          label: it.label,
          icon: it.icon,
          color: it.color,
          description: it.description
        }))}
      />
    </div>
  );
}
