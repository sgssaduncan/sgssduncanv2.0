import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle2, 
  Clock, 
  X, 
  Stethoscope, 
  BriefcaseMedical, 
  FileSpreadsheet,
  Printer,
  ShieldAlert,
  ShieldCheck,
  Heart,
  Palmtree
} from 'lucide-react';
import type { EvaluacionMedica } from '../types/medical';
import { useAuth } from '../hooks/useAuth';
import { dbService } from '../services/db';
import MedicalEvaluationForm from './MedicalEvaluationForm';
import MedicalEvaluationsCharts from './MedicalEvaluationsCharts';
import { exportMedicalEvaluationsData } from '../lib/exportUtils';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import VexpressDailyManager from './VexpressDailyManager';
import VexpressPressureManager from './VexpressPressureManager';
import VexpressAptitudManager from './VexpressAptitudManager';
import VexpressGoniometriaManager from './VexpressGoniometriaManager';
import VexpressMorbilidadReport from './VexpressMorbilidadReport';
import VexpressRepososManager from './VexpressRepososManager';
import VexpressReferenciasManager from './VexpressReferenciasManager';
import VexpressVacacionesManager from './VexpressVacacionesManager';
import { resolveEmpresaInfo } from '../lib/empresaResolver';

type MedicalTab = 'solicitudes' | 'consultas-diarias' | 'control-pa' | 'aptitud-apf' | 'goniometria' | 'reposos' | 'referencias' | 'vacaciones' | 'morbilidad';

