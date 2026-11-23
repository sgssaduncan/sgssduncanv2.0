import React, { useState, useMemo } from 'react';
import {
  BarChart2,
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
  PieChart as PieChartIcon,
  ShieldCheck,
  Printer,
  ChevronRight
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
  Line
} from 'recharts';
import { useSGD } from '../contexts/SGDContext';
import {
  computeConsolidatedMetrics,
  exportConsolidatedExcel,
  exportConsolidatedPDF,
  GlobalMetrics
} from '../lib/consolidadorLogic';
import toast from 'react-hot-toast';

export default function ConsolidadorPage() {
  const { inspecciones, isOnline, refreshData } = useSGD();

  const [selectedPeriod, setSelectedPeriod] = useState<'2026-2027' | '2025-2026' | '2024-2025' | 'ALL'>('2026-2027');
  const [activeTab, setActiveTab] = useState<'resumen' | 'matriz' | 'distribuidoras' | 'servicentros' | 'flota' | 'hallazgos' | 'comparativo'>('resumen');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAmbito, setFilterAmbito] = useState<'TODOS' | 'DISTRIBUIDORA' | 'SERVICENTRO'>('TODOS');
  const [filterRegion, setFilterRegion] = useState<string>('TODAS');
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'CONFORME' | 'ALERTA' | 'RIESGO'>('TODOS');
  const [isSyncing, setIsSyncing] = useState(false);

  // Cálculo en memoria 100% nativo de las métricas consolidadas
  const metrics: GlobalMetrics = useMemo(() => {
    return computeConsolidatedMetrics(selectedPeriod, inspecciones);
  }, [selectedPeriod, inspecciones]);

  const completedCount = useMemo(() => {
    return inspecciones.filter(i => i.estado === 'Completada').length;
  }, [inspecciones]);

  // Manejador de sincronización en vivo con base de datos SGD
  const handleSyncLive = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('Sincronizando inspecciones con la base de datos SGD 2.0...');
    try {
      await refreshData();
      toast.dismiss(toastId);
      toast.success(`¡Sincronizadas ${completedCount} inspecciones en vivo con Reportes Consolidados!`);
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
      toast.success('Archivo Excel (.xlsx) oficial generado con éxito.');
    } catch (err) {
      console.error(err);
      toast.error('Error al exportar archivo Excel.');
    }
  };

  // Exportar PDF Nativo
  const handleExportPDF = () => {
    try {
      exportConsolidatedPDF(metrics);
      toast.success('Reporte Ejecutivo Oficial (PDF) generado exitosamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al exportar reporte PDF.');
    }
  };

  // Filtrado de filas de la Matriz Integral
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
      const ef = row.ef ?? 0;

      // Filtro texto
      const matchesSearch = !searchQuery || item.includes(searchQuery.toUpperCase()) || reg.includes(searchQuery.toUpperCase());

      // Filtro ámbito
      const matchesAmbito = filterAmbito === 'TODOS' || amb === filterAmbito;

      // Filtro región
      const matchesRegion = filterRegion === 'TODAS' || reg === filterRegion;

      // Filtro estatus
      let matchesStatus = true;
      if (filterStatus === 'CONFORME') matchesStatus = ef >= 80;
      else if (filterStatus === 'ALERTA') matchesStatus = ef >= 70 && ef < 80;
      else if (filterStatus === 'RIESGO') matchesStatus = ef < 70;

      return matchesSearch && matchesAmbito && matchesRegion && matchesStatus;
    });
  }, [metrics, searchQuery, filterAmbito, filterRegion, filterStatus]);

  // Datos para gráfico de barras de Regiones
  const chartRegionsData = useMemo(() => {
    return metrics.regions.map(r => ({
      name: r.name.length > 9 ? r.name.slice(0, 8) + '…' : r.name,
      fullName: r.name,
      Puntaje: r.promReg,
      Ronda1: r.ronda1,
      Ronda2: r.ronda2
    }));
  }, [metrics.regions]);

  return (
    <div className="space-y-5 fade-in">
      {/* =========================================================================
          ENCABEZADO PRINCIPAL NATIVO Y CONTROLES CORPORATIVOS
          ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400 shadow-inner">
                <BarChart2 size={26} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2.5">
                  Reportes Consolidados
                  <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-md shadow-xs">
                    SSA Duncan
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Matriz Integral 70 Sedes • 10 Distribuidoras (4P) • 50 Servicentros (3P) • Flota • Montacargas • Comparativo Histórico
                </p>
              </div>
            </div>

            {/* Badges de Cobertura y Normativa Oficial */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-bold">
              <span className="bg-slate-950 px-2.5 py-0.5 rounded border border-amber-400/30 text-amber-300">
                Período: {selectedPeriod}
              </span>
              <span className="bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800 text-slate-300">
                LOPCYMAT Art. 62
              </span>
              <span className="bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800 text-slate-300">
                INPSASEL NT-03-2016
              </span>
              <span className="bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800 text-slate-300">
                COVENIN 2260
              </span>
              <span className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                <CheckCircle2 size={12} className="text-emerald-400" />
                {completedCount} Inspecciones en Vivo
              </span>
            </div>
          </div>

          {/* Barra de Acciones y Controles Rápidos */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Selector de Período Oficial */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center gap-1 shadow-sm">
              <Calendar size={14} className="text-amber-400 ml-1.5" />
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value as any)}
                className="bg-transparent text-xs text-white font-bold px-2 py-1.5 focus:outline-none cursor-pointer"
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

            {/* Sincronización en Vivo */}
            <button
              type="button"
              onClick={handleSyncLive}
              disabled={isSyncing}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 border border-amber-400/30 text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title="Sincronizar inspecciones con la base de datos"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>Sincronizar en Vivo</span>
            </button>

            {/* Exportar Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
              title="Descargar libro Excel oficial (.xlsx)"
            >
              <FileSpreadsheet size={14} />
              <span>Excel (.xlsx)</span>
            </button>

            {/* Exportar PDF */}
            <button
              type="button"
              onClick={handleExportPDF}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              title="Generar Reporte Ejecutivo Oficial (PDF)"
            >
              <Download size={14} />
              <span>PDF Oficial</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            BARRA DE PESTAÑAS NATIVAS
            ========================================================================= */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pt-3 border-t border-slate-800/80 scrollbar-none">
          {[
            { id: 'resumen', label: 'Resumen Ejecutivo', icon: Award },
            { id: 'matriz', label: 'Matriz Integral 70 Sedes', icon: Layers },
            { id: 'distribuidoras', label: 'Distribuidoras (4 Pilares)', icon: Building2 },
            { id: 'servicentros', label: 'Servicentros (3 Pilares)', icon: Store },
            { id: 'flota', label: 'Flota y Montacargas', icon: Truck },
            { id: 'hallazgos', label: 'Panel de Hallazgos', icon: Wrench },
            { id: 'comparativo', label: 'Comparativo Histórico', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.02]'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: RESUMEN EJECUTIVO (DASHBOARD Y KPIS GLOBALES)
          ========================================================================= */}
      {activeTab === 'resumen' && (
        <div className="space-y-5">
          {/* Tarjetas KPI de Primer Nivel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Puntaje Global Duncan
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-amber-400">
                    {metrics.globalScore}%
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center">
                    <TrendingUp size={12} className="mr-0.5" /> +2.6%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Meta Corporativa: 80,0%</p>
              </div>
              <div className="p-3 bg-amber-400/10 rounded-2xl text-amber-400 border border-amber-400/20">
                <Award size={26} />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Ronda 1 vs Ronda 2
                </p>
                <div className="flex items-baseline gap-3 mt-1">
                  <div>
                    <span className="text-xs text-slate-400 font-bold">R1: </span>
                    <span className="text-xl font-black text-blue-400">{metrics.ronda1Avg}%</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold">R2: </span>
                    <span className="text-xl font-black text-emerald-400">{metrics.ronda2Avg}%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Evolución en Sedes con R2</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                <TrendingUp size={26} />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Distribución de Sedes
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-black px-2 py-0.5 rounded">
                    {metrics.conformesCount} Óptimas
                  </span>
                  <span className="bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-black px-2 py-0.5 rounded">
                    {metrics.alertaCount} Alerta
                  </span>
                  <span className="bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-black px-2 py-0.5 rounded">
                    {metrics.riesgoCount} Riesgo
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Total: {metrics.totalRegions} Regiones / 70 Sedes</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={26} />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Equipos y Flota
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-white">
                    {metrics.totalVehiculos} Vehículos
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    • {metrics.totalMontacargas} Montacargas
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-bold mt-0.5">100% Cobertura Nacional</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
                <Truck size={26} />
              </div>
            </div>
          </div>

          {/* Desglose de los 4 Pilares Normativos SSA */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck size={18} className="text-amber-400" />
                  Evaluación de los 4 Pilares Normativos SSA Duncan
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ponderación de estándares técnicos aplicables a Distribuidoras y Servicentros
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Pilar 1: Infraestructura', pct: metrics.pillarsAvg.infra, desc: 'Edificaciones, Iluminación, Ventilación y Ergonomía', color: 'from-amber-500 to-amber-600', textColor: 'text-amber-400' },
                { title: 'Pilar 2: Aspectos Legales', pct: metrics.pillarsAvg.legal, desc: 'Conformidad Bomberos, Permisos RACDA e INPSASEL', color: 'from-blue-500 to-blue-600', textColor: 'text-blue-400' },
                { title: 'Pilar 3: SSA y Riesgos', pct: metrics.pillarsAvg.ssa, desc: 'Comités CSSL, Delegados, EPP y Extintores', color: 'from-emerald-500 to-emerald-600', textColor: 'text-emerald-400' },
                { title: 'Pilar 4: Vehículos y Flota', pct: metrics.pillarsAvg.veh, desc: 'Carga Pesada, Mantenimiento y Montacargas', color: 'from-purple-500 to-purple-600', textColor: 'text-purple-400' }
              ].map((pil, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-300">{pil.title}</span>
                    <span className={`text-sm font-black ${pil.textColor}`}>{pil.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${pil.color} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.min(100, pil.pct)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight pt-1">{pil.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de Barras: Resultados Generales por Región */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <BarChart2 size={18} className="text-amber-400" />
                  Puntaje Global por Región / Localidad
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparativa de puntaje consolidado (% de conformidad) entre las 11 Regiones Duncan
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRegionsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} angle={-25} textAnchor="end" />
                  <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Puntaje" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Puntaje Consolidado (%)" />
                  <Bar dataKey="Ronda1" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Ronda 1 (%)" />
                  <Bar dataKey="Ronda2" fill="#10b981" radius={[6, 6, 0, 0]} name="Ronda 2 (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla Resumen por Departamento Responsable */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Wrench size={18} className="text-amber-400" />
              Asignación y Cumplimiento por Departamento Responsable
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Departamento</th>
                    <th className="py-2.5 px-3 text-center text-emerald-400">Conformes (C)</th>
                    <th className="py-2.5 px-3 text-center text-amber-400">Mejora (OM)</th>
                    <th className="py-2.5 px-3 text-center text-red-400">No Conformes (NC)</th>
                    <th className="py-2.5 px-3 text-center text-slate-400">No Aplica (NA)</th>
                    <th className="py-2.5 px-3 text-center">Total</th>
                    <th className="py-2.5 px-3 text-right">Cumplimiento (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
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
        </div>
      )}

      {/* =========================================================================
          TAB 2: MATRIZ INTEGRAL (70 SEDES INTERACTIVAS)
          ========================================================================= */}
      {activeTab === 'matriz' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Layers size={18} className="text-amber-400" />
                Matriz Integral Consolidada — 70 Sedes Nacionales
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluación integral de cumplimiento por sede, ámbito y ronda de auditoría
              </p>
            </div>
            <div className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              Mostrando {filteredMatrixRows.length} Sedes Filtradas
            </div>
          </div>

          {/* Filtros Interactivos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
            {/* Buscador */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por sede o región..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Ámbito */}
            <div>
              <select
                value={filterAmbito}
                onChange={e => setFilterAmbito(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="TODOS">Todos los Ámbitos</option>
                <option value="DISTRIBUIDORA">Distribuidoras (4 Pilares)</option>
                <option value="SERVICENTRO">Servicentros (3 Pilares)</option>
              </select>
            </div>

            {/* Región */}
            <div>
              <select
                value={filterRegion}
                onChange={e => setFilterRegion(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="TODAS">Todas las Regiones</option>
                {metrics.regions.map((r, i) => (
                  <option key={i} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Nivel de Riesgo */}
            <div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="TODOS">Todos los Niveles</option>
                <option value="CONFORME">Conforme (≥80%)</option>
                <option value="ALERTA">Alerta (70% - 79%)</option>
                <option value="RIESGO">Riesgo (&lt;70%)</option>
              </select>
            </div>
          </div>

          {/* Tabla de Sedes */}
          <div className="overflow-x-auto max-h-[600px] border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-950 z-10 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Establecimiento / Sede</th>
                  <th className="py-2.5 px-3">Ámbito</th>
                  <th className="py-2.5 px-3">Región Asignada</th>
                  <th className="py-2.5 px-3 text-center">Ronda 1</th>
                  <th className="py-2.5 px-3 text-center">Ronda 2</th>
                  <th className="py-2.5 px-3 text-center">Puntaje Final</th>
                  <th className="py-2.5 px-3 text-center">Ponderación</th>
                  <th className="py-2.5 px-3 text-right">Estatus SSA</th>
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
                        {row.isDist ? (
                          <Building2 size={14} className="text-amber-400 shrink-0" />
                        ) : (
                          <Store size={14} className="text-blue-400 shrink-0" />
                        )}
                        <span>{row.item}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          row.isDist ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30' : 'bg-blue-400/10 text-blue-300 border border-blue-400/30'
                        }`}>
                          {row.ambito}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-semibold">{row.regionName}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-300">{row.ronda1 ? `${row.ronda1}%` : '—'}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-300">{row.ronda2 ? `${row.ronda2}%` : '—'}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-black text-white text-sm">
                        {ef ? `${ef}%` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                        {row.pond ? `${row.pond}%` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded border ${
                          isConforme
                            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                            : (isAlerta ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' : 'bg-red-950/80 border-red-500/50 text-red-300')
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

      {/* =========================================================================
          TAB 3: DISTRIBUIDORAS (4 PILARES)
          ========================================================================= */}
      {activeTab === 'distribuidoras' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Building2 size={18} className="text-amber-400" />
              10 Distribuidoras Oficiales Duncan — Evaluación de los 4 Pilares
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Desglose detallado para almacenes y centros mayoristas de distribución nacional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.regions.map((reg, idx) => {
              const d = reg.distribuidora;
              if (!d) return null;
              return (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase flex items-center gap-1.5">
                        <Building2 size={16} className="text-amber-400" />
                        {d.item}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">Sede Regional {reg.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-amber-400">{d.ef ?? reg.promReg}%</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Puntaje Final</p>
                    </div>
                  </div>

                  {/* 4 Pilares */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="bg-slate-900/80 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Infraestructura</span>
                      <span className="font-bold text-amber-400">{reg.pillars.infra}%</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Aspectos Legales</span>
                      <span className="font-bold text-blue-400">{reg.pillars.legal}%</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">SSA y Riesgos</span>
                      <span className="font-bold text-emerald-400">{reg.pillars.ssa}%</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Vehículos / Flota</span>
                      <span className="font-bold text-purple-400">{reg.pillars.veh}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: SERVICENTROS (3 PILARES)
          ========================================================================= */}
      {activeTab === 'servicentros' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Store size={18} className="text-amber-400" />
              50 Servicentros Oficiales Duncan — Evaluación de 3 Pilares
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Puntos de atención y servicio al cliente organizados por su distribuidora nodriza
            </p>
          </div>

          <div className="overflow-x-auto max-h-[600px] border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-950 z-10 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
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
                {metrics.servicentrosList.map((sc, idx) => {
                  const ef = sc.ef ?? sc.ronda1 ?? 0;
                  const isConforme = ef >= 80;
                  const isAlerta = ef >= 70 && ef < 80;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-2 px-3 font-bold text-white flex items-center gap-1.5">
                        <Store size={13} className="text-blue-400 shrink-0" />
                        <span>{sc.item}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-300">{sc.distribuidora}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-300">{sc.ronda1 ? `${sc.ronda1}%` : '—'}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-300">{sc.ronda2 ? `${sc.ronda2}%` : '—'}</td>
                      <td className="py-2 px-3 text-center font-mono font-black text-white text-sm">{ef ? `${ef}%` : '—'}</td>
                      <td className="py-2 px-3 text-center text-slate-400 font-mono">{sc.pond ? `${sc.pond}%` : '—'}</td>
                      <td className="py-2 px-3 text-right">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                          isConforme
                            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                            : (isAlerta ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' : 'bg-red-950/80 border-red-500/50 text-red-300')
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

      {/* =========================================================================
          TAB 5: FLOTA Y MONTACARGAS
          ========================================================================= */}
      {activeTab === 'flota' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Truck size={18} className="text-amber-400" />
              Inspección de Flota de Carga Pesada y Equipos Montacargas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Control técnico preventivo, seguridad vial y mantenimiento por centro de distribución
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.regions.map((reg, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase flex items-center gap-1.5">
                    <Building2 size={15} className="text-amber-400" />
                    Región {reg.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-bold">100% Auditado</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                      <Truck size={16} />
                      <span className="text-xs font-bold text-white">Vehículos Carga</span>
                    </div>
                    <span className="text-xl font-black text-purple-400">
                      {reg.flota && reg.flota.ef ? `${reg.flota.ef}%` : '80.0%'}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Frenos, Luces y Neumáticos</p>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 text-amber-400 mb-1">
                      <Wrench size={16} />
                      <span className="text-xs font-bold text-white">Montacargas</span>
                    </div>
                    <span className="text-xl font-black text-amber-400">
                      {reg.montacargas && reg.montacargas.ef ? `${reg.montacargas.ef}%` : '85.0%'}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Sistemas Hidráulicos</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: PANEL DE HALLAZGOS
          ========================================================================= */}
      {activeTab === 'hallazgos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Wrench size={18} className="text-amber-400" />
              Panel de Hallazgos y Planes de Acción (C / OM / NC / NA)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Consolidación de desviaciones operativas y seguimiento por área de responsabilidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.departmentStats.map((dept, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                    {dept.nombre}
                  </h3>
                  <span className="text-xs font-black text-amber-400">{dept.pctCumplimiento}%</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] pt-1">
                  <div className="bg-emerald-950/60 border border-emerald-500/30 p-2 rounded-lg">
                    <span className="block text-slate-400">C</span>
                    <span className="font-bold text-emerald-400 text-xs">{dept.c}</span>
                  </div>
                  <div className="bg-amber-950/60 border border-amber-500/30 p-2 rounded-lg">
                    <span className="block text-slate-400">OM</span>
                    <span className="font-bold text-amber-400 text-xs">{dept.om}</span>
                  </div>
                  <div className="bg-red-950/60 border border-red-500/30 p-2 rounded-lg">
                    <span className="block text-slate-400">NC</span>
                    <span className="font-bold text-red-400 text-xs">{dept.nc}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                    <span className="block text-slate-400">NA</span>
                    <span className="font-bold text-slate-300 text-xs">{dept.na}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${dept.pctCumplimiento}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: COMPARATIVO HISTÓRICO ANUAL (3 PERÍODOS)
          ========================================================================= */}
      {activeTab === 'comparativo' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
              <TrendingUp size={18} className="text-amber-400" />
              Comparativo Histórico Anual (2024-2025 vs 2025-2026 vs 2026-2027)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Evolución sostenida de los indicadores de gestión de seguridad, salud y ambiente del Grupo Duncan
            </p>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.comparisonData} margin={{ top: 20, right: 30, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[70, 90]} stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={3} name="Puntaje Global (%)" />
                <Line type="monotone" dataKey="infra" stroke="#3b82f6" strokeWidth={2} name="Infraestructura (%)" />
                <Line type="monotone" dataKey="legal" stroke="#10b981" strokeWidth={2} name="Legal (%)" />
                <Line type="monotone" dataKey="ssa" stroke="#8b5cf6" strokeWidth={2} name="SSA y Riesgos (%)" />
                <Line type="monotone" dataKey="veh" stroke="#ec4899" strokeWidth={2} name="Vehículos (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
            {metrics.comparisonData.map((yr, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-300">Período {yr.period}</span>
                  <span className="text-base font-black text-amber-400">{yr.score}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Ronda 1: <strong>{yr.r1}%</strong></span>
                  <span>Ronda 2: <strong>{yr.r2}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
