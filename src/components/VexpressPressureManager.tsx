import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Clock, 
  FileSpreadsheet, 
  FileText, 
  Save, 
  X, 
  AlertTriangle,
  Activity,
  ShieldAlert,
  CheckCircle2,
  Pill
} from 'lucide-react';
import type { ControlPresionArterial } from '../types/medical';
import { dbService } from '../services/db';
import { exportCurrentViewData } from '../lib/exportUtils';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function VexpressPressureManager() {
  const [controles, setControles] = useState<ControlPresionArterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [cedula, setCedula] = useState('');
  const [codigoFicha, setCodigoFicha] = useState('');
  const [nombreApellido, setNombreApellido] = useState('');
  const [genero, setGenero] = useState<'M' | 'F'>('M');
  const [edad, setEdad] = useState<number>(45);
  const [departamento, setDepartamento] = useState('Almacén Central');
  const [sucursal, setSucursal] = useState('Caracas');
  const [cargo, setCargo] = useState('Operador de Montacargas');
  const [diagnostico, setDiagnostico] = useState('Hipertensión Arterial Primaria');
  const [presionSistolica, setPresionSistolica] = useState<number>(125);
  const [presionDiastolica, setPresionDiastolica] = useState<number>(80);
  const [medicamento, setMedicamento] = useState('Losartán Potásico 50mg');
  const [dosis, setDosis] = useState('1 tableta diaria');
  const [administrado, setAdministrado] = useState(true);
  const [observaciones, setObservaciones] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dbService.getControlesPresion();
      setControles(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar controles de presión arterial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCondicionPresion = (pas: number, pad: number): ControlPresionArterial['condicion'] => {
    if (pas >= 180 || pad >= 110) return 'Crisis Hipertensiva (≥180/110)';
    if (pas >= 160 || pad >= 100) return 'HTA Grado 2 (160-179/100-109)';
    if (pas >= 140 || pad >= 90) return 'HTA Grado 1 (140-159/90-99)';
    if (pas >= 130 || pad >= 85) return 'Normal Alta (130-139/85-89)';
    if (pas >= 120 || pad >= 80) return 'Normal (120-129/80-84)';
    return 'Óptima (<120/80)';
  };

  const getCondicionColor = (cond: string) => {
    if (cond.includes('Crisis')) return 'bg-red-100 text-red-800 border-red-300';
    if (cond.includes('Grado 2')) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (cond.includes('Grado 1')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (cond.includes('Normal Alta')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  const handleSave = async () => {
    if (!nombreApellido || !cedula || !presionSistolica || !presionDiastolica) {
      toast.error('Complete los datos obligatorios del trabajador y valores de tensión.');
      return;
    }

    try {
      const now = new Date();
      const fecha = now.toISOString().split('T')[0];
      const hora = now.toTimeString().split(' ')[0].substring(0, 5);
      const condicion = getCondicionPresion(presionSistolica, presionDiastolica);

      await dbService.saveControlPresion({
        fecha,
        hora,
        cedula,
        codigoFicha,
        nombreApellido,
        genero,
        edad,
        departamento,
        sucursal,
        cargo,
        diagnostico,
        presionSistolica,
        presionDiastolica,
        condicion,
        medicamentoAntihipertensivo: medicamento,
        dosis,
        administradoEnServicio: administrado,
        observaciones
      });

      toast.success('Monitoreo de presión arterial guardado en V-EXPRESS');
      setIsModalOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar monitoreo de PA');
    }
  };

  const handleExport = (format: 'excel' | 'csv') => {
    if (controles.length === 0) {
      toast.error('No hay registros de presión para exportar');
      return;
    }
    const data = controles.map(c => ({
      'Fecha': c.fecha,
      'Hora': c.hora,
      'Cédula': c.cedula,
      'Ficha': c.codigoFicha || '',
      'Trabajador': c.nombreApellido,
      'Género': c.genero,
      'Edad': c.edad,
      'Departamento': c.departamento,
      'Sucursal': c.sucursal,
      'Cargo': c.cargo,
      'Diagnóstico': c.diagnostico,
      'PAS (mmHg)': c.presionSistolica,
      'PAD (mmHg)': c.presionDiastolica,
      'Condición': c.condicion,
      'Medicamento': c.medicamentoAntihipertensivo || '',
      'Dosis': c.dosis || '',
      'Administrado en Servicio': c.administradoEnServicio ? 'SÍ' : 'NO',
      'Observaciones': c.observaciones || ''
    }));

    exportCurrentViewData(data, format, `VEXPRESS_Control_Presion_Arterial_${new Date().toISOString().split('T')[0]}`);
    toast.success(`Datos exportados a ${format === 'excel' ? 'Excel (.xlsx)' : 'CSV'}`);
  };

  const filtered = controles.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.nombreApellido.toLowerCase().includes(q) ||
      c.cedula.toLowerCase().includes(q) ||
      c.cargo.toLowerCase().includes(q) ||
      c.sucursal.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Sub-header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Heart size={18} className="text-rose-600" />
            Programa de Control y Vigilancia de Presión Arterial (REG_CONTROL_PA)
          </h2>
          <p className="text-xs text-slate-500">
            Monitoreo cardiovascular, clasificación de hipertensión y seguimiento preventivo para choferes y montacarguistas
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl font-bold text-xs shadow-sm transition-colors ml-auto sm:ml-0"
          >
            <Plus size={15} />
            + Toma de Presión
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Buscar trabajador por nombre, cédula, cargo o sucursal..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-slate-600 font-semibold">
            Limpiar
          </button>
        )}
      </div>

      {/* Grid of Pressure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            Cargando registros de presión arterial...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            No se encontraron registros de presión arterial.
          </div>
        ) : (
          filtered.map(c => {
            const isCritical = c.presionSistolica >= 140 || c.presionDiastolica >= 90;
            const esOperadorRiesgo = c.cargo.toLowerCase().includes('chofer') || c.cargo.toLowerCase().includes('montacarga');
            return (
              <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{c.nombreApellido}</h4>
                      <div className="text-[11px] text-slate-400">C.I. {c.cedula} • {c.sucursal}</div>
                      <div className="text-[11px] font-semibold text-slate-600">{c.cargo}</div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border text-center whitespace-nowrap",
                      getCondicionColor(c.condicion)
                    )}>
                      {c.condicion.split(' ')[0]} {c.condicion.split(' ')[1] || ''}
                    </span>
                  </div>

                  {/* Cifras de Presión */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Tensión Arterial:</span>
                      <span className={cn(
                        "text-lg font-mono font-black",
                        isCritical ? "text-rose-600" : "text-emerald-700"
                      )}>
                        {c.presionSistolica} / {c.presionDiastolica} <span className="text-xs font-normal text-slate-500">mmHg</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Diagnóstico:</span>
                      <span className="text-xs font-bold text-slate-700">{c.diagnostico}</span>
                    </div>
                  </div>

                  {/* Alerta Chofer / Montacarguista */}
                  {isCritical && esOperadorRiesgo && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-[10px] text-red-800 font-bold flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-red-600 shrink-0" />
                      <span>Alerta Operativa: Cifras elevadas en operador de ruta/equipo móvil.</span>
                    </div>
                  )}

                  {/* Medicamento */}
                  {c.medicamentoAntihipertensivo && (
                    <div className="text-[11px] text-slate-600 flex items-center gap-1.5 bg-yellow-50/60 p-2 rounded-lg border border-yellow-100">
                      <Pill size={13} className="text-yellow-600 shrink-0" />
                      <span className="truncate"><strong>{c.medicamentoAntihipertensivo}</strong> ({c.dosis})</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Fecha: {c.fecha} {c.hora}</span>
                  <span className="font-semibold text-slate-500">{c.departamento}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Nueva Toma de Presión */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-100 my-8"
          >
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Heart size={18} className="text-rose-500" />
                  Registro de Presión Arterial (REG_CONTROL_PA)
                </h3>
                <p className="text-xs text-slate-400">Programa de Monitoreo Cardiovascular Duncan</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 max-h-[75vh] overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Cédula</label>
                  <input
                    type="text"
                    value={cedula}
                    placeholder="V-12345678"
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Código / Ficha</label>
                  <input
                    type="text"
                    value={codigoFicha}
                    placeholder="154040"
                    onChange={(e) => setCodigoFicha(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Nombre y Apellido</label>
                <input
                  type="text"
                  value={nombreApellido}
                  onChange={(e) => setNombreApellido(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Sucursal</label>
                  <input
                    type="text"
                    value={sucursal}
                    onChange={(e) => setSucursal(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Departamento</label>
                  <input
                    type="text"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Cargo</label>
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Tensión Arterial */}
              <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2">
                <span className="font-bold text-rose-950 uppercase tracking-wider text-[11px] block">
                  Valores de Presión Arterial
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Presión Sistólica (PAS mmHg)</label>
                    <input
                      type="number"
                      value={presionSistolica}
                      onChange={(e) => setPresionSistolica(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-rose-300 rounded-lg outline-none text-center font-bold text-base"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Presión Diastólica (PAD mmHg)</label>
                    <input
                      type="number"
                      value={presionDiastolica}
                      onChange={(e) => setPresionDiastolica(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-rose-300 rounded-lg outline-none text-center font-bold text-base"
                    />
                  </div>
                </div>
                <div className="text-center pt-1 font-bold text-[11px] text-slate-700">
                  Condición Estimada: <span className="text-rose-700">{getCondicionPresion(presionSistolica, presionDiastolica)}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Diagnóstico Cardiovascular</label>
                <input
                  type="text"
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Medicamento Antihipertensivo</label>
                  <input
                    type="text"
                    value={medicamento}
                    placeholder="Losartán 50mg / Enalapril"
                    onChange={(e) => setMedicamento(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Posología / Dosis</label>
                  <input
                    type="text"
                    value={dosis}
                    placeholder="1 tableta diaria"
                    onChange={(e) => setDosis(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Observaciones / Conducta</label>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  placeholder="Recomendaciones dietéticas, pauta de control, reposo relativo..."
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-sm text-xs"
              >
                <Save size={15} />
                Guardar Monitoreo PA
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