export default function MedicalEvaluationsManager() {
  const { profile, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<MedicalTab>('solicitudes');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionMedica[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEval, setSelectedEval] = useState<EvaluacionMedica | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEvaluaciones = async () => {
    try {
      setLoading(true);
      const data = await dbService.getEvaluacionesMedicas();
      setEvaluaciones(data);
    } catch (error) {
      console.error("Error fetching medical evaluations:", error);
      toast.error('Error al cargar evaluaciones médicas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluaciones();
  }, []);

  const filteredEvaluaciones = evaluaciones.filter(evaluacion => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (evaluacion.empleadoNombre || '').toLowerCase().includes(searchLower) ||
      (evaluacion.empleadoCedula || '').toLowerCase().includes(searchLower) ||
      (evaluacion.tipoEvaluacion || '').replace(/_/g, ' ').toLowerCase().includes(searchLower) ||
      (evaluacion.establecimientoNombre || '').toLowerCase().includes(searchLower)
    );
  });

  const handleExportCurrentView = (format: 'excel' | 'csv') => {
    if (filteredEvaluaciones.length === 0) {
      toast.error('No hay evaluaciones en la vista actual para exportar');
      return;
    }
    exportMedicalEvaluationsData(filteredEvaluaciones, format);
    toast.success(`Exportadas ${filteredEvaluaciones.length} evaluaciones a ${format === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)'}`);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'SOLICITADA': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'AGENDADA': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REALIZADA': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELADA': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getTipoIcon = (tipo: string) => {
    if (tipo === 'ATENCION_MEDICA_PRIMARIA') return <Stethoscope size={16} />;
    if (tipo === 'POST_VACACIONAL' || tipo === 'PRE_VACACIONAL') return <BriefcaseMedical size={16} />;
    if (tipo === 'ESPECIAL_PLOMBEMIA') return <ShieldAlert size={16} className="text-orange-600" />;
    return <Activity size={16} />;
  };

  const handleUpdateEstado = async (id: string, nuevoEstado: any, aptitud?: any) => {
    try {
      const updatePayload: any = { estado: nuevoEstado };
      if (aptitud) updatePayload.aptitud = aptitud;
      await dbService.updateEvaluacionMedica(id, updatePayload);
      toast.success(`Evaluación actualizada a ${nuevoEstado}`);
      setSelectedEval(null);
      await loadEvaluaciones();
    } catch (e) {
      console.error(e);
      toast.error('Error al actualizar evaluación');
    }
  };

  const handlePrintAutorizacion = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header General */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-400 text-slate-900 rounded-xl shadow-sm">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Salud Ocupacional & Epidemiología (V-EXPRESS)</h1>
            <p className="text-sm text-slate-500">
              Evaluaciones Ocupacionales, Plombemia (PbB), Consultas Diarias, Presión Arterial, Aptitud APF, Goniometría y Morbilidad INPSASEL
            </p>
          </div>
        </div>

        {activeTab === 'solicitudes' && (
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors border border-slate-200"
            >
              {showCharts ? 'Ocultar Gráficos' : 'Ver Estadísticas'}
            </button>

            {/* Export Buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => handleExportCurrentView('excel')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm"
                title="Exportar a Excel (.xlsx)"
              >
                <FileSpreadsheet size={14} />
                Excel
              </button>
              <button
                onClick={() => handleExportCurrentView('csv')}
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
                title="Exportar a CSV (.csv)"
              >
                <FileText size={14} />
                CSV
              </button>
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl font-bold text-sm shadow-sm transition-colors ml-auto md:ml-0"
            >
              <Plus size={18} />
              Nueva Solicitud
            </button>
          </div>
        )}
      </div>

      {/* Selector de Pestañas V-EXPRESS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        <button
          onClick={() => setActiveTab('solicitudes')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shadow-sm",
            activeTab === 'solicitudes'
              ? "bg-slate-900 text-yellow-400 border border-slate-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          )}
        >
          <Activity size={16} />
          Exámenes Ocupacionales & Plombemia
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-yellow-400 border border-slate-700">
            {evaluaciones.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('consultas-diarias')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shadow-sm",
            activeTab === 'consultas-diarias'
              ? "bg-slate-900 text-yellow-400 border border-slate-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          )}
        >
          <Stethoscope size={16} />
          Consultas Diarias (REG_DIARIO)
        </button>

        <button
          onClick={() => setActiveTab('control-pa')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shadow-sm",
            activeTab === 'control-pa'
              ? "bg-slate-900 text-yellow-400 border border-slate-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          )}
        >
          <Heart size={16} className="text-red-500" />
          Control Presión Arterial (REG_CONTROL_PA)
        </button>

        <button
          onClick={() => setActiveTab('aptitud-apf')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shadow-sm",
            activeTab === 'aptitud-apf'
              ? "bg-slate-900 text-yellow-400 border border-slate-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          )}
        >
          <ShieldCheck size={16} className="text-blue-500" />
          Aptitud Psicofísica (REG_APF)
        </button>

        <button
          onClick={() => setActiveTab('goniometria')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shadow-sm",
            activeTab === 'goniometria'
              ? "bg-slate-900 text-yellow-400 border border-slate-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          )}
        >
          <ShieldAlert size={16} className="text-purple-500" />
          Goniometría Articular (REG_GONIOMETRÍA)
        </button>

        <button
          onClick={() => setActiveTab('reposos')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shadow-sm",
            activeTab === 'reposos'
              ? "bg-slate-900 text-yellow-400 border border-slate-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          )}
        >
          <Clock size={16} className="text-amber-500" />
          Reposos Médicos (REG_REPOSO)
        </button>

        <button
          onClick={() => setActiveTab('referencias')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shadow-sm",
            activeTab === 'referencias'
              ? "bg-slate-900 text-yellow-400 border border-slate-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          )}
        >
          <BriefcaseMedical size={16} className="text-cyan-500" />
          Referencias Especialistas
        </button>

        <button
          onClick={() => setActiveTab('vacaciones')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shadow-sm",
            activeTab === 'vacaciones'
              ? "bg-slate-900 text-yellow-400 border border-slate-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          )}
        >
          <Palmtree size={16} className="text-emerald-500" />
          Control Vacacional & Fatiga
        </button>

        <button
          onClick={() => setActiveTab('morbilidad')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shadow-sm",
            activeTab === 'morbilidad'
              ? "bg-slate-900 text-yellow-400 border border-slate-800"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          )}
        >
          <FileSpreadsheet size={16} className="text-emerald-600" />
          Morbilidad INPSASEL
        </button>
      </div>

      {/* Contenido Condicional según Pestaña Activa */}
      {activeTab === 'solicitudes' && (
        <>
          {/* Analytics Charts */}
          {showCharts && evaluaciones.length > 0 && (
            <MedicalEvaluationsCharts evaluaciones={evaluaciones} />
          )}

          {/* Search and Filters */}
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar trabajador por nombre, cédula, tipo de examen o sede..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* List of Evaluations */}
          {loading ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 text-slate-400">
              Cargando registros médicos...
            </div>
          ) : filteredEvaluaciones.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <BriefcaseMedical size={24} />
              </div>
              <h3 className="font-bold text-slate-700">No se encontraron evaluaciones médicas</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                {searchQuery ? 'Prueba ajustando los términos de búsqueda.' : 'Genera una nueva solicitud de evaluación ocupacional o control de plombemia.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredEvaluaciones.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedEval(item)}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 bg-slate-50 text-slate-700 border-slate-200">
                          {getTipoIcon(item.tipoEvaluacion)}
                          {item.tipoEvaluacion.replace(/_/g, ' ')}
                        </span>
                        <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full border", getStatusColor(item.estado))}>
                          {item.estado}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-800 text-base">{item.empleadoNombre}</h3>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <User size={12} /> C.I. {item.empleadoCedula} • {item.empleadoCargo}
                        </div>
                      </div>

                      {/* Highlights de Plombemia o Vacaciones */}
                      {item.plombemiaPbB !== undefined && (
                        <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between text-xs">
                          <span className="font-semibold text-orange-900">Plomo en Sangre (PbB):</span>
                          <span className={cn(
                            "font-bold px-2 py-0.5 rounded-full",
                            item.plombemiaPbB < 30 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          )}>
                            {item.plombemiaPbB} µg/dL {item.plombemiaPbB < 30 ? '(Normal)' : '(Elevado)'}
                          </span>
                        </div>
                      )}

                      {item.alertaFatiga && (
                        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-1.5">
                          <Clock size={14} className="text-blue-600 shrink-0" />
                          <span>Alerta de Fatiga: Chofer con vacaciones pendientes</span>
                        </div>
                      )}

                      <div className="text-xs text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>Solicitado: {item.fechaSolicitud}</span>
                        </div>
                        {item.fechaAgendada && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400" />
                            <span>Cita: {item.fechaAgendada}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                      <span className="truncate max-w-[150px]">{item.clinicaAutorizada || 'Clínica asignada'}</span>
                      <span className="font-semibold text-yellow-600 hover:text-yellow-700">Ver Formato &rarr;</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Submódulos V-EXPRESS */}
      {activeTab === 'consultas-diarias' && <VexpressDailyManager />}
      {activeTab === 'control-pa' && <VexpressPressureManager />}
      {activeTab === 'aptitud-apf' && <VexpressAptitudManager />}
      {activeTab === 'goniometria' && <VexpressGoniometriaManager />}
      {activeTab === 'reposos' && <VexpressRepososManager />}
      {activeTab === 'referencias' && <VexpressReferenciasManager />}
      {activeTab === 'vacaciones' && (
        <VexpressVacacionesManager 
          onSolicitarPreVacacional={(_emp) => {
            setIsFormOpen(true);
          }} 
        />
      )}
      {activeTab === 'morbilidad' && <VexpressMorbilidadReport />}

      {/* Formulario Modal */}
      {isFormOpen && (
        <MedicalEvaluationForm
          onClose={() => setIsFormOpen(false)}
          onSaved={loadEvaluaciones}
        />
      )}

      {/* Modal de Detalle y Formato de Autorización */}
      {selectedEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 my-8"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center print:bg-white print:text-black">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400 text-slate-900 rounded-lg print:hidden">
                  <Activity size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Autorización de Evaluación Médica Ocupacional</h2>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    {resolveEmpresaInfo({
                      empresaNombre: selectedEval.empresaNombre,
                      establecimientoNombre: selectedEval.establecimientoNombre,
                    }).nombre} • RIF: {resolveEmpresaInfo({
                      empresaNombre: selectedEval.empresaNombre,
                      establecimientoNombre: selectedEval.establecimientoNombre,
                    }).rif} • Servicio Médico SSA
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedEval(null)} className="text-slate-400 hover:text-white print:hidden">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Número de Autorización:</div>
                  <div className="text-sm font-bold text-slate-800">{selectedEval.numeroAutorizacion || `AUT-MED-${(selectedEval.id || (selectedEval as any)._id || '001').substring(0, 8)}`}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-semibold">Estado:</div>
                  <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full border", getStatusColor(selectedEval.estado))}>
                    {selectedEval.estado}
                  </span>
                </div>
              </div>

              {/* Datos del Paciente */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Información del Trabajador</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="font-semibold text-slate-600">Nombre:</span> {selectedEval.empleadoNombre}</div>
                  <div><span className="font-semibold text-slate-600">Cédula:</span> {selectedEval.empleadoCedula}</div>
                  <div><span className="font-semibold text-slate-600">Cargo:</span> {selectedEval.empleadoCargo}</div>
                  <div><span className="font-semibold text-slate-600">Departamento:</span> {selectedEval.empleadoDepartamento || 'Operaciones'}</div>
                </div>
              </div>

              {/* Datos Médicos */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detalles de la Evaluación</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="font-semibold text-slate-600">Tipo:</span> {selectedEval.tipoEvaluacion.replace(/_/g, ' ')}</div>
                  <div><span className="font-semibold text-slate-600">Fecha Solicitud:</span> {selectedEval.fechaSolicitud}</div>
                  <div><span className="font-semibold text-slate-600">Centro Médico:</span> {selectedEval.clinicaAutorizada || 'Laboratorio Ocupacional'}</div>
                  <div><span className="font-semibold text-slate-600">Fecha Cita:</span> {selectedEval.fechaAgendada || 'Por programar'}</div>
                </div>
              </div>

              {/* Resultados si están disponibles */}
              {selectedEval.plombemiaPbB !== undefined && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={14} /> Resultados de Laboratorio de Plombemia
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-orange-950">
                    <div><span className="font-semibold">Plomo en Sangre (PbB):</span> {selectedEval.plombemiaPbB} µg/dL</div>
                    <div><span className="font-semibold">Ácido Delta-Aminolevulínico:</span> {selectedEval.plombemiaALA || 'Normal'} mg/g</div>
                    <div><span className="font-semibold">Aptitud Laboral:</span> {selectedEval.aptitud || 'Apto'}</div>
                    <div><span className="font-semibold">Límite COVENIN:</span> &lt; 30 µg/dL</div>
                  </div>
                </div>
              )}

              {/* Firmas Oficiales */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                <div className="text-center">
                  <div className="border-b border-slate-400 h-14 mb-1"></div>
                  <div className="text-xs font-bold text-slate-700">Firma Médico / Laboratorio</div>
                  <div className="text-[10px] text-slate-400">Sello Húmedo y MPPS</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-400 h-14 mb-1"></div>
                  <div className="text-xs font-bold text-slate-700">Trabajador Autorizado</div>
                  <div className="text-[10px] text-slate-400">Firma y Huella Dactilar</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center print:hidden">
              <div className="flex gap-2">
                {selectedEval.estado === 'SOLICITADA' && (
                  <button
                    onClick={() => handleUpdateEstado(selectedEval.id, 'AGENDADA')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    Marcar Agendada
                  </button>
                )}
                {selectedEval.estado === 'AGENDADA' && (
                  <button
                    onClick={() => handleUpdateEstado(selectedEval.id, 'REALIZADA', 'APTO')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    Marcar Realizada / Apto
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrintAutorizacion}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  <Printer size={14} /> Imprimir Formato
                </button>
                <button
                  onClick={() => setSelectedEval(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
