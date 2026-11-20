import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSGD } from '../contexts/SGDContext';
import { Target, Search, Filter, CheckCircle, Clock, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { cn, formatDate, getEstadoBadgeClass, getPrioridadColor } from '../lib/utils';
import toast from 'react-hot-toast';

const ESTADOS = ['Todos', 'pendiente', 'en_ejecucion', 'cerrada', 'vencida'];
const PRIORIDADES = ['Todos', 'Critica', 'Alta', 'Media', 'Baja'];

export default function PlanAccionPage() {
  const { planAccion, updatePlanAccion } = useSGD();
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterPrioridad, setFilterPrioridad] = useState('Todos');

  const filtered = planAccion.filter(p => {
    const matchSearch = !search ||
      p.hallazgo?.toLowerCase().includes(search.toLowerCase()) ||
      p.establecimientoNombre?.toLowerCase().includes(search.toLowerCase()) ||
      p.responsable?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === 'Todos' || p.estado === filterEstado;
    const matchPrioridad = filterPrioridad === 'Todos' || p.prioridad === filterPrioridad;
    return matchSearch && matchEstado && matchPrioridad;
  }).reverse();

  const handleUpdateEstado = async (id: string, nuevoEstado: string) => {
    await updatePlanAccion({ id, estado: nuevoEstado });
    toast.success('Estado actualizado');
  };

  const estadoLabel: Record<string, string> = {
    pendiente: 'Pendiente', en_ejecucion: 'En Ejecución', cerrada: 'Cerrada', vencida: 'Vencida'
  };

  return (
    <div className="space-y-5 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Target className="h-6 w-6 text-amber-600" />
            </div>
            Plan de Acción
          </h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} acción(es)</p>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pendientes', count: planAccion.filter(p => p.estado === 'pendiente').length, color: 'text-amber-600 bg-amber-50 border-amber-200' },
          { label: 'En Ejecución', count: planAccion.filter(p => p.estado === 'en_ejecucion').length, color: 'text-blue-600 bg-blue-50 border-blue-200' },
          { label: 'Cerradas', count: planAccion.filter(p => p.estado === 'cerrada').length, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { label: 'Vencidas', count: planAccion.filter(p => p.estado === 'vencida').length, color: 'text-red-600 bg-red-50 border-red-200' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`card p-4 border ${color}`}>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Buscar por hallazgo, establecimiento, responsable..."
            className="input pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <select className="select flex-1" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
            {ESTADOS.map(e => <option key={e} value={e}>{e === 'Todos' ? 'Estado: Todos' : estadoLabel[e] || e}</option>)}
          </select>
          <select className="select flex-1" value={filterPrioridad} onChange={e => setFilterPrioridad(e.target.value)}>
            {PRIORIDADES.map(p => <option key={p} value={p}>{p === 'Todos' ? 'Prioridad: Todos' : p}</option>)}
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card py-16 text-center text-slate-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Sin acciones registradas</p>
            <p className="text-sm mt-1">Las acciones se generan automáticamente al completar inspecciones con NC/OM</p>
          </div>
        ) : filtered.map(accion => (
          <div key={accion._id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={cn('badge text-xs', getPrioridadColor(accion.prioridad))}>
                    {accion.prioridad}
                  </span>
                  <span className={cn('text-xs', getEstadoBadgeClass(accion.estado))}>
                    {estadoLabel[accion.estado] || accion.estado}
                  </span>
                  {accion.tipoInspeccionCodigo && (
                    <span className="badge badge-blue text-xs">{accion.tipoInspeccionCodigo}</span>
                  )}
                </div>
                <p className="font-semibold text-slate-900">{accion.hallazgo}</p>
                {accion.descripcion && <p className="text-sm text-slate-600 mt-0.5">{accion.descripcion}</p>}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                  <span>📍 {accion.establecimientoNombre || '—'}</span>
                  <span>👤 {accion.responsable}</span>
                  {accion.fechaLimite && <span>📅 Límite: {formatDate(accion.fechaLimite)}</span>}
                  {accion.fechaDeteccion && <span>🔍 Detectado: {formatDate(accion.fechaDeteccion)}</span>}
                </div>
                {accion.notas && (
                  <p className="text-xs text-slate-400 mt-1 italic">📝 {accion.notas}</p>
                )}
              </div>

              {/* Selector de estado */}
              <div className="flex-shrink-0">
                <select
                  value={accion.estado}
                  onChange={e => handleUpdateEstado(accion._id, e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_ejecucion">En Ejecución</option>
                  <option value="cerrada">Cerrada</option>
                  <option value="vencida">Vencida</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
