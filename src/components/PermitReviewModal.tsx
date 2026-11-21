import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, X, CheckSquare, Activity, ClipboardCheck, Lock, AlertTriangle, CheckCircle2, Download, Landmark, HardHat, Key, Anchor, Gauge, ArrowLeft, HelpCircle, MapPin, CheckCircle, UserCheck } from 'lucide-react';
import type { PermisoTrabajo, ControlCampo, ChecklistConfinados, ChecklistAltura, ChecklistLoto, ChecklistExcavacion, ChecklistIzamiento } from '../types/permits';
import { cn } from '../lib/utils';
import SignaturePad from './SignaturePad';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import InteractiveMap from './InteractiveMap';

interface PermitReviewModalProps {
  permiso: PermisoTrabajo;
  onClose: () => void;
  onUpdateEstado: (
    estado: PermisoTrabajo['estado'], 
    controles?: ControlCampo,
    firmas?: Partial<NonNullable<PermisoTrabajo['firmasDigitales']>>
  ) => void;
}

export default function PermitReviewModal({ permiso, onClose, onUpdateEstado }: PermitReviewModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  
  // Field Verification state
  const [epp, setEpp] = useState(permiso.controlesCampo?.eppVerificados || false);
  const [loto, setLoto] = useState(permiso.controlesCampo?.lotoAplicado || false);
  const [gases, setGases] = useState(permiso.controlesCampo?.pruebasGasesValidas || false);
  const [lel, setLel] = useState<number>(permiso.controlesCampo?.medicionesLel || 0);
  const [o2, setO2] = useState<number>(permiso.controlesCampo?.medicionesO2 || 20.9);
  const [obs, setObs] = useState(permiso.controlesCampo?.observacionesAdicionales || '');

  // Review signatures
  const [firmaEmisor, setFirmaEmisor] = useState('');
  const [firmaRescueHse, setFirmaRescueHse] = useState('');

  // Stop Work Authority action state
  const [swaOpen, setSwaOpen] = useState(false);
  const [swaMotivo, setSwaMotivo] = useState('');

  const generatePDF = async () => {
    const element = pdfRef.current;
    if (!element) return;
    
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';

    const currentScrollY = window.scrollY;
    const currentScrollX = window.scrollX;
    window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
    
    const parent = element.parentElement;
    const originalParentStyle = parent ? parent.getAttribute('style') : null;
    
    if (parent) {
      parent.style.setProperty("position", "fixed", "important");
      parent.style.setProperty("left", "0px", "important");
      parent.style.setProperty("top", "0px", "important");
      parent.style.setProperty("z-index", "999999", "important");
      parent.style.setProperty("width", "800px", "important");
      parent.style.setProperty("pointer-events", "none", "important");
      parent.style.setProperty("background-color", "#ffffff", "important");
      parent.style.setProperty("opacity", "1", "important");
    }

    try {
      toast.loading('Generando PDF Auditado...', { id: 'pdf' });

      // Give browser time to load and render the element cleanly
      await new Promise(resolve => setTimeout(resolve, 350));
      
      const tipoSlug = permiso.tipoTrabajo.replace(/_/g, '-');
      const dateStr = new Date(permiso.fechaSolicitud).toISOString().split('T')[0];
      const filename = `Permiso_ISO45001_${tipoSlug}_${permiso.ubicacionDato}_${dateStr}_${permiso.codigoPermiso}.pdf`.replace(/\s+/g, '_');

      const opt = {
        margin:       [10, 8, 10, 8] as [number, number, number, number],
        filename:     filename,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          logging: false, 
          windowWidth: 800,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF:        { unit: 'mm' as const, format: 'letter' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(element).save();
      toast.success('Reporte PDF descargado exitosamente.', { id: 'pdf' });
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el documento PDF.', { id: 'pdf' });
    } finally {
      if (parent && originalParentStyle) {
        parent.setAttribute('style', originalParentStyle);
      }
      window.scrollTo({ left: currentScrollX, top: currentScrollY, behavior: "auto" });
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    }
  };

  const handleValidar = () => {
    if (!firmaEmisor) {
      toast.error('Se requiere la firma del Emisor para registrar la validación en campo.');
      return;
    }
    onUpdateEstado('VALIDACION_CAMPO', {
      pruebasGasesValidas: gases,
      eppVerificados: epp,
      lotoAplicado: loto,
      medicionesLel: lel,
      medicionesO2: o2,
      observacionesAdicionales: obs
    }, {
      firmaEmisor
    });
    toast.success('Validación de campo registrada con firma digital. Pendiente aprobación final de SST.');
    onClose();
  };

  const handleAprobar = () => {
    if (permiso.estado !== 'VALIDACION_CAMPO') {
       toast.error('Debe completarse la validación in-situ antes de aprobar.');
       return;
    }
    if (!firmaRescueHse) {
      toast.error('Se requiere la firma digital del Prevencionista/SST para emitir la aprobación.');
      return;
    }
    onUpdateEstado('APROBADO', {
      pruebasGasesValidas: gases,
      eppVerificados: epp,
      lotoAplicado: loto,
      medicionesLel: lel,
      medicionesO2: o2,
      observacionesAdicionales: obs
    }, {
      firmaRescueHse
    });
    toast.success('Permiso aprobado y firmado digitalmente de conformidad con ISO 45001.');
    onClose();
  };

  const handleIniciarTrabajo = () => {
    onUpdateEstado('EN_EJECUCION');
    toast.success('El trabajo ha sido establecido EN EJECUCIÓN activa.');
    onClose();
  };

  const handleCerrar = () => {
    onUpdateEstado('CERRADO');
    toast.success('El Permiso de Trabajo Riesgoso ha sido CERRADO formalmente.');
    onClose();
  };

  const handleSuspenderSWA = () => {
    if (!swaMotivo) {
      toast.error('Escriba el motivo de la suspensión o desvío de seguridad observado.');
      return;
    }
    onUpdateEstado('SUSPENDIDO', {
      pruebasGasesValidas: gases,
      eppVerificados: epp,
      lotoAplicado: loto,
      medicionesLel: lel,
      medicionesO2: o2,
      observacionesAdicionales: `[SUSPENSIÓN SWA: ${swaMotivo}] - ${obs}`
    });
    toast.error('Autoridad de Detención de Trabajo (SWA) activada de emergencia.');
    onClose();
  };

  const isSolicitud = permiso.estado === 'SOLICITUD';
  const isValidacion = permiso.estado === 'VALIDACION_CAMPO';
  const isAprobado = permiso.estado === 'APROBADO';
  const inEjecucion = permiso.estado === 'EN_EJECUCION';
  const isSuspendido = permiso.estado === 'SUSPENDIDO';
  const canModifyControls = isSolicitud || isValidacion;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Banner de Estado */}
        <div className={cn(
          "p-6 flex items-center justify-between text-white shrink-0 border-b-4",
          isSolicitud ? "bg-amber-600 border-amber-800" :
          isValidacion ? "bg-blue-600 border-blue-800" :
          isAprobado ? "bg-emerald-600 border-emerald-800" :
          inEjecucion ? "bg-emerald-700 border-emerald-400" :
          isSuspendido ? "bg-red-600 border-red-800" :
          "bg-slate-700 border-slate-900"
        )}>
          <div>
            <span className="text-[10px] bg-black/20 px-2.5 py-1 rounded-md font-black uppercase tracking-widest leading-none">
              ISO 45001 Auditoría Virtual
            </span>
            <h2 className="text-xl font-black mt-2 flex items-center gap-2 leading-none">
              <ClipboardCheck size={24} />
              {isSolicitud ? 'Revisión y Validación de Campo' : 
               isValidacion ? 'Autorización Final SST' : 
               'Detalles Generales del Permiso'}
            </h2>
            <p className="text-xs text-slate-100 mt-1.5 opacity-90 font-medium">
              Fólio: <strong className="font-mono">{permiso.codigoPermiso}</strong> | {permiso.tipoPermisoPrincipal === 'CALIENTE' ? 'TRABAJO EN CALIENTE' : 'TRABAJO EN FRÍO'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={generatePDF} className="p-2 px-4 bg-white/10 hover:bg-white/20 rounded-xl transition text-white flex items-center gap-2 text-xs font-bold shadow-sm">
              <Download size={14} />
              Descargar PDF
            </button>
            <button onClick={onClose} className="p-2.5 bg-black/10 hover:bg-black/20 rounded-xl transition text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scroll Body */}
        <div className="p-8 overflow-y-auto space-y-8 bg-slate-50 flex-1" ref={contentRef}>
           
           {/* ALERTA EN CASO DE SUSPENSIÓN (SWA) */}
           {isSuspendido && (
             <div className="bg-red-50 border-2 border-red-200 text-red-900 p-5 rounded-2xl flex gap-4 items-start">
               <AlertTriangle size={24} className="text-red-600 shrink-0 mt-0.5" />
               <div>
                 <h4 className="font-extrabold text-sm uppercase">Permiso Suspendido por SWA (Stop Work Authority)</h4>
                 <p className="text-xs mt-1.5 leading-relaxed font-medium">
                   Este permiso se detuvo preventivamente en campo debido a un desvío de seguridad crítico o cambio drástico en las condiciones operacionales.
                 </p>
               </div>
             </div>
           )}

           {/* DATOS GENERALES MAP */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="md:col-span-3 pb-3 border-b border-slate-150">
               <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Ubicación del Trabajo</h4>
             </div>
             
             <div>
               <span className="block text-[10px] font-black uppercase text-slate-400">Planta / Ubicación</span>
               <p className="font-bold text-slate-800 text-sm mt-1 flex items-center gap-1">
                 <Activity size={14} className="text-red-500" /> {permiso.ubicacionDato}
               </p>
             </div>

             <div>
               <span className="block text-[10px] font-black uppercase text-slate-400">Responsable Ejecutor</span>
               <p className="font-bold text-slate-800 text-sm mt-1">{permiso.responsables.ejecutorId}</p>
             </div>

             <div>
               <span className="block text-[10px] font-black uppercase text-slate-400">Vigencia del Turno</span>
               <p className="font-bold text-slate-800 text-xs mt-1 leading-tight">
                 {new Date(permiso.vigenciaInicio).toLocaleString()} <span className="block text-[10px] text-slate-400 font-medium my-0.5">hasta</span> {new Date(permiso.vigenciaFin).toLocaleString()}
               </p>
             </div>

             <div className="md:col-span-3 bg-slate-50 p-4 rounded-xl border">
               <span className="block text-[10px] font-black uppercase text-slate-400 mb-1">Descripción de Labores</span>
               <p className="text-xs text-slate-700 font-medium leading-relaxed">{permiso.descripcionTrabajo}</p>
             </div>

             {permiso.coordenadas && (
               <div className="md:col-span-3 border-t border-slate-150 pt-4">
                 <InteractiveMap
                   value={permiso.coordenadas}
                   readOnly={true}
                   label="Ubicación Georreferenciada en Mapa"
                 />
               </div>
             )}
           </div>

           {/* CONTROLES DE CAMPO OBLIGATORIOS (EPP) */}
           <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5 border-b pb-2">
                <CheckSquare size={16} className="text-indigo-650" />
                Controles Operativos Básicos
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={cn("flex items-start gap-3 p-4 rounded-xl border transition", canModifyControls ? "cursor-pointer bg-white hover:border-indigo-300" : "bg-slate-55 opacity-90 pointer-events-none")}>
                  <input type="checkbox" checked={epp} onChange={e => setEpp(e.target.checked)} className="mt-1 w-5 h-5 accent-indigo-650" />
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-800">Uso estricto de EPP Básicos y Específicos</h5>
                    <p className="text-[10px] text-slate-500 mt-1">Casco, lentes, botas dieléctricas/seguridad, guantes especiales.</p>
                  </div>
                </label>

                {permiso.tipoPermisoPrincipal === 'CALIENTE' && (
                  <label className={cn("flex items-start gap-3 p-4 rounded-xl border transition", canModifyControls ? "cursor-pointer bg-white hover:border-orange-300" : "bg-slate-55 opacity-90 pointer-events-none")}>
                    <input type="checkbox" checked={loto} onChange={e => setLoto(e.target.checked)} className="mt-1 w-5 h-5 accent-orange-600" />
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-800">Material Ignífugo y Extintor a la mano</h5>
                      <p className="text-[10px] text-slate-500 mt-1">Manta ignífuga instalada y extintor PQS con carga vigente.</p>
                    </div>
                  </label>
                )}
              </div>
           </section>

           {/* RETRIEVE DYNAMIC ANNEXED CHECKLIST CARDS */}
           
           {/* 1. ESPACIOS CONFINADOS */}
           {permiso.certificadosAnexos?.confinados && (
             <section className="bg-white p-6 rounded-2xl border border-violet-200 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase text-violet-900 tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <MapPin size={16} className="text-violet-600" />
                  Certificado Especial Anexo: Ingreso a Espacios Confinados
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-violet-50/50 p-4 rounded-xl border border-violet-100">
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <span className="block text-[9px] uppercase font-bold text-slate-500">Oxígeno (O2)</span>
                    <strong className="text-lg font-black text-slate-800 font-mono">{permiso.checklistConfinados?.o2 || o2}%</strong>
                    <span className="block text-[8px] text-emerald-600 mt-0.5">Norma: 19.5% - 22.5%</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <span className="block text-[9px] uppercase font-bold text-slate-500">Inflamabilidad (LEL)</span>
                    <strong className="text-lg font-black text-slate-800 font-mono">{permiso.checklistConfinados?.lel || lel}%</strong>
                    <span className="block text-[8px] text-red-500 mt-0.5">Alarma: &gt;= 10%</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <span className="block text-[9px] uppercase font-bold text-slate-500">Toxicidad (CO)</span>
                    <strong className="text-lg font-black text-slate-800 font-mono">{permiso.checklistConfinados?.co || 0} ppm</strong>
                    <span className="block text-[8px] text-red-500 mt-0.5">Alarma: &gt; 35 ppm</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border">
                    <CheckCircle2 size={16} className="text-violet-600" />
                    <span>Ventilación Mecánica Activa: <strong className="text-violet-750">{permiso.checklistConfinados?.ventilacionForzadaOk ? 'SÍ (CONFORME)' : 'NO RESTRITO'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border">
                    <CheckCircle2 size={16} className="text-violet-600" />
                    <span>Iluminación Segura LED: <strong className="text-violet-750">{permiso.checklistConfinados?.equiposIluminacionOk ? 'SÍ (CONFORME)' : 'NO RESTRITO'}</strong></span>
                  </div>
                </div>
             </section>
           )}

           {/* 2. TRABAJOS EN ALTURA */}
           {permiso.certificadosAnexos?.altura && (
             <section className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <HardHat size={16} className="text-blue-600" />
                  Certificado Especial Anexo: Trabajos en Altura (+1.80m)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border">
                    <CheckCircle className="text-blue-650 shrink-0 mt-0.5" size={14} />
                    <div>
                      <p className="font-extrabold text-slate-800">Arnés de Seguridad</p>
                      <p className="text-[10px] text-slate-500">{permiso.checklistAltura?.arnesOk ? 'Inspeccionado Ok' : 'Pendiente'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border">
                    <CheckCircle className="text-blue-650 shrink-0 mt-0.5" size={14} />
                    <div>
                      <p className="font-extrabold text-slate-800">Líneas de Vida</p>
                      <p className="text-[10px] text-slate-500">{permiso.checklistAltura?.lineasVidaOk ? 'Tensionadas Ok' : 'Pendiente'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border">
                    <CheckCircle className="text-blue-650 shrink-0 mt-0.5" size={14} />
                    <div>
                      <p className="font-extrabold text-slate-800">Puntos de Anclaje</p>
                      <p className="text-[10px] text-slate-500">{permiso.checklistAltura?.anclajesOk ? 'Estructurales Ok' : 'Pendiente'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border">
                    <CheckCircle className="text-blue-650 shrink-0 mt-0.5" size={14} />
                    <div>
                      <p className="font-extrabold text-slate-800">Barandillas / Rodapiés</p>
                      <p className="text-[10px] text-slate-500">{permiso.checklistAltura?.barandasOk ? 'Instalados' : 'No Aplica'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border">
                    <CheckCircle className="text-blue-650 shrink-0 mt-0.5" size={14} />
                    <div>
                      <p className="font-extrabold text-slate-800">Capacitación de Altura</p>
                      <p className="text-[10px] text-slate-500">{permiso.checklistAltura?.capacitacionAlturaOk ? 'Aprobada' : 'No Declarado'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border">
                    <CheckCircle className="text-blue-650 shrink-0 mt-0.5" size={14} />
                    <div>
                      <p className="font-extrabold text-slate-800">Aptitud Médica</p>
                      <p className="text-[10px] text-slate-500">{permiso.checklistAltura?.aptoAlturaSalud ? 'Apto' : 'Pendiente Examen'}</p>
                    </div>
                  </div>
                </div>
             </section>
           )}

           {/* 3. AISLAMIENTO LOTO */}
           {permiso.certificadosAnexos?.loto && (
             <section className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase text-red-900 tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <Key size={16} className="text-red-600" />
                  Certificado Especial Anexo: Bloqueo y Etiquetado (LOTO)
                </h4>

                <div className="bg-slate-50 p-4 rounded-xl border border-red-100 flex flex-col gap-3 text-xs font-medium text-slate-700">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span>1. Parada normal de motor / Maquinaria:</span>
                    <strong className={permiso.checklistLoto?.apagadoConfirmado ? "text-emerald-600" : "text-amber-600"}>
                      {permiso.checklistLoto?.apagadoConfirmado ? 'Efectuado' : 'Sin registrar'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span>2. Desenergización y Apertura Cuchillas:</span>
                    <strong className={permiso.checklistLoto?.aislamientoConfirmado ? "text-emerald-600" : "text-amber-600"}>
                      {permiso.checklistLoto?.aislamientoConfirmado ? 'Efectuado' : 'Sin registrar'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span>3. Candado y Etiqueta Roja Personal:</span>
                    <strong className={permiso.checklistLoto?.candadosInstalados ? "text-emerald-600" : "text-amber-600"}>
                      {permiso.checklistLoto?.candadosInstalados ? 'Instalado' : 'Sin registrar'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span>4. Alivio de Energía Hidráulica/Presión:</span>
                    <strong className={permiso.checklistLoto?.alivioEnergiaConfirmado ? "text-emerald-600" : "text-amber-600"}>
                      {permiso.checklistLoto?.alivioEnergiaConfirmado ? 'Efectuado' : 'No requiere'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>5. Prueba Operacional CERO ENERGÍA:</span>
                    <strong className={permiso.checklistLoto?.pruebaCeroConfirmado ? "text-emerald-600 text-lg font-bold" : "text-red-600 font-bold"}>
                      {permiso.checklistLoto?.pruebaCeroConfirmado ? '0 VOLTS VERIFICADO' : 'Incompleto'}
                    </strong>
                  </div>
                </div>
             </section>
           )}

           {/* 4. EXCAVACIONES Y ZANJEO */}
           {permiso.certificadosAnexos?.excavacion && (
             <section className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <Landmark size={16} className="text-amber-600" />
                  Certificado Especial Anexo: Excavaciones o Zanjas Estructurales
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 font-semibold">
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border">
                    <CheckCircle2 size={16} className="text-amber-600" />
                    <span>Entibación / Soporte de Derrumbes: <strong>{permiso.checklistExcavacion?.entibacionOk ? 'APLICADO' : 'NO DECLARED/NO SEGURO'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border">
                    <CheckCircle2 size={16} className="text-amber-600" />
                    <span>Acopio de tierra fuera de borde (&gt;1m): <strong>{permiso.checklistExcavacion?.distanciaSeguraOk ? 'SEGURO' : 'NO REPORTADO'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border">
                    <CheckCircle2 size={16} className="text-amber-600" />
                    <span>Verificación de redes eléctricas subt: <strong>{permiso.checklistExcavacion?.verificacionRedesSubtOk ? 'CONFORME (SIN REDES)' : 'PENDIENTE'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border">
                    <CheckCircle2 size={16} className="text-amber-600" />
                    <span>Escaleras de evacuación rápida: <strong>{permiso.checklistExcavacion?.accesosOk ? 'MÍNIMO 1 ESCALERA A MANO' : 'REQUERIDO'}</strong></span>
                  </div>
                </div>
             </section>
           )}

           {/* 5. IZAMIENTO DE CARGAS */}
           {permiso.certificadosAnexos?.izamiento && (
             <section className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <Anchor size={16} className="text-emerald-600" />
                  Certificado Especial Anexo: Izamiento Crítico de Cargas
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border text-center font-bold">
                    <span className="block text-[8px] uppercase text-slate-400 mb-1">Guías de Soga (Vientos)</span>
                    <span className={permiso.checklistIzamiento?.vientosOk ? "text-emerald-700" : "text-amber-700"}>
                      {permiso.checklistIzamiento?.vientosOk ? 'Correctos' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border text-center font-bold">
                    <span className="block text-[8px] uppercase text-slate-400 mb-1">Aparejos Homologados</span>
                    <span className={permiso.checklistIzamiento?.aparejosCertificados ? "text-emerald-700" : "text-red-700"}>
                      {permiso.checklistIzamiento?.aparejosCertificados ? 'Certificados' : 'Requerido'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border text-center font-bold">
                    <span className="block text-[8px] uppercase text-slate-400 mb-1">Área Cercada</span>
                    <span className={permiso.checklistIzamiento?.delimitacionAreaOk ? "text-emerald-700" : "text-amber-700"}>
                      {permiso.checklistIzamiento?.delimitacionAreaOk ? 'Barricada' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border text-center font-bold">
                    <span className="block text-[8px] uppercase text-slate-400 mb-1">Operador Avalado</span>
                    <span className={permiso.checklistIzamiento?.operadorCalificado ? "text-emerald-700" : "text-red-700"}>
                      {permiso.checklistIzamiento?.operadorCalificado ? 'Calificado' : 'Impedimento'}
                    </span>
                  </div>
                </div>
             </section>
           )}

           {/* AST DE LA TAREA */}
           {permiso.astAsociado && (
             <section className="bg-white p-6 rounded-2xl border border-slate-200 mt-6 shadow-sm">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 border-b pb-2">
                  Análisis de Trabajo Seguro (AST) Validado
                </h4>
                <div className="space-y-3">
                  {permiso.astAsociado.pasos?.map((paso, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 border rounded-lg bg-slate-50 text-[11px] font-medium leading-relaxed">
                      <div>
                        <span className="block text-[9px] font-black text-slate-400 uppercase">Fase {index + 1}</span>
                        <p className="text-slate-800 mt-0.5">{paso}</p>
                      </div>
                      <div>
                        <span className="block text-[9px] font-black text-orange-500 uppercase">Peligro</span>
                        <p className="text-red-600 mt-0.5">{permiso.astAsociado?.peligros?.[index]}</p>
                      </div>
                      <div>
                        <span className="block text-[9px] font-black text-red-500 uppercase">Riesgo</span>
                        <p className="text-red-700 mt-0.5">{permiso.astAsociado?.riesgosAsociados?.[index]}</p>
                      </div>
                      <div>
                        <span className="block text-[9px] font-black text-emerald-600 uppercase">Control</span>
                        <p className="text-emerald-700 mt-0.5">{permiso.astAsociado?.medidasControl?.[index]}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </section>
           )}

           {/* OBSERVACIONES EXTRA DEL EVALUADOR */}
           <section className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                 Observaciones Adicionales de la Inspección
              </h4>
              <textarea 
                value={obs}
                onChange={e => canModifyControls && setObs(e.target.value)}
                readOnly={!canModifyControls}
                rows={2} 
                className={cn("w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-slate-500", !canModifyControls && "bg-slate-100 font-medium text-slate-500")}
                placeholder="Escriba requerimientos especiales para resguardo, brigada de emergencia presente, etc."
              />
           </section>

           {/* RECOPILACIÓN / RENDERING DE FIRMAS DIGITALES */}
           <section className="bg-white p-6 rounded-2xl border border-slate-200 mt-6 shadow-sm">
             <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 border-b pb-2">
               Firmas Digitales de Autorización e ISO 45001
             </h4>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
               {/* 1. EJECUTOR */}
               <div className="flex flex-col justify-between items-center bg-slate-50 p-4 rounded-xl border">
                 <span className="text-[9px] uppercase font-bold text-slate-400">Trabajador Ejecutor</span>
                 <div className="w-full h-24 border border-dashed border-slate-300 rounded-lg bg-white my-3 flex items-center justify-center overflow-hidden">
                   {permiso.firmasDigitales?.firmaEjecutor ? (
                     <img src={permiso.firmasDigitales.firmaEjecutor} alt="Firma Ejecutor" className="h-full object-contain" referrerPolicy="no-referrer" />
                   ) : (
                     <span className="text-[10px] text-slate-400 font-mono">Sin firma digital</span>
                   )}
                 </div>
                 <strong className="text-xs text-slate-700 mt-1">{permiso.responsables.ejecutorId || 'No asignado'}</strong>
               </div>

               {/* 2. RECEPTOR SOLICITANTE */}
               <div className="flex flex-col justify-between items-center bg-slate-50 p-4 rounded-xl border">
                 <span className="text-[9px] uppercase font-bold text-slate-400">Receptor Responsable</span>
                 <div className="w-full h-24 border border-dashed border-slate-300 rounded-lg bg-white my-3 flex items-center justify-center overflow-hidden">
                   {permiso.firmasDigitales?.firmaReceptor ? (
                     <img src={permiso.firmasDigitales.firmaReceptor} alt="Firma Receptor" className="h-full object-contain" referrerPolicy="no-referrer" />
                   ) : (
                     <span className="text-[10px] text-slate-400 font-mono">Sin firma digital</span>
                   )}
                 </div>
                 <strong className="text-xs text-slate-700 mt-1">{permiso.responsables.receptorId || 'Responsable Obra'}</strong>
               </div>

               {/* 3. EMISOR (SUPERVISOR DE ÁREA) */}
               <div className="flex flex-col justify-between items-center bg-slate-50 p-4 rounded-xl border">
                 <span className="text-[9px] uppercase font-bold text-slate-400">Emisor / Supervisor Área</span>
                 <div className="w-full h-24 border border-dashed border-slate-300 rounded-lg bg-white my-3 flex items-center justify-center overflow-hidden">
                   {permiso.firmasDigitales?.firmaEmisor ? (
                     <img src={permiso.firmasDigitales.firmaEmisor} alt="Firma Emisor" className="h-full object-contain" referrerPolicy="no-referrer" />
                   ) : isSolicitud ? (
                     <span className="text-[10px] text-amber-600 font-bold">Firma requerida para validar</span>
                   ) : (
                     <span className="text-[10px] text-slate-400 font-mono">Sin firma digital</span>
                   )}
                 </div>
                 <strong className="text-xs text-slate-700 mt-1">{permiso.responsables.emisorId || 'Supervisor Área'}</strong>
               </div>

               {/* 4. PREVENCIONISTA SST */}
               <div className="flex flex-col justify-between items-center bg-slate-50 p-4 rounded-xl border">
                 <span className="text-[9px] uppercase font-bold text-slate-400">Aprobante SST / Hse</span>
                 <div className="w-full h-24 border border-dashed border-slate-300 rounded-lg bg-white my-3 flex items-center justify-center overflow-hidden">
                   {permiso.firmasDigitales?.firmaRescueHse ? (
                     <img src={permiso.firmasDigitales.firmaRescueHse} alt="Firma SST" className="h-full object-contain" referrerPolicy="no-referrer" />
                   ) : isValidacion ? (
                     <span className="text-[10px] text-blue-600 font-bold">Firma requerida para aprobación</span>
                   ) : (
                     <span className="text-[10px] text-slate-400 font-mono">Sin firma digital</span>
                   )}
                 </div>
                 <strong className="text-xs text-slate-700 mt-1">{permiso.responsables.supervisorId || 'HSE Coordinator'}</strong>
               </div>
             </div>
           </section>

           {/* CAPTURA DE INTERACTIVIDAD DE FIRMAS */}
           {isSolicitud && (
             <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 mt-6 max-w-xl mx-auto">
                <span className="flex items-center gap-1 text-xs font-black text-amber-800 uppercase tracking-wider mb-2">
                   <UserCheck size={16} /> Panel de Firma del Emisor (Supervisor de Planta)
                </span>
                <SignaturePad 
                  label="Escriba su firma en campo para confirmar que verificó el sitio"
                  onSave={(b64) => setFirmaEmisor(b64)}
                  defaultValue={firmaEmisor}
                />
             </div>
           )}

           {isValidacion && (
             <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200 mt-6 max-w-xl mx-auto">
                <span className="flex items-center gap-1 text-xs font-black text-blue-800 uppercase tracking-wider mb-2">
                   <UserCheck size={16} /> Panel de Firma de SST (Aprobación Final)
                </span>
                <SignaturePad 
                  label="Defina su firma digital para emitir formalmente el Permiso de Trabajo"
                  onSave={(b64) => setFirmaRescueHse(b64)}
                  defaultValue={firmaRescueHse}
                />
             </div>
           )}

           {/* POPUP DE SUSPENSIÓN DE TRABAJO (SWA) */}
           {swaOpen && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-6 bg-red-50 border-2 border-red-300 rounded-3xl space-y-4"
             >
               <h4 className="text-sm font-black text-red-900 uppercase flex items-center gap-1">
                 <AlertTriangle size={18} className="text-red-650 animate-bounce" />
                 ¿Por qué activa la Autoridad de Detención de Trabajo (SWA)?
               </h4>
               <p className="text-xs text-red-700 font-semibold leading-relaxed">
                 Especifique el peligro latente o desvío de seguridad inaceptable observado en campo. Esto detiene inmediatamente las operaciones.
               </p>
               <input 
                 type="text" 
                 value={swaMotivo} 
                 onChange={e => setSwaMotivo(e.target.value)}
                 className="w-full bg-white border border-red-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-red-500 font-semibold text-slate-800"
                 placeholder="Ej. Cambio de viento y fuga menor de gas reportada, falta de arnés en andamio..."
               />
               <div className="flex gap-2 justify-end">
                 <button type="button" onClick={() => setSwaOpen(false)} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-xs font-bold rounded-xl text-slate-700 transition">Regresar</button>
                 <button type="button" onClick={handleSuspenderSWA} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-xs font-black rounded-xl text-white uppercase transition tracking-wider shrink-0 shadow">Activar SWA de Emergencia</button>
               </div>
             </motion.div>
           )}
        </div>

        {/* Modal Footer Controls */}
        <div className="border-t border-slate-200 p-6 bg-white flex items-center justify-between shrink-0 flex-wrap gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition text-xs uppercase"
          >
            Cerrar Detalles
          </button>
          
          <div className="flex items-center gap-2 ml-auto">
            
            {/* SOLICITUD -> VALIDACION */}
            {isSolicitud && (
              <>
                <button 
                   onClick={() => onUpdateEstado('CANCELADO')}
                   className="px-6 py-3 text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition text-xs uppercase flex items-center gap-2"
                >
                   <X size={14} /> Rechazar/Denegar
                </button>
                <button 
                  onClick={handleValidar}
                  className="px-8 py-3 bg-amber-600 text-white font-black rounded-xl shadow-lg hover:bg-amber-700 transition flex items-center gap-2 text-xs uppercase tracking-wider"
                >
                  <ShieldAlert size={14} />
                  Someter Validación de Campo
                </button>
              </>
            )}

            {/* VALIDACION -> APROBADO */}
            {isValidacion && (
               <>
                <button 
                   onClick={() => onUpdateEstado('CANCELADO')}
                   className="px-6 py-3 text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition text-xs uppercase flex items-center gap-2"
                >
                   <X size={14} /> Rechazar/Denegar
                </button>
                <button 
                  onClick={handleAprobar}
                  className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center gap-2 text-xs uppercase tracking-wider"
                >
                  <ShieldAlert size={14} />
                  Emitir Aprobación SST (Activa)
                </button>
               </>
            )}

            {/* APROBADO -> EN EJECUCION */}
            {isAprobado && (
              <button 
                onClick={handleIniciarTrabajo}
                className="px-8 py-3 bg-emerald-600 text-white font-black rounded-xl shadow-lg hover:bg-emerald-700 transition flex items-center gap-2 text-xs uppercase tracking-wider"
              >
                <Activity size={14} /> Iniciar Labores en Campo
              </button>
            )}

            {/* EJECUCION / CONTROLES DE PARADA */}
            {(inEjecucion || isSuspendido) && (
               <>
                 {inEjecucion && !swaOpen && (
                   <button 
                     onClick={() => setSwaOpen(true)}
                     className="px-6 py-3 text-red-600 font-extrabold bg-red-50 hover:bg-red-100 rounded-xl transition text-xs uppercase flex items-center gap-2 border border-red-200 shadow-sm"
                   >
                     <AlertTriangle size={14} className="animate-pulse" /> Detener Trabajo (SWA)
                   </button>
                 )}
                 {isSuspendido && (
                   <button 
                     onClick={handleIniciarTrabajo}
                     className="px-6 py-3 text-emerald-600 font-extrabold bg-emerald-50 hover:bg-emerald-100 rounded-xl transition text-xs uppercase flex items-center gap-2 border border-emerald-200"
                   >
                     <Activity size={14} /> Reanudar Labores
                   </button>
                 )}
                 <button 
                   onClick={handleCerrar}
                   className="px-8 py-3 bg-slate-900 text-white font-black rounded-xl shadow-lg hover:bg-slate-850 transition flex items-center gap-2 text-xs uppercase tracking-wider"
                 >
                   <CheckCircle2 size={14} /> Cierre Formal del Permiso
                 </button>
               </>
            )}

            {(!isSolicitud && !isValidacion && !isAprobado && !inEjecucion && !isSuspendido) && (
               <span className="text-xs font-black text-slate-400 bg-slate-100 px-4 py-2.5 rounded-xl border uppercase tracking-wider">
                 Estado: {permiso.estado}
               </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* PLANTILLA OVALADA DE EXPORTACIÓN PDF IMPRESO (OFFSCREEN IN PDF CONSTRAINTS) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0px', width: '740px', pointerEvents: 'none', zIndex: -100 }}>
        <div 
          ref={pdfRef} 
          style={{ 
            display: 'block', 
            backgroundColor: '#fff', 
            color: '#000', 
            fontSize: '8.5px', 
            fontFamily: 'Arial, sans-serif', 
            width: '740px', 
            paddingBottom: '20px',
          }}
        >
        <div style={{ padding: '15px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: '10px' }}>
            <tbody>
              <tr>
                <td style={{ width: '25%', borderRight: '2px solid #000', padding: '15px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#B91C1C' }}>ISO 45001</div>
                  <div style={{ fontSize: '6px', fontWeight: 'bold', color: '#555', marginTop: '2px' }}>CONTROL DE TRABAJOS DE ALTO RIESGO</div>
                </td>
                <td style={{ width: '50%', borderRight: '2px solid #000', padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: '900' }}>SISTEMA DE GESTIÓN DE SEGURIDAD SST</div>
                  <div style={{ fontSize: '13px', color: '#000', fontWeight: '900', marginTop: '3px' }}>PERMISO DE TRABAJO DE ALTO RIESGO COMPACTO</div>
                  <div style={{ fontSize: '7px', color: '#444' }}>Cumple con NT-04-2023 Regulación de Seguridad Ocupacional</div>
                </td>
                <td style={{ width: '25%', padding: '0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5px' }}>
                    <tbody>
                      <tr><td style={{ borderBottom: '1px solid #000', padding: '4px 8px' }}><strong>FOLIO DOC:</strong> {permiso.codigoPermiso}</td></tr>
                      <tr><td style={{ borderBottom: '1px solid #000', padding: '4px 8px' }}><strong>ESTADO:</strong> {permiso.estado}</td></tr>
                      <tr><td style={{ padding: '4px 8px' }}><strong>VIGENCIA:</strong> {new Date(permiso.fechaSolicitud).toLocaleDateString()}</td></tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* DATOS DE COORDENADA */}
          <div style={{ border: '1.5px solid #000', marginBottom: '10px' }}>
            <div style={{ backgroundColor: '#000', color: '#fff', padding: '3px 6px', fontWeight: 'bold' }}>1.0 IDENTIFICACIÓN GENERAL</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <td style={{ padding: '4px', width: '20%', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>UBICACIÓN:</td>
                  <td style={{ padding: '4px', width: '30%' }}>{permiso.ubicacionDato}</td>
                  <td style={{ padding: '4px', width: '20%', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>TIPO PRINCIPAL:</td>
                  <td style={{ padding: '4px', width: '30%' }}>{permiso.tipoPermisoPrincipal}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <td style={{ padding: '4px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>INICIO VIGENCIA:</td>
                  <td style={{ padding: '4px' }}>{new Date(permiso.vigenciaInicio).toLocaleString()}</td>
                  <td style={{ padding: '4px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>FIN VIGENCIA:</td>
                  <td style={{ padding: '4px' }}>{new Date(permiso.vigenciaFin).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>DESCRIPCIÓN:</td>
                  <td colSpan={3} style={{ padding: '4px' }}>{permiso.descripcionTrabajo}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ANEXOS SELECCIONADOS */}
          <div style={{ border: '1.5px solid #000', marginBottom: '10px' }}>
            <div style={{ backgroundColor: '#000', color: '#fff', padding: '3px 6px', fontWeight: 'bold' }}>2.0 CERTIFICADOS DE SOPORTE ADICIONAL REQUERIDOS (SST)</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '5px', borderBottom: '1px solid #000', borderRight: '1px solid #000', fontWeight: 'bold', width: '20%' }}>Espacios Confinados</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #000', borderRight: '1px solid #000', fontWeight: 'bold', width: '20%' }}>Trabajo en Altura</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #000', borderRight: '1px solid #000', fontWeight: 'bold', width: '20%' }}>Aislamiento LOTO</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #000', borderRight: '1px solid #000', fontWeight: 'bold', width: '20%' }}>Excavaciones</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #000', fontWeight: 'bold', width: '20%' }}>Izamientos</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px', borderRight: '1px solid #000', color: permiso.certificadosAnexos?.confinados ? '#059669' : '#9ca3af', fontWeight: 'black' }}>{permiso.certificadosAnexos?.confinados ? 'SÍ (ANEXADO)' : 'NO APLICA'}</td>
                  <td style={{ padding: '5px', borderRight: '1px solid #000', color: permiso.certificadosAnexos?.altura ? '#059669' : '#9ca3af', fontWeight: 'black' }}>{permiso.certificadosAnexos?.altura ? 'SÍ (ANEXADO)' : 'NO APLICA'}</td>
                  <td style={{ padding: '5px', borderRight: '1px solid #000', color: permiso.certificadosAnexos?.loto ? '#059669' : '#9ca3af', fontWeight: 'black' }}>{permiso.certificadosAnexos?.loto ? 'SÍ (ANEXADO)' : 'NO APLICA'}</td>
                  <td style={{ padding: '5px', borderRight: '1px solid #000', color: permiso.certificadosAnexos?.excavacion ? '#059669' : '#9ca3af', fontWeight: 'black' }}>{permiso.certificadosAnexos?.excavacion ? 'SÍ (ANEXADO)' : 'NO APLICA'}</td>
                  <td style={{ padding: '5px', color: permiso.certificadosAnexos?.izamiento ? '#059669' : '#9ca3af', fontWeight: 'black' }}>{permiso.certificadosAnexos?.izamiento ? 'SÍ (ANEXADO)' : 'NO APLICA'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* DETALLES DE MONITOREO DE GAS si aplica */}
          {permiso.certificadosAnexos?.confinados && (
            <div style={{ border: '1.5px solid #000', marginBottom: '10px' }}>
              <div style={{ backgroundColor: '#000', color: '#fff', padding: '3px 6px', fontWeight: 'bold' }}>2.1 DETALLE DE ATMÓSFERA QUÍMICA REQUERIDA (CONFINADOS)</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px', fontWeight: 'bold', backgroundColor: '#f3f4f6', width: '25%' }}>OXÍGENO (O2):</td>
                    <td style={{ padding: '4px', width: '25%' }}>{permiso.checklistConfinados?.o2 || o2}% (Rango seguro 19.5-22.5%)</td>
                    <td style={{ padding: '4px', fontWeight: 'bold', backgroundColor: '#f3f4f6', width: '25%' }}>EXPLOSIVIDAD (LEL):</td>
                    <td style={{ padding: '4px', width: '25%' }}>{permiso.checklistConfinados?.lel || 0}% LEL (Máximo tolerado &lt; 10%)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>MONÓXIDO (CO):</td>
                    <td style={{ padding: '4px' }}>{permiso.checklistConfinados?.co || 0} ppm</td>
                    <td style={{ padding: '4px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>SULFURO (H2S):</td>
                    <td style={{ padding: '4px' }}>{permiso.checklistConfinados?.h2s || 0} ppm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* AST */}
          {permiso.astAsociado && (
            <div style={{ border: '1.5px solid #000', marginBottom: '10px' }}>
              <div style={{ backgroundColor: '#000', color: '#fff', padding: '3px 6px', fontWeight: 'bold' }}>3.0 ANÁLISIS DE TRABAJO SEGURO (AST / ATS EXPORTADO)</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e5e7eb', borderBottom: '1.5px solid #000' }}>
                    <th style={{ padding: '3px', width: '5%', borderRight: '1px solid #000' }}>N°</th>
                    <th style={{ padding: '3px', width: '30%', borderRight: '1px solid #000' }}>SUBTAREA FASE</th>
                    <th style={{ padding: '3px', width: '20%', borderRight: '1px solid #000' }}>PELIGRO DETECTADO</th>
                    <th style={{ padding: '3px', width: '20%', borderRight: '1px solid #000' }}>RIESGO ASOCIADO</th>
                    <th style={{ padding: '3px', width: '25%' }}>CONTROLES EN CAMPO</th>
                  </tr>
                </thead>
                <tbody>
                  {permiso.astAsociado.pasos?.map((paso, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #000' }}>
                      <td style={{ padding: '3px', borderRight: '1px solid #000', textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ padding: '3px', borderRight: '1px solid #000' }}>{paso}</td>
                      <td style={{ padding: '3px', borderRight: '1px solid #000' }}>{permiso.astAsociado?.peligros?.[index]}</td>
                      <td style={{ padding: '3px', borderRight: '1px solid #000' }}>{permiso.astAsociado?.riesgosAsociados?.[index]}</td>
                      <td style={{ padding: '3px' }}>{permiso.astAsociado?.medidasControl?.[index]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CUADRO DE FIRMAS GENERAL EXPORTABLES */}
          <div style={{ border: '1.5px solid #000', marginTop: '15px' }}>
            <div style={{ backgroundColor: '#000', color: '#fff', padding: '3px 6px', fontWeight: 'bold' }}>4.0 REGISTRO DE AUDITORÍA Y FIRMAS ELECTRÓNICAS DE SEGURIDAD (ISO 45001)</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ height: '70px', verticalAlign: 'bottom' }}>
                  <td style={{ width: '25%', borderRight: '1px solid #000', padding: '10px', textAlign: 'center' }}>
                    {permiso.firmasDigitales?.firmaEjecutor && (
                      <div style={{ height: '40px' }}><img src={permiso.firmasDigitales.firmaEjecutor} alt="Sig" style={{ height: '100%' }} /></div>
                    )}
                    <div style={{ borderTop: '1px solid #000', fontWeight: 'bold', paddingTop: '3px' }}>RESPONSABLE EJECUTOR</div>
                    <div style={{ fontSize: '7px', color: '#555' }}>ID: {permiso.responsables.ejecutorId}</div>
                  </td>
                  <td style={{ width: '25%', borderRight: '1px solid #000', padding: '10px', textAlign: 'center' }}>
                    {permiso.firmasDigitales?.firmaReceptor && (
                      <div style={{ height: '40px' }}><img src={permiso.firmasDigitales.firmaReceptor} alt="Sig" style={{ height: '100%' }} /></div>
                    )}
                    <div style={{ borderTop: '1px solid #000', fontWeight: 'bold', paddingTop: '3px' }}>RECEPTOR ADMITENTE</div>
                    <div style={{ fontSize: '7px', color: '#555' }}>ID: {permiso.responsables.receptorId || 'Solicitante'}</div>
                  </td>
                  <td style={{ width: '25%', borderRight: '1px solid #000', padding: '10px', textAlign: 'center' }}>
                    {permiso.firmasDigitales?.firmaEmisor && (
                      <div style={{ height: '40px' }}><img src={permiso.firmasDigitales.firmaEmisor} alt="Sig" style={{ height: '100%' }} /></div>
                    )}
                    <div style={{ borderTop: '1px solid #000', fontWeight: 'bold', paddingTop: '3px' }}>EMISOR (PLANTA)</div>
                    <div style={{ fontSize: '7px', color: '#555' }}>ID: {permiso.responsables.emisorId || 'Supervisor'}</div>
                  </td>
                  <td style={{ width: '25%', padding: '10px', textAlign: 'center' }}>
                    {permiso.firmasDigitales?.firmaRescueHse && (
                      <div style={{ height: '40px' }}><img src={permiso.firmasDigitales.firmaRescueHse} alt="Sig" style={{ height: '100%' }} /></div>
                    )}
                    <div style={{ borderTop: '1px solid #000', fontWeight: 'bold', paddingTop: '3px' }}>COORDINACIÓN SST</div>
                    <div style={{ fontSize: '7px', color: '#555' }}>ID: {permiso.responsables.supervisorId || 'HSE Coordinator'}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ fontSize: '7px', textAlign: 'right', marginTop: '15px', color: '#666' }}>
            Este PDF constituye una certificación legal emitida digitalmente bajo las Normas OSHA / ISO 45001 y NT-04-2023. Generado: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
