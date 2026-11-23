import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart2,
  BookOpen,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Layers,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Truck,
  Wrench,
  Building2,
  Store,
  Search,
  Filter,
  TrendingUp,
  Award,
  ShieldCheck,
  FileText,
  Presentation,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  Kanban as KanbanIcon,
  PieChart as ChartIcon,
  Smartphone,
  Eye
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { useSGD } from '../contexts/SGDContext';
import {
  computeConsolidatedMetrics,
  exportConsolidatedExcel,
  exportFullAnalyticalPDF,
  exportPresentationDeckPDF,
  GlobalMetrics,
  PDFReportConfig
} from '../lib/consolidadorLogic';
import toast from 'react-hot-toast';
import CatalogoCriteriosModal from '../components/CatalogoCriteriosModal';

export default function ConsolidadorPage() {
  const { inspecciones, refreshData } = useSGD();

  // Estados principales
  const [selectedPeriod, setSelectedPeriod] = useState<'2026-2027' | '2025-2026' | '2024-2025' | 'ALL'>('2026-2027');
  const [activeTab, setActiveTab] = useState<'resumen' | 'matriz' | 'distribuidoras' | 'servicentros' | 'flota' | 'hallazgos' | 'comparativo'>('resumen');
  
  // Selector de Formato de Visualización: Tablas, Tarjetas, Kanban, Gráficos
  const [displayMode, setDisplayMode] = useState<'tabla' | 'tarjetas' | 'kanban' | 'graficos'>('tabla');

  // Sub-estado para Kanban en Móviles (Conforme | Alerta | Riesgo)
  const [kanbanMobileTab, setKanbanMobileTab] = useState<'conformes' | 'alerta' | 'riesgo'>('conformes');

  // Modo de visualización en móvil para el modo Tabla ('cards' por defecto para ergonomía táctil, o 'table' con scroll)
  const [mobileTableStyle, setMobileTableStyle] = useState<'cards' | 'table'>('cards');

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAmbito, setFilterAmbito] = useState<'TODOS' | 'DISTRIBUIDORA' | 'SERVICENTRO'>('TODOS');
  const [filterRegion, setFilterRegion] = useState<string>('TODAS');
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'CONFORME' | 'ALERTA' | 'RIESGO'>('TODOS');
  const [isSyncing, setIsSyncing] = useState(false);

  // Estados de Modales
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showCriteriosModal, setShowCriteriosModal] = useState(false);
  const [showSlidePlayer, setShowSlidePlayer] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(false);

  // Configuración del Reporte PDF
  const [pdfConfig, setPdfConfig] = useState<PDFReportConfig>({
    incCover: true,
    incKPIs: true,
    incPillars: true,
    incMatrix: true,
    incDistribuidoras: true,
    incServicentros: true,
    incFlota: true,
    incDepartments: true,
    incRanking: true,
    mode: 'single'
  });

  // Métricas Consolidadas reactivas 100% nativas
  const metrics: GlobalMetrics = useMemo(() => {
    return computeConsolidatedMetrics(selectedPeriod, inspecciones);
  }, [selectedPeriod, inspecciones]);

  const completedCount = useMemo(() => {
    return inspecciones.filter(i => i.estado === 'Completada').length;
  }, [inspecciones]);

  // Autoplay para el Visor de Presentaciones
  useEffect(() => {
    let timer: any;
    if (showSlidePlayer && isAutoplay) {
      timer = setInterval(() => {
        setCurrentSlideIndex(prev => (prev >= 6 ? 0 : prev + 1));
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [showSlidePlayer, isAutoplay]);

  // Sincronización en Vivo
  const handleSyncLive = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('Sincronizando inspecciones en vivo con SGD 2.0...');
    try {
      await refreshData();
      toast.dismiss(toastId);
      toast.success(`¡Sincronizadas ${completedCount} inspecciones con éxito!`);
    } catch {
      toast.dismiss(toastId);
      toast.error('Error al sincronizar datos.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Exportar Excel Nativo
  const handleExportExcel = () => {
    try {
      exportConsolidatedExcel(metrics);
      toast.success('Libro Excel oficial (.xlsx) descargado.');
    } catch (err) {
      console.error(err);
      toast.error('Error al exportar Excel.');
    }
  };

  // Ejecutar Emisión de Reporte PDF Completo
  const handleGenerateFullPDF = () => {
    try {
      exportFullAnalyticalPDF(metrics, pdfConfig);
      setShowPDFModal(false);
      toast.success('Reporte PDF Analítico Completo generado exitosamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al generar Reporte PDF.');
    }
  };

  // Generar Presentación Ejecutiva en PDF (16:9 Panorámica)
  const handleGeneratePresentationPDF = () => {
    try {
      exportPresentationDeckPDF(metrics);
      toast.success('Presentación de Diapositivas (PDF 16:9) generada exitosamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al generar la presentación en PDF.');
    }
  };

  // Filas Filtradas para Matriz y Vistas
  const filteredMatrixRows = useMemo(() => {
    const allRows: any[] = [];
    metrics.regions.forEach(reg => {
      if (reg.distribuidora) {
        allRows.push({ ...reg.distribuidora, regionName: reg.name, isDist: true });
      }
      reg.servicentros.forEach(sc => {
        allRows.push({ ...sc, regionName: reg.name, isDist: false });
      });
    });

    return allRows.filter(row => {
      const amb = String(row.ambito || '').toUpperCase();
      const item = String(row.item || '').toUpperCase();
      const reg = String(row.regionName || '').toUpperCase();
      const q = searchQuery.toUpperCase();

      // Filtro de Texto
      if (q && !item.includes(q) && !reg.includes(q)) return false;

      // Filtro de Ámbito
      if (filterAmbito === 'DISTRIBUIDORA' && !row.isDist) return false;
      if (filterAmbito === 'SERVICENTRO' && row.isDist) return false;

      // Filtro de Región
      if (filterRegion !== 'TODAS' && row.regionName !== filterRegion) return false;

      // Filtro de Estatus
      const ef = row.ef ?? 0;
      if (filterStatus === 'CONFORME' && ef < 80) return false;
      if (filterStatus === 'ALERTA' && (ef < 70 || ef >= 80)) return false;
      if (filterStatus === 'RIESGO' && ef >= 70) return false;

      return true;
    });
  }, [metrics, searchQuery, filterAmbito, filterRegion, filterStatus]);

  // Agrupación Kanban
  const kanbanColumns = useMemo(() => {
    const conformes = filteredMatrixRows.filter(r => (r.ef ?? 0) >= 80);
    const alerta = filteredMatrixRows.filter(r => (r.ef ?? 0) >= 70 && (r.ef ?? 0) < 80);
    const riesgo = filteredMatrixRows.filter(r => (r.ef ?? 0) < 70);
    return { conformes, alerta, riesgo };
  }, [filteredMatrixRows]);

  // Datos para gráficos de barras
  const chartRegionsData = useMemo(() => {
    return metrics.regions.map(r => ({
      name: r.name.length > 8 ? r.name.slice(0, 7) + '…' : r.name,
      fullName: r.name,
      Puntaje: r.promReg,
      Ronda1: r.ronda1,
      Ronda2: r.ronda2
    }));
  }, [metrics.regions]);

  return (
    <div className="space-y-4 sm:space-y-5 fade-in pb-12 sm:pb-6">
      {/* =========================================================================
          ENCABEZADO PRINCIPAL NATIVO Y BARRA DE HERRAMIENTAS CORPORATIVAS
          ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-3.5 sm:space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 sm:p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400 shadow-inner shrink-0">
                <BarChart2 size={24} className="sm:w-[26px] sm:h-[26px]" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight uppercase flex flex-wrap items-center gap-2">
                  <span>Reportes Consolidados</span>
                  <span className="text-[10px] sm:text-xs bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md shadow-xs">
                    SSA Duncan
                  </span>
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                  Matriz Integral 70 Sedes • Indicadores • Tablas • Tarjetas • Kanban • Gráficos • PDF y Presentaciones
                </p>
              </div>
            </div>

            {/* Badges de Cobertura y Normativa Oficial */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-0.5 text-[10px] sm:text-[11px] font-bold">
              <span className="bg-slate-950 px-2 py-0.5 rounded border border-amber-400/30 text-amber-300">
                Período: {selectedPeriod}
              </span>
              <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300 hidden xs:inline">
                LOPCYMAT Art. 62
              </span>
              <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300 hidden sm:inline">
                INPSASEL NT-03-2016
              </span>
              <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300 hidden md:inline">
                COVENIN 2260
              </span>
              <span className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                <CheckCircle2 size={11} className="text-emerald-400" />
                {completedCount} en Vivo
              </span>
            </div>
          </div>

          {/* Barra de Herramientas y Exportaciones Responsiva */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">
            {/* Selector de Período Oficial */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center gap-1 shadow-sm w-full sm:w-auto">
              <Calendar size={14} className="text-amber-400 ml-1.5 shrink-0" />
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value as any)}
                className="bg-transparent text-xs text-white font-bold px-2 py-1.5 focus:outline-none cursor-pointer w-full"
              >
                <option value="2026-2027" className="bg-slate-900 text-amber-400 font-bold">
                  Período 2026-2027 (En vivo SGD)
                </option>
                <option value="2025-2026" className="bg-slate-900 text-white font-medium">
                  Período 2025-2026
                </option>
                <option value="2024-2025" className="bg-slate-900 text-white font-medium">
                  Período 2024-2025 (Histórico)
                </option>
                <option value="ALL" className="bg-slate-900 text-amber-300 font-bold">
                  Comparativo (3 Períodos)
                </option>
              </select>
            </div>

            {/* Grid de Botones Operativos en Móvil (2 Columnas) / Flex en Pantallas Grandes */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              {/* Sincronización en Vivo */}
              <button
                type="button"
                onClick={handleSyncLive}
                disabled={isSyncing}
                className="col-span-2 sm:col-span-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 border border-amber-400/30 text-xs font-bold py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                title="Sincronizar inspecciones con la base de datos"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                <span>Sincronizar en Vivo</span>
              </button>

              {/* Exportar Excel */}
              <button
                type="button"
                onClick={handleExportExcel}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20"
                title="Descargar libro Excel oficial (.xlsx)"
              >
                <FileSpreadsheet size={14} />
                <span>Excel</span>
              </button>

              {/* Botón Modal: Reporte PDF Completo */}
              <button
                type="button"
                onClick={() => setShowPDFModal(true)}
                className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-700/20"
                title="Abrir configuración y emisión del Reporte PDF completo"
              >
                <FileText size={14} />
                <span>Reporte PDF</span>
              </button>

              {/* Botón Presentación PDF (Slides) */}
              <button
                type="button"
                onClick={handleGeneratePresentationPDF}
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                title="Generar y descargar presentación ejecutiva en PDF (16:9)"
              >
                <Presentation size={14} />
                <span className="truncate">Presentación PDF</span>
              </button>

              {/* Ver Diapositivas en Pantalla */}
              <button
                type="button"
                onClick={() => {
                  setCurrentSlideIndex(0);
                  setShowSlidePlayer(true);
                }}
                className="col-span-1 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-700/20"
                title="Proyectar diapositivas en vivo en pantalla completa"
              >
                <Play size={14} />
                <span className="truncate">Diapositivas</span>
              </button>

              {/* Botón Catálogo de Criterios Oficiales */}
              <button
                type="button"
                onClick={() => setShowCriteriosModal(true)}
                className="col-span-2 sm:col-span-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-blue-400 border border-blue-400/30 text-xs font-bold py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                title="Abrir catálogo maestro oficial de criterios y frecuencias SSA"
              >
                <BookOpen size={14} />
                <span className="truncate">Criterios SSA</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BARRA DE PESTAÑAS NATIVAS CON SCROLL TÁCTIL SUAVE
            ========================================================================= */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80 scrollbar-none -mx-1 px-1">
          {[
            { id: 'resumen', label: 'Resumen Ejecutivo', icon: Award },
            { id: 'matriz', label: 'Matriz 70 Sedes', icon: Layers },
            { id: 'distribuidoras', label: 'Distribuidoras (4P)', icon: Building2 },
            { id: 'servicentros', label: 'Servicentros (3P)', icon: Store },
            { id: 'flota', label: 'Flota y Equipos', icon: Truck },
            { id: 'hallazgos', label: 'Panel Hallazgos', icon: Wrench },
            { id: 'comparativo', label: 'Comparativo', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-black transition-all shrink-0 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.02]'
                    : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SELECTOR MULTI-MODO DE VISUALIZACIÓN: TABLAS | TARJETAS | KANBAN | GRÁFICOS
          ========================================================================= */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-md">
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal size={13} className="text-amber-400" />
            Visualización:
          </span>

          {/* Segmented Control de 4 Modos (Adaptado 4 Columnas en Móvil) */}
          <div className="grid grid-cols-4 w-full sm:w-auto bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setDisplayMode('tabla')}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-black transition-all ${
                displayMode === 'tabla'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon size={12} className="shrink-0" />
              <span>Tablas</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode('tarjetas')}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-black transition-all ${
                displayMode === 'tarjetas'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid size={12} className="shrink-0" />
              <span>Tarjetas</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode('kanban')}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-black transition-all ${
                displayMode === 'kanban'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KanbanIcon size={12} className="shrink-0" />
              <span>Kanban</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode('graficos')}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-black transition-all ${
                displayMode === 'graficos'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChartIcon size={12} className="shrink-0" />
              <span>Gráficos</span>
            </button>
          </div>
        </div>

        {/* Búsqueda Rápida Responsiva */}
        <div className="relative w-full sm:w-auto sm:min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar sede o región..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* =========================================================================
          CONTENIDO SEGÚN MODO DE VISUALIZACIÓN SELECCIONADO
          ========================================================================= */}

      {/* VISTA 1: MODO KANBAN CON SOPORTE TÁCTIL Y SUB-PESTAÑAS EN MÓVIL */}
      {displayMode === 'kanban' && (
        <div className="space-y-4">
          {/* Selector de Columnas Exclusivo para Móviles (md:hidden) */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 md:hidden">
            <button
              type="button"
              onClick={() => setKanbanMobileTab('conformes')}
              className={`py-2 px-1 text-center rounded-lg text-[10px] font-black transition-all ${
                kanbanMobileTab === 'conformes'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              Conforme ({kanbanColumns.conformes.length})
            </button>

            <button
              type="button"
              onClick={() => setKanbanMobileTab('alerta')}
              className={`py-2 px-1 text-center rounded-lg text-[10px] font-black transition-all ${
                kanbanMobileTab === 'alerta'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/50 shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              Alerta ({kanbanColumns.alerta.length})
            </button>

            <button
              type="button"
              onClick={() => setKanbanMobileTab('riesgo')}
              className={`py-2 px-1 text-center rounded-lg text-[10px] font-black transition-all ${
                kanbanMobileTab === 'riesgo'
                  ? 'bg-red-950 text-red-300 border border-red-500/50 shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              Riesgo ({kanbanColumns.riesgo.length})
            </button>
          </div>

          {/* Renderizado de Columnas: Filtro en móvil, Triple Columna en Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Columna Conforme */}
            <div className={`bg-slate-900 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3 ${
              kanbanMobileTab !== 'conformes' ? 'hidden md:block' : 'block'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                <h3 className="text-xs font-black text-emerald-400 uppercase flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  Conforme (≥ 80%)
                </h3>
                <span className="bg-emerald-950/80 text-emerald-300 font-mono font-bold text-xs px-2 py-0.5 rounded border border-emerald-500/40">
                  {kanbanColumns.conformes.length} Sedes
                </span>
              </div>
              <div className="space-y-2 max-h-[550px] md:max-h-[680px] overflow-y-auto pr-1">
                {kanbanColumns.conformes.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 sm:p-3 space-y-1.5 hover:border-emerald-500/50 transition-all shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {item.isDist ? <Building2 size={13} className="text-amber-400 shrink-0" /> : <Store size={13} className="text-blue-400 shrink-0" />}
                        <span className="line-clamp-1">{item.item}</span>
                      </h4>
                      <span className="text-xs font-mono font-black text-emerald-400 shrink-0">{item.ef}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span className="truncate">Región {item.regionName}</span>
                      <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800 shrink-0">{item.ambito}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Alerta */}
            <div className={`bg-slate-900 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3 ${
              kanbanMobileTab !== 'alerta' ? 'hidden md:block' : 'block'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                <h3 className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                  <AlertTriangle size={15} />
                  Alerta (70% - 79.9%)
                </h3>
                <span className="bg-amber-950/80 text-amber-300 font-mono font-bold text-xs px-2 py-0.5 rounded border border-amber-500/40">
                  {kanbanColumns.alerta.length} Sedes
                </span>
              </div>
              <div className="space-y-2 max-h-[550px] md:max-h-[680px] overflow-y-auto pr-1">
                {kanbanColumns.alerta.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 sm:p-3 space-y-1.5 hover:border-amber-500/50 transition-all shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {item.isDist ? <Building2 size={13} className="text-amber-400 shrink-0" /> : <Store size={13} className="text-blue-400 shrink-0" />}
                        <span className="line-clamp-1">{item.item}</span>
                      </h4>
                      <span className="text-xs font-mono font-black text-amber-400 shrink-0">{item.ef}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span className="truncate">Región {item.regionName}</span>
                      <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800 shrink-0">{item.ambito}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Riesgo Crítico */}
            <div className={`bg-slate-900 border border-red-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3 ${
              kanbanMobileTab !== 'riesgo' ? 'hidden md:block' : 'block'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-red-500/20">
                <h3 className="text-xs font-black text-red-400 uppercase flex items-center gap-1.5">
                  <ShieldAlert size={15} />
                  Riesgo Crítico (&lt; 70%)
                </h3>
                <span className="bg-red-950/80 text-red-300 font-mono font-bold text-xs px-2 py-0.5 rounded border border-red-500/40">
                  {kanbanColumns.riesgo.length} Sedes
                </span>
              </div>
              <div className="space-y-2 max-h-[550px] md:max-h-[680px] overflow-y-auto pr-1">
                {kanbanColumns.riesgo.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 sm:p-3 space-y-1.5 hover:border-red-500/50 transition-all shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {item.isDist ? <Building2 size={13} className="text-amber-400 shrink-0" /> : <Store size={13} className="text-blue-400 shrink-0" />}
                        <span className="line-clamp-1">{item.item}</span>
                      </h4>
                      <span className="text-xs font-mono font-black text-red-400 shrink-0">{item.ef}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span className="truncate">Región {item.regionName}</span>
                      <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800 shrink-0">{item.ambito}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: MODO TARJETAS (GRID DE SEDES CON RESPONSIVIDAD TOTAL) */}
      {displayMode === 'tarjetas' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredMatrixRows.map((item, idx) => {
            const ef = item.ef ?? 0;
            const isConforme = ef >= 80;
            const isAlerta = ef >= 70 && ef < 80;

            return (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 hover:border-amber-400/50 transition-all shadow-lg active:scale-[0.99]">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                      {item.isDist ? <Building2 size={14} className="text-amber-400 shrink-0" /> : <Store size={14} className="text-blue-400 shrink-0" />}
                      <span className="truncate">{item.item}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">Región {item.regionName}</p>
                  </div>
                  <span className={`text-sm sm:text-base font-black font-mono px-2 py-0.5 rounded shrink-0 ${
                    isConforme ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : (isAlerta ? 'bg-amber-950 text-amber-400 border border-amber-500/40' : 'bg-red-950 text-red-400 border border-red-500/40')
                  }`}>
                    {ef}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1 border-t border-slate-800">
                  <div className="bg-slate-950 p-1.5 sm:p-2 rounded-lg">
                    <span className="text-slate-500 block">Ronda 1</span>
                    <span className="font-bold text-slate-300">{item.ronda1 ? `${item.ronda1}%` : '—'}</span>
                  </div>
                  <div className="bg-slate-950 p-1.5 sm:p-2 rounded-lg">
                    <span className="text-slate-500 block">Ronda 2</span>
                    <span className="font-bold text-slate-300">{item.ronda2 ? `${item.ronda2}%` : '—'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800 uppercase font-bold">
                    {item.ambito}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                    isConforme ? 'text-emerald-400' : (isAlerta ? 'text-amber-400' : 'text-red-400')
                  }`}>
                    {isConforme ? 'Conforme' : (isAlerta ? 'Alerta' : 'Riesgo')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VISTA 3: MODO GRÁFICOS (ADAPTACIÓN CON RECHARTS OPTIMIZADO PARA MÓVIL) */}
      {displayMode === 'graficos' && (
        <div className="space-y-4 sm:space-y-5">
          {/* Gráfico 1: Puntajes por Región */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-white uppercase flex items-center gap-2">
              <BarChart2 size={16} className="text-amber-400 shrink-0" />
              Puntaje Consolidado de Cumplimiento por Región (%)
            </h3>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRegionsData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-35} textAnchor="end" />
                  <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Puntaje" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Puntaje (%)" />
                  <Bar dataKey="Ronda1" fill="#3b82f6" radius={[4, 4, 0, 0]} name="R1 (%)" />
                  <Bar dataKey="Ronda2" fill="#10b981" radius={[4, 4, 0, 0]} name="R2 (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2: Desglose de los 4 Pilares y Comparativo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-white uppercase flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-400 shrink-0" />
                Desempeño de los 4 Pilares Normativos
              </h3>
              <div className="h-60 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { name: 'Infraestructura', valor: metrics.pillarsAvg.infra, fill: '#f59e0b' },
                      { name: 'Aspectos Legales', valor: metrics.pillarsAvg.legal, fill: '#3b82f6' },
                      { name: 'SSA y Riesgos', valor: metrics.pillarsAvg.ssa, fill: '#10b981' },
                      { name: 'Vehículos / Flota', valor: metrics.pillarsAvg.veh, fill: '#8b5cf6' }
                    ]}
                    margin={{ top: 10, right: 15, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" domain={[50, 100]} stroke="#94a3b8" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                      itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="valor" radius={[0, 4, 4, 0]} name="Cumplimiento (%)">
                      <Cell fill="#f59e0b" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                      <Cell fill="#8b5cf6" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 3: Comparativo Histórico 3 Períodos */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-white uppercase flex items-center gap-2">
                <TrendingUp size={16} className="text-amber-400 shrink-0" />
                Evolución Multianual de Gestión Duncan
              </h3>
              <div className="h-60 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.comparisonData} margin={{ top: 10, right: 15, left: -15, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={[70, 90]} stroke="#94a3b8" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                      itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                    <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={3} name="Puntaje" />
                    <Line type="monotone" dataKey="infra" stroke="#3b82f6" strokeWidth={2} name="Infra" />
                    <Line type="monotone" dataKey="legal" stroke="#10b981" strokeWidth={2} name="Legal" />
                    <Line type="monotone" dataKey="ssa" stroke="#8b5cf6" strokeWidth={2} name="SSA" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 4: MODO TABLAS CON DISEÑO HÍBRIDO (TARJETAS EN MÓVIL | TABLA COMPLETA EN PANTALLAS GRANDES) */}
      {displayMode === 'tabla' && (
        <div className="space-y-4">
          {/* Barra de Alternancia en Móvil para ver como Tarjetas Táctiles o Tabla Ancha */}
          <div className="flex items-center justify-between sm:hidden bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
              <Smartphone size={13} className="text-amber-400" />
              Vista Móvil Optimizada
            </span>
            <button
              type="button"
              onClick={() => setMobileTableStyle(prev => (prev === 'cards' ? 'table' : 'cards'))}
              className="text-[10px] font-black text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1"
            >
              <Eye size={12} />
              <span>{mobileTableStyle === 'cards' ? 'Ver como Tabla Ancha' : 'Ver como Tarjetas'}</span>
            </button>
          </div>

          {/* TAB RESUMEN */}
          {activeTab === 'resumen' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Award size={18} className="text-amber-400 shrink-0" />
                Resultados Globales de Gestión — 11 Regiones Duncan
              </h2>

              {/* Vista Móvil: Tarjetas de Regiones (sm:hidden) */}
              {mobileTableStyle === 'cards' && (
                <div className="space-y-3 sm:hidden">
                  {metrics.regions.map((r, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-white text-xs">
                          <Building2 size={14} className="text-amber-400" />
                          <span>{r.name}</span>
                        </div>
                        <span className="font-mono font-black text-amber-400 text-sm">{r.promReg}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <div>
                          <span className="text-slate-500">Ronda 1: </span>
                          <strong className="text-slate-200">{r.ronda1}%</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Ronda 2: </span>
                          <strong className="text-slate-200">{r.ronda2}%</strong>
                        </div>
                      </div>
                      {/* Desglose de 4 Pilares en móvil */}
                      <div className="grid grid-cols-4 gap-1 text-[9px] text-center font-mono">
                        <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
                          <span className="block text-slate-500 text-[8px]">INFRA</span>
                          <span className="text-slate-300 font-bold">{r.pillars.infra}%</span>
                        </div>
                        <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
                          <span className="block text-slate-500 text-[8px]">LEGAL</span>
                          <span className="text-slate-300 font-bold">{r.pillars.legal}%</span>
                        </div>
                        <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
                          <span className="block text-slate-500 text-[8px]">SSA</span>
                          <span className="text-slate-300 font-bold">{r.pillars.ssa}%</span>
                        </div>
                        <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
                          <span className="block text-slate-500 text-[8px]">FLOTA</span>
                          <span className="text-slate-300 font-bold">{r.pillars.veh}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Vista Tradicional: Tabla Completa con Scroll (Desktop o toggled) */}
              <div className={`overflow-x-auto border border-slate-800 rounded-xl ${
                mobileTableStyle === 'cards' ? 'hidden sm:block' : 'block'
              }`}>
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Región / Localidad</th>
                      <th className="py-2.5 px-3 text-center">Puntaje Final (%)</th>
                      <th className="py-2.5 px-3 text-center">Ronda 1 (%)</th>
                      <th className="py-2.5 px-3 text-center">Ronda 2 (%)</th>
                      <th className="py-2.5 px-3 text-center">Infraestructura</th>
                      <th className="py-2.5 px-3 text-center">Aspectos Legales</th>
                      <th className="py-2.5 px-3 text-center">SSA y Riesgos</th>
                      <th className="py-2.5 px-3 text-center">Vehículos / Flota</th>
                      <th className="py-2.5 px-3 text-right">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium bg-slate-900/60">
                    {metrics.regions.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                          <Building2 size={14} className="text-amber-400" />
                          {r.name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-black text-amber-400 text-sm">{r.promReg}%</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-300">{r.ronda1}%</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-300">{r.ronda2}%</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">{r.pillars.infra}%</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">{r.pillars.legal}%</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">{r.pillars.ssa}%</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">{r.pillars.veh}%</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                            r.promReg >= 80 ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : (r.promReg >= 70 ? 'bg-amber-950/80 border-amber-500/40 text-amber-300' : 'bg-red-950/80 border-red-500/40 text-red-300')
                          }`}>
                            {r.promReg >= 80 ? 'Conforme' : (r.promReg >= 70 ? 'Alerta' : 'Riesgo')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB MATRIZ INTEGRAL */}
          {activeTab === 'matriz' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Layers size={18} className="text-amber-400 shrink-0" />
                  Matriz Integral Consolidada — 70 Sedes
                </h2>
                <span className="text-xs font-bold text-slate-400">Total: {filteredMatrixRows.length}</span>
              </div>

              {/* Vista Móvil: Tarjetas Táctiles para Sedes */}
              {mobileTableStyle === 'cards' && (
                <div className="space-y-2.5 sm:hidden">
                  {filteredMatrixRows.map((row, idx) => {
                    const ef = row.ef ?? (row.ronda2 ?? row.ronda1 ?? 0);
                    const isConforme = ef >= 80;
                    const isAlerta = ef >= 70 && ef < 80;

                    return (
                      <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                              {row.isDist ? <Building2 size={13} className="text-amber-400 shrink-0" /> : <Store size={13} className="text-blue-400 shrink-0" />}
                              <span>{row.item}</span>
                            </h4>
                            <span className="text-[10px] text-slate-400">Región {row.regionName}</span>
                          </div>
                          <span className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                            isConforme ? 'bg-emerald-950 text-emerald-400' : (isAlerta ? 'bg-amber-950 text-amber-400' : 'bg-red-950 text-red-400')
                          }`}>
                            {ef}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800">
                          <span>R1: <strong className="text-white">{row.ronda1 ? `${row.ronda1}%` : '—'}</strong></span>
                          <span>R2: <strong className="text-white">{row.ronda2 ? `${row.ronda2}%` : '—'}</strong></span>
                          <span>Pond: <strong className="text-amber-400">{row.pond ? `${row.pond}%` : '—'}</strong></span>
                          <span className={`font-black ${isConforme ? 'text-emerald-400' : (isAlerta ? 'text-amber-400' : 'text-red-400')}`}>
                            {isConforme ? 'Conforme' : (isAlerta ? 'Alerta' : 'Riesgo')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Vista Tradicional: Tabla con Scroll */}
              <div className={`overflow-x-auto max-h-[600px] border border-slate-800 rounded-xl ${
                mobileTableStyle === 'cards' ? 'hidden sm:block' : 'block'
              }`}>
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead className="sticky top-0 bg-slate-950 z-10 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Establecimiento / Sede</th>
                      <th className="py-2.5 px-3">Ámbito</th>
                      <th className="py-2.5 px-3">Región</th>
                      <th className="py-2.5 px-3 text-center">Ronda 1</th>
                      <th className="py-2.5 px-3 text-center">Ronda 2</th>
                      <th className="py-2.5 px-3 text-center">Puntaje Final</th>
                      <th className="py-2.5 px-3 text-center">Ponderación</th>
                      <th className="py-2.5 px-3 text-right">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium bg-slate-900/60">
                    {filteredMatrixRows.map((row, idx) => {
                      const ef = row.ef ?? (row.ronda2 ?? row.ronda1 ?? 0);
                      const isConforme = ef >= 80;
                      const isAlerta = ef >= 70 && ef < 80;
                      return (
                        <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                            {row.isDist ? <Building2 size={14} className="text-amber-400" /> : <Store size={14} className="text-blue-400" />}
                            <span>{row.item}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                              row.isDist ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30' : 'bg-blue-400/10 text-blue-300 border border-blue-400/30'
                            }`}>
                              {row.ambito}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">{row.regionName}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-300">{row.ronda1 ? `${row.ronda1}%` : '—'}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-300">{row.ronda2 ? `${row.ronda2}%` : '—'}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-black text-white text-sm">{ef ? `${ef}%` : '—'}</td>
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{row.pond ? `${row.pond}%` : '—'}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                              isConforme ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : (isAlerta ? 'bg-amber-950/80 border-amber-500/40 text-amber-300' : 'bg-red-950/80 border-red-500/40 text-red-300')
                            }`}>
                              {isConforme ? 'Conforme' : (isAlerta ? 'Alerta' : 'Riesgo')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB DISTRIBUIDORAS */}
          {activeTab === 'distribuidoras' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Building2 size={18} className="text-amber-400 shrink-0" />
                10 Distribuidoras Oficiales — Desglose de los 4 Pilares
              </h2>

              {/* Vista Móvil: Tarjetas */}
              {mobileTableStyle === 'cards' && (
                <div className="space-y-2.5 sm:hidden">
                  {metrics.distribuidorasList.map((d, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                          <Building2 size={14} className="text-amber-400" />
                          <span>{d.item}</span>
                        </div>
                        <span className="font-mono font-black text-amber-400 text-sm">{d.ef}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400">Región: {d.distribuidora}</span>
                        <span>R1: {d.ronda1}% | R2: {d.ronda2}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Vista Tabla Completa */}
              <div className={`overflow-x-auto border border-slate-800 rounded-xl ${
                mobileTableStyle === 'cards' ? 'hidden sm:block' : 'block'
              }`}>
                <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Distribuidora</th>
                      <th className="py-2.5 px-3">Región</th>
                      <th className="py-2.5 px-3 text-center">Ronda 1</th>
                      <th className="py-2.5 px-3 text-center">Ronda 2</th>
                      <th className="py-2.5 px-3 text-center">Puntaje Final</th>
                      <th className="py-2.5 px-3 text-center">Ponderación</th>
                      <th className="py-2.5 px-3 text-right">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium bg-slate-900/60">
                    {metrics.distribuidorasList.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                          <Building2 size={14} className="text-amber-400" />
                          {d.item}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{d.distribuidora}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-300">{d.ronda1 ? `${d.ronda1}%` : '—'}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-300">{d.ronda2 ? `${d.ronda2}%` : '—'}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-black text-white text-sm">{d.ef ? `${d.ef}%` : '—'}</td>
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{d.pond ? `${d.pond}%` : '—'}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                            (d.ef ?? 0) >= 80 ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                          }`}>
                            {(d.ef ?? 0) >= 80 ? 'Conforme' : 'Alerta'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB SERVICENTROS */}
          {activeTab === 'servicentros' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Store size={18} className="text-amber-400 shrink-0" />
                50 Servicentros Oficiales — Evaluación de 3 Pilares
              </h2>

              {/* Vista Móvil: Tarjetas */}
              {mobileTableStyle === 'cards' && (
                <div className="space-y-2 sm:hidden">
                  {metrics.servicentrosList.map((sc, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Store size={13} className="text-blue-400 shrink-0" />
                            <span>{sc.item}</span>
                          </h4>
                          <span className="text-[10px] text-slate-400">Asig: {sc.distribuidora}</span>
                        </div>
                        <span className="font-mono font-black text-white text-xs">{sc.ef}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded">
                        <span>R1: {sc.ronda1}%</span>
                        <span>R2: {sc.ronda2}%</span>
                        <span className={(sc.ef ?? 0) >= 80 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {(sc.ef ?? 0) >= 80 ? 'Conforme' : 'Alerta'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Vista Tabla Completa */}
              <div className={`overflow-x-auto max-h-[600px] border border-slate-800 rounded-xl ${
                mobileTableStyle === 'cards' ? 'hidden sm:block' : 'block'
              }`}>
                <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                  <thead className="sticky top-0 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Servicentro</th>
                      <th className="py-2.5 px-3">Distribuidora Asignada</th>
                      <th className="py-2.5 px-3 text-center">Ronda 1</th>
                      <th className="py-2.5 px-3 text-center">Ronda 2</th>
                      <th className="py-2.5 px-3 text-center">Puntaje Final</th>
                      <th className="py-2.5 px-3 text-center">Ponderación</th>
                      <th className="py-2.5 px-3 text-right">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium bg-slate-900/60">
                    {metrics.servicentrosList.map((sc, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2 px-3 font-bold text-white flex items-center gap-1.5">
                          <Store size={13} className="text-blue-400" />
                          {sc.item}
                        </td>
                        <td className="py-2 px-3 text-slate-300">{sc.distribuidora}</td>
                        <td className="py-2 px-3 text-center font-mono text-slate-300">{sc.ronda1 ? `${sc.ronda1}%` : '—'}</td>
                        <td className="py-2 px-3 text-center font-mono text-slate-300">{sc.ronda2 ? `${sc.ronda2}%` : '—'}</td>
                        <td className="py-2 px-3 text-center font-mono font-black text-white text-sm">{sc.ef ? `${sc.ef}%` : '—'}</td>
                        <td className="py-2 px-3 text-center text-slate-400 font-mono">{sc.pond ? `${sc.pond}%` : '—'}</td>
                        <td className="py-2 px-3 text-right">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                            (sc.ef ?? 0) >= 80 ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                          }`}>
                            {(sc.ef ?? 0) >= 80 ? 'Conforme' : 'Alerta'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB FLOTA */}
          {activeTab === 'flota' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Truck size={18} className="text-amber-400 shrink-0" />
                Flota Pesada y Equipos Montacargas por Región
              </h2>

              {/* Vista Móvil: Tarjetas */}
              {mobileTableStyle === 'cards' && (
                <div className="space-y-2 sm:hidden">
                  {metrics.regions.map((reg, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{reg.name}</span>
                        <span className="text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded font-black">
                          Certificado
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-mono">
                        <div className="bg-slate-900 p-1.5 rounded">
                          <span className="block text-slate-500 text-[8px]">CARGA</span>
                          <span className="text-purple-400 font-bold">{reg.flota?.ef ?? '80.0'}%</span>
                        </div>
                        <div className="bg-slate-900 p-1.5 rounded">
                          <span className="block text-slate-500 text-[8px]">MONTACARGAS</span>
                          <span className="text-amber-400 font-bold">{reg.montacargas?.ef ?? '85.0'}%</span>
                        </div>
                        <div className="bg-slate-900 p-1.5 rounded">
                          <span className="block text-slate-500 text-[8px]">PILAR 4</span>
                          <span className="text-white font-bold">{reg.pillars.veh}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Vista Tabla Completa */}
              <div className={`overflow-x-auto border border-slate-800 rounded-xl ${
                mobileTableStyle === 'cards' ? 'hidden sm:block' : 'block'
              }`}>
                <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Región / Localidad</th>
                      <th className="py-2.5 px-3 text-center">Vehículos Carga (%)</th>
                      <th className="py-2.5 px-3 text-center">Montacargas (%)</th>
                      <th className="py-2.5 px-3 text-center">Pilar 4 Global</th>
                      <th className="py-2.5 px-3 text-right">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium bg-slate-900/60">
                    {metrics.regions.map((reg, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white">{reg.name}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-purple-400 font-bold">{reg.flota?.ef ?? '80.0'}%</td>
                        <td className="py-2.5 px-3 text-center font-mono text-amber-400 font-bold">{reg.montacargas?.ef ?? '85.0'}%</td>
                        <td className="py-2.5 px-3 text-center font-mono text-white font-black">{reg.pillars.veh}%</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                            Certificado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB HALLAZGOS */}
          {activeTab === 'hallazgos' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Wrench size={18} className="text-amber-400 shrink-0" />
                Matriz de Desviaciones y Planes de Acción
              </h2>

              {/* Vista Móvil: Tarjetas */}
              {mobileTableStyle === 'cards' && (
                <div className="space-y-2.5 sm:hidden">
                  {metrics.departmentStats.map((dept, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                          {dept.nombre}
                        </span>
                        <span className="font-black text-emerald-400 text-xs">{dept.pctCumplimiento}%</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-[10px] text-center">
                        <div className="bg-emerald-950/40 border border-emerald-500/30 p-1 rounded">
                          <span className="block text-[8px] text-slate-400">C</span>
                          <span className="text-emerald-400 font-bold">{dept.c}</span>
                        </div>
                        <div className="bg-amber-950/40 border border-amber-500/30 p-1 rounded">
                          <span className="block text-[8px] text-slate-400">OM</span>
                          <span className="text-amber-400 font-bold">{dept.om}</span>
                        </div>
                        <div className="bg-red-950/40 border border-red-500/30 p-1 rounded">
                          <span className="block text-[8px] text-slate-400">NC</span>
                          <span className="text-red-400 font-bold">{dept.nc}</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-1 rounded">
                          <span className="block text-[8px] text-slate-400">NA</span>
                          <span className="text-slate-400 font-bold">{dept.na}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Vista Tabla Completa */}
              <div className={`overflow-x-auto border border-slate-800 rounded-xl ${
                mobileTableStyle === 'cards' ? 'hidden sm:block' : 'block'
              }`}>
                <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Departamento</th>
                      <th className="py-2.5 px-3 text-center text-emerald-400">Conformes (C)</th>
                      <th className="py-2.5 px-3 text-center text-amber-400">Mejora (OM)</th>
                      <th className="py-2.5 px-3 text-center text-red-400">No Conformes (NC)</th>
                      <th className="py-2.5 px-3 text-center text-slate-400">No Aplica (NA)</th>
                      <th className="py-2.5 px-3 text-center">Total</th>
                      <th className="py-2.5 px-3 text-right">Cumplimiento (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium bg-slate-900/60">
                    {metrics.departmentStats.map((dept, i) => (
                      <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                          {dept.nombre}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-400">{dept.c}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-400">{dept.om}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-red-400">{dept.nc}</td>
                        <td className="py-2.5 px-3 text-center text-slate-400">{dept.na}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-300">{dept.total}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-black px-2 py-0.5 rounded">
                            {dept.pctCumplimiento}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB COMPARATIVO */}
          {activeTab === 'comparativo' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-400 shrink-0" />
                Comparativa Histórica de Gestión (3 Períodos)
              </h2>

              {/* Vista Móvil: Tarjetas */}
              {mobileTableStyle === 'cards' && (
                <div className="space-y-2.5 sm:hidden">
                  {metrics.comparisonData.map((yr, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-white text-xs">{yr.period}</span>
                        <span className="font-mono font-black text-amber-400 text-sm">{yr.score}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span>Ronda 1: <strong>{yr.r1}%</strong></span>
                        <span>Ronda 2: <strong>{yr.r2}%</strong></span>
                        <span>Infra: <strong>{yr.infra}%</strong></span>
                        <span>Legal: <strong>{yr.legal}%</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Vista Tabla Completa */}
              <div className={`overflow-x-auto border border-slate-800 rounded-xl ${
                mobileTableStyle === 'cards' ? 'hidden sm:block' : 'block'
              }`}>
                <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Período de Gestión</th>
                      <th className="py-2.5 px-3 text-center">Puntaje Global (%)</th>
                      <th className="py-2.5 px-3 text-center">Ronda 1</th>
                      <th className="py-2.5 px-3 text-center">Ronda 2</th>
                      <th className="py-2.5 px-3 text-center">Infraestructura</th>
                      <th className="py-2.5 px-3 text-center">Aspectos Legales</th>
                      <th className="py-2.5 px-3 text-center">SSA y Riesgos</th>
                      <th className="py-2.5 px-3 text-center">Vehículos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium bg-slate-900/60">
                    {metrics.comparisonData.map((yr, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white">{yr.period}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-black text-amber-400 text-sm">{yr.score}%</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-300">{yr.r1}%</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-300">{yr.r2}%</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">{yr.infra}%</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">{yr.legal}%</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">{yr.ssa}%</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">{yr.veh}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: CONFIGURACIÓN Y EMISIÓN DE REPORTE PDF COMPLETO (RESPONSIVO)
          ========================================================================= */}
      {showPDFModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                    Emisión de Reporte Analítico PDF
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">Seleccione las secciones a incluir en el informe corporativo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPDFModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <p className="text-[11px] sm:text-xs font-black text-amber-400 uppercase tracking-wide">Secciones a Incluir:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'incCover', label: 'Portada Oficial Duncan con Ficha Técnica' },
                  { key: 'incKPIs', label: 'Resumen Ejecutivo y Métricas Globales' },
                  { key: 'incPillars', label: 'Evaluación de los 4 Pilares Normativos' },
                  { key: 'incMatrix', label: 'Matriz Integral 70 Sedes con Rondas' },
                  { key: 'incDistribuidoras', label: 'Detalle de 10 Distribuidoras (4P)' },
                  { key: 'incServicentros', label: 'Detalle de 50 Servicentros (3P)' },
                  { key: 'incFlota', label: 'Flota Pesada y Equipos Montacargas' },
                  { key: 'incDepartments', label: 'Cumplimiento por Departamento (C/OM/NC/NA)' },
                  { key: 'incRanking', label: 'Ranking de Sedes y Planes de Acción' }
                ].map(sec => (
                  <label key={sec.key} className="flex items-center gap-2.5 bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={(pdfConfig as any)[sec.key]}
                      onChange={e => setPdfConfig({ ...pdfConfig, [sec.key]: e.target.checked })}
                      className="rounded text-amber-400 focus:ring-amber-400 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-300 font-medium text-[11px] sm:text-xs">{sec.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowPDFModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerateFullPDF}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Download size={14} />
                <span>Generar y Descargar Reporte PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VISOR DE DIAPOSITIVAS / PRESENTACIÓN EN VIVO (SLIDES PLAYER RESPONSIVO)
          ========================================================================= */}
      {showSlidePlayer && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in">
          {/* Barra Superior del Visor */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 bg-amber-400 text-slate-950 rounded-xl font-black text-[10px] sm:text-xs shrink-0">
                SLIDE {currentSlideIndex + 1}/7
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-base font-black text-white uppercase truncate">
                  {[
                    'Portada Corporativa Oficial Duncan',
                    'Resumen Ejecutivo y Resultados de Gestión',
                    'Evaluación de los 4 Pilares Normativos SSA',
                    'Ranking y Desempeño de Distribuidoras',
                    'Inspección de Flota Pesada y Montacargas',
                    'Asignación y Cumplimiento por Departamento',
                    'Conclusiones y Compromisos de Mejora Continua'
                  ][currentSlideIndex]}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate">Presentación Oficial SSA • Período {selectedPeriod}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAutoplay(!isAutoplay)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                  isAutoplay ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {isAutoplay ? <Pause size={12} /> : <Play size={12} />}
                <span className="hidden xs:inline">{isAutoplay ? 'Pausar' : 'Auto'}</span>
              </button>
              <button
                type="button"
                onClick={handleGeneratePresentationPDF}
                className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-400/30 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5"
                title="Descargar en PDF 16:9"
              >
                <Download size={12} />
                <span className="hidden sm:inline">Descargar PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSlidePlayer(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Contenido Central de la Diapositiva (Scrolleable en Móvil) */}
          <div className="my-auto py-4 sm:py-6 max-w-5xl mx-auto w-full max-h-[75vh] overflow-y-auto">
            {currentSlideIndex === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-12 text-center space-y-4 sm:space-y-5 shadow-2xl">
                <span className="text-[10px] sm:text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 sm:px-4 py-1.5 rounded-full border border-amber-400/30">
                  Acumuladores Duncan, C.A.
                </span>
                <h1 className="text-2xl sm:text-5xl font-black text-white uppercase tracking-tight">
                  Informe Consolidado Ejecutivo SSA
                </h1>
                <p className="text-xs sm:text-lg text-slate-300 max-w-2xl mx-auto">
                  Matriz Integral 70 Sedes • 10 Distribuidoras • 50 Servicentros • Flota Pesada y Montacargas
                </p>
                <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold text-slate-400">
                  <span>Período: <strong className="text-white">{selectedPeriod}</strong></span>
                  <span>•</span>
                  <span>Puntaje Global: <strong className="text-amber-400">{metrics.globalScore}%</strong></span>
                  <span>•</span>
                  <span>Fecha: <strong className="text-white">{new Date().toLocaleDateString('es-VE')}</strong></span>
                </div>
              </div>
            )}

            {currentSlideIndex === 1 && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-4 sm:space-y-6 shadow-2xl">
                <h2 className="text-lg sm:text-2xl font-black text-white uppercase flex items-center gap-2 sm:gap-3">
                  <Award size={24} className="text-amber-400 shrink-0" />
                  Diagnóstico y Desempeño Nacional
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800">
                    <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-black">Puntaje Global</p>
                    <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{metrics.globalScore}%</p>
                    <p className="text-[10px] sm:text-[11px] text-emerald-400 mt-0.5">Meta: 80.0%</p>
                  </div>
                  <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800">
                    <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-black">R1 vs R2</p>
                    <p className="text-lg sm:text-2xl font-black text-blue-400 mt-1">{metrics.ronda1Avg}% / {metrics.ronda2Avg}%</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Evolución</p>
                  </div>
                  <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800">
                    <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-black">Sedes Conformes</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{metrics.conformesCount} Sedes</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">≥ 80% Cumplimiento</p>
                  </div>
                  <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800">
                    <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-black">Equipos Auditados</p>
                    <p className="text-xl sm:text-2xl font-black text-purple-400 mt-1">{metrics.totalVehiculos + metrics.totalMontacargas}</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Flota y Maquinaria</p>
                  </div>
                </div>
              </div>
            )}

            {currentSlideIndex === 2 && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-3 sm:space-y-4 shadow-2xl">
                <h2 className="text-lg sm:text-2xl font-black text-white uppercase flex items-center gap-2 sm:gap-3">
                  <ShieldCheck size={24} className="text-amber-400 shrink-0" />
                  Evaluación de los 4 Pilares Normativos SSA
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                  {[
                    { name: 'Pilar 1: Infraestructura', val: metrics.pillarsAvg.infra, desc: 'Edificaciones, ventilación, ergonomía e iluminación.' },
                    { name: 'Pilar 2: Aspectos Legales', val: metrics.pillarsAvg.legal, desc: 'Bomberos, RACDA, INPSASEL y libros de actas CSSL.' },
                    { name: 'Pilar 3: SSA y Riesgos', val: metrics.pillarsAvg.ssa, desc: 'Comités de seguridad, delegados, extintores y EPP.' },
                    { name: 'Pilar 4: Vehículos y Flota', val: metrics.pillarsAvg.veh, desc: 'Transporte de carga pesada y equipos montacargas.' }
                  ].map((p, i) => (
                    <div key={i} className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800 space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-white">{p.name}</span>
                        <span className="text-base sm:text-xl font-black text-amber-400">{p.val}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${p.val}%` }} />
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-400">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentSlideIndex === 3 && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-3 sm:space-y-4 shadow-2xl">
                <h2 className="text-lg sm:text-2xl font-black text-white uppercase flex items-center gap-2 sm:gap-3">
                  <Building2 size={24} className="text-amber-400 shrink-0" />
                  Ranking de Distribuidoras
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                  {metrics.regions.map((r, i) => (
                    <div key={i} className="bg-slate-950 p-2.5 sm:p-3 rounded-xl border border-slate-800 text-center space-y-1">
                      <span className="text-[11px] sm:text-xs font-bold text-white block truncate">{r.name}</span>
                      <span className="text-base sm:text-lg font-black text-amber-400 block">{r.promReg}%</span>
                      <span className="text-[10px] text-emerald-400 font-bold">R2: {r.ronda2}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentSlideIndex === 4 && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-3 sm:space-y-4 shadow-2xl">
                <h2 className="text-lg sm:text-2xl font-black text-white uppercase flex items-center gap-2 sm:gap-3">
                  <Truck size={24} className="text-amber-400 shrink-0" />
                  Flota Pesada y Equipos Montacargas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                  <div className="bg-slate-950 p-3.5 sm:p-5 rounded-2xl border border-slate-800 space-y-1.5">
                    <span className="text-xs font-bold text-purple-400 uppercase">Vehículos de Carga Pesada</span>
                    <p className="text-2xl sm:text-3xl font-black text-white">{metrics.totalVehiculos} Unidades</p>
                    <p className="text-[11px] sm:text-xs text-slate-400">Inspección de frenos, luces, neumáticos y extintores a bordo.</p>
                  </div>
                  <div className="bg-slate-950 p-3.5 sm:p-5 rounded-2xl border border-slate-800 space-y-1.5">
                    <span className="text-xs font-bold text-amber-400 uppercase">Equipos Montacargas</span>
                    <p className="text-2xl sm:text-3xl font-black text-white">{metrics.totalMontacargas} Unidades</p>
                    <p className="text-[11px] sm:text-xs text-slate-400">Certificación de operadores, sistemas hidráulicos y alarmas de reversa.</p>
                  </div>
                </div>
              </div>
            )}

            {currentSlideIndex === 5 && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-3 sm:space-y-4 shadow-2xl">
                <h2 className="text-lg sm:text-2xl font-black text-white uppercase flex items-center gap-2 sm:gap-3">
                  <Wrench size={24} className="text-amber-400 shrink-0" />
                  Cumplimiento por Departamento
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {metrics.departmentStats.map((d, i) => (
                    <div key={i} className="bg-slate-950 p-2.5 sm:p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] sm:text-xs font-bold text-white truncate">{d.nombre}</span>
                        <span className="text-xs font-black text-amber-400 shrink-0">{d.pctCumplimiento}%</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400">Conformes: {d.c} • Hallazgos: {d.nc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentSlideIndex === 6 && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-4 shadow-2xl text-left">
                <h2 className="text-lg sm:text-2xl font-black text-white uppercase flex items-center gap-2 sm:gap-3">
                  <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                  Conclusiones y Compromisos
                </h2>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                  <p className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    1. El índice de cumplimiento global nacional alcanza un <strong className="text-amber-400">{metrics.globalScore}%</strong>, superando las metas operativas.
                  </p>
                  <p className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    2. Las 10 Distribuidoras mayoristas consolidan un desempeño óptimo en los Pilares Legales y de Seguridad Laboral.
                  </p>
                  <p className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    3. Continuidad de planes de acción en Servicentros con inspecciones semestrales regulares de seguimiento.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Barra Inferior con Navegación de Diapositivas Táctil */}
          <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-slate-800 max-w-5xl mx-auto w-full gap-2">
            <button
              type="button"
              onClick={() => setCurrentSlideIndex(prev => (prev <= 0 ? 6 : prev - 1))}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              <ChevronLeft size={16} />
              <span>Anterior</span>
            </button>

            {/* Puntos en pantallas medianas / grandes, o indicador compacto en móviles */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-bold text-slate-400 sm:hidden">
                {currentSlideIndex + 1} de 7
              </span>
              <div className="hidden sm:flex items-center gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentSlideIndex === i ? 'bg-amber-400 scale-125' : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    title={`Ir a lámina ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentSlideIndex(prev => (prev >= 6 ? 0 : prev + 1))}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all"
            >
              <span>Siguiente</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      {/* Modal: Catálogo Maestro de Criterios SSA */}
      <CatalogoCriteriosModal
        isOpen={showCriteriosModal}
        onClose={() => setShowCriteriosModal(false)}
      />
    </div>
  );
}
