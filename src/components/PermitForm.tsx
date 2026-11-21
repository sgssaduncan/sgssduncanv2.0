import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, X, Plus, Trash2, CheckCircle2, Clock, Landmark, HardHat, FileWarning, Gauge, MapPin, Key, Anchor, ChevronDown, CheckCircle, Flame, Snowflake, Workflow, Eye, UserCheck, Play } from 'lucide-react';
import type { PermisoTrabajo, TipoTrabajoRiesgoso, EvaluacionAST, ChecklistConfinados, ChecklistAltura, ChecklistLoto, ChecklistExcavacion, ChecklistIzamiento } from '../types/permits';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import SignaturePad from './SignaturePad';
import toast from 'react-hot-toast';
import InteractiveMap from './InteractiveMap';

interface PermitFormProps {
  onClose: () => void;
  onSave?: (permiso: Partial<PermisoTrabajo>) => void;
}

export default function PermitForm({ onClose, onSave }: PermitFormProps) {
  const { profile } = useAuth();
  
  // High-Risk ISO 45001 variables
  const [tipoPermisoPrincipal, setTipoPermisoPrincipal] = useState<'FRIO' | 'CALIENTE'>('FRIO');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [vigenciaInicio, setVigenciaInicio] = useState('');
  const [vigenciaFin, setVigenciaFin] = useState('');
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | undefined>(undefined);

  // Annexed Certificates flags
  const [anexoConfinados, setAnexoConfinados] = useState(false);
  const [anexoAltura, setAnexoAltura] = useState(false);
  const [anexoLoto, setAnexoLoto] = useState(false);
  const [anexoExcavacion, setAnexoExcavacion] = useState(false);
  const [anexoIzamiento, setAnexoIzamiento] = useState(false);

  // Checklist 1: Confinados Atmospheric readings and items
  const [o2, setO2] = useState<number>(20.9);
  const [lel, setLel] = useState<number>(0);
  const [co, setCo] = useState<number>(0);
  const [h2s, setH2s] = useState<number>(0);
  const [vigenciaGases, setVigenciaGases] = useState('');
  const [inspectorAtmosfera, setInspectorAtmosfera] = useState('');
  const [confVentilacion, setConfVentilacion] = useState(false);
  const [confIluminacion, setConfIluminacion] = useState(false);
  const [confArriesgado, setConfArriesgado] = useState(false);

  // Checklist 2: Altura requirements
  const [arnesOk, setArnesOk] = useState(false);
  const [anclajesOk, setAnclajesOk] = useState(false);
  const [lineasVidaOk, setLineasVidaOk] = useState(false);
  const [altBarandasOk, setAltBarandasOk] = useState(false);
  const [altCapacitacionOk, setAltCapacitacionOk] = useState(false);
  const [altAptoSaludOk, setAltAptoSaludOk] = useState(false);

  // Checklist 3: LOTO Control of Energetic Hazards
  const [lotoApagado, setLotoApagado] = useState(false);
  const [lotoAislamiento, setLotoAislamiento] = useState(false);
  const [lotoCandados, setLotoCandados] = useState(false);
  const [lotoEtiquetas, setLotoEtiquetas] = useState(false);
  const [lotoAlivio, setLotoAlivio] = useState(false);
  const [lotoPruebaCero, setLotoPruebaCero] = useState(false);

  // Checklist 4: Excavacion
  const [excEntibacion, setExcEntibacion] = useState(false);
  const [excDistancia, setExcDistancia] = useState(false);
  const [excRedesSubt, setExcRedesSubt] = useState(false);
  const [excAccesos, setExcAccesos] = useState(false);
  const [excEscaleras, setExcEscaleras] = useState(false);

  // Checklist 5: Izamiento
  const [izaVientos, setIzaVientos] = useState(false);
  const [izaAparejos, setIzaAparejos] = useState(false);
  const [izaDelimitacion, setIzaDelimitacion] = useState(false);
  const [izaOperador, setIzaOperador] = useState(false);
  const [izaFrenado, setIzaFrenado] = useState(false);

  // Role IDs or names
  const [emisorId, setEmisorId] = useState('');
  const [receptorId, setReceptorId] = useState(profile?.id || 'Receptor-1');
  const [supervisorId, setSupervisorId] = useState('');
  const [inspectorHseId, setInspectorHseId] = useState('');
  const [ejecutorNombre, setEjecutorNombre] = useState('');

  // Signatures
  const [firmaReceptor, setFirmaReceptor] = useState('');
  const [firmaEjecutor, setFirmaEjecutor] = useState('');

  // AST State
  const [pasos, setPasos] = useState<string[]>(['']);
  const [peligros, setPeligros] = useState<string[]>(['']);
  const [riesgos, setRiesgos] = useState<string[]>(['']);
  const [medidas, setMedidas] = useState<string[]>(['']);

  const addASTRow = () => {
    setPasos([...pasos, '']);
    setPeligros([...peligros, '']);
    setRiesgos([...riesgos, '']);
    setMedidas([...medidas, '']);
  };

  const removeASTRow = (index: number) => {
    setPasos(pasos.filter((_, i) => i !== index));
    setPeligros(peligros.filter((_, i) => i !== index));
    setRiesgos(riesgos.filter((_, i) => i !== index));
    setMedidas(medidas.filter((_, i) => i !== index));
  };

  const handleASTChange = (
    index: number, 
    field: 'pasos' | 'peligros' | 'riesgos' | 'medidas', 
    value: string
  ) => {
    if (field === 'pasos') {
      const newArr = [...pasos]; newArr[index] = value; setPasos(newArr);
    } else if (field === 'peligros') {
      const newArr = [...peligros]; newArr[index] = value; setPeligros(newArr);
    } else if (field === 'riesgos') {
      const newArr = [...riesgos]; newArr[index] = value; setRiesgos(newArr);
    } else if (field === 'medidas') {
      const newArr = [...medidas]; newArr[index] = value; setMedidas(newArr);
    }
  };

  // Safe validation range for gas values
  const isAtmosphereConformant = () => {
    return o2 >= 19.5 && o2 <= 22.5 && lel < 10 && h2s < 10 && co < 35;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if dates are accurate (max duration recommendation of 1 turn - 8-12h)
    if (!descripcion || !ubicacion || pasos.some(p => !p) || !vigenciaInicio || !vigenciaFin) {
      toast.error('Por favor complete todos lo campos requeridos del trabajo y defina el AST mínimo.');
      return;
    }

    if (!emisorId) {
      toast.error('Debe asignar el Emisor / Autorizante responsable para auditar en campo.');
      return;
    }

    // Role-conflict prevention: receptor shouldn't be the same as emisor
    if (emisorId.toLowerCase().trim() === receptorId.toLowerCase().trim() || emisorId.toLowerCase().trim() === profile?.email?.toLowerCase().trim()) {
      toast.error('Conflicto de roles de seguridad: El Emisor/Autorizante no puede ser el mismo Receptor/Ejecutor.');
      return;
    }

    // Dynamic Atmosphere validation if Confined Space is annexed
    if (anexoConfinados && !isAtmosphereConformant()) {
      toast.error('No se puede emitir el permiso: La atmósfera registrada en el Espacio Confinado supera los límites de seguridad ocupacional (O2: 19.5-22.5%, LEL<10%, CO<35, H2S<10).');
      return;
    }

    // Digital Signature presence verify
    if (!firmaReceptor) {
      toast.error('Por favor registre la firma digital del Emisor/Receptor solicitante en el panel inferior.');
      return;
    }

    const ast: EvaluacionAST = {
      id: crypto.randomUUID(),
      pasos,
      peligros,
      riesgosAsociados: riesgos,
      medidasControl: medidas,
      firmas: {
        ejecutor: firmaEjecutor || 'Digital'
      }
    };

    // Build specialized checklists objects if active
    const checklistConfinados: ChecklistConfinados | undefined = anexoConfinados ? {
      o2,
      lel,
      co,
      h2s,
      vigenciaGases: vigenciaGases || new Date().toISOString(),
      inspectorAtmosfera: inspectorAtmosfera || 'Inspector HSE',
      ventilacionForzadaOk: confVentilacion,
      equiposIluminacionOk: confIluminacion,
      arriesgadoOk: confArriesgado
    } : undefined;

    const checklistAltura: ChecklistAltura | undefined = anexoAltura ? {
      arnesOk,
      anclajesOk,
      lineasVidaOk,
      barandasOk: altBarandasOk,
      capacitacionAlturaOk: altCapacitacionOk,
      aptoAlturaSalud: altAptoSaludOk
    } : undefined;

    const checklistLoto: ChecklistLoto | undefined = anexoLoto ? {
      apagadoConfirmado: lotoApagado,
      aislamientoConfirmado: lotoAislamiento,
      candadosInstalados: lotoCandados,
      etiquetasColocadas: lotoEtiquetas,
      alivioEnergiaConfirmado: lotoAlivio,
      pruebaCeroConfirmado: lotoPruebaCero
    } : undefined;

    const checklistExcavacion: ChecklistExcavacion | undefined = anexoExcavacion ? {
      entibacionOk: excEntibacion,
      distanciaSeguraOk: excDistancia,
      verificacionRedesSubtOk: excRedesSubt,
      accesosOk: excAccesos,
      escalerasEvacuacionOk: excEscaleras
    } : undefined;

    const checklistIzamiento: ChecklistIzamiento | undefined = anexoIzamiento ? {
      vientosOk: izaVientos,
      aparejosCertificados: izaAparejos,
      delimitacionAreaOk: izaDelimitacion,
      operadorCalificado: izaOperador,
      vientosFuertesFrenado: izaFrenado
    } : undefined;

    // Set fallback compatible type
    let compatibleType: TipoTrabajoRiesgoso = 'FRIO';
    if (tipoPermisoPrincipal === 'CALIENTE') compatibleType = 'CALIENTE';
    else if (anexoConfinados) compatibleType = 'ESPACIOS_CONFINADOS';
    else if (anexoLoto) compatibleType = 'ENERGIA_PELIGROSA_LOTO';
    else if (anexoAltura) compatibleType = 'ALTURA';
    else if (anexoExcavacion) compatibleType = 'EXCAVACION';

    const permisoInfo: Partial<PermisoTrabajo> = {
      tipoTrabajo: compatibleType,
      tipoPermisoPrincipal,
      certificadosAnexos: {
        confinados: anexoConfinados,
        altura: anexoAltura,
        loto: anexoLoto,
        excavacion: anexoExcavacion,
        izamiento: anexoIzamiento
      },
      checklistConfinados,
      checklistAltura,
      checklistLoto,
      checklistExcavacion,
      checklistIzamiento,
      
      descripcionTrabajo: descripcion,
      ubicacionDato: ubicacion,
      coordenadas,
      vigenciaInicio,
      vigenciaFin,
      astAsociado: ast,
      estado: 'SOLICITUD',
      responsables: {
        ejecutorId: ejecutorNombre || profile?.displayName || 'Trabajador Campo',
        emisorId,
        supervisorId: supervisorId || 'SST',
        receptorId,
        inspectorHseId: inspectorHseId || 'Inspector HSE'
      },
      firmasDigitales: {
        firmaEjecutor,
        firmaReceptor,
        firmaEmisor: '',
        firmaRescueHse: ''
      }
    };

    if (onSave) {
      onSave(permisoInfo);
    } else {
      toast.success('Solicitud de Permiso guardada de manera local.');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-slate-950 p-6 flex items-center justify-between text-white shrink-0">
          <div>
            <span className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-1 block">Norma de Seguridad ISO 45001 / LOPCYMAT NT-04</span>
            <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
              <ShieldAlert size={26} className="text-red-500 animate-pulse" />
              Portal de Permisos de Trabajo de Alto Riesgo
            </h2>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-2xl transition text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50 space-y-8">
          <form id="permit-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. SECCIÓN PRINCIPAL: TIPO Y DATOS DE TRABAJO */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-l-4 border-red-600 pl-4">
                <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs">
                  1. PARÁMETROS DEL PERMISO PRINCIPAL
                </h3>
                <p className="text-xs text-slate-500 mt-1">Defina la categoría fundamental del permiso y la ubicación del trabajo.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Permiso de Trabajo Principal</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoPermisoPrincipal('FRIO')}
                      className={cn(
                        "p-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all",
                        tipoPermisoPrincipal === 'FRIO'
                          ? "bg-sky-50 border-sky-500 text-sky-800"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      <Snowflake size={24} />
                      Trabajo en Frío
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoPermisoPrincipal('CALIENTE')}
                      className={cn(
                        "p-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all",
                        tipoPermisoPrincipal === 'CALIENTE'
                          ? "bg-orange-50 border-orange-500 text-orange-850"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      <Flame size={24} />
                      Trabajo en Caliente
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Ubicación Precisa / Planta</label>
                  <input 
                    type="text" 
                    required
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 font-medium text-slate-800"
                    placeholder="Ej. Reactor N°4 - Planta de Destilación B"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Especifique el área física para auditorías in-situ.</span>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-1">Vigencia Inicio del Turno</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={vigenciaInicio}
                      onChange={(e) => setVigenciaInicio(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-1">Vigencia Fin (Max 1 Turno / 8-12h)</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={vigenciaFin}
                      onChange={(e) => setVigenciaFin(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Descripción Completa del Trabajo</label>
                  <textarea 
                    required
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 font-medium text-slate-800 resize-none"
                    placeholder="Escriba los pormenores, equipos de soporte, y propósito de la labor."
                  />
                </div>

                <div className="md:col-span-2 border-t border-slate-100 pt-6">
                  <InteractiveMap
                    value={coordenadas}
                    onChange={(coords) => setCoordenadas(coords)}
                    label="Geolocalización del Trabajo"
                  />
                </div>
              </div>
            </section>

            {/* 2. CERTIFICADOS DE TRABAJOS ESPECIALES (ANEXOS) */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-l-4 border-indigo-650 pl-4">
                <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs">
                  2. CERTIFICADOS COMPLEMENTARIOS ESPECIALES
                </h3>
                <p className="text-xs text-slate-500 mt-1">Marque cada riesgo latente para anexar y firmar su checklist obligatorio correspondiente.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <button
                  type="button"
                  onClick={() => setAnexoConfinados(!anexoConfinados)}
                  className={cn(
                    "p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2",
                    anexoConfinados 
                      ? "bg-violet-50 border-violet-500 text-violet-800 shadow-sm" 
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-500"
                  )}
                >
                  <MapPin size={22} className={anexoConfinados ? "text-violet-600" : "text-slate-400"} />
                  <span className="text-[10px] font-black uppercase leading-tight">Espacios Confinados</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAnexoAltura(!anexoAltura)}
                  className={cn(
                    "p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2",
                    anexoAltura 
                      ? "bg-blue-50 border-blue-500 text-blue-800 shadow-sm" 
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-500"
                  )}
                >
                  <HardHat size={22} className={anexoAltura ? "text-blue-600" : "text-slate-400"} />
                  <span className="text-[10px] font-black uppercase leading-tight">Trabajo en Altura</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAnexoLoto(!anexoLoto)}
                  className={cn(
                    "p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2",
                    anexoLoto 
                      ? "bg-red-50 border-red-500 text-red-800 shadow-sm" 
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-500"
                  )}
                >
                  <Key size={22} className={anexoLoto ? "text-red-600" : "text-slate-400"} />
                  <span className="text-[10px] font-black uppercase leading-tight">Protocolo LOTO</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAnexoExcavacion(!anexoExcavacion)}
                  className={cn(
                    "p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2",
                    anexoExcavacion 
                      ? "bg-amber-50 border-amber-500 text-amber-800 shadow-sm" 
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-500"
                  )}
                >
                  <Landmark size={22} className={anexoExcavacion ? "text-amber-600" : "text-slate-400"} />
                  <span className="text-[10px] font-black uppercase leading-tight">Excavaciones / Zanjas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAnexoIzamiento(!anexoIzamiento)}
                  className={cn(
                    "p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 col-span-2 sm:col-span-1",
                    anexoIzamiento 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm" 
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-500"
                  )}
                >
                  <Anchor size={22} className={anexoIzamiento ? "text-emerald-600" : "text-slate-400"} />
                  <span className="text-[10px] font-black uppercase leading-tight">Izamiento Cargas</span>
                </button>
              </div>
            </section>

            {/* DYNAMIC CHECKLIST MODULES */}
            
            {/* CHECKLIST 1: ESPACIOS CONFINADOS */}
            {anexoConfinados && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-6 rounded-3xl border shadow-sm space-y-6 transition-colors",
                  isAtmosphereConformant() ? "bg-violet-50/50 border-violet-200" : "bg-red-50/70 border-red-300"
                )}
              >
                <div className="flex justify-between items-center border-b border-violet-200 pb-3 flex-wrap gap-2">
                  <div>
                    <h4 className="font-black text-violet-900 text-xs uppercase tracking-widest flex items-center gap-2">
                      <Gauge size={18} />
                      Anexo A: Ingreso a Espacios Confinados e Inspección Atmosférica antes de emitir
                    </h4>
                    <p className="text-xs text-violet-700">Ingrese las mediciones químicas. Rango ideal seguro es requerido para guardar.</p>
                  </div>
                  <div className={cn("px-4 py-1.5 rounded-full font-black text-[10px] uppercase border tracking-wider", isAtmosphereConformant() ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-red-100 text-red-800 border-red-300")}>
                    {isAtmosphereConformant() ? "Atmósfera Autorizada" : "Alarma Atmosférica Crítica"}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-violet-100">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">Oxígeno (O2) [19.5% - 22.5%]</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={o2} 
                      onChange={e => setO2(parseFloat(e.target.value) || 0)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">Inflamabilidad (LEL) {'< 10%'}</label>
                    <input 
                      type="number" 
                      value={lel} 
                      onChange={e => setLel(parseInt(e.target.value) || 0)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">Monóxido de Carbono (CO) {'< 35 ppm'}</label>
                    <input 
                      type="number" 
                      value={co} 
                      onChange={e => setCo(parseInt(e.target.value) || 0)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">Sulfuro de Hidrógeno (H2S) {'< 10 ppm'}</label>
                    <input 
                      type="number" 
                      value={h2s} 
                      onChange={e => setH2s(parseInt(e.target.value) || 0)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-violet-100 cursor-pointer">
                    <input type="checkbox" checked={confVentilacion} onChange={e => setConfVentilacion(e.target.checked)} className="mt-1 w-4 h-4 accent-violet-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Ventilación Forzada Mecánica</p>
                      <p className="text-[10px] text-slate-500">Se cuenta con soplador/extractor para la renovación activa del aire.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-violet-100 cursor-pointer">
                    <input type="checkbox" checked={confIluminacion} onChange={e => setConfIluminacion(e.target.checked)} className="mt-1 w-4 h-4 accent-violet-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Iluminación de Seguridad (Baja Tensión/Haz Frío)</p>
                      <p className="text-[10px] text-slate-500">Lámparas intrínsecamente seguras de 12V/24V.</p>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Inspector de Atmósfera</label>
                    <input 
                      type="text" 
                      value={inspectorAtmosfera} 
                      onChange={e => setInspectorAtmosfera(e.target.value)} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800" 
                      placeholder="Nombre del técnico responsable de la medición"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hora de Medición</label>
                    <input 
                      type="text" 
                      value={vigenciaGases} 
                      onChange={e => setVigenciaGases(e.target.value)} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800" 
                      placeholder="Ej. Realizado a las 08:30"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* CHECKLIST 2: TRABAJOS EN ALTURA */}
            {anexoAltura && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50/50 p-6 rounded-3xl border border-blue-200 shadow-sm space-y-6"
              >
                <div>
                  <h4 className="font-black text-blue-900 text-xs uppercase tracking-widest flex items-center gap-2">
                    <HardHat size={18} className="text-blue-600" />
                    Anexo B: Requisitos para Trabajos en Altura (+1.80 metros)
                  </h4>
                  <p className="text-xs text-blue-700">Verifique el arnés integral y el despeje de caída.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100 cursor-pointer">
                    <input type="checkbox" checked={arnesOk} onChange={e => setArnesOk(e.target.checked)} className="mt-1 w-4 h-4 accent-blue-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Arnés de Cuerpo Completo (Doble Cabo)</p>
                      <p className="text-[10px] text-slate-500">Inspeccionado, libre de desgarros, con amortiguador de impacto.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100 cursor-pointer">
                    <input type="checkbox" checked={anclajesOk} onChange={e => setAnclajesOk(e.target.checked)} className="mt-1 w-4 h-4 accent-blue-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Punto de Anclaje Homologado (5000 lbs)</p>
                      <p className="text-[10px] text-slate-500">Fijado a estructura sólida verificada, no a tuberías de proceso.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100 cursor-pointer">
                    <input type="checkbox" checked={lineasVidaOk} onChange={e => setLineasVidaOk(e.target.checked)} className="mt-1 w-4 h-4 accent-blue-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Línea de Vida o Cuerda de Seguridad Tensa</p>
                      <p className="text-[10px] text-slate-500">Cable de acero o soga de nylon certificada.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100 cursor-pointer">
                    <input type="checkbox" checked={altBarandasOk} onChange={e => setAltBarandasOk(e.target.checked)} className="mt-1 w-4 h-4 accent-blue-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Uso de Barandillas y Rodapiés Perimetrales</p>
                      <p className="text-[10px] text-slate-500">En andamios o plataformas de trabajo.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100 cursor-pointer">
                    <input type="checkbox" checked={altCapacitacionOk} onChange={e => setAltCapacitacionOk(e.target.checked)} className="mt-1 w-4 h-4 accent-blue-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Certificación de Trabajo Seguro en Alturas Vigente</p>
                      <p className="text-[10px] text-slate-500">El ejecutor cuenta con adiestramiento avalado por ente rector.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100 cursor-pointer">
                    <input type="checkbox" checked={altAptoSaludOk} onChange={e => setAltAptoSaludOk(e.target.checked)} className="mt-1 w-4 h-4 accent-blue-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Examen de Aptitud Médica Vigente</p>
                      <p className="text-[10px] text-slate-500">Sin antecedentes de laberintitis, vértigo ni hipertensión descompensada.</p>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}

            {/* CHECKLIST 3: PROTOCOLO LOTO DE ENERGÍAS PELIGROSAS */}
            {anexoLoto && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50/50 p-6 rounded-3xl border border-red-200 shadow-sm space-y-6"
              >
                <div>
                  <h4 className="font-black text-red-900 text-xs uppercase tracking-widest flex items-center gap-2">
                    <Key size={18} className="text-red-600" />
                    Anexo C: Protocolo LOTO de Aislamiento de Energía de Fuerza (Mecánica, Eléctrica, Neumática)
                  </h4>
                  <p className="text-xs text-red-700 font-bold">Secuencia obligatoria de desenergización y prueba de fuerza cero.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-100 cursor-pointer">
                    <input type="checkbox" checked={lotoApagado} onChange={e => setLotoApagado(e.target.checked)} className="mt-1 w-4 h-4 accent-red-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Paso 1: Apagado y Parada de Máquina</p>
                      <p className="text-[10px] text-slate-500">Control de apagado normal, detención total operada.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-100 cursor-pointer">
                    <input type="checkbox" checked={lotoAislamiento} onChange={e => setLotoAislamiento(e.target.checked)} className="mt-1 w-4 h-4 accent-red-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Paso 2: Aislamiento Físico de Energía</p>
                      <p className="text-[10px] text-slate-500">Apertura de interruptores principales, bajada de cuchillas o cierre de válvulas de paso.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-100 cursor-pointer">
                    <input type="checkbox" checked={lotoCandados} onChange={e => setLotoCandados(e.target.checked)} className="mt-1 w-4 h-4 accent-red-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Paso 3: Candados Personales Bloqueados</p>
                      <p className="text-[10px] text-slate-500">Cada trabajador instala su candado de cierre físico.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-100 cursor-pointer">
                    <input type="checkbox" checked={lotoEtiquetas} onChange={e => setLotoEtiquetas(e.target.checked)} className="mt-1 w-4 h-4 accent-red-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Paso 4: Colocación de Tarjetas/Etiquetas Rojas</p>
                      <p className="text-[10px] text-slate-500">Nombre, fecha, y tipo de trabajo detallados.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-100 cursor-pointer">
                    <input type="checkbox" checked={lotoAlivio} onChange={e => setLotoAlivio(e.target.checked)} className="mt-1 w-4 h-4 accent-red-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Paso 5: Alivio de Energía Residual</p>
                      <p className="text-[10px] text-slate-500">Descarga de condensadores, purga de presión neumática/de fluido, liberación cinemática.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-100 cursor-pointer">
                    <input type="checkbox" checked={lotoPruebaCero} onChange={e => setLotoPruebaCero(e.target.checked)} className="mt-1 w-4 h-4 accent-red-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Paso 6: Prueba de Energía Cero Operativa</p>
                      <p className="text-[10px] text-slate-500">Intento de encendido en tablero local y uso de multímetro para verificar 0V reales.</p>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}

            {/* CHECKLIST 4: EXCAVACIONES */}
            {anexoExcavacion && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50/50 p-6 rounded-3xl border border-amber-200 shadow-sm space-y-6"
              >
                <div>
                  <h4 className="font-black text-amber-900 text-xs uppercase tracking-widest flex items-center gap-2">
                    <Landmark size={18} className="text-amber-600" />
                    Anexo D: Control en Excavaciones y Zanjas
                  </h4>
                  <p className="text-xs text-amber-700">Evite sepultamientos mediante contención perimetral.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-amber-100 cursor-pointer">
                    <input type="checkbox" checked={excEntibacion} onChange={e => setExcEntibacion(e.target.checked)} className="mt-1 w-4 h-4 accent-amber-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Sistemas de Entibación / Apuntalamiento / Taludes</p>
                      <p className="text-[10px] text-slate-500">Se colocó contención física contra derrumbes laterales.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-amber-100 cursor-pointer">
                    <input type="checkbox" checked={excDistancia} onChange={e => setExcDistancia(e.target.checked)} className="mt-1 w-4 h-4 accent-amber-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Distancia de Acopio de Tierra Retiro Seguro</p>
                      <p className="text-[10px] text-slate-500">Mínimo 1 metro de distancia del borde de la excavación para evitar sobrecarga.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-amber-100 cursor-pointer">
                    <input type="checkbox" checked={excRedesSubt} onChange={e => setExcRedesSubt(e.target.checked)} className="mt-1 w-4 h-4 accent-amber-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Plano de Redes Subterráneas Auditado</p>
                      <p className="text-[10px] text-slate-500">Se verificó la ausencia de líneas eléctricas o gas conductor.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-amber-100 cursor-pointer">
                    <input type="checkbox" checked={excAccesos} onChange={e => setExcAccesos(e.target.checked)} className="mt-1 w-4 h-4 accent-amber-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Escaleras de Evacuación Rápida a mano</p>
                      <p className="text-[10px] text-slate-500">Ubicadas a menos de 7.5 metros de distancia de los excavadores.</p>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}

            {/* CHECKLIST 5: IZAMIENTO */}
            {anexoIzamiento && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-200 shadow-sm space-y-6"
              >
                <div>
                  <h4 className="font-black text-emerald-900 text-xs uppercase tracking-widest flex items-center gap-2">
                    <Anchor size={18} className="text-emerald-600" />
                    Anexo E: Izaje Crítico y Maniobras de Carga suspensa
                  </h4>
                  <p className="text-xs text-emerald-700">Asegure las grúas de elevación y el perímetro de seguridad.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-emerald-100 cursor-pointer">
                    <input type="checkbox" checked={izaVientos} onChange={e => setIzaVientos(e.target.checked)} className="mt-1 w-4 h-4 accent-emerald-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Guiado de Carga con Vientos (Sogas guía)</p>
                      <p className="text-[10px] text-slate-500">Evita giros o péndulo involuntario de la carga alzada.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-emerald-100 cursor-pointer">
                    <input type="checkbox" checked={izaAparejos} onChange={e => setIzaAparejos(e.target.checked)} className="mt-1 w-4 h-4 accent-emerald-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Eslingas, Grilletes y Aparejos Certificados</p>
                      <p className="text-[10px] text-slate-500">Con placa de carga máxima visible e inspección pre-uso sin fatiga de material.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-emerald-100 cursor-pointer">
                    <input type="checkbox" checked={izaDelimitacion} onChange={e => setIzaDelimitacion(e.target.checked)} className="mt-1 w-4 h-4 accent-emerald-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Delimitación y Conos de Exclusión Total</p>
                      <p className="text-[10px] text-slate-500">Prohibido el paso de peatones bajo carga suspendida.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-emerald-100 cursor-pointer">
                    <input type="checkbox" checked={izaOperador} onChange={e => setIzaOperador(e.target.checked)} className="mt-1 h-4 w-4 accent-emerald-600" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Operador y Rigger (Señalero) Calificados</p>
                      <p className="text-[10px] text-slate-500">Certificación oficial para manejo de grúas pesadas.</p>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}

            {/* 3. ANÁLISIS DE TRABAJO SEGURO (AST) */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-2">
                <div className="border-l-4 border-slate-900 pl-4">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs">
                    3. ANÁLISIS DE TRABAJO SEGURO (ATS / AST)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Identifique secuencialmente cada riesgo con su respectivo control.</p>
                </div>
                <button 
                  type="button" 
                  onClick={addASTRow}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} /> Registrar Paso Adicional
                </button>
              </div>

              <div className="space-y-4">
                {pasos.map((paso, index) => (
                  <div key={index} className="flex flex-col lg:flex-row gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 relative">
                    <div className="absolute -left-2 -top-2 w-6 h-6 bg-slate-950 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-md">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                       <label className="block text-[10px] uppercase font-black text-slate-600 tracking-wider">Subtarea o Fase</label>
                       <textarea 
                        required
                        rows={1}
                        value={paso} 
                        onChange={(e) => handleASTChange(index, 'pasos', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-slate-500 resize-none font-medium text-slate-800" placeholder="Ej. Retiro de guarda motor" />
                    </div>
                    <div className="flex-1 space-y-2">
                       <label className="block text-[10px] uppercase font-black text-orange-600 tracking-wider">Peligro Presente</label>
                       <textarea 
                        required
                        rows={1}
                        value={peligros[index]} 
                        onChange={(e) => handleASTChange(index, 'peligros', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-slate-500 resize-none font-medium text-slate-800" placeholder="Ej. Atrapamiento directo" />
                    </div>
                    <div className="flex-1 space-y-2">
                       <label className="block text-[10px] uppercase font-black text-red-600 tracking-wider">Riesgo / Daño</label>
                       <textarea 
                        required
                        rows={1}
                        value={riesgos[index]} 
                        onChange={(e) => handleASTChange(index, 'riesgos', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-slate-500 resize-none font-medium text-slate-800" placeholder="Ej. Amputación de dedos" />
                    </div>
                    <div className="flex-1 space-y-2">
                       <label className="block text-[10px] uppercase font-black text-emerald-600 tracking-wider">Control Operacional</label>
                       <textarea 
                        required
                        rows={1}
                        value={medidas[index]} 
                        onChange={(e) => handleASTChange(index, 'medidas', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-slate-500 resize-none font-medium text-slate-800" placeholder="Ej. LOTO eléctrico instalado" />
                    </div>
                    
                    {pasos.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeASTRow(index)}
                        className="self-center p-2 text-slate-400 hover:text-red-500 transition rounded-xl hover:bg-slate-200 mt-4 lg:mt-0"
                        title="Eliminar"
                      >
                         <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 4. ROLES, ACTORES Y FIRMAS DIGITALES */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-l-4 border-emerald-600 pl-4">
                <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs">
                  4. ROLES DE SST Y DIGITALIZACIÓN EN CAMPO
                </h3>
                <p className="text-xs text-slate-500 mt-1">Previene conflicto de interés: Quién ejerce, quién audita y aprueba.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Emisor / Responsable SST (Área solicitada (Email/ID)) *</label>
                  <input 
                    type="text" 
                    required
                    value={emisorId}
                    onChange={(e) => setEmisorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-red-500 font-semibold"
                    placeholder="Ej. sst.supervisor@empresa.com"
                  />
                  <span className="text-[10px] text-red-500 mt-1 block font-medium">Asigne al Supervisor Facultado. ¡No puede ser su propio email!</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Receptor Solicitante o de Obra (Tú)</label>
                  <input 
                    type="text" 
                    readOnly
                    value={receptorId}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Ejecutor del Trabajo (Trabajador de Campo)</label>
                  <input 
                    type="text"
                    value={ejecutorNombre}
                    onChange={e => setEjecutorNombre(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-red-500 font-semibold text-slate-800"
                    placeholder="Nombre del operario que ingresa al sitio"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 font-medium text-slate-600">Inspector HSE Preventivo Asignado</label>
                  <input 
                    type="text" 
                    value={inspectorHseId}
                    onChange={(e) => setInspectorHseId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-red-500"
                    placeholder="Opcional. Nombre del Recurso HSE"
                  />
                </div>
              </div>

              {/* DRAW FIRMA EN CAMPO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 bg-slate-50/50 p-4 rounded-2xl border">
                <div>
                  <SignaturePad 
                    label="Firma de Validación del Receptor (Responsable Obra)" 
                    onSave={(base64) => setFirmaReceptor(base64)} 
                    defaultValue={firmaReceptor}
                  />
                  {!firmaReceptor && (
                    <span className="text-[10px] text-red-500 mt-1 block">Firma del solicitante requerida para finalizar.</span>
                  )}
                </div>
                <div>
                  <SignaturePad 
                    label="Firma de Conformidad del Trabajador (Ejecutor)" 
                    onSave={(base64) => setFirmaEjecutor(base64)} 
                    defaultValue={firmaEjecutor}
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Avala entendimiento pleno de los controles AST.</span>
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-100 flex items-center justify-end gap-4 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition text-xs"
          >
            Regresar
          </button>
          <button 
            form="permit-form"
            type="submit"
            className="px-8 py-3 bg-red-600 text-white font-black rounded-xl shadow-lg hover:bg-red-700 transition flex items-center gap-2 text-xs uppercase tracking-wider"
          >
            <ShieldAlert size={16} />
            Solicitar y Someter Permiso
          </button>
        </div>
      </motion.div>
    </div>
  );
}
