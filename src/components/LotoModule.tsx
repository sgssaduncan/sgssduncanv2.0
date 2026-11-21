import React, { useRef, useEffect, useState } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  Settings, 
  ClipboardList, 
  Wrench, 
  Plus, 
  Trash2, 
  Edit2, 
  Award, 
  Activity, 
  Clock, 
  ArrowRight, 
  Search, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle, 
  Undo2, 
  RefreshCw, 
  UserCheck, 
  FileText, 
  Check, 
  ExternalLink,
  ChevronRight,
  Shield,
  HelpCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SignatureCanvas from 'react-signature-canvas';
import { dbService } from '../services/db';
import { useAuth } from '../hooks/useAuth';
import { 
  LotoEquipo, 
  LotoBloqueo, 
  LotoCapacitacion, 
  LotoAuditoria, 
  FuenteEnergia, 
  Empleado, 
  UserProfile 
} from '../types';
import { toast } from 'react-hot-toast';

// Simple HTML5 Canvas based signature component for extreme compatibility with responsive layout scaling and touch devices
function SignaturePad({ onSave, onCancel }: { onSave: (dataUrl: string) => void; onCancel: () => void }) {
  const sigPad = useRef<SignatureCanvas>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const clearCanvas = () => {
    sigPad.current?.clear();
    setHasDrawn(false);
  };

  const handleEnd = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      setHasDrawn(true);
    }
  };

  const saveSignature = () => {
    if (!sigPad.current || sigPad.current.isEmpty() || !hasDrawn) {
      toast.error('Por favor, disponga su firma sobre el recuadro de firma antes de guardar.');
      return;
    }
    const dataUrl = sigPad.current.getCanvas().toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-md">
      <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
        <UserCheck className="w-4 h-4 text-duncan-blue" />
        Firma Digital de Conformidad (Trabajador Autorizado)
      </h4>
      <p className="text-xs text-slate-500 mb-3">
        Utilice su mouse o pantalla táctil para dibujar su firma en el recuadro gris.
      </p>
      <div className="border border-slate-300 rounded-lg overflow-hidden bg-slate-50 relative">
        <SignatureCanvas
          ref={sigPad}
          penColor="#1e3a8a"
          onEnd={handleEnd}
          clearOnResize={false}
          canvasProps={{
            className: "w-full h-40 cursor-crosshair touch-none"
          }}
        />
      </div>
      <div className="flex justify-end gap-2 mt-4 text-xs font-semibold">
        <button
          type="button"
          onClick={clearCanvas}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
        >
          <RotateCcw size={12} />
          Limpiar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={saveSignature}
          className="px-4 py-2 bg-duncan-blue hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Guardar Firma
        </button>
      </div>
    </div>
  );
}

