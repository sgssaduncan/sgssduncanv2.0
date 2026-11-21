import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Clock, 
  Heart, 
  FileSpreadsheet, 
  FileText, 
  Save, 
  X, 
  AlertTriangle,
  Pill,
  Thermometer,
  BedDouble,
  Share2,
  CheckCircle2
} from 'lucide-react';
import type { ConsultaMedicaDiaria } from '../types/medical';
import { dbService } from '../services/db';
import { exportCurrentViewData } from '../lib/exportUtils';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function VexpressDailyManager() {
  const [consultas, setConsultas] = useState<ConsultaMedicaDiaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<ConsultaMedicaDiaria | null>(null);

  // Form State
  const [cedula, setCedula] = useState('');
  const [codigoFicha, setCodigoFicha] = useState('');
  const [nombreApellido, setNombreApellido] = useState('');
  const [genero, setGenero] = useState<'M' | 'F'>('M');
  const [edad, setEdad] = useState<number>(30);
  const [empresaNombre, setEmpresaNombre] = useState('DISTRIBUIDORA DUNCAN, C.A.');
  const [departamento, setDepartamento] = useState('Almacén y Despacho');
  const [sucursal, setSucursal] = useState('Caracas');
  const [cargo, setCargo] = useState('Auxiliar de Almacén');
  const [tipoConsulta, setTipoConsulta] = useState('Consulta 1');
  const [medicoNombre, setMedicoNombre] = useState('Dra. Carmen Ismelda Ramos Martínez');
  const [ciMedico, setCiMedico] = useState('6211215');
  const [numeroMSDS, setNumeroMSDS] = useState('43739');
  const [numeroCMV, setNumeroCMV] = useState('17585');
  
  // Signos vitales
  const [temperaturaC, setTemperaturaC] = useState<number>(36.5);
  const [saturacionO2, setSaturacionO2] = useState<number>(98);
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState<number>(75);
  const [presionSistolica, setPresionSistolica] = useState<number>(120);
  const [presionDiastolica, setPresionDiastolica] = useState<number>(80);

  // Diagnóstico
  const [impresionDiagnostica, setImpresionDiagnostica] = useState('Cefalea tensional');
  const [diagnosticoDetallado, setDiagnosticoDetallado] = useState('');
  const [sistemaAfectado, setSistemaAfectado] = useState('Neurológico');
  const [clasificacionGeneral, setClasificacionGeneral] = useState('Enfermedad Común');
  const [esInfeccioso, setEsInfeccioso] = useState(false);

  // Tratamiento
  const [tratamientoSuministrado, setTratamientoSuministrado] = useState('Ibuprofeno 400mg');
  const [medicamento, setMedicamento] = useState('Analgésico');
  const [viaSuministro, setViaSuministro] = useState('Oral');
  const [cantidadSuministrada, setCantidadSuministrada] = useState('1 tableta');

  // Reposo
  const [tieneReposo, setTieneReposo] = useState(false);
  const [fechaInicioReposo, setFechaInicioReposo] = useState('');
  const [fechaReintegro, setFechaReintegro] = useState('');
  const [diasReposo, setDiasReposo] = useState<number>(1);

  // Referencia
  const [fueReferido, setFueReferido] = useState(false);
  const [especialidadReferida, setEspecialidadReferida] = useState('Traumatología');
  const [motivoReferencia, setMotivoReferencia] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dbService.getConsultasMedicas();
      setConsultas(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar consultas médicas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!nombreApellido || !cedula || !impresionDiagnostica) {
      toast.error('Complete los campos obligatorios del paciente.');
      return;
    }

    try {
      const now = new Date();
      const fecha = now.toISOString().split('T')[0];
      const hora = now.toTimeString().split(' ')[0].substring(0, 5);

      let condicionPresion = 'NORMAL';
      if (presionSistolica >= 140 || presionDiastolica >= 90) condicionPresion = 'HTA_ELEVADA';
      else if (presionSistolica < 120 && presionDiastolica < 80) condicionPresion = 'OPTIMA';

      await dbService.saveConsultaMedica({
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
        tipoConsulta,
        medicoNombre,
        ciMedico,
        numeroMSDS,
        numeroCMV,
        temperaturaC,
        saturacionO2,
        frecuenciaCardiacaPpm: frecuenciaCardiaca,
        presionSistolica,
        presionDiastolica,
        condicionPresion,
        impresionDiagnostica,
        diagnosticoDetallado,
        sistemaAfectado,
        esInfecciosoContagioso: esInfeccioso,
        clasificacionGeneral,
        tratamientoSuministrado,
        medicamento,
        viaSuministro,
        cantidadSuministrada,
        tieneReposo,
        fechaInicioReposo: tieneReposo ? fechaInicioReposo : undefined,
        fechaReintegro: tieneReposo ? fechaReintegro : undefined,
        diasReposo: tieneReposo ? diasReposo : undefined,
        fueReferido,
        especialidadReferida: fueReferido ? especialidadReferida : undefined,
        motivoReferencia: fueReferido ? motivoReferencia : undefined,
        observacionesEvolucion: observaciones
      });

      toast.success('Consulta médica registrada con éxito en V-EXPRESS');
      setIsModalOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar la consulta');
    }
  };

  const handleExport = (format: 'excel' | 'csv') => {
    if (consultas.length === 0) {
      toast.error('No hay consultas para exportar');
      return;
    }
    const data = consultas.map(c => ({
      'Fecha': c.fecha,
      'Hora': c.hora,
      'Cédula': c.cedula,
      'Ficha': c.codigoFicha || '',
      'Paciente': c.nombreApellido,
      'Género': c.genero,
      'Edad': c.edad,
      'Empresa': c.empresaNombre,
      'Departamento': c.departamento,
      'Sucursal': c.sucursal,
      'Cargo': c.cargo,
      'Tipo Consulta': c.tipoConsulta,
      'Médico': c.medicoNombre,
      'PA (mmHg)': `${c.presionSistolica || 120}/${c.presionDiastolica || 80}`,
      'Pulso (ppm)': c.frecuenciaCardiacaPpm || '',
      'Temp (°C)': c.temperaturaC || '',
      'Diagnóstico': c.impresionDiagnostica,
      'Sistema': c.sistemaAfectado,
      'Clasificación': c.clasificacionGeneral,
      'Tratamiento': c.tratamientoSuministrado || '',
      'Reposo': c.tieneReposo ? `SÍ (${c.diasReposo}d)` : 'NO',
      'Referido': c.fueReferido ? `SÍ (${c.especialidadReferida})` : 'NO',
      'Observaciones': c.observacionesEvolucion || ''
    }));

    exportCurrentViewData(data, format, `VEXPRESS_Registro_Diario_${new Date().toISOString().split('T')[0]}`);
    toast.success(`Datos exportados a ${format === 'excel' ? 'Excel (.xlsx)' : 'CSV'}`);
  };

  const filtered = consultas.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.nombreApellido.toLowerCase().includes(q) ||
      c.cedula.toLowerCase().includes(q) ||
      c.impresionDiagnostica.toLowerCase().includes(q) ||
      c.empresaNombre.toLowerCase().includes(q) ||
      c.sucursal.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Sub-header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope size={18} className="text-blue-600" />
            Registro Diario de Consultas y Atenciones Médicas (V-EXPRESS)
          </h2>
          <p className="text-xs text-slate-500">
            Morbilidad ambulatoria diaria, triage de constantes vitales, prescripciones y control de reposos
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
            + Nueva Consulta
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por paciente, cédula, diagnóstico o sucursal..."
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Fecha / Hora</th>
                <th className="p-3">Paciente / Cédula</th>
                <th className="p-3">Empresa / Sucursal</th>
                <th className="p-3">Signos Vitales</th>
                <th className="p-3">Diagnóstico / Sistema</th>
                <th className="p-3">Tratamiento</th>
                <th className="p-3">Estatus Reposo</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Cargando consultas diarias...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">No se encontraron registros de consultas médicas.</td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedConsulta(c)}>
                    <td className="p-3 font-semibold text-slate-700">
                      <div>{c.fecha}</div>
                      <div className="text-[10px] text-slate-400">{c.hora} hrs</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{c.nombreApellido}</div>
                      <div className="text-[10px] text-slate-500">C.I. {c.cedula} • {c.cargo}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800 font-medium">{c.sucursal}</div>
                      <div className="text-[10px] text-slate-400">{c.empresaNombre}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-[11px] font-bold text-slate-700">
                        PA: {c.presionSistolica || 120}/{c.presionDiastolica || 80}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        FC: {c.frecuenciaCardiacaPpm || 75} ppm • {c.temperaturaC || 36.5}°C
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{c.impresionDiagnostica}</div>
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                        {c.sistemaAfectado}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-700 font-medium">{c.tratamientoSuministrado || 'Sintomático'}</div>
                      <div className="text-[10px] text-slate-400">{c.viaSuministro || 'Oral'}</div>
                    </td>
                    <td className="p-3">
                      {c.tieneReposo ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                          <BedDouble size={10} /> Reposo: {c.diasReposo} días
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Alta Laboral</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedConsulta(c); }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                      >
                        Ver Detalle &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Consulta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 my-8"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Stethoscope size={20} className="text-yellow-400" />
                  Nueva Consulta Médica Diaria (V-EXPRESS)
                </h3>
                <p className="text-xs text-slate-400">Atención en planta, evaluación clínica y prescripción ocupacional</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
              {/* Paciente */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Datos del Paciente</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Cédula</label>
                    <input
                      type="text"
                      placeholder="V-12345678"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Código / Ficha</label>
                    <input
                      type="text"
                      placeholder="591234"
                      value={codigoFicha}
                      onChange={(e) => setCodigoFicha(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Nombre y Apellido</label>
                    <input
                      type="text"
                      value={nombreApellido}
                      onChange={(e) => setNombreApellido(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Género</label>
                    <select
                      value={genero}
                      onChange={(e) => setGenero(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Edad</label>
                    <input
                      type="number"
                      value={edad}
                      onChange={(e) => setEdad(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Empresa</label>
                    <select
                      value={empresaNombre}
                      onChange={(e) => setEmpresaNombre(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    >
                      <option value="DISTRIBUIDORA DUNCAN, C.A.">DISTRIBUIDORA DUNCAN, C.A.</option>
                      <option value="ACUMULADORES DUNCAN, C.A.">ACUMULADORES DUNCAN, C.A.</option>
                      <option value="INVERSIONES 1286 C.A.">INVERSIONES 1286 C.A.</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Sucursal / Sede</label>
                    <input
                      type="text"
                      value={sucursal}
                      onChange={(e) => setSucursal(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Signos Vitales */}
              <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
                <h4 className="font-bold text-blue-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Heart size={14} className="text-red-500" />
                  Signos Vitales y Constantes
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">PA Sistólica</label>
                    <input
                      type="number"
                      value={presionSistolica}
                      onChange={(e) => setPresionSistolica(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">PA Diastólica</label>
                    <input
                      type="number"
                      value={presionDiastolica}
                      onChange={(e) => setPresionDiastolica(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Frecuencia (PPM)</label>
                    <input
                      type="number"
                      value={frecuenciaCardiaca}
                      onChange={(e) => setFrecuenciaCardiaca(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none text-center"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">SpO2 (%)</label>
                    <input
                      type="number"
                      value={saturacionO2}
                      onChange={(e) => setSaturacionO2(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperaturaC}
                      onChange={(e) => setTemperaturaC(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnóstico */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Diagnóstico e Impresión Clínica</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Impresión Diagnóstica / Afección</label>
                    <input
                      type="text"
                      value={impresionDiagnostica}
                      onChange={(e) => setImpresionDiagnostica(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Sistema Corporal Afectado</label>
                    <select
                      value={sistemaAfectado}
                      onChange={(e) => setSistemaAfectado(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-medium"
                    >
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Dermatológico">Dermatológico</option>
                      <option value="Digestivo">Digestivo</option>
                      <option value="Endocrino">Endocrino</option>
                      <option value="Músculo-esquelético">Músculo-esquelético (Óseo/Muscular)</option>
                      <option value="Neurológico">Neurológico</option>
                      <option value="Respiratorio">Respiratorio</option>
                      <option value="Oftalmológico">Oftalmológico</option>
                      <option value="Genitourinario">Genitourinario</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Clasificación General</label>
                    <select
                      value={clasificacionGeneral}
                      onChange={(e) => setClasificacionGeneral(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    >
                      <option value="Enfermedad Común">Enfermedad Común</option>
                      <option value="Accidente de Trabajo">Accidente de Trabajo</option>
                      <option value="Accidente de Trayecto">Accidente de Trayecto</option>
                      <option value="Accidente Común">Accidente Común</option>
                      <option value="Enfermedad Ocupacional">Enfermedad Ocupacional</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Tratamiento Indicado / Suministrado</label>
                  <input
                    type="text"
                    value={tratamientoSuministrado}
                    onChange={(e) => setTratamientoSuministrado(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Reposo y Referencia */}
              <div className="p-3.5 bg-yellow-50/60 border border-yellow-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-yellow-950 uppercase tracking-wider text-[11px]">Conducta y Reposo Médico</h4>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={tieneReposo}
                      onChange={(e) => setTieneReposo(e.target.checked)}
                      className="rounded text-yellow-500 focus:ring-yellow-400"
                    />
                    ¿Otorga Reposo Laboral?
                  </label>
                </div>

                {tieneReposo && (
                  <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-yellow-200">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Días de Reposo</label>
                      <input
                        type="number"
                        min="1"
                        value={diasReposo}
                        onChange={(e) => setDiasReposo(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-yellow-300 rounded-lg outline-none font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Fecha Inicio</label>
                      <input
                        type="date"
                        value={fechaInicioReposo}
                        onChange={(e) => setFechaInicioReposo(e.target.value)}
                        className="w-full p-2 bg-white border border-yellow-300 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Fecha Reintegro</label>
                      <input
                        type="date"
                        value={fechaReintegro}
                        onChange={(e) => setFechaReintegro(e.target.value)}
                        className="w-full p-2 bg-white border border-yellow-300 rounded-lg outline-none font-bold"
                      />
                    </div>
                  </div>
                )}
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
                Guardar Consulta V-EXPRESS
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Detalle Consulta */}
      {selectedConsulta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-100 my-8"
          >
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Ficha de Atención Médica Diaria</h3>
                <p className="text-xs text-slate-400">V-EXPRESS • Vigilancia Epidemiológica Duncan</p>
              </div>
              <button onClick={() => setSelectedConsulta(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="font-bold text-slate-800 text-sm">{selectedConsulta.nombreApellido}</div>
                <div className="text-slate-500">C.I. {selectedConsulta.cedula} • {selectedConsulta.cargo} • {selectedConsulta.empresaNombre}</div>
                <div className="text-slate-500">Sede: {selectedConsulta.sucursal} • Fecha: {selectedConsulta.fecha} {selectedConsulta.hora} hrs</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Diagnóstico Clínico:</span>
                  <span className="font-bold text-slate-800">{selectedConsulta.impresionDiagnostica}</span>
                  <div className="text-blue-600 text-[10px] font-semibold mt-0.5">{selectedConsulta.sistemaAfectado}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Presión Arterial:</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">
                    {selectedConsulta.presionSistolica || 120}/{selectedConsulta.presionDiastolica || 80} mmHg
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5">FC: {selectedConsulta.frecuenciaCardiacaPpm || 75} ppm • {selectedConsulta.temperaturaC || 36.5}°C</div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 block text-[10px]">Tratamiento Suministrado:</span>
                <span className="font-medium text-slate-800">{selectedConsulta.tratamientoSuministrado || 'Sintomático oral'}</span>
              </div>

              {selectedConsulta.tieneReposo && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <BedDouble size={14} /> Reposo Otorgado: {selectedConsulta.diasReposo} días
                  </div>
                  <div>Desde: {selectedConsulta.fechaInicioReposo} hasta: {selectedConsulta.fechaReintegro}</div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
                <div>Médico: {selectedConsulta.medicoNombre}</div>
                <div>MSDS: {selectedConsulta.numeroMSDS || '43739'}</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedConsulta(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
