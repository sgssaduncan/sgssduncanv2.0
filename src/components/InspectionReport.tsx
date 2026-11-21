import React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Printer,
  ChevronLeft,
  Building,
  Calendar,
  User,
  MapPin,
  ClipboardList,
  Warehouse,
  Download,
  ShieldCheck,
  Camera,
  Quote,
  MessageCircle,
  Mail,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
// @ts-ignore
import html2pdf from "html2pdf.js";
import toast from "react-hot-toast";
import { cn, formatDate, formatDateTime } from "../lib/utils";
import { exportSingleInspectionToExcel, exportSingleInspectionToCSV } from "../lib/exportUtils";
import type {
  Inspeccion,
  TipoInspeccion,
  Empresa,
  Localidad,
  Establecimiento,
} from "../types";
import { dbService } from "../services/db";
import { useAuth } from '../hooks/useAuth';
import { getFormDefinition } from "../lib/formDefinitions";
import { generarInspeccionPDF } from "../lib/pdfGenerator";

import { QRCodeSVG } from "qrcode.react";

interface ReportProps {
  inspection: Inspeccion;
  onBack: () => void;
  onEdit?: () => void;
}

// Template especifico para montacargas (según layout solicitado)
const getCompanyLogo = (metadata: any) => {
  if (metadata?.empresa?.logoUrl) return metadata.empresa.logoUrl;
  const nombre = metadata?.empresa?.nombre?.toLowerCase() || '';
  if (nombre.includes('titán') || nombre.includes('titan')) {
    return '/logo-titan.png';
  } else if (nombre.includes('ergoexpress')) {
    return '/logo-ergoexpress.png';
  }
  return '/duncan-logo-color.png';
};

