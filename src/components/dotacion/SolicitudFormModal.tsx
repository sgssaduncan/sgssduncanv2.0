import React, { useState } from 'react';
import SignaturePad from '../SignaturePad';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../services/db';
import { auditService } from '../../services/auditService';
import {
  XCircle,
  Plus,
  AlertCircle,
  ShieldCheck,
  PenTool,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Empleado, InventarioItem, FirmaActor } from '../../types';
import toast from 'react-hot-toast';

interface SolicitudFormModalProps {
  empleados: Empleado[];
  inventario: InventarioItem[];
  onClose: () => void;
  onSave: () => void;
}

export default function SolicitudFormModal({
  empleados,
  inventario,
  onClose,
  onSave
}: SolicitudFormModalProps) {
  const { user } = useAuth();
  const [empleadoId, setEmpleadoId] = useState('');
  const [motivo, setMotivo] = useState('Dotación');
  const [items, setItems] = useState<{ itemId: string; cantidad: number; talla: string }[]>([
    { itemId: '', cantidad: 1, talla: '' }
  ]);
  const [saving, setSaving] = useState(false);

  // Solicitante / Supervisor details
  const [solicitanteNombre, setSolicitanteNombre] = useState(user?.email?.split('@')[0] || '');
  const [solicitanteCedula, setSolicitanteCedula] = useState('');
  const [solicitanteCargo, setSolicitanteCargo] = useState('Supervisor de Área');
  const [apruebaComoSupervisor, setApruebaComoSupervisor] = useState(true);
  const [firmaSolicitanteUrl, setFirmaSolicitanteUrl] = useState('');
  const [mostrarFirmaPad, setMostrarFirmaPad] = useState(false);

  // Fajas lumbares exception parameters (Prescripción médica)
  const [prescripcionMedicaValidada, setPrescripcionMedicaValidada] = useState(false);
  const [registroPrescripcion, setRegistroPrescripcion] = useState('');
  const [duracionTratamientoDias, setDuracionTratamientoDias] = useState<number>(30);
  const [medicoValidador, setMedicoValidador] = useState('');

  // Failure / Re-evaluation report flags (LOPCYMAT Art 62)
  const [fallaReportadaExplicacion, setFallaReportadaExplicacion] = useState('');
  const [noSatisfaceProteccionSST, setNoSatisfaceProteccionSST] = useState(false);

  // Dynamic detection of lumbar girdle item in active selection
  const contieneFajaLumbar = (items || []).some(it => {
    const inv = (inventario || []).find(i => i.id === it.itemId);
    if (!inv) return false;
    return (
      inv.esFajaLumbar === true ||
      (inv.nombre || '').toLowerCase().includes('faja') ||
      (inv.nombre || '').toLowerCase().includes('lumbar')
    );
  });

  const addItem = () => {
    setItems([...(items || []), { itemId: '', cantidad: 1, talla: '' }]);
  };

  const removeItem = (idx: number) => {
    setItems((items || []).filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemsList = items || [];
    if (!empleadoId || itemsList.length === 0) {
      toast.error('Debe seleccionar un empleado y agregar al menos un artículo.');
      return;
    }

    const itemsValid = itemsList.every(i => i.itemId && i.talla && i.cantidad > 0);
    if (!itemsValid) {
      toast.error('Complete todos los campos requeridos en la lista de artículos (artículo, talla y cantidad).');
      return;
    }

    if (!solicitanteNombre.trim() || !solicitanteCedula.trim()) {
      toast.error('Debe indicar el nombre y cédula del supervisor solicitante.');
      return;
    }

    // Hard Stop Validation for Girdle restriction (INPSASEL Ergo rule)
    if (contieneFajaLumbar) {
      if (!prescripcionMedicaValidada) {
        toast.error('CONSTRICCIÓN SST: Las fajas lumbares requieren aval médico ocupacional.');
        return;
      }
      if (!registroPrescripcion.trim() || !medicoValidador.trim()) {
        toast.error('Debe ingresar el N° de Registro de Prescripción y el Médico Ocupacional validador.');
        return;
      }
    }

    // Failure inspection validation (LOPCYMAT Art 62)
    if ((motivo === 'Deterioro' || noSatisfaceProteccionSST) && !fallaReportadaExplicacion.trim()) {
      toast.error('LOPCYMAT Art. 62: Debe registrar la explicación sucinta de la falla o causa del deterioro del E.P.P.');
      return;
    }

    const outOfStockItems = itemsList.some(it => {
      const inv = (inventario || []).find(i => i.id === it.itemId);
      const stockItem = (inv?.stock || []).find(s => s.talla === it.talla);
      return stockItem && it.cantidad > stockItem.cantidad;
    });

    if (
      outOfStockItems &&
      !window.confirm('Algunos artículos exceden el inventario disponible. ¿Desea registrar la solicitud de todos modos para generar la orden de pedido?')
    ) {
      return;
    }

    setSaving(true);
    try {
      const firmaSolicitanteObj: FirmaActor | undefined = firmaSolicitanteUrl
        ? {
            nombre: solicitanteNombre.trim(),
            cedula: solicitanteCedula.trim(),
            cargo: solicitanteCargo.trim(),
            fecha: new Date().toISOString(),
            firmaUrl: firmaSolicitanteUrl
          }
        : undefined;

      const estadoInicial = apruebaComoSupervisor ? 'Aprobada por Supervisor' : 'Solicitada';

      const nuevaSolicitudData = {
        empleadoId,
        solicitanteId: user?.uid || '',
        fechaSolicitud: new Date().toISOString().split('T')[0],
        estado: estadoInicial,
        items,
        motivo,
        firmaSolicitante: firmaSolicitanteObj,
        firmaSupervisor: apruebaComoSupervisor ? firmaSolicitanteObj : undefined,
        prescripcionMedicaValidada: contieneFajaLumbar ? prescripcionMedicaValidada : false,
        registroPrescripcion: contieneFajaLumbar ? registroPrescripcion : '',
        duracionTratamientoDias: contieneFajaLumbar ? duracionTratamientoDias : 0,
        medicoValidador: contieneFajaLumbar ? medicoValidador : '',
        tipoReemplazo: motivo === 'Deterioro' || noSatisfaceProteccionSST ? 'Deterioro' : 'Ordinario',
        fallaReportadaExplicacion: motivo === 'Deterioro' || noSatisfaceProteccionSST ? fallaReportadaExplicacion : '',
        noSatisfaceProteccionSST
      };

      const solId = await dbService.addSolicitudEPP(nuevaSolicitudData);

      // Audit log
      const empTarget = empleados.find(e => e.id === empleadoId);
      await auditService.log({
        accion: 'CREAR',
        modulo: 'DOTACION_EPP',
        descripcion: `Solicitud de dotación creada para trabajador ${empTarget?.nombre || empleadoId} (C.I: ${empTarget?.cedula || 'N/A'}). Estado: ${estadoInicial}.`,
        detalles: {
          solicitudId: solId,
          trabajadorId: empleadoId,
          trabajadorNombre: empTarget?.nombre,
          motivo,
          itemsCount: items.length,
          estadoInicial,
          solicitanteCargo
        },
        entidadTipo: 'solicitudesEPP',
        entidadId: solId,
        severidad: noSatisfaceProteccionSST ? 'AVISO' : 'INFO'
      });

      if (noSatisfaceProteccionSST) {
        toast.success('Solicitud enviada. ¡ALERTA SST ACTIVADA por falla o insuficiencia del EPP!');
      } else {
        toast.success(`Solicitud creada exitosamente (${estadoInicial})`);
      }
      onSave();
    } catch (error) {
      console.error(error);
      toast.error('Error al crear la solicitud de dotación.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col border border-slate-200">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          {/* Header */}
          <div className="p-5 md:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                  ETAPA 1: SOLICITUD
                </span>
                <span className="text-xs text-slate-500">Flujo Digital de 4 Actores</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900">
                Nueva Solicitud de Dotación y E.P.P.
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="p-5 md:p-6 space-y-6 flex-1">
            {/* Step 1: Worker & Motivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trabajador Beneficiario <span className="text-red-500">*</span>
                </label>
                <select
                  value={empleadoId}
                  onChange={e => setEmpleadoId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-duncan-blue bg-white font-medium"
                  required
                >
                  <option value="">Seleccione un trabajador de la nómina...</option>
                  {(empleados || []).map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} — C.I: {emp.cedula} ({emp.cargo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo de la Solicitud <span className="text-red-500">*</span>
                </label>
                <select
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs outline-none focus:border-duncan-blue bg-white font-medium"
                  required
                >
                  <option value="Dotación">Dotación Ordinaria Reglamentaria (SST)</option>
                  <option value="Deterioro">Reemplazo por Deterioro / Falla Técnica (Art. 62)</option>
                  <option value="Pérdida">Reemplazo por Pérdida / Extravío</option>
                  <option value="Robo">Reemplazo por Robo / Hurto</option>
                  <option value="Ingreso">Nueva Incorporación / Ingreso de Personal</option>
                  <option value="Otros">Otros Motivos Justificados</option>
                </select>
              </div>
            </div>

            {/* Deterioro / Art 62 LOPCYMAT Form */}
            {motivo === 'Deterioro' && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-xs space-y-3">
                <p className="font-bold text-orange-900 flex items-center gap-1.5">
                  <AlertCircle size={15} /> Inspección y Sustitución de EPP (Art. 62 LOPCYMAT)
                </p>
                <p className="text-orange-800 leading-normal">
                  De acuerdo al Art. 62 de la LOPCYMAT, ante un deterioro prematuro o falla de un EPP, se debe detallar la causa para que el SSST verifique si el equipo fue adecuado frente a los riesgos presentes.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Explicación sucinta de la falla o causa del deterioro <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={fallaReportadaExplicacion}
                    onChange={e => setFallaReportadaExplicacion(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 outline-none focus:border-orange-500 text-xs"
                    placeholder="Ej: Suela desprendida por contacto con ácido, visor agrietado por impacto de partículas..."
                    required
                  />
                </div>
                <label className="flex items-start gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={noSatisfaceProteccionSST}
                    onChange={e => setNoSatisfaceProteccionSST(e.target.checked)}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4 mt-0.5"
                  />
                  <div className="text-red-800">
                    <p className="font-bold">⚠️ Alerta: El E.P.P. resultó insuficiente frente al peligro</p>
                    <p className="text-[10px] text-red-600 mt-0.5">
                      Activará notificación urgente al Comité de Seguridad y Especialista SST para rediseño preventivo.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Faja Lumbar Validation Form */}
            {contieneFajaLumbar && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs space-y-3">
                <p className="font-bold text-red-900 flex items-center gap-1.5 uppercase">
                  ⚠️ Constricción Normativa: Fajas Lumbares (Ergonomía INPSASEL)
                </p>
                <p className="text-red-800 leading-normal">
                  Las directrices ergonómicas prohíben asignar fajas lumbares de forma indiscriminada. Requiere aval médico ocupacional estricto.
                </p>
                <label className="flex items-start gap-2.5 bg-white p-2.5 rounded-lg border border-red-200">
                  <input
                    type="checkbox"
                    checked={prescripcionMedicaValidada}
                    onChange={e => setPrescripcionMedicaValidada(e.target.checked)}
                    className="rounded border-red-300 text-red-600 focus:ring-red-500 w-4 h-4 mt-0.5"
                    required
                  />
                  <div>
                    <p className="font-bold text-slate-800">Posee prescripción médica temporal validada por el SSST</p>
                    <p className="text-[10px] text-slate-500">Aval terapéutico con tiempo determinado de tratamiento.</p>
                  </div>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Médico Validador *</label>
                    <input
                      type="text"
                      value={medicoValidador}
                      onChange={e => setMedicoValidador(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs outline-none focus:border-red-500"
                      placeholder="Dr(a). Nombre y N° MPPS / INPSASEL"
                      required={contieneFajaLumbar}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Tratamiento (Días) *</label>
                    <input
                      type="number"
                      min="1"
                      value={duracionTratamientoDias}
                      onChange={e => setDuracionTratamientoDias(parseInt(e.target.value) || 30)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs outline-none focus:border-red-500"
                      required={contieneFajaLumbar}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">N° Registro de Prescripción *</label>
                    <input
                      type="text"
                      value={registroPrescripcion}
                      onChange={e => setRegistroPrescripcion(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs outline-none focus:border-red-500"
                      placeholder="Código de informe médico en archivo SSA..."
                      required={contieneFajaLumbar}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Items List */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Implementos y Uniformes a Suministrar
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-xs font-bold text-duncan-blue bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} /> Agregar Artículo
                </button>
              </div>

              <div className="space-y-3">
                {items.map((it, idx) => {
                  const selectedInv = (inventario || []).find(i => i.id === it.itemId);
                  const stockDisponible =
                    (selectedInv?.stock || []).find(s => s.talla === it.talla)?.cantidad ?? 0;
                  const isExceeded = it.talla && it.cantidad > stockDisponible;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col md:flex-row gap-2.5 items-start md:items-center bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs"
                    >
                      <div className="flex-1 w-full">
                        <select
                          value={it.itemId}
                          onChange={e => {
                            const newIt = [...items];
                            newIt[idx].itemId = e.target.value;
                            newIt[idx].talla = '';
                            setItems(newIt);
                          }}
                          className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-medium outline-none focus:border-duncan-blue"
                          required
                        >
                          <option value="">Seleccione un implemento del catálogo...</option>
                          {(inventario || []).map(inv => (
                            <option key={inv.id} value={inv.id}>
                              {inv.nombre} ({inv.codigo}) — Cat: {inv.categoria}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full md:w-40">
                        <select
                          value={it.talla}
                          onChange={e => {
                            const newIt = [...items];
                            newIt[idx].talla = e.target.value;
                            setItems(newIt);
                          }}
                          className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-medium outline-none focus:border-duncan-blue"
                          required
                        >
                          <option value="">Seleccione Talla...</option>
                          {(selectedInv?.stock || []).map(s => (
                            <option key={s.talla} value={s.talla}>
                              {s.talla} (Disp: {s.cantidad})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full md:w-24">
                        <input
                          type="number"
                          min="1"
                          value={it.cantidad}
                          onChange={e => {
                            const newIt = [...items];
                            newIt[idx].cantidad = parseInt(e.target.value) || 1;
                            setItems(newIt);
                          }}
                          className={cn(
                            'w-full border rounded-lg p-2 text-xs font-bold text-center outline-none',
                            isExceeded
                              ? 'border-red-400 bg-red-50 text-red-700'
                              : 'border-slate-300 bg-white focus:border-duncan-blue'
                          )}
                          placeholder="Cant."
                          required
                        />
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-red-400 hover:text-red-600 p-2 rounded-lg transition-colors"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Solicitante / Supervisor Inmediato Identification & Digital Signature */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <UserCheck size={16} className="text-duncan-blue" />
                    Actor 1: Supervisor Inmediato / Solicitante
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Datos del supervisor que emite y avala la necesidad operativa del requerimiento.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    value={solicitanteNombre}
                    onChange={e => setSolicitanteNombre(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white outline-none focus:border-duncan-blue"
                    placeholder="Ej: Ing. Pedro Rodríguez"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cédula de Identidad *</label>
                  <input
                    type="text"
                    value={solicitanteCedula}
                    onChange={e => setSolicitanteCedula(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white outline-none focus:border-duncan-blue"
                    placeholder="Ej: V-15.420.910"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cargo *</label>
                  <input
                    type="text"
                    value={solicitanteCargo}
                    onChange={e => setSolicitanteCargo(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white outline-none focus:border-duncan-blue"
                    placeholder="Ej: Supervisor de Producción"
                    required
                  />
                </div>
              </div>

              {/* Direct Approval Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs bg-white p-3 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={apruebaComoSupervisor}
                  onChange={e => setApruebaComoSupervisor(e.target.checked)}
                  className="rounded border-slate-300 text-duncan-blue focus:ring-duncan-blue w-4 h-4"
                />
                <span className="font-bold text-slate-800">
                  Aprobar directamente como Supervisor Inmediato (Pasa directo a Validación SSA)
                </span>
              </label>

              {/* Signature Pad Section */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <PenTool size={14} className="text-duncan-blue" />
                    Firma Digital Manuscrita del Supervisor
                  </label>
                  {firmaSolicitanteUrl && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle size={12} /> Rúbrica Capturada
                    </span>
                  )}
                </div>

                <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-inner">
                  <SignaturePad
                    label="Rúbrica Digital del Supervisor Solicitante"
                    onSave={url => setFirmaSolicitanteUrl(url)}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Estampe su firma en el recuadro para que quede incrustada de forma vectorial en el Acta Oficial de Entrega PDF.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 md:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 sticky bottom-0 z-20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-duncan-blue hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle size={15} />
              )}
              Emitir y Guardar Solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
