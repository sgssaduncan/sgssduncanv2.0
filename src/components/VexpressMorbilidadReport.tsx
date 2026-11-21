import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Users, 
  BedDouble, 
  AlertCircle,
  Download
} from 'lucide-react';
import type { ConsultaMedicaDiaria, MorbilidadReporteItem } from '../types/medical';
import { dbService } from '../services/db';
import { exportCurrentViewData } from '../lib/exportUtils';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function VexpressMorbilidadReport() {
  const [consultas, setConsultas] = useState<ConsultaMedicaDiaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMes, setSelectedMes] = useState('2026-10');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dbService.getConsultasMedicas();
      setConsultas(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar datos de morbilidad');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Consolidación por sistemas corporales
  const totalConsultas = consultas.length;
  const totalReposos = consultas.filter(c => c.tieneReposo).length;
  const totalDiasPerdidos = consultas.reduce((acc, c) => acc + (c.diasReposo || 0), 0);
  const casosComunes = consultas.filter(c => c.clasificacionGeneral.includes('Común')).length;
  const casosOcupacionales = consultas.filter(c => c.clasificacionGeneral.includes('Ocupacional') || c.clasificacionGeneral.includes('Trabajo')).length;

  const sistemasMap: Record<string, { total: number; masc: number; fem: number; dias: number }> = {};
  consultas.forEach(c => {
    const s = c.sistemaAfectado || 'Otros';
    if (!sistemasMap[s]) {
      sistemasMap[s] = { total: 0, masc: 0, fem: 0, dias: 0 };
    }
    sistemasMap[s].total += 1;
    if (c.genero === 'M' || c.genero === 'MASCULINO') sistemasMap[s].masc += 1;
    else sistemasMap[s].fem += 1;
    sistemasMap[s].dias += (c.diasReposo || 0);
  });

  const sistemasReporte = Object.entries(sistemasMap).map(([sistema, data]) => ({
    sistema,
    totalCasos: data.total,
    casosMasculino: data.masc,
    casosFemenino: data.fem,
    diasReposo: data.dias,
    porcentaje: totalConsultas > 0 ? Number(((data.total / totalConsultas) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.totalCasos - a.totalCasos);

  const handleExport = (format: 'excel' | 'csv') => {
    if (sistemasReporte.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    const data = sistemasReporte.map(s => ({
      'Sistema Corporal': s.sistema,
      'Total Consultas': s.totalCasos,
      'Casos Masculino': s.casosMasculino,
      'Casos Femenino': s.casosFemenino,
      'Días de Reposo Acumulados': s.diasReposo,
      'Porcentaje (%)': `${s.porcentaje}%`
    }));

    exportCurrentViewData(data, format, `VEXPRESS_Informe_Morbilidad_${selectedMes}`);
    toast.success(`Datos exportados a ${format === 'excel' ? 'Excel (.xlsx)' : 'CSV'}`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-600" />
            Informe Epidemiológico Consolidado de Morbilidad (INPSASEL / CSSL)
          </h2>
          <p className="text-xs text-slate-500">
            Estadísticas mensuales de atención médica, distribución por sistemas y ausentismo por reposo laboral
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="month"
            value={selectedMes}
            onChange={(e) => setSelectedMes(e.target.value)}
            className="text-xs p-1.5 bg-slate-100 border border-slate-200 rounded-lg outline-none font-bold"
          />

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm"
              title="Exportar a Excel"
            >
              <FileSpreadsheet size={13} />
              Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1 px-2.5 py-1 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
              title="Exportar a CSV"
            >
              <FileText size={13} />
              CSV
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
          >
            <Printer size={14} />
            Imprimir
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Atenciones</span>
          <span className="text-2xl font-black text-slate-800">{totalConsultas}</span>
          <span className="text-[10px] text-slate-500 block">Consultas en período</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Días de Reposo</span>
          <span className="text-2xl font-black text-amber-600">{totalDiasPerdidos}</span>
          <span className="text-[10px] text-slate-500 block">{totalReposos} trabajadores con reposo</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Causa Común</span>
          <span className="text-2xl font-black text-blue-600">{casosComunes}</span>
          <span className="text-[10px] text-slate-500 block">
            {totalConsultas > 0 ? ((casosComunes / totalConsultas) * 100).toFixed(0) : 0}% de los casos
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Causa Laboral</span>
          <span className="text-2xl font-black text-rose-600">{casosOcupacionales}</span>
          <span className="text-[10px] text-slate-500 block">Accidentes / Ocupacional</span>
        </div>
      </div>

      {/* Tabla Epidemiológica por Sistemas */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Distribución de Morbilidad por Sistemas Corporales</h3>
            <p className="text-xs text-slate-500">Clasificación epidemiológica según formato oficial V-EXPRESS / INPSASEL</p>
          </div>
          <span className="text-xs font-bold text-slate-600">Período: {selectedMes}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Sistema Corporal</th>
                <th className="p-3 text-center">Total Casos</th>
                <th className="p-3 text-center">Masculino</th>
                <th className="p-3 text-center">Femenino</th>
                <th className="p-3 text-center">Días de Reposo</th>
                <th className="p-3">Proporción (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Generando informe epidemiológico...</td>
                </tr>
              ) : sistemasReporte.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Sin datos de morbilidad registrados en el período.</td>
                </tr>
              ) : (
                sistemasReporte.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                      {s.sistema}
                    </td>
                    <td className="p-3 text-center font-bold font-mono text-sm">{s.totalCasos}</td>
                    <td className="p-3 text-center font-mono text-slate-600">{s.casosMasculino}</td>
                    <td className="p-3 text-center font-mono text-slate-600">{s.casosFemenino}</td>
                    <td className="p-3 text-center font-bold text-amber-700 font-mono">{s.diasReposo}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, s.porcentaje * 2)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 text-[11px]">{s.porcentaje}%</span>
                      </div>
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
