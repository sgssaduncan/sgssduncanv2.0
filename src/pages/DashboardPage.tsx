import React from 'react';
import { Link } from 'react-router-dom';
import { useSGD } from '../contexts/SGDContext';
import {
  ClipboardCheck, Target, CheckCircle2, AlertTriangle,
  TrendingUp, Plus, ArrowRight, Clock, Building2, BarChart3,
  Wifi, WifiOff, RefreshCw, AlertCircle, Package, Users,
  ShieldCheck, ChevronRight, Sparkles, FileText, CheckCircle
} from 'lucide-react';
import { cn, formatDate, getEstadoBadgeClass, getResultadoBadgeClass, getPrioridadColor } from '../lib/utils';

export default function DashboardPage() {
  const { 
    stats, planStats, inspecciones, planAccion, 
    isOnline, sheetsUrl, currentUser 
  } = useSGD();

  const safeInsps = Array.isArray(inspecciones) ? inspecciones : [];
  const safePlans = Array.isArray(planAccion) ? planAccion : [];
  const recentInsps = safeInsps.slice(-5).reverse();
  const urgentActions = safePlans.filter(p => {
    const s = String(p?.estado || '').toLowerCase().trim();
    const isOverdue = s !== 'cerrado' && s !== 'cerrada' && p.fechaLimite && new Date(p.fechaLimite) < new Date();
    return s === 'pendiente' || s === 'vencido' || s === 'vencida' || isOverdue;
  }).slice(0, 5);
  
  // Conteo oficial de C, OM, NC y cálculo de tasa ponderada
  const cCount = safeInsps.filter(i => i.resultado === 'C').length || stats.conformes;
  const omCount = safeInsps.filter(i => i.resultado === 'OM').length || ((stats as any).observaciones ?? 0);
  const ncCount = safeInsps.filter(i => i.resultado === 'NC').length || stats.noConformes;
  const totalInsps = safeInsps.length || stats.totalInspecciones;
  const conformePct = totalInsps > 0
    ? Math.round(((cCount + (omCount * 0.5)) / totalInsps) * 100)
    : 0;

  const firstName = String(currentUser?.nombre || 'Inspector').split(' ')[0] || 'Inspector';

  return (
    <div className="space-y-5 fade-in max-w-6xl mx-auto">
      {/* ============================================================ */}
      {/* SALUDO AMIGABLE & ACCESO RÁPIDO (ESTILO SUPER-APP)          */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-5 sm:p-7 rounded-3xl shadow-md border border-slate-800 relative overflow-hidden">
        {/* Decoración de fondo suave */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-bold text-yellow-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Sistema SG-SSA Duncan 2.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ¡Hola, {firstName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Panel interactivo simplificado. Registra inspecciones, resuelve planes de acción y monitorea la seguridad en un solo toque.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/inspecciones/nueva"
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm shadow-lg shadow-yellow-400/20 active:scale-95 transition-all touch-active"
            >
              <Plus className="h-5 w-5 stroke-[2.5]" />
              <span>Nueva Inspección</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4 ACCIONES RÁPIDAS GIGANTES (GRANDES TARJETAS TÁCTILES)      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Botón 1: Inspecciones */}
        <Link
          to="/inspecciones/nueva"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-yellow-400 hover:shadow-sm transition-all flex flex-col justify-between group touch-active"
        >
          <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-slate-950 flex items-center justify-center font-bold shadow-xs mb-3 group-hover:scale-105 transition-transform">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 group-hover:text-yellow-600 transition-colors">
              Hacer Inspección
            </p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              Evaluar sede o equipo
            </p>
          </div>
        </Link>

        {/* Botón 2: Planes de Acción */}
        <Link
          to="/plan-accion"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-400 hover:shadow-sm transition-all flex flex-col justify-between group touch-active relative"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs mb-3 group-hover:scale-105 transition-transform">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                Planes de Acción
              </p>
              {planStats.pendientes > 0 && (
                <span className="text-[10px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-full">
                  {planStats.pendientes}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              Hallazgos por corregir
            </p>
          </div>
        </Link>

        {/* Botón 3: Dotación EPP */}
        <Link
          to="/dotacion"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between group touch-active"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs mb-3 group-hover:scale-105 transition-transform">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
              Dotación & EPP
            </p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              Uniformes y protección
            </p>
          </div>
        </Link>

        {/* Botón 4: Trabajadores */}
        <Link
          to="/trabajadores"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-teal-400 hover:shadow-sm transition-all flex flex-col justify-between group touch-active"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs mb-3 group-hover:scale-105 transition-transform">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 group-hover:text-teal-600 transition-colors">
              Trabajadores
            </p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              Nómina de todo el grupo
            </p>
          </div>
        </Link>
      </div>

      {/* ============================================================ */}
      {/* TARJETA DE CUMPLIMIENTO GLOBAL SIMPLIFICADA                  */}
      {/* ============================================================ */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Nivel de Cumplimiento Global</span>
            </h2>
            <p className="text-xs text-slate-500">
              Evaluación ponderada oficial de todas las inspecciones activas del Grupo Duncan
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {conformePct}%
            </span>
            <span className="text-xs font-bold text-slate-400">
              Meta: 85%
            </span>
          </div>
        </div>

        {/* Barra segmentada clara */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div 
            style={{ width: `${totalInsps > 0 ? (cCount / totalInsps) * 100 : 0}%` }}
            className="bg-emerald-500 transition-all duration-500" 
            title={`Conformes: ${cCount}`}
          />
          <div 
            style={{ width: `${totalInsps > 0 ? (omCount / totalInsps) * 100 : 0}%` }}
            className="bg-amber-400 transition-all duration-500" 
            title={`Oportunidades de Mejora: ${omCount}`}
          />
          <div 
            style={{ width: `${totalInsps > 0 ? (ncCount / totalInsps) * 100 : 0}%` }}
            className="bg-red-500 transition-all duration-500" 
            title={`No Conformes: ${ncCount}`}
          />
        </div>

        {/* 3 Métricas claras en lenguaje sencillo */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
            <p className="text-xs font-bold text-emerald-800">Conformes</p>
            <p className="text-lg font-black text-emerald-700">{cCount}</p>
          </div>

          <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-xs font-bold text-amber-800">Por Mejorar</p>
            <p className="text-lg font-black text-amber-700">{omCount}</p>
          </div>

          <div className="p-2 rounded-xl bg-red-50 border border-red-100">
            <p className="text-xs font-bold text-red-800">No Conformes</p>
            <p className="text-lg font-black text-red-700">{ncCount}</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FEEDS DE INSPECCIONES Y PLANES (ESTILO CHAT / TELEGRAM)      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inspecciones Recientes */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-base">Inspecciones Recientes</h2>
            </div>
            <Link 
              to="/inspecciones" 
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 active:scale-95"
            >
              Ver todas <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {recentInsps.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ClipboardCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Sin inspecciones registradas</p>
                <Link to="/inspecciones/nueva" className="text-xs text-blue-600 font-bold hover:underline mt-1 inline-block">
                  Crear la primera inspección
                </Link>
              </div>
            ) : recentInsps.map((insp: any) => (
              <Link 
                key={insp._id} 
                to={`/inspecciones/${insp._id}`}
                className="flex items-center gap-3 p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors touch-active group"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  {insp.tipoCodigo || 'INSP'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {insp.establecimientoNombre}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {insp.tipoNombre} · {formatDate(insp.fecha)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full', getEstadoBadgeClass(insp.estado))}>
                    {insp.estado === 'completada' ? 'Completada' : 'En Progreso'}
                  </span>
                  {insp.resultado && (
                    <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full', getResultadoBadgeClass(insp.resultado))}>
                      {insp.resultado}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Acciones y Hallazgos Pendientes */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-600" />
              <h2 className="font-bold text-slate-900 text-base">Tareas Pendientes (Planes)</h2>
            </div>
            <Link 
              to="/plan-accion" 
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 active:scale-95"
            >
              Ver plan <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {urgentActions.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-30 text-emerald-500" />
                <p className="text-sm font-bold text-slate-700">¡Al día! Sin acciones urgentes pendientes</p>
                <p className="text-xs text-slate-400 mt-0.5">Todas las no conformidades han sido atendidas.</p>
              </div>
            ) : urgentActions.map((action: any) => (
              <Link 
                key={action.id || action._id} 
                to="/plan-accion"
                className="flex items-start gap-3 p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors touch-active group"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                    {action.hallazgo || action.item}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {action.establecimientoNombre || 'Sede Duncan'}
                  </p>
                  {action.fechaLimite && (
                    <p className="text-[11px] text-red-600 font-semibold mt-0.5">
                      Vence: {formatDate(action.fechaLimite)}
                    </p>
                  )}
                </div>
                <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 uppercase', getPrioridadColor(action.prioridad))}>
                  {action.prioridad || 'Media'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
