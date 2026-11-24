import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Mail,
  MessageCircle,
  Printer,
  X,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
  User,
  ArrowLeft,
  Download,
  Share2,
  Sparkles,
  Check
} from 'lucide-react';
import type { Inspeccion, PlanAccion } from '../types';
import { generatePlanesAccionFromInspeccion } from '../lib/planAccionGenerator';
import { 
  exportActionPlanToExcel, 
  exportActionPlanToPDF,
  downloadActionPlanCSV, 
  generateActionPlanEmailData,
  ActionPlanExportMeta 
} from '../lib/actionPlanExport';
import { formatDate, getReportHeaderTitle } from '../lib/utils';
import toast from 'react-hot-toast';

interface Props {
  inspeccion: Inspeccion;
  metadata?: any;
  onClose?: () => void;
  embedded?: boolean;
}

export default function ActionPlanDocument({ inspeccion, metadata, onClose, embedded = false }: Props) {
  // Generar items iniciales desde la inspección
  const initialItems = useMemo(() => {
    return generatePlanesAccionFromInspeccion(inspeccion);
  }, [inspeccion]);

  const [items, setItems] = useState<PlanAccion[]>(initialItems);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Manejo de edición inline rápida de fechas o recursos
  const handleItemChange = (index: number, field: keyof PlanAccion, value: string) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const empNombre = metadata?.empresa?.nombre || inspeccion.empresaNombre || 'DISTRIBUIDORA DUNCAN C.A.';
  const locNombre = metadata?.localidad?.nombre || inspeccion.localidadNombre || 'VALENCIA';
  const estNombre = metadata?.establecimiento?.nombre || inspeccion.establecimientoNombre || 'DISTRIBUIDORA DUNCAN VALENCIA';
  const tipoNom = metadata?.tipo?.nombre || inspeccion.tipoNombre || 'Distribuidoras';
  const tipoCod = metadata?.tipo?.codigo || inspeccion.tipoCodigo || 'DD';
  const correlStr = String(inspeccion.correlativo || (inspeccion.referencia ? inspeccion.referencia.replace(/^REF-|^INSP-/, '') : '14'));
  const headerTipo = getReportHeaderTitle(tipoNom, tipoCod);
  const puntuacionVal = typeof inspeccion.puntuacion === 'number' ? inspeccion.puntuacion : 92.3;
  const nivelConf = puntuacionVal >= 85 ? 'ALTO' : puntuacionVal >= 70 ? 'MEDIO' : 'BAJO';
  const fechaInsp = inspeccion.fecha ? String(inspeccion.fecha).split('T')[0] : '2026-04-22';
  const dClose = new Date(fechaInsp);
  const fechaCierre = isNaN(dClose.getTime()) 
    ? '2026-04-24' 
    : new Date(dClose.getTime() + 15 * 86400000).toISOString().split('T')[0];

  const inspector = inspeccion.inspector || 'Alberto Becerra';
  const revisor = (inspeccion.firmas?.revisor as any)?.nombre || 'Jesús Contreras';

  const getMesAno = (dateStr?: string) => {
    if (!dateStr) return 'ABRIL - 2026';
    try {
      const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
      const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
      return `${meses[d.getMonth()]} - ${d.getFullYear()}`;
    } catch {
      return 'ABRIL - 2026';
    }
  };
  const mesAno = getMesAno(inspeccion.fecha);

  const exportMeta: ActionPlanExportMeta = {
    empresaNombre: empNombre,
    localidadNombre: locNombre,
    establecimientoNombre: estNombre,
    tipoNombre: tipoNom,
    tipoCodigo: tipoCod,
    revisorNombre: revisor,
    rondaNo: 1
  };

  // 1. Enviar por correo electrónico
  const handleSendEmail = async () => {
    try {
      toast.success("Generando archivos Excel y PDF para adjuntar...");
      await exportActionPlanToExcel(inspeccion, items, exportMeta);
      exportActionPlanToPDF(inspeccion, items, exportMeta);
      const emailData = generateActionPlanEmailData(inspeccion, items, exportMeta);
      window.location.href = emailData.mailtoUrl;
    } catch (e) {
      console.error(e);
      toast.error("Error al preparar el correo");
    }
  };

  // 2. Compartir por WhatsApp
  const handleShareWhatsApp = async () => {
    try {
      await exportActionPlanToExcel(inspeccion, items, exportMeta);
      exportActionPlanToPDF(inspeccion, items, exportMeta);
      const waText = `*PLAN DE ACCIÓN OFICIAL SG-SSA DUNCAN*\n\n` +
        `*Establecimiento:* ${estNombre}\n` +
        `*Inspección N°:* ${correlStr} · ${formatDate(inspeccion.fecha)}\n` +
        `*Cumplimiento:* ${puntuacionVal}% (${nivelConf})\n` +
        `*Total Desviaciones:* ${items.length} puntos requeridos\n\n` +
        `Se han descargado la matriz oficial en Excel (.xlsx) y el PDF editable para su seguimiento.`;
      
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
      window.open(url, '_blank');
      toast.success("Abriendo WhatsApp...");
    } catch (e) {
      console.error(e);
      toast.error("Error al compartir por WhatsApp");
    }
  };

  // 3. Exportar PDF Editable e Interactivo
  const handleExportPDF = () => {
    try {
      setExportingPDF(true);
      exportActionPlanToPDF(inspeccion, items, exportMeta);
      toast.success("¡Plan de Acción exportado a PDF editable e interactivo!");
    } catch (e) {
      console.error(e);
      toast.error("Error al exportar a PDF");
    } finally {
      setExportingPDF(false);
    }
  };

  // 4. Exportar Excel Oficial (.xlsx) con Visual Idéntica al PDF
  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      await exportActionPlanToExcel(inspeccion, items, exportMeta);
      toast.success("¡Plan de Acción exportado a Excel (.xlsx) con maquetación oficial!");
    } catch (e) {
      console.error(e);
      toast.error("Error al exportar a Excel");
    } finally {
      setExportingExcel(false);
    }
  };

  // 5. Exportar CSV
  const handleExportCSV = () => {
    try {
      downloadActionPlanCSV(inspeccion, items, exportMeta);
      toast.success("Plan de Acción exportado a CSV (.csv)");
    } catch (e) {
      console.error(e);
      toast.error("Error al exportar a CSV");
    }
  };

  // 6. Imprimir
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`bg-white text-slate-800 ${embedded ? '' : 'max-w-5xl mx-auto my-4 p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-200 animate-in fade-in'}`}>
      {/* BARRA DE ACCIÓN SUPERIOR (Oculta al imprimir) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200 print:hidden">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Plan de Acción Derivado de Inspección</span>
            </h2>
            <p className="text-xs text-slate-500">
              {estNombre} · {items.length} {items.length === 1 ? 'desviación detectada' : 'desviaciones detectadas'} (NC / OM)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botón PDF Editable */}
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all touch-active"
            title="Descargar en formato PDF editable e interactivo (AcroForm)"
          >
            <FileText className="h-4 w-4" />
            <span>PDF Editable</span>
          </button>

          {/* Botón Excel Oficial */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all touch-active"
            title="Descargar en formato Excel (.xlsx) con maquetación y colores idénticos al reporte oficial"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel (.xlsx)</span>
          </button>

          {/* Botón Enviar por Correo */}
          <button
            type="button"
            onClick={handleSendEmail}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all touch-active"
            title="Enviar Plan de Acción por Correo Electrónico"
          >
            <Mail className="h-4 w-4" />
            <span>Enviar Correo</span>
          </button>

          {/* Botón WhatsApp */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs shadow-2xs transition-all touch-active"
            title="Compartir por WhatsApp"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Botón CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs shadow-2xs transition-all"
            title="Descargar datos crudos en formato CSV (.csv)"
          >
            <Download className="h-4 w-4 text-slate-600" />
            <span>CSV</span>
          </button>

          {/* Botón Imprimir */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
            title="Imprimir documento en impresora"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              title="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* BANNER INFORMATIVO DE FIDELIDAD VISUAL Y CAMPOS EDITABLES */}
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50/80 via-slate-50 to-amber-50/80 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 print:hidden shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-yellow-400 text-slate-950 font-black rounded-lg shadow-2xs shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs">
              Visualización y Configuración Oficial Duncan (PDF Editable & Excel Idéntico)
            </p>
            <p className="text-[11px] text-slate-500">
              El archivo <strong>PDF</strong> incorpora campos interactivos editables en Adobe Acrobat y navegadores; el archivo <strong>Excel (.xlsx)</strong> mantiene los colores, bordes y estructura corporativa oficial.
            </p>
          </div>
        </div>
      </div>

      {/* DOCUMENTO INSTITUCIONAL FORMAL (ESTRUCTURA OFICIAL DUNCAN) */}
      <div className="border border-slate-300 p-4 sm:p-6 bg-white rounded-lg text-[9px] sm:text-[10px] leading-relaxed shadow-sm font-sans">
        
        {/* 1. CABECERA INSTITUCIONAL */}
        <div className="border-b-2 border-slate-400 pb-3 mb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/duncan-logo-bw.png"
                alt="Duncan"
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  (e.target as any).style.display = 'none';
                }}
              />
              <div>
                <h1 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-tight">
                  Programa de Seguridad y Salud en el Trabajo
                </h1>
                <p className="font-semibold text-slate-700 text-[11px]">
                  {tipoNom.toUpperCase().includes('SERVI') ? 'Inspección de Servicentros' : 'Inspección de Distribuidoras'}
                </p>
              </div>
            </div>

            <table className="border border-slate-300 text-[8.5px] border-collapse shrink-0">
              <tbody>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <td className="px-2 py-1 font-bold text-slate-600 border-r border-slate-300">Código</td>
                  <td className="px-2 py-1 font-bold text-slate-600 border-r border-slate-300">Departamento emisor</td>
                  <td className="px-2 py-1 font-bold text-slate-600">N° Revisión:</td>
                </tr>
                <tr>
                  <td className="px-2 py-1 font-mono font-bold text-slate-800 border-r border-slate-300">PLAN-ACC-{tipoCod}</td>
                  <td className="px-2 py-1 text-slate-700 border-r border-slate-300">Departamento de Seguridad y Salud Laboral (SSA)</td>
                  <td className="px-2 py-1 text-center font-bold text-slate-800">0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. TÍTULOS PRINCIPALES DEL PLAN DE ACCIÓN */}
        <div className="text-center my-3 py-2 bg-slate-50 border-y border-slate-300">
          <h2 className="font-black text-slate-900 text-xs sm:text-sm tracking-wide uppercase">
            PLAN ACCION {estNombre} {mesAno}
          </h2>
          <h3 className="font-bold text-blue-800 text-[10px] sm:text-xs mt-0.5 uppercase">
            PLAN DE ACCIÓN DERIVADO DE {headerTipo}
          </h3>
        </div>

        {/* 3. FICHA TÉCNICA DE CONTROL (TABLA DE METADATOS) */}
        <div className="overflow-x-auto mb-3">
          <table className="w-full border-collapse border border-slate-300 text-[8px] sm:text-[9px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-center">
                <th className="p-1.5 border-r border-slate-300 w-8">Id</th>
                <th className="p-1.5 border-r border-slate-300 text-left">EMPRESA - LOCALIDAD - ESTABLECIMIENTO - FECHA</th>
                <th className="p-1.5 border-r border-slate-300 w-16">Ronda N°</th>
                <th className="p-1.5 border-r border-slate-300 w-24">Fecha de Inspección</th>
                <th className="p-1.5 border-r border-slate-300 w-24">Fecha de Cierre</th>
                <th className="p-1.5 border-r border-slate-300 w-24">Porcentaje Obtenido</th>
                <th className="p-1.5 w-24">Nivel de Conformidad</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center border-b border-slate-200 bg-white">
                <td className="p-1.5 font-bold font-mono border-r border-slate-300">{correlStr}</td>
                <td className="p-1.5 text-left font-bold text-slate-800 border-r border-slate-300">
                  {empNombre} - {locNombre} - {estNombre} - {mesAno}
                </td>
                <td className="p-1.5 border-r border-slate-300 font-semibold">1</td>
                <td className="p-1.5 border-r border-slate-300 font-mono">{fechaInsp}</td>
                <td className="p-1.5 border-r border-slate-300 font-mono text-slate-600">{fechaCierre}</td>
                <td className="p-1.5 border-r border-slate-300 font-bold text-blue-700">{puntuacionVal}%</td>
                <td className="p-1.5 font-black text-emerald-700">
                  <span className={`px-2 py-0.5 rounded font-black ${
                    nivelConf === 'ALTO' ? 'bg-emerald-100 text-emerald-800' :
                    nivelConf === 'MEDIO' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {nivelConf}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4. LEYENDA TÉCNICA */}
        <div className="bg-slate-100 border border-slate-300 px-3 py-1.5 mb-3 text-[7.5px] sm:text-[8.5px] text-slate-600 rounded">
          <strong className="text-slate-800">LEYENDA: </strong>
          <span>C: Conforme; OM: Oportunidad de Mejora; NC: No Conforme; NA: No aplica; SSA: Seguridad, Salud, Ambiente; INFRA: Infraestructura; VEHCP: Vehículos y Equipos Móviles; LEGAL: Legal / Normativo.</span>
        </div>

        {/* 5. TABLA OFICIAL DE PUNTOS EVALUADOS CON NO CONFORMIDADES Y MEJORAS */}
        <div className="overflow-x-auto mb-4 border border-slate-300 rounded overflow-hidden">
          <table className="w-full border-collapse text-[8px] sm:text-[8.5px]">
            <thead>
              <tr className="bg-slate-800 text-white font-bold text-center border-b border-slate-900">
                <th className="p-2 border-r border-slate-700 w-28 text-left">Aspectos evaluados</th>
                <th className="p-2 border-r border-slate-700 text-left">Preguntas</th>
                <th className="p-2 border-r border-slate-700 text-left w-36">Aspecto legal -técnico</th>
                <th className="p-2 border-r border-slate-700 w-16">Grupos o familias</th>
                <th className="p-2 border-r border-slate-700 w-28 text-left">Áreas responsables</th>
                <th className="p-2 border-r border-slate-700 w-16">Conformidad</th>
                <th className="p-2 border-r border-slate-700 w-16">Prioridad</th>
                <th className="p-2 border-r border-slate-700 w-24">Fecha de ejecución</th>
                <th className="p-2 border-r border-slate-700 w-24">Fecha de verificación</th>
                <th className="p-2 border-r border-slate-700 w-28">Recursos necesarios</th>
                <th className="p-2 w-32">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-slate-500 italic bg-slate-50">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
                    <span>Esta inspección no presenta puntos No Conformes (NC) ni Oportunidades de Mejora (OM). ¡100% Conforme!</span>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const isNC = item.conformidad === 'NC' || item.prioridad === 'Critica' || (item.hallazgo || '').includes('NO CONFORME');
                  return (
                    <tr key={idx} className={isNC ? "bg-red-50/20 hover:bg-red-50/40" : "bg-white hover:bg-amber-50/20"}>
                      <td className="p-1.5 font-bold text-slate-800 border-r border-slate-200 align-top">
                        {item.aspectoEvaluado || item.seccion || 'Seguridad Industrial'}
                      </td>
                      <td className="p-1.5 text-slate-800 border-r border-slate-200 align-top">
                        <span className="font-mono font-bold text-slate-900 block">{item.item}</span>
                        <span>{item.preguntaTexto?.replace(/^\d+\.\d+\s*/, '') || item.hallazgo}</span>
                      </td>
                      <td className="p-1.5 text-slate-600 border-r border-slate-200 align-top text-[7.5px] italic">
                        {item.aspectoLegal || item.notas || 'COVENIN / LOPCYMAT'}
                      </td>
                      <td className="p-1.5 text-center font-bold border-r border-slate-200 align-top">
                        <span className="px-1.5 py-0.5 rounded text-[7.5px] bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                          {item.grupoPilar || (isNC ? 'SSA' : 'INFRA')}
                        </span>
                      </td>
                      <td className="p-1.5 font-semibold text-slate-700 border-r border-slate-200 align-top uppercase text-[7.5px]">
                        {item.areaResponsable || item.departamento || 'VENTAS - OPERACIONES'}
                      </td>
                      <td className="p-1.5 text-center font-black border-r border-slate-200 align-top">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black ${
                          isNC ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {isNC ? 'NC' : 'OM'}
                        </span>
                      </td>
                      <td className="p-1.5 text-center font-bold border-r border-slate-200 align-top text-[7.5px]">
                        {item.prioridad || (isNC ? 'Alta' : 'Media')}
                      </td>
                      <td className="p-1 border-r border-slate-200 align-top">
                        <input
                          type="date"
                          value={item.fechaEjecucion || item.fechaLimite || ''}
                          onChange={(e) => handleItemChange(idx, 'fechaEjecucion', e.target.value)}
                          className="w-full text-[8px] border border-slate-200 rounded px-1 py-0.5 print:border-none print:p-0"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-200 align-top">
                        <input
                          type="date"
                          value={item.fechaVerificacion || ''}
                          onChange={(e) => handleItemChange(idx, 'fechaVerificacion', e.target.value)}
                          className="w-full text-[8px] border border-slate-200 rounded px-1 py-0.5 print:border-none print:p-0"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-200 align-top">
                        <input
                          type="text"
                          value={item.recursosNecesarios || ''}
                          placeholder="Materiales / compras..."
                          onChange={(e) => handleItemChange(idx, 'recursosNecesarios', e.target.value)}
                          className="w-full text-[8px] border border-slate-200 rounded px-1 py-0.5 print:border-none print:p-0"
                        />
                      </td>
                      <td className="p-1 align-top">
                        <textarea
                          rows={2}
                          value={item.observaciones || item.recomendacion || ''}
                          placeholder="Acción correctiva..."
                          onChange={(e) => handleItemChange(idx, 'observaciones', e.target.value)}
                          className="w-full text-[8px] border border-slate-200 rounded px-1 py-0.5 resize-none print:border-none print:p-0"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 6. PROTOCOLO DE FIRMAS DE CIERRE */}
        <div className="pt-4 border-t border-slate-300 mt-4">
          <p className="font-bold text-slate-800 text-[9px] mb-3 uppercase">
            Personal que realizó la Inspección
          </p>
          <div className="grid grid-cols-2 gap-8 text-center pt-6">
            <div className="border-t border-slate-400 pt-1.5">
              <p className="font-bold text-slate-900 text-[9px]">{inspector}</p>
              <p className="text-[7.5px] text-slate-500 uppercase">Realizada por (Inspector SSA)</p>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <p className="font-bold text-slate-900 text-[9px]">{revisor}</p>
              <p className="text-[7.5px] text-slate-500 uppercase">Revisado por (Supervisor / Coordinación SSA)</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
