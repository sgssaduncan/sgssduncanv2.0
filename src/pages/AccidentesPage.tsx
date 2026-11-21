import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  FileSpreadsheet, 
  FileText, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  Clock, 
  GitBranch, 
  ArrowRight,
  Download,
  X,
  Save,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { dbService } from '../services/db';
import type { 
  AccidenteF465, 
  TipoSuceso, 
  GravedadAccidente, 
  InvestigacionArbolCausas, 
  NodoCausa, 
  MedidaCorrectiva 
} from '../types/accidents';
import { exportCurrentViewData } from '../lib/exportUtils';
import { cn } from '../lib/utils';
import { generarInformeAccidentePDF } from '../lib/pdfGenerator';
import toast from 'react-hot-toast';

export default function AccidentesPage() {
  const { profile, isSuperAdmin } = useAuth();
  const [accidentes, setAccidentes] = useState<AccidenteF465[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccidente, setSelectedAccidente] = useState<AccidenteF465 | null>(null);

  // Form State para F-465 INPSASEL
  const [tipoSuceso, setTipoSuceso] = useState<TipoSuceso>('ACCIDENTE_TRABAJO');
  const [gravedad, setGravedad] = useState<GravedadAccidente>('LEVE');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [cedula, setCedula] = useState('');
  const [edad, setEdad] = useState<number>(30);
  const [genero, setGenero] = useState<'M' | 'F'>('M');
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState('Almacén');
  const [sedeEmpresa, setSedeEmpresa] = useState('Distribuidora Duncan Caracas');
  const [fechaAccidente, setFechaAccidente] = useState('');
  const [horaAccidente, setHoraAccidente] = useState('10:00');
  const [lugarExacto, setLugarExacto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoLesion, setTipoLesion] = useState('');
  const [parteCuerpo, setParteCuerpo] = useState('');
  const [agenteMaterial, setAgenteMaterial] = useState('Batería Duncan');
  const [diasReposo, setDiasReposo] = useState<number>(0);
  const [notificadoINPSASEL, setNotificadoINPSASEL] = useState(true);
  const [registroINPSASEL, setRegistroINPSASEL] = useState('');

  // Árbol de Causas
  const [incluirArbol, setIncluirArbol] = useState(false);
  const [hechoFinal, setHechoFinal] = useState('');
  const [causasInmediatas, setCausasInmediatas] = useState<string[]>(['']);
  const [causasBasicas, setCausasBasicas] = useState<string[]>(['']);
  const [medidasCorrectivas, setMedidasCorrectivas] = useState<{ accion: string; responsable: string; fecha: string }[]>([
    { accion: '', responsable: 'Supervisor de Área', fecha: '' }
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dbService.getAccidentesF465();
      setAccidentes(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar accidentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Estadísticas COVENIN 474-97
  const totalAccidentes = accidentes.length;
  const totalConPerdida = accidentes.filter(a => a.diasReposoMedico > 0).length;
  const totalDiasPerdidos = accidentes.reduce((acc, a) => acc + (a.diasReposoMedico || 0), 0);
  const hhtEstimadas = 250000; // Horas Hombre Trabajadas base para Duncan
  const indiceFrecuenciaBruta = ((totalAccidentes * 1000000) / hhtEstimadas).toFixed(2);
  const indiceFrecuenciaNeta = ((totalConPerdida * 1000000) / hhtEstimadas).toFixed(2);
  const indiceSeveridad = ((totalDiasPerdidos * 1000000) / hhtEstimadas).toFixed(2);

  const handleSaveAccidente = async () => {
    if (!nombreCompleto || !cedula || !fechaAccidente || !descripcion) {
      toast.error('Complete los campos obligatorios del accidente.');
      return;
    }

    try {
      let arbolData: InvestigacionArbolCausas | undefined = undefined;
      if (incluirArbol && hechoFinal) {
        arbolData = {
          accidenteId: '',
          fechaInvestigacion: new Date().toISOString().split('T')[0],
          equipoInvestigador: ['Comité CSSL', profile?.displayName || 'Supervisor SSA'],
          hechoFinal,
          nodos: [
            ...causasInmediatas.filter(Boolean).map((c, i) => ({
              id: `ci_${i}`,
              tipo: 'CAUSA_INMEDIATA' as const,
              descripcion: c,
              categoria: 'TAREA' as const
            })),
            ...causasBasicas.filter(Boolean).map((c, i) => ({
              id: `cb_${i}`,
              tipo: 'CAUSA_BASICA' as const,
              descripcion: c,
              categoria: 'ORGANIZACION' as const
            }))
          ],
          causasInmediatas: causasInmediatas.filter(Boolean),
          causasBasicas: causasBasicas.filter(Boolean),
          medidasCorrectivas: medidasCorrectivas.filter(m => m.accion).map((m, i) => ({
            id: `mc_${i}`,
            accion: m.accion,
            responsable: m.responsable,
            fechaCompromiso: m.fecha || new Date().toISOString().split('T')[0],
            estado: 'PENDIENTE',
            prioridad: 'ALTA'
          })),
          conclusiones: 'Investigación técnica conforme a la metodología de Árbol de Causas e INPSASEL.'
        };
      }

      await dbService.saveAccidenteF465({
        tipoSuceso,
        gravedad,
        empleadoId: 'emp_lesionado',
        nombreCompleto,
        cedula,
        edad,
        genero,
        cargo,
        antiguedadPuesto: '1 año',
        departamento,
        sedeEmpresa,
        fechaAccidente,
        horaAccidente,
        jornadaHoras: 8,
        lugarExacto,
        actividadHabitual: true,
        descripcionDetallada: descripcion,
        tipoLesion,
        parteCuerpoAfectada: parteCuerpo,
        agenteMaterial,
        diasReposoMedico: diasReposo,
        diasPerdidos: diasReposo,
        diasCargados: 0,
        notificadoINPSASEL,
        numeroRegistroINPSASEL: registroINPSASEL || undefined,
        comiteCSSLNotificado: true,
        investigacionCompleta: Boolean(arbolData),
        investigadorId: profile?.id || 'usr_admin',
        investigadorNombre: profile?.displayName || 'Servicio SSA Duncan',
        arbolCausas: arbolData
      });

      toast.success('Notificación F-465 registrada con éxito');
      setIsModalOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error('Error al registrar el accidente');
    }
  };

  const handleExport = (format: 'excel' | 'csv') => {
    if (accidentes.length === 0) {
      toast.error('No hay accidentes para exportar');
      return;
    }
    const dataToExport = accidentes.map(a => ({
      'Correlativo': a.correlativo,
      'Fecha Notificación': a.fechaNotificacion,
      'Tipo Suceso': a.tipoSuceso,
      'Gravedad': a.gravedad,
      'Trabajador': a.nombreCompleto,
      'Cédula': a.cedula,
      'Cargo': a.cargo,
      'Departamento': a.departamento,
      'Sede': a.sedeEmpresa,
      'Fecha Suceso': a.fechaAccidente,
      'Hora': a.horaAccidente,
      'Lugar': a.lugarExacto,
      'Lesión': a.tipoLesion,
      'Parte Afectada': a.parteCuerpoAfectada,
      'Agente Material': a.agenteMaterial,
      'Días Reposo': a.diasReposoMedico,
      'INPSASEL Notificado': a.notificadoINPSASEL ? 'SÍ' : 'NO',
      'N° Registro INPSASEL': a.numeroRegistroINPSASEL || 'Pendiente'
    }));

    exportCurrentViewData(dataToExport, format, `Estadistica_Accidentabilidad_INPSASEL_${new Date().toISOString().split('T')[0]}`);
    toast.success(`Exportados ${accidentes.length} registros a ${format === 'excel' ? 'Excel' : 'CSV'}`);
  };

  const filtered = accidentes.filter(a => {
    const q = searchQuery.toLowerCase();
    return (
      a.correlativo.toLowerCase().includes(q) ||
      a.nombreCompleto.toLowerCase().includes(q) ||
      a.cedula.toLowerCase().includes(q) ||
      a.sedeEmpresa.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-400 text-slate-900 rounded-xl shadow-sm">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Accidentabilidad, Morbilidad y Árbol de Causas</h1>
            <p className="text-sm text-slate-500">
              Notificación Formal F-465 INPSASEL, Estadísticas COVENIN 474-97 y Asistente de Investigación
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Export Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm"
              title="Exportar a Excel (.xlsx)"
            >
              <FileSpreadsheet size={14} />
              Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
              title="Exportar a CSV"
            >
              <FileText size={14} />
              CSV
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl font-bold text-sm shadow-sm transition-colors ml-auto md:ml-0"
          >
            <Plus size={18} />
            Nueva Notificación F-465
          </button>
        </div>
      </div>

      {/* Indicadores COVENIN 474-97 & Balance Visual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Accidentes / Incidentes</div>
          <div className="text-2xl font-bold text-slate-800">{totalAccidentes}</div>
          <div className="text-xs text-slate-500">Con pérdida: {totalConPerdida} • Sin pérdida: {totalAccidentes - totalConPerdida}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Días Perdidos / Reposo</div>
          <div className="text-2xl font-bold text-orange-600">{totalDiasPerdidos} días</div>
          <div className="text-xs text-slate-500">Severidad de lesiones acumuladas</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Índice Frecuencia (IF)</div>
          <div className="text-2xl font-bold text-blue-600">{indiceFrecuenciaBruta}</div>
          <div className="text-xs text-slate-500">Accidentes por millón de HHT</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Índice Severidad (IS)</div>
          <div className="text-2xl font-bold text-red-600">{indiceSeveridad}</div>
          <div className="text-xs text-slate-500">Días perdidos por millón de HHT</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por trabajador, cédula, correlativo o sede..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
        />
      </div>

      {/* List of Accidents */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 text-slate-400">
          Cargando registro de accidentabilidad...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 space-y-3">
          <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
          <h3 className="font-bold text-slate-700">Sin sucesos registrados en este período</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Excelente desempeño de seguridad. Las notificaciones oficiales F-465 y los análisis de Árbol de Causas se listarán aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(a => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedAccidente(a)}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer space-y-3"
              >
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-lg border",
                    a.gravedad === 'LEVE' && "bg-amber-50 text-amber-700 border-amber-200",
                    a.gravedad === 'MODERADO' && "bg-orange-50 text-orange-700 border-orange-200",
                    (a.gravedad === 'GRAVE' || a.gravedad === 'MUY_GRAVE' || a.gravedad === 'FATAL') && "bg-red-50 text-red-700 border-red-200"
                  )}>
                    {a.gravedad} • {a.correlativo}
                  </span>
                  {a.notificadoINPSASEL && (
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                      INPSASEL OK
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-base">{a.nombreCompleto}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {a.cargo} • {a.sedeEmpresa}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 line-clamp-2">
                  {a.descripcionDetallada}
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-50">
                  <span>Días reposo: <strong className="text-slate-800">{a.diasReposoMedico}</strong></span>
                  <span className="font-semibold text-yellow-600">Ver F-465 &rarr;</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal F-465 INPSASEL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 my-8"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400 text-slate-900 rounded-lg">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Notificación de Accidente de Trabajo (Formato F-465 INPSASEL)</h2>
                  <p className="text-sm text-slate-400">Declaración Formal, Registro Técnico y Árbol de Causas Duncan</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {/* Clasificación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tipo de Suceso</label>
                  <select
                    value={tipoSuceso}
                    onChange={(e) => setTipoSuceso(e.target.value as TipoSuceso)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                  >
                    <option value="ACCIDENTE_TRABAJO">Accidente de Trabajo</option>
                    <option value="INCIDENTE_PELIGROSO">Incidente Peligroso (Sin Lesión)</option>
                    <option value="ENFERMEDAD_OCUPACIONAL">Enfermedad Ocupacional</option>
                    <option value="ACCIDENTE_ITINERE">Accidente de Trayecto (In Itinere)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Gravedad de la Lesión</label>
                  <select
                    value={gravedad}
                    onChange={(e) => setGravedad(e.target.value as GravedadAccidente)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                  >
                    <option value="LEVE">Leve</option>
                    <option value="MODERADO">Moderado</option>
                    <option value="GRAVE">Grave</option>
                    <option value="MUY_GRAVE">Muy Grave</option>
                    <option value="FATAL">Fatal</option>
                  </select>
                </div>
              </div>

              {/* Datos del Lesionado */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} /> Datos del Trabajador Afectado
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      value={nombreCompleto}
                      onChange={(e) => setNombreCompleto(e.target.value)}
                      placeholder="Ej. Marcos Aurelio Pérez"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Cédula de Identidad *</label>
                    <input
                      type="text"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      placeholder="Ej. V-19874123"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Cargo Desempeñado</label>
                    <input
                      type="text"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      placeholder="Ej. Operador de Almacén / Chofer"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Sede / Localidad Duncan</label>
                    <input
                      type="text"
                      value={sedeEmpresa}
                      onChange={(e) => setSedeEmpresa(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Circunstancias del Accidente */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} /> Circunstancias del Suceso
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Fecha del Suceso *</label>
                    <input
                      type="date"
                      value={fechaAccidente}
                      onChange={(e) => setFechaAccidente(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Hora del Suceso</label>
                    <input
                      type="time"
                      value={horaAccidente}
                      onChange={(e) => setHoraAccidente(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Días de Reposo Médico</label>
                    <input
                      type="number"
                      value={diasReposo}
                      onChange={(e) => setDiasReposo(Number(e.target.value))}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Parte del Cuerpo Afectada</label>
                    <input
                      type="text"
                      value={parteCuerpo}
                      onChange={(e) => setParteCuerpo(e.target.value)}
                      placeholder="Ej. Pie derecho / Mano izquierda"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Agente Material / Objeto</label>
                    <input
                      type="text"
                      value={agenteMaterial}
                      onChange={(e) => setAgenteMaterial(e.target.value)}
                      placeholder="Ej. Batería 34MR / Ácido Sulfúrico"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Lugar Exacto dentro de la Sede</label>
                  <input
                    type="text"
                    value={lugarExacto}
                    onChange={(e) => setLugarExacto(e.target.value)}
                    placeholder="Ej. Pasillo de carga, rampa de despacho, almacén de cascos usados..."
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Descripción Detallada del Hecho *</label>
                  <textarea
                    rows={3}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describa cómo ocurrió el suceso, posición del trabajador, actividad que realizaba y mecanismo de lesión..."
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Asistente Árbol de Causas */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <GitBranch size={14} /> Asistente de Investigación: Árbol de Causas
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-yellow-800">
                    <input
                      type="checkbox"
                      checked={incluirArbol}
                      onChange={(e) => setIncluirArbol(e.target.checked)}
                      className="rounded text-yellow-500"
                    />
                    Habilitar Árbol de Causas
                  </label>
                </div>

                {incluirArbol && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Hecho Final / Lesión Producida</label>
                      <input
                        type="text"
                        value={hechoFinal}
                        onChange={(e) => setHechoFinal(e.target.value)}
                        placeholder="Ej. Caída de batería sobre el pie derecho produciendo contusión"
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Causas Inmediatas (Actos / Condiciones)</label>
                        {causasInmediatas.map((c, i) => (
                          <input
                            key={i}
                            type="text"
                            value={c}
                            onChange={(e) => {
                              const next = [...causasInmediatas];
                              next[i] = e.target.value;
                              setCausasInmediatas(next);
                            }}
                            placeholder={`Causa Inmediata #${i + 1}`}
                            className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none mb-1.5"
                          />
                        ))}
                        <button
                          type="button"
                          onClick={() => setCausasInmediatas(prev => [...prev, ''])}
                          className="text-[11px] font-bold text-yellow-700 hover:text-yellow-800"
                        >
                          + Añadir Causa Inmediata
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Causas Básicas (Organización / Factores)</label>
                        {causasBasicas.map((c, i) => (
                          <input
                            key={i}
                            type="text"
                            value={c}
                            onChange={(e) => {
                              const next = [...causasBasicas];
                              next[i] = e.target.value;
                              setCausasBasicas(next);
                            }}
                            placeholder={`Causa Básica #${i + 1}`}
                            className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none mb-1.5"
                          />
                        ))}
                        <button
                          type="button"
                          onClick={() => setCausasBasicas(prev => [...prev, ''])}
                          className="text-[11px] font-bold text-yellow-700 hover:text-yellow-800"
                        >
                          + Añadir Causa Básica
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveAccidente}
                className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-sm text-sm"
              >
                <Save size={16} />
                Registrar Declaración F-465
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Detalle F-465 */}
      {selectedAccidente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 my-8"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedAccidente.correlativo}</h2>
                <p className="text-xs text-slate-400">{selectedAccidente.tipoSuceso} • {selectedAccidente.nombreCompleto}</p>
              </div>
              <button onClick={() => setSelectedAccidente(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-semibold text-slate-500">Fecha del Accidente:</div>
                  <div className="font-bold text-sm">{selectedAccidente.fechaAccidente} a las {selectedAccidente.horaAccidente}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-500">Días de Reposo:</div>
                  <div className="font-bold text-sm text-orange-600">{selectedAccidente.diasReposoMedico} días</div>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-800">Descripción del Suceso:</div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-1">
                  {selectedAccidente.descripcionDetallada}
                </div>
              </div>

              {selectedAccidente.arbolCausas && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl space-y-2">
                  <div className="font-bold text-yellow-900 flex items-center gap-1.5">
                    <GitBranch size={14} /> Metodología Árbol de Causas
                  </div>
                  <div>
                    <strong>Hecho Final:</strong> {selectedAccidente.arbolCausas.hechoFinal}
                  </div>
                  <div>
                    <strong>Causas Inmediatas:</strong> {selectedAccidente.arbolCausas.causasInmediatas.join(', ')}
                  </div>
                  <div>
                    <strong>Causas Básicas:</strong> {selectedAccidente.arbolCausas.causasBasicas.join(', ')}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  try {
                    const { doc, fileName } = generarInformeAccidentePDF(selectedAccidente);
                    doc.save(fileName);
                    toast.success('Informe Técnico-Legal F-465 descargado');
                  } catch (e) {
                    console.error(e);
                    toast.error('Error generando informe técnico');
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Download size={15} />
                Descargar Informe Técnico-Legal (PDF)
              </button>
              <button
                onClick={() => setSelectedAccidente(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
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
