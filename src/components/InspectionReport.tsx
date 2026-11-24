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
import { cn, formatDate, formatDateTime, getReportHeaderTitle } from "../lib/utils";
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
import { getFormDefinition, calculateScore, resolveItemResponse, classifyResponse } from "../lib/formDefinitions";
import { INITIAL_EMPRESAS, INITIAL_LOCALIDADES, INITIAL_ESTABLECIMIENTOS, INITIAL_TIPOS_INSPECCION } from '../data/seedData';
import { resolveEmpresaInfo } from "../lib/empresaResolver";
import ActionPlanDocument from './ActionPlanDocument';
import { generarInspeccionPDF } from "../lib/pdfGenerator";
import { exportActionPlanToExcel, exportActionPlanToPDF } from "../lib/actionPlanExport";
import { generatePlanesAccionFromInspeccion } from "../lib/planAccionGenerator";

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
  const [showActionPlanModal, setShowActionPlanModal] = React.useState(false);
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
      // Resolver empresa de forma inteligente y dinámica según la sede y datos de la inspección
      const resolvedEmp = resolveEmpresaInfo({
        empresaId: inspection.empresaId,
        empresaNombre: (inspection as any).empresaNombre,
        establecimientoId: inspection.establecimientoId,
        establecimientoNombre: (inspection as any).establecimientoNombre,
        sedeNombre: (inspection as any).sedeNombre,
      });

      const empresa = {
        _id: resolvedEmp._id,
        id: resolvedEmp.id,
        codigo: resolvedEmp.codigo,
        nombre: resolvedEmp.nombre,
        rif: resolvedEmp.rif,
        direccion: resolvedEmp.direccion,
      };

      // Resolver localidad
      let locName = (inspection as any).localidadNombre || '';
      if (!locName || locName.startsWith('loc_') || locName === 'emp_ddca') {
        const foundLoc = INITIAL_LOCALIDADES.find(l => l._id === inspection.localidadId || l._id === locName);
        locName = foundLoc?.nombre || 'Valencia';
      }

      const localidad = {
        _id: inspection.localidadId || 'loc_valencia',
        id: inspection.localidadId || 'loc_valencia',
        empresaId: inspection.empresaId || 'emp_ddca',
        nombre: locName,
      };

      // Resolver establecimiento
      let estName = (inspection as any).establecimientoNombre || '';
      if (!estName || estName.startsWith('est_') || estName.startsWith('loc_')) {
        const targetId = inspection.establecimientoId || estName;
        const foundEst = INITIAL_ESTABLECIMIENTOS.find(e => e._id === targetId || e.codigo === targetId || e._id?.toLowerCase() === String(targetId).toLowerCase());
        estName = foundEst?.nombre || 'Distribuidora Duncan Valencia';
      }

      const establecimiento = {
        _id: inspection.establecimientoId || 'est_dist_val',
        id: inspection.establecimientoId || 'est_dist_val',
        localidadId: inspection.localidadId || 'loc_valencia',
        nombre: estName,
        iniciales: 'DDV',
      };

      // Deducir código y nombre de formulario
      let formCode = inspection.tipoCodigo;
      if (!formCode || formCode === 'GEN') {
        if (estName.toLowerCase().includes('distribuidora')) formCode = 'DD';
        else if (estName.toLowerCase().includes('servicentro')) formCode = 'SC';
        else formCode = 'DD';
      }

      // Resolver definición canónica del formulario oficial
      const formDef = getFormDefinition(formCode) ||
                     getFormDefinition(inspection.tipoInspeccionId) ||
                     getFormDefinition(inspection.tipoNombre) ||
                     getFormDefinition('DD');

      let tipoNombre = (inspection.tipoNombre || '').trim();
      if (!tipoNombre || tipoNombre.startsWith('est_') || tipoNombre.startsWith('ti_') || tipoNombre === 'EST_DIST_VAL' || tipoNombre === 'GEN') {
        tipoNombre = formDef?.name || (formCode === 'DD' ? 'SSA Distribuidoras' : 'SSA Servicentros');
      }

      const foundTipo = tipos.find((t) => t.id === inspection.tipoInspeccionId || (t as any)._id === inspection.tipoInspeccionId || (t as any).codigo === formCode);

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
        _id: inspection.tipoInspeccionId || (foundTipo as any)?._id || foundTipo?.id || 'ti_dd',
        id: inspection.tipoInspeccionId || (foundTipo as any)?._id || foundTipo?.id || 'ti_dd',
        codigo: formDef?.code || formCode || 'DD',
        nombre: tipoNombre,
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

  // Parser universal de respuestas (objetos o JSON strings)
  const parsedRespuestas = React.useMemo(() => {
    let res: Record<string, any> = {};
    if (inspection.respuestas) {
      if (typeof inspection.respuestas === 'object' && !Array.isArray(inspection.respuestas)) {
        res = { ...inspection.respuestas };
      } else if (typeof inspection.respuestas === 'string') {
        try { const p = JSON.parse(inspection.respuestas); if (p && typeof p === 'object') res = { ...p }; } catch {}
      }
    }
    if (Object.keys(res).length === 0 && inspection.formResponses) {
      if (typeof inspection.formResponses === 'object' && !Array.isArray(inspection.formResponses)) {
        res = { ...(inspection.formResponses as any) };
      } else if (typeof inspection.formResponses === 'string') {
        try { const p = JSON.parse(inspection.formResponses); if (p && typeof p === 'object') res = { ...p }; } catch {}
      }
    }
    if (Object.keys(res).length === 0 && (inspection as any).responses) {
      if (typeof (inspection as any).responses === 'object' && !Array.isArray((inspection as any).responses)) {
        res = { ...(inspection as any).responses };
      } else if (typeof (inspection as any).responses === 'string') {
        try { const p = JSON.parse((inspection as any).responses); if (p && typeof p === 'object') res = { ...p }; } catch {}
      }
    }
    if (Object.keys(res).length === 0 && typeof window !== 'undefined') {
      const keys = [
        inspection.id,
        (inspection as any)._id,
        inspection.correlativo ? String(inspection.correlativo) : null,
        (inspection as any).referencia
      ].filter(Boolean) as string[];

      for (const k of keys) {
        try {
          const raw = localStorage.getItem(`sgd_inspection_responses_${k}`) || localStorage.getItem(`sgd_draft_resp_${k}`);
          if (raw) {
            const p = JSON.parse(raw);
            if (p && typeof p === 'object' && Object.keys(p).length > 0) {
              res = { ...p };
              break;
            }
          }
        } catch {}
      }
    }
    return res;
  }, [inspection]);

  // Cálculo canónico del score con la regla oficial OM = 0.5 puntos
  const scoreResult = React.useMemo(() => {
    const code = metadata.tipo?.codigo || inspection.tipoCodigo || 'DD';
    const formDef = getFormDefinition(code) ||
                   getFormDefinition(inspection.tipoInspeccionId) ||
                   getFormDefinition(metadata.tipo?.nombre || inspection.tipoNombre) ||
                   getFormDefinition('DD');
    if (!formDef) return null;
    return calculateScore(formDef, parsedRespuestas);
  }, [metadata.tipo, inspection, parsedRespuestas]);

  // Resolver coordenadas GPS con retrocompatibilidad y respaldo en localStorage
  const resolvedCoords = React.useMemo(() => {
    if (inspection.coordenadas && inspection.coordenadas.lat && inspection.coordenadas.lng) {
      return inspection.coordenadas;
    }
    if (inspection.geoLat && inspection.geoLon) {
      return {
        lat: inspection.geoLat,
        lng: inspection.geoLon,
        accuracy: inspection.geoAccuracy,
        timestamp: inspection.geoTimestamp
      };
    }
    const targetId = inspection._id || inspection.id || String(inspection.correlativo || '');
    if (targetId && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`sgd_inspection_coords_${targetId}`);
        if (stored) {
          const p = JSON.parse(stored);
          if (p && p.lat && p.lng) return p;
        }
      } catch {}
    }
    return null;
  }, [inspection]);

  // Resolver fotos normalizadas soportando fotos individuales o arrays múltiples por ítem
  const resolvedPhotosList = React.useMemo(() => {
    let rawFotos = inspection.fotos;
    if (!rawFotos || Object.keys(rawFotos).length === 0) {
      const targetId = inspection._id || inspection.id || String(inspection.correlativo || '');
      if (targetId && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(`sgd_inspection_photos_${targetId}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object') rawFotos = parsed;
          }
        } catch {}
      }
    }

    if (!rawFotos || typeof rawFotos !== 'object') return [];

    const list: { itemId: string; itemName: string; url: string; index: number; total: number }[] = [];

    Object.entries(rawFotos).forEach(([itemId, val]) => {
      let itemName = itemId;
      (metadata.tipo?.secciones || []).forEach((sec: any) => {
        const found = (sec.items || []).find((it: any) => it.id === itemId);
        if (found) itemName = found.pregunta || found.label || itemId;
      });

      let urls: string[] = [];
      if (Array.isArray(val)) {
        urls = val;
      } else if (typeof val === 'string' && val.trim().length > 0) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) urls = parsed;
          else urls = [val];
        } catch {
          urls = [val];
        }
      }

      urls.forEach((url, uIdx) => {
        list.push({
          itemId,
          itemName,
          url,
          index: uIdx + 1,
          total: urls.length
        });
      });
    });

    return list;
  }, [inspection, metadata.tipo]);

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
      const headerTitle = getReportHeaderTitle(metadata.tipo?.nombre || inspection.tipoNombre, metadata.tipo?.codigo || inspection.tipoCodigo);
      const message = `Estimados,\n\nSe ha generado el ${headerTitle}: ${refCode}.\n\n📄 Archivo: ${fileName}\n\n(Nota: El documento PDF corporativo se ha descargado a su dispositivo, por favor adjúntelo a esta conversación).\n\nAtentamente,\nControl Técnico SSA Duncan.`;

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

  const handleDirectPlanPDF = () => {
    try {
      const items = generatePlanesAccionFromInspeccion(inspection);
      exportActionPlanToPDF(inspection, items, {
        empresaNombre: metadata?.empresa?.nombre,
        localidadNombre: metadata?.localidad?.nombre,
        establecimientoNombre: metadata?.establecimiento?.nombre,
        tipoNombre: metadata?.tipo?.nombre,
        tipoCodigo: metadata?.tipo?.codigo,
      });
      toast.success("¡Plan de Acción en PDF Editable descargado!");
    } catch (e) {
      console.error(e);
      toast.error("Error al exportar Plan de Acción a PDF");
    }
  };

  const handleDirectPlanExcel = async () => {
    try {
      const items = generatePlanesAccionFromInspeccion(inspection);
      await exportActionPlanToExcel(inspection, items, {
        empresaNombre: metadata?.empresa?.nombre,
        localidadNombre: metadata?.localidad?.nombre,
        establecimientoNombre: metadata?.establecimiento?.nombre,
        tipoNombre: metadata?.tipo?.nombre,
        tipoCodigo: metadata?.tipo?.codigo,
      });
      toast.success("¡Plan de Acción en Excel Oficial (.xlsx) descargado!");
    } catch (e) {
      console.error(e);
      toast.error("Error al exportar Plan de Acción a Excel");
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
          {((scoreResult?.noConformes ?? 0) > 0 || (scoreResult?.observaciones ?? 0) > 0) && (
            <div className="flex items-center gap-1 ml-1 bg-amber-50 p-1 rounded-lg border border-amber-300">
              <button
                onClick={handleDirectPlanPDF}
                disabled={exporting}
                className="flex items-center gap-1 px-2.5 py-1.5 text-rose-800 bg-white hover:bg-rose-50 border border-rose-200 rounded font-bold text-xs shadow-2xs transition-all disabled:opacity-50 touch-active cursor-pointer"
                title="Descargar Plan de Acción en PDF Editable e Interactivo"
              >
                <FileText size={14} className="text-rose-600" />
                <span>Plan PDF</span>
              </button>
              <button
                onClick={handleDirectPlanExcel}
                disabled={exporting}
                className="flex items-center gap-1 px-2.5 py-1.5 text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200 rounded font-bold text-xs shadow-2xs transition-all disabled:opacity-50 touch-active cursor-pointer"
                title="Descargar Plan de Acción en Excel Oficial (.xlsx)"
              >
                <FileSpreadsheet size={14} className="text-emerald-600" />
                <span>Plan Excel</span>
              </button>
              <button
                onClick={() => setShowActionPlanModal(true)}
                disabled={exporting}
                className="flex items-center gap-1 px-3 py-1.5 text-amber-950 bg-amber-200 hover:bg-amber-300 rounded font-black text-xs shadow-xs transition-all disabled:opacity-50 touch-active cursor-pointer"
                title="Ver y enviar Plan de Acción derivado de esta inspección por correo"
              >
                <ClipboardList size={14} className="text-amber-800" />
                <span>Ver Plan ({((scoreResult?.noConformes ?? 0) + (scoreResult?.observaciones ?? 0))})</span>
              </button>
            </div>
          )}
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
                  {metadata.empresa?.nombre || inspection.empresaNombre || 'Grupo Duncan'}
                </div>
                <div style={{ fontSize: '8.5px', color: '#475569', marginTop: '2px' }}>
                  Sistema de Gestión de Seguridad, Salud y Ambiente (SG-SSA)
                </div>
                <div style={{ fontSize: '9.5px', fontWeight: 'bold', color: '#1e40af', marginTop: '2px' }}>
                  {getReportHeaderTitle(metadata.tipo?.nombre || inspection.tipoNombre, metadata.tipo?.codigo || inspection.tipoCodigo)}
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
                <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{metadata.empresa?.nombre || inspection.empresaNombre || 'Grupo Duncan'}</td>
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
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#475569', borderRight: '1px solid #cbd5e1' }}>Resultado</td>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: (scoreResult?.resultado || inspection.resultado) === 'C' ? '#166534' : (scoreResult?.resultado || inspection.resultado) === 'NC' ? '#b91c1c' : '#c2410c', borderRight: '1px solid #cbd5e1' }}>
                  {(scoreResult?.resultado || inspection.resultado || 'C') === 'C' ? 'CONFORME (C)' : (scoreResult?.resultado || inspection.resultado) === 'OM' ? 'OPORTUNIDAD DE MEJORA (OM)' : 'NO CONFORME (NC)'}
                </td>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#475569', borderRight: '1px solid #cbd5e1' }}>Puntuación</td>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#1e40af', fontSize: '9px' }}>
                  {scoreResult ? scoreResult.puntuacion : (typeof inspection.puntuacion === 'number' ? inspection.puntuacion : 100)}%
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#475569', borderRight: '1px solid #cbd5e1' }}>Geolocalización GPS</td>
                <td colSpan={3} style={{ padding: '4px 8px' }}>
                  {resolvedCoords ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ color: '#0f172a' }}>📍 Lat: {resolvedCoords.lat.toFixed(6)}, Lng: {resolvedCoords.lng.toFixed(6)}</strong>
                      {resolvedCoords.accuracy && <span style={{ color: '#64748b' }}>(±{Math.round(resolvedCoords.accuracy)}m precisión)</span>}
                      {resolvedCoords.timestamp && <span style={{ color: '#94a3b8', fontSize: '7.5px' }}>[{new Date(resolvedCoords.timestamp).toLocaleTimeString('es-VE')}]</span>}
                      <a
                        href={resolvedCoords.mapUrl || `https://www.google.com/maps?q=${resolvedCoords.lat},${resolvedCoords.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#1e40af', fontWeight: 'bold', textDecoration: 'underline', marginLeft: '4px' }}
                      >
                        [Ver en Google Maps ↗]
                      </a>
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No geolocalizada con GPS en campo</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* CUADRO OFICIAL DE INDICADORES TÉCNICOS (SG-SSA) */}
          <div style={{ marginBottom: '14px', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#1e40af', color: '#ffffff', padding: '5px 10px', fontWeight: 'bold', fontSize: '8.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>CUADRO OFICIAL DE INDICADORES TÉCNICOS DE CUMPLIMIENTO (SG-SSA)</span>
              <span style={{ fontSize: '7.5px', opacity: 0.9 }}>OM = +0.5 PUNTOS POSITIVOS</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #cbd5e1', textAlign: 'center' }}>
                  <th style={{ padding: '5px 8px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '32%' }}>Indicador de Gestión</th>
                  <th style={{ padding: '5px 8px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '30%' }}>Criterio de Ponderación</th>
                  <th style={{ padding: '5px 8px', borderRight: '1px solid #e2e8f0', width: '19%' }}>Cantidad Absoluta</th>
                  <th style={{ padding: '5px 8px', width: '19%' }}>Porcentaje (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                  <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#166534', borderRight: '1px solid #e2e8f0' }}>✓ Conforme (C)</td>
                  <td style={{ padding: '4px 8px', color: '#475569', borderRight: '1px solid #e2e8f0' }}>1.0 punto positivo</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 'bold', color: '#166534', borderRight: '1px solid #e2e8f0' }}>{scoreResult?.conformes ?? 0}</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 'bold', color: '#166534' }}>{scoreResult?.porcentajeConforme ?? 0}%</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fefefe' }}>
                  <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#b91c1c', borderRight: '1px solid #e2e8f0' }}>✕ No Conforme (NC)</td>
                  <td style={{ padding: '4px 8px', color: '#475569', borderRight: '1px solid #e2e8f0' }}>0.0 puntos (No cumple)</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 'bold', color: '#b91c1c', borderRight: '1px solid #e2e8f0' }}>{scoreResult?.noConformes ?? 0}</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 'bold', color: '#b91c1c' }}>{scoreResult?.porcentajeNoConforme ?? 0}%</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fffbeb' }}>
                  <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#b45309', borderRight: '1px solid #e2e8f0' }}>▲ Oportunidad de Mejora (OM)</td>
                  <td style={{ padding: '4px 8px', color: '#92400e', borderRight: '1px solid #e2e8f0', fontWeight: 'bold' }}>+0.5 puntos positivos (Ponderación 50%)</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 'bold', color: '#b45309', borderRight: '1px solid #e2e8f0' }}>{scoreResult?.observaciones ?? 0}</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 'bold', color: '#b45309' }}>{scoreResult?.porcentajeOM ?? 0}%</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}>
                  <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>○ No Aplica (NA)</td>
                  <td style={{ padding: '4px 8px', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>Neutro (Excluido de la base)</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 'bold', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{scoreResult?.noAplica ?? 0}</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 'bold', color: '#64748b' }}>{scoreResult?.porcentajeNoAplica ?? 0}%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', color: '#1e293b' }}>
                  <td style={{ padding: '5px 8px', borderRight: '1px solid #e2e8f0' }}>
                    Total Evaluados: <span style={{ color: '#0f172a' }}>{scoreResult?.totalEvaluados ?? 0} Ítems</span>
                  </td>
                  <td style={{ padding: '5px 8px', borderRight: '1px solid #e2e8f0' }}>
                    Puntos Obtenidos: <span style={{ color: '#1e40af' }}>{scoreResult?.puntosObtenidos ?? 0} / {scoreResult?.totalEvaluados ?? 0}</span>
                  </td>
                  <td style={{ padding: '5px 8px', textAlign: 'center', color: '#1e40af', borderRight: '1px solid #e2e8f0' }}>
                    {scoreResult?.puntuacion ?? 0}%
                  </td>
                  <td style={{ padding: '5px 8px', textAlign: 'center', color: (scoreResult?.resultado || 'C') === 'C' ? '#166534' : (scoreResult?.resultado || 'C') === 'OM' ? '#b45309' : '#b91c1c' }}>
                    {(scoreResult?.resultado || 'C') === 'C' ? 'CONFORME' : (scoreResult?.resultado || 'C') === 'OM' ? 'OPORTUNIDAD DE MEJORA' : 'NO CONFORME'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

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
                      const rawVal = resolveItemResponse(parsedRespuestas, item);
                      const classification = classifyResponse(rawVal);
                      let displayVal = '—';
                      let color = '#334155';
                      if (classification === 'C') {
                        displayVal = 'C';
                        color = '#166534';
                      } else if (classification === 'NC') {
                        displayVal = 'NC';
                        color = '#b91c1c';
                      } else if (classification === 'OM') {
                        displayVal = 'OM';
                        color = '#c2410c';
                      } else if (classification === 'NA') {
                        displayVal = 'NA';
                        color = '#64748b';
                      } else if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
                        displayVal = String(rawVal);
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

          {/* BANNER / LLAMADO A ACCIÓN DE PLAN DE ACCIÓN DERIVADO */}
          {((scoreResult?.noConformes ?? 0) > 0 || (scoreResult?.observaciones ?? 0) > 0) && (
            <div style={{ marginBottom: "14px", border: '1.5px solid #f59e0b', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fffbeb' }}>
              <div style={{ backgroundColor: '#fef3c7', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fde68a' }}>
                <span style={{ fontWeight: 'bold', fontSize: '8.5px', color: '#92400e', textTransform: 'uppercase' }}>
                  ⚠️ PLAN DE ACCIÓN DERIVADO REQUERIDO ({((scoreResult?.noConformes ?? 0) + (scoreResult?.observaciones ?? 0))} DESVIACIONES REGISTRADAS)
                </span>
                <div className="flex items-center gap-1.5 print:hidden">
                  <button
                    type="button"
                    onClick={handleDirectPlanPDF}
                    style={{ fontSize: '8px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#dc2626', padding: '3px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    className="hover:bg-red-700 transition-colors"
                    title="Descargar Plan de Acción en PDF Editable"
                  >
                    📄 Descargar PDF
                  </button>
                  <button
                    type="button"
                    onClick={handleDirectPlanExcel}
                    style={{ fontSize: '8px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#059669', padding: '3px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    className="hover:bg-emerald-700 transition-colors"
                    title="Descargar Plan de Acción en Excel Oficial (.xlsx)"
                  >
                    📊 Descargar Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowActionPlanModal(true)}
                    style={{ fontSize: '8px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#d97706', padding: '3px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    className="hover:bg-amber-700 transition-colors"
                    title="Ver Plan interactivo y enviar por correo"
                  >
                    Abrir Plan & Correo ✉️
                  </button>
                </div>
              </div>
              <div style={{ padding: '8px 10px', fontSize: '8px', color: '#78350f', lineHeight: '1.4' }}>
                Esta inspección registró <strong>{scoreResult?.noConformes ?? 0} No Conformidades (NC)</strong> y <strong>{scoreResult?.observaciones ?? 0} Oportunidades de Mejora (OM)</strong>. Se ha generado la matriz oficial de plan de acción para subsanación perentoria en campo con base legal COVENIN / LOPCYMAT.
              </div>
            </div>
          )}

          {/* EVIDENCIA FOTOGRÁFICA Y DETALLES GRÁFICOS */}
          {resolvedPhotosList.length > 0 && (
            <div style={{ marginBottom: "14px", border: '1px solid #cbd5e1', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', fontWeight: 'bold', fontSize: '8.5px', color: '#1e293b', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>REGISTRO FOTOGRÁFICO Y EVIDENCIAS DE CAMPO ({resolvedPhotosList.length} FOTOGRAFÍAS)</span>
                <span style={{ fontSize: '7.5px', color: '#64748b' }}>EVIDENCIA TÉCNICA CERTIFICADA</span>
              </div>
              <div style={{ padding: "8px", backgroundColor: "#fff", display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                {resolvedPhotosList.map((photoItem, i) => (
                  <div key={i} style={{ width: '47%', border: '1px solid #e2e8f0', padding: '6px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                    <div style={{ marginBottom: '4px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '7.5px', fontWeight: 'bold', color: '#1e40af', backgroundColor: '#dbeafe', padding: '1px 4px', borderRadius: '2px' }}>
                        Ítem {photoItem.itemId}
                      </span>
                      {photoItem.total > 1 && (
                        <span style={{ fontSize: '7px', fontWeight: 'bold', color: '#475569' }}>
                          Foto {photoItem.index} de {photoItem.total}
                        </span>
                      )}
                    </div>
                    <img 
                      src={photoItem.url} 
                      alt={`Evidencia ${photoItem.itemId}-${photoItem.index}`} 
                      style={{ maxWidth: '100%', maxHeight: '180px', width: 'auto', height: 'auto', margin: '0 auto', display: 'block', borderRadius: '2px', objectFit: 'contain' }} 
                    />
                    <div style={{ fontSize: '7.5px', marginTop: '4px', fontWeight: 'bold', color: '#334155', lineHeight: '1.2' }}>
                      {photoItem.itemName.replace(/^\d+\.\d+\s+¿?/, '').replace(/\?$/, '')}
                    </div>
                  </div>
                ))}
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
        {/* MODAL DE PLAN DE ACCIÓN INSTITUCIONAL */}
        {showActionPlanModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in print:p-0 print:bg-white">
            <div className="w-full max-w-5xl my-auto">
              <ActionPlanDocument
                inspeccion={inspection}
                metadata={metadata}
                onClose={() => setShowActionPlanModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