export default function LotoModule() {
  const { profile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'equipos' | 'capacitaciones' | 'auditorias'>('dashboard');

  // Core records
  const [equipos, setEquipos] = useState<LotoEquipo[]>([]);
  const [bloqueos, setBloqueos] = useState<LotoBloqueo[]>([]);
  const [capacitaciones, setCapacitaciones] = useState<LotoCapacitacion[]>([]);
  const [auditorias, setAuditorias] = useState<LotoAuditoria[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);

  // Intermediaries
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active Flows
  const [activeWorkflow, setActiveWorkflow] = useState<{
    equipo: LotoEquipo;
    bloqueoId?: string; // set if editing
    step: 1 | 2 | 3 | 4 | 5 | 6 | 'liberacion';
    pasos: any;
    retiro: any;
    tipoBloqueo: 'Individual' | 'Grupal';
    colegasGrupo: string[];
    padlockSerial: string;
    tagSerial: string;
    turno?: string;
  } | null>(null);

  // Bypass / Forced Override Modal
  const [bypassTarget, setBypassTarget] = useState<LotoBloqueo | null>(null);
  const [bypassReason, setBypassReason] = useState('');
  const [bypassChecklist, setBypassChecklist] = useState({
    absentTeacherConfirmed: false,
    machineFullyInspected: false,
    affectedPersonnelInformedExternal: false,
    ownerNotifiedByManager: false,
  });

  // Handover / Shift Change Modal
  const [handoverTarget, setHandoverTarget] = useState<LotoBloqueo | null>(null);
  const [newAuthorizedId, setNewAuthorizedId] = useState('');
  const [handoverDetails, setHandoverDetails] = useState('');

  // Equipment Create/Edit Modal
  const [editingEquipo, setEditingEquipo] = useState<Partial<LotoEquipo> | null>(null);
  const [currentFuente, setCurrentFuente] = useState<Partial<FuenteEnergia>>({
    tipo: 'Eléctrica',
    magnitud: '',
    ubicacionAislamiento: '',
    dispositivoCierre: ''
  });

  // Training entry modal
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [newTraining, setNewTraining] = useState({
    empleadoId: '',
    fechaTraining: new Date().toISOString().split('T')[0],
    instructor: '',
    calificacion: 100,
    venceFecha: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
  });

  // Procedure audit modal
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [newAudit, setNewAudit] = useState({
    equipoId: '',
    auditorId: '',
    fechaAuditoria: new Date().toISOString().split('T')[0],
    conformidad: true,
    observaciones: '',
  });

  // Signature state
  const [isSignOpen, setIsSignOpen] = useState(false);
  const [isSignReleaseOpen, setIsSignReleaseOpen] = useState(false);

  // Fetch initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [eqs, bls, caps, auds, emps, usrs, comps] = await Promise.all([
        dbService.getLotoEquipos(),
        dbService.getLotoBloqueos(),
        dbService.getLotoCapacitaciones(),
        dbService.getLotoAuditorias(),
        getDocsCollectionSync('empleados'),
        dbService.getUsers(),
        dbService.getEmpresas()
      ]);
      setEquipos(eqs);
      setBloqueos(bls);
      setCapacitaciones(caps);
      setAuditorias(auds);
      setEmpleados(emps as Empleado[]);
      setUsuarios(usrs);
      setEmpresas(comps);
    } catch (e) {
      console.error(e);
      toast.error('Error al recuperar registros LOTO.');
    } finally {
      setLoading(false);
    }
  };

  // Generic fast fetcher helper
  const getDocsCollectionSync = async (collName: string) => {
    try {
      if (collName === 'empleados') return await dbService.getEmpleados();
      if (collName === 'empresas') return await dbService.getEmpresas();
      if (collName === 'users') return await dbService.getUsers();
      return [];
    } catch (e) {
      return [];
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Seed Trigger
  const handleSeed = async () => {
    toast.loading('Sembrando equipamiento y capacitaciones demo...');
    try {
      await dbService.seedLotoData();
      toast.dismiss();
      toast.success('Módulo LOTO sembrado con éxito.');
      loadData();
    } catch (e) {
      toast.dismiss();
      toast.error('No se logró sembrar el módulo.');
    }
  };

  // OSHA 6-step LOTO Lockout initialization
  const startLockoutWorkflow = (equipo: LotoEquipo) => {
    // Check if this equipo is already blocked
    const activeBlock = bloqueos.find(b => b.equipoId === equipo.id && b.estado !== 'Completado');
    if (activeBlock) {
      toast.error('Este equipo ya tiene una intervención LOTO activa.');
      return;
    }

    setActiveWorkflow({
      equipo,
      step: 1,
      pasos: {},
      retiro: {
        retiroHerramientas: false,
        areaSegura: false,
        afectadosNotificados: false,
        remocionExclusiva: true,
      },
      tipoBloqueo: 'Individual',
      colegasGrupo: [],
      padlockSerial: '',
      tagSerial: '',
      turno: 'Turno A (Mañana)'
    });
  };

  const editActiveLockoutWorkflow = (bloqueo: LotoBloqueo) => {
    const equipo = equipos.find(e => e.id === bloqueo.equipoId);
    if (!equipo) {
      toast.error('Equipo asociado no encontrado.');
      return;
    }

    let nextStep: 1 | 2 | 3 | 4 | 5 | 6 | 'liberacion' = 1;
    if (bloqueo.estado === 'En Progreso') {
      const stepsCount = Object.keys(bloqueo.pasosConfirmados).length;
      nextStep = Math.min(stepsCount + 1, 6) as any;
    } else if (bloqueo.estado === 'Bloqueado') {
      nextStep = 'liberacion';
    } else if (bloqueo.estado === 'Liberando') {
      nextStep = 'liberacion';
    }

    setActiveWorkflow({
      equipo,
      bloqueoId: bloqueo.id,
      step: nextStep,
      pasos: bloqueo.pasosConfirmados,
      retiro: bloqueo.retiroValidado || {
        retiroHerramientas: false,
        areaSegura: false,
        afectadosNotificados: false,
        remocionExclusiva: true,
      },
      tipoBloqueo: bloqueo.tipoBloqueo,
      colegasGrupo: bloqueo.colegasGrupo || [],
      padlockSerial: '', // placeholder, can be extracted if stored
      tagSerial: '',
      turno: bloqueo.turno
    });
  };

  // Step regressing handler to go back in the sequence
  const goBackStep = () => {
    if (!activeWorkflow) return;
    const currentStepNum = activeWorkflow.step;
    if (currentStepNum === 'liberacion') return;
    
    if (typeof currentStepNum === 'number' && currentStepNum > 1) {
      const prevStepNum = currentStepNum - 1;
      const nextPasos = { ...activeWorkflow.pasos };
      // Delete the confirmation of the previous step we are returning to, so it must be re-confirmed
      delete nextPasos[`paso${prevStepNum}`];
      
      setActiveWorkflow({
        ...activeWorkflow,
        step: prevStepNum as any,
        pasos: nextPasos
      });
      toast(`Regresando al Paso ${prevStepNum}`);
    }
  };

  // Jump directly to an earlier step in the sequence
  const jumpToPreviousStep = (num: number) => {
    if (!activeWorkflow) return;
    const currentStepNum = activeWorkflow.step;
    if (currentStepNum === 'liberacion') return;
    
    if (typeof currentStepNum === 'number' && num < currentStepNum) {
      const nextPasos = { ...activeWorkflow.pasos };
      // Erase steps verified from this target point onwards to ensure proper sequential auditing
      for (let i = num; i <= 6; i++) {
        delete nextPasos[`paso${i}`];
      }
      
      setActiveWorkflow({
        ...activeWorkflow,
        step: num as any,
        pasos: nextPasos
      });
      toast(`Regresando al Paso ${num}`);
    }
  };

  // Step confirming handler
  const confirmCurrentStep = () => {
    if (!activeWorkflow) return;
    const currentStepNum = activeWorkflow.step;

    if (currentStepNum === 'liberacion') {
      // requires signature flow
      setIsSignReleaseOpen(true);
      return;
    }

    const nextPasos = { ...activeWorkflow.pasos };
    nextPasos[`paso${currentStepNum}`] = {
      confirmado: true,
      fecha: new Date().toISOString(),
      usuarioId: profile?.id || 'unknown'
    };

    if (currentStepNum === 4) {
      if (!activeWorkflow.padlockSerial || !activeWorkflow.tagSerial) {
        toast.error('Debe ingresar el serial del candado y la etiqueta para el paso 4.');
        return;
      }
    }

    if (currentStepNum < 6) {
      setActiveWorkflow({
        ...activeWorkflow,
        step: (currentStepNum + 1) as any,
        pasos: nextPasos
      });
      toast.success(`Paso ${currentStepNum} confirmado de forma segura.`);
    } else {
      // Step 6 requires Signature
      setIsSignOpen(true);
    }
  };

  // Save full blockage event to Firebase
  const saveCompleteBlockout = async (signatureDataUrl: string) => {
    if (!activeWorkflow) return;

    const finalPasos = { ...activeWorkflow.pasos };
    // make sure step 6 is in
    finalPasos['paso6'] = {
      confirmado: true,
      fecha: new Date().toISOString(),
      usuarioId: profile?.id || 'unknown'
    };

    const blockObj = {
      id: activeWorkflow.bloqueoId || undefined,
      equipoId: activeWorkflow.equipo.id,
      autorizadoId: profile?.id || 'unknown',
      tipoBloqueo: activeWorkflow.tipoBloqueo,
      colegasGrupo: activeWorkflow.tipoBloqueo === 'Grupal' ? activeWorkflow.colegasGrupo : [],
      estado: 'Bloqueado' as const,
      pasosConfirmados: finalPasos,
      retiroValidado: activeWorkflow.retiro,
      firmaAutorizadoApagado: signatureDataUrl,
      fechaInicio: new Date().toISOString(),
      turno: activeWorkflow.turno
    };

    try {
      const blockId = await dbService.saveLotoBloqueo(blockObj);
      // Also update equipment status inside firestore
      const eqRef = { ...activeWorkflow.equipo, estado: 'Bloqueado' as const };
      await dbService.saveLotoEquipo(eqRef);

      toast.success('¡Equipo Bloqueado Exitosamente bajo procedimiento OSHA!');
      // log audit event
      await dbService.logAction(
        'LOTO_BLOCKED', 
        'lotoBloqueos', 
        blockId, 
        `Equipo aislado. Candado: ${activeWorkflow.padlockSerial}, Etiqueta: ${activeWorkflow.tagSerial}. Tipo: ${activeWorkflow.tipoBloqueo}`
      );
      
      setActiveWorkflow(null);
      setIsSignOpen(false);
      loadData();
    } catch (e) {
      toast.error('Error al asegurar el registro LOTO.');
    }
  };

  // Safe removal & re-energy workflow completion
  const handleCompleteRelease = async (signatureDataUrl: string) => {
    if (!activeWorkflow || !activeWorkflow.bloqueoId) return;

    // Check release checklist validations
    const r = activeWorkflow.retiro;
    if (!r.retiroHerramientas || !r.areaSegura || !r.afectadosNotificados || !r.remocionExclusiva) {
      toast.error('Debe validar todos los chequeos de seguridad antes de retirar candados.');
      return;
    }

    // Retrieve active blockage record to check shift details
    const activeBlock = bloqueos.find(b => b.id === activeWorkflow.bloqueoId);
    if (!activeBlock) return;

    // OSHA validation: Locked owner must be the same pulling the lock off, except on verified bypassed admin approvals
    if (activeBlock.autorizadoId !== (profile?.id || '')) {
      toast.error('REGLA OSHA: Únicamente el profesional que instaló el candado puede removerlo.');
      return;
    }

    const blockObj = {
      id: activeWorkflow.bloqueoId,
      estado: 'Completado' as const,
      retiroValidado: r,
      firmaAutorizadoEncendido: signatureDataUrl,
      fechaFin: new Date().toISOString(),
    };

    try {
      await dbService.saveLotoBloqueo(blockObj);
      // Turn equipment status back to Operativo
      const targetEq = equipos.find(e => e.id === activeBlock.equipoId);
      if (targetEq) {
        await dbService.saveLotoEquipo({ ...targetEq, estado: 'Operativo' as const });
      }

      toast.success('¡Lockout removido y equipo energizado de forma segura!');
      await dbService.logAction(
        'LOTO_RELEASED', 
        'lotoBloqueos', 
        activeWorkflow.bloqueoId, 
        `Candados retirados. Máquina re-energizada por ${profile?.displayName}`
      );

      setActiveWorkflow(null);
      setIsSignReleaseOpen(false);
      loadData();
    } catch (e) {
      toast.error('No se pudo registrar la liberación del equipo.');
    }
  };

  // OSHA Handover shift transfer logic
  const handleShiftHandoverSubmit = async () => {
    if (!handoverTarget || !newAuthorizedId) {
      toast.error('Seleccione el profesional de relevo.');
      return;
    }

    const incomingUser = usuarios.find(u => u.id === newAuthorizedId);
    if (!incomingUser) return;

    const blockObj = {
      ...handoverTarget,
      autorizadoId: newAuthorizedId,
      turno: `Relevado a: ${incomingUser.displayName}. ${handoverDetails}`,
    };

    try {
      await dbService.saveLotoBloqueo(blockObj);
      toast.success(`Handoff LOTO exitoso. Candado trasladado e instalado por: ${incomingUser.displayName}`);
      await dbService.logAction(
        'LOTO_HANDOVER', 
        'lotoBloqueos', 
        handoverTarget.id, 
        `Transferencia de control a ${incomingUser.displayName}. Detalle: ${handoverDetails}`
      );
      setHandoverTarget(null);
      setNewAuthorizedId('');
      setHandoverDetails('');
      loadData();
    } catch (e) {
      toast.error('No se pudo realizar el relevo de turno.');
    }
  };

  // OSHA Administrative / Emergency forced unlock logic
  const handleBypassSubmit = async () => {
    if (!bypassTarget) return;

    if (!bypassReason || bypassReason.length < 15) {
      toast.error('Por favor, especifique detalladamente la justificación administrativa (mínimo 15 caracteres).');
      return;
    }

    const { absentTeacherConfirmed, machineFullyInspected, affectedPersonnelInformedExternal, ownerNotifiedByManager } = bypassChecklist;
    if (!absentTeacherConfirmed || !machineFullyInspected || !affectedPersonnelInformedExternal || !ownerNotifiedByManager) {
      toast.error('Debe ejecutar y verificar todos los pasos del protocolo OSHA para remociones excepcionales.');
      return;
    }

    const blockObj = {
      ...bypassTarget,
      estado: 'Completado' as const,
      comentariosExc: `RETIRO DE EMERGENCIA [ADMIN]: ${bypassReason}. Procedimientos OSHA confirmados.`,
      fechaFin: new Date().toISOString(),
    };

    try {
      await dbService.saveLotoBloqueo(blockObj);
      const targetEq = equipos.find(e => e.id === bypassTarget.equipoId);
      if (targetEq) {
        await dbService.saveLotoEquipo({ ...targetEq, estado: 'Operativo' as const });
      }

      toast.success('¡Candado removido mediante procedimiento excepcional de administración!');
      await dbService.logAction(
        'LOTO_BYPASS_REMOVAL', 
        'lotoBloqueos', 
        bypassTarget.id, 
        `Remoción autorizada de emergencia por ${profile?.displayName}: ${bypassReason}`
      );

      setBypassTarget(null);
      setBypassReason('');
      setBypassChecklist({
        absentTeacherConfirmed: false,
        machineFullyInspected: false,
        affectedPersonnelInformedExternal: false,
        ownerNotifiedByManager: false,
      });
      loadData();
    } catch (e) {
      toast.error('Fallo en la remoción excepcional.');
    }
  };

  // CRUD for Equipos & Procedures
  const handleSaveEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquipo?.codigo || !editingEquipo?.nombre || !editingEquipo?.empresaId || !editingEquipo?.localidadId || !editingEquipo?.establecimientoId) {
      toast.error('Complete la información obligatoria.');
      return;
    }

    const equipData = {
      ...editingEquipo,
      fuentesEnergia: editingEquipo.fuentesEnergia || [],
      procedimientoPasos: editingEquipo.procedimientoPasos || [],
      estado: editingEquipo.estado || 'Operativo'
    };

    try {
      await dbService.saveLotoEquipo(equipData);
      toast.success('Equipo LOTO guardado exitosamente.');
      setEditingEquipo(null);
      loadData();
    } catch (err) {
      toast.error('Fallo al actualizar el inventario.');
    }
  };

  const addEnergySourceToEquipo = () => {
    if (!currentFuente.magnitud || !currentFuente.ubicacionAislamiento || !currentFuente.dispositivoCierre) {
      toast.error('Complete todos los campos de la fuente de energía.');
      return;
    }

    const source: FuenteEnergia = {
      id: `fe-${Date.now()}`,
      tipo: currentFuente.tipo as any,
      magnitud: currentFuente.magnitud,
      ubicacionAislamiento: currentFuente.ubicacionAislamiento,
      dispositivoCierre: currentFuente.dispositivoCierre
    };

    const updatedFuentes = [...(editingEquipo?.fuentesEnergia || []), source];
    setEditingEquipo({ ...editingEquipo, fuentesEnergia: updatedFuentes });
    
    // reset input form
    setCurrentFuente({
      tipo: 'Eléctrica',
      magnitud: '',
      ubicacionAislamiento: '',
      dispositivoCierre: ''
    });
    toast.success('Fuente de energía agregada al procedimiento.');
  };

  const removeEnergySourceFromEquipo = (id: string) => {
    const filter = (editingEquipo?.fuentesEnergia || []).filter(f => f.id !== id);
    setEditingEquipo({ ...editingEquipo, fuentesEnergia: filter });
  };

  const addProcedimientoPaso = (paso: string) => {
    if (!paso.trim()) return;
    const pasos = [...(editingEquipo?.procedimientoPasos || []), paso.trim()];
    setEditingEquipo({ ...editingEquipo, procedimientoPasos: pasos });
  };

  const removeProcedimientoPasoLog = (index: number) => {
    const list = [...(editingEquipo?.procedimientoPasos || [])];
    list.splice(index, 1);
    setEditingEquipo({ ...editingEquipo, procedimientoPasos: list });
  };

  const handleDeleteEquipo = async (id: string) => {
    if (!window.confirm('¿Está completamente seguro de eliminar esta máquina del inventario LOTO?')) return;
    try {
      await dbService.deleteLotoEquipo(id);
      toast.success('Equipo retirado.');
      loadData();
    } catch (e) {
      toast.error('Error al eliminar equipo.');
    }
  };

  // CRUD for Training Capacitación
  const handleAddTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraining.empleadoId || !newTraining.instructor) {
      toast.error('Complete la información de entrenamiento.');
      return;
    }

    const trainingData = {
      ...newTraining,
      estado: new Date(newTraining.venceFecha) > new Date() ? 'Vigente' : 'Vencido'
    };

    try {
      await dbService.saveLotoCapacitacion(trainingData);
      toast.success('Capacitación LOTO registrada.');
      setShowTrainingModal(false);
      setNewTraining({
        empleadoId: '',
        fechaTraining: new Date().toISOString().split('T')[0],
        instructor: '',
        calificacion: 100,
        venceFecha: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      });
      loadData();
    } catch (err) {
      toast.error('Error al registrar certificación.');
    }
  };

  // CRUD for annual audit evaluations
  const handleAddAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAudit.equipoId || !newAudit.auditorId) {
      toast.error('Se requiere seleccionar el auditor y el equipo evaluado.');
      return;
    }

    try {
      await dbService.saveLotoAuditoria(newAudit);
      // Update last annual evaluation date in matching equipment
      const matchEq = equipos.find(eq => eq.id === newAudit.equipoId);
      if (matchEq) {
        await dbService.saveLotoEquipo({
          ...matchEq,
          ultimaInspeccionAnual: newAudit.fechaAuditoria
        });
      }

      toast.success('Auditoría anual registrada.');
      setShowAuditModal(false);
      setNewAudit({
        equipoId: '',
        auditorId: '',
        fechaAuditoria: new Date().toISOString().split('T')[0],
        conformidad: true,
        observaciones: '',
      });
      loadData();
    } catch (err) {
      toast.error('Error al registrar la auditoría.');
    }
  };

  // Check if annual audit is overdue (> 1 year)
  const isAuditOverdue = (dateString?: string) => {
    if (!dateString) return true;
    const date = new Date(dateString);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return date < oneYearAgo;
  };

  // Filter machines based on search query
  const filteredEquipos = equipos.filter(e => 
    e.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.codigo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Upper Module Badge */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-red-50 text-red-600 rounded-lg">
              <Lock className="w-5 h-5 animate-pulse" />
            </span>
            <span className="text-[10px] font-black tracking-widest text-red-600 uppercase bg-red-50 px-2 py-0.5 rounded">
              OSHA 29 CFR 1910.147 Compliant
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-800">
            Módulo LOTO (Bloqueo y Etiquetado de Energía)
          </h2>
          <p className="text-xs text-slate-500">
            Control de energías peligrosas, procedimientos específicos, relevos y certificación de operarios autorizados.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {equipos.length === 0 && (
            <button
              onClick={handleSeed}
              className="px-4 py-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Cargar Máquinas Demo (Seed LOTO)
            </button>
          )}

          <button
            onClick={() => loadData()}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Recargar registros"
          >
            <RefreshCw className="w-4.5 h-4.5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Primary LOTO Dashboard Mode */}
      {!activeWorkflow ? (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Bloqueos Activos</p>
                <p className="text-xl font-black text-slate-800">
                  {bloqueos.filter(b => b.estado !== 'Completado').length}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Máquinas LOTO</p>
                <p className="text-xl font-black text-slate-800">{equipos.length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Auditorías Pendientes</p>
                <p className="text-xl font-black text-amber-600">
                  {equipos.filter(e => isAuditOverdue(e.ultimaInspeccionAnual)).length}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Autorizados Vigentes</p>
                <p className="text-xl font-black text-slate-800">
                  {capacitaciones.filter(c => c.estado === 'Vigente').length}
                </p>
              </div>
            </div>
          </div>

          {/* Core Tabs Selection */}
          <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto text-xs font-bold leading-none bg-white p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'dashboard' ? 'bg-duncan-blue text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              Monitoreo y Alertas LOTO
            </button>
            <button
              onClick={() => setActiveTab('equipos')}
              className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'equipos' ? 'bg-duncan-blue text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Procedimientos y Máquinas
            </button>
            <button
              onClick={() => setActiveTab('capacitaciones')}
              className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'capacitaciones' ? 'bg-duncan-blue text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Personal Autorizado / Training
            </button>
            <button
              onClick={() => setActiveTab('auditorias')}
              className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'auditorias' ? 'bg-duncan-blue text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Evaluaciones Anuales
            </button>
          </div>

          {/* TAB 1: DASHBOARD & ACTIVE BLOCKS */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active list section */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-red-600" />
                    Trabajos Activos en Bloqueo (Estado de Cuentas)
                  </h3>
                  
                  {bloqueos.filter(b => b.estado !== 'Completado').length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg">
                      <Unlock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-semibold">No se registran bloqueos LOTO activos en este momento.</p>
                      <p className="text-[10px] text-slate-400">Todos los equipos están operativos y libres de riesgo energético.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bloqueos.filter(b => b.estado !== 'Completado').map(blk => {
                        const eq = equipos.find(e => e.id === blk.equipoId);
                        const userProfile = usuarios.find(u => u.id === blk.autorizadoId);
                        return (
                          <div 
                            key={blk.id}
                            className="p-4 border border-red-100 bg-red-50/10 rounded-xl relative overflow-hidden hover:bg-red-50/20 transition-all"
                          >
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-red-600" />
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <span className="text-[10px] font-black text-red-600 bg-red-100 px-1.5 py-0.5 rounded tracking-wide uppercase">
                                  BLOQUEADO - {blk.tipoBloqueo}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800 mt-1">
                                  {eq?.nombre || 'Máquina no registrada'}
                                </h4>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  Cod: {eq?.codigo} | Turno: {blk.turno || 'Sin relevar'}
                                </p>
                              </div>
                              <span className="text-xs text-slate-500 font-bold bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                                {blk.estado}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-100 pt-2 mb-3">
                              <div>
                                <span className="font-semibold text-slate-400 block">Autorizado LOTO:</span>
                                <span className="font-bold text-slate-700">{userProfile?.displayName || blk.autorizadoId}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-400 block">Fecha Inicio:</span>
                                <span className="font-bold text-slate-700">{new Date(blk.fechaInicio).toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Actions on Active Lock */}
                            <div className="flex flex-wrap gap-1.5 justify-end">
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => setBypassTarget(blk)}
                                  className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[10px] font-bold transition-all flex items-center gap-1"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Forzar Desbloqueo (Bypass OSHA)
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setHandoverTarget(blk)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded text-[10px] font-bold transition-all flex items-center gap-1"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Relevo de Turno
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => editActiveLockoutWorkflow(blk)}
                                className="px-3 py-1 bg-duncan-blue hover:bg-blue-700 text-white rounded text-[10px] font-bold transition-all flex items-center gap-1"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                                Proceder a Retiro / Desbloqueo
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* OSHA Regulatory Guides */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
                  <h3 className="text-xs font-black text-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    CONFORMIDAD NORMATIVA - INSPECCIONES PERIÓDICAS (OSHA 1910.147 (c)(6))
                  </h3>
                  <div className="text-xs space-y-2 text-slate-600 leading-relaxed">
                    <p>
                      El estándar de seguridad estipula la obligación de realizar una <b>inspección periódica anual</b> de cada procedimiento de control de energía para certificar que el programa sigue vigente y los operarios autorizados retienen el entrenamiento crítico.
                    </p>
                    <p className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-800 text-[11px] font-semibold flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        <b>Alerta SGD:</b> Procedimientos vencidos o sin inspección en los últimos 365 días serán inhabilitados de manera restrictiva en auditorías de planta. Registre la evaluación del procedimiento en la pestaña "Evaluaciones Anuales".
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar Quick Action Trigger (Isolated Launchpad) */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest mb-3 text-center border-b border-slate-100 pb-2">
                    Iniciar Aislamiento de Máquina
                  </h4>

                  {equipos.length === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-xs text-slate-400">Registre máquinas en el inventario o siembre los ejemplos pre-configurados.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {equipos.map(eq => {
                        const isBlocked = bloqueos.some(b => b.equipoId === eq.id && b.estado !== 'Completado');
                        return (
                          <div 
                            key={eq.id}
                            className={`p-3 border rounded-xl flex items-center justify-between text-xs transition-all ${
                              isBlocked ? 'border-red-100 bg-red-50/5 opacity-80' : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <p className="font-bold text-slate-800 line-clamp-1">{eq.nombre}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {isBlocked ? (
                                  <span className="w-2 h-2 rounded bg-red-600" />
                                ) : (
                                  <span className="w-2 h-2 rounded bg-emerald-500" />
                                )}
                                <span className="text-[10px] text-slate-400 font-mono">{eq.codigo}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => startLockoutWorkflow(eq)}
                              disabled={isBlocked}
                              className={`p-2 rounded-lg transition-all shrink-0 ${
                                isBlocked 
                                  ? 'bg-slate-100 text-slate-400' 
                                  : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                              }`}
                              title={isBlocked ? 'Máquina actualmente bloqueada' : 'Iniciar procedimiento LOTO'}
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROCEDIMIENTOS Y INVENTARIO DE EQUIPOS */}
          {activeTab === 'equipos' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Procedimientos Específicos e Inventario de Equipos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defina el aislamiento de energías peligrosas y los instructivos paso a paso obligatorios por máquina.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative shrink-0 w-full md:w-60">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-duncan-blue"
                      placeholder="Buscar por código o nombre..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={() => setEditingEquipo({
                      codigo: `LOTO-EQ-${String(equipos.length + 1).padStart(2, '0')}`,
                      nombre: '',
                      empresaId: empresas[0]?.id || 'co-duncan',
                      localidadId: 'loc-default',
                      establecimientoId: 'est-default',
                      fuentesEnergia: [],
                      procedimientoPasos: [],
                      estado: 'Operativo'
                    })}
                    className="px-3 py-1.5 bg-duncan-blue text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar Máquina
                  </button>
                </div>
              </div>

              {/* Equipos List Table */}
              <div className="overflow-x-auto border border-slate-150 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-extrabold uppercase tracking-wide">
                      <th className="p-3">Código</th>
                      <th className="p-3">Nombre Máquina</th>
                      <th className="p-3">Fuentes Energía</th>
                      <th className="p-3">Última Auditoría</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredEquipos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-slate-400">
                          No se encontraron máquinas LOTO registradas.
                        </td>
                      </tr>
                    ) : (
                      filteredEquipos.map(eq => {
                        const auditOverdue = isAuditOverdue(eq.ultimaInspeccionAnual);
                        return (
                          <tr key={eq.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono font-bold text-slate-700">{eq.codigo}</td>
                            <td className="p-3">
                              <span className="text-slate-800 font-bold block">{eq.nombre}</span>
                              <span className="text-[10px] text-slate-400">Duncan Industrial Plant</span>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {(eq.fuentesEnergia || []).map((fe, i) => (
                                  <span 
                                    key={i}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      fe.tipo === 'Eléctrica' ? 'bg-orange-100 text-orange-700' :
                                      fe.tipo === 'Hidráulica' ? 'bg-blue-100 text-blue-700' :
                                      fe.tipo === 'Neumática' ? 'bg-cyan-100 text-cyan-700' :
                                      'bg-amber-100 text-amber-700'
                                    }`}
                                  >
                                    {fe.tipo}
                                  </span>
                                ))}
                                {(eq.fuentesEnergia || []).length === 0 && (
                                  <span className="text-[10px] text-slate-400">Ninguna</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              {eq.ultimaInspeccionAnual ? (
                                <div className="flex items-center gap-1">
                                  <span>{eq.ultimaInspeccionAnual}</span>
                                  {auditOverdue ? (
                                    <span title="Vencido hace más de 1 año">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                    </span>
                                  ) : (
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-red-500 font-bold flex items-center gap-1 text-[10px]">
                                  <AlertCircle className="w-3.5 h-3.5" /> FALSO / SIN AUDITAR
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                eq.estado === 'Operativo' ? 'bg-emerald-100 text-emerald-700' : 
                                eq.estado === 'Bloqueado' ? 'bg-red-100 text-red-700' : 
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {eq.estado}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex gap-1 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setEditingEquipo(eq)}
                                  className="p-1 border border-slate-200 text-slate-600 rounded hover:bg-slate-50 transition-colors"
                                  title="Editar procedimiento"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEquipo(eq.id)}
                                  className="p-1 border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors"
                                  title="Retirar del inventario"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PERSONAL CAPACITADO / CERTIFICATE LOGS */}
          {activeTab === 'capacitaciones' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Award className="w-5 h-5 text-emerald-600" />
                    Personal Autorizado Certificado LOTO
                  </h3>
                  <p className="text-xs text-slate-500">
                    Solo los trabajadores registrados y con capacitación vigente pueden aplicar bloqueos energéticos en planta.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTrainingModal(true)}
                  className="px-3 py-1.5 bg-duncan-blue text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Registrar Certificación
                </button>
              </div>

              {/* Capacitaciones Table */}
              <div className="overflow-x-auto border border-slate-150 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-extrabold uppercase tracking-wide">
                      <th className="p-3">Empleado</th>
                      <th className="p-3">Instructor</th>
                      <th className="p-3">Evaluación</th>
                      <th className="p-3">Vence</th>
                      <th className="p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {capacitaciones.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-slate-400">
                          Ningún registro de capacitación LOTO disponible.
                        </td>
                      </tr>
                    ) : (
                      capacitaciones.map(cap => {
                        const emp = empleados.find(e => e.id === cap.empleadoId);
                        return (
                          <tr key={cap.id} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <span className="font-bold text-slate-800 block">
                                {emp?.nombre || 'Operador Autorizado / Externo'}
                              </span>
                              <span className="text-[10px] text-slate-400">Cargo: {emp?.cargo}</span>
                            </td>
                            <td className="p-3 text-slate-700">{cap.instructor}</td>
                            <td className="p-3">
                              <span className="font-mono font-bold text-emerald-600">{cap.calificacion}/100</span>
                            </td>
                            <td className="p-3 text-slate-700">{cap.venceFecha}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                cap.estado === 'Vigente' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {cap.estado}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AUDITORIAS ANUALES LOGS */}
          {activeTab === 'auditorias' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Historial de Auditorías de Procedimiento
                  </h3>
                  <p className="text-xs text-slate-500">
                    Visualizaciones anuales obligatorias de los instructivos específicos implementados.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAuditModal(true)}
                  className="px-3 py-1.5 bg-duncan-blue text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Auditoría Anual
                </button>
              </div>

              {/* Auditorías List */}
              <div className="overflow-x-auto border border-slate-150 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-extrabold uppercase tracking-wide">
                      <th className="p-3">Equipo Evaluado</th>
                      <th className="p-3">Auditor</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Conformidad</th>
                      <th className="p-3">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {auditorias.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-slate-400">
                          No se han realizado auditorías de procedimientos LOTO este año.
                        </td>
                      </tr>
                    ) : (
                      auditorias.map(aud => {
                        const eq = equipos.find(e => e.id === aud.equipoId);
                        const audUser = usuarios.find(u => u.id === aud.auditorId);
                        return (
                          <tr key={aud.id} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <span className="font-bold text-slate-800 block">{eq?.nombre}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{eq?.codigo}</span>
                            </td>
                            <td className="p-3">{audUser?.displayName || aud.auditorId}</td>
                            <td className="p-3">{aud.fechaAuditoria}</td>
                            <td className="p-3">
                              {aud.conformidad ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                                  Conforme
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded text-[10px]">
                                  No Conforme
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-slate-500 line-clamp-1">{aud.observaciones || 'Sin detalles'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ACTIVE INTERLOCK WORKFLOW WIZARD (LOCKOUT & WORKFLOW CONTROLS) */
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-red-200/80 shadow-md space-y-6"
        >
          {/* Header Wizard info */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="font-black text-xs text-red-600 bg-red-50 px-2.5 py-0.5 rounded tracking-wide uppercase">
                Procedimiento Secuencial de Aislamiento
              </span>
              <h3 className="text-lg font-black text-slate-800 mt-1">
                {activeWorkflow.equipo.nombre}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Model: Ingersoll | Cod: {activeWorkflow.equipo.codigo}
              </p>
            </div>

            <button
              onClick={() => setActiveWorkflow(null)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
            >
              Cancelar Proceso
            </button>
          </div>

          {/* Stepper Progress bar visualizer */}
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-150 overflow-x-auto gap-3">
            {[1, 2, 3, 4, 5, 6].map(num => {
              const isClickable = (typeof activeWorkflow.step === 'number' && num < activeWorkflow.step);
              return (
                <div key={num} className="flex items-center gap-1 shrink-0">
                  <span 
                    onClick={() => { if (isClickable) jumpToPreviousStep(num); }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                      activeWorkflow.step === 'liberacion' 
                        ? 'bg-slate-200 text-slate-600' 
                        : activeWorkflow.step === num 
                          ? 'bg-red-600 text-white ring-4 ring-red-100' 
                          : (activeWorkflow.pasos[`paso${num}`]?.confirmado)
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-200 text-slate-600'
                    } ${isClickable ? 'cursor-pointer hover:bg-red-500' : ''}`}
                    title={isClickable ? `Haga clic para regresar al Paso ${num}` : ''}
                  >
                    {num}
                  </span>
                  <span 
                    onClick={() => { if (isClickable) jumpToPreviousStep(num); }}
                    className={`text-[10px] font-extrabold capitalize hidden md:inline transition-colors ${
                      activeWorkflow.step === num ? 'text-red-600' : 'text-slate-400'
                    } ${isClickable ? 'cursor-pointer hover:text-red-500' : ''}`}
                  >
                    {num === 1 ? 'Notificaciones' :
                     num === 2 ? 'Apagado' :
                     num === 3 ? 'Aislamiento' :
                     num === 4 ? 'Tagout' :
                     num === 5 ? 'Residuos' : 'Verificación'}
                  </span>
                  {num < 6 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                </div>
              );
            })}

            <div className="border-l border-slate-300 pl-3 shrink-0">
              <span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wide uppercase flex items-center gap-1 ${
                activeWorkflow.step === 'liberacion' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                <Unlock className="w-3.5 h-3.5" />
                Retiro
              </span>
            </div>
          </div>

          {/* STEP CONTENT SWITCHBOARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Core Isolated Machine sources review */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-slate-600" />
                  Fuentes de Energía del Equipo
                </h4>
                
                <div className="space-y-2 text-xs">
                  {(activeWorkflow.equipo.fuentesEnergia || []).map((source) => (
                    <div key={source.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          source.tipo === 'Eléctrica' ? 'bg-orange-100 text-orange-700' :
                          source.tipo === 'Hidráulica' ? 'bg-blue-100 text-blue-700' :
                          source.tipo === 'Neumática' ? 'bg-cyan-100 text-cyan-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {source.tipo} (Magnitud: {source.magnitud})
                        </span>
                      </div>
                      <p className="font-semibold text-slate-700">Aislar en: {source.ubicacionAislamiento}</p>
                      <p className="text-[11px] text-slate-500">Mecanismo requerido: {source.dispositivoCierre}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Set blockage details metadata for the event */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-slate-700">Configuración de Intervención</h4>
                
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Tipo de Bloqueo:</label>
                  <select
                    className="w-full border border-slate-200 p-2 rounded-lg"
                    value={activeWorkflow.tipoBloqueo}
                    onChange={e => setActiveWorkflow({
                      ...activeWorkflow,
                      tipoBloqueo: e.target.value as any,
                      colegasGrupo: []
                    })}
                  >
                    <option value="Individual">Bloqueo Individual (1 Operario autorizado)</option>
                    <option value="Grupal">Bloqueo Grupal / Multi-operadores</option>
                  </select>
                </div>

                {activeWorkflow.tipoBloqueo === 'Grupal' && (
                  <div className="p-3 bg-blue-50/25 border border-blue-100 rounded-lg space-y-2">
                    <p className="text-[10px] font-semibold text-slate-600">
                      <b>REGLA DE CAJA DE BLOQUEO GRUPAL:</b> Agregue los profesionales autorizados que colocarán sus candados personales. Ninguno del grupo podrá retirar sus candados hasta que todos liberen conformidades.
                    </p>
                    <div className="flex gap-1">
                      <select
                        id="coleg_loto_select"
                        className="flex-1 border border-slate-300 rounded p-1 text-xs"
                        onChange={e => {
                          if (!e.target.value) return;
                          if (activeWorkflow.colegasGrupo.includes(e.target.value)) return;
                          setActiveWorkflow({
                            ...activeWorkflow,
                            colegasGrupo: [...activeWorkflow.colegasGrupo, e.target.value]
                          });
                          e.target.value = '';
                        }}
                      >
                        <option value="">-- Seleccionar Colega --</option>
                        {empleados.map(emp => (
                          <option key={emp.id} value={emp.nombre}>{emp.nombre}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activeWorkflow.colegasGrupo.map((col, index) => (
                        <span key={index} className="px-2 py-0.5 bg-blue-150 text-duncan-blue font-bold rounded-full text-[9px] flex items-center gap-1">
                          {col}
                          <button 
                            type="button" 
                            onClick={() => {
                              const list = activeWorkflow.colegasGrupo.filter(c => c !== col);
                              setActiveWorkflow({ ...activeWorkflow, colegasGrupo: list });
                            }} 
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Steps interactive layout */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200 min-h-[320px] flex flex-col justify-between">
                {/* Step content detail */}
                <div>
                  {activeWorkflow.step === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                        <AlertTriangle className="w-5 h-5 animate-bounce" />
                        <span>PASO 1: Preparación del apagado y notificación</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Antes de realizar cualquier desconexión física de la máquina, se debe identificar el tipo de energía que utiliza y avisar expresamente a todos los operarios y <b>personal afectado</b> en las inmediaciones que la máquina va a ser bloqueada temporalmente por mantenimiento.
                      </p>
                      <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg space-y-2">
                        <p className="text-xs font-semibold">Emitir llamadas SGD:</p>
                        <button
                          type="button"
                          onClick={() => toast.success('Llamadas emitidas vía SMS/SGD a Personal Afectado de la Planta.')}
                          className="px-4 py-2 bg-emerald-600 text-white rounded font-bold text-xs hover:bg-emerald-700 transition"
                        >
                          Notificar Personal Afectado
                        </button>
                      </div>
                    </div>
                  )}

                  {activeWorkflow.step === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                        <Activity className="w-5 h-5" />
                        <span>PASO 2: Apagado seguro de la máquina</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Apague la máquina mediante sus controles normales operativos (Púlsadores locales de paro, consola de comandos, sistema SCADA de control).
                      </p>
                      <div className="p-3 text-[11px] font-mono bg-slate-800 text-green-400 rounded-lg">
                        <span>[COMANDO ENVIADO AD-REMOTE]: Stop sequence initialized. Spindle frequency declining to 0Hz. Power circuit isolated.</span>
                      </div>
                    </div>
                  )}

                  {activeWorkflow.step === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                        <Wrench className="w-5 h-5" />
                        <span>PASO 3: Aislamiento absoluto de la energía</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Proceda al accionamiento físico de disyuntores de potencia eléctrica, llaves térmicas auxiliares o llaves de paso para separar por completo la máquina de sus redes de alimentación externas.
                      </p>
                    </div>
                  )}

                  {activeWorkflow.step === 4 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                        <Shield className="w-5 h-5" />
                        <span>PASO 4: Colocación de Dispositivos (Lockout & Tagout)</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Coloque físicamente el pin o pinza pasadora en el breaker eléctrico, llave neumática o hidráulica de aislamiento, y asegúrelo de forma restringida con su candado personal rojo y su tarjeta de etiquetado LOTO.
                      </p>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">Serial del Candado LOTO:</label>
                          <input
                            type="text"
                            placeholder="e.g. LOCK-9402L"
                            className="w-full p-2.5 border border-slate-300 rounded"
                            value={activeWorkflow.padlockSerial}
                            onChange={e => setActiveWorkflow({ ...activeWorkflow, padlockSerial: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-semibold mb-1">ID de Etiqueta (Tarjeta):</label>
                          <input
                            type="text"
                            placeholder="e.g. TAG-2921A"
                            className="w-full p-2.5 border border-slate-300 rounded"
                            value={activeWorkflow.tagSerial}
                            onChange={e => setActiveWorkflow({ ...activeWorkflow, tagSerial: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeWorkflow.step === 5 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                        <AlertCircle className="w-5 h-5" />
                        <span>PASO 5: Disipación de Energías Residuales</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Abra purgas manuales inferiores para aliviar la presión de gases acumulada en calderas, drene presión de acumuladores hidráulicos, y bloquee físicamente de forma mecánica bloques mecánicos o vigas para contrarrestar la energía gravitacional en pistones o troqueles.
                      </p>
                    </div>
                  )}

                  {activeWorkflow.step === 6 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span>PASO 6: Prueba de Verificación ("Cero Energía")</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Intente reiniciar la máquina de modo manual utilizando sus controles locales normales. Asegúrese de que ningún indicador de energía encienda y que el estado de energía es absolutamente nulo antes de ingresar a operar.
                      </p>
                      <div className="p-3 bg-red-150 text-red-800 text-[11px] font-bold rounded-lg leading-snug">
                        ¡ATENCIÓN! Asegúrese de retornar los mandos a la posición de APAGADO/OFF una vez concluida la prueba de cero energía.
                      </div>
                    </div>
                  )}

                  {activeWorkflow.step === 'liberacion' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                        <Unlock className="w-5 h-5 animate-spin" />
                        <span>FASE DE RETIRO: Re-energización y Entrega de Máquina</span>
                      </div>
                      
                      <div className="space-y-2 bg-slate-50 p-4 rounded-lg text-xs leading-none">
                        <p className="font-extrabold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-2 mb-2">Checklist de Protección Obligatoria</p>
                        
                        <label className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeWorkflow.retiro.retiroHerramientas}
                            onChange={e => setActiveWorkflow({
                              ...activeWorkflow,
                              retiro: { ...activeWorkflow.retiro, retiroHerramientas: e.target.checked }
                            })}
                          />
                          <span className="text-slate-600">Retiro total de herramientas y personal auxiliar del área</span>
                        </label>

                        <label className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeWorkflow.retiro.areaSegura}
                            onChange={e => setActiveWorkflow({
                              ...activeWorkflow,
                              retiro: { ...activeWorkflow.retiro, areaSegura: e.target.checked }
                            })}
                          />
                          <span className="text-slate-600">Guardas de seguridad repuestas y área con orden y limpieza</span>
                        </label>

                        <label className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeWorkflow.retiro.afectadosNotificados}
                            onChange={e => setActiveWorkflow({
                              ...activeWorkflow,
                              retiro: { ...activeWorkflow.retiro, afectadosNotificados: e.target.checked }
                            })}
                          />
                          <span className="text-slate-600">Operadores afectados debidamente notificados sobre la reenergización</span>
                        </label>

                        <label className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeWorkflow.retiro.remocionExclusiva}
                            onChange={e => setActiveWorkflow({
                              ...activeWorkflow,
                              retiro: { ...activeWorkflow.retiro, remocionExclusiva: e.target.checked }
                            })}
                          />
                          <span className="text-red-700 font-bold">Confirmo que yo mismo instalé estos candados y por ende me corresponde retirarlos</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm step navigation button */}
                <div className="flex justify-between items-center border-t border-slate-150 pt-4 mt-6">
                  <div className="text-xs truncate max-w-64 font-medium text-slate-500">
                    Trabajador: <b>{profile?.displayName}</b>
                  </div>

                  <div className="flex gap-2">
                    {typeof activeWorkflow.step === 'number' && activeWorkflow.step > 1 && (
                      <button
                        type="button"
                        onClick={goBackStep}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Undo2 className="w-4 h-4 text-slate-600" />
                        <span>Atrás</span>
                      </button>
                    )}
                    <button
                      onClick={confirmCurrentStep}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      <span>{activeWorkflow.step === 'liberacion' ? 'Firmar y Retirar Candados' : 'Confirmar y Proceder'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SIGNATURE LOCK MODAL (STEP 6) */}
      <AnimatePresence>
        {isSignOpen && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full"
            >
              <SignaturePad 
                onSave={saveCompleteBlockout}
                onCancel={() => setIsSignOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIGNATURE UNLOCK RELEASE MODAL */}
      <AnimatePresence>
        {isSignReleaseOpen && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full"
            >
              <SignaturePad 
                onSave={handleCompleteRelease}
                onCancel={() => setIsSignReleaseOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BYPASS / EMERGENCY ADMIN FORCED UNLOCK MODAL */}
      <AnimatePresence>
        {bypassTarget && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-6 rounded-2xl border border-red-300 max-w-md w-full space-y-4 shadow-xl"
            >
              <div className="flex items-center gap-2 text-red-600 border-b border-slate-100 pb-3">
                <AlertTriangle className="w-6 h-6 shrink-0 animate-bounce" />
                <div>
                  <h3 className="text-sm font-black">PROTOCOLO DE REMOCIÓN EXCEPCIONAL LOTO</h3>
                  <p className="text-[10px] text-slate-500">OSHA 1910.147 (c)(7)(iv) Bypass Procedure</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-normal bg-red-50/50 p-3 rounded-lg space-y-1">
                <p>Establecido únicamente para retirar candados de operarios ausentes debido a emergencias.</p>
                <p className="text-red-700 font-bold">Precaución: El bypass genera registros inmutables de auditoría de seguridad.</p>
              </div>

              <div className="space-y-2 text-xs leading-none">
                <p className="font-bold text-slate-700 mb-1.5 text-[11px] uppercase tracking-wide">Puntos de inspección obligatorios</p>
                
                <label className="flex items-start gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={bypassChecklist.absentTeacherConfirmed}
                    onChange={e => setBypassChecklist({ ...bypassChecklist, absentTeacherConfirmed: e.target.checked })}
                  />
                  <span className="text-slate-600">Verificado que el operador propietario del candado no se encuentra en las instalaciones de la empresa.</span>
                </label>

                <label className="flex items-start gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={bypassChecklist.machineFullyInspected}
                    onChange={e => setBypassChecklist({ ...bypassChecklist, machineFullyInspected: e.target.checked })}
                  />
                  <span className="text-slate-600">Máquina físicamente inspeccionada por el administrador ratificando estado seguro.</span>
                </label>

                <label className="flex items-start gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={bypassChecklist.affectedPersonnelInformedExternal}
                    onChange={e => setBypassChecklist({ ...bypassChecklist, affectedPersonnelInformedExternal: e.target.checked })}
                  />
                  <span className="text-slate-600">Notificado verbalmente a todos los operarios afectados de las cercanías antes de energizar.</span>
                </label>

                <label className="flex items-start gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={bypassChecklist.ownerNotifiedByManager}
                    onChange={e => setBypassChecklist({ ...bypassChecklist, ownerNotifiedByManager: e.target.checked })}
                  />
                  <span className="text-slate-600">Se han realizado llamadas telefónicas y esfuerzos documentados para contactar al operario ausente.</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Justificación del bypass (mínimo 15 letras):</label>
                <textarea
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-red-600"
                  rows={3}
                  placeholder="Justifique el motivo crítico de la remoción excepcional..."
                  value={bypassReason}
                  onChange={e => setBypassReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 text-xs font-semibold pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBypassTarget(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleBypassSubmit}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Confirmar Libre Liberación
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HANDOVER / SHIFT CHANGE RELOC LOG MODAL */}
      <AnimatePresence>
        {handoverTarget && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 max-w-md w-full space-y-4 shadow-xl"
            >
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
                Relevo de Turno LOTO (Shift Handover)
              </h3>
              
              <p className="text-xs text-slate-500 leading-relaxed">
                Este proceso transfiere de manera normada la responsabilidad del aislamiento de energía al profesional del turno entrante sin desmontar la seguridad del equipo.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trabajador de Relevo Autorizado:</label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  value={newAuthorizedId}
                  onChange={e => setNewAuthorizedId(e.target.value)}
                >
                  <option value="">-- Seleccione Trabajador --</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>{u.displayName} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notas / Detalles del Handoff:</label>
                <textarea
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs resize-none"
                  rows={3}
                  placeholder="Detalles sobre el avance de los trabajos o condiciones de seguridad..."
                  value={handoverDetails}
                  onChange={e => setHandoverDetails(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 text-xs font-semibold pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setHandoverTarget(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Cancelar Relevo
                </button>
                <button
                  type="button"
                  onClick={handleShiftHandoverSubmit}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                >
                  Completar Handover
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EQUIPMENT CREATE/EDIT MODAL */}
      <AnimatePresence>
        {editingEquipo && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 max-w-lg w-full space-y-4 shadow-xl"
            >
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                {editingEquipo.id ? 'Editar Procedimiento LOTO' : 'Registrar Equipo sujeto a Lockout-Tagout'}
              </h3>

              <form onSubmit={handleSaveEquipo} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Código de Máquina:</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold"
                      value={editingEquipo.codigo || ''}
                      onChange={e => setEditingEquipo({ ...editingEquipo, codigo: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Nombre Completo:</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                      placeholder="e.g. Compressor de Aire"
                      value={editingEquipo.nombre || ''}
                      onChange={e => setEditingEquipo({ ...editingEquipo, nombre: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="border border-slate-150 p-3 rounded-lg space-y-3 bg-slate-50/50">
                  <p className="font-bold text-slate-700">Añadir Fuentes de Energía</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="block text-slate-500 mb-0.5">Tipo:</label>
                      <select
                        className="w-full border border-slate-300 rounded p-1 text-xs"
                        value={currentFuente.tipo}
                        onChange={e => setCurrentFuente({ ...currentFuente, tipo: e.target.value as any })}
                      >
                        <option value="Eléctrica">Eléctrica</option>
                        <option value="Mecánica">Mecánica</option>
                        <option value="Hidráulica">Hidráulica</option>
                        <option value="Neumática">Neumática</option>
                        <option value="Térmica">Térmica</option>
                        <option value="Química">Química</option>
                        <option value="Gravedad">Gravedad</option>
                        <option value="Otra">Otra</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-0.5">Magnitud (Ej: 480V / 120 PSI):</label>
                      <input
                        type="text"
                        placeholder="e.g. 480 Volts AC"
                        className="w-full border border-slate-300 rounded p-1 text-xs"
                        value={currentFuente.magnitud}
                        onChange={e => setCurrentFuente({ ...currentFuente, magnitud: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="block text-slate-500 mb-0.5">Punto de Aislamiento / Desconexión:</label>
                      <input
                        type="text"
                        placeholder="e.g. Interruptor Principal Tablero C"
                        className="w-full border border-slate-300 rounded p-1 text-xs"
                        value={currentFuente.ubicacionAislamiento}
                        onChange={e => setCurrentFuente({ ...currentFuente, ubicacionAislamiento: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-0.5">Mecanismo de Lock (Bloqueador):</label>
                      <input
                        type="text"
                        placeholder="e.g. Candado rojo, bloqueador breaker"
                        className="w-full border border-slate-300 rounded p-1 text-xs"
                        value={currentFuente.dispositivoCierre}
                        onChange={e => setCurrentFuente({ ...currentFuente, dispositivoCierre: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addEnergySourceToEquipo}
                    className="px-3 py-1 bg-duncan-blue text-white rounded text-[10px] font-bold"
                  >
                    + Guardar Fuente de Energía
                  </button>

                  <div className="space-y-1.5 mt-2 bg-white max-h-32 overflow-y-auto p-2 border border-slate-200 rounded">
                    {(editingEquipo.fuentesEnergia || []).map((f) => (
                      <div key={f.id} className="flex justify-between items-center text-[10px] bg-slate-50 p-1.5 rounded">
                        <span>{f.tipo} : {f.magnitud} ({f.ubicacionAislamiento})</span>
                        <button 
                          type="button" 
                          onClick={() => removeEnergySourceFromEquipo(f.id)} 
                          className="text-red-500 hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-slate-150 p-3 rounded-lg space-y-2">
                  <p className="font-bold text-slate-700">Instructivo Paso a Paso (OSHA)</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="loto_step_input"
                      placeholder="Ingrese un paso detallado para el apagado..."
                      className="flex-1 border border-slate-300 rounded p-2 text-xs"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.currentTarget;
                          addProcedimientoPaso(input.value);
                          input.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('loto_step_input') as HTMLInputElement;
                        if (input) {
                          addProcedimientoPaso(input.value);
                          input.value = '';
                        }
                      }}
                      className="px-3 bg-slate-100 border border-slate-200 font-bold rounded"
                    >
                      Añadir
                    </button>
                  </div>

                  <div className="space-y-1 mt-2">
                    {(editingEquipo.procedimientoPasos || []).map((paso, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-1.5 rounded text-[10px]">
                        <span>{idx + 1}. {paso}</span>
                        <button 
                          type="button" 
                          onClick={() => removeProcedimientoPasoLog(idx)} 
                          className="text-red-550 hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs font-semibold pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingEquipo(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-duncan-blue hover:bg-blue-700 text-white rounded-lg"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRAINING CERTIF LOG MODAL */}
      <AnimatePresence>
        {showTrainingModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 max-w-sm w-full space-y-4 shadow-xl"
            >
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                Registrar Capacitación y Habilitación LOTO
              </h3>

              <form onSubmit={handleAddTraining} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Empleado Evaluado:</label>
                  <select
                    className="w-full border border-slate-300 rounded p-2"
                    value={newTraining.empleadoId}
                    onChange={e => setNewTraining({ ...newTraining, empleadoId: e.target.value })}
                    required
                  >
                    <option value="">-- Seleccionar --</option>
                    {empleados.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.nombre} ({emp.cargo})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Facilitador / Instructor:</label>
                  <input
                    type="text"
                    placeholder="e.g. Ing. Pedro Lopez"
                    className="w-full border border-slate-300 rounded p-2"
                    value={newTraining.instructor}
                    onChange={e => setNewTraining({ ...newTraining, instructor: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Calificación (mín: 80):</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-full border border-slate-300 rounded p-2"
                      value={newTraining.calificacion}
                      onChange={e => setNewTraining({ ...newTraining, calificacion: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Fecha Entrenamiento:</label>
                    <input
                      type="date"
                      className="w-full border border-slate-300 rounded p-2 text-xs"
                      value={newTraining.fechaTraining}
                      onChange={e => setNewTraining({ ...newTraining, fechaTraining: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Vencimiento de Licencia LOTO (Anual):</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded p-2 text-xs"
                    value={newTraining.venceFecha}
                    onChange={e => setNewTraining({ ...newTraining, venceFecha: e.target.value })}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs font-semibold pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowTrainingModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-duncan-blue hover:bg-blue-700 text-white rounded-lg"
                  >
                    Habilitar Certificado
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ANNUAL AUDIT PROCEDURE MODAL */}
      <AnimatePresence>
        {showAuditModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 max-w-sm w-full space-y-4 shadow-xl"
            >
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                Registrar Auditoría / Evaluación de Procedimiento
              </h3>

              <form onSubmit={handleAddAudit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Máquina Evaluada:</label>
                  <select
                    className="w-full border border-slate-300 rounded p-2"
                    value={newAudit.equipoId}
                    onChange={e => setNewAudit({ ...newAudit, equipoId: e.target.value })}
                    required
                  >
                    <option value="">-- Seleccionar --</option>
                    {equipos.map(eq => (
                      <option key={eq.id} value={eq.id}>{eq.nombre} ({eq.codigo})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Auditor a cargo (Administrador):</label>
                  <select
                    className="w-full border border-slate-300 rounded p-2"
                    value={newAudit.auditorId}
                    onChange={e => setNewAudit({ ...newAudit, auditorId: e.target.value })}
                    required
                  >
                    <option value="">-- Seleccionar --</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>{u.displayName} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Fecha de Inspección:</label>
                    <input
                      type="date"
                      className="w-full border border-slate-300 rounded p-2"
                      value={newAudit.fechaAuditoria}
                      onChange={e => setNewAudit({ ...newAudit, fechaAuditoria: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Conformidad:</label>
                    <select
                      className="w-full border border-slate-300 rounded p-2"
                      value={newAudit.conformidad ? "true" : "false"}
                      onChange={e => setNewAudit({ ...newAudit, conformidad: e.target.value === "true" })}
                    >
                      <option value="true">APROBADO (Alineado con OSHA)</option>
                      <option value="false">NO CONFORME (Requiere Adecuaciones)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Observaciones / Hallazgos:</label>
                  <textarea
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs resize-none"
                    rows={3}
                    placeholder="Anote observaciones críticas sobre el bloqueo..."
                    value={newAudit.observaciones}
                    onChange={e => setNewAudit({ ...newAudit, observaciones: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs font-semibold pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAuditModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-duncan-blue hover:bg-blue-700 text-white rounded-lg"
                  >
                    Registrar Auditoría
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
