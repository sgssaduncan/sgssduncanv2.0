import React, { useState, useEffect } from 'react';
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
  UserCheck,
  User,
  Sparkles,
  Shirt,
  Info,
  Crown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Empleado, InventarioItem, FirmaActor } from '../../types';
import toast from 'react-hot-toast';
import {
  obtenerOpcionesTalla,
  obtenerTallaSugerida,
  detectarTipoImplemento,
  requiereTalla
} from '../../lib/tallasCatalog';

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
  const { user, canAccessAll } = useAuth();
  const [empleadoId, setEmpleadoId] = useState('');
  const [motivo, setMotivo] = useState('Dotación');
  const [items, setItems] = useState<{ itemId: string; cantidad: number; talla: string; esCustom?: boolean }[]>([
    { itemId: '', cantidad: 1, talla: '', esCustom: false }
  ]);
  const [saving, setSaving] = useState(false);

  // Selected employee profile
  const selectedEmpleado = (empleados || []).find(e => e.id === empleadoId);

  // Solicitante / Supervisor details
  const [solicitanteNombre, setSolicitanteNombre] = useState(user?.email?.split('@')[0] || '');
  const [solicitanteCedula, setSolicitanteCedula] = useState('');
  const [solicitanteCargo, setSolicitanteCargo] = useState('Supervisor de Área');
  const [apruebaComoSupervisor, setApruebaComoSupervisor] = useState(true);
  const [firmaSolicitanteUrl, setFirmaSolicitanteUrl] = useState('');

  // Fajas lumbares exception parameters (Prescripción médica)
  const [prescripcionMedicaValidada, setPrescripcionMedicaValidada] = useState(false);
  const [registroPrescripcion, setRegistroPrescripcion] = useState('');
  const [duracionTratamientoDias, setDuracionTratamientoDias] = useState<number>(30);
  const [medicoValidador, setMedicoValidador] = useState('');

  // Failure / Re-evaluation report flags (LOPCYMAT Art 62)
  const [fallaReportadaExplicacion, setFallaReportadaExplicacion] = useState('');
  const [noSatisfaceProteccionSST, setNoSatisfaceProteccionSST] = useState(false);

  // Auto-suggest sizes when worker changes
  useEffect(() => {
    if (!selectedEmpleado) return;
    setItems(currentItems =>
      currentItems.map(it => {
        if (!it.itemId) return it;
        const inv = (inventario || []).find(i => i.id === it.itemId);
        const necesita = requiereTalla(inv);
        if (!necesita) {
          return { ...it, talla: 'N/A' };
        }
        if (!it.talla || it.talla.trim() === '' || it.talla === 'N/A') {
          const sugerida = obtenerTallaSugerida(inv, selectedEmpleado);
          return { ...it, talla: sugerida || it.talla };
        }
        return it;
      })
    );
  }, [empleadoId]);

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
    setItems([...(items || []), { itemId: '', cantidad: 1, talla: '', esCustom: false }]);
  };

  const removeItem = (idx: number) => {
    setItems((items || []).filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, newItemId: string) => {
    const inv = (inventario || []).find(i => i.id === newItemId);
    const necesita = requiereTalla(inv);
    const sugerida = necesita ? obtenerTallaSugerida(inv, selectedEmpleado) : 'N/A';
    const newItems = [...items];
    newItems[idx] = {
      ...newItems[idx],
      itemId: newItemId,
      talla: sugerida || (necesita ? '' : 'N/A'),
      esCustom: false
    };
    setItems(newItems);
  };

  const handleTallaChange = (idx: number, val: string) => {
    const newItems = [...items];
    if (val === '__CUSTOM__') {
      newItems[idx].esCustom = true;
      newItems[idx].talla = '';
    } else {
      newItems[idx].esCustom = false;
      newItems[idx].talla = val;
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemsList = items || [];
    if (!empleadoId || itemsList.length === 0) {
      toast.error('Debe seleccionar un empleado y agregar al menos un artículo.');
      return;
    }

    const itemsValid = itemsList.every(i => {
      if (!i.itemId || i.cantidad <= 0) return false;
      const inv = (inventario || []).find(x => x.id === i.itemId);
      const necesita = requiereTalla(inv);
      if (!necesita) return true;
      return (i.talla || '').trim() !== '';
    });

    if (!itemsValid) {
      toast.error('Complete todos los campos requeridos (artículo, talla en implementos que la requieran, y cantidad mayor a cero).');
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

    // Notification of items without immediate stock
    const outOfStockItems = itemsList.filter(it => {
      const inv = (inventario || []).find(i => i.id === it.itemId);
      if (!inv) return false;
      const necesita = requiereTalla(inv);
      if (!necesita) {
        const totalStock = (inv.stock || []).reduce((acc, s) => acc + (s.cantidad || 0), 0);
        return totalStock < it.cantidad;
      }
      const stockItem = (inv.stock || []).find(s => s.talla.toUpperCase() === (it.talla || '').toUpperCase());
      return !stockItem || stockItem.cantidad < it.cantidad;
    });

    if (outOfStockItems.length > 0) {
      const nombresFaltantes = outOfStockItems.map(it => {
        const inv = (inventario || []).find(i => i.id === it.itemId);
        return `• ${inv?.nombre || 'Artículo'} (Talla: ${it.talla || 'Única'})`;
      }).join('\n');

      const confirmar = window.confirm(
        `AVISO DE REABASTECIMIENTO / COMPRAS:\n\nLos siguientes artículos no cuentan con stock suficiente en almacén:\n${nombresFaltantes}\n\n¿Desea registrar la solicitud para activar la requisición de dotación y pedido especial a Compras?`
      );
      if (!confirmar) return;
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
        items: items.map(i => {
          const inv = (inventario || []).find(x => x.id === i.itemId);
          const necesita = requiereTalla(inv);
          return {
            itemId: i.itemId,
            cantidad: i.cantidad,
            talla: necesita ? (i.talla.trim() || 'N/A') : (i.talla.trim() || 'N/A')
          };
        }),
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
                <span className="text-xs text-slate-500 font-medium">Flujo Digital de 4 Actores</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900">
                Nueva Solicitud de Dotación, E.P.P. y Uniformes
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
            <div className="space-y-3">
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

              {/* Ficha de Tallas del Trabajador Seleccionado */}
              {selectedEmpleado && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5 text-xs animate-fadeIn">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-duncan-blue flex items-center gap-1.5 text-xs">
                      <User size={15} /> Tallas en Expediente de {selectedEmpleado.nombre.split(' ')[0]}:
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-blue-200 font-semibold text-slate-700 flex items-center gap-1 shadow-xs">
                      👟 Calzado: <strong className="text-duncan-blue font-bold">{selectedEmpleado.tallaCalzado || 'No reg.'}</strong>
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-blue-200 font-semibold text-slate-700 flex items-center gap-1 shadow-xs">
                      👖 Pantalón: <strong className="text-duncan-blue font-bold">{selectedEmpleado.tallaPantalon || 'No reg.'}</strong>
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-blue-200 font-semibold text-slate-700 flex items-center gap-1 shadow-xs">
                      👕 Camisa/Prenda: <strong className="text-duncan-blue font-bold">{selectedEmpleado.tallaCamisa || 'No reg.'}</strong>
                    </span>
                    <span className="bg-white px-2 py-1 rounded-lg border border-blue-200 text-slate-600 text-[11px] font-medium">
                      ⚧ {selectedEmpleado.genero === 'F' ? 'Corte Damas' : 'Corte Caballeros'}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-blue-700 font-medium flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-500" /> Selección inteligente activa
                  </span>
                </div>
              )}
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

            {/* Step 2: Items List & Size Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Shirt size={15} className="text-duncan-blue" />
                    Implementos y Uniformes a Suministrar
                  </label>
                  <p className="text-[10.5px] text-slate-500">
                    Seleccione el equipo y su talla estandarizada (calzados 35-48, guantes 7-11, pantalones damas/caballeros, etc.)
                  </p>
                </div>
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
                  const necesitaTalla = requiereTalla(selectedInv);
                  const opcionesTallas = obtenerOpcionesTalla(selectedInv, selectedEmpleado);
                  const tipoDetectado = selectedInv ? detectarTipoImplemento(selectedInv.nombre, selectedInv.categoria, selectedEmpleado?.genero) : null;
                  
                  const stockTotal = (selectedInv?.stock || []).reduce((acc, s) => acc + (s.cantidad || 0), 0);
                  const stockSeleccionado = (selectedInv?.stock || []).find(
                    s => s.talla.toUpperCase() === (it.talla || '').toUpperCase()
                  )?.cantidad ?? 0;

                  const isSinStock = selectedInv
                    ? necesitaTalla
                      ? !!it.talla && stockSeleccionado === 0 && !it.esCustom
                      : stockTotal === 0
                    : false;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs shadow-xs"
                    >
                      <div className="flex flex-col md:flex-row gap-2.5 items-start md:items-center">
                        {/* Selector de Implemento */}
                        <div className="flex-1 w-full">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Equipo / Prenda ({idx + 1})
                          </label>
                          <select
                            value={it.itemId}
                            onChange={e => handleItemChange(idx, e.target.value)}
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

                        {/* Selector de Talla o Indicador de Talla Única */}
                        <div className="w-full md:w-56">
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[10px] font-bold text-slate-500">
                              Talla / Medida
                            </label>
                            {selectedInv ? (
                              necesitaTalla ? (
                                <span className="text-[9.5px] font-bold text-red-500">* Requerida</span>
                              ) : (
                                <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  No Aplica / Única
                                </span>
                              )
                            ) : null}
                          </div>

                          {!selectedInv ? (
                            <select
                              disabled
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-100 text-slate-400 outline-none"
                            >
                              <option value="">Primero elija un implemento...</option>
                            </select>
                          ) : !necesitaTalla ? (
                            <div className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 flex items-center justify-between shadow-2xs">
                              <span className="text-[11px] font-medium text-slate-600">Talla Única / Estándar</span>
                              <span className="text-[10px] bg-white border border-slate-300 text-slate-700 font-bold px-1.5 py-0.5 rounded shadow-2xs">
                                N/A
                              </span>
                            </div>
                          ) : !it.esCustom ? (
                            <select
                              value={it.talla}
                              onChange={e => handleTallaChange(idx, e.target.value)}
                              className={cn(
                                "w-full border rounded-lg p-2 text-xs font-semibold outline-none bg-white",
                                !it.talla ? "border-amber-300 text-amber-800" : "border-slate-300 text-slate-900 focus:border-duncan-blue"
                              )}
                              required
                            >
                              <option value="">
                                {`Seleccione Talla (${opcionesTallas.length} opciones)...`}
                              </option>
                              {opcionesTallas.map(opt => (
                                <option key={opt.talla} value={opt.talla}>
                                  {opt.label}
                                </option>
                              ))}
                              <option value="N/A">🔘 No Aplica / Estándar (N/A)</option>
                              <option value="__CUSTOM__">✏️ Otra Medida / Personalizada...</option>
                            </select>
                          ) : (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={it.talla}
                                onChange={e => {
                                  const n = [...items];
                                  n[idx].talla = e.target.value.toUpperCase();
                                  setItems(n);
                                }}
                                className="w-full border border-duncan-blue rounded-lg p-2 text-xs bg-white font-bold uppercase outline-none"
                                placeholder="Escriba talla..."
                                required
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const n = [...items];
                                  n[idx].esCustom = false;
                                  n[idx].talla = '';
                                  setItems(n);
                                }}
                                title="Volver a lista desplegable"
                                className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-2 rounded-lg font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Cantidad */}
                        <div className="w-full md:w-24">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Cantidad
                          </label>
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
                              isSinStock
                                ? 'border-amber-400 bg-amber-50 text-amber-900'
                                : 'border-slate-300 bg-white focus:border-duncan-blue'
                            )}
                            placeholder="Cant."
                            required
                          />
                        </div>

                        {/* Eliminar fila */}
                        {items.length > 1 && (
                          <div className="md:pt-4">
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="text-red-400 hover:text-red-600 p-2 rounded-lg transition-colors"
                              title="Quitar artículo"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Info badge & Quick Size buttons */}
                      {selectedInv && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                          <div className="flex items-center gap-2 text-slate-500">
                            <span className="font-medium">
                              Tipo: <strong className="text-slate-700">{tipoDetectado || 'Implemento General'}</strong>
                            </span>
                            {!necesitaTalla && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                                Talla Universal / Ajustable
                              </span>
                            )}
                            {selectedInv.documentoEficacia && (
                              <span className="text-[10px] bg-slate-200/70 px-1.5 py-0.5 rounded text-slate-600">
                                {selectedInv.documentoEficacia}
                              </span>
                            )}
                          </div>

                          {/* Quick Worker Size Assign Chip */}
                          {necesitaTalla && selectedEmpleado && (
                            <div className="flex items-center gap-1.5">
                              {tipoDetectado === 'CALZADO' && selectedEmpleado.tallaCalzado && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const n = [...items];
                                    n[idx].talla = selectedEmpleado.tallaCalzado || '';
                                    n[idx].esCustom = false;
                                    setItems(n);
                                  }}
                                  className={cn(
                                    "px-2 py-0.5 rounded text-[10.5px] font-bold transition-all border",
                                    it.talla === selectedEmpleado.tallaCalzado
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs"
                                      : "bg-blue-50 hover:bg-blue-100 text-duncan-blue border-blue-200"
                                  )}
                                >
                                  👟 Talla Trabajador: {selectedEmpleado.tallaCalzado} {it.talla === selectedEmpleado.tallaCalzado ? '✓' : '(Asignar)'}
                                </button>
                              )}

                              {(tipoDetectado === 'PANTALON_DAMAS' || tipoDetectado === 'PANTALON_CABALLEROS' || tipoDetectado === 'BRAGAS') && selectedEmpleado.tallaPantalon && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const n = [...items];
                                    n[idx].talla = selectedEmpleado.tallaPantalon || '';
                                    n[idx].esCustom = false;
                                    setItems(n);
                                  }}
                                  className={cn(
                                    "px-2 py-0.5 rounded text-[10.5px] font-bold transition-all border",
                                    it.talla === selectedEmpleado.tallaPantalon
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs"
                                      : "bg-blue-50 hover:bg-blue-100 text-duncan-blue border-blue-200"
                                  )}
                                >
                                  👖 Talla Trabajador: {selectedEmpleado.tallaPantalon} {it.talla === selectedEmpleado.tallaPantalon ? '✓' : '(Asignar)'}
                                </button>
                              )}

                              {(tipoDetectado === 'CAMISAS' || tipoDetectado === 'FRANELAS' || tipoDetectado === 'CHEMISES' || tipoDetectado === 'CHALECOS' || tipoDetectado === 'CHAQUETAS') && selectedEmpleado.tallaCamisa && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const n = [...items];
                                    n[idx].talla = selectedEmpleado.tallaCamisa || '';
                                    n[idx].esCustom = false;
                                    setItems(n);
                                  }}
                                  className={cn(
                                    "px-2 py-0.5 rounded text-[10.5px] font-bold transition-all border",
                                    it.talla === selectedEmpleado.tallaCamisa
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs"
                                      : "bg-blue-50 hover:bg-blue-100 text-duncan-blue border-blue-200"
                                  )}
                                >
                                  👕 Talla Trabajador: {selectedEmpleado.tallaCamisa} {it.talla === selectedEmpleado.tallaCamisa ? '✓' : '(Asignar)'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Warning if requested size has no stock in warehouse */}
                      {isSinStock && (
                        <p className="text-[10.5px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200/80 flex items-center gap-1 font-medium">
                          <Info size={13} className="shrink-0 text-amber-600" />
                          <span>Esta talla no tiene unidades disponibles en almacén. Se registrará la solicitud para generar la orden de pedido y reposición a Compras.</span>
                        </p>
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
                  <div className="flex items-center gap-2">
                    {canAccessAll && (
                      <button
                        type="button"
                        onClick={() => {
                          const firmaTest = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 10 40 Q 60 10 110 35 T 190 20" fill="none" stroke="%230f172a" stroke-width="2.5"/></svg>';
                          setFirmaSolicitanteUrl(firmaTest);
                          if (!solicitanteCedula) setSolicitanteCedula('V-12033632');
                          toast.success('Rúbrica de prueba cargada (Modo Desarrollador / Propietario)');
                        }}
                        className="text-[10px] text-yellow-800 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 font-bold px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                      >
                        <Crown size={12} className="text-yellow-600" />
                        Rúbrica Rápida Dev
                      </button>
                    )}
                    {firmaSolicitanteUrl && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle size={12} /> Rúbrica Capturada
                      </span>
                    )}
                  </div>
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
