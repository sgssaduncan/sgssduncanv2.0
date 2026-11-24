import React from 'react';
import { dbService } from '../services/db';
import { 
  Search, 
  Filter, 
  Calendar,
  User as UserIcon,
  AlertCircle,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  ChevronDown,
  X,
  UserPlus,
  Shield,
  Trash2,
  Camera,
  Check,
  History as HistoryIcon,
  MessageSquare,
  ArrowRight,
  FileSpreadsheet,
  FileText,
  Download,
  Building2,
  Factory,
  Layers,
  AlertTriangle,
  Mail,
  Send,
  Eye,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate, formatDateTime } from '../lib/utils';
import { exportActionPlansToExcel, exportActionPlansToCSV } from '../lib/exportUtils';
import type { PlanAccion, EstadoPlanAccion, PrioridadPlanAccion, Empleado, Inspeccion } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import ActionPlanDocument from './ActionPlanDocument';

export default function PlanAccionList() {
  const [planes, setPlanes] = React.useState<PlanAccion[]>([]);
  const [empleados, setEmpleados] = React.useState<Empleado[]>([]);
  const [inspecciones, setInspecciones] = React.useState<Inspeccion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<EstadoPlanAccion | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedEstablecimiento, setSelectedEstablecimiento] = React.useState('Todos');
  const [selectedEmpresa, setSelectedEmpresa] = React.useState('Todos');
  const [selectedTipo, setSelectedTipo] = React.useState<'Todos' | 'NC' | 'OM'>('Todos');
  const [selectedPlan, setSelectedPlan] = React.useState<PlanAccion | null>(null);
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [exportScope, setExportScope] = React.useState<'filtered' | 'all'>('filtered');
  const [includeHistory, setIncludeHistory] = React.useState(true);
  const [selectedInspectionForPlan, setSelectedInspectionForPlan] = React.useState<Inspeccion | null>(null);
  const [showInspectionSelectorModal, setShowInspectionSelectorModal] = React.useState(false);
  const [inspectionSearchQuery, setInspectionSearchQuery] = React.useState('');
  const { profile } = useAuth();

  const loadData = async () => {
    setLoading(true);
    const [planesData, empsData, inspsData] = await Promise.all([
      dbService.getPlanesAccion(),
      dbService.getEmpleados(),
      dbService.getInspecciones()
    ]);
    setPlanes(planesData);
    setEmpleados(empsData);
    setInspecciones(inspsData);
    setLoading(false);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const uniqueEstablecimientos = React.useMemo(() => {
    const set = new Set<string>();
    planes.forEach(p => {
      if (p.establecimientoNombre) set.add(p.establecimientoNombre);
    });
    return Array.from(set).sort();
  }, [planes]);

  const uniqueEmpresas = React.useMemo(() => {
    const set = new Set<string>();
    planes.forEach(p => {
      if (p.empresaNombre) set.add(p.empresaNombre);
    });
    return Array.from(set).sort();
  }, [planes]);

  const handleUpdate = async (id: string, data: Partial<PlanAccion>) => {
    const oldPlan = planes.find(p => p.id === id || p._id === id);
    if (!oldPlan) return;

    // Track history if status changes
    let newHistory = [...(oldPlan.history || [])];
    if (data.estado && data.estado !== oldPlan.estado) {
      newHistory.push({
        status: data.estado,
        updatedBy: profile?.displayName || profile?.email || 'Sistema',
        updatedAt: new Date().toISOString(),
        comment: (data as any).tempComment || `Cambio de estado a ${data.estado}`
      });
      data.history = newHistory;
    }

    await dbService.updatePlanAccion(id, data);
    toast.success('Plan de acción actualizado');
    loadData();
    if (selectedPlan?.id === id || (selectedPlan as any)?._id === id) {
      const updated = await dbService.getPlanesAccion();
      setSelectedPlan(updated.find(p => p.id === id || p._id === id) || null);
    }
  };

  const filtered = React.useMemo(() => {
    return planes.filter(p => {
      const pEstadoNorm = (p.estado || '').toLowerCase().trim();
      const isOverdue = pEstadoNorm !== 'cerrado' && pEstadoNorm !== 'cerrada' && p.fechaLimite && new Date(p.fechaLimite) < new Date();
      
      let matchesTab = false;
      if (activeTab === 'Todos') {
        matchesTab = true;
      } else if (activeTab === 'Pendiente') {
        matchesTab = pEstadoNorm === 'pendiente';
      } else if (activeTab === 'Aprobado') {
        matchesTab = pEstadoNorm === 'aprobado';
      } else if (activeTab === 'En ejecución') {
        matchesTab = pEstadoNorm === 'en ejecución' || pEstadoNorm === 'en_ejecucion' || pEstadoNorm === 'en ejecucion';
      } else if (activeTab === 'Cerrado') {
        matchesTab = pEstadoNorm === 'cerrado' || pEstadoNorm === 'cerrada';
      } else if (activeTab === 'Vencido') {
        matchesTab = pEstadoNorm === 'vencido' || pEstadoNorm === 'vencida' || isOverdue;
      }

      if (!matchesTab) return false;

      // Filtro por Establecimiento
      if (selectedEstablecimiento !== 'Todos') {
        if ((p.establecimientoNombre || '').toLowerCase() !== selectedEstablecimiento.toLowerCase()) {
          return false;
        }
      }

      // Filtro por Empresa
      if (selectedEmpresa !== 'Todos') {
        if ((p.empresaNombre || '').toLowerCase() !== selectedEmpresa.toLowerCase()) {
          return false;
        }
      }

      // Filtro por Tipo de Hallazgo (NC vs OM)
      if (selectedTipo === 'NC') {
        const isNC = p.prioridad === 'Critica' || p.prioridad === 'Inmediato' || (p.hallazgo || '').includes('NO CONFORME') || (p.hallazgo || '').includes('NC');
        if (!isNC) return false;
      } else if (selectedTipo === 'OM') {
        const isOM = p.prioridad === 'Media' || p.prioridad === 'Medio Plazo' || (p.hallazgo || '').includes('OPORTUNIDAD DE MEJORA') || (p.hallazgo || '').includes('OM');
        if (!isOM) return false;
      }

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const resp = empleados.find(e => e.id === p.responsableId);
      return (
        (p.hallazgo || '').toLowerCase().includes(q) ||
        (p.descripcion || '').toLowerCase().includes(q) ||
        (p.establecimientoNombre || '').toLowerCase().includes(q) ||
        (p.empresaNombre || '').toLowerCase().includes(q) ||
        (p.departamento || '').toLowerCase().includes(q) ||
        (p.item || '').toLowerCase().includes(q) ||
        (p.seccion || '').toLowerCase().includes(q) ||
        (p.prioridad || '').toLowerCase().includes(q) ||
        (resp?.nombre || '').toLowerCase().includes(q)
      );
    });
  }, [planes, activeTab, searchQuery, empleados, selectedEstablecimiento, selectedEmpresa, selectedTipo]);

  const handleQuickExport = (format: 'excel' | 'csv', scope: 'filtered' | 'all' = 'filtered') => {
    const targetList = scope === 'filtered' ? filtered : planes;
    if (targetList.length === 0) {
      toast.error('No hay planes de acción en la vista actual para exportar');
      return;
    }

    const prefix = scope === 'filtered' && activeTab !== 'Todos'
      ? `Planes_Accion_${activeTab.replace(/\s+/g, '_')}`
      : 'Planes_Accion_SST';

    try {
      if (format === 'excel') {
        exportActionPlansToExcel(targetList, empleados, inspecciones, {
          includeHistory,
          filenamePrefix: prefix,
          viewFilterName: `${activeTab}${searchQuery ? ` (Búsqueda: "${searchQuery}")` : ''}`
        });
        toast.success(`Exportados ${targetList.length} planes de acción a Excel (.xlsx)`);
      } else {
        exportActionPlansToCSV(targetList, empleados, inspecciones, {
          filenamePrefix: prefix
        });
        toast.success(`Exportados ${targetList.length} planes de acción a CSV (.csv)`);
      }
      setShowExportModal(false);
    } catch (err) {
      console.error('Error exporting action plans:', err);
      toast.error('Error al generar el archivo de exportación');
    }
  };

  const stats = React.useMemo(() => {
    let pendientes = 0;
    let enEjecucion = 0;
    let vencidos = 0;
    let cerrados = 0;
    let ncs = 0;
    let oms = 0;

    planes.forEach(p => {
      const s = (p.estado || '').toLowerCase().trim();
      const isOverdue = s !== 'cerrado' && s !== 'cerrada' && p.fechaLimite && new Date(p.fechaLimite) < new Date();
      if (s === 'pendiente') pendientes++;
      else if (s === 'en ejecución' || s === 'en_ejecucion' || s === 'en ejecucion') enEjecucion++;
      else if (s === 'cerrado' || s === 'cerrada') cerrados++;

      if (s === 'vencido' || s === 'vencida' || isOverdue) vencidos++;

      const isNC = p.prioridad === 'Critica' || p.prioridad === 'Inmediato' || (p.hallazgo || '').includes('NO CONFORME') || (p.hallazgo || '').includes('NC');
      if (isNC) ncs++;
      else oms++;
    });

    return {
      total: planes.length,
      pendientes,
      enEjecucion,
      vencidos,
      completados: cerrados,
      ncs,
      oms
    };
  }, [planes]);

  const inspectionsWithStats = React.useMemo(() => {
    return inspecciones.map(insp => {
      const inspIdStr = String(insp._id || insp.id || insp.correlativo || '');
      const relatedPlanes = planes.filter(p => 
        String(p.inspeccionId) === inspIdStr || 
        (insp.correlativo && String((p as any).inspeccionCorrelativo) === String(insp.correlativo)) ||
        (p.establecimientoNombre && insp.establecimientoNombre && p.establecimientoNombre.toLowerCase() === insp.establecimientoNombre.toLowerCase())
      );
      const ncCount = relatedPlanes.filter(p => p.prioridad === 'Critica' || p.prioridad === 'Inmediato' || (p.hallazgo || '').includes('NO CONFORME') || (p.hallazgo || '').includes('NC')).length;
      const omCount = relatedPlanes.filter(p => p.prioridad === 'Media' || p.prioridad === 'Medio Plazo' || (p.hallazgo || '').includes('OPORTUNIDAD DE MEJORA') || (p.hallazgo || '').includes('OM')).length;

      return {
        inspection: insp,
        totalPlanes: relatedPlanes.length,
        ncCount,
        omCount
      };
    });
  }, [inspecciones, planes]);

  const filteredInspectionsForSelector = React.useMemo(() => {
    if (!inspectionSearchQuery.trim()) return inspectionsWithStats;
    const q = inspectionSearchQuery.toLowerCase();
    return inspectionsWithStats.filter(item => {
      const i = item.inspection;
      return (
        (i.establecimientoNombre || '').toLowerCase().includes(q) ||
        (i.empresaNombre || '').toLowerCase().includes(q) ||
        (i.tipoNombre || '').toLowerCase().includes(q) ||
        (i.inspector || '').toLowerCase().includes(q) ||
        String(i.correlativo || '').includes(q) ||
        (i.referencia || '').toLowerCase().includes(q)
      );
    });
  }, [inspectionsWithStats, inspectionSearchQuery]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
            <Shield className="text-blue-600" />
            Planes de Acción
          </h1>
          <p className="text-sm font-medium text-slate-500 italic">Gestión integral de desviaciones y mejora continua por establecimiento.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowInspectionSelectorModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="Generar o enviar por correo el Plan de Acción Oficial por Inspección (Plantilla Oficial Institucional)"
          >
            <Shield size={16} />
            Plan Oficial por Inspección (Email)
          </button>
          <button
            onClick={() => handleQuickExport('excel', 'filtered')}
            disabled={filtered.length === 0}
            title="Exportar vista actual directamente a Excel (.xlsx)"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet size={16} />
            Exportar Excel ({filtered.length})
          </button>
          <button
            onClick={() => handleQuickExport('csv', 'filtered')}
            disabled={filtered.length === 0}
            title="Exportar vista actual directamente a CSV (.csv)"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 border border-slate-200 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <FileText size={16} className="text-blue-600" />
            CSV ({filtered.length})
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            disabled={planes.length === 0}
            title="Opciones avanzadas de exportación offline"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Summary Chips & Search Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2.5">
          {[
            { label: 'Total', value: stats.total, color: 'bg-white text-slate-700 border-slate-200' },
            { label: 'Pendientes', value: stats.pendientes, color: 'bg-orange-50 text-orange-700 border-orange-200' },
            { label: 'En Ejecución', value: stats.enEjecucion, color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { label: 'Vencidos', value: stats.vencidos, color: 'bg-rose-50 text-rose-700 border-rose-200' },
            { label: 'Cerrados', value: stats.completados, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { label: 'NC (Críticas)', value: stats.ncs, color: 'bg-red-100 text-red-800 border-red-300 font-black' },
            { label: 'OM (Mejoras)', value: stats.oms, color: 'bg-amber-100 text-amber-800 border-amber-300 font-black' },
          ].map(chip => (
            <div key={chip.label} className={cn("px-3.5 py-1.5 rounded-xl border flex items-center gap-2 font-bold text-xs uppercase tracking-wider shadow-sm", chip.color)}>
              <span className="opacity-75">{chip.label}</span>
              <span className="font-extrabold">{chip.value}</span>
            </div>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar criterio, sede, hallazgo..."
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Establishment, Company & Type Filters Toolbar */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 size={13} className="text-blue-600" />
            Establecimiento / Sede Específica
          </label>
          <select
            value={selectedEstablecimiento}
            onChange={(e) => setSelectedEstablecimiento(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100 transition-all cursor-pointer"
          >
            <option value="Todos">Todos los Establecimientos ({uniqueEstablecimientos.length})</option>
            {uniqueEstablecimientos.map(est => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Factory size={13} className="text-indigo-600" />
            Empresa del Grupo Duncan
          </label>
          <select
            value={selectedEmpresa}
            onChange={(e) => setSelectedEmpresa(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100 transition-all cursor-pointer"
          >
            <option value="Todos">Todas las Empresas ({uniqueEmpresas.length})</option>
            {uniqueEmpresas.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Filter size={13} className="text-orange-500" />
            Clasificación del Hallazgo
          </label>
          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value as any)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100 transition-all cursor-pointer"
          >
            <option value="Todos">Todos (NC y Oportunidades de Mejora)</option>
            <option value="NC">Sólo No Conformidades (NC — Crítica / 15 días)</option>
            <option value="OM">Sólo Oportunidades de Mejora (OM — Media / 30 días)</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 md:gap-8 flex-wrap">
        {['Todos', 'Pendiente', 'Aprobado', 'En ejecución', 'Cerrado', 'Vencido'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
              activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
            {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-400">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
             <p className="font-bold uppercase tracking-widest text-[10px]">Cargando Hallazgos...</p>
          </div>
        ) : filtered.map((plan) => (
          <PlanCard 
            key={plan.id} 
            plan={plan} 
            onClick={() => setSelectedPlan(plan)}
            responsable={empleados.find(e => e.id === plan.responsableId)}
          />
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center border-2 border-dashed border-slate-100 rounded-3xl">
            <CheckCircle2 size={40} className="mb-2 text-slate-100" />
            <p className="font-bold uppercase tracking-widest text-[10px]">No hay planes en este estado</p>
          </div>
        )}
      </div>

      {/* Export Options Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight">Exportar Planes de Acción</h3>
                    <p className="text-xs text-slate-400 font-medium">Reporte offline en formato Excel (.xlsx) o CSV (.csv)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alcance de Datos a Exportar</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setExportScope('filtered')}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all",
                        exportScope === 'filtered'
                          ? "border-blue-600 bg-blue-50/60 text-blue-900"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      )}
                    >
                      <div className="text-xs font-black uppercase">Vista Actual ({filtered.length})</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Filtro: {activeTab}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportScope('all')}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all",
                        exportScope === 'all'
                          ? "border-blue-600 bg-blue-50/60 text-blue-900"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      )}
                    >
                      <div className="text-xs font-black uppercase">Todos ({planes.length})</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Base completa SST</div>
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHistory}
                    onChange={(e) => setIncludeHistory(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-800 block">Incluir Hoja de Historial y Resumen KPIs (Excel)</span>
                    <span className="text-[11px] text-slate-500">Agrega pestañas con trazabilidad de cambios de estado e indicadores</span>
                  </div>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleQuickExport('excel', exportScope)}
                    className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <FileSpreadsheet size={18} />
                    Descargar Excel (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickExport('csv', exportScope)}
                    className="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-slate-900/15 transition-all cursor-pointer"
                  >
                    <FileText size={18} />
                    Descargar CSV (.csv)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPlan && (
          <PlanDetailModal 
            plan={selectedPlan} 
            empleados={empleados}
            inspecciones={inspecciones}
            onClose={() => setSelectedPlan(null)}
            onUpdate={handleUpdate}
            onOpenOfficialInspectionPlan={(insp) => setSelectedInspectionForPlan(insp)}
          />
        )}
      </AnimatePresence>

      {/* MODAL SELECTOR DE INSPECCIÓN PARA PLAN OFICIAL */}
      <AnimatePresence>
        {showInspectionSelectorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Shield className="text-blue-600" size={20} />
                    Plan de Acción Oficial por Inspección
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Seleccione un establecimiento para generar el documento oficial (Plantilla Institucional) y enviarlo por correo o WhatsApp.
                  </p>
                </div>
                <button
                  onClick={() => setShowInspectionSelectorModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Buscador */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={inspectionSearchQuery}
                  onChange={(e) => setInspectionSearchQuery(e.target.value)}
                  placeholder="Buscar por sede, tipo o inspector..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100"
                />
              </div>

              {/* Lista de Inspecciones */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 -mr-1">
                {filteredInspectionsForSelector.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    No se encontraron inspecciones con los criterios de búsqueda.
                  </div>
                ) : (
                  filteredInspectionsForSelector.map(({ inspection: insp, totalPlanes, ncCount, omCount }) => {
                    const puntuacion = typeof insp.puntuacion === 'number' ? insp.puntuacion : 92.3;
                    const nivel = puntuacion >= 85 ? 'ALTO' : puntuacion >= 70 ? 'MEDIO' : 'BAJO';

                    return (
                      <div
                        key={insp._id || insp.id}
                        onClick={() => {
                          setSelectedInspectionForPlan(insp);
                          setShowInspectionSelectorModal(false);
                        }}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              INSP-{insp.correlativo || (insp.referencia ? insp.referencia.replace(/^REF-|^INSP-/, '') : '14')}
                            </span>
                            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {insp.establecimientoNombre || 'Distribuidora Valencia'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              ({insp.tipoNombre || 'Distribuidoras'})
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-slate-400" />
                              {formatDate(insp.fecha)}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-slate-700">
                              Cumplimiento: {puntuacion}% ({nivel})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {ncCount > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black border border-red-200">
                              {ncCount} NC
                            </span>
                          )}
                          {omCount > 0 && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black border border-amber-200">
                              {omCount} OM
                            </span>
                          )}
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-blue-600 group-hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Mail size={13} />
                            <span>Generar Plan</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCUMENTO OFICIAL DE PLAN DE ACCIÓN (PLANTILLA INSTITUCIONAL) */}
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

function PlanCard({ plan, onClick, responsable }: { plan: PlanAccion, onClick: () => void, responsable?: Empleado, key?: any, id?: any }) {
  const getPriorityStyle = (p: PrioridadPlanAccion | string) => {
    switch (p) {
      case 'Critica':
      case 'Inmediato':
      case 'Alta': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Corto Plazo': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Media':
      case 'Medio Plazo': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Baja':
      case 'Largo Plazo': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (s: EstadoPlanAccion | string) => {
    const sNorm = (s || '').toLowerCase();
    if (sNorm === 'cerrado' || sNorm === 'cerrada') return <CheckCircle2 size={16} />;
    if (sNorm === 'vencido' || sNorm === 'vencida') return <AlertCircle size={16} />;
    return <Clock size={16} />;
  };

  const pEstadoNorm = (plan.estado || '').toLowerCase();
  const isCerrado = pEstadoNorm === 'cerrado' || pEstadoNorm === 'cerrada';
  const isOverdue = !isCerrado && plan.fechaLimite && new Date(plan.fechaLimite) < new Date();
  const displayStatus = isCerrado ? 'Cerrado' : (isOverdue ? 'Vencido' : (plan.estado || 'Pendiente'));

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col group h-full cursor-pointer relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border", getPriorityStyle(plan.prioridad))}>
            {plan.prioridad === 'Critica' ? 'NC • Crítica (15d)' : plan.prioridad === 'Media' ? 'OM • Mejora (30d)' : plan.prioridad}
          </span>
          {plan.item && (
            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-slate-100 text-slate-700 border border-slate-200">
              Criterio {plan.item}
            </span>
          )}
        </div>
        <div className={cn(
          "flex items-center gap-1.5 font-black text-[9px] uppercase tracking-widest",
          isCerrado ? "text-emerald-600" : (isOverdue ? "text-rose-600 font-extrabold" : (pEstadoNorm === 'en ejecución' || pEstadoNorm === 'en_ejecucion' ? "text-blue-600" : "text-orange-500"))
        )}>
          {getStatusIcon(displayStatus)}
          {displayStatus}
        </div>
      </div>

      {/* Sede / Establecimiento y Empresa badges */}
      <div className="flex flex-col gap-0.5 mb-2.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
        <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-800">
          <Building2 size={13} className="text-blue-600 shrink-0" />
          <span className="truncate">{plan.establecimientoNombre || 'Distribuidora Duncan Valencia'}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
          <span className="truncate">{plan.empresaNombre || 'Distribuidora Duncan, S.A.'}</span>
          {(plan as any).inspeccionCorrelativo && (
            <>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[9px] font-bold">
                INSP-{(plan as any).inspeccionCorrelativo}
              </span>
            </>
          )}
        </div>
      </div>
      
      <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 text-sm">
        {plan.hallazgo}
      </h3>
      {plan.descripcion && (
        <p className="text-xs text-slate-500 mb-3 flex-1 line-clamp-2 font-medium italic">
          "{plan.descripcion}"
        </p>
      )}

      {plan.recomendacion && (
        <div className="text-[10px] text-blue-900 bg-blue-50/70 p-2 rounded-lg border border-blue-100/70 mb-4 line-clamp-2 leading-relaxed">
          <strong className="font-black text-blue-700">Acción Requerida:</strong> {plan.recomendacion}
        </div>
      )}

      <div className="space-y-4 pt-3 border-t border-slate-100 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-600 uppercase shadow-sm">
              {responsable ? responsable.nombre[0] : (plan.responsable ? plan.responsable[0] : '?')}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter truncate w-32">
                {responsable?.nombre || plan.responsable || 'Supervisor SST'}
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{plan.departamento || 'SSA Duncan'}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className={cn(
              "text-[10px] font-black flex items-center gap-1",
              isOverdue ? "text-rose-600 font-extrabold" : "text-slate-800"
            )}>
              <Calendar size={12} className={isOverdue ? "text-rose-600" : "text-blue-500"} />
              {formatDate(plan.fechaLimite)}
            </span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              {isOverdue ? 'Vencido' : 'Límite'}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/20 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500 pointer-events-none"></div>
    </motion.div>
  );
}

interface ModalProps {
  plan: PlanAccion;
  empleados: Empleado[];
  inspecciones?: Inspeccion[];
  onClose: () => void;
  onUpdate: (id: string, data: Partial<PlanAccion>) => Promise<void>;
  onOpenOfficialInspectionPlan?: (inspeccion: Inspeccion) => void;
}

function PlanDetailModal({ plan, empleados, inspecciones = [], onClose, onUpdate, onOpenOfficialInspectionPlan }: ModalProps) {
  const [comment, setComment] = React.useState('');
  const [isClosing, setIsClosing] = React.useState(false);
  const [fotoEvidencia, setFotoEvidencia] = React.useState<string | null>(plan.fotoCierre || null);

  const relatedInspection = React.useMemo(() => {
    if (!plan) return null;
    return inspecciones.find(i => 
      String(i._id) === String(plan.inspeccionId) || 
      String(i.id) === String(plan.inspeccionId) ||
      (i.correlativo && String((plan as any).inspeccionCorrelativo || plan.inspeccionId) === String(i.correlativo)) ||
      (plan.establecimientoNombre && i.establecimientoNombre && plan.establecimientoNombre.toLowerCase() === i.establecimientoNombre.toLowerCase())
    ) || null;
  }, [plan, inspecciones]);

  const handleStatusChange = async (newStatus: EstadoPlanAccion) => {
    if (newStatus === 'Cerrado') {
      setIsClosing(true);
      return;
    }
    await onUpdate(plan.id || (plan as any)._id, { estado: newStatus, tempComment: comment } as any);
    setComment('');
  };

  const handleFinalClose = async () => {
    if (!comment) {
      toast.error('Agregue un comentario de cierre');
      return;
    }
    await onUpdate(plan.id || (plan as any)._id, { 
      estado: 'Cerrado', 
      comentariosCierre: comment,
      fotoCierre: fotoEvidencia || undefined,
      tempComment: `CIERRE: ${comment}`
    } as any);
    onClose();
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setFotoEvidencia(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/40">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[850px]"
      >
        {/* Left Aspect: Details & Actions */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto no-scrollbar space-y-6">
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
               ID: {(plan.id || (plan as any)._id || '001').substring(0, 16)}
            </span>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
              <X size={24} />
            </button>
          </div>

          <div>
             <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-3">{plan.hallazgo}</h2>
             <div className="flex flex-wrap gap-2.5">
                <span className={cn(
                  "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                  plan.prioridad === 'Critica' || plan.prioridad === 'Inmediato' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-blue-50 text-blue-600 border-blue-100"
                )}>
                  Prioridad: {plan.prioridad}
                </span>
                <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                  Estado: {plan.estado}
                </span>
             </div>
          </div>

          {/* Sede, Empresa, Inspección y Criterio */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Establecimiento / Sede</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Building2 size={13} className="text-blue-600" />
                {plan.establecimientoNombre || 'Distribuidora Duncan Valencia'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Empresa del Grupo Duncan</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Factory size={13} className="text-indigo-600" />
                {plan.empresaNombre || 'Distribuidora Duncan, S.A.'}
              </span>
            </div>
            {plan.item && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Criterio Normativo</span>
                <span className="font-bold text-slate-800">Criterio {plan.item} {plan.seccion ? `(${plan.seccion})` : ''}</span>
              </div>
            )}
            {(plan as any).inspeccionCorrelativo && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Inspección de Origen</span>
                <span className="font-bold text-blue-600 font-mono">INSP-{(plan as any).inspeccionCorrelativo}</span>
              </div>
            )}
          </div>

          {relatedInspection && onOpenOfficialInspectionPlan && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenOfficialInspectionPlan(relatedInspection);
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md shadow-blue-200 active:scale-98"
              title="Abrir matriz oficial de plan de acción consolidado para esta inspección"
            >
              <Mail size={16} />
              <span>Abrir Plan de Acción Oficial de esta Inspección (Email)</span>
            </button>
          )}

          {plan.descripcion && (
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Descripción del Criterio Auditado</label>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium leading-relaxed">
                {plan.descripcion}
              </p>
            </div>
          )}

          {plan.recomendacion && (
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Acción Técnica y Base Legal Sugerida</label>
              <p className="text-xs text-blue-900 bg-blue-50/70 p-3 rounded-xl border border-blue-100 font-medium leading-relaxed">
                {plan.recomendacion}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsable Asignado</label>
              <div className="relative group">
                <select 
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none appearance-none focus:ring-2 ring-blue-100 transition-all cursor-pointer"
                  value={plan.responsableId}
                  onChange={(e) => onUpdate(plan.id || (plan as any)._id, { responsableId: e.target.value })}
                >
                  <option value="">Seleccionar Responsable</option>
                  {empleados.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre} ({e.cargo})</option>
                  ))}
                </select>
                <UserPlus size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prioridad del Plan</label>
              <div className="relative">
                <select 
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none appearance-none focus:ring-2 ring-blue-100 transition-all cursor-pointer"
                  value={plan.prioridad}
                  onChange={(e) => onUpdate(plan.id || (plan as any)._id, { prioridad: e.target.value as any })}
                >
                  <option value="Critica">NC • Crítica (15 días)</option>
                  <option value="Media">OM • Media (30 días)</option>
                  <option value="Alta">Alta</option>
                  <option value="Baja">Baja</option>
                  <option value="Inmediato">Inmediato</option>
                  <option value="Corto Plazo">Corto Plazo</option>
                  <option value="Medio Plazo">Medio Plazo</option>
                  <option value="Largo Plazo">Largo Plazo</option>
                </select>
                <Filter size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            </div>
          </div>

          {!isClosing ? (
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cambiar Estado</label>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['Pendiente', 'Aprobado', 'En ejecución', 'Cerrado'] as EstadoPlanAccion[]).map(s => (
                    <button 
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={plan.estado === s}
                      className={cn(
                        "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-[0.95]",
                        plan.estado === s 
                          ? "bg-slate-900 text-white border-transparent shadow-lg" 
                          : "bg-white text-slate-400 border-slate-100 hover:border-blue-200 hover:text-blue-600"
                      )}
                    >
                      {s}
                    </button>
                  ))}
               </div>
            </div>
          ) : (
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 space-y-6"
            >
               <div className="flex items-center justify-between">
                  <h4 className="text-emerald-700 font-black uppercase tracking-widest text-xs">Cerrar Plan de Acción</h4>
                  <button onClick={() => setIsClosing(false)} className="text-emerald-400 hover:text-emerald-600">
                    <X size={18} />
                  </button>
               </div>

               <div className="space-y-4">
                  <textarea 
                    placeholder="Escriba los comentarios finales del cierre..."
                    className="w-full p-4 bg-white border border-emerald-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 ring-emerald-200 h-24 italic"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-emerald-100 rounded-xl text-xs font-black text-emerald-600 cursor-pointer hover:bg-emerald-100/50 transition-colors">
                      <Camera size={16} />
                      {fotoEvidencia ? 'Cambiar Foto' : 'Subir Evidencia'}
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                    </label>
                    {fotoEvidencia && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-emerald-200 shadow-sm relative group">
                        <img src={fotoEvidencia} alt="Evidencia" className="w-full h-full object-cover" />
                        <button onClick={() => setFotoEvidencia(null)} className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Trash2 size={14} className="text-white" />
                        </button>
                      </div>
                    )}
                  </div>
               </div>

               <button 
                onClick={handleFinalClose}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
               >
                 <Check size={18} /> Confirmar Cierre Seguro
               </button>
            </motion.div>
          )}
        </div>

        {/* Right Aspect: History & Info */}
        <div className="w-full md:w-[350px] bg-slate-50 p-8 border-l border-slate-100 flex flex-col gap-8 overflow-y-auto no-scrollbar">
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                <HistoryIcon size={14} /> Historial de Cambios
              </label>
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                {(plan.history || []).map((h, i) => (
                   <div key={i} className="relative pl-8">
                      <div className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white"></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                          {h.status}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold mb-1">
                          {formatDateTime(h.updatedAt)} • {h.updatedBy}
                        </span>
                        {h.comment && (
                          <div className="bg-white p-2 rounded-lg border border-slate-100 text-[9px] text-slate-500 italic">
                            "{h.comment}"
                          </div>
                        )}
                      </div>
                   </div>
                ))}
                {(!plan.history || plan.history.length === 0) && (
                  <p className="text-[10px] text-slate-400 font-bold italic ml-8">No hay registros históricos todavía.</p>
                )}
              </div>
           </div>

           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <ArrowRight size={16} className="text-blue-500" />
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Creado el</label>
                  <span className="text-xs font-bold">{formatDateTime(plan.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <AlertCircle size={16} className="text-orange-500" />
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Vencimiento</label>
                  <span className="text-xs font-bold text-rose-600">{formatDate(plan.fechaLimite)}</span>
                </div>
              </div>
           </div>

           {plan.comentariosCierre && (
             <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 space-y-4">
                <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                   <CheckCircle2 size={14} /> Informe de Cierre
                </label>
                <p className="text-xs text-emerald-700 italic font-medium leading-relaxed">
                   "{plan.comentariosCierre}"
                </p>
                {plan.fotoCierre && (
                  <div className="aspect-video rounded-xl overflow-hidden border-2 border-white shadow-sm cursor-zoom-in">
                     <img src={plan.fotoCierre} alt="Cierre" className="w-full h-full object-cover" />
                  </div>
                )}
             </div>
           )}
        </div>
      </motion.div>
    </div>
  );
}
