import React, { useState } from 'react';
import {
  Stethoscope, Plus, Search, Activity, Heart,
  ShieldCheck, AlertTriangle, User, Calendar, FileText
} from 'lucide-react';
import { gsApi } from '../lib/googleSheetsClient';
import type { EvaluacionMedica, Empleado } from '../types';
import { today, formatDate } from '../lib/utils';
import { useSGD } from '../contexts/SGDContext';
import toast from 'react-hot-toast';

export default function MedicoPage() {
  const { empleados, currentUser } = useSGD();
  const [activeTab, setActiveTab] = useState<'evaluaciones' | 'plombemia'>('evaluaciones');
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionMedica[]>(() => gsApi.getEvaluacionesMedicas());
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Formulario nueva evaluación
  const [formEmpleado, setFormEmpleado] = useState('');
  const [formCedula, setFormCedula] = useState('');
  const [formEmpresa, setFormEmpresa] = useState('Acumuladores Duncan, C.A.');
  const [formEstablecimiento, setFormEstablecimiento] = useState('Planta Los Ruices');
  const [formTipo, setFormTipo] = useState<EvaluacionMedica['tipoEvaluacion']>('Periódica Anual');
  const [formFecha, setFormFecha] = useState(today());
  const [formMedico, setFormMedico] = useState('Dra. Elena Silva (Médico Ocupacional SSA)');
  const [formPlombemia, setFormPlombemia] = useState<number | ''>(18.0);
  const [formAudiometria, setFormAudiometria] = useState<'Normal' | 'Hipoacusia Leve' | 'Hipoacusia Moderada'>('Normal');
  const [formAptitud, setFormAptitud] = useState<EvaluacionMedica['aptitud']>('Apto');
  const [formObservaciones, setFormObservaciones] = useState('');

  const handleSelectEmpleado = (empId: string) => {
    const found = empleados.find(e => e._id === empId);
    if (found) {
      setFormEmpleado(found.nombre);
      setFormCedula(found.cedula);
      if (found.empresaNombre) setFormEmpresa(found.empresaNombre);
    }
  };

  const handleCrearEvaluacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmpleado.trim() || !formCedula.trim()) {
      toast.error('Indica el nombre y cédula del trabajador');
      return;
    }

    const nuevaEval: EvaluacionMedica = {
      _id: `med_${Date.now()}`,
      empleadoNombre: formEmpleado.trim(),
      cedula: formCedula.trim(),
      empresaNombre: formEmpresa,
      establecimientoNombre: formEstablecimiento,
      tipoEvaluacion: formTipo,
      fecha: formFecha,
      medicoTratante: formMedico.trim(),
      plombemiaValor: formPlombemia !== '' ? Number(formPlombemia) : undefined,
      audiometria: formAudiometria,
      aptitud: formAptitud,
      observaciones: formObservaciones.trim(),
    };

    const updated = [nuevaEval, ...evaluaciones];
    setEvaluaciones(updated);
    localStorage.setItem('sgd_evaluaciones_med', JSON.stringify(updated));

    gsApi.logAudit({
      usuario: currentUser?.nombre || 'Sistema',
      accion: 'EVALUACION_MEDICA',
      entidad: 'EvaluacionMedica',
      entidadId: nuevaEval._id,
      detalles: `${nuevaEval.tipoEvaluacion} para ${nuevaEval.empleadoNombre} (${nuevaEval.cedula}) - Aptitud: ${nuevaEval.aptitud}`,
    });

    toast.success('Evaluación médica registrada correctamente');
    setModalOpen(false);
  };

  const filteredEvals = evaluaciones.filter(ev =>
    ev.empleadoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.tipoEvaluacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
              <Stethoscope className="h-6 w-6" />
            </div>
            Salud Ocupacional y Evaluaciones Médicas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Vigilancia epidemiológica, control de plombemia y aptitud física del personal Duncan (LOPCYMAT / INPSASEL)
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Evaluación Médica</span>
        </button>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Evaluaciones</p>
            <p className="text-2xl font-bold text-slate-900">{evaluaciones.length}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aptitud Laboral Óptima</p>
            <p className="text-2xl font-bold text-slate-900">
              {evaluaciones.filter(e => e.aptitud === 'Apto').length} <span className="text-xs font-normal text-slate-400">trabajadores</span>
            </p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Control Plombemia &lt; 30 µg/dL</p>
            <p className="text-2xl font-bold text-emerald-600">100% <span className="text-xs font-normal text-slate-400">bajo norma</span></p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('evaluaciones')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'evaluaciones'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Evaluaciones Ocupacionales ({evaluaciones.length})
        </button>
        <button
          onClick={() => setActiveTab('plombemia')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'plombemia'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Vigilancia de Plombemia (Pb en Sangre)
        </button>
      </div>

      {/* TAB 1: EVALUACIONES */}
      {activeTab === 'evaluaciones' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, cédula o tipo de evaluación..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input pl-9 text-sm w-full"
              />
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Trabajador</th>
                    <th className="py-3 px-4">Cédula</th>
                    <th className="py-3 px-4">Tipo Evaluación</th>
                    <th className="py-3 px-4">Plombemia (µg/dL)</th>
                    <th className="py-3 px-4">Aptitud</th>
                    <th className="py-3 px-4 text-right">Médico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvals.map(ev => {
                    const isPbHigh = ev.plombemiaValor && ev.plombemiaValor > 30;
                    return (
                      <tr key={ev._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                          {formatDate(ev.fecha)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {ev.empleadoNombre}
                          <div className="text-[11px] font-normal text-slate-400">{ev.establecimientoNombre}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                          {ev.cedula}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-800 font-medium">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {ev.tipoEvaluacion}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono font-bold">
                          {ev.plombemiaValor !== undefined ? (
                            <span className={`px-2 py-0.5 rounded ${isPbHigh ? 'bg-rose-100 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>
                              {ev.plombemiaValor} µg/dL
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            ev.aptitud === 'Apto'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ev.aptitud === 'Apto con Restricciones'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {ev.aptitud}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs text-slate-500">
                          {ev.medicoTratante}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VIGILANCIA DE PLOMBEMIA */}
      {activeTab === 'plombemia' && (
        <div className="space-y-4">
          <div className="card p-6 bg-gradient-to-r from-teal-900 to-slate-900 text-white">
            <h3 className="text-base font-bold text-teal-300 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Protocolo Duncan de Control Biológico de Plomo (Pb)
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              En cumplimiento con los estándares internacionales y de SSA Duncan para la fabricación y manejo de acumuladores eléctricos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <p className="font-bold text-emerald-400">Nivel Óptimo (&lt; 25 µg/dL)</p>
                <p className="text-[11px] text-slate-300 mt-1">Exposición controlada. Reevaluación anual rutinaria.</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <p className="font-bold text-amber-400">Nivel de Alerta (25 - 35 µg/dL)</p>
                <p className="text-[11px] text-slate-300 mt-1">Rotación temporal del puesto y revisión exhaustiva de EPP respiratorio.</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <p className="font-bold text-rose-400">Nivel Crítico (&gt; 35 µg/dL)</p>
                <p className="text-[11px] text-slate-300 mt-1">Retiro inmediato del área con plomo y tratamiento médico especializado.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA EVALUACIÓN */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-400" />
                Registrar Evaluación Médica Ocupacional
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearEvaluacion} className="p-6 space-y-4">
              {empleados.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Seleccionar Empleado
                  </label>
                  <select
                    onChange={e => handleSelectEmpleado(e.target.value)}
                    className="input w-full text-xs"
                    defaultValue=""
                  >
                    <option value="" disabled>Seleccionar de la lista de trabajadores...</option>
                    {empleados.map(e => (
                      <option key={e._id} value={e._id}>
                        {e.nombre} — {e.cedula} ({e.cargo})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre del Paciente *
                  </label>
                  <input
                    type="text"
                    required
                    value={formEmpleado}
                    onChange={e => setFormEmpleado(e.target.value)}
                    className="input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cédula *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCedula}
                    onChange={e => setFormCedula(e.target.value)}
                    className="input w-full text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo de Evaluación *
                  </label>
                  <select
                    value={formTipo}
                    onChange={e => setFormTipo(e.target.value as any)}
                    className="input w-full text-sm"
                  >
                    <option value="Periódica Anual">Periódica Anual</option>
                    <option value="Especial Plombemia">Especial Plombemia (Plomo)</option>
                    <option value="Pre-empleo">Pre-empleo (Ingreso)</option>
                    <option value="Pre-vacacional">Pre-vacacional</option>
                    <option value="Post-vacacional">Post-vacacional</option>
                    <option value="Egreso">Egreso (Retiro)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha de la Evaluación *
                  </label>
                  <input
                    type="date"
                    required
                    value={formFecha}
                    onChange={e => setFormFecha(e.target.value)}
                    className="input w-full text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Plombemia (µg/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formPlombemia}
                    onChange={e => setFormPlombemia(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="Ej: 18.5"
                    className="input w-full text-sm font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Aptitud Laboral *
                  </label>
                  <select
                    value={formAptitud}
                    onChange={e => setFormAptitud(e.target.value as any)}
                    className="input w-full text-sm font-bold"
                  >
                    <option value="Apto">Apto</option>
                    <option value="Apto con Restricciones">Apto con Restricciones</option>
                    <option value="No Apto Temporal">No Apto Temporal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Médico Ocupacional Evaluador
                </label>
                <input
                  type="text"
                  value={formMedico}
                  onChange={e => setFormMedico(e.target.value)}
                  className="input w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observaciones y Recomendaciones
                </label>
                <textarea
                  rows={2}
                  value={formObservaciones}
                  onChange={e => setFormObservaciones(e.target.value)}
                  placeholder="Recomendaciones ergonómicas, uso de EPP, fecha de reevaluación..."
                  className="input w-full text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                >
                  Guardar Evaluación Médica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}