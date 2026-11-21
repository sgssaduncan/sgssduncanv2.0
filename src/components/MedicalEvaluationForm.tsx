import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Save, ShieldAlert, Calendar, User, FileText, Clock, AlertTriangle, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { dbService } from '../services/db';
import toast from 'react-hot-toast';
import type { EvaluacionMedica, TipoEvaluacionMedica } from '../types/medical';

interface MedicalEvaluationFormProps {
  onClose: () => void;
  onSaved?: () => void;
}

const TIPOS_EVALUACION: { id: TipoEvaluacionMedica; label: string }[] = [
  { id: 'PRE_EMPLEO', label: 'Pre-Empleo' },
  { id: 'PERIODICA_ANUAL', label: 'Periódica Anual' },
  { id: 'PRE_VACACIONAL', label: 'Pre-Vacacional' },
  { id: 'POST_VACACIONAL', label: 'Post-Vacacional' },
  { id: 'EGRESO', label: 'Egreso' },
  { id: 'ESPECIAL_PLOMBEMIA', label: 'Especial Plombemia (PbB / ALA - Duncan)' },
  { id: 'ESPECIAL', label: 'Especial (Reubicación / Reingreso)' },
  { id: 'ATENCION_MEDICA_PRIMARIA', label: 'Consulta / Atención Médica Primaria' },
];

export default function MedicalEvaluationForm({ onClose, onSaved }: MedicalEvaluationFormProps) {
  const { profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [tipo, setTipo] = useState<TipoEvaluacionMedica>('PRE_EMPLEO');
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [fechaAgendada, setFechaAgendada] = useState('');
  const [fechaInicioVacaciones, setFechaInicioVacaciones] = useState('');
  const [fechaReintegro, setFechaReintegro] = useState('');
  const [motivo, setMotivo] = useState('');
  const [clinica, setClinica] = useState('Laboratorio Central Ocupacional');
  const [plombemiaValor, setPlombemiaValor] = useState<string>('');

  const handleSave = async () => {
    if (!nombre || !cedula || !cargo) {
      toast.error('Complete los datos obligatorios del trabajador.');
      return;
    }
    if (tipo === 'PRE_VACACIONAL' && !fechaReintegro) {
      toast.error('La fecha de reintegro es obligatoria para evaluaciones pre-vacacionales.');
      return;
    }
    if ((tipo === 'ATENCION_MEDICA_PRIMARIA' || tipo === 'ESPECIAL') && !motivo.trim()) {
      toast.error('El motivo y detalles son obligatorios para este tipo de solicitud.');
      return;
    }

    setSubmitting(true);
    toast.loading('Generando solicitud médica...', { id: 'save-eval' });

    try {
      const evalData: Partial<EvaluacionMedica> = {
        empleadoNombre: nombre,
        empleadoCedula: cedula,
        empleadoCargo: cargo,
        empleadoDepartamento: departamento,
        tipoEvaluacion: tipo,
        estado: fechaAgendada ? 'AGENDADA' : 'SOLICITADA',
        fechaSolicitud: new Date().toISOString().split('T')[0],
        fechaAgendada: fechaAgendada || undefined,
        fechaInicioVacaciones: fechaInicioVacaciones || undefined,
        fechaReintegro: fechaReintegro || undefined,
        motivoConsulta: motivo || undefined,
        clinicaAutorizada: clinica,
        numeroAutorizacion: `AUT-MED-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
        solicitadoPor: profile?.id || 'usr_admin',
        solicitadoPorNombre: profile?.displayName || profile?.nombre || 'Servicio SSA Duncan',
        alertaFatiga: tipo === 'PRE_VACACIONAL' && cargo.toLowerCase().includes('chofer')
      };

      if (plombemiaValor) {
        evalData.plombemiaPbB = parseFloat(plombemiaValor);
      }

      await dbService.saveEvaluacionMedica(evalData);
      toast.success('Solicitud médica registrada correctamente', { id: 'save-eval' });
      if (onSaved) onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error al generar la solicitud médica', { id: 'save-eval' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 my-8"
      >
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 text-slate-900 rounded-lg">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Solicitud de Examen Médico Ocupacional</h2>
              <p className="text-sm text-slate-400">Control de Salud Ocupacional, Plombemia y Vacaciones Duncan</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {/* Tipo de Evaluación */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Tipo de Evaluación Médica
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TIPOS_EVALUACION.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTipo(t.id)}
                  className={`p-3 rounded-xl border text-left font-medium text-xs transition-colors flex items-center gap-2 ${
                    tipo === t.id
                      ? 'bg-yellow-50 border-yellow-400 text-yellow-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${tipo === t.id ? 'bg-yellow-500' : 'bg-slate-300'}`} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alerta especial de Plombemia */}
          {tipo === 'ESPECIAL_PLOMBEMIA' && (
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-3">
              <ShieldAlert size={18} className="text-orange-600 shrink-0 mt-0.5" />
              <div className="text-xs text-orange-900">
                <span className="font-bold">Monitoreo Biológico de Plomo en Sangre (COVENIN / LOPCYMAT):</span>
                <p className="mt-1">
                  Obligatorio periódicamente para operadores expuestos a fabricación, fundición, carga ácida y recuperación de baterías de plomo. Límite permisible: &lt; 30 µg/dL.
                </p>
              </div>
            </div>
          )}

          {/* Datos del Trabajador */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} /> Datos del Trabajador
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Cédula de Identidad *</label>
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="Ej. V-15892341"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Cargo / Puesto *</label>
                <input
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ej. Chofer de Carga / Técnico de Carga"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Departamento / Área</label>
                <input
                  type="text"
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  placeholder="Ej. Distribución / Taller Servicentro"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-yellow-400"
                />
              </div>
            </div>
          </div>

          {/* Fechas y Vacaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Fecha Sugerida de Cita</label>
              <input
                type="date"
                value={fechaAgendada}
                onChange={(e) => setFechaAgendada(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Clínica / Laboratorio Autorizado</label>
              <input
                type="text"
                value={clinica}
                onChange={(e) => setClinica(e.target.value)}
                placeholder="Centro médico asignado"
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          {tipo === 'PRE_VACACIONAL' && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
              <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Clock size={14} /> Control Vacacional y Prevención de Fatiga
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-blue-800 block mb-1">Fecha Inicio Vacaciones</label>
                  <input
                    type="date"
                    value={fechaInicioVacaciones}
                    onChange={(e) => setFechaInicioVacaciones(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-blue-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-blue-800 block mb-1">Fecha Estimada de Reintegro *</label>
                  <input
                    type="date"
                    value={fechaReintegro}
                    onChange={(e) => setFechaReintegro(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-blue-200 rounded-lg outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Motivo / Observaciones Médicas</label>
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describa el motivo de la consulta, antecedentes o restricciones observadas..."
              className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-yellow-400"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-sm transition-colors text-sm"
          >
            <Save size={16} />
            {submitting ? 'Generando...' : 'Emitir Autorización'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
