import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  FileSpreadsheet, 
  FileText, 
  Save, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Compass,
  Layers
} from 'lucide-react';
import type { EvaluacionGoniometria } from '../types/medical';
import { dbService } from '../services/db';
import { exportCurrentViewData } from '../lib/exportUtils';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function VexpressGoniometriaManager() {
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionGoniometria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState<EvaluacionGoniometria | null>(null);

  // Form State
  const [cedula, setCedula] = useState('');
  const [codigoFicha, setCodigoFicha] = useState('');
  const [nombreApellido, setNombreApellido] = useState('');
  const [genero, setGenero] = useState('MASCULINO');
  const [edad, setEdad] = useState<number>(35);
  const [empresaNombre, setEmpresaNombre] = useState('ACUMULADORES DUNCAN, C.A.');
  const [departamento, setDepartamento] = useState('PRODUCCIÓN Y CARGA');
  const [sucursal, setSucursal] = useState('LOS RUICES');
  const [cargo, setCargo] = useState('Operador de Baterías / Estibador');
  const [medicoNombre, setMedicoNombre] = useState('Dra. Carmen Ismelda Ramos Martínez');

  // Arcos Cervicales (grados)
  const [cervicalFlexion, setCervicalFlexion] = useState<number>(45); // normal 0-45
  const [cervicalExtension, setCervicalExtension] = useState<number>(45); // normal 0-45
  const [cervicalRotIzq, setCervicalRotIzq] = useState<number>(60); // normal 0-60
  const [cervicalRotDer, setCervicalRotDer] = useState<number>(60); // normal 0-60

  // Arcos Lumbares (grados)
  const [lumbarFlexion, setLumbarFlexion] = useState<number>(80); // normal 0-80
  const [lumbarExtension, setLumbarExtension] = useState<number>(30); // normal 0-30
  const [lumbarRotIzq, setLumbarRotIzq] = useState<number>(45); // normal 0-45
  const [lumbarRotDer, setLumbarRotDer] = useState<number>(45); // normal 0-45

  // Hombro Derecho (grados)
  const [hombroDerFlexion, setHombroDerFlexion] = useState<number>(180); // normal 0-180
  const [hombroDerAbduccion, setHombroDerAbduccion] = useState<number>(180); // normal 0-180
  const [hombroDerRotInt, setHombroDerRotInt] = useState<number>(70); // normal 0-70
  const [hombroDerRotExt, setHombroDerRotExt] = useState<number>(90); // normal 0-90

  // Hombro Izquierdo (grados)
  const [hombroIzqFlexion, setHombroIzqFlexion] = useState<number>(180);
  const [hombroIzqAbduccion, setHombroIzqAbduccion] = useState<number>(180);
  const [hombroIzqRotInt, setHombroIzqRotInt] = useState<number>(70);
  const [hombroIzqRotExt, setHombroIzqRotExt] = useState<number>(90);

  const [diagnostico, setDiagnostico] = useState('Arcos de movilidad articular dentro de límites normales.');
  const [observaciones, setObservaciones] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dbService.getGoniometrias();
      setEvaluaciones(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar evaluaciones goniométricas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!nombreApellido || !cedula || !cargo) {
      toast.error('Complete los datos obligatorios del trabajador.');
      return;
    }

    try {
      const now = new Date();
      const fecha = now.toISOString().split('T')[0];
      const hora = now.toTimeString().split(' ')[0].substring(0, 5);

      const limitacion = 
        lumbarFlexion < 65 || 
        lumbarExtension < 20 || 
        cervicalFlexion < 35 || 
        hombroDerFlexion < 150 || 
        hombroIzqFlexion < 150;

      await dbService.saveGoniometria({
        fecha,
        hora,
        cedula,
        codigoFicha,
        nombreApellido,
        genero,
        edad,
        empresaNombre,
        departamento,
        sucursal,
        cargo,
        medicoNombre,
        cervical: {
          flexion: cervicalFlexion,
          extension: cervicalExtension,
          rotacionIzq: cervicalRotIzq,
          rotacionDer: cervicalRotDer,
          inclinacionIzq: 40,
          inclinacionDer: 40
        },
        lumbar: {
          flexion: lumbarFlexion,
          extension: lumbarExtension,
          rotacionIzq: lumbarRotIzq,
          rotacionDer: lumbarRotDer,
          lateralizacionIzq: 30,
          lateralizacionDer: 30
        },
        hombroDerecho: {
          flexion: hombroDerFlexion,
          extension: 55,
          abduccion: hombroDerAbduccion,
          rotacionInterna: hombroDerRotInt,
          rotacionExterna: hombroDerRotExt
        },
        hombroIzquierdo: {
          flexion: hombroIzqFlexion,
          extension: 55,
          abduccion: hombroIzqAbduccion,
          rotacionInterna: hombroIzqRotInt,
          rotacionExterna: hombroIzqRotExt
        },
        diagnosticoBiomecanico: diagnostico,
        limitacionFuncionalDetectada: limitacion,
        observaciones
      });

      toast.success('Evaluación goniométrica registrada con éxito');
      setIsModalOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar evaluación goniométrica');
    }
  };

  const handleExport = (format: 'excel' | 'csv') => {
    if (evaluaciones.length === 0) {
      toast.error('No hay evaluaciones para exportar');
      return;
    }
    const data = evaluaciones.map(g => ({
      'Fecha': g.fecha,
      'Hora': g.hora,
      'Cédula': g.cedula,
      'Ficha': g.codigoFicha || '',
      'Trabajador': g.nombreApellido,
      'Cargo': g.cargo,
      'Empresa': g.empresaNombre,
      'Sucursal': g.sucursal,
      'Cervical Flexión (°)': g.cervical?.flexion || '',
      'Cervical Extensión (°)': g.cervical?.extension || '',
      'Lumbar Flexión (°)': g.lumbar?.flexion || '',
      'Lumbar Extensión (°)': g.lumbar?.extension || '',
      'Hombro Der Flexión (°)': g.hombroDerecho?.flexion || '',
      'Hombro Izq Flexión (°)': g.hombroIzquierdo?.flexion || '',
      'Diagnóstico': g.diagnosticoBiomecanico,
      'Limitación': g.limitacionFuncionalDetectada ? 'SÍ' : 'NO',
      'Observaciones': g.observaciones || ''
    }));

    exportCurrentViewData(data, format, `VEXPRESS_Evaluaciones_Goniometria_${new Date().toISOString().split('T')[0]}`);
    toast.success(`Datos exportados a ${format === 'excel' ? 'Excel (.xlsx)' : 'CSV'}`);
  };

  const filtered = evaluaciones.filter(g => {
    const q = searchQuery.toLowerCase();
    return (
      g.nombreApellido.toLowerCase().includes(q) ||
      g.cedula.toLowerCase().includes(q) ||
      g.cargo.toLowerCase().includes(q) ||
      g.sucursal.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Sub-header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Compass size={18} className="text-indigo-600" />
            Evaluación Goniométrica Ocupacional (REG_GONIOMETRÍA)
          </h2>
          <p className="text-xs text-slate-500">
            Medición de arcos de movilidad articular (ROMA) para prevención de trastornos musculoesqueléticos en estiba de baterías
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
            + Nueva Goniometría
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por trabajador, cédula, cargo o sucursal..."
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

      {/* Grid of Evaluations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            Cargando evaluaciones goniométricas...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            No se encontraron registros de goniometría articular.
          </div>
        ) : (
          filtered.map(g => (
            <div 
              key={g.id} 
              onClick={() => setSelectedEval(g)}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{g.nombreApellido}</h3>
                  <div className="text-[11px] text-slate-500">C.I. {g.cedula} • {g.cargo}</div>
                  <div className="text-[10px] text-slate-400">{g.sucursal} ({g.empresaNombre})</div>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2.5 py-0.5 rounded-full border",
                  g.limitacionFuncionalDetectada ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-emerald-100 text-emerald-800 border-emerald-300"
                )}>
                  {g.limitacionFuncionalDetectada ? 'LIMITACIÓN DETECTADA' : 'MOVILIDAD NORMAL'}
                </span>
              </div>

              {/* Rango de Movilidad Visual */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">Cervical (Flex/Ext)</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {g.cervical?.flexion || 0}° / {g.cervical?.extension || 0}°
                  </span>
                  <span className="text-[9px] text-slate-400 block">(Normal 45°/45°)</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">Lumbar (Flex/Ext)</span>
                  <span className={cn(
                    "font-mono font-bold text-sm",
                    (g.lumbar?.flexion || 0) < 65 ? "text-amber-700" : "text-slate-800"
                  )}>
                    {g.lumbar?.flexion || 0}° / {g.lumbar?.extension || 0}°
                  </span>
                  <span className="text-[9px] text-slate-400 block">(Normal 80°/30°)</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">Hombro Der/Izq</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {g.hombroDerecho?.flexion || 0}° / {g.hombroIzquierdo?.flexion || 0}°
                  </span>
                  <span className="text-[9px] text-slate-400 block">(Normal 180°/180°)</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-indigo-950">
                <span className="font-semibold text-[10px] text-indigo-600 uppercase tracking-wider block">Diagnóstico Biomecánico:</span>
                <p className="line-clamp-2 mt-0.5">{g.diagnosticoBiomecanico}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                <span>Fecha: {g.fecha} {g.hora}</span>
                <span className="font-bold text-blue-600 hover:text-blue-800">Ver Detalles &rarr;</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nueva Goniometría */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 my-8"
          >
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Compass size={18} className="text-yellow-400" />
                  Registro de Evaluación Goniométrica (REG_GONIOMETRÍA)
                </h3>
                <p className="text-xs text-slate-400">Medición de Arcos de Movimiento Articular en Grados (°)</p>
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
                    placeholder="V-15892341"
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Código / Ficha</label>
                  <input
                    type="text"
                    value={codigoFicha}
                    placeholder="590412"
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
                  <label className="font-semibold text-slate-600 block mb-1">Empresa</label>
                  <input
                    type="text"
                    value={empresaNombre}
                    onChange={(e) => setEmpresaNombre(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Cargo</label>
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                  />
                </div>
              </div>

              {/* Columna Cervical */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                  Columna Cervical (Normal: Flexión 0°-45° | Extensión 0°-45°)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Flexión (°)</label>
                    <input
                      type="number"
                      value={cervicalFlexion}
                      onChange={(e) => setCervicalFlexion(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Extensión (°)</label>
                    <input
                      type="number"
                      value={cervicalExtension}
                      onChange={(e) => setCervicalExtension(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Rotación Izq (°)</label>
                    <input
                      type="number"
                      value={cervicalRotIzq}
                      onChange={(e) => setCervicalRotIzq(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Rotación Der (°)</label>
                    <input
                      type="number"
                      value={cervicalRotDer}
                      onChange={(e) => setCervicalRotDer(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Columna Lumbar */}
              <div className="p-3 bg-yellow-50/60 border border-yellow-200 rounded-xl space-y-2">
                <span className="font-bold text-yellow-950 text-[11px] uppercase tracking-wider block">
                  Columna Lumbar (Normal: Flexión 0°-80° | Extensión 0°-30°)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Flexión (°)</label>
                    <input
                      type="number"
                      value={lumbarFlexion}
                      onChange={(e) => setLumbarFlexion(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-yellow-300 rounded-lg text-center font-bold text-amber-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Extensión (°)</label>
                    <input
                      type="number"
                      value={lumbarExtension}
                      onChange={(e) => setLumbarExtension(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-yellow-300 rounded-lg text-center font-bold text-amber-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Rotación Izq (°)</label>
                    <input
                      type="number"
                      value={lumbarRotIzq}
                      onChange={(e) => setLumbarRotIzq(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-yellow-300 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Rotación Der (°)</label>
                    <input
                      type="number"
                      value={lumbarRotDer}
                      onChange={(e) => setLumbarRotDer(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-yellow-300 rounded-lg text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Hombros */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                  Hombros (Normal: Flexión 0°-180° | Abducción 0°-180°)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Hombro Der Flex (°)</label>
                    <input
                      type="number"
                      value={hombroDerFlexion}
                      onChange={(e) => setHombroDerFlexion(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Hombro Der Abd (°)</label>
                    <input
                      type="number"
                      value={hombroDerAbduccion}
                      onChange={(e) => setHombroDerAbduccion(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Hombro Izq Flex (°)</label>
                    <input
                      type="number"
                      value={hombroIzqFlexion}
                      onChange={(e) => setHombroIzqFlexion(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Hombro Izq Abd (°)</label>
                    <input
                      type="number"
                      value={hombroIzqAbduccion}
                      onChange={(e) => setHombroIzqAbduccion(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Diagnóstico Biomecánico</label>
                <input
                  type="text"
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Observaciones / Conducta</label>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  placeholder="Pautas ergonómicas, ejercicios de estiramiento, rotación de puesto..."
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
                Guardar Goniometría
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
