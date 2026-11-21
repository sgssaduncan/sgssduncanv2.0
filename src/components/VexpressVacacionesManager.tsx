import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palmtree, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  FileSpreadsheet, 
  Calendar, 
  User, 
  ArrowRight,
  ShieldAlert,
  Activity,
  HeartHandshake
} from 'lucide-react';
import { dbService } from '../services/db';
import type { Empleado } from '../types';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

interface Props {
  onSolicitarPreVacacional?: (empleado: Empleado) => void;
}

export default function VexpressVacacionesManager({ onSolicitarPreVacacional }: Props) {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroSemaforo, setFiltroSemaforo] = useState<'TODOS' | 'VENCIDAS' | 'PROXIMAS' | 'AL_DIA'>('TODOS');

  useEffect(() => {
    loadEmpleados();
  }, []);

  const loadEmpleados = async () => {
    try {
      setLoading(true);
      const data = await dbService.getEmpleados();
      setEmpleados(data);
    } catch (e) {
      console.error(e);
      toast.error('Error cargando colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const hoy = new Date('2026-11-21'); // Fecha actual del sistema SGD

  // Cálculo de meses y estatus
  const colaboradoresCalculados = empleados.map(emp => {
    const ultimoDisfrute = emp.ultimoDisfruteVacacional ? new Date(emp.ultimoDisfruteVacacional) : (emp.fechaIngreso ? new Date(emp.fechaIngreso) : null);
    let mesesSinVacaciones = 0;
    if (ultimoDisfrute) {
      const diffMs = hoy.getTime() - ultimoDisfrute.getTime();
      mesesSinVacaciones = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375)));
    }

    let estatus: 'AL_DIA' | 'PROXIMAS' | 'VENCIDAS' | 'CRITICAS' = 'AL_DIA';
    if (mesesSinVacaciones >= 18) {
      estatus = 'CRITICAS';
    } else if (mesesSinVacaciones >= 12) {
      estatus = 'VENCIDAS';
    } else if (mesesSinVacaciones >= 10) {
      estatus = 'PROXIMAS';
    }

    return {
      ...emp,
      mesesSinVacaciones,
      estatus
    };
  });

  const filtrados = colaboradoresCalculados.filter(c => {
    const matchSearch = !search || 
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.cedula.toLowerCase().includes(search.toLowerCase()) ||
      c.cargo.toLowerCase().includes(search.toLowerCase()) ||
      (c.departamento && c.departamento.toLowerCase().includes(search.toLowerCase()));

    const matchFiltro = 
      filtroSemaforo === 'TODOS' ||
      (filtroSemaforo === 'VENCIDAS' && (c.estatus === 'VENCIDAS' || c.estatus === 'CRITICAS')) ||
      (filtroSemaforo === 'PROXIMAS' && c.estatus === 'PROXIMAS') ||
      (filtroSemaforo === 'AL_DIA' && c.estatus === 'AL_DIA');

    return matchSearch && matchFiltro;
  });

  const totalCriticas = colaboradoresCalculados.filter(c => c.estatus === 'CRITICAS').length;
  const totalVencidas = colaboradoresCalculados.filter(c => c.estatus === 'VENCIDAS').length;
  const totalProximas = colaboradoresCalculados.filter(c => c.estatus === 'PROXIMAS').length;
  const totalAlDia = colaboradoresCalculados.filter(c => c.estatus === 'AL_DIA').length;

  const exportarExcel = () => {
    try {
      const dataRows = colaboradoresCalculados.map(c => ({
        'Cédula': c.cedula,
        'Nombre y Apellido': c.nombre,
        'Cargo': c.cargo,
        'Departamento': c.departamento || 'N/A',
        'Empresa': c.empresaNombre || 'Duncan',
        'Fecha Ingreso': c.fechaIngreso || 'N/A',
        'Último Disfrute Vacacional': c.ultimoDisfruteVacacional || 'N/A',
        'Meses sin Vacaciones': c.mesesSinVacaciones,
        'Días Pendientes': c.diasVacacionesPendientes || 15,
        'Estatus Alerta': c.estatus,
        'Riesgo Fatiga Laboral': c.estatus === 'CRITICAS' ? 'ALTO (Intervención Inmediata)' : c.estatus === 'VENCIDAS' ? 'MODERADO (Programar Salida)' : 'BAJO'
      }));

      const ws = XLSX.utils.json_to_sheet(dataRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Control_Vacacional_Fatiga');
      XLSX.writeFile(wb, `Control_Vacacional_Fatiga_Duncan_${hoy.toISOString().slice(0, 10)}.xlsx`);
      toast.success('Reporte de control vacacional descargado');
    } catch (e) {
      console.error(e);
      toast.error('Error al exportar datos');
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerta Destacada de Prevención de Fatiga */}
      {(totalCriticas > 0 || totalVencidas > 0) && (
        <div className="p-5 bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border-2 border-red-200 rounded-2xl flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-red-600 text-white rounded-xl shadow-md shrink-0">
            <ShieldAlert size={26} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-red-950 text-base flex items-center gap-2">
              Alerta de Seguridad & Salud: Riesgo de Fatiga y Estrés Laboral
            </h3>
            <p className="text-xs text-red-900 mt-1 leading-relaxed">
              De acuerdo con la LOPCYMAT y las directrices del SSST Duncan, se han detectado <strong>{totalCriticas + totalVencidas} colaboradores</strong> con períodos vacacionales acumulados superiores a 12 meses. La falta de descanso vacacional incide directamente en los índices de accidentabilidad y reflejos operacionales (especialmente en áreas de fundición, formación y transporte de carga pesada).
            </p>
          </div>
          <button
            onClick={exportarExcel}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <FileSpreadsheet size={15} /> Auditar Nómina
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div 
          onClick={() => setFiltroSemaforo(filtroSemaforo === 'VENCIDAS' ? 'TODOS' : 'VENCIDAS')}
          className={cn(
            "p-4 bg-white rounded-2xl border cursor-pointer transition-all shadow-sm",
            filtroSemaforo === 'VENCIDAS' ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20" : "border-slate-100 hover:border-slate-300"
          )}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Vacaciones Vencidas</span>
            <span className="p-1.5 bg-red-100 text-red-700 rounded-lg"><AlertTriangle size={15} /></span>
          </div>
          <div className="text-2xl font-black text-red-600 mt-2">{totalCriticas + totalVencidas}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{totalCriticas} críticas (&gt;18 meses)</div>
        </div>

        <div 
          onClick={() => setFiltroSemaforo(filtroSemaforo === 'PROXIMAS' ? 'TODOS' : 'PROXIMAS')}
          className={cn(
            "p-4 bg-white rounded-2xl border cursor-pointer transition-all shadow-sm",
            filtroSemaforo === 'PROXIMAS' ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20" : "border-slate-100 hover:border-slate-300"
          )}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Próximas a Vencer</span>
            <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg"><Clock size={15} /></span>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{totalProximas}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ventana 10-12 meses</div>
        </div>

        <div 
          onClick={() => setFiltroSemaforo(filtroSemaforo === 'AL_DIA' ? 'TODOS' : 'AL_DIA')}
          className={cn(
            "p-4 bg-white rounded-2xl border cursor-pointer transition-all shadow-sm",
            filtroSemaforo === 'AL_DIA' ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20" : "border-slate-100 hover:border-slate-300"
          )}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Al Día / Descanso OK</span>
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg"><CheckCircle2 size={15} /></span>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{totalAlDia}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Menos de 10 meses</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Exportar Matriz</span>
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg"><FileSpreadsheet size={15} /></span>
          </div>
          <button
            onClick={exportarExcel}
            className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 text-yellow-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <FileSpreadsheet size={14} /> Descargar .xlsx
          </button>
        </div>
      </div>

      {/* Barra de Filtro y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por colaborador, cédula, cargo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Filtro:</span>
          {(['TODOS', 'VENCIDAS', 'PROXIMAS', 'AL_DIA'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltroSemaforo(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                filtroSemaforo === f 
                  ? "bg-slate-900 text-yellow-400 shadow-xs" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              )}
            >
              {f === 'TODOS' ? 'Todos' : f === 'VENCIDAS' ? 'Vencidas' : f === 'PROXIMAS' ? 'Próximas' : 'Al Día'}
            </button>
          ))}
        </div>
      </div>

      {/* Listado de Colaboradores y Semáforo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Cargando control vacacional de colaboradores...
          </div>
        ) : filtrados.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
            No se encontraron registros con los filtros seleccionados
          </div>
        ) : (
          filtrados.map(emp => (
            <div 
              key={emp._id || emp.id}
              className={cn(
                "bg-white rounded-2xl p-5 border shadow-sm space-y-3 transition-all",
                emp.estatus === 'CRITICAS' && "border-red-300 ring-1 ring-red-400/20",
                emp.estatus === 'VENCIDAS' && "border-orange-300",
                emp.estatus === 'PROXIMAS' && "border-amber-200",
                emp.estatus === 'AL_DIA' && "border-slate-100"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{emp.nombre}</h4>
                  <p className="text-xs text-slate-500">{emp.cedula} • {emp.cargo}</p>
                </div>
                <span className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider",
                  emp.estatus === 'CRITICAS' && "bg-red-100 text-red-800 border-red-300 animate-pulse",
                  emp.estatus === 'VENCIDAS' && "bg-orange-100 text-orange-800 border-orange-300",
                  emp.estatus === 'PROXIMAS' && "bg-amber-100 text-amber-800 border-amber-300",
                  emp.estatus === 'AL_DIA' && "bg-emerald-100 text-emerald-800 border-emerald-300"
                )}>
                  {emp.estatus === 'CRITICAS' ? 'Vencida (+18m)' : emp.estatus === 'VENCIDAS' ? 'Vencida (+12m)' : emp.estatus === 'PROXIMAS' ? 'Próxima' : 'Al Día'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Último Disfrute:</span>
                  <strong className="text-slate-800">{emp.ultimoDisfruteVacacional || 'Sin registro inicial'}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tiempo sin Vacaciones:</span>
                  <strong className={cn(
                    emp.mesesSinVacaciones >= 12 ? "text-red-600 font-bold" : "text-slate-800"
                  )}>
                    {emp.mesesSinVacaciones} meses
                  </strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Días Pendientes:</span>
                  <span className="font-bold text-slate-800">{emp.diasVacacionesPendientes ?? 15} días</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Departamento:</span>
                  <span className="text-slate-700">{emp.departamento || 'General'}</span>
                </div>
              </div>

              {/* Botón de Acción Médica Rápida */}
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    if (onSolicitarPreVacacional) {
                      onSolicitarPreVacacional(emp);
                    } else {
                      toast.success(`Iniciando examen pre-vacacional para ${emp.nombre}`);
                    }
                  }}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Activity size={13} />
                  Programar Pre-Vacacional
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
