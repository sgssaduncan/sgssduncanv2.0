import React, { useState } from 'react';
import {
  FileText, Download, Calendar, Filter, CheckCircle2,
  AlertTriangle, Shield, Building2, Printer, Search
} from 'lucide-react';
import { useSGD } from '../contexts/SGDContext';
import { formatDate } from '../lib/utils';
import { generarConsolidadoEjecutivoPDF } from '../lib/pdfGenerator';
import toast from 'react-hot-toast';

export default function ReportesPage() {
  const { inspecciones, planAccion, empresas, stats, planStats } = useSGD();

  const [filtroEmpresa, setFiltroEmpresa] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Filtrado de inspecciones
  const inspeccionesFiltradas = inspecciones.filter(i => {
    const matchEmpresa = filtroEmpresa === 'todas' || i.empresaId === filtroEmpresa;
    const matchTipo = filtroTipo === 'todos' || i.tipoCodigo === filtroTipo;
    const matchDesde = !fechaDesde || i.fecha >= fechaDesde;
    const matchHasta = !fechaHasta || i.fecha <= fechaHasta;
    return matchEmpresa && matchTipo && matchDesde && matchHasta;
  });

  // Generar reporte consolidado en PDF con Estándar Corporativo Duncan SAP/ISO
  const exportarReportePDF = () => {
    try {
      const nombreEmpresaFiltro = filtroEmpresa === 'todas'
        ? 'Todas las Empresas (Duncan / Titán)'
        : (empresas.find(e => e._id === filtroEmpresa || e.id === filtroEmpresa)?.nombre || filtroEmpresa);

      const { doc, fileName } = generarConsolidadoEjecutivoPDF(
        inspeccionesFiltradas,
        nombreEmpresaFiltro,
        stats.tasaCumplimiento
      );

      doc.save(fileName);
      toast.success('Informe ejecutivo oficial generado exitosamente');
    } catch (err) {
      console.error('Error generando informe consolidado PDF:', err);
      toast.error('Error generando informe PDF oficial');
    }
  };

  // Exportar a CSV
  const exportarCSV = () => {
    if (inspeccionesFiltradas.length === 0) {
      toast.error('No hay inspecciones para exportar');
      return;
    }

    const headers = ['ID', 'Fecha', 'Tipo', 'Código', 'Empresa', 'Localidad', 'Establecimiento', 'Inspector', 'Resultado', 'Puntuación'];
    const rows = inspeccionesFiltradas.map(i => [
      i._id,
      i.fecha,
      `"${i.tipoNombre}"`,
      i.tipoCodigo,
      `"${i.empresaNombre}"`,
      `"${i.localidadNombre}"`,
      `"${i.establecimientoNombre}"`,
      `"${i.inspector}"`,
      i.resultado || '',
      i.puntuacion || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SGD_Duncan_Inspecciones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Archivo CSV descargado correctamente');
  };

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
            Reportes e Informes Ejecutivos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consolidación de auditorías, estadísticas de cumplimiento y exportación oficial en PDF y Excel
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportarCSV}
            className="btn-secondary text-xs sm:text-sm flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={exportarReportePDF}
            className="btn-primary text-xs sm:text-sm flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Printer className="w-4 h-4" />
            <span>Descargar Informe PDF</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inspecciones</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{inspeccionesFiltradas.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Filtradas actualmente</p>
        </div>

        <div className="card p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumplimiento SSA</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.tasaCumplimiento}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tasa global de conformidad</p>
        </div>

        <div className="card p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan de Acción Abierto</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{planStats.pendientes + planStats.enEjecucion}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Acciones pendientes</p>
        </div>

        <div className="card p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones Vencidas</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{planStats.vencidas}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Requieren atención inmediata</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-indigo-600" />
          Filtros de Reporte
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Empresa</label>
            <select
              value={filtroEmpresa}
              onChange={e => setFiltroEmpresa(e.target.value)}
              className="input w-full text-xs"
            >
              <option value="todas">Todas las empresas</option>
              {empresas.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tipo de Inspección</label>
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="input w-full text-xs"
            >
              <option value="todos">Todos los tipos</option>
              <option value="EXT">Extintores (EXT)</option>
              <option value="DI">Detección Incendios (DI)</option>
              <option value="DD">Distribuidoras (DD)</option>
              <option value="SC">Servicentros (SC)</option>
              <option value="OL">Orden y Limpieza (OL)</option>
              <option value="KD">Kit Derrames (KD)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              className="input w-full text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              className="input w-full text-xs"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Resultados Filtrados */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Inspecciones Listadas ({inspeccionesFiltradas.length})</h3>
          <span className="text-xs text-slate-400">Listas para incluir en informe</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Establecimiento</th>
                <th className="py-3 px-4">Inspector</th>
                <th className="py-3 px-4 text-center">Resultado</th>
                <th className="py-3 px-4 text-center">Puntaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inspeccionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No hay inspecciones que coincidan con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                inspeccionesFiltradas.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                      {formatDate(item.fecha)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-xs">
                      {item.tipoNombre}
                      <span className="ml-1.5 font-mono text-[10px] text-slate-400 font-normal">({item.tipoCodigo})</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      <div>{item.establecimientoNombre}</div>
                      <div className="text-[10px] text-slate-400">{item.empresaNombre}</div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-800">
                      {item.inspector}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                        item.resultado === 'C'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.resultado === 'NC'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.resultado || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-xs">
                      {item.puntuacion ?? 0}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}