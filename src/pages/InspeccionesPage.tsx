import CatalogoCriteriosModal from '../components/CatalogoCriteriosModal';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSGD } from '../contexts/SGDContext';
import {
  ClipboardCheck, Plus, BookOpen, Search, Filter, Trash2, Eye,
  CheckCircle2, Clock, FileText, AlertTriangle, ChevronDown
} from 'lucide-react';
import { cn, formatDate, getEstadoBadgeClass, getResultadoBadgeClass } from '../lib/utils';
import toast from 'react-hot-toast';

const ESTADOS = ['Todos', 'en_progreso', 'completada', 'borrador'];
const RESULTADOS = ['Todos', 'C', 'NC', 'OM'];

export default function InspeccionesPage() {
  const { inspecciones, tiposInspeccion, establecimientos, deleteInspeccion } = useSGD();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterResultado, setFilterResultado] = useState('Todos');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [showCriteriosModal, setShowCriteriosModal] = useState(false);

  const filtered = inspecciones.filter(insp => {
    const matchSearch = !search ||
      insp.establecimientoNombre?.toLowerCase().includes(search.toLowerCase()) ||
      insp.tipoNombre?.toLowerCase().includes(search.toLowerCase()) ||
      insp.inspector?.toLowerCase().includes(search.toLowerCase()) ||
      String(insp.correlativo).includes(search);
    const matchEstado = filterEstado === 'Todos' || insp.estado === filterEstado;
    const matchResultado = filterResultado === 'Todos' || insp.resultado === filterResultado;
    const matchTipo = filterTipo === 'Todos' || insp.tipoInspeccionId === filterTipo;
    return matchSearch && matchEstado && matchResultado && matchTipo;
  }).reverse();

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar la inspección de ${nombre}? Esta acción no se puede deshacer.`)) return;
    await deleteInspeccion(id);
    toast.success('Inspección eliminada');
  };

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <ClipboardCheck className="h-6 w-6 text-blue-600" />
            </div>
            Inspecciones
          </h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} registro(s)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCriteriosModal(true)}
            className="btn-secondary flex items-center gap-2 text-xs font-bold shadow-xs hover:border-blue-400 transition-all"
            title="Abrir catálogo maestro de criterios y frecuencias"
          >
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span>Criterios & Frecuencias SSA</span>
          </button>
          <Link to="/inspecciones/nueva" className="btn-primary flex items-center gap-2 w-fit">
            <Plus className="h-4 w-4" /> Nueva Inspección
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text" placeholder="Buscar por establecimiento, tipo, inspector..."
            className="input pl-9"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="select flex-1 min-w-32" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
            {ESTADOS.map(e => <option key={e} value={e}>{e === 'Todos' ? 'Estado: Todos' : e}</option>)}
          </select>
          <select className="select flex-1 min-w-32" value={filterResultado} onChange={e => setFilterResultado(e.target.value)}>
            {RESULTADOS.map(r => <option key={r} value={r}>{r === 'Todos' ? 'Resultado: Todos' : r}</option>)}
          </select>
          <select className="select flex-1 min-w-40" value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
            <option value="Todos">Tipo: Todos</option>
            {tiposInspeccion.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* Tabla / Lista */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Sin inspecciones</p>
            <p className="text-sm mt-1">Crea la primera inspección para comenzar</p>
            <Link to="/inspecciones/nueva" className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Nueva Inspección
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Establecimiento</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Inspector</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resultado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(insp => (
                    <tr key={insp._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{insp.correlativo || '—'}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{insp.establecimientoNombre}</p>
                          <p className="text-xs text-slate-500">{insp.localidadNombre}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{insp.tipoNombre}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(insp.fecha)}</td>
                      <td className="px-4 py-3 text-slate-600">{insp.inspector}</td>
                      <td className="px-4 py-3">
                        <span className={cn(getEstadoBadgeClass(insp.estado))}>
                          {insp.estado === 'en_progreso' ? 'En Progreso' : insp.estado === 'completada' ? 'Completada' : 'Borrador'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {insp.resultado ? (
                          <span className={cn(getResultadoBadgeClass(insp.resultado))}>{insp.resultado}</span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link to={`/inspecciones/${insp._id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver">
                            <Eye className="h-4 w-4" />
                          </Link>
                          {insp.estado !== 'completada' && (
                            <Link to={`/inspecciones/${insp._id}/formulario`}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Completar">
                              <FileText className="h-4 w-4" />
                            </Link>
                          )}
                          <button onClick={() => handleDelete(insp._id, insp.establecimientoNombre)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filtered.map(insp => (
                <div key={insp._id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{insp.establecimientoNombre}</p>
                      <p className="text-xs text-slate-500">{insp.tipoNombre} · {formatDate(insp.fecha)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn('text-xs', getEstadoBadgeClass(insp.estado))}>
                        {insp.estado === 'en_progreso' ? 'En Progreso' : insp.estado === 'completada' ? 'Completada' : 'Borrador'}
                      </span>
                      {insp.resultado && <span className={cn('text-xs', getResultadoBadgeClass(insp.resultado))}>{insp.resultado}</span>}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">Inspector: {insp.inspector}</p>
                  <div className="flex gap-2">
                    <Link to={`/inspecciones/${insp._id}`} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs">
                      <Eye className="h-3.5 w-3.5" /> Ver
                    </Link>
                    {insp.estado !== 'completada' && (
                      <Link to={`/inspecciones/${insp._id}/formulario`} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs">
                        <FileText className="h-3.5 w-3.5" /> Completar
                      </Link>
                    )}
                    <button onClick={() => handleDelete(insp._id, insp.establecimientoNombre)} className="btn-danger py-1.5 px-3">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {/* Modal de Catálogo Oficial de Criterios y Frecuencias */}
      <CatalogoCriteriosModal
        isOpen={showCriteriosModal}
        onClose={() => setShowCriteriosModal(false)}
      />
    </div>
  );
}
