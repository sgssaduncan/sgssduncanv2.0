import React from 'react';
import { Link } from 'react-router-dom';
import { useSGD } from '../contexts/SGDContext';
import {
  Shield, ClipboardCheck, Target, CheckCircle2, AlertTriangle,
  TrendingUp, Plus, ArrowRight, Clock, Building2, BarChart3,
  Wifi, WifiOff, RefreshCw, AlertCircle, Package
} from 'lucide-react';
import { cn, formatDate, getEstadoBadgeClass, getResultadoBadgeClass, getPrioridadColor } from '../lib/utils';

export default function DashboardPage() {
  const { stats, planStats, inspecciones, planAccion, isOnline, sheetsUrl, isSyncing, syncNow, pendingSyncCount } = useSGD();

  const recentInsps = inspecciones.slice(-5).reverse();
  const urgentActions = planAccion.filter(p => p.estado === 'pendiente' || p.estado === 'vencida').slice(0, 5);
  
  // Conteo oficial de C, OM, NC y cálculo de tasa ponderada con OM = 0.5 puntos
  const cCount = inspecciones.filter(i => i.resultado === 'C').length || stats.conformes;
  const omCount = inspecciones.filter(i => i.resultado === 'OM').length || ((stats as any).observaciones ?? 0);
  const ncCount = inspecciones.filter(i => i.resultado === 'NC').length || stats.noConformes;
  const totalInsps = inspecciones.length || stats.totalInspecciones;
  const conformePct = totalInsps > 0
    ? Math.round(((cCount + (omCount * 0.5)) / totalInsps) * 100)
    : 0;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/duncan-logo-bw.png" alt="Duncan Logo" className="h-10 w-auto object-contain hidden sm:block" />
          <div className="sm:border-l sm:border-slate-300 sm:pl-3">
            <h1 className="text-2xl font-bold text-slate-900">
              Panel de Control
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Sistema de Gestión de Seguridad, Salud y Ambiente — SG-SSA</p>
          </div>
        </div>
        <Link to="/inspecciones/nueva" className="btn-primary flex items-center gap-2 w-fit">
          <Plus className="h-4 w-4" /> Nueva Inspección
        </Link>
      </div>

      {/* Banner offline / sin configurar */}
      {!sheetsUrl && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <div className="text-sm">
            <span className="font-medium">Modo solo-local.</span> Los datos se guardan en este dispositivo.{' '}
            <Link to="/ajustes" className="underline font-medium hover:text-amber-900">Configura Google Sheets</Link> para sincronizar en la nube.
          </div>
        </div>
      )}

      {/* KPI Grid de Indicadores Oficiales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard label="Total Inspecciones" value={totalInsps} icon={ClipboardCheck} color="blue" />
        <StatCard label="Conformes (C)" value={cCount} icon={CheckCircle2} color="green" />
        <StatCard label="Oportunidad Mejora (OM)" value={`${omCount} (+0.5)`} icon={AlertTriangle} color="amber" />
        <StatCard label="No Conformes (NC)" value={ncCount} icon={AlertCircle} color="red" />
        <StatCard label="Cumplimiento Global" value={`${conformePct}%`} icon={TrendingUp} color="blue" />
      </div>

      {/* Plan de Acción Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{planStats.total}</p>
          <p className="text-xs text-slate-500 mt-1">Total Plan Acción</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{planStats.pendientes}</p>
          <p className="text-xs text-slate-500 mt-1">Pendientes</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{planStats.enEjecucion}</p>
          <p className="text-xs text-slate-500 mt-1">En Ejecución</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{planStats.cerradas}</p>
          <p className="text-xs text-slate-500 mt-1">Cerradas</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{planStats.vencidas}</p>
          <p className="text-xs text-slate-500 mt-1">Vencidas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inspecciones Recientes */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" /> Inspecciones Recientes
            </h2>
            <Link to="/inspecciones" className="text-xs text-blue-600 hover:text-blue-500 flex items-center gap-1 font-medium">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentInsps.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <ClipboardCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sin inspecciones aún</p>
                <Link to="/inspecciones/nueva" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                  Crear la primera
                </Link>
              </div>
            ) : recentInsps.map((insp: any) => (
              <Link key={insp._id} to={`/inspecciones/${insp._id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{insp.establecimientoNombre}</p>
                  <p className="text-xs text-slate-500">{insp.tipoNombre} · {formatDate(insp.fecha)}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getEstadoBadgeClass(insp.estado))}>
                    {insp.estado === 'completada' ? 'Completada' : insp.estado === 'en_progreso' ? 'En Progreso' : 'Borrador'}
                  </span>
                  {insp.resultado && (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-bold', getResultadoBadgeClass(insp.resultado))}>
                      {insp.resultado}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Acciones Urgentes */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-500" /> Acciones Urgentes
            </h2>
            <Link to="/plan-accion" className="text-xs text-blue-600 hover:text-blue-500 flex items-center gap-1 font-medium">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {urgentActions.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">¡Todo al día! Sin acciones urgentes</p>
              </div>
            ) : urgentActions.map((accion: any) => (
              <div key={accion._id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{accion.hallazgo}</p>
                    <p className="text-xs text-slate-500 truncate">{accion.establecimientoNombre}</p>
                  </div>
                  <span className={cn('badge text-xs flex-shrink-0', getPrioridadColor(accion.prioridad))}>
                    {accion.prioridad}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', getEstadoBadgeClass(accion.estado))}>
                    {accion.estado}
                  </span>
                  {accion.fechaLimite && (
                    <span className="text-xs text-slate-400">Límite: {formatDate(accion.fechaLimite)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Links rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/inspecciones/nueva', icon: Plus, label: 'Nueva Inspección', color: 'bg-blue-600 hover:bg-blue-500 text-white' },
          { to: '/dotacion', icon: Package, label: 'Dotación EPP', color: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200' },
          { to: '/reportes', icon: BarChart3, label: 'Reportes', color: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200' },
          { to: '/ajustes', icon: Building2, label: 'Configuración', color: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to} className={cn('flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium shadow-sm transition-colors', color)}>
            <Icon className="h-5 w-5" />
            <span className="text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  const colors: Record<string, string> = {
    blue:  'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    red:   'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
  };
  const textColors: Record<string, string> = {
    blue:  'text-blue-700',
    green: 'text-emerald-700',
    red:   'text-red-700',
    amber: 'text-amber-700',
  };
  return (
    <div className="card p-5">
      <div className={cn('inline-flex p-2 rounded-lg mb-3', colors[color])}>
        <Icon className="h-4 w-4" />
      </div>
      <p className={cn('text-3xl font-bold', textColors[color])}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
