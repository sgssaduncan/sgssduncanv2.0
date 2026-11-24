import CatalogoCriteriosModal from '../components/CatalogoCriteriosModal';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSGD } from '../contexts/SGDContext';
import {
  ClipboardCheck, Plus, BookOpen, Search, Filter, Trash2, Eye,
  CheckCircle2, Clock, FileText, AlertTriangle, ChevronDown, ChevronUp,
  X, Sparkles, Mail
} from 'lucide-react';
import { cn, formatDate, getEstadoBadgeClass, getResultadoBadgeClass } from '../lib/utils';
import toast from 'react-hot-toast';
import ActionPlanDocument from '../components/ActionPlanDocument';

function isInspectionComplete(insp: any): boolean {
  if (!insp) return false;
  const st = String(insp.estado || '').toLowerCase().trim();
  if (st === 'completada' || st === 'completado') return true;
  if (insp.resultado && ['C', 'NC', 'OM', 'NA'].includes(String(insp.resultado).toUpperCase())) {
    return true;
  }
  if (insp.puntuacion !== undefined && insp.puntuacion !== null && insp.puntuacion !== '' && !isNaN(Number(insp.puntuacion))) {
    try {
      const resp = insp.respuestas || (typeof insp.formResponses === 'string' && insp.formResponses ? JSON.parse(insp.formResponses) : insp.formResponses);
      if (resp && typeof resp === 'object' && Object.keys(resp).length > 0) {
        return true;
      }
    } catch {}
  }
  return false;
}

// Icono y color temático según el tipo de inspección
function getTipoVisual(codigo?: string, nombre?: string) {
  const c = (codigo || '').toUpperCase();
  const n = (nombre || '').toLowerCase();

  if (c === 'DD' || n.includes('distribuidora')) return { badge: 'DD', bg: 'bg-blue-600', text: 'text-blue-600', lightBg: 'bg-blue-50' };
  if (c === 'SC' || n.includes('servicentro')) return { badge: 'SC', bg: 'bg-amber-600', text: 'text-amber-600', lightBg: 'bg-amber-50' };
  if (c === 'EXT' || n.includes('extintor')) return { badge: 'EXT', bg: 'bg-red-600', text: 'text-red-600', lightBg: 'bg-red-50' };
  if (c === 'MTCG' || n.includes('montacarga')) return { badge: 'MC', bg: 'bg-emerald-600', text: 'text-emerald-600', lightBg: 'bg-emerald-50' };
  if (c === 'OL' || n.includes('limpieza')) return { badge: 'OL', bg: 'bg-sky-600', text: 'text-sky-600', lightBg: 'bg-sky-50' };
  if (c === 'HEQ' || n.includes('herramienta')) return { badge: 'HE', bg: 'bg-violet-600', text: 'text-violet-600', lightBg: 'bg-violet-50' };
  return { badge: c.slice(0, 3) || 'GEN', bg: 'bg-slate-700', text: 'text-slate-700', lightBg: 'bg-slate-100' };
}

