import React, { useState } from 'react';
import SignaturePad from '../SignaturePad';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../services/db';
import { auditService } from '../../services/auditService';
import {
  XCircle,
  CheckCircle,
  Truck,
  Download,
  Share2,
  MessageCircle,
  Mail,
  ShieldCheck,
  PenTool,
  AlertCircle,
  FileCheck,
  Clock,
  User,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SolicitudEPP, EntregaEPP, Empleado, InventarioItem, FirmaActor, EstadoSolicitudEPP } from '../../types';
import toast from 'react-hot-toast';
import { generarActaDotacionPDF, formatDateString } from './generarActaDotacionPDF';

interface SolicitudDetalleModalProps {
  solicitud: SolicitudEPP;
  empleados: Empleado[];
  inventario: InventarioItem[];
  entregas: EntregaEPP[];
  onClose: () => void;
  onUpdate: () => void;
}

type TipoActorFirma = 'supervisor' | 'sst' | 'despacho' | 'receptor';

interface ModalFirmaState {
  actor: TipoActorFirma;
  titulo: string;
  subtitulo: string;
}

export default function SolicitudDetalleModal({
  solicitud,
  empleados,
  inventario,
  entregas,
  onClose,
  onUpdate
}: SolicitudDetalleModalProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [modalFirma, setModalFirma] = useState<ModalFirmaState | null>(null);

  // Form states for the digital signing submodal
  const [firmanteNombre, setFirmanteNombre] = useState('');
  const [firmanteCedula, setFirmanteCedula] = useState('');
  const [firmanteCargo, setFirmanteCargo] = useState('');
  const [firmanteRegistro, setFirmanteRegistro] = useState('');
  const [firmanteFirmaUrl, setFirmanteFirmaUrl] = useState('');
  const [observacionesFirma, setObservacionesFirma] = useState('');

  // LOPCYMAT Checklist for worker receipt
  const [inducidoTeoricoPractico, setInducidoTeoricoPractico] = useState(true);
  const [constanciaSujetoRiesgos, setConstanciaSujetoRiesgos] = useState(true);

  const emp = empleados.find(e => e.id === solicitud.empleadoId);
  const entrega = entregas.find(e => e.solicitudId === solicitud.id);

  // Open signing submodal pre-filled with reasonable defaults
  const handleOpenFirmaModal = (actor: TipoActorFirma) => {
    setFirmanteFirmaUrl('');
    setObservacionesFirma('');

    if (actor === 'supervisor') {
      const existing = solicitud.firmaSupervisor || solicitud.firmaSolicitante;
      setFirmanteNombre(existing?.nombre || user?.email?.split('@')[0] || '');
      setFirmanteCedula(existing?.cedula || '');
      setFirmanteCargo(existing?.cargo || 'Supervisor Inmediato');
      setFirmanteRegistro('');
      setModalFirma({
        actor: 'supervisor',
        titulo: 'Firma Digital: Supervisor Inmediato',
        subtitulo: 'Aprobación del requerimiento de dotación según necesidad de puesto de trabajo'
      });
    } else if (actor === 'sst') {
      const existing = solicitud.firmaSST;
      setFirmanteNombre(existing?.nombre || user?.email?.split('@')[0] || '');
      setFirmanteCedula(existing?.cedula || '');
      setFirmanteCargo(existing?.cargo || 'Especialista en Seguridad y Salud en el Trabajo');
      setFirmanteRegistro(existing?.registroProfesional || 'INPSASEL-SSA-01');
      setModalFirma({
        actor: 'sst',
        titulo: 'Firma Digital: Validación Técnica SSA / SST',
        subtitulo: 'Certificación de cumplimiento normativo LOPCYMAT, COVENIN y matriz de riesgos'
      });
    } else if (actor === 'despacho') {
      const existing = solicitud.firmaDespacho;
      setFirmanteNombre(existing?.nombre || user?.email?.split('@')[0] || '');
      setFirmanteCedula(existing?.cedula || '');
      setFirmanteCargo(existing?.cargo || 'Analista de Control de Almacén');
      setFirmanteRegistro(existing?.registroProfesional || 'GUIA-ALM-001');
      setModalFirma({
        actor: 'despacho',
        titulo: 'Firma Digital: Control de Almacén y Despacho',
        subtitulo: 'Preparación física de dotación, verificación de tallas y egreso de inventario'
      });
    } else if (actor === 'receptor') {
      const existing = solicitud.firmaReceptor;
      setFirmanteNombre(existing?.nombre || emp?.nombre || '');
      setFirmanteCedula(existing?.cedula || emp?.cedula || '');
      setFirmanteCargo(existing?.cargo || emp?.cargo || 'Trabajador Receptor');
      setFirmanteRegistro('');
      setModalFirma({
        actor: 'receptor',
        titulo: 'Firma Digital: Trabajador Beneficiario',
        subtitulo: 'Recepción conforme de implementos e inducción teórica-práctica de uso y cuidado'
      });
    }
  };

  const handleGuardarFirmaActor = async () => {
    if (!modalFirma) return;
    if (!firmanteNombre.trim() || !firmanteCedula.trim()) {
      toast.error('Nombre y Cédula son obligatorios para la firma digital.');
      return;
    }
    if (!firmanteFirmaUrl) {
      toast.error('Debe estampar su rúbrica digital en el recuadro de firma.');
      return;
    }

    if (modalFirma.actor === 'receptor') {
      if (!inducidoTeoricoPractico || !constanciaSujetoRiesgos) {
        toast.error('LOPCYMAT Art. 53-54: Ambas declaraciones de inducción y notificación de riesgos deben ser aceptadas.');
        return;
      }
    }

    setSaving(true);
    try {
      const firmaObj: FirmaActor = {
        nombre: firmanteNombre.trim(),
        cedula: firmanteCedula.trim(),
        cargo: firmanteCargo.trim(),
        fecha: new Date().toISOString(),
        firmaUrl: firmanteFirmaUrl,
        registroProfesional: firmanteRegistro.trim() || undefined,
        observaciones: observacionesFirma.trim() || undefined
      };

      const updatePayload: Partial<SolicitudEPP> = {};
      let nuevoEstado: EstadoSolicitudEPP = solicitud.estado;

      if (modalFirma.actor === 'supervisor') {
        updatePayload.firmaSupervisor = firmaObj;
        nuevoEstado = 'Aprobada por Supervisor';
        updatePayload.estado = nuevoEstado;
      } else if (modalFirma.actor === 'sst') {
        updatePayload.firmaSST = firmaObj;
        nuevoEstado = 'Aprobada por SSA';
        updatePayload.estado = nuevoEstado;
      } else if (modalFirma.actor === 'despacho') {
        updatePayload.firmaDespacho = firmaObj;
        nuevoEstado = 'Despachada';
        updatePayload.estado = nuevoEstado;
      } else if (modalFirma.actor === 'receptor') {
        updatePayload.firmaReceptor = firmaObj;
        nuevoEstado = 'Recibida';
        updatePayload.estado = nuevoEstado;

        // Registrar formalmente en tabla de entregas
        await dbService.addEntregaEPP({
          solicitudId: solicitud.id,
          empleadoId: solicitud.empleadoId,
          entregadoPor: user?.uid || 'SST',
          fechaEntrega: new Date().toISOString(),
          items: solicitud.items,
          firmaUrl: firmanteFirmaUrl,
          comentarios: observacionesFirma,
          inducidoTeoricoPractico,
          constanciaSujetoRiesgos,
          firmaSolicitante: solicitud.firmaSolicitante,
          firmaSupervisor: solicitud.firmaSupervisor,
          firmaSST: solicitud.firmaSST,
          firmaDespacho: solicitud.firmaDespacho,
          firmaReceptor: firmaObj
        }, solicitud.items);
      }

      await dbService.updateSolicitudEPP(solicitud.id, updatePayload);

      // Forensic Audit Log
      await auditService.log({
        accion: 'FIRMAR',
        modulo: 'DOTACION_EPP',
        descripcion: `Firma digital estampada por actor ${modalFirma.actor.toUpperCase()} (${firmanteNombre} - ${firmanteCargo}). Estado avanzado a: ${nuevoEstado}.`,
        detalles: {
          solicitudId: solicitud.id,
          actor: modalFirma.actor,
          estadoAnterior: solicitud.estado,
          nuevoEstado,
          firmanteCargo
        },
        entidadTipo: 'solicitudesEPP',
        entidadId: solicitud.id,
        severidad: 'INFO'
      });

      toast.success(`Firma de ${modalFirma.actor.toUpperCase()} registrada. Estado: ${nuevoEstado}`);
      setModalFirma(null);
      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar la firma digital.');
    } finally {
      setSaving(false);
    }
  };

  const handleRechazar = async () => {
    const motivo = window.prompt('Por favor indique el motivo del rechazo de la dotación:');
    if (!motivo) return;

    setSaving(true);
    try {
      await dbService.updateSolicitudEPP(solicitud.id, {
        estado: 'Rechazada',
        motivoRechazo: motivo
      });
      await auditService.log({
        accion: 'RECHAZAR',
        modulo: 'DOTACION_EPP',
        descripcion: `Solicitud de dotación ${solicitud.id} rechazada. Motivo: ${motivo}`,
        detalles: {
          solicitudId: solicitud.id,
          motivoRechazo: motivo
        },
        entidadTipo: 'solicitudesEPP',
        entidadId: solicitud.id,
        severidad: 'AVISO'
      });
      toast.success('Solicitud marcada como Rechazada.');
      onUpdate();
    } catch (e) {
      toast.error('Error al rechazar solicitud.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async (method: 'download' | 'whatsapp' | 'email') => {
    setSaving(true);
    try {
      const { doc, fileName } = generarActaDotacionPDF({
        solicitud,
        empleado: emp,
        inventario,
        entrega
      });
      const pdfData = doc.output('datauristring');

      // Descarga directa del archivo vectorial nativo
      doc.save(fileName);

      if (user) {
        try {
          await dbService.saveReportePDF({
            tipo: 'Acta_Dotacion',
            fecha: new Date().toISOString(),
            nombre: fileName,
            referencia: solicitud.id,
            pdfData,
            userId: user.uid
          });
        } catch (e) {
          console.warn('No se pudo guardar en histórico', e);
        }
      }

      if (method === 'download') {
        toast.success('Acta Oficial PDF (2 páginas) descargada y archivada.');
      } else if (method === 'whatsapp') {
        const text = encodeURIComponent(
          `Hola, te comparto el Acta Oficial de Dotación y E.P.P. de Duncan: ${fileName}.\n(El archivo PDF se ha descargado en tu dispositivo; adjúntalo a este chat).`
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
        toast.success('Acta PDF descargada. Abriendo WhatsApp...');
      } else if (method === 'email') {
        const subject = encodeURIComponent(`Acta Oficial de Dotación y EPP - ${emp?.nombre || 'Colaborador'}`);
        const body = encodeURIComponent(
          `Estimado(a),\n\nAdjunto el Acta Oficial de Entrega de Dotación, E.P.P. y Uniformes con las 4 firmas digitales reglamentarias:\n\n📄 Archivo: ${fileName}\n\n(El archivo PDF se ha descargado automáticamente en su carpeta de Descargas).\n\nSaludos cordiales,\nUnidad de Seguridad y Salud en el Trabajo (SST) - Duncan.`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        toast.success('Acta PDF descargada. Abriendo gestor de correo...');
      }
    } catch (error) {
      console.error('Error al generar el Acta PDF:', error);
      toast.error('Error al exportar el Acta PDF.');
    } finally {
      setSaving(false);
    }
  };

  const WORKFLOW_STEPS = [
    { key: 'Solicitada', label: '1. Solicitada', desc: 'Supervisor' },
    { key: 'Aprobada por Supervisor', label: '2. Aprobada Sup.', desc: 'Validada' },
    { key: 'Aprobada por SSA', label: '3. Validada SSA', desc: 'Normativa' },
    { key: 'Despachada', label: '4. Despachada', desc: 'Almacén' },
    { key: 'Recibida', label: '5. Conforme', desc: 'Trabajador' }
  ];

  const currentStepIdx = WORKFLOW_STEPS.findIndex(s => s.key === solicitud.estado);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col border border-slate-200">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                SG-SST DUNCAN
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {solicitud.id}</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Expediente Digital de Dotación y E.P.P.
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="p-5 md:p-6 space-y-6 flex-1">
          {/* Workflow Stepper */}
          {solicitud.estado === 'Rechazada' ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
              <ShieldAlert className="shrink-0" size={24} />
              <div>
                <p className="font-bold text-sm">SOLICITUD RECHAZADA</p>
                <p className="text-xs">Motivo: {solicitud.motivoRechazo || 'No especificado'}</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Flujo Digital de Aprobaciones (4 Actores)
              </p>
              <div className="grid grid-cols-5 gap-2 relative">
                {WORKFLOW_STEPS.map((st, idx) => {
                  const isDone = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;
                  return (
                    <div key={st.key} className="flex flex-col items-center text-center">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-1.5 border-2',
                          isDone
                            ? 'bg-duncan-blue border-duncan-blue text-white shadow-sm'
                            : 'bg-white border-slate-300 text-slate-400',
                          isCurrent && 'ring-4 ring-blue-100'
                        )}
                      >
                        {isDone ? <CheckCircle size={16} /> : idx + 1}
                      </div>
                      <p className={cn('text-[11px] font-bold leading-tight', isDone ? 'text-slate-800' : 'text-slate-400')}>
                        {st.label}
                      </p>
                      <p className="text-[9.5px] text-slate-400 hidden md:block">{st.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Worker Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Trabajador</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{emp?.nombre || 'Desconocido'}</p>
              <p className="text-slate-600 mt-0.5">C.I: {emp?.cedula || 'N/A'}</p>
              <p className="text-slate-500 mt-0.5">{emp?.cargo} · {emp?.departamento}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Detalles del Pedido</p>
              <p className="font-semibold text-slate-700 mt-0.5">Motivo: <span className="font-bold text-slate-900">{solicitud.motivo || 'Ordinaria'}</span></p>
              <p className="text-slate-600 mt-0.5">Emisión: {formatDateString(solicitud.createdAt || solicitud.fechaSolicitud)}</p>
              <p className="text-slate-600 mt-0.5">Total Artículos: {(solicitud.items || []).reduce((a, c) => a + (c.cantidad || 0), 0)} unds</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Estado Actual</p>
              <span
                className={cn(
                  'inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1',
                  solicitud.estado === 'Solicitada' && 'bg-yellow-100 text-yellow-800',
                  solicitud.estado === 'Aprobada por Supervisor' && 'bg-blue-100 text-blue-800',
                  solicitud.estado === 'Aprobada por SSA' && 'bg-purple-100 text-purple-800',
                  solicitud.estado === 'Despachada' && 'bg-amber-100 text-amber-800',
                  solicitud.estado === 'Recibida' && 'bg-emerald-100 text-emerald-800',
                  solicitud.estado === 'Rechazada' && 'bg-red-100 text-red-800'
                )}
              >
                {solicitud.estado}
              </span>
              {solicitud.prescripcionMedicaValidada && (
                <p className="text-[10px] text-red-600 font-bold mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> Aval Médico Faja Lumbar Activo
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-2">Implementos Solicitados y Asignados</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Código</th>
                    <th className="px-3 py-2.5">Descripción del Material / E.P.P.</th>
                    <th className="px-3 py-2.5">Categoría</th>
                    <th className="px-3 py-2.5 text-center">Talla</th>
                    <th className="px-3 py-2.5 text-center">Cant</th>
                    <th className="px-3 py-2.5">Norma / Certificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(solicitud.items || []).map((it, idx) => {
                    const inv = (inventario || []).find(i => i.id === it.itemId);
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono text-slate-500">{inv?.codigo || 'S/C'}</td>
                        <td className="px-3 py-2 font-bold text-slate-800">{inv?.nombre || it.itemId}</td>
                        <td className="px-3 py-2 text-slate-600 uppercase text-[10px]">{inv?.categoria || 'EPP'}</td>
                        <td className="px-3 py-2 text-center font-bold text-slate-700">{it.talla || 'ÚNICA'}</td>
                        <td className="px-3 py-2 text-center font-black text-slate-900">{it.cantidad}</td>
                        <td className="px-3 py-2 text-slate-500 text-[10px]">{inv?.documentoEficacia || 'COVENIN / ANSI'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Digital Signatures Matrix of 4 Actors */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck size={18} className="text-duncan-blue" />
                  Matriz de Firmas Digitales de los 4 Actores
                </h3>
                <p className="text-xs text-slate-500">
                  Cada actor debe estampar su rúbrica digital trazable para formalizar el expediente legal.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Actor 1: Solicitante / Supervisor */}
              <FirmaCard
                numero={1}
                rol="Supervisor Inmediato"
                subtitulo="Aprobación de Requerimiento Operativo"
                firma={solicitud.firmaSupervisor || solicitud.firmaSolicitante}
                estadoSolicitud={solicitud.estado}
                puedeFirmar={solicitud.estado === 'Solicitada' || !solicitud.firmaSupervisor}
                botonTexto="Firmar como Supervisor"
                onFirmar={() => handleOpenFirmaModal('supervisor')}
              />

              {/* Actor 2: Especialista Técnico SSA / SST */}
              <FirmaCard
                numero={2}
                rol="Validación Técnica SSA / SST"
                subtitulo="Revisión Normativa LOPCYMAT y COVENIN"
                firma={solicitud.firmaSST}
                estadoSolicitud={solicitud.estado}
                puedeFirmar={
                  solicitud.estado === 'Aprobada por Supervisor' ||
                  (solicitud.estado !== 'Rechazada' && !solicitud.firmaSST)
                }
                botonTexto="Validar y Firmar SSA"
                onFirmar={() => handleOpenFirmaModal('sst')}
              />

              {/* Actor 3: Control de Almacén y Despacho */}
              <FirmaCard
                numero={3}
                rol="Control de Almacén / Despacho"
                subtitulo="Preparación y Salida Física de Stock"
                firma={solicitud.firmaDespacho}
                estadoSolicitud={solicitud.estado}
                puedeFirmar={
                  solicitud.estado === 'Aprobada por SSA' ||
                  (solicitud.estado !== 'Rechazada' && !solicitud.firmaDespacho)
                }
                botonTexto="Firmar Despacho Físico"
                onFirmar={() => handleOpenFirmaModal('despacho')}
              />

              {/* Actor 4: Trabajador Beneficiario */}
              <FirmaCard
                numero={4}
                rol="Trabajador Beneficiario"
                subtitulo="Recepción Conforme e Inducción Recibida"
                firma={solicitud.firmaReceptor || (entrega?.firmaUrl ? {
                  nombre: emp?.nombre || 'Trabajador',
                  cedula: emp?.cedula || 'N/A',
                  cargo: emp?.cargo || 'Receptor',
                  fecha: entrega.fechaEntrega,
                  firmaUrl: entrega.firmaUrl
                } : undefined)}
                estadoSolicitud={solicitud.estado}
                puedeFirmar={
                  solicitud.estado === 'Despachada' ||
                  (solicitud.estado !== 'Rechazada' && !solicitud.firmaReceptor)
                }
                botonTexto="Firmar Recepción Conforme"
                onFirmar={() => handleOpenFirmaModal('receptor')}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-6 border-t border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
          <div className="flex items-center gap-2 w-full md:w-auto">
            {solicitud.estado !== 'Rechazada' && solicitud.estado !== 'Recibida' && (
              <button
                type="button"
                disabled={saving}
                onClick={handleRechazar}
                className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
              >
                Rechazar Dotación
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleShare('download')}
              className="px-4 py-2.5 bg-duncan-blue hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Download size={15} />
              Descargar Acta Oficial PDF (2 Páginas)
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleShare('whatsapp')}
              className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle size={15} />
              WhatsApp
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleShare('email')}
              className="px-3 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Mail size={15} />
              Email
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-200 font-bold rounded-xl text-xs transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* SUBMODAL: FIRMA DIGITAL DEL ACTOR */}
        {modalFirma && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-5 md:p-6 space-y-4 border border-slate-200 max-h-[95vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{modalFirma.titulo}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{modalFirma.subtitulo}</p>
                </div>
                <button
                  onClick={() => setModalFirma(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      value={firmanteNombre}
                      onChange={e => setFirmanteNombre(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-duncan-blue"
                      placeholder="Ej: Ing. Carlos Pérez"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cédula de Identidad *</label>
                    <input
                      type="text"
                      value={firmanteCedula}
                      onChange={e => setFirmanteCedula(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-duncan-blue"
                      placeholder="Ej: V-14.850.210"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cargo *</label>
                    <input
                      type="text"
                      value={firmanteCargo}
                      onChange={e => setFirmanteCargo(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-duncan-blue"
                      placeholder="Ej: Jefe de Almacén"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {modalFirma.actor === 'sst'
                        ? 'N° Registro INPSASEL / Carnet'
                        : modalFirma.actor === 'despacho'
                        ? 'N° Guía / Lote de Despacho'
                        : 'Registro / Carnet (Opcional)'}
                    </label>
                    <input
                      type="text"
                      value={firmanteRegistro}
                      onChange={e => setFirmanteRegistro(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-duncan-blue"
                      placeholder={modalFirma.actor === 'sst' ? 'Ej: SSA-1402-MIR' : 'Ej: GUIA-2026-904'}
                    />
                  </div>
                </div>

                {/* Mandatos legales específicos para el trabajador receptor */}
                {modalFirma.actor === 'receptor' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-2">
                    <p className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                      <FileCheck size={14} /> Constancia Legal LOPCYMAT Art. 53 y 54
                    </p>
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={inducidoTeoricoPractico}
                        onChange={e => setInducidoTeoricoPractico(e.target.checked)}
                        className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-4 h-4 mt-0.5"
                        required
                      />
                      <span className="text-[10.5px] leading-tight text-slate-700">
                        Constato haber recibido la <strong>inducción teórica-práctica</strong> sobre colocación, uso adecuado, mantenimiento y limitaciones de cada implemento.
                      </span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={constanciaSujetoRiesgos}
                        onChange={e => setConstanciaSujetoRiesgos(e.target.checked)}
                        className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-4 h-4 mt-0.5"
                        required
                      />
                      <span className="text-[10.5px] leading-tight text-slate-700">
                        He sido formalmente notificado de los <strong>procesos peligrosos</strong> que previene este E.P.P. y asumo el compromiso de uso obligatorio y buen cuidado.
                      </span>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Observaciones / Notas (Opcional)</label>
                  <input
                    type="text"
                    value={observacionesFirma}
                    onChange={e => setObservacionesFirma(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-duncan-blue"
                    placeholder="Detalle o condición particular de la aprobación..."
                  />
                </div>

                {/* Canvas Signature Pad */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Rúbrica Digital Manuscrita *
                  </label>
                  <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-inner">
                    <SignaturePad
                      label={`Firma Digital de ${modalFirma.titulo}`}
                      onSave={url => setFirmanteFirmaUrl(url)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setModalFirma(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={saving || !firmanteFirmaUrl}
                  onClick={handleGuardarFirmaActor}
                  className="px-5 py-2 bg-duncan-blue hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                >
                  {saving ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  Estampar Firma y Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FirmaCard({
  numero,
  rol,
  subtitulo,
  firma,
  estadoSolicitud,
  puedeFirmar,
  botonTexto,
  onFirmar
}: {
  numero: number;
  rol: string;
  subtitulo: string;
  firma?: FirmaActor;
  estadoSolicitud: EstadoSolicitudEPP;
  puedeFirmar: boolean;
  botonTexto: string;
  onFirmar: () => void;
}) {
  const isFirmado = !!(firma && firma.firmaUrl);

  return (
    <div
      className={cn(
        'border rounded-xl p-4 flex flex-col justify-between transition-all bg-white',
        isFirmado ? 'border-emerald-300 bg-emerald-50/20 shadow-xs' : 'border-slate-200'
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0',
                isFirmado ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              )}
            >
              {numero}
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">{rol}</h4>
              <p className="text-[10px] text-slate-500">{subtitulo}</p>
            </div>
          </div>
          <span
            className={cn(
              'px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider',
              isFirmado ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            )}
          >
            {isFirmado ? 'Firmado' : 'Pendiente'}
          </span>
        </div>

        {isFirmado ? (
          <div className="bg-white border border-slate-200 rounded-lg p-2.5 my-2 text-xs space-y-1">
            <div className="h-16 flex items-center justify-center bg-slate-50 rounded border border-dashed border-slate-200 overflow-hidden mb-2">
              <img src={firma.firmaUrl} alt="Firma" className="max-h-full max-w-full object-contain" />
            </div>
            <p className="font-bold text-slate-900 leading-tight">{firma.nombre}</p>
            <p className="text-[10px] text-slate-600">{firma.cargo} · C.I: {firma.cedula}</p>
            {firma.registroProfesional && (
              <p className="text-[9.5px] text-duncan-blue font-semibold">Reg: {firma.registroProfesional}</p>
            )}
            <p className="text-[9.5px] text-slate-400">Firmado: {formatDateString(firma.fecha)}</p>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg my-2 bg-slate-50/50">
            <PenTool size={20} className="mx-auto mb-1 text-slate-300" />
            <p className="text-[11px]">Pendiente de rúbrica digital</p>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium">Actor {numero} de 4</span>
        <button
          type="button"
          onClick={onFirmar}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
            isFirmado
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              : puedeFirmar
              ? 'bg-duncan-blue hover:bg-blue-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          )}
        >
          <PenTool size={12} />
          {isFirmado ? 'Re-firmar' : botonTexto}
        </button>
      </div>
    </div>
  );
}
