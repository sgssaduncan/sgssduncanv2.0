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

// Logo oficial Duncan
const getCompanyLogo = (metadata: any) => {
  return metadata?.empresa?.logoUrl || '/duncan-logo-bw.png';
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
          if (reportRef.current) { target.replaceChildren(reportRef.current.cloneNode(true)); }
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
          className="bg-white text-slate-900 relative w-full pb-8 px-4 sm:px-8 pdf-snap-container rounded-lg border border-slate-200 shadow-sm"
          style={{
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: "9px"
          }}
        >
          {/* CABECERA MEMBRETE OFICIAL DUNCAN */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-300 mb-4 pt-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '10px', marginBottom: '14px' }}>
            <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src="/duncan-logo-bw.png"
                alt="Duncan"
                style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', lineHeight: '1.2' }}>
                  {metadata.empresa?.nombre || inspection.empresaNombre || 'Distribuidora Duncan, C.A.'}
                </div>
                <div style={{ fontSize: '8.5px', color: '#475569', marginTop: '2px' }}>
                  Sistema de Gestión de Seguridad, Salud y Ambiente (SG-SSA)
                </div>
                <div style={{ fontSize: '9.5px', fontWeight: 'bold', color: '#1e40af', marginTop: '2px' }}>
                  INFORME OFICIAL: {(metadata.tipo?.nombre || inspection.tipoNombre || 'Inspección Técnica').toUpperCase()}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#1e293b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', display: 'inline-block' }}>
                N° {inspection.correlativo || (inspection.referencia ? inspection.referencia.replace(/^REF-|^INSP-/, '') : '1001')}
              </div>
              <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '2px' }}>
                {formatDate(inspection.fecha)}
              </div>
            </div>
          </div>

          {/* TABLA DE METADATOS Y PARÁMETROS DE CONTROL (4 COLUMNAS) */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px', marginBottom: '14px', border: '1px solid #cbd5e1' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '4px 8px', width: '20%', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Parámetro</th>
                <th style={{ padding: '4px 8px', width: '30%', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Detalle</th>
                <th style={{ padding: '4px 8px', width: '20%', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Parámetro</th>
                <th style={{ padding: '4px 8px', width: '30%', textAlign: 'left' }}>Detalle</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#475569', borderRight: '1px solid #cbd5e1' }}>Empresa</td>
                <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{metadata.empresa?.nombre || inspection.empresaNombre || 'Distribuidora Duncan, C.A.'}</td>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#475569', borderRight: '1px solid #cbd5e1' }}>N° Correlativo</td>
                <td style={{ padding: '4px 8px' }}>{inspection.correlativo || (inspection.referencia ? inspection.referencia.replace(/^REF-|^INSP-/, '') : '1001')}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#475569', borderRight: '1px solid #cbd5e1' }}>Establecimiento</td>
                <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{metadata.establecimiento?.nombre || inspection.establecimientoNombre || 'Sede Principal'}</td>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#475569', borderRight: '1px solid #cbd5e1' }}>Fecha</td>
                <td style={{ padding: '4px 8px' }}>{formatDate(inspection.fecha)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#475569', borderRight: '1px solid #cbd5e1' }}>Localidad</td>
                <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{metadata.localidad?.nombre || inspection.localidadNombre || 'Valencia'}</td>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#475569', borderRight: '1px solid #cbd5e1' }}>Inspector</td>
                <td style={{ padding: '4px 8px' }}>{inspection.inspector || inspection.inspectorId || 'Francisco Rojas'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#475569', borderRight: '1px solid #cbd5e1' }}>Resultado</td>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: inspection.resultado === 'C' ? '#166534' : inspection.resultado === 'NC' ? '#b91c1c' : '#c2410c', borderRight: '1px solid #cbd5e1' }}>
                  {inspection.resultado || '—'}
                </td>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#475569', borderRight: '1px solid #cbd5e1' }}>Puntuación</td>
                <td style={{ padding: '4px 8px', fontWeight: 'bold' }}>
                  {inspection.puntuacion ?? inspection.puntuacionConformidad ?? 100}%
                </td>
              </tr>
            </tbody>
          </table>

          {/* TABLA PRINCIPAL DE EVALUACIÓN (ÍTEM EVALUADO / RESPUESTA) */}
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e40af', color: '#ffffff', fontWeight: 'bold' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left', width: '82%' }}>Ítem Evaluado</th>
                  <th style={{ padding: '6px 10px', textAlign: 'center', width: '18%' }}>Respuesta</th>
                </tr>
              </thead>
              <tbody>
                {(metadata.tipo?.secciones || []).map((sec: any, secIdx: number) => (
                  <React.Fragment key={sec.id || secIdx}>
                    <tr style={{ backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 'bold', borderTop: secIdx > 0 ? '1px solid #cbd5e1' : 'none', borderBottom: '1px solid #cbd5e1' }}>
                      <td colSpan={2} style={{ padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.2px' }}>
                        SECCIÓN: {secIdx + 1}. {(sec.titulo || sec.title || '').replace(/^SECCIÓN:s*/i, '')}
                      </td>
                    </tr>
                    {(sec.items || []).map((item: any, itIdx: number) => {
                      const rawVal = inspection.respuestas?.[item.id];
                      let displayVal = '—';
                      let color = '#334155';
                      if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
                        const valUpper = String(rawVal).toUpperCase().trim();
                        if (['C', 'BUENO', 'SI', 'SÍ', 'OPERATIVO', 'OK', 'CONFORME', 'EXISTE'].includes(valUpper)) {
                          displayVal = 'C';
                          color = '#166534';
                        } else if (['NC', 'DANADO', 'DAÑADO', 'NO', 'NO OPERATIVO', 'NO CONFORME', 'CRITICO', 'CRÍTICO', 'NO_EXISTE'].includes(valUpper)) {
                          displayVal = 'NC';
                          color = '#b91c1c';
                        } else if (valUpper === 'OM') {
                          displayVal = 'OM';
                          color = '#c2410c';
                        } else if (['NA', 'N/A', 'NO APLICA'].includes(valUpper)) {
                          displayVal = 'NA';
                          color = '#64748b';
                        } else {
                          displayVal = String(rawVal);
                        }
                      }

                      return (
                        <tr key={item.id || itIdx} style={{ backgroundColor: itIdx % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '5px 10px', color: '#1e293b' }}>
                            {item.pregunta || item.label}
                            {item.referenciaLegal && (
                              <span style={{ fontSize: '7.5px', color: '#64748b', fontStyle: 'italic', marginLeft: '6px' }}>
                                ({item.referenciaLegal})
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '5px 10px', textAlign: 'center', fontWeight: 'bold', color: color }}>
                            {displayVal}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* OBSERVACIONES TÉCNICAS */}
          {inspection.observaciones && (
            <div style={{ marginBottom: "14px", border: '1px solid #cbd5e1', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', fontWeight: 'bold', fontSize: '8.5px', color: '#1e293b', borderBottom: '1px solid #cbd5e1' }}>
                OBSERVACIONES Y RECOMENDACIONES
              </div>
              <div style={{ padding: "8px 10px", fontSize: '8px', lineHeight: '1.4', backgroundColor: "#fff", whiteSpace: 'pre-wrap' }}>
                {inspection.observaciones}
              </div>
            </div>
          )}

          {/* EVIDENCIA FOTOGRÁFICA */}
          {inspection.fotos && Object.keys(inspection.fotos).length > 0 && (
            <div style={{ marginBottom: "14px", border: '1px solid #cbd5e1', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', fontWeight: 'bold', fontSize: '8.5px', color: '#1e293b', borderBottom: '1px solid #cbd5e1' }}>
                REGISTRO FOTOGRÁFICO
              </div>
              <div style={{ padding: "8px", backgroundColor: "#fff", display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                {Object.entries(inspection.fotos).map(([fotoId, url], i) => {
                  let itemName = fotoId;
                  (metadata.tipo?.secciones || []).forEach((sec: any) => {
                    const found = (sec.items || []).find((it: any) => it.id === fotoId);
                    if (found) itemName = found.pregunta || found.label || fotoId;
                  });
                  return (
                    <div key={i} style={{ width: '45%', border: '1px solid #e2e8f0', padding: '4px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '3px' }}>
                      <img src={url} alt={`Evidencia ${i + 1}`} style={{ maxWidth: '100%', maxHeight: '160px', width: 'auto', height: 'auto', margin: '0 auto', display: 'block', borderRadius: '2px' }} />
                      <div style={{ fontSize: '7.5px', marginTop: '4px', fontWeight: 'bold', color: '#334155' }}>
                        {itemName.replace(/^\d+\.\d+\s+¿?/, '').replace(/\?$/, '')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PROTOCOLO DE FIRMAS OFICIALES */}
          <div style={{ marginTop: '20px', paddingTop: '10px', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div style={{ width: '38%' }}>
              {inspection.firmas?.inspector && (
                <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={inspection.firmas.inspector} alt="Firma Inspector" style={{ maxHeight: '40px', maxWidth: '100%' }} />
                </div>
              )}
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', marginTop: inspection.firmas?.inspector ? '2px' : '30px' }}>
                <div style={{ fontSize: '8.5px', fontWeight: 'bold', color: '#0f172a' }}>
                  {inspection.inspector || inspection.inspectorId || 'Francisco Rojas'}
                </div>
                <div style={{ fontSize: '7.5px', color: '#64748b' }}>
                  Elaborado por (Inspector SSA)
                </div>
              </div>
            </div>

            <div style={{ width: '38%' }}>
              {inspection.firmas?.revisor && (
                <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={inspection.firmas.revisor} alt="Firma Revisor" style={{ maxHeight: '40px', maxWidth: '100%' }} />
                </div>
              )}
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', marginTop: inspection.firmas?.revisor ? '2px' : '30px' }}>
                <div style={{ fontSize: '8.5px', fontWeight: 'bold', color: '#0f172a' }}>
                  Supervisor de Área / Sede
                </div>
                <div style={{ fontSize: '7.5px', color: '#64748b' }}>
                  Revisado y Conforme
                </div>
              </div>
            </div>
          </div>
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