export default function InspeccionesPage() {
  const { inspecciones, tiposInspeccion, deleteInspeccion } = useSGD();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<'todos' | 'C' | 'NC' | 'OM' | 'en_progreso'>('todos');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [showCriteriosModal, setShowCriteriosModal] = useState(false);
  const [selectedInspectionForPlan, setSelectedInspectionForPlan] = useState<any | null>(null);

  // Conteo rápido para las píldoras
  const counts = {
    todos: inspecciones.length,
    C: inspecciones.filter(i => i.resultado === 'C').length,
    NC: inspecciones.filter(i => i.resultado === 'NC').length,
    OM: inspecciones.filter(i => i.resultado === 'OM').length,
    en_progreso: inspecciones.filter(i => !isInspectionComplete(i)).length
  };

  const filtered = inspecciones.filter(insp => {
    const isCompleted = isInspectionComplete(insp);
    
    // Búsqueda en texto
    const matchSearch = !search ||
      insp.establecimientoNombre?.toLowerCase().includes(search.toLowerCase()) ||
      insp.tipoNombre?.toLowerCase().includes(search.toLowerCase()) ||
      insp.inspector?.toLowerCase().includes(search.toLowerCase()) ||
      String(insp.correlativo).includes(search);

    // Filtro rápido tipo WhatsApp
    let matchQuick = true;
    if (quickFilter === 'C') matchQuick = insp.resultado === 'C';
    else if (quickFilter === 'NC') matchQuick = insp.resultado === 'NC';
    else if (quickFilter === 'OM') matchQuick = insp.resultado === 'OM';
    else if (quickFilter === 'en_progreso') matchQuick = !isCompleted;

    // Filtro avanzado opcional
    const matchTipo = filterTipo === 'Todos' || insp.tipoInspeccionId === filterTipo;

    return matchSearch && matchQuick && matchTipo;
  }).reverse();

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar la inspección de ${nombre}? Esta acción no se puede deshacer.`)) return;
    await deleteInspeccion(id);
    toast.success('Inspección eliminada');
  };

  return (
    <div className="space-y-4 fade-in max-w-6xl mx-auto">
      {/* ============================================================ */}
      {/* CABECERA PRINCIPAL                                           */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-yellow-400 text-slate-950 rounded-xl font-bold shadow-xs">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Inspecciones SSA
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {filtered.length} de {inspecciones.length} inspección(es) registrada(s)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCriteriosModal(true)}
            className="btn-secondary flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl touch-active"
            title="Catálogo maestro de criterios y frecuencias SSA"
          >
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span className="truncate">Criterios SSA</span>
          </button>
          
          <Link 
            to="/inspecciones/nueva" 
            className="btn-primary flex-1 sm:flex-initial flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs touch-active bg-yellow-400 hover:bg-yellow-300 text-slate-950 border border-yellow-500/30"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Nueva Inspección</span>
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BUSCADOR Y PÍLDORAS DE FILTRADO (ESTILO WHATSAPP/TELEGRAM)   */}
      {/* ============================================================ */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        {/* Barra de Búsqueda Redonda */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por sede, inspector o correlativo..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-100 hover:bg-slate-150 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 rounded-full border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Píldoras Horizontales Táctiles (Filtro con un solo toque) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          <button
            type="button"
            onClick={() => setQuickFilter('todos')}
            className={cn(
              'filter-chip touch-active',
              quickFilter === 'todos' ? 'filter-chip-active' : 'filter-chip-inactive'
            )}
          >
            Todas ({counts.todos})
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter('C')}
            className={cn(
              'filter-chip touch-active',
              quickFilter === 'C' ? 'bg-emerald-600 text-white shadow-xs' : 'filter-chip-inactive'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Conformes ({counts.C})
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter('NC')}
            className={cn(
              'filter-chip touch-active',
              quickFilter === 'NC' ? 'bg-red-600 text-white shadow-xs' : 'filter-chip-inactive'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            No Conformes ({counts.NC})
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter('OM')}
            className={cn(
              'filter-chip touch-active',
              quickFilter === 'OM' ? 'bg-amber-600 text-white shadow-xs' : 'filter-chip-inactive'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Por Mejorar ({counts.OM})
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter('en_progreso')}
            className={cn(
              'filter-chip touch-active',
              quickFilter === 'en_progreso' ? 'bg-blue-600 text-white shadow-xs' : 'filter-chip-inactive'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            En Progreso ({counts.en_progreso})
          </button>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="filter-chip filter-chip-inactive ml-auto text-xs font-semibold text-slate-500 hover:text-slate-800"
            title="Más filtros"
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tipo</span>
            {showAdvancedFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Filtros avanzados colapsables */}
        {showAdvancedFilters && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 animate-in fade-in duration-150">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Tipo de Inspección:</label>
              <select 
                className="select text-xs py-1.5" 
                value={filterTipo} 
                onChange={e => setFilterTipo(e.target.value)}
              >
                <option value="Todos">Todos los tipos de formulario</option>
                {tiposInspeccion.map(t => (
                  <option key={t._id} value={t._id}>{t.codigo} - {t.nombre}</option>
                ))}
              </select>
            </div>
            {filterTipo !== 'Todos' && (
              <button
                type="button"
                onClick={() => setFilterTipo('Todos')}
                className="self-end px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition-colors"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* LISTADO DE INSPECCIONES (ESTILO CHAT / FEED EN MÓVIL)        */}
      {/* ============================================================ */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="card py-16 px-4 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <ClipboardCheck className="h-14 w-14 mx-auto mb-3 opacity-25 text-slate-500" />
            <p className="font-bold text-base text-slate-700">Sin inspecciones encontradas</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search || quickFilter !== 'todos' 
                ? 'Prueba modificando la búsqueda o el filtro seleccionado' 
                : 'Crea una nueva inspección para comenzar el registro'}
            </p>
            <Link 
              to="/inspecciones/nueva" 
              className="btn-primary mt-4 inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
            >
              <Plus className="h-4 w-4" /> Crear Inspección
            </Link>
          </div>
        ) : (
          <>
            {/* VISTA MÓVIL (TARJETAS TÁCTILES ESTILO CHAT FEED) */}
            <div className="md:hidden space-y-2.5">
              {filtered.map(insp => {
                const isCompleted = isInspectionComplete(insp);
                const visual = getTipoVisual(insp.tipoCodigo, insp.tipoNombre);
                const estadoClass = isCompleted ? 'completada' : (insp.estado || 'en_progreso');

                return (
                  <div
                    key={insp._id}
                    className="chat-card p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all"
                  >
                    {/* Fila superior: Avatar + Sede + Puntuación */}
                    <div className="flex items-start gap-3">
                      {/* Avatar circular distintivo */}
                      <div className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs text-white flex-shrink-0 shadow-xs',
                        visual.bg
                      )}>
                        {visual.badge}
                      </div>

                      {/* Información central */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <p className="font-bold text-slate-900 text-sm truncate leading-tight">
                            {insp.establecimientoNombre}
                          </p>
                          <span className="text-[11px] font-mono font-semibold text-slate-400 flex-shrink-0">
                            #{insp.correlativo || '—'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {insp.tipoNombre} · {formatDate(insp.fecha)}
                        </p>

                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          Inspector: <span className="text-slate-600 font-medium">{insp.inspector}</span>
                        </p>
                      </div>
                    </div>

                    {/* Insignias de Resultado & Puntuación */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', getEstadoBadgeClass(estadoClass))}>
                          {isCompleted ? 'Completada' : 'En Progreso'}
                        </span>

                        {insp.resultado && (
                          <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', getResultadoBadgeClass(insp.resultado))}>
                            {insp.resultado} {insp.puntuacion !== undefined && `(${insp.puntuacion}%)`}
                          </span>
                        )}
                      </div>

                      {/* Botones de acción táctiles grandes */}
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/inspecciones/${insp._id}`}
                          className={cn(
                            'flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all touch-active',
                            isCompleted 
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          )}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{isCompleted ? 'Ver Reporte' : 'Ver'}</span>
                        </Link>

                        {isCompleted && (
                          <button
                            type="button"
                            onClick={() => setSelectedInspectionForPlan(insp)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-all touch-active"
                            title="Plan de Acción Oficial (Email/Excel)"
                          >
                            <Mail className="h-3.5 w-3.5 text-amber-700" />
                            <span>Plan Acción</span>
                          </button>
                        )}

                        {!isCompleted && (
                          <Link
                            to={`/inspecciones/${insp._id}/formulario`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs touch-active"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Completar</span>
                          </Link>
                        )}

                        <button
                          onClick={() => handleDelete(insp._id, insp.establecimientoNombre)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors active:scale-95"
                          title="Eliminar inspección"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* VISTA ESCRITORIO (TABLA MODERNA CON ALTURA Y ESPACIO) */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-5 py-3.5"># Correlativo</th>
                    <th className="text-left px-5 py-3.5">Establecimiento</th>
                    <th className="text-left px-5 py-3.5">Tipo</th>
                    <th className="text-left px-5 py-3.5">Fecha</th>
                    <th className="text-left px-5 py-3.5">Inspector</th>
                    <th className="text-left px-5 py-3.5">Estado</th>
                    <th className="text-left px-5 py-3.5">Resultado</th>
                    <th className="text-right px-5 py-3.5">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(insp => {
                    const isCompleted = isInspectionComplete(insp);
                    const visual = getTipoVisual(insp.tipoCodigo, insp.tipoNombre);
                    const estadoClass = isCompleted ? 'completada' : (insp.estado || 'en_progreso');

                    return (
                      <tr key={insp._id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-500">
                          {insp.correlativo || '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-8 h-8 rounded-xl flex items-center justify-center font-black text-[11px] text-white flex-shrink-0',
                              visual.bg
                            )}>
                              {visual.badge}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {insp.establecimientoNombre}
                              </p>
                              <p className="text-xs text-slate-500">{insp.localidadNombre || 'Central'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 font-medium">
                          {insp.tipoNombre}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 text-xs">
                          {formatDate(insp.fecha)}
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 text-xs font-medium">
                          {insp.inspector}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', getEstadoBadgeClass(estadoClass))}>
                            {isCompleted ? 'Completada' : 'En Progreso'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {insp.resultado ? (
                            <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', getResultadoBadgeClass(insp.resultado))}>
                              {insp.resultado} {insp.puntuacion !== undefined && `(${insp.puntuacion}%)`}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link 
                              to={`/inspecciones/${insp._id}`}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                              title={isCompleted ? "Ver reporte" : "Ver detalles"}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>{isCompleted ? 'Reporte' : 'Ver'}</span>
                            </Link>

                            {isCompleted && (
                              <button 
                                type="button"
                                onClick={() => setSelectedInspectionForPlan(insp)}
                                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Plan de Acción Oficial (Email/Excel)"
                              >
                                <Mail className="h-3.5 w-3.5 text-amber-700" />
                                <span className="hidden lg:inline">Plan Acción</span>
                              </button>
                            )}

                            {!isCompleted && (
                              <Link 
                                to={`/inspecciones/${insp._id}/formulario`}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                                title="Completar formulario"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span>Completar</span>
                              </Link>
                            )}

                            <button 
                              onClick={() => handleDelete(insp._id, insp.establecimientoNombre)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ============================================================ */}
      {/* BOTÓN FLOTANTE DE ACCIÓN (FAB) EN MÓVIL ESTILO WHATSAPP      */}
      {/* ============================================================ */}
      <Link
        to="/inspecciones/nueva"
        className="lg:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 flex items-center justify-center shadow-xl ring-4 ring-white active:scale-90 transition-transform touch-active font-black"
        title="Crear nueva inspección"
        aria-label="Nueva Inspección"
      >
        <Plus className="h-7 w-7 stroke-[2.5]" />
      </Link>

      {/* Modal de Catálogo Oficial de Criterios y Frecuencias */}
      <CatalogoCriteriosModal
        isOpen={showCriteriosModal}
        onClose={() => setShowCriteriosModal(false)}
      />

      {/* Modal de Plan de Acción Institucional Oficial */}
      {selectedInspectionForPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in print:p-0 print:bg-white">
          <div className="w-full max-w-5xl my-auto">
            <ActionPlanDocument
              inspeccion={selectedInspectionForPlan}
              onClose={() => setSelectedInspectionForPlan(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