export default function InspectionReport({
  inspection,
  onBack,
  onEdit,
}: ReportProps) {
  const { user } = useAuth();
  const [metadata, setMetadata] = React.useState<{
    empresa?: Empresa;
    localidad?: Localidad;
    establecimiento?: Establecimiento;
    tipo?: TipoInspeccion;
  }>({});
  const [exporting, setExporting] = React.useState(false);
  const [showPrintPreview, setShowPrintPreview] = React.useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);

  const tipoCod = (metadata.tipo?.codigo || inspection.tipoCodigo || '').toUpperCase();
  const tipoNom = (metadata.tipo?.nombre || inspection.tipoNombre || '').toLowerCase();
  const isExtintores = tipoCod === 'EXT' || tipoCod === 'IEP' || (tipoNom.includes('extintor') && !tipoNom.includes('fuente') && !tipoNom.includes('ducha'));

  React.useEffect(() => {
    const load = async () => {
      const [empresas, tipos] = await Promise.all([
        dbService.getEmpresas(),
        dbService.getTiposInspeccion(),
      ]);
      const empresa = empresas.find((e) => e.id === inspection.empresaId || (e as any)._id === inspection.empresaId) || {
        _id: inspection.empresaId || 'emp_ddca',
        id: inspection.empresaId || 'emp_ddca',
        codigo: 'DDCA',
        nombre: (inspection as any).empresaNombre || 'Distribuidora Duncan, C.A.',
        rif: 'J-00100047-0',
      };

      const locs = await dbService.getLocalidades(inspection.empresaId);
      const localidad = locs.find((l) => l.id === inspection.localidadId || (l as any)._id === inspection.localidadId) || {
        _id: inspection.localidadId || 'loc_caracas',
        id: inspection.localidadId || 'loc_caracas',
        empresaId: inspection.empresaId || 'emp_ddca',
        nombre: (inspection as any).localidadNombre || 'Caracas',
      };

      const ests = await dbService.getEstablecimientos(inspection.localidadId);
      const establecimiento = ests.find(
        (e) => e.id === inspection.establecimientoId || (e as any)._id === inspection.establecimientoId,
      ) || {
        _id: inspection.establecimientoId || 'est_dist_ccs',
        id: inspection.establecimientoId || 'est_dist_ccs',
        localidadId: inspection.localidadId || 'loc_caracas',
        nombre: (inspection as any).establecimientoNombre || 'Distribuidora Duncan Caracas',
        iniciales: 'DDC',
      };

      // Resolver definición canónica del formulario oficial
      const formDef = getFormDefinition(inspection.tipoCodigo) ||
                     getFormDefinition(inspection.tipoInspeccionId) ||
                     getFormDefinition(inspection.tipoNombre);

      const foundTipo = tipos.find((t) => t.id === inspection.tipoInspeccionId || (t as any)._id === inspection.tipoInspeccionId || (t as any).codigo === inspection.tipoCodigo);

      // Si formDef existe, convertir sus sections a secciones para compatibilidad universal
      const seccionesNormalizadas = formDef?.sections ? formDef.sections.map(s => ({
        id: s.id,
        titulo: s.title,
        items: s.items.map(it => ({
          id: it.id,
          pregunta: it.label,
          tipoRespuesta: it.responseType,
          referenciaLegal: ''
        }))
      })) : (foundTipo?.secciones || []);

      const tipo: TipoInspeccion = {
        _id: inspection.tipoInspeccionId || (foundTipo as any)?._id || foundTipo?.id || 'ti_gen',
        id: inspection.tipoInspeccionId || (foundTipo as any)?._id || foundTipo?.id || 'ti_gen',
        codigo: formDef?.code || foundTipo?.codigo || inspection.tipoCodigo || 'GEN',
        nombre: formDef?.name || foundTipo?.nombre || inspection.tipoNombre || 'Inspección General',
        descripcion: formDef?.description || foundTipo?.descripcion || '',
        frecuencia: foundTipo?.frecuencia || 'Mensual',
        categoria: foundTipo?.categoria || 'Seguridad y Salud Laboral',
        icono: foundTipo?.icono || '📋',
        secciones: seccionesNormalizadas
      };

      setMetadata({ empresa, localidad, establecimiento, tipo });
    };
    load();
  }, [inspection]);

  React.useEffect(() => {
    if (showPrintPreview && reportRef.current) {
      const populate = () => {
        const target = document.getElementById("print-preview-modal-content");
        if (target) {
          target.innerHTML = reportRef.current.innerHTML;
        } else {
          requestAnimationFrame(populate);
        }
      };
      populate();
    }
  }, [showPrintPreview, exporting]);

  const handleShare = async (method: "whatsapp" | "email" | "download") => {
    if (exporting) return;
    setExporting(true);
    const toastId = toast.loading("Generando documento oficial en formato corporativo SAP...");

    try {
      const { doc, fileName, dataUri } = generarInspeccionPDF(inspection, metadata);

      // Guardar en base de datos historial si hay sesión
      if (dataUri && user) {
        try {
          await dbService.saveReportePDF({
            tipo: 'Inspeccion',
            nombre: fileName,
            referencia: inspection.id || (inspection as any)._id,
            pdfData: dataUri,
            userId: user.uid,
            fecha: new Date().toISOString()
          });
        } catch (histErr) {
          console.warn('No se pudo guardar en historial:', histErr);
        }
      }

      const refCode = inspection.referencia || `INSP-${inspection.correlativo || '1001'}`;

      if (method === "download") {
        doc.save(fileName);
        toast.dismiss(toastId);
        toast.success("Reporte corporativo descargado exitosamente");
        return;
      }

      // Descargar archivo automáticamente para WhatsApp o Email
      doc.save(fileName);
      const message = `Estimados,\n\nSe ha generado el Reporte de Inspección Técnico Oficial: ${refCode} - ${metadata.tipo?.nombre || inspection.tipoNombre}.\n\n📄 Archivo: ${fileName}\n\n(Nota: El documento PDF corporativo se ha descargado a su dispositivo, por favor adjúntelo a esta conversación).\n\nAtentamente,\nControl Técnico SSA Duncan.`;

      toast.dismiss(toastId);
      if (method === "whatsapp") {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
        toast.success("Documento generado. Abriendo WhatsApp...");
      } else if (method === "email") {
        window.location.href = `mailto:?subject=${encodeURIComponent(`Reporte de Inspección ${refCode}`)}&body=${encodeURIComponent(message)}`;
        toast.success("Documento generado. Abriendo cliente de correo...");
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Error generating official inspection PDF:", error);
      toast.error("Ocurrió un error al generar el PDF oficial");
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = () => {
    try {
      exportSingleInspectionToExcel(inspection, metadata);
      toast.success("Inspección exportada a Excel (.xlsx)");
    } catch (err) {
      console.error(err);
      toast.error("Error al exportar a Excel");
    }
  };

  const handleExportCSV = () => {
    try {
      exportSingleInspectionToCSV(inspection, metadata);
      toast.success("Inspección exportada a CSV (.csv)");
    } catch (err) {
      console.error(err);
      toast.error("Error al exportar a CSV");
    }
  };

  const getResponseStyle = (val: string) => {
    const positive = ["C", "SI", "BUENO", "OPERATIVO", "OK", "CONFORME"];
    const negative = [
      "NC",
      "NO",
      "DANADO",
      "MALO",
      "DETERIORADO",
      "NO OPERATIVO",
      "CRITICO",
    ];
    const opportunity = ["OM"];

    const base = {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "8px",
      fontWeight: "900",
      textTransform: "uppercase" as const,
      letterSpacing: "0.02em",
      color: "#374151",
    };

    const Dot = ({ color }: { color: string }) => (
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
    );

    if (positive.includes(val?.toUpperCase())) {
      return (
        <span style={base}>
          <Dot color="#10B981" />
          <span style={{ color: "#059669" }}>{val}</span>
        </span>
      );
    }
    if (negative.includes(val?.toUpperCase())) {
      return (
        <span style={base}>
          <Dot color="#EF4444" />
          <span style={{ color: "#DC2626" }}>{val}</span>
        </span>
      );
    }
    if (opportunity.includes(val?.toUpperCase())) {
      return (
        <span style={base}>
          <Dot color="#F59E0B" />
          <span style={{ color: "#D97706" }}>{val}</span>
        </span>
      );
    }
    return (
      <span style={base}>
        <Dot color="#94A3B8" />
        <span>{val}</span>
      </span>
    );
  };

  return (
    <div className="report-container max-w-4xl mx-auto pb-10">
      {/* Action Bar (hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
        <button
          onClick={onBack}
          disabled={exporting}
          className="flex items-center gap-2 font-bold transition-all bg-white px-4 py-2 rounded border shadow-sm disabled:opacity-50 text-sm text-slate-600 hover:bg-slate-50"
        >
          <ChevronLeft size={16} /> Volver
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded font-bold text-xs shadow-sm transition-all disabled:opacity-50 hover:bg-slate-50"
            >
              Editar Inspección
            </button>
          )}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded p-1 shadow-sm ml-2">
            <button
              onClick={() => handleShare("whatsapp")}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-1.5 text-[#25D366] hover:bg-[#25D366]/10 rounded font-bold text-xs transition-all disabled:opacity-50"
              title="Compartir por WhatsApp"
            >
              <MessageCircle size={16} /> WhatsApp
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button
              onClick={() => handleShare("email")}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded font-bold text-xs transition-all disabled:opacity-50"
              title="Compartir por Email"
            >
              <Mail size={16} /> Email
            </button>
          </div>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-2 ml-1 text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            title="Exportar Inspección a Excel (.xlsx)"
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-2 ml-1 text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            title="Exportar Inspección a CSV (.csv)"
          >
            <FileText size={15} /> CSV
          </button>
          <button
            onClick={() => setShowPrintPreview(true)}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2 ml-1 text-white rounded font-bold text-xs shadow-md transition-all disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700"
            title="Vista Previa de Impresión"
          >
            <Printer size={16} /> Imprimir / Vista Previa
          </button>
          <button
            onClick={() => handleShare("download")}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-2 ml-2 text-white rounded font-bold text-xs shadow-md transition-all disabled:opacity-50 bg-[#004B93] hover:bg-[#003870]"
          >
            {exporting ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </div>
            ) : (
              <>
                <Download size={16} /> Descargar PDF
              </>
            )}
          </button>
        </div>
      </div>

      
        
        {/* Documento de Reporte */}
        <div
          ref={reportRef}
          className={`bg-white text-black relative w-full pb-[10mm] pdf-snap-container ${isExtintores ? "is-extintores" : ""}`}
          style={{
            fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
            fontSize: "9px"
          }}
        >
          <style>{`
            .pdf-snap-container,
            .pdf-snap-container * {
              font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;
              letter-spacing: normal !important;
              word-spacing: normal !important;
              word-break: normal !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              text-rendering: geometricPrecision !important;
              -webkit-font-smoothing: antialiased !important;
            }

            .pdf-snap-container {
              padding-left: 14px !important;
              padding-right: 14px !important;
              box-sizing: border-box !important;
            }

            .pdf-section-header {
              background-color: #004B93 !important;
              color: #ffffff !important;
              font-weight: bold !important;
              font-size: 9px !important;
              padding: 4px 8px !important;
              text-transform: uppercase !important;
              letter-spacing: 0.5px !important;
            }

            .pdf-subsection-header {
              background-color: #f1f5f9 !important;
              color: #002855 !important;
              font-weight: bold !important;
              font-size: 8px !important;
              padding: 3px 8px !important;
              text-transform: uppercase !important;
            }
          `}</style>
          <>
            {/* HEADER SECTION - SAP / ISO STYLE */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: '10px' }}>
               <tbody>
                   <tr>
                       <td style={{ width: '22%', borderRight: '1px solid #000', padding: '8px', textAlign: 'center', verticalAlign: 'middle' }}>
                           <div style={{ backgroundColor: '#004B93', color: '#ffffff', borderRadius: '4px', padding: '5px 10px', fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px', display: 'inline-block' }}>
                             DUNCAN
                           </div>
                           <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#334155', marginTop: '4px', lineHeight: '1.2' }}>
                             GESTIÓN INTEGRAL<br/>SEGURIDAD Y SALUD (SSA)
                           </div>
                       </td>
                       <td style={{ width: '50%', borderRight: '1px solid #000', padding: '8px', textAlign: 'center', verticalAlign: 'middle' }}>
                           <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#000', letterSpacing: '0.5px' }}>
                             PROGRAMA DE SEGURIDAD Y SALUD EN EL TRABAJO
                           </div>
                           <div style={{ fontSize: '12px', color: '#002855', fontWeight: 'bold', marginTop: '3px' }}>
                             {(metadata.tipo?.nombre || inspection.tipoNombre || "ACTA DE INSPECCIÓN TÉCNICA").toUpperCase()}
                           </div>
                           <div style={{ fontSize: '7px', color: '#475569', marginTop: '3px' }}>
                             CUMPLIMIENTO LOPCYMAT ART. 53, 54, 59-62 / NORMAS COVENIN E INPSASEL VIGENTES
                           </div>
                       </td>
                       <td className="nested-table-container" style={{ width: '28%', padding: '0', verticalAlign: 'middle' }}>
                           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5px' }}>
                               <tbody>
                                   <tr>
                                     <td style={{ borderBottom: '1px solid #000', padding: '2.5px 5px', fontWeight: 'bold', width: '42%' }}>CÓDIGO DOC:</td>
                                     <td style={{ borderBottom: '1px solid #000', padding: '2.5px 5px' }}>{metadata.tipo?.codigo || 'SST-F-GEN-01'}</td>
                                   </tr>
                                   <tr>
                                     <td style={{ borderBottom: '1px solid #000', padding: '2.5px 5px', fontWeight: 'bold' }}>ID TRANS:</td>
                                     <td style={{ borderBottom: '1px solid #000', padding: '2.5px 5px' }}>{inspection.referencia || (inspection.id || inspection._id || 'INSP').substring(0, 8).toUpperCase()}</td>
                                   </tr>
                                   <tr>
                                     <td style={{ borderBottom: '1px solid #000', padding: '2.5px 5px', fontWeight: 'bold' }}>EMISIÓN:</td>
                                     <td style={{ borderBottom: '1px solid #000', padding: '2.5px 5px' }}>{formatDate(inspection.fecha)}</td>
                                   </tr>
                                   <tr>
                                     <td style={{ padding: '2.5px 5px', fontWeight: 'bold' }}>ESTATUS:</td>
                                     <td style={{ padding: '2.5px 5px', fontWeight: 'bold', color: (inspection.resultado === 'C' || (inspection.puntuacion || 100) >= 70) ? '#166534' : '#b91c1c' }}>
                                       {inspection.resultado === 'C' ? 'CONFORME' : inspection.resultado === 'NC' ? 'NO CONFORME' : 'OBS. MAYOR'}
                                     </td>
                                   </tr>
                               </tbody>
                           </table>
                       </td>
                   </tr>
               </tbody>
            </table>

            {/* DATOS DE CONTROL - FIELD BOX */}
           <div style={{ border: '1px solid #000', marginBottom: isExtintores ? '6px' : '15px' }}>
             <div className="pdf-section-header">1.0 DATOS DE IDENTIFICACIÓN Y CONTROL</div>
             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                 <tbody>
                     <tr>
                         <td style={{ width: '15%', padding: isExtintores ? '4px 6px' : '8px 10px', borderRight: '1px solid #000', borderBottom: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f3f4f6', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>EMPRESA:</td>
                         <td style={{ width: '35%', padding: isExtintores ? '4px 6px' : '8px 10px', borderRight: '1px solid #000', borderBottom: '1px solid #000', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>
                            <div style={{ display: 'block', lineHeight: '1.2' }}>
                              <span style={{ fontWeight: 'bold', display: 'block' }}>{metadata.empresa?.nombre || 'N/A'}</span>
                              {metadata.empresa?.rif && (
                                <span style={{ fontSize: isExtintores ? '7px' : '7.5px', color: '#4b5563', fontWeight: 'normal', display: 'block', marginTop: '2px' }}>({metadata.empresa.rif})</span>
                              )}
                            </div>
                          </td>
                         <td style={{ width: '15%', padding: isExtintores ? '4px 6px' : '8px 10px', borderRight: '1px solid #000', borderBottom: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f3f4f6', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>LOCALIDAD:</td>
                         <td style={{ width: '35%', padding: isExtintores ? '4px 6px' : '8px 10px', borderBottom: '1px solid #000', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>{metadata.localidad?.nombre || 'N/A'}</td>
                     </tr>
                     <tr>
                         <td style={{ padding: isExtintores ? '4px 6px' : '8px 10px', borderRight: '1px solid #000', borderBottom: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f3f4f6', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>INSTALACIÓN:</td>
                         <td style={{ padding: isExtintores ? '4px 6px' : '8px 10px', borderRight: '1px solid #000', borderBottom: '1px solid #000', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>{metadata.establecimiento?.nombre || 'N/A'}</td>
                         <td style={{ padding: isExtintores ? '4px 6px' : '8px 10px', borderRight: '1px solid #000', borderBottom: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f3f4f6', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>CATEGORÍA:</td>
                         <td style={{ padding: isExtintores ? '4px 6px' : '8px 10px', borderBottom: '1px solid #000', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>{metadata.tipo?.categoria || 'N/A'}</td>
                     </tr>
                     <tr>
                         <td style={{ padding: isExtintores ? '4px 6px' : '8px 10px', borderRight: '1px solid #000', borderBottom: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f3f4f6', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>INSPECTOR:</td>
                         <td style={{ padding: isExtintores ? '4px 6px' : '8px 10px', borderRight: '1px solid #000', borderBottom: '1px solid #000', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>{(inspection.inspectorId || inspection.inspector || 'Inspector SSA').toUpperCase()}</td>
                         <td style={{ padding: isExtintores ? '4px 6px' : '8px 10px', borderRight: '1px solid #000', borderBottom: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f3f4f6', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>SISTEMA EMISOR:</td>
                         <td style={{ padding: isExtintores ? '4px 6px' : '8px 10px', borderBottom: '1px solid #000', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>SGD DUNCAN</td>
                     </tr>
                     <tr>
                         <td style={{ padding: isExtintores ? '4px 6px' : '8px 10px', borderRight: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f3f4f6', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>ESTADO:</td>
                         <td style={{ padding: isExtintores ? '4px 6px' : '8px 10px', borderRight: '1px solid #000', fontWeight: 'bold', color: inspection.estado === 'Completada' ? '#166534' : '#b91c1c', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>{(inspection.estado || 'BORRADOR').toUpperCase()}</td>
                         <td style={{ padding: isExtintores ? '4px 6px' : '8px 10px', borderRight: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f3f4f6', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>FRECUENCIA:</td>
                         <td style={{ padding: isExtintores ? '4px 6px' : '8px 10px', verticalAlign: 'middle', fontSize: isExtintores ? '8px' : '9px' }}>{metadata.tipo?.frecuencia?.toUpperCase() || 'N/A'}</td>
                     </tr>
                 </tbody>
             </table>
           </div>

           {/* INDICADORES DE DESEMPEÑO */}
           <div style={{ border: '1px solid #000', marginBottom: '15px' }}>
             <div className="pdf-section-header">2.0 RESUMEN NUMÉRICO Y DETERMINACIÓN DE CONFORMIDAD</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px" }}>
              <thead>
                <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'center' }}>
                  <th style={{ border: "1px solid #000", borderTop: 'none', padding: "5px 6px", textAlign: "left", width: "45%", verticalAlign: 'middle' }}>SECCIÓN / ÁREA DE EVALUACIÓN</th>
                  <th style={{ border: "1px solid #000", borderTop: 'none', padding: "5px 6px", width: "9%", verticalAlign: 'middle' }}>TOTAL</th>
                  <th style={{ border: "1px solid #000", borderTop: 'none', padding: "5px 6px", width: "9%", color: "#166534", verticalAlign: 'middle' }}>C</th>
                  <th style={{ border: "1px solid #000", borderTop: 'none', padding: "5px 6px", width: "9%", color: "#b91c1c", verticalAlign: 'middle' }}>NC</th>
                  <th style={{ border: "1px solid #000", borderTop: 'none', padding: "5px 6px", width: "9%", color: "#c2410c", verticalAlign: 'middle' }}>OM</th>
                  <th style={{ border: "1px solid #000", borderTop: 'none', padding: "5px 6px", width: "9%", color: "#64748b", verticalAlign: 'middle' }}>NA</th>
                  <th style={{ border: "1px solid #000", borderTop: 'none', padding: "5px 6px", width: "10%", verticalAlign: 'middle' }}>CONFORME</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let totTotal = 0, totC = 0, totNC = 0, totOM = 0, totNA = 0;
                  const rows = (metadata.tipo?.secciones || []).map((sec: any) => {
                    let c = 0, nc = 0, om = 0, na = 0, total = 0;
                    (sec.items || []).forEach((item: any) => {
                      const rawVal = inspection.respuestas?.[item.id];
                      if (rawVal === undefined || rawVal === null || rawVal === '') return;
                      total++;
                      const val = String(rawVal).toUpperCase().trim();
                      if (['C', 'BUENO', 'SI', 'SÍ', 'OPERATIVO', 'OK', 'CONFORME', 'EXISTE'].includes(val)) c++;
                      else if (['NC', 'DANADO', 'DAÑADO', 'NO', 'NO OPERATIVO', 'NO CONFORME', 'CRITICO', 'CRÍTICO', 'NO_EXISTE'].includes(val)) nc++;
                      else if (val === 'OM') om++;
                      else if (['NA', 'N/A', 'NO APLICA'].includes(val)) na++;
                      else c++;
                    });
                    totTotal += total;
                    totC += c;
                    totNC += nc;
                    totOM += om;
                    totNA += na;
                    const applicable = total - na;
                    const perc = applicable > 0 ? Math.round((c / applicable) * 100) : 100;

                    return (
                      <tr key={sec.id} style={{ textAlign: 'center' }}>
                        <td style={{ border: "1px solid #000", padding: "5px 6px", textAlign: 'left', fontWeight: 'bold' }}>{(sec.titulo || sec.title || '').toUpperCase()}</td>
                        <td style={{ border: "1px solid #000", padding: "5px 6px" }}>{total}</td>
                        <td style={{ border: "1px solid #000", padding: "5px 6px", color: '#166534', fontWeight: 'bold' }}>{c}</td>
                        <td style={{ border: "1px solid #000", padding: "5px 6px", color: '#b91c1c', fontWeight: 'bold' }}>{nc}</td>
                        <td style={{ border: "1px solid #000", padding: "5px 6px", color: '#c2410c', fontWeight: 'bold' }}>{om}</td>
                        <td style={{ border: "1px solid #000", padding: "5px 6px", color: '#64748b' }}>{na}</td>
                        <td style={{ border: "1px solid #000", padding: "5px 6px", fontWeight: "bold" }}>
                          <span style={{ color: perc >= 90 ? '#166534' : perc >= 70 ? '#c2410c' : '#b91c1c' }}>{perc}%</span>
                        </td>
                      </tr>
                    );
                  });

                  const globalScore = inspection.puntuacion ?? inspection.puntuacionConformidad ?? 100;
                  const nivelColor = globalScore >= 90 ? '#166534' : globalScore >= 70 ? '#c2410c' : '#b91c1c';

                  return (
                    <>
                      {rows}
                      <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', textAlign: 'center' }}>
                        <td style={{ border: "1px solid #000", padding: "5px 6px", textAlign: 'left' }}>PUNTUACIÓN GLOBAL Y TOTALES AUDITADOS:</td>
                        <td style={{ border: "1px solid #000", padding: "5px 6px" }}>{totTotal}</td>
                        <td style={{ border: "1px solid #000", padding: "5px 6px", color: '#166534' }}>{totC}</td>
                        <td style={{ border: "1px solid #000", padding: "5px 6px", color: '#b91c1c' }}>{totNC}</td>
                        <td style={{ border: "1px solid #000", padding: "5px 6px", color: '#c2410c' }}>{totOM}</td>
                        <td style={{ border: "1px solid #000", padding: "5px 6px", color: '#64748b' }}>{totNA}</td>
                        <td style={{ border: "1px solid #000", padding: "5px 6px", fontSize: '9px', color: nivelColor }}>
                          {globalScore}%
                        </td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>

          {/* CUERPO TÉCNICO DE LA INSPECCIÓN */}
          <div className="pdf-section-header" style={{ border: '1px solid #000', borderBottom: 'none' }}>3.0 HALLAZGOS Y EVIDENCIAS DE CAMPO</div>
          <div style={{ border: '1px solid #000', marginBottom: isExtintores ? '6px' : '20px' }}>
            {(metadata.tipo?.secciones || []).map((sec: any, i: number) => (
              <div key={sec.id} style={{ pageBreakInside: "auto" }}>
                <div className="pdf-subsection-header" style={{ borderBottom: '1px solid #000', borderTop: i > 0 ? '1px solid #000' : 'none' }}>
                  {`3.${i + 1} ${(sec.titulo || sec.title || '').toUpperCase()}`}
                </div>
                <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9fafb" }}>
                      <th style={{ borderBottom: "1px solid #000", borderRight: '1px solid #000', padding: isExtintores ? "4px 6px" : "8px 10px", textAlign: "left", fontSize: isExtintores ? "8px" : "9px", width: "75%", verticalAlign: 'middle' }}>REQUERIMIENTO / PUNTO DE CONTROL</th>
                      <th style={{ borderBottom: "1px solid #000", padding: isExtintores ? "4px 6px" : "8px 10px", textAlign: "center", fontSize: isExtintores ? "8px" : "9px", width: "25%", verticalAlign: 'middle' }}>RESULTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sec.items || []).map((item: any) => {
                       const rawResponse = inspection.respuestas?.[item.id] || "N/A";
                       const val = String(rawResponse).toUpperCase();
                       let smallVal = val;
                       const isPositive = ["C", "SI", "BUENO", "OPERATIVO", "OK", "CONFORME", "EXISTE"].includes(val);
                       const isNegative = ["NC", "NO", "DANADO", "MALO", "DETERIORADO", "NO OPERATIVO", "CRITICO", "NO_EXISTE", "DESACTUALIZADO"].includes(val);
                       const isNeutral = ["OM"].includes(val);
                       const isNA = ["N/A", "NA"].includes(val);
                       
                       let c = "#000";
                       let isTextBased = !isPositive && !isNegative && !isNeutral && !isNA;
                       
                       if (isPositive) { 
                         c = "#166534"; 
                         smallVal = val === "C" ? "CONFORME (C)" : (val === "SI" ? "SÍ" : val); 
                       }
                       else if (isNegative) { 
                         c = "#b91c1c"; 
                         smallVal = val === "NC" ? "NO CONFORME (NC)" : (val === "NO_EXISTE" ? "NO EXISTE" : val); 
                       }
                       else if (isNeutral) { 
                         c = "#c2410c"; 
                         smallVal = "OBSERVACIÓN (OM)"; 
                       }
                       else if (isNA) {
                         smallVal = "N/A";
                         c = "#6b7280";
                       }
                       else if (isTextBased) {
                         smallVal = String(rawResponse);
                       }
                       
                       return (
                        <React.Fragment key={item.id}>
                          <tr style={{ borderBottom: "0.5px solid #ccc", pageBreakInside: "avoid" }}>
                            <td style={{ borderRight: "1px solid #000", padding: isExtintores ? "6px 8px" : "10px 12px", verticalAlign: 'middle', wordBreak: "break-word", overflowWrap: "break-word" }}>
                               <div style={{ width: '100%', fontSize: isExtintores ? "8.5px" : "9.5px", lineHeight: '1.3' }}>
                                 {inspection.fotos?.[item.id] && (
                                   <span style={{ float: 'right', marginLeft: '6px', marginTop: '1px' }}>
                                     <Camera size={11} style={{ color: '#004B93', display: 'inline-block', verticalAlign: 'middle' }} />
                                   </span>
                                 )}
                                 <span style={{ display: 'inline', wordBreak: 'normal', overflowWrap: 'anywhere' }}>{item.pregunta || item.label}</span>
                                 {item.referenciaLegal && (
                                   <div style={{ fontSize: '7px', color: '#666', fontStyle: 'italic', marginTop: '2px' }}>Ref: {item.referenciaLegal}</div>
                                 )}
                               </div>
                               
                              {isTextBased && rawResponse !== "N/A" && rawResponse !== "" && String(rawResponse).length > 20 && (
                                <div style={{ marginTop: "4px", color: "#222", fontSize: '8px', borderLeft: '2px solid #004B93', paddingLeft: '6px', backgroundColor: '#f8fafc', padding: '4px 6px' }}><strong>Dato Registrado:</strong> {rawResponse}</div>
                              )}
                            </td>
                            <td style={{ textAlign: "center", color: c, fontWeight: "bold", padding: isExtintores ? "6px 8px" : "10px 12px", verticalAlign: "middle", fontSize: isExtintores ? "8.5px" : "9.5px", wordBreak: "break-word", overflowWrap: "break-word" }}>
                              {smallVal}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* OBSERVACIONES TÉCNICAS */}
          {inspection.observaciones && (
            <div style={{ marginBottom: isExtintores ? "6px" : "25px", border: '1px solid #000', pageBreakInside: "avoid" }}>
              <div className="pdf-section-header">4.0 OBSERVACIONES TÉCNICAS Y RECOMENDACIONES</div>
              <div style={{ padding: isExtintores ? "5px" : "10px", fontSize: '9px', lineHeight: '1.4', backgroundColor: "#fff", whiteSpace: 'pre-wrap' }}>
                {inspection.observaciones}
              </div>
            </div>
          )}

          {/* EVIDENCIA FOTOGRÁFICA */}
          {inspection.fotos && Object.keys(inspection.fotos).length > 0 && (
            <div style={{ marginBottom: isExtintores ? "6px" : "25px", border: '1px solid #000', pageBreakInside: "avoid" }}>
              <div className="pdf-section-header">REGISTRO FOTOGRÁFICO</div>
              <div style={{ padding: isExtintores ? "5px" : "10px", backgroundColor: "#fff", display: 'flex', flexWrap: 'wrap', gap: isExtintores ? '6px' : '15px', justifyContent: 'center' }}>
                {Object.entries(inspection.fotos).map(([fotoId, url], i) => {
                  let itemName = fotoId;
                  (metadata.tipo?.secciones || []).forEach((sec: any) => {
                    const found = (sec.items || []).find((it: any) => it.id === fotoId);
                    if (found) itemName = found.pregunta || found.label || fotoId;
                  });
                  const numFotos = Object.keys(inspection.fotos || {}).length;
                  const itemWidth = isExtintores 
                    ? `${Math.min(30, Math.floor(95 / numFotos))}%` 
                    : '45%';
                  return (
                    <div key={i} style={{ width: itemWidth, border: '1px solid #ddd', padding: isExtintores ? '3px' : '6px', textAlign: 'center', backgroundColor: '#f8fafc', pageBreakInside: 'avoid' }}>
                      <img src={url} alt={`Evidencia ${i + 1}`} style={{ maxWidth: '100%', maxHeight: isExtintores ? '80px' : '180px', width: 'auto', height: 'auto', margin: '0 auto', display: 'block' }} />
                      <div style={{ fontSize: isExtintores ? '7px' : '9px', marginTop: isExtintores ? '3px' : '6px', fontWeight: 'bold', color: '#333' }}>{itemName.replace(/^\d+\.\d+\s+¿?/, '').replace(/\?$/, '')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CIERRE Y PROTOCOLO DE FIRMAS */}
          <div style={{ border: '1px solid #000', pageBreakInside: "avoid" }}>
            <div className="pdf-subsection-header" style={{ borderBottom: '1px solid #000', textAlign: 'center' }}>5.0 PROTOCOLO DE VALIDACIÓN Y CIERRE</div>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
              <tbody>
                <tr>
                  <td className="signature-box" style={{ width: "50%", padding: isExtintores ? "6px 10px" : "15px 10px", borderRight: '1px solid #000' }}>
                    <div style={{ height: isExtintores ? "40px" : "65px", marginBottom: isExtintores ? "4px" : "8px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {inspection.firmas?.inspector ? (
                        <img
                          src={inspection.firmas.inspector}
                          alt="Firma Inspector"
                          style={{ maxHeight: isExtintores ? "40px" : "65px", maxWidth: "100%", width: 'auto', height: 'auto' }}
                        />
                      ) : <div style={{ height: isExtintores ? "40px" : "65px", borderBottom: '1px dashed #ccc', width: '150px' }} />}
                    </div>
                    <div style={{ borderTop: "1px solid #000", margin: "0 auto", width: "85%", paddingTop: "3px", fontSize: '8.5px' }}>
                      <strong>{(inspection.inspectorId || inspection.inspector || 'Inspector SSA').toUpperCase()}</strong><br/>
                      FIRMA AUTORIZADA: INSPECTOR SST
                    </div>
                  </td>
                  <td className="signature-box" style={{ width: "50%", padding: isExtintores ? "6px 10px" : "15px 10px" }}>
                    <div style={{ height: isExtintores ? "40px" : "65px", marginBottom: isExtintores ? "4px" : "8px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {inspection.firmas?.revisor ? (
                        <img
                          src={inspection.firmas.revisor}
                          alt="Firma Revisor"
                          style={{ maxHeight: isExtintores ? "40px" : "65px", maxWidth: "100%", width: 'auto', height: 'auto' }}
                        />
                      ) : <div style={{ height: isExtintores ? "40px" : "65px", borderBottom: '1px dashed #ccc', width: '150px' }} />}
                    </div>
                    <div style={{ borderTop: "1px solid #000", margin: "0 auto", width: "85%", paddingTop: "3px", fontSize: '8.5px' }}>
                      <strong>VALIDACIÓN RESPONSABLE</strong><br/>
                      FIRMA Y SELLO: GERENCIA / JEFATURA
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FOOTER - CORPORATE STANDARD */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', borderStyle: 'none', marginTop: isExtintores ? '8px' : '15px' }}>
            <tbody>
              <tr>
                <td style={{ width: '30%', textAlign: 'left', border: 'none', borderStyle: 'none', padding: '0', fontSize: '6.5px', fontWeight: 'bold', color: '#000', backgroundColor: 'transparent' }}>
                  ERP REGISTRY: SST-090-SYS-INSP
                </td>
                <td style={{ width: '40%', textAlign: 'center', border: 'none', borderStyle: 'none', padding: '0', fontSize: '6.5px', fontWeight: 'bold', color: '#000', backgroundColor: 'transparent' }}>
                  DOCUMENTO GENERADO POR SISTEMA SGD-DUNCAN - PÁGINA 1 / 1
                </td>
                <td style={{ width: '30%', textAlign: 'right', border: 'none', borderStyle: 'none', padding: '0', fontSize: '6.5px', fontWeight: 'bold', color: '#000', backgroundColor: 'transparent' }}>
                  DESARROLLADO POR ERGOEXPRESS, C.A. - RIF: J-50251246-2
                </td>
              </tr>
            </tbody>
          </table>
          </>
        </div>

        {/* MODAL PRINT PREVIEW */}
        {showPrintPreview && (
          <div id="print-preview-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto flex justify-center py-6 px-4 print-preview-modal-overlay">
            <style>{`
              @media print {
                body > div:not(.print-preview-modal-overlay),
                body > div:not(.print-preview-modal-overlay) * {
                  display: none !important;
                }
                header, nav, sidebar, main, .print\\:hidden {
                  display: none !important;
                }
                .print-preview-modal-overlay {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  height: auto !important;
                  min-height: 100% !important;
                  background: white !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  overflow: visible !important;
                  display: block !important;
                  z-index: 99999 !important;
                }
                .print-preview-modal-container {
                  box-shadow: none !important;
                  border: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  max-width: 100% !important;
                  width: 100% !important;
                  background: white !important;
                }
                .print-preview-header {
                  display: none !important;
                }
                .print-preview-sheet-wrapper {
                  background: white !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                }
                .print-preview-sheet {
                  box-shadow: none !important;
                  border: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                }
              }
            `}</style>
            
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-4xl flex flex-col print-preview-modal-container overflow-hidden h-fit my-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-700 bg-slate-800 print-preview-header">
                <div className="flex items-center gap-2 text-white">
                  <Printer className="text-emerald-400 font-bold" size={20} />
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-white font-sans">Vista Previa de Impresión</h3>
                    <p className="text-xs text-slate-400">Verifique el formato del reporte antes de imprimir</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs transition-all shadow-md cursor-pointer"
                  >
                    <Printer size={15} /> Imprimir Reporte
                  </button>
                  <button
                    onClick={() => handleShare("download")}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2 bg-[#004B93] hover:bg-[#003870] text-white rounded font-bold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {exporting ? "Procesando..." : "Descargar PDF"}
                  </button>
                  <button
                    onClick={() => setShowPrintPreview(false)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-bold text-xs transition-all border border-slate-600 cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-900/50 p-6 md:p-10 overflow-x-auto flex justify-center print-preview-sheet-wrapper font-sans">
                <div 
                  id="print-preview-modal-content" 
                  className="bg-white p-[12mm] shadow-2xl w-[794px] max-w-full text-black print-preview-sheet pdf-snap-container"
                  style={{
                    boxSizing: "border-box",
                    fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
                    fontSize: "9px"
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
