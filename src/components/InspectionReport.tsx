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
  return '/logo.png';
};

const MontacargasTemplate = ({ inspection, metadata }: { inspection: Inspeccion, metadata: any }) => {
  const d = new Date(inspection.fecha);
  const months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  const dateStr = `${months[d.getMonth()]} - ${d.getFullYear()}`;

  const allItems: any[] = [];
  metadata.tipo?.secciones.forEach((sec: any) => {
    if (sec.id !== 'i_datos_montacargas' && sec.id !== 'i_firmas') {
      sec.items.forEach((it: any) => allItems.push(it));
    }
  });

  let cantBueno = 0;
  let cantMalo = 0;
  let cantNA = 0;
  
  const formattedItems = allItems.map((item: any) => {
    const rawResponse = inspection.respuestas?.[item.id] || "N/A";
    const val = String(rawResponse).toUpperCase();
    const isPositive = ["C", "SI", "BUENO", "OPERATIVO", "OK", "CONFORME", "EXISTE"].includes(val);
    const isNegative = ["NC", "NO", "DANADO", "MALO", "DETERIORADO", "NO OPERATIVO", "CRITICO", "NO_EXISTE", "DESACTUALIZADO"].includes(val);
    const isNA = ["N/A", "NA"].includes(val);

    if (isPositive) cantBueno++;
    else if (isNegative) cantMalo++;
    else if (isNA) cantNA++;

    return {
      id: item.id,
      pregunta: item.pregunta,
      respuesta: isPositive ? "Bueno" : isNegative ? val : isNA ? "N/A" : val
    };
  });
  
  const conformity = (cantBueno + cantMalo) > 0 ? Math.round((cantBueno / (cantBueno + cantMalo)) * 100) : 100;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: "10.5px", lineHeight: "1.2", padding: "10px", background: "#fff", color: "#000" }}>
      {/* Header Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: '2px', pageBreakInside: 'avoid' }}>
        <tbody>
          <tr>
            <td style={{ width: '25%', borderRight: '2px solid #000', borderBottom: '2px solid #000', padding: '10px', textAlign: 'center', backgroundColor: '#fff' }}>
              <img src={getCompanyLogo(metadata)} alt={metadata?.empresa?.nombre || "Duncan"} style={{ maxHeight: '40px', maxWidth: '100%', width: 'auto', height: 'auto', display: 'block', margin: '0 auto' }} />
            </td>
            <td colSpan={2} style={{ borderBottom: '2px solid #000', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>Programa de Seguridad y Salud en el Trabajo</div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>Inspección de Montacargas</div>
            </td>
          </tr>
          <tr>
            <td style={{ borderRight: '2px solid #000', borderBottom: '2px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>Código</td>
            <td style={{ borderRight: '2px solid #000', borderBottom: '2px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>Departamento emisor</td>
            <td style={{ borderBottom: '2px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>N° Revisión:</td>
          </tr>
          <tr>
            <td style={{ borderRight: '2px solid #000', padding: '6px', textAlign: 'center' }}></td>
            <td style={{ borderRight: '2px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>Departamento de Seguridad y Salud Laboral (SSA)</td>
            <td style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>0</td>
          </tr>
        </tbody>
      </table>

      {/* Detalle Inspeccion */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4px', pageBreakInside: 'avoid' }}>
        <tbody>
          <tr>
            <td colSpan={2} style={{ border: '2px solid #000', backgroundColor: '#e5e7eb', textAlign: 'center', fontWeight: 'bold', padding: '6px' }}>
              DETALLE DE INSPECCIÓN DE MONTACARGAS
            </td>
          </tr>
          <tr style={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
            <td style={{ border: '2px solid #000', width: '20%', textAlign: 'center', padding: '6px' }}>Id</td>
            <td style={{ border: '2px solid #000', width: '80%', textAlign: 'center', padding: '6px' }}>EMPRESA - LOCALIDAD - ESTABLECIMIENTO - FECHA</td>
          </tr>
          <tr>
            <td style={{ border: '2px solid #000', textAlign: 'center', padding: '6px' }}>{inspection.id.substring(0, 5).toUpperCase()}</td>
            <td style={{ border: '2px solid #000', textAlign: 'center', padding: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {metadata.empresa?.nombre || 'DUNCAN, C.A.'} - {metadata.localidad?.nombre || 'CARACAS'} - {metadata.establecimiento?.nombre || 'LOS RUICES'} - {dateStr}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Resumen de Conformidad */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', pageBreakInside: 'avoid' }}>
        <table style={{ width: '75%', borderCollapse: 'collapse', border: '2px solid #000' }}>
          <thead>
            <tr>
              <th colSpan={5} style={{ borderBottom: '2px solid #000', padding: '6px', backgroundColor: '#e5e7eb', textAlign: 'center' }}>Resumen Númerico de Conformidad</th>
            </tr>
            <tr style={{ backgroundColor: '#fff', fontSize: '11px' }}>
              <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Máxima puntuación</th>
              <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Cantidad<br/>Bueno</th>
              <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Cantidad<br/>Dañado</th>
              <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>Cantidad No<br/>aplica</th>
              <th className="whitespace-nowrap" style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', whiteSpace: 'nowrap' }}>CONFORMIDAD</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{cantBueno + cantMalo}</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{cantBueno}</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{cantMalo}</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{cantNA}</td>
              <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: conformity >= 80 ? '#10b981' : conformity >= 60 ? '#f59e0b' : '#ef4444', color: '#000' }}>{conformity}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Identificacion del equipo */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: '8px', pageBreakInside: 'avoid' }}>
        <thead>
          <tr>
            <th colSpan={5} style={{ borderBottom: '2px solid #000', padding: '6px 8px', backgroundColor: '#e5e7eb', textAlign: 'left', fontSize: '12px' }}>Información y Datos del Montacargas</th>
          </tr>
          <tr style={{ backgroundColor: '#f9fafb', fontSize: '11px' }}>
            <th style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center', width: '20%' }}>Ubicación</th>
            <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', width: '20%' }}>Equipo Número</th>
            <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', width: '20%' }}>Marca</th>
            <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', width: '20%' }}>Modelo</th>
            <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', width: '20%' }}>Serial Número</th>
          </tr>
        </thead>
        <tbody style={{ textAlign: 'center', fontSize: '11px' }}>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{inspection.respuestas?.['m_ubicacion'] || metadata.establecimiento?.nombre || 'N/A'}</td>
            <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{inspection.respuestas?.['m_equipo_num'] || 'N/A'}</td>
            <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{inspection.respuestas?.['m_marca'] || 'N/A'}</td>
            <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{inspection.respuestas?.['m_modelo'] || 'N/A'}</td>
            <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{inspection.respuestas?.['m_serial'] || 'N/A'}</td>
          </tr>
        </tbody>
      </table>

      {/* Check list */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: '8px' }}>
        <thead>
          <tr style={{ backgroundColor: '#e5e7eb', fontSize: '12px' }}>
            <th style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left', width: '75%' }}>Condiciones de Operación y Funcionamiento del Montacargas</th>
            <th className="whitespace-nowrap" style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', width: '25%', whiteSpace: 'nowrap' }}>CONFORMIDAD - SITUACIÓN</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: '11px' }}>
          {formattedItems.map((item, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb', pageBreakInside: 'avoid' }}>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                  <span>{item.pregunta.replace(/^\d+\.\d+\s+¿?/, '').replace(/\?$/, '')}</span>
                  {inspection.fotos?.[item.id] && (
                    <Camera size={12} style={{ color: '#004B93', flexShrink: 0 }} />
                  )}
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{item.respuesta}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Observaciones */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: '8px', pageBreakInside: 'avoid' }}>
        <tbody>
          <tr style={{ backgroundColor: '#e5e7eb' }}>
            <td style={{ border: '1px solid #000', padding: '6px 8px', fontSize: '12px', fontWeight: 'bold' }}>Observaciones</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', minHeight: '40px', whiteSpace: 'pre-wrap', fontSize: '11px' }}>
              {inspection.observaciones || ' '}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Evidencia Fotográfica */}
      {inspection.fotos && Object.keys(inspection.fotos).length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: '8px', pageBreakInside: 'avoid' }}>
          <tbody>
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontSize: '12px', fontWeight: 'bold' }}>Registro Fotográfico (Detalles)</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '10px 8px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                  {Object.entries(inspection.fotos).map(([fotoId, url], i) => {
                    const itemName = allItems.find(it => it.id === fotoId)?.pregunta || fotoId;
                    return (
                      <div key={i} style={{ width: '45%', border: '1px solid #ddd', padding: '6px', textAlign: 'center', backgroundColor: '#f8fafc', pageBreakInside: 'avoid' }}>
                        <img src={url} alt={`Evidencia ${i + 1}`} style={{ maxWidth: '100%', maxHeight: '180px', width: 'auto', height: 'auto', margin: '0 auto', display: 'block' }} />
                        <div style={{ fontSize: '10px', marginTop: '6px', fontWeight: 'bold', color: '#333' }}>{itemName.replace(/^\d+\.\d+\s+¿?/, '').replace(/\?$/, '')}</div>
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Firmas */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: '8px', pageBreakInside: 'avoid' }}>
        <tbody>
          <tr style={{ backgroundColor: '#e5e7eb' }}>
            <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>Personal que realizó la Inspección</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', width: '50%', padding: '6px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>Realizada por:</td>
            <td style={{ border: '1px solid #000', width: '50%', padding: '6px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>Revisado por:</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>
              <div style={{ height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '6px' }}>
                {inspection.firmas?.inspector && <img src={inspection.firmas.inspector} alt="Firma" style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto' }} />}
              </div>
              <div style={{ borderTop: '1px solid #000', width: '80%', margin: '0 auto', paddingTop: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                {inspection.respuestas?.['f_realizado'] || (inspection.firmas?.inspector ? 'Firma Registrada' : (inspection.inspectorId || inspection.inspector || 'INSP').substring(0,8))}
              </div>
            </td>
            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>
              <div style={{ height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '6px' }}>
                {inspection.firmas?.revisor && <img src={inspection.firmas.revisor} alt="Firma" style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto' }} />}
              </div>
              <div style={{ borderTop: '1px solid #000', width: '80%', margin: '0 auto', paddingTop: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                {inspection.respuestas?.['f_revisado'] || ' '}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      {/* Footer corporativo generico */}
      <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between", fontSize: "8px", color: "#000", fontWeight: "900", textTransform: 'uppercase' }}>
        <span>Documento Generado por Sistema SGD</span>
        <span>Desarrollado por ERGOEXPRESS, C.A. - RIF: J-50251246-2</span>
      </div>
    </div>
  );
};

const itemMetaMap: Record<string, { ley: string; grupo: string; area: string }> = {
  // Iluminación
  'il_1_1': { ley: 'COVENIN 2249:1993 (Iluminancias en tareas y áreas de trabajo).', grupo: 'INFRA', area: 'VENTAS' },
  'il_1_2': { ley: 'RCHST Art. 126; COVENIN 2249:1993.', grupo: 'INFRA', area: 'VENTAS' },
  'il_1_3': { ley: 'RCHST (Reglamento de las Condiciones de Higiene y Seguridad).', grupo: 'INFRA', area: 'VENTAS' },

  // Ventilación
  've_2_1': { ley: 'RCHST Cap. III; COVENIN 2254:1995 (Calor y Frío).', grupo: 'INFRA', area: 'VENTAS' },
  've_2_2': { ley: 'COVENIN 2254:1995; RCHST Art. 109-110.', grupo: 'INFRA', area: 'VENTAS' },

  // Avisos o Señalizaciones
  'av_3_1': { ley: 'Resolución Min. Salud 030; LOPCYMAT Art. 53.', grupo: 'LEGAL', area: 'VENTAS/SSA' },
  'av_3_2': { ley: 'LOTTT; Constitución RBV.', grupo: 'LEGAL', area: 'VENTAS' },
  'av_3_3': { ley: 'Ley para el Desarme y Control de Armas y Municiones.', grupo: 'LEGAL', area: 'VENTAS/SSA' },
  'av_3_4': { ley: 'COVENIN 2226:1990 (Plan de Emergencias).', grupo: 'LEGAL', area: 'VENTAS/SSA' },
  'av_3_5': { ley: 'LOPCYMAT Art. 53 Num. 1; NT-04-2023.', grupo: 'LEGAL', area: 'VENTAS/SSA' },
  'av_3_6': { ley: 'COVENIN 810:1998; COVENIN 187:1992.', grupo: 'LEGAL', area: 'VENTAS/SSA' },
  'av_3_7': { ley: 'COVENIN 187:1992; NFPA 704.', grupo: 'LEGAL', area: 'VENTAS/SSA' },
  'av_3_8': { ley: 'COVENIN 187:1992 (Punto 12, Nota 2); COVENIN 1040.', grupo: 'LEGAL', area: 'VENTAS/SSA' },
  'av_3_9': { ley: 'COVENIN 3060:2002 (Materiales Peligrosos); Normas ONU.', grupo: 'LEGAL', area: 'VENTAS/SSA' },
  'av_3_10': { ley: 'NFPA 704; COVENIN 3060:2002.', grupo: 'LEGAL', area: 'VENTAS' },
  'av_3_11': { ley: 'COVENIN 3060:2002; NFPA 704; Ley Sust. Materiales Peligrosos.', grupo: 'LEGAL', area: 'VENTAS/SSA' },
  'av_3_12': { ley: 'COVENIN 187:1992; RCHST.', grupo: 'LEGAL', area: 'VENTAS' },

  // Almacenamiento
  'al_4_1': { ley: 'COVENIN 2248:1987 (Manejo de Materiales); RCHST.', grupo: 'INFRA', area: 'VENTAS/OPERACIONES' },
  'al_4_2': { ley: 'RCHST Art. 12; Normas de Ingeniería Civil.', grupo: 'INFRA', area: 'VENTAS/OPERACIONES' },
  'al_4_3': { ley: 'RCHST; Normas de seguridad estructural.', grupo: 'INFRA', area: 'VENTAS/OPERACIONES' },
  'al_4_4': { ley: 'Ley sobre Sustancias, Materiales y Desechos Peligrosos (Art. 32).', grupo: 'INFRA', area: 'VENTAS/OPERACIONES' },
  'al_4_5': { ley: 'Ley sobre Sustancias, Materiales y Desechos Peligrosos; RCHST.', grupo: 'INFRA', area: 'VENTAS/OPERACIONES' },
  'al_4_6': { ley: 'RCHST; COVENIN 2248.', grupo: 'INFRA', area: 'VENTAS' },
  'al_4_7': { ley: 'Ley de Aguas; Ley Penal del Ambiente.', grupo: 'INFRA', area: 'VENTAS' },
  'al_4_8': { ley: 'RCHST Art. 54; Norma NT-04-2023.', grupo: 'SSA', area: 'VENTAS/OPERACIONES' },

  // Herramientas y Equipos
  'he_5_1': { ley: 'RCHST Art. 54.', grupo: 'SSA', area: 'VENTAS/SSA' },
  'he_5_2': { ley: 'RCHST Título VI.', grupo: 'SSA', area: 'VENTAS' },
  'he_5_3': { ley: 'Ley sobre Sustancias, Materiales y Desechos Peligrosos.', grupo: 'INFRA', area: 'VENTAS/OPERACIONES' },
  'he_5_4': { ley: 'Decreto 2635 (Manejo de desechos peligrosos).', grupo: 'SSA', area: 'OPERACIONES' },
  'he_5_5': { ley: 'COVENIN 2248:1987.', grupo: 'SSA', area: 'VENTAS' },

  // Sistema de Extinción y Detección
  'ex_6_1': { ley: 'COVENIN 1040:2006; COVENIN 187.', grupo: 'SSA', area: 'VENTAS/SSA' },
  'ex_6_2': { ley: 'COVENIN 1213:1998 (Punto 4.1).', grupo: 'SSA', area: 'VENTAS' },
  'ex_6_3': { ley: 'COVENIN 1213:1998 (Punto 4.3).', grupo: 'SSA', area: 'VENTAS/SSA' },
  'ex_6_4': { ley: 'COVENIN 1040:2006 (Punto 5.8.4).', grupo: 'SSA', area: 'VENTAS/SSA' },
  'ex_6_5': { ley: 'COVENIN 1376; RCHST.', grupo: 'SSA', area: 'VENTAS' },
  'ex_6_6': { ley: 'COVENIN 1376; COVENIN 1041.', grupo: 'SSA', area: 'VENTAS/SSA' },
  'ex_6_7': { ley: 'COVENIN 1110.', grupo: 'SSA', area: 'VENTAS' },
  'ex_6_8': { ley: 'COVENIN 758; COVENIN 1376.', grupo: 'SSA', area: 'VENTAS' },
  'ex_6_9': { ley: 'COVENIN 1331:2001 (Extinción fija).', grupo: 'SSA', area: 'VENTAS' },
  'ex_6_10': { ley: 'COVENIN 1331; NFPA 20.', grupo: 'SSA', area: 'VENTAS/SSA' },
  'ex_6_11': { ley: 'COVENIN 1331:2001.', grupo: 'SSA', area: 'VENTAS' },
  'ex_6_12': { ley: 'COVENIN 1331:2001.', grupo: 'SSA', area: 'VENTAS/SSA' },

  // Atención de Emergencias
  'em_7_1': { ley: 'COVENIN 2226:1990 (Punto 5.1); COVENIN 823-2.', grupo: 'SSA', area: 'VENTAS/SSA' },
  'em_7_2': { ley: 'COVENIN 3478:1999; COVENIN 823-2 (Punto 4.3.1).', grupo: 'SSA', area: 'VENTAS/SSA' },
  'em_7_3': { ley: 'COVENIN 3478:1999 (Punto 4.1.2).', grupo: 'SSA', area: 'VENTAS' },
  'em_7_4': { ley: 'COVENIN 2226:1990 (Punto 5.1.3).', grupo: 'SSA', area: 'VENTAS' },
  'em_7_5': { ley: 'COVENIN 810:1998 (Medios de Escape, Punto 5).', grupo: 'INFRA', area: 'VENTAS/OPERACIONES' },
  'em_7_6': { ley: 'COVENIN 810:1998.', grupo: 'INFRA', area: 'VENTAS/OPERACIONES' },
  'em_7_7': { ley: 'COVENIN 1040:2006.', grupo: 'SSA', area: 'VENTAS/SSA' },
  'em_7_8': { ley: 'COVENIN 187:1992.', grupo: 'INFRA', area: 'VENTAS' },

  // Instalaciones del Local
  'in_8_1': { ley: 'LOPCYMAT (Ergonomía); Norma Técnica NT-01-2008 (Ref. Ergonomía).', grupo: 'INFRA', area: 'VENTAS/OPERACIONES' },
  'in_8_2': { ley: 'RCHST Art. 54.', grupo: 'SSA', area: 'VENTAS' },
  'in_8_3': { ley: 'Código Eléctrico Nacional (CEN); RCHST.', grupo: 'INFRA', area: 'VENTAS/OPERACIONES' },
  'in_8_4': { ley: 'Código Eléctrico Nacional; RCHST Art. 312.', grupo: 'INFRA', area: 'VENTAS/OPERACIONES' },
  'in_8_5': { ley: 'RCHST.', grupo: 'INFRA', area: 'VENTAS' },
  'in_8_6': { ley: 'RCHST Art. 67.', grupo: 'INFRA', area: 'VENTAS' },
  'in_8_7': { ley: 'RCHST.', grupo: 'INFRA', area: 'VENTAS' },
  'in_8_8': { ley: 'RCHST Art. 76.', grupo: 'INFRA', area: 'VENTAS' },
  'in_8_9': { ley: 'RCHST Art. 73.', grupo: 'INFRA', area: 'VENTAS' },
  'in_8_10': { ley: 'RCHST Art. 76.', grupo: 'SSA', area: 'VENTAS' },
  'in_8_11': { ley: 'RCHST Art. 79-80.', grupo: 'SSA', area: 'VENTAS' },
  'in_8_12': { ley: 'RCHST Art. 76.', grupo: 'SSA', area: 'VENTAS/OPERACIONES' },
  'in_8_13': { ley: 'RCHST.', grupo: 'SSA', area: 'VENTAS' },
  'in_8_14': { ley: 'LOPCYMAT Art. 59; RCHST Art. 83.', grupo: 'INFRA', area: 'VENTAS' },
  'in_8_15': { ley: 'RCHST Art. 83.', grupo: 'SSA', area: 'VENTAS' },
  'in_8_16': { ley: 'RCHST Art. 84.', grupo: 'INFRA', area: 'VENTAS' },
  'in_8_17': { ley: 'RCHST Art. 85.', grupo: 'INFRA', area: 'VENTAS/OPERACIONES' },
  'in_8_18': { ley: 'RCHST Art. 88.', grupo: 'SSA', area: 'VENTAS' },
  'in_8_19': { ley: 'RCHST Art. 70.', grupo: 'SSA', area: 'VENTAS' },
  'in_8_20': { ley: 'RCHST Art. 71.', grupo: 'SSA', area: 'VENTAS' },
  'in_8_21': { ley: 'RCHST Art. 72.', grupo: 'SSA', area: 'VENTAS' },
  'in_8_22': { ley: 'RCHST Art. 68.', grupo: 'INFRA', area: 'VENTAS' },
  'in_8_23': { ley: 'RCHST Art. 9.', grupo: 'INFRA', area: 'VENTAS' },
  'in_8_24': { ley: 'RCHST Art. 9.', grupo: 'INFRA', area: 'VENTAS' },
  'in_8_25': { ley: 'RCHST Art. 13.', grupo: 'INFRA', area: 'VENTAS' },
  'in_8_26': { ley: 'RCHST Art. 17.', grupo: 'INFRA', area: 'VENTAS' },
  'in_8_27': { ley: 'RCHST Art. 54.', grupo: 'SSA', area: 'VENTAS' },
  'in_8_28': { ley: 'COVENIN 187; RCHST.', grupo: 'INFRA', area: 'VENTAS' },

  // Equipos de Protección Colectiva
  'ep_9_1': { ley: 'COVENIN 1056-1:1991; COVENIN 1056-2.', grupo: 'SSA', area: 'VENTAS/OPERACIONES' },
  'ep_9_2': { ley: 'COVENIN 1056.', grupo: 'SSA', area: 'VENTAS' },
  'ep_9_3': { ley: 'COVENIN 1056.', grupo: 'SSA', area: 'VENTAS/OPERACIONES' },
  'ep_9_4': { ley: 'COVENIN 3478:1999.', grupo: 'SSA', area: 'VENTAS' },
  'ep_9_5': { ley: 'COVENIN 3478:1999 (Tabla de contenido).', grupo: 'SSA', area: 'VENTAS/OPERACIONES' },
  'ep_9_6': { ley: 'Ley Sustancias Peligrosas; Normas MATPEL.', grupo: 'SSA', area: 'VENTAS/OPERACIONES' },

  // Uniforme y Equipo de Protección Personal
  'up_10_1': { ley: 'LOPCYMAT Art. 53; COVENIN 2237:1989.', grupo: 'SSA', area: 'VENTAS/OPERACIONES' },
  'up_10_2': { ley: 'LOPCYMAT Art. 53; COVENIN 2237.', grupo: 'SSA', area: 'VENTAS' },
  'up_10_3': { ley: 'LOPCYMAT Art. 53; COVENIN 2237:1989.', grupo: 'SSA', area: 'VENTAS/OPERACIONES' },

  // Cartelera
  'ca_11_1': { ley: 'Norma Técnica NT-04-2023 (Anterior NT-01-2008).', grupo: 'SSA', area: 'VENTAS/OPERACIONES' },
  'ca_11_2': { ley: 'COVENIN 3059:2006 (FDS); LOPCYMAT.', grupo: 'SSA', area: 'VENTAS' },
  'ca_11_3': { ley: 'COVENIN 823-2:1997.', grupo: 'SSA', area: 'VENTAS' },
  'ca_11_4': { ley: 'Ley Cuerpo de Bomberos.', grupo: 'SSA', area: 'VENTAS' },
  'ca_11_5': { ley: 'Ley Cuerpo de Bomberos.', grupo: 'SSA', area: 'VENTAS' },
  'ca_11_6': { ley: 'NT-04-2023 (Numeral 2.6.1); Norma COVENIN 474.', grupo: 'SSA', area: 'VENTAS/OPERACIONES' },
  'ca_11_7': { ley: 'NT-04-2023 (Numeral 2.6.1).', grupo: 'SSA', area: 'VENTAS' },
  'ca_11_8': { ley: 'COVENIN 810; NT-04-2023.', grupo: 'SSA', area: 'VENTAS' },

  // Gestión
  'gs_12_1': { ley: 'COVENIN 823:1997 (Punto 4.5.3).', grupo: 'SSA', area: 'VENTAS' },
  'gs_12_2': { ley: 'COVENIN 1213.', grupo: 'SSA', area: 'VENTAS' },
  'gs_12_3': { ley: 'Programa de SST (NT-04-2023).', grupo: 'SSA', area: 'VENTAS' },
  'gs_12_4': { ley: 'RCHST; NT-04-2023.', grupo: 'SSA', area: 'VENTAS' },
  'gs_12_5': { ley: 'COVENIN 1376.', grupo: 'SSA', area: 'VENTAS' },
  'gs_12_6': { ley: 'NT-04-2023; COVENIN 1110.', grupo: 'SSA', area: 'VENTAS' },
  'gs_12_7': { ley: 'NT-04-2023; Gestión MATPEL.', grupo: 'SSA', area: 'VENTAS' },
  'gs_12_8': { ley: 'COVENIN 1056; NT-04-2023.', grupo: 'SSA', area: 'VENTAS' },
  'gs_12_9': { ley: 'LOPCYMAT Art. 41.', grupo: 'SSA', area: 'VENTAS' },
  'gs_12_10': { ley: 'LOPCYMAT Art. 46.', grupo: 'SSA', area: 'VENTAS' },
  'gs_12_11': { ley: 'RLOPCYMAT Art. 76.', grupo: 'SSA', area: 'VENTAS' },
  'gs_12_12': { ley: 'RLOPCYMAT Art. 77.', grupo: 'SSA', area: 'VENTAS' },
  'gs_12_13': { ley: 'RLOPCYMAT Art. 77.', grupo: 'SSA', area: 'VENTAS/SSA' },
  'gs_12_14': { ley: 'RLOPCYMAT Art. 34; NT-04-2023.', grupo: 'SSA', area: 'VENTAS/SSA' },
  'gs_12_15': { ley: 'LOPCYMAT Art. 53 (Interpretación INPSASEL).', grupo: 'SSA', area: 'VENTAS/SSA' },
  'gs_12_16': { ley: 'LOPCYMAT Art. 61; NT-04-2023.', grupo: 'SSA', area: 'VENTAS' },
  'gs_12_17': { ley: 'LOPCYMAT Art. 39; Norma Técnica Servicios SST.', grupo: 'SSA', area: 'VENTAS/SSA' },
  'gs_12_18': { ley: 'Ley Sobre Sustancias, Materiales y Desechos Peligrosos.', grupo: 'LEGAL', area: 'VENTAS/SSA' },
  'gs_12_19': { ley: 'Ley Orgánica del Ambiente.', grupo: 'LEGAL', area: 'VENTAS/SSA' },
  'gs_12_20': { ley: 'Ley Sobre Sustancias, Materiales y Desechos Peligrosos.', grupo: 'LEGAL', area: 'VENTAS/SSA' },

  // Expedientes
  'ec_13_1': { ley: 'RLOPCYMAT Art. 27; LOPCYMAT.', grupo: 'LEGAL', area: 'VENTAS' },
  'ec_13_2': { ley: 'LOPCYMAT Art. 69.', grupo: 'LEGAL', area: 'VENTAS' },
  'ec_13_3': { ley: 'NT-04-2023.', grupo: 'LEGAL', area: 'VENTAS' },
  'ec_13_4': { ley: 'Norma Técnica NG-SST-004.', grupo: 'LEGAL', area: 'VENTAS/SSA' },
  'ec_13_5': { ley: 'LOPCYMAT Art. 56.', grupo: 'LEGAL', area: 'VENTAS' },
  'ec_13_6': { ley: 'NT-04-2023.', grupo: 'LEGAL', area: 'VENTAS' },
  'ec_13_7': { ley: 'Ley Sobre Sustancias Peligrosas (Vigencia RACDA).', grupo: 'LEGAL', area: 'VENTAS/SSA' },
  'ec_13_8': { ley: 'NT-04-2023.', grupo: 'LEGAL', area: 'VENTAS' },
  'ec_13_9': { ley: 'Ley de Transporte Terrestre / ISO 39001 (Ref).', grupo: 'LEGAL', area: 'VENTAS/SSA' },
  'ec_13_10': { ley: 'LOPCYMAT Art. 56.', grupo: 'LEGAL', area: 'VENTAS/SSA' },

  // Hoja Seguimiento
  'hs_14_1': { ley: 'Ley Sobre Sustancias y Desechos Peligrosos.', grupo: 'LEGAL', area: 'VENTAS/OPERACIONES' },
  'hs_14_2': { ley: 'Normativa Ambiental Vigente.', grupo: 'LEGAL', area: 'VENTAS/OPERACIONES' },
  'hs_14_3': { ley: 'Ley Sobre Sustancias y Desechos Peligrosos.', grupo: 'LEGAL', area: 'VENTAS/OPERACIONES' },
  'hs_14_4': { ley: 'Normativa Ambiental Vigente.', grupo: 'LEGAL', area: 'VENTAS/OPERACIONES' },
  'hs_14_5': { ley: 'Ley Sobre Sustancias y Desechos Peligrosos.', grupo: 'LEGAL', area: 'VENTAS/OPERACIONES' },

  // Montacargas
  'mo_15_1': { ley: 'COVENIN 3177:1995.', grupo: 'VEHCP', area: 'OPERACIONES' },
  'mo_15_2': { ley: 'COVENIN 3177; COVENIN 1040.', grupo: 'VEHCP', area: 'OPERACIONES' },
  'mo_15_3': { ley: 'COVENIN 3177.', grupo: 'VEHCP', area: 'OPERACIONES' },
  'mo_15_4': { ley: 'RCHST; COVENIN 3177.', grupo: 'VEHCP', area: 'OPERACIONES' },
  'mo_15_5': { ley: 'COVENIN 3177.', grupo: 'VEHCP', area: 'OPERACIONES' },
  'mo_15_6': { ley: 'COVENIN 3177.', grupo: 'VEHCP', area: 'OPERACIONES' },
  'mo_15_7': { ley: 'COVENIN 3177.', grupo: 'VEHCP', area: 'OPERACIONES' },
  'mo_15_8': { ley: 'COVENIN 3177.', grupo: 'VEHCP', area: 'OPERACIONES' },
  'mo_15_9': { ley: 'COVENIN 3177.', grupo: 'VEHCP', area: 'OPERACIONES' },
  'mo_15_10': { ley: 'Ley de Transporte Terrestre.', grupo: 'VEHCP', area: 'OPERACIONES' },
  'mo_15_11': { ley: 'Ley de Transporte Terrestre.', grupo: 'VEHCP', area: 'OPERACIONES' },
  'mo_15_12': { ley: 'COVENIN 3331:2000 (Art. 5.2.1).', grupo: 'VEHCP', area: 'OPERACIONES' },
  'mo_15_13': { ley: 'LOPCYMAT (Formación); COVENIN 3177.', grupo: 'VEHCP', area: 'OPERACIONES' },

  // Almacenamiento - Cilindros
  'ac_16_1': { ley: 'RCHST Art. 5.2; COVENIN 3017.', grupo: 'INFRA', area: 'OPERACIONES' },
  'ac_16_2': { ley: 'RCHST Art. 6.1; COVENIN 3017:2000 (<15° incl).', grupo: 'INFRA', area: 'OPERACIONES/SSA' },
  'ac_16_3': { ley: 'RCHST Art. 6.2; COVENIN 3017.', grupo: 'INFRA', area: 'OPERACIONES' },
  'ac_16_4': { ley: 'RCHST Art. 6.3.', grupo: 'INFRA', area: 'OPERACIONES' },
  'ac_16_5': { ley: 'RCHST Art. 7.1.', grupo: 'INFRA', area: 'OPERACIONES' },
  'ac_16_6': { ley: 'RCHST Art. 4.3.', grupo: 'INFRA', area: 'OPERACIONES' },
  'ac_16_7': { ley: 'COVENIN 3017:2000 (Art. 6.3).', grupo: 'INFRA', area: 'OPERACIONES' },

  // Almacenamiento - Tanques
  'at_17_1': { ley: 'COVENIN 2842:1991 (Art. 5.1.3).', grupo: 'INFRA', area: 'OPERACIONES' },
  'at_17_2': { ley: 'COVENIN 2842:1991 (Art. 5.1.2).', grupo: 'INFRA', area: 'OPERACIONES' },
  'at_17_3': { ley: 'COVENIN 2842:1991 (Art. 5.5.3).', grupo: 'INFRA', area: 'OPERACIONES' },
  'at_17_4': { ley: 'COVENIN 2842:1991; RCHST Art. 55.', grupo: 'INFRA', area: 'OPERACIONES' },
  'at_17_5': { ley: 'RCHST Art. 60.', grupo: 'INFRA', area: 'OPERACIONES' },
  'at_17_6': { ley: 'COVENIN 2842:1991 (Art. 5.2.1).', grupo: 'INFRA', area: 'OPERACIONES' },
  'at_17_7': { ley: 'COVENIN 2842:1991 (Art. 5.3.2).', grupo: 'INFRA', area: 'OPERACIONES' },
  'at_17_8': { ley: 'COVENIN 2842:1991 (Art. 5.6.2); RCHST Art. 60.', grupo: 'INFRA', area: 'OPERACIONES/SSA' },
  'at_17_9': { ley: 'COVENIN 829:2024.', grupo: 'INFRA', area: 'OPERACIONES' },

  // Flota
  'fl_18_1': { ley: 'Ley de Transporte Terrestre; ISO 39001 (Ref).', grupo: 'VEHCP', area: 'VENTAS/OPERACIONES' },
  'fl_18_2': { ley: 'Norma Técnica NG-SST-17.', grupo: 'VEHCP', area: 'VENTAS' },
  'fl_18_3': { ley: 'COVENIN 614:1997.', grupo: 'VEHCP', area: 'VENTAS' },
  'fl_18_4': { ley: 'COVENIN 614:1997.', grupo: 'VEHCP', area: 'VENTAS' },
  'fl_18_5': { ley: 'Ley de Transporte Terrestre; COVENIN 614.', grupo: 'VEHCP', area: 'VENTAS/OPERACIONES' },
  'fl_18_6': { ley: 'Norma COVENIN 2500 (Mantenimiento).', grupo: 'VEHCP', area: 'VENTAS/OPERACIONES' },
  'fl_18_7': { ley: 'Ley Sustancias Peligrosas.', grupo: 'VEHCP', area: 'VENTAS' },
  'fl_18_8': { ley: 'Ley Sustancias Peligrosas.', grupo: 'VEHCP', area: 'VENTAS' },
  'fl_18_9': { ley: 'Ley Sustancias Peligrosas; Normas Covenin/ONU.', grupo: 'VEHCP', area: 'VENTAS/OPERACIONES' },
  'fl_18_10': { ley: 'Ley de Transporte Terrestre; RACDA.', grupo: 'VEHCP', area: 'VENTAS' },
  'fl_18_11': { ley: 'Ley de Transporte Terrestre Art. 104; COVENIN.', grupo: 'VEHCP', area: 'VENTAS/OPERACIONES' },
  'fl_18_12': { ley: 'Ley de Transporte Terrestre.', grupo: 'VEHCP', area: 'VENTAS' },
  'fl_18_13': { ley: 'Ley de Transporte Terrestre Art. 132.', grupo: 'VEHCP', area: 'VENTAS' },
  'fl_18_14': { ley: 'Ley de Transporte Terrestre.', grupo: 'VEHCP', area: 'VENTAS/OPERACIONES' }
};

const ExtintoresTemplate = ({ inspection, metadata }: { inspection: Inspeccion, metadata: any }) => {
  const sections = metadata.tipo?.secciones || [];
  const sec1 = sections.find((s: any) => s.id.includes('informacion') || s.titulo.toLowerCase().includes('información') || s.id.includes('identificacion')) || sections[0];
  const sec2 = sections.find((s: any) => s.id.includes('condiciones') || s.titulo.toLowerCase().includes('condiciones')) || sections[1];
  const sec3 = sections.find((s: any) => s.id.includes('observaciones') || s.titulo.toLowerCase().includes('observaciones')) || sections[2];
  const sec4 = sections.find((s: any) => s.id.includes('personal') || s.titulo.toLowerCase().includes('personal')) || sections[3];

  const getCompanyLogoLocal = (metadata: any) => {
    const nombre = metadata?.empresa?.nombre?.toLowerCase() || "";
    if (nombre.includes('duncan')) {
      return '/logo-duncan.png';
    } else if (nombre.includes('ergoexpress')) {
      return '/logo-ergoexpress.png';
    }
    return '/logo.png';
  };

  const getMonthYearSpanish = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
      return `${months[d.getMonth()]} - ${d.getFullYear()}`;
    } catch (e) {
      return "FEBRERO - 2026";
    }
  };

  const getDisplayStatus = (val: string, pregunta: string) => {
    const v = val.toUpperCase().trim();
    const lowerPreg = pregunta.toLowerCase();
    
    if (lowerPreg.includes("operatividad")) {
      if (["C", "SI", "BUENO", "OPERATIVO", "OK", "CONFORME"].includes(v)) return "Operativo";
      if (["NC", "NO", "DANADO", "MALO", "DETERIORADO", "NO OPERATIVO"].includes(v)) return "No Operativo";
      return val;
    }
    
    if (lowerPreg.includes("acción requerida") || lowerPreg.includes("accion requerida")) {
      if (["NINGUNA", "NINGUNO", "N/A", "NA", "NO", "SIN ACCIÓN"].includes(v)) return "Ninguna";
      if (["MANTENIMIENTO", "MANT"].includes(v)) return "Mantenimiento";
      if (["RECARGA"].includes(v)) return "Recarga";
      return val;
    }

    if (["C", "SI", "BUENO", "OPERATIVO", "OK", "CONFORME", "EXISTE"].includes(v)) {
      return "Bueno";
    }
    if (["NC", "NO", "DANADO", "MALO", "DETERIORADO", "NO_EXISTE", "CRITICO"].includes(v)) {
      return "Dañado";
    }
    if (["N/A", "NA"].includes(v)) {
      return "N/A";
    }
    return val;
  };

  const getValByPreguntaPart = (part: string) => {
    const item = sec1?.items?.find((it: any) => it.pregunta.toLowerCase().includes(part.toLowerCase()));
    if (item) {
      return String(inspection.respuestas?.[item.id] || "N/A");
    }
    return "N/A";
  };

  const ubicacion = getValByPreguntaPart("ubicación") !== "N/A" ? getValByPreguntaPart("ubicación") : (getValByPreguntaPart("ubicacion") !== "N/A" ? getValByPreguntaPart("ubicacion") : "N/A");
  const vencimiento = getValByPreguntaPart("vencimiento") !== "N/A" ? getValByPreguntaPart("vencimiento") : "N/A";
  const agente = getValByPreguntaPart("agente") !== "N/A" ? getValByPreguntaPart("agente") : "N/A";
  const capacidad = getValByPreguntaPart("capacidad") !== "N/A" ? getValByPreguntaPart("capacidad") : "N/A";
  const fechaInspeccion = formatDate(inspection.fecha);

  let cantBueno = 0;
  let cantDañado = 0;
  let cantNoAplica = 0;

  const complianceItems = sec2?.items?.filter((item: any) => {
    const qLower = item.pregunta.toLowerCase();
    return !qLower.includes("operatividad") && !qLower.includes("acción") && !qLower.includes("accion");
  }) || [];

  complianceItems.forEach((item: any) => {
    const val = String(inspection.respuestas?.[item.id] || "N/A").toUpperCase().trim();
    const status = getDisplayStatus(val, item.pregunta);
    if (status === "Bueno") {
      cantBueno++;
    } else if (status === "Dañado") {
      cantDañado++;
    } else if (status === "N/A" || ["N/A", "NA"].includes(val)) {
      cantNoAplica++;
    } else {
      cantBueno++;
    }
  });

  const maxPuntuacion = complianceItems.length - cantNoAplica;
  const conformidadPerc = maxPuntuacion > 0 ? Math.round((cantBueno / maxPuntuacion) * 100) : 100;

  const getRealizadoPor = () => {
    const item = sec4?.items?.find((it: any) => it.pregunta.toLowerCase().includes('realizado') || it.pregunta.toLowerCase().includes('inspector'));
    if (item) return String(inspection.respuestas?.[item.id] || inspection.inspectorId || inspection.inspector || 'Inspector SSA');
    return inspection.inspectorId || inspection.inspector || 'Inspector SSA';
  };

  const getRevisadoPor = () => {
    const item = sec4?.items?.find((it: any) => it.pregunta.toLowerCase().includes('revisado') || it.pregunta.toLowerCase().includes('revisor') || it.pregunta.toLowerCase().includes('validado'));
    if (item) return String(inspection.respuestas?.[item.id] || "Firma Digital");
    return "Firma Digital";
  };

  return (
    <div className="pdf-snap-container is-extintores" style={{ fontFamily: "Arial, sans-serif", width: '100%', boxSizing: 'border-box', background: '#ffffff', color: '#000000', padding: '0 5px' }}>
      
      {/* HEADER SECTION */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000000', marginBottom: '8px', tableLayout: 'fixed' }}>
        <tbody>
          <tr>
            <td rowSpan={2} style={{ width: '25%', borderRight: '1.5px solid #000000', borderBottom: '1.5px solid #000000', padding: '2px', textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#ffffff' }}>
              <img src={getCompanyLogoLocal(metadata)} alt={metadata?.empresa?.nombre || "Duncan"} style={{ maxHeight: '35px', maxWidth: '100%', width: 'auto', height: 'auto', display: 'block', margin: '0 auto', objectFit: 'contain' }} />
            </td>
            <td rowSpan={2} style={{ width: '50%', borderRight: '1.5px solid #000000', borderBottom: '1.5px solid #000000', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#000000' }}>Programa de Seguridad y Salud en el Trabajo</div>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#000000', marginTop: '4px', textTransform: 'uppercase' }}>INSPECCIÓN DE EXTINTORES PORTÁTILES</div>
            </td>
            <td style={{ width: '12.5%', borderRight: '1.5px solid #000000', borderBottom: '1.5px solid #000000', padding: '4px', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f3f4f6', color: '#000000', verticalAlign: 'middle' }}>Código</td>
            <td style={{ width: '12.5%', borderBottom: '1.5px solid #000000', padding: '4px', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f3f4f6', color: '#000000', verticalAlign: 'middle' }}>N° Revisión</td>
          </tr>
          <tr>
            <td style={{ borderRight: '1.5px solid #000000', borderBottom: '1.5px solid #000000', padding: '4px', fontSize: '9px', textAlign: 'center', fontWeight: 'bold', color: '#000000', verticalAlign: 'middle' }}>IEP</td>
            <td style={{ borderBottom: '1.5px solid #000000', padding: '4px', fontSize: '9px', textAlign: 'center', fontWeight: 'bold', color: '#000000', verticalAlign: 'middle' }}>0</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ borderRight: '1.5px solid #000000', padding: '4px', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f3f4f6', color: '#000000', verticalAlign: 'middle' }}>Departamento emisor</td>
            <td colSpan={2} style={{ padding: '4px', fontSize: '9px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#ffffff', color: '#000000', verticalAlign: 'middle' }}>Departamento de Seguridad y Salud Laboral (SSA)</td>
          </tr>
        </tbody>
      </table>

      {/* DETALLE BAR */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000000', marginBottom: '8px' }}>
        <tbody>
          <tr>
            <td style={{ backgroundColor: '#f3f4f6', color: '#000000', textAlign: 'center', fontWeight: 'bold', padding: '6px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              DETALLE DE INSPECCIÓN DE EXTINTORES PORTÁTILES
            </td>
          </tr>
        </tbody>
      </table>

      {/* SECTION 1: EMPRESA - LOCALIDAD - ESTABLECIMIENTO - FECHA */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000000', marginBottom: '8px', fontSize: '9px', textAlign: 'center', tableLayout: 'fixed' }}>
        <tbody>
          <tr style={{ backgroundColor: '#f3f4f6', fontWeight: 'bold', color: '#000000' }}>
            <td style={{ width: '20%', borderRight: '1.5px solid #000000', borderBottom: '1.5px solid #000000', padding: '4px', verticalAlign: 'middle' }}>Id</td>
            <td style={{ width: '80%', borderBottom: '1.5px solid #000000', padding: '4px' , verticalAlign: 'middle' }}>EMPRESA - LOCALIDAD - ESTABLECIMIENTO - FECHA</td>
          </tr>
          <tr style={{ fontWeight: 'bold', color: '#000000' }}>
            <td style={{ borderRight: '1.5px solid #000000', padding: '4px', verticalAlign: 'middle' }}>{inspection.referencia || inspection.id.substring(0, 8).toUpperCase()}</td>
            <td style={{ padding: '4px', textTransform: 'uppercase' , verticalAlign: 'middle' }}>
              {metadata.empresa?.nombre || 'DISTRIBUIDORA DUNCAN, C.A.'} - {metadata.localidad?.nombre || 'CARACAS'} - {metadata.establecimiento?.nombre || 'LAS ACACIAS'} - {getMonthYearSpanish(inspection.fecha)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* SECTION 2: RESUMEN NUMÉRICO DE CONFORMIDAD */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000000', marginBottom: '8px', fontSize: '9px', textAlign: 'center', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', color: '#000000' }}>
            <th colSpan={5} style={{ borderBottom: '1.5px solid #000000', padding: '4px', fontWeight: 'bold', fontSize: '9px' , verticalAlign: 'middle' }}>RESUMEN NUMÉRICO DE CONFORMIDAD</th>
          </tr>
          <tr style={{ backgroundColor: '#ffffff', fontWeight: 'bold', color: '#000000' }}>
            <th style={{ borderRight: '1.5px solid #000000', borderBottom: '1.5px solid #000000', padding: '4px', width: '20%' , verticalAlign: 'middle', textTransform: 'uppercase' }}>MÁXIMA PUNTUACIÓN</th>
            <th style={{ borderRight: '1.5px solid #000000', borderBottom: '1.5px solid #000000', padding: '4px', width: '20%' , verticalAlign: 'middle', textTransform: 'uppercase' }}>CANTIDAD BUENO</th>
            <th style={{ borderRight: '1.5px solid #000000', borderBottom: '1.5px solid #000000', padding: '4px', width: '20%' , verticalAlign: 'middle', textTransform: 'uppercase' }}>CANTIDAD DAÑADO</th>
            <th style={{ borderRight: '1.5px solid #000000', borderBottom: '1.5px solid #000000', padding: '4px', width: '20%' , verticalAlign: 'middle', textTransform: 'uppercase' }}>CANTIDAD NO APLICA</th>
            <th style={{ borderBottom: '1.5px solid #000000', padding: '4px', width: '20%' , verticalAlign: 'middle', textTransform: 'uppercase', backgroundColor: '#e2e8f0' }}>CONFORMIDAD</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ fontWeight: 'bold', color: '#000000' }}>
            <td style={{ borderRight: '1.5px solid #000000', padding: '6px 4px', fontSize: '10px' , verticalAlign: 'middle' }}>{maxPuntuacion}</td>
            <td style={{ borderRight: '1.5px solid #000000', padding: '6px 4px', fontSize: '10px' , verticalAlign: 'middle' }}>{cantBueno}</td>
            <td style={{ borderRight: '1.5px solid #000000', padding: '6px 4px', fontSize: '10px' , verticalAlign: 'middle' }}>{cantDañado}</td>
            <td style={{ borderRight: '1.5px solid #000000', padding: '6px 4px', fontSize: '10px' , verticalAlign: 'middle' }}>{cantNoAplica}</td>
            <td style={{ padding: '6px 4px', fontSize: '10px', backgroundColor: '#10b981', color: '#ffffff', fontWeight: '900', textAlign: 'center' , verticalAlign: 'middle' }}>
              {conformidadPerc}%
            </td>
          </tr>
        </tbody>
      </table>

      {/* SECTION 3: INFORMACIÓN Y DATOS DEL EXTINTOR */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000000', marginBottom: '8px', fontSize: '9px', textAlign: 'center', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', color: '#000000' }}>
            <th colSpan={5} style={{ borderBottom: '1.5px solid #000000', padding: '4px', fontWeight: 'bold', fontSize: '9px' , verticalAlign: 'middle' }}>Información y Datos del Extintor Portátil</th>
          </tr>
          <tr style={{ backgroundColor: '#ffffff', fontWeight: 'bold', borderBottom: '1.5px solid #000000', color: '#000000' }}>
            <th style={{ borderRight: '1.5px solid #000000', padding: '4px', width: '20%' , verticalAlign: 'middle', textTransform: 'uppercase' }}>Ubicación</th>
            <th style={{ borderRight: '1.5px solid #000000', padding: '4px', width: '20%' , verticalAlign: 'middle', textTransform: 'uppercase' }}>Fecha de Inspección</th>
            <th style={{ borderRight: '1.5px solid #000000', padding: '4px', width: '20%' , verticalAlign: 'middle', textTransform: 'uppercase' }}>Fecha de Vencimiento</th>
            <th style={{ borderRight: '1.5px solid #000000', padding: '4px', width: '20%' , verticalAlign: 'middle', textTransform: 'uppercase' }}>Agente Extinguidor</th>
            <th style={{ padding: '4px', width: '20%' , verticalAlign: 'middle', textTransform: 'uppercase' }}>Capacidad</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ fontWeight: 'bold', color: '#000000' }}>
            <td style={{ borderRight: '1.5px solid #000000', padding: '6px 4px', textTransform: 'uppercase' , verticalAlign: 'middle' }}>{ubicacion}</td>
            <td style={{ borderRight: '1.5px solid #000000', padding: '6px 4px' , verticalAlign: 'middle' }}>{fechaInspeccion}</td>
            <td style={{ borderRight: '1.5px solid #000000', padding: '6px 4px' , verticalAlign: 'middle' }}>{vencimiento}</td>
            <td style={{ borderRight: '1.5px solid #000000', padding: '6px 4px', textTransform: 'uppercase' , verticalAlign: 'middle' }}>{agente}</td>
            <td style={{ padding: '6px 4px', textTransform: 'uppercase' , verticalAlign: 'middle' }}>{capacidad}</td>
          </tr>
        </tbody>
      </table>

      {/* SECTION 4: CONDICIONES Y DATOS DEL EXTINTOR INSPECCIONADO */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000000', marginBottom: '8px', fontSize: '9px', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', fontWeight: 'bold', borderBottom: '1.5px solid #000000', color: '#000000' }}>
            <th style={{ borderRight: '1.5px solid #000000', padding: '4px', textAlign: 'center', width: '75%' , verticalAlign: 'middle', textTransform: 'uppercase' }}>CONDICIONES Y DATOS DEL EXTINTOR INSPECCIONADO</th>
            <th style={{ padding: '4px', textAlign: 'center', width: '25%' , verticalAlign: 'middle', textTransform: 'uppercase' }}>CONFORMIDAD SITUACIÓN</th>
          </tr>
        </thead>
        <tbody>
          {sec2?.items?.map((item: any) => {
            const rawResponse = inspection.respuestas?.[item.id] || "N/A";
            const displayVal = getDisplayStatus(rawResponse, item.pregunta);

            return (
              <tr key={item.id} style={{ borderBottom: '1.5px solid #000000' }}>
                <td style={{ borderRight: '1.5px solid #000000', padding: '2px 4px', color: '#000000', fontSize: '9px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {inspection.fotos?.[item.id] && (
                      <span style={{ marginRight: '6px' }}>📷</span>
                    )}
                    <span>{item.pregunta}</span>
                  </div>
                </td>
                <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: '9px', verticalAlign: 'middle', fontWeight: 'bold' }}>
                  {displayVal}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* SECTION 5: OBSERVACIONES */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000000', marginBottom: '8px', fontSize: '9px' }}>
        <thead>
          <tr style={{ backgroundColor: '#ffffff', color: '#000000' }}>
            <th style={{ borderBottom: '1.5px solid #000000', padding: '4px', fontWeight: 'bold', fontSize: '9px', textAlign: 'left', paddingLeft: '8px' }}>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px', fontSize: '9px', minHeight: '40px', color: '#000000', whiteSpace: 'pre-wrap', verticalAlign: 'top' }}>
              {inspection.observaciones || " "}
            </td>
          </tr>
        </tbody>
      </table>

      {/* SECTION 6: PERSONAL QUE REALIZÓ LA INSPECCIÓN */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000000', marginBottom: '8px', textAlign: 'center', fontSize: '9px', pageBreakInside: 'avoid', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', color: '#000000' }}>
            <th colSpan={2} style={{ borderBottom: '1.5px solid #000000', padding: '4px', fontWeight: 'bold', fontSize: '9px', verticalAlign: 'middle' }}>Personal que realizó la Inspección</th>
          </tr>
          <tr style={{ fontWeight: 'bold', borderBottom: '1.5px solid #000000', color: '#000000', backgroundColor: '#ffffff' }}>
            <th style={{ width: '50%', padding: '4px', borderRight: '1.5px solid #000000' , verticalAlign: 'middle' }}>Realizada por:</th>
            <th style={{ width: '50%', padding: '4px' , verticalAlign: 'middle' }}>Revisado por:</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ borderRight: '1.5px solid #000000', padding: '4px', verticalAlign: 'middle' }}>
              <div style={{ height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                {inspection.firmas?.inspector ? (
                  <img
                    src={inspection.firmas.inspector}
                    alt="Firma Inspector"
                    style={{ maxHeight: '45px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                ) : <div style={{ height: '30px', borderBottom: '1px solid #000000', width: '120px', margin: '0 auto', marginTop: '10px' }} />}
              </div>
              <div style={{ fontWeight: 'bold', color: '#000000', fontSize: '9px', borderTop: '1px solid #000000', width: '80%', margin: '0 auto', paddingTop: '4px' }}>
                {getRealizadoPor()}
              </div>
            </td>
            <td style={{ padding: '4px', verticalAlign: 'middle' }}>
              <div style={{ height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                {inspection.firmas?.revisor ? (
                  <img
                    src={inspection.firmas.revisor}
                    alt="Firma Revisor"
                    style={{ maxHeight: '45px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                ) : <div style={{ height: '30px', borderBottom: '1px solid #000000', width: '120px', margin: '0 auto', marginTop: '10px' }} />}
              </div>
              <div style={{ fontWeight: 'bold', color: '#000000', fontSize: '9px', borderTop: '1px solid #000000', width: '80%', margin: '0 auto', paddingTop: '4px' }}>
                {getRevisadoPor()}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* FOOTER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', fontWeight: 'bold', color: '#475569', pageBreakInside: 'avoid', marginTop: '10px' }}>
        <span>REGISTRO ERP: IEP-SST-090</span>
        <span>Página 1 de {inspection.fotos && Object.keys(inspection.fotos).length > 0 ? '2' : '1'}</span>
        <span>GENERADO POR SISTEMA SGD-DUNCAN</span>
      </div>

      {/* PAGE 2: REGISTRO FOTOGRÁFICO DE EVIDENCIAS */}
      {inspection.fotos && Object.keys(inspection.fotos).length > 0 && (
        <div style={{ pageBreakBefore: 'always', paddingTop: '10px' }}>
          
          {/* Page 2 Header Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000000', marginBottom: '8px', tableLayout: 'fixed' }}>
            <tbody>
              <tr>
                <td rowSpan={2} style={{ width: '25%', borderRight: '1.5px solid #000000', padding: '4px', textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#ffffff' }}>
                  <img src={getCompanyLogoLocal(metadata)} alt={metadata?.empresa?.nombre || "Duncan"} style={{ maxHeight: '35px', maxWidth: '100%', width: 'auto', height: 'auto', display: 'block', margin: '0 auto', objectFit: 'contain' }} />
                </td>
                <td rowSpan={2} style={{ width: '50%', borderRight: '1.5px solid #000000', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#000000', lineHeight: '1.2' }}>ANEXO DE EVIDENCIAS FOTOGRÁFICAS</div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#000000', marginTop: '3px' }}>REGISTRO FOTOGRÁFICO DE INSPECCIÓN</div>
                </td>
                <td style={{ width: '25%', padding: '4px', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f3f4f6', color: '#000000', borderBottom: '1.5px solid #000000' , verticalAlign: 'middle' }}>ID TRANS:</td>
              </tr>
              <tr>
                <td style={{ padding: '4px', fontSize: '9px', textAlign: 'center', fontWeight: 'bold', color: '#000000' , verticalAlign: 'middle' }}>{inspection.referencia || inspection.id.substring(0, 8).toUpperCase()}</td>
              </tr>
            </tbody>
          </table>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000000', marginBottom: '8px' }}>
            <tbody>
              <tr>
                <td style={{ backgroundColor: '#f3f4f6', color: '#000000', textAlign: 'center', fontWeight: 'bold', padding: '6px', fontSize: '9px', textTransform: 'uppercase' }}>
                  ANEXO B: REGISTRO FOTOGRÁFICO DE EVIDENCIAS DE CAMPO
                </td>
              </tr>
            </tbody>
          </table>

          {/* Photos Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {Object.entries(inspection.fotos).map(([itemId, fotoUrl]) => {
              const item = sec2?.items?.find((it: any) => it.id === itemId) || sec1?.items?.find((it: any) => it.id === itemId);
              const label = item ? item.pregunta : "Evidencia de inspección";
              return (
                <div key={itemId} style={{ border: '1.5px solid #000000', backgroundColor: '#ffffff', padding: '4px', pageBreakInside: 'avoid', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img 
                    src={fotoUrl} 
                    alt={label} 
                    style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain', display: 'block', marginBottom: '4px', border: '0.5px solid #cbd5e1' }} 
                    referrerPolicy="no-referrer"
                  />
                  <div style={{ fontSize: '9px', fontWeight: 'bold', textAlign: 'center', color: '#000000', textTransform: 'uppercase' }}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer for Page 2 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', fontWeight: 'bold', color: '#475569', marginTop: '10px' }}>
            <span>REGISTRO ERP: IEP-SST-090</span>
            <span>Página 2 de 2</span>
            <span>GENERADO POR SISTEMA SGD-DUNCAN</span>
          </div>
        </div>
      )}
    </div>
  );
};
const DistribuidorasTemplate = ({ inspection, metadata }: { inspection: Inspeccion, metadata: any }) => {
  const d = new Date(inspection.fecha);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear());
  const dateStr = `${day}-${month}-${year}`;

  const allSections = metadata.tipo?.secciones || [];
  
  // Extraer ronda y fecha de cierre si están en s_info
  const ronda = inspection.respuestas?.['i_ronda'] || "01";
  const fechaCierreRaw = inspection.respuestas?.['i_fecha_cierre'] || inspection.fecha;
  const fechaCierre = formatDate(fechaCierreRaw);

  const checklistSections = allSections.filter((sec: any) => 
    sec.id !== 's_info' && sec.id !== 's_firmas' && sec.id !== 's_conclusiones'
  );

  // Math variables for the CATEGORIES
  const categories = ['INFRA', 'LEGAL', 'SSA', 'VEHCP'];
  const counts: Record<string, { total: number; conforme: number; noConforme: number; om: number; na: number }> = {};
  categories.forEach(cat => {
    counts[cat] = { total: 0, conforme: 0, noConforme: 0, om: 0, na: 0 };
  });

  checklistSections.forEach((sec: any) => {
    sec.items.forEach((item: any) => {
      if (item.tipoRespuesta === 'TEXT') return;
      
      const meta = itemMetaMap[item.id] || { grupo: 'SSA', ley: '', area: 'VENTAS' };
      const cat = meta.grupo;
      if (counts[cat]) {
        const rawResponse = inspection.respuestas?.[item.id] || "N/A";
        const val = String(rawResponse).toUpperCase();
        if (["C", "SI", "BUENO", "OPERATIVO", "OK", "CONFORME", "EXISTE"].includes(val)) {
          counts[cat].conforme++;
        } else if (["NC", "NO", "DANADO", "MALO", "DETERIORADO", "NO OPERATIVO", "CRITICO", "NO_EXISTE", "DESACTUALIZADO"].includes(val)) {
          counts[cat].noConforme++;
        } else if (["OM"].includes(val)) {
          counts[cat].om++;
        } else {
          counts[cat].na++;
        }
      }
    });
  });

  // Adjust total questions counts to fit the exact static quotas from the Spanish PDF:
  // INFRA = 49, LEGAL = 30, SSA = 67, VEHCP = 27 (Total = 173)
  const quotas: Record<string, number> = {
    'INFRA': 49,
    'LEGAL': 30,
    'SSA': 67,
    'VEHCP': 27
  };

  categories.forEach(cat => {
    const qTotal = quotas[cat] || 0;
    counts[cat].total = qTotal;
    const evaluated = counts[cat].conforme + counts[cat].noConforme + counts[cat].om;
    counts[cat].na = Math.max(0, qTotal - evaluated);
  });

  // Formulas for Category % and Weights
  const weights: Record<string, number> = {
    'INFRA': 22.5,
    'LEGAL': 22.5,
    'SSA': 30.0,
    'VEHCP': 25.0
  };

  const groupPercentages: Record<string, number> = {};
  const groupContributions: Record<string, number> = {};

  categories.forEach(cat => {
    const conf = counts[cat].conforme;
    const nonConf = counts[cat].noConforme;
    const om = counts[cat].om;
    const denom = conf + nonConf + om;
    const ratio = denom > 0 ? (conf / denom) : 1.0;
    groupPercentages[cat] = ratio * 100;
    groupContributions[cat] = ratio * (weights[cat] || 0);
  });

  const totalConforme = categories.reduce((sum, c) => sum + counts[c].conforme, 0);
  const totalNoConforme = categories.reduce((sum, c) => sum + counts[c].noConforme, 0);
  const totalOM = categories.reduce((sum, c) => sum + counts[c].om, 0);
  const totalNA = categories.reduce((sum, c) => sum + counts[c].na, 0);
  const totalWeight = categories.reduce((sum, c) => sum + weights[c], 0);
  const totalConformityPercentage = categories.reduce((sum, c) => sum + groupContributions[c], 0);

  const formatPercent = (val: number) => {
    return val.toFixed(1).replace('.', ',') + '%';
  };

  // Determine Level of Conformity and Color
  let conformityLevel = "MEDIO";
  let conformityBg = "#facc15";
  let conformityTextColor = "#000000";

  if (totalConformityPercentage >= 90) {
    conformityLevel = "ALTO";
    conformityBg = "#22c55e";
    conformityTextColor = "#ffffff";
  } else if (totalConformityPercentage < 70) {
    conformityLevel = "BAJO";
    conformityBg = "#ef4444";
    conformityTextColor = "#ffffff";
  }

  const verifyUrl = `${window.location.origin}/verify/inspection/${inspection.id}`;

  return (
    <div className="pdf-snap-container distribuidoras-pdf" style={{ fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif", fontSize: "8px", lineHeight: "1.3", padding: "10px", background: "#fff", color: "#000" }}>
      
      {/* PAGE 1: PORTADA & RESUMENES */}
      <div style={{ marginBottom: '4px' }}>
        {/* HEADER BLOCK */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '4px' }}>
          <tbody>
            <tr>
              <td style={{ width: '25%', borderRight: '1.5px solid #000', borderBottom: '1.5px solid #000', padding: '2px 4px', textAlign: 'center', verticalAlign: 'middle' , lineHeight: 1.2}}>
                <img src={getCompanyLogo(metadata)} style={{ maxHeight: '38px', maxWidth: '100%' }} />
              </td>
              <td style={{ width: '50%', borderRight: '1.5px solid #000', borderBottom: '1.5px solid #000', padding: '2px 4px', textAlign: 'center', verticalAlign: 'middle' , lineHeight: 1.2}}>
                <div style={{ fontWeight: 'bold', fontSize: '9px' }}>Programa de Seguridad y Salud en el Trabajo</div>
                <div style={{ fontWeight: 'bold', fontSize: '9.5px', marginTop: '2px' }}>Inspección de Distribuidoras</div>
              </td>
              <td style={{ width: '25%', borderBottom: '1.5px solid #000', padding: '2px 4px', textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#f3f4f6' , lineHeight: 1.2}}>
                <div style={{ fontSize: '8px', fontWeight: 'bold' }}>N° Revisión:</div>
                <div style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '4px' }}>0</div>
              </td>
            </tr>
            <tr>
              <td style={{ borderRight: '1.5px solid #000', padding: '2px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '8px', backgroundColor: '#f3f4f6' , verticalAlign: 'middle', lineHeight: 1.2}}>Código</td>
              <td style={{ borderRight: '1.5px solid #000', padding: '2px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '8px', backgroundColor: '#f3f4f6' , verticalAlign: 'middle', lineHeight: 1.2}}>Departamento emisor</td>
              <td style={{ padding: '2px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '8px', backgroundColor: '#f3f4f6' , verticalAlign: 'middle', lineHeight: 1.2}}>Estatus del Documento</td>
            </tr>
            <tr>
              <td style={{ borderRight: '1.5px solid #000', padding: '2px 4px', textAlign: 'center', fontSize: '8px' , verticalAlign: 'middle', lineHeight: 1.2}}>SST-DIS-F01</td>
              <td style={{ borderRight: '1.5px solid #000', padding: '2px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '8px' , verticalAlign: 'middle', lineHeight: 1.2}}>Departamento de Seguridad y Salud Laboral (SSA)</td>
              <td style={{ padding: '2px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '8px', color: '#16a34a' , verticalAlign: 'middle', lineHeight: 1.2}}>OFICIAL VIGENTE</td>
            </tr>
          </tbody>
        </table>

        {/* DETALLE BAR */}
        <div style={{ border: '1.5px solid #000', backgroundColor: '#f3f4f6', textAlign: 'center', fontWeight: 'bold', padding: '2px 4px', fontSize: '8px', marginBottom: '4px', textTransform: 'uppercase' }}>
          DETALLE DE INSPECCIÓN DE DISTRIBUIDORAS
        </div>

        {/* METADATA TABLE */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '4px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', fontSize: '8px', fontWeight: 'bold' }}>
              <td style={{ border: '1.5px solid #000', width: '10%', textAlign: 'center', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>Id</td>
              <td style={{ border: '1.5px solid #000', width: '90%', textAlign: 'center', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>EMPRESA - LOCALIDAD - ESTABLECIMIENTO - FECHA</td>
            </tr>
          </thead>
          <tbody>
            <tr style={{ fontSize: '8px' }}>
              <td style={{ border: '1.5px solid #000', textAlign: 'center', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{inspection.id.substring(0, 5).toUpperCase()}</td>
              <td style={{ border: '1.5px solid #000', textAlign: 'center', padding: '2px 4px', fontWeight: 'bold', textTransform: 'uppercase' , verticalAlign: 'middle', lineHeight: 1.2}}>
                {metadata.empresa?.nombre || 'ACUMULADORES DUNCAN C.A.'} - {metadata.localidad?.nombre || 'LOCALIDAD'} - {metadata.establecimiento?.nombre || 'ESTABLECIMIENTO'} - {dateStr}
              </td>
            </tr>
          </tbody>
        </table>

        {/* DETERMINACION DE LA CONFORMIDAD BAR */}
        <div style={{ border: '1.5px solid #000', backgroundColor: '#f3f4f6', textAlign: 'center', fontWeight: 'bold', padding: '2px 4px', fontSize: '8px', marginBottom: '4px', textTransform: 'uppercase' }}>
          RESUMEN NÚMERICO - DETERMINACIÓN DE LA CONFORMIDAD
        </div>

        {/* RESUMEN TABLE */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '4px', textAlign: 'center' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', fontSize: '8px', fontWeight: 'bold' }}>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>Ronda N°</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>Fecha de Inspección</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>Fecha de Cierre</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>Porcentaje Obtenido</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>Nivel de Conformidad</td>
            </tr>
          </thead>
          <tbody>
            <tr style={{ fontSize: '8px', fontWeight: 'bold' }}>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{ronda}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{formatDate(inspection.fecha)}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{fechaCierre}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{formatPercent(totalConformityPercentage)}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px', backgroundColor: conformityBg, color: conformityTextColor , verticalAlign: 'middle', lineHeight: 1.2}}>{conformityLevel}</td>
            </tr>
          </tbody>
        </table>

        {/* CLASES DE CONFORMIDAD TABLE */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '4px', textAlign: 'center', fontSize: '8px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', fontWeight: 'bold' }}>
              <td style={{ border: '1.5px solid #000', textAlign: 'left', padding: '2px 4px', fontSize: '8px', width: '40%' , verticalAlign: 'middle', lineHeight: 1.2}}>CLASES DE CONFORMIDAD</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px', width: '11%' , verticalAlign: 'middle', lineHeight: 1.2}}>INFRA</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px', width: '11%' , verticalAlign: 'middle', lineHeight: 1.2}}>LEGAL</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px', width: '11%' , verticalAlign: 'middle', lineHeight: 1.2}}>SSA</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px', width: '11%' , verticalAlign: 'middle', lineHeight: 1.2}}>VEHCP</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px', fontWeight: 'bold', width: '16%' , verticalAlign: 'middle', lineHeight: 1.2}}>TOTALES</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid #000', textAlign: 'left', padding: '2px 4px', fontWeight: 'bold' , verticalAlign: 'middle', lineHeight: 1.2}}>CANTIDAD DE PREGUNTAS</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>49</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>30</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>67</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>27</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px', fontWeight: 'bold' , verticalAlign: 'middle', lineHeight: 1.2}}>173</td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid #000', textAlign: 'left', padding: '2px 4px', fontWeight: 'bold' , verticalAlign: 'middle', lineHeight: 1.2}}>SUB TOTAL CONFORME</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['INFRA'].conforme}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['LEGAL'].conforme}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['SSA'].conforme}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['VEHCP'].conforme}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px', fontWeight: 'bold' , verticalAlign: 'middle', lineHeight: 1.2}}>{totalConforme}</td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid #000', textAlign: 'left', padding: '2px 4px', fontWeight: 'bold' , verticalAlign: 'middle', lineHeight: 1.2}}>SUB TOTAL NO CONFORME</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['INFRA'].noConforme}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['LEGAL'].noConforme}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['SSA'].noConforme}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['VEHCP'].noConforme}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px', fontWeight: 'bold' , verticalAlign: 'middle', lineHeight: 1.2}}>{totalNoConforme}</td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid #000', textAlign: 'left', padding: '2px 4px', fontWeight: 'bold' , verticalAlign: 'middle', lineHeight: 1.2}}>SUB TOTAL OPORTUNIDAD DE MEJORA</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['INFRA'].om}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['LEGAL'].om}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['SSA'].om}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['VEHCP'].om}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px', fontWeight: 'bold' , verticalAlign: 'middle', lineHeight: 1.2}}>{totalOM}</td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid #000', textAlign: 'left', padding: '2px 4px', fontWeight: 'bold' , verticalAlign: 'middle', lineHeight: 1.2}}>SUB TOTAL NO APLICA</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['INFRA'].na}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['LEGAL'].na}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['SSA'].na}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{counts['VEHCP'].na}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px', fontWeight: 'bold' , verticalAlign: 'middle', lineHeight: 1.2}}>{totalNA}</td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid #000', textAlign: 'left', padding: '2px 4px', fontWeight: 'bold' , verticalAlign: 'middle', lineHeight: 1.2}}>PESO O PORCENTAJE DE CADA GRUPO</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>22,5%</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>22,5%</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>30,0%</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>25,0%</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px', fontWeight: 'bold' , verticalAlign: 'middle', lineHeight: 1.2}}>100,0%</td>
            </tr>
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
              <td style={{ border: '1.5px solid #000', textAlign: 'left', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>PORCENTAJE DE CONFORMIDAD RONDA N° {ronda}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{formatPercent(groupContributions['INFRA'])}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{formatPercent(groupContributions['LEGAL'])}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{formatPercent(groupContributions['SSA'])}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>{formatPercent(groupContributions['VEHCP'])}</td>
              <td style={{ border: '1.5px solid #000', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#f3f4f6' , verticalAlign: 'middle', lineHeight: 1.2}}>{formatPercent(totalConformityPercentage)}</td>
            </tr>
          </tbody>
        </table>

        {/* CONFORMIDAD LEVELS, LEYENDA, & QR DIGITAL SIGNATURE - 3 COLUMNS */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', marginBottom: '4px' }}>
          {/* Column 1: Levels of conformity */}
          <div style={{ width: '38%', display: 'flex', flexDirection: 'column' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', fontSize: '7px', height: '100%' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'center', fontWeight: 'bold' }}>
                  <td className="whitespace-nowrap" style={{ border: '1.5px solid #000', padding: '2px 4px', width: '33%', whiteSpace: 'nowrap' , verticalAlign: 'middle', lineHeight: 1.2}}>Conformidad</td>
                  <td style={{ border: '1.5px solid #000', padding: '2px 4px', width: '34%' , verticalAlign: 'middle', lineHeight: 1.2}}>Valores de conformidad</td>
                  <td style={{ border: '1.5px solid #000', padding: '2px 4px', width: '33%' , verticalAlign: 'middle', lineHeight: 1.2}}>Nivel de Conformidad</td>
                </tr>
              </thead>
              <tbody>
                <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>Conforme</td>
                  <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>Mayor a 90%</td>
                  <td style={{ border: '1.5px solid #22c55e', padding: '2px 4px', backgroundColor: '#22c55e', color: '#fff' , verticalAlign: 'middle', lineHeight: 1.2}}>ALTO</td>
                </tr>
                <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>Oportunidad de Mejora</td>
                  <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>Entre 70% y 89%</td>
                  <td style={{ border: '1.5px solid #facc15', padding: '2px 4px', backgroundColor: '#facc15', color: '#000' , verticalAlign: 'middle', lineHeight: 1.2}}>MEDIO</td>
                </tr>
                <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>No Conforme</td>
                  <td style={{ border: '1.5px solid #000', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>Entre 0% y 69%</td>
                  <td style={{ border: '1.5px solid #ef4444', padding: '2px 4px', backgroundColor: '#ef4444', color: '#fff' , verticalAlign: 'middle', lineHeight: 1.2}}>BAJO</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Column 2: Legend */}
          <div style={{ width: '30%', display: 'flex', flexDirection: 'column' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', fontSize: '7px', height: '100%' }}>
              <tbody>
                <tr style={{ backgroundColor: '#f3f4f6', fontWeight: 'bold' }}>
                  <td style={{ padding: '2px 4px', borderBottom: '1.5px solid #000' , verticalAlign: 'middle', lineHeight: 1.2}}>LEYENDA</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 4px', lineHeight: '1.3' , verticalAlign: 'middle'}}>
                    <strong>C:</strong> Conforme; <strong>OM:</strong> Oportunidad de Mejora; <strong>NC:</strong> No Conforme; <strong>NA:</strong> No aplica; <strong>SSA:</strong> Seguridad; Salud, Ambiente; <strong>INFRA:</strong> Infraestructura
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Column 3: QR Digital Signature */}
          <div style={{ width: '32%', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #000', padding: '6px', backgroundColor: '#fafafa', gap: '8px', height: '100%', boxSizing: 'border-box' }}>
              <div style={{ border: '0.5px solid #aaa', padding: '2px', backgroundColor: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QRCodeSVG value={verifyUrl} size={32} level="L" />
              </div>
              <div>
                <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#004B93', lineHeight: '1.2' }}>REGISTRO DIGITAL (SGD DUNCAN)</div>
                <div style={{ fontSize: '5.8px', color: '#555', marginTop: '2px', lineHeight: '1.2' }}>
                  Reporte firmado digitalmente. Escanea para verificar validez.
                  <br/>
                  <strong>HASH:</strong> {inspection.id.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EVALUATION PAGES (SECTIONS 1 TO 18) */}
      {checklistSections.map((sec: any, sIdx: number) => {
        const checklistItems = sec.items.filter((it: any) => it.tipoRespuesta !== 'TEXT');
        const obsItems = sec.items.filter((it: any) => it.tipoRespuesta === 'TEXT');
        
        const obsResponses = obsItems
          .map((it: any) => inspection.respuestas?.[it.id])
          .filter(Boolean)
          .join('\n');

        // Compile non-compliant items as legal findings
        const nonCompliantItems = checklistItems.filter((it: any) => {
          const val = String(inspection.respuestas?.[it.id] || "N/A").toUpperCase();
          return ["NC", "NO", "DANADO", "MALO", "DETERIORADO", "NO OPERATIVO", "CRITICO", "NO_EXISTE", "DESACTUALIZADO", "OM"].includes(val);
        });

        let findingsText = "Sin hallazgos reguladores. Operación continua recomendada.";
        if (nonCompliantItems.length > 0) {
          findingsText = nonCompliantItems.map((it: any, idx: number) => {
            const val = String(inspection.respuestas?.[it.id] || "").toUpperCase();
            const statusLabel = ["OM"].includes(val) ? "Oportunidad de Mejora" : "No Conforme";
            return `${idx + 1}. Punto ${it.id.split('_').slice(1).join('.')}: ${it.pregunta.replace(/^\d+\.\d+\s+¿?/, '').replace(/\?$/, '')} (${statusLabel})`;
          }).join('\n');
        }

        // Section photos
        const sectionPhotos = sec.items
          .filter((it: any) => inspection.fotos?.[it.id])
          .map((it: any) => ({
            itemId: it.id,
            itemName: it.pregunta.replace(/^\d+\.\d+\s+¿?/, '').replace(/\?$/, ''),
            url: inspection.fotos[it.id]
          }));

        return (
          <div key={sec.id} style={{ pageBreakInside: 'auto', marginTop: '12px', borderTop: sIdx > 0 ? '1px dashed #aaa' : 'none', paddingTop: '8px' }}>
            {/* TITLE BAR */}
            <div style={{ backgroundColor: '#f3f4f6', border: '1.5px solid #000', borderBottom: 'none', fontWeight: 'bold', fontSize: '8px', padding: '4px 6px', textTransform: 'uppercase' }}>
              ASPECTOS EVALUADOS: {sec.titulo.toUpperCase()}
            </div>

            {/* QUESTIONS TABLE */}
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', border: '1.5px solid #000', fontSize: '7px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', fontWeight: 'bold', textAlign: 'center' }}>
                  <td style={{ border: '1.5px solid #000', padding: '2px 4px', textAlign: 'left', width: '34%' , verticalAlign: 'middle', lineHeight: 1.2}}>Preguntas</td>
                  <td style={{ border: '1.5px solid #000', padding: '2px 4px', width: '24%' , verticalAlign: 'middle', lineHeight: 1.2}}>Aspecto legal -técnico</td>
                  <td style={{ border: '1.5px solid #000', padding: '2px 4px', width: '13%' , verticalAlign: 'middle', lineHeight: 1.2}}>Grupos o familias</td>
                  <td style={{ border: '1.5px solid #000', padding: '2px 4px', width: '13%' , verticalAlign: 'middle', lineHeight: 1.2}}>Areas responsables</td>
                  <td className="whitespace-nowrap" style={{ border: '1.5px solid #000', padding: '2px 4px', width: '16%', whiteSpace: 'nowrap' , verticalAlign: 'middle', lineHeight: 1.2}}>CONFORMIDAD</td>
                </tr>
              </thead>
              <tbody>
                {checklistItems.map((item: any) => {
                  const meta = itemMetaMap[item.id] || { ley: item.referenciaLegal || 'RCHST / COVENIN', grupo: 'SSA', area: 'VENTAS' };
                  const rawResponse = inspection.respuestas?.[item.id] || "N/A";
                  const val = String(rawResponse).toUpperCase();
                  
                  let displayVal = val;
                  if (["C", "SI", "BUENO", "OPERATIVO", "OK", "CONFORME", "EXISTE"].includes(val)) displayVal = "C";
                  else if (["NC", "NO", "DANADO", "MALO", "DETERIORADO", "NO OPERATIVO", "CRITICO", "NO_EXISTE", "DESACTUALIZADO"].includes(val)) displayVal = "NC";
                  else if (["OM"].includes(val)) displayVal = "OM";
                  else displayVal = "NA";

                  return (
                    <tr key={item.id} style={{ pageBreakInside: 'avoid' }}>
                      <td style={{ border: '1.5px solid #000', padding: '2px 4px', textAlign: 'left', lineHeight: '1.2', wordBreak: 'break-word', overflowWrap: 'break-word' , verticalAlign: 'middle'}}>{item.pregunta}</td>
                      <td style={{ border: '1.5px solid #000', padding: '2px 4px', textAlign: 'left', fontStyle: 'italic', color: '#444', lineHeight: '1.2', wordBreak: 'break-word', overflowWrap: 'break-word' , verticalAlign: 'middle'}}>{meta.ley}</td>
                      <td style={{ border: '1.5px solid #000', padding: '2px 4px', textAlign: 'center', wordBreak: 'break-word', overflowWrap: 'break-word' , verticalAlign: 'middle', lineHeight: 1.2}}>{meta.grupo}</td>
                      <td style={{ border: '1.5px solid #000', padding: '2px 4px', textAlign: 'center', wordBreak: 'break-word', overflowWrap: 'break-word' , verticalAlign: 'middle', lineHeight: 1.2}}>{meta.area}</td>
                      <td style={{ border: '1.5px solid #000', padding: '2px 4px', textAlign: 'center', fontWeight: 'bold', color: displayVal === 'C' ? '#16a34a' : displayVal === 'NC' ? '#dc2626' : displayVal === 'OM' ? '#ca8a04' : '#555' , verticalAlign: 'middle', lineHeight: 1.2}}>
                        {displayVal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* FIELD OBSERVATIONS */}
            <div style={{ border: '1.5px solid #000', borderTop: 'none', backgroundColor: '#fdfdfd' }}>
              <div style={{ backgroundColor: '#f3f4f6', borderBottom: '1.5px solid #000', fontWeight: 'bold', fontSize: '8px', padding: '3px 6px', textTransform: 'uppercase' }}>
                OBSERVACIONES EN CAMPO
              </div>
              <div style={{ padding: '6px', fontSize: '8px', minHeight: '18px', whiteSpace: 'pre-line', lineHeight: '1.3' }}>
                {obsResponses || "Sin observaciones de campo registradas."}
              </div>
            </div>

            {/* SPLIT BOX: FINDINGS & EVIDENCES */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', borderTop: 'none', fontSize: '7px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'left', borderBottom: '1.5px solid #000' }}>
                  <td style={{ padding: '2px 4px', borderRight: '1.5px solid #000', width: '50%', fontWeight: 'bold' , verticalAlign: 'middle', lineHeight: 1.2}}>HALLAZGOS, CONCLUSIÓN, RECOMENDACIONES</td>
                  <td style={{ padding: '2px 4px', width: '50%', fontWeight: 'bold' , verticalAlign: 'middle', lineHeight: 1.2}}>Detalle Gráfico - Evidencias</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ borderRight: '1.5px solid #000', padding: '2px 4px', verticalAlign: 'middle', lineHeight: '1.3', whiteSpace: 'pre-line' }}>
                    {findingsText}
                  </td>
                  <td style={{ padding: '2px 4px', verticalAlign: 'middle', textAlign: 'center' , lineHeight: 1.2}}>
                    {sectionPhotos.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                        {sectionPhotos.map((p: any, pIdx: number) => (
                          <div key={pIdx} style={{ width: '45%', border: '0.5px solid #ccc', padding: '2px', backgroundColor: '#fafafa' }}>
                            <img src={p.url} style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto', display: 'block' }} referrerPolicy="no-referrer" />
                            <div style={{ fontSize: '5.5px', fontWeight: 'bold', marginTop: '2px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.itemName}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#888', fontStyle: 'italic', padding: '8px 0', fontSize: '7px' }}>Sin evidencias fotográficas en sección</div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}

      {/* FINAL CONCLUSION PAGE */}
      <div style={{ pageBreakInside: 'avoid', marginTop: '12px' }}>
        {/* GENERAL CONCLUSION BOX */}
        <div style={{ border: '1.5px solid #000' }}>
          <div style={{ backgroundColor: '#f3f4f6', borderBottom: '1.5px solid #000', fontWeight: 'bold', fontSize: '8px', padding: '4px 6px', textTransform: 'uppercase' }}>
            CONCLUSIONES, RECOMENDACIONES GENERALES Y ACCIONES DE CIERRE
          </div>
          <div style={{ padding: '8px', fontSize: '8px', minHeight: '60px', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
            {inspection.observaciones || "Se ha ejecutado la auditoría de seguridad y salud laboral de manera satisfactoria sin anomalías graves. Se aconseja continuar con las observaciones particulares asentadas en cada sección."}
          </div>
        </div>

        {/* SIGNATURES SEGMENT */}
        <div style={{ border: '1.5px solid #000', marginTop: '10px' }}>
          <div style={{ backgroundColor: '#f3f4f6', borderBottom: '1.5px solid #000', fontWeight: 'bold', fontSize: '8px', padding: '4px 6px', textTransform: 'uppercase', textAlign: 'center' }}>
            Personal que realizó la Inspección
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <tbody>
              <tr style={{ fontWeight: 'bold', fontSize: '8px', backgroundColor: '#fafafa' }}>
                <td style={{ borderBottom: '1.5px solid #000', borderRight: '1.5px solid #000', padding: '2px 4px', width: '50%' , verticalAlign: 'middle', lineHeight: 1.2}}>Realizada por:</td>
                <td style={{ borderBottom: '1.5px solid #000', padding: '2px 4px', width: '50%' , verticalAlign: 'middle', lineHeight: 1.2}}>Revisado por:</td>
              </tr>
              <tr>
                <td style={{ borderRight: '1.5px solid #000', padding: '2px 4px', verticalAlign: 'middle' , lineHeight: 1.2}}>
                  <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                    {inspection.firmas?.inspector ? (
                      <img src={inspection.firmas.inspector} style={{ maxHeight: '40px', maxWidth: '100%', width: 'auto', height: 'auto' }} />
                    ) : (
                      <div style={{ width: '110px', borderBottom: '1px dashed #bbb', height: '35px' }} />
                    )}
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '8px' }}>{(inspection.inspectorId || inspection.inspector || 'Inspector SSA').toUpperCase()}</div>
                  <div style={{ fontSize: '6.5px', color: '#555', marginTop: '1px' }}>INSPECTOR DE SEGURIDAD, SALUD Y AMBIENTE (SSA)</div>
                </td>
                <td style={{ padding: '2px 4px', verticalAlign: 'middle' , lineHeight: 1.2}}>
                  <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                    {inspection.firmas?.revisor ? (
                      <img src={inspection.firmas.revisor} style={{ maxHeight: '40px', maxWidth: '100%', width: 'auto', height: 'auto' }} />
                    ) : (
                      <div style={{ width: '110px', borderBottom: '1px dashed #bbb', height: '35px' }} />
                    )}
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '8px' }}>REVISIÓN DIRECTIVA</div>
                  <div style={{ fontSize: '6.5px', color: '#555', marginTop: '1px' }}>REGENTE / GERENCIA DE OPERACIONES DUNCAN</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER SYSTEM SEGMENT */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', marginTop: '12px' }}>
        <tbody>
          <tr style={{ fontSize: '6px', fontWeight: 'bold', color: '#333' }}>
            <td style={{ textAlign: 'left', border: 'none', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>
              ERP COD: SST-DIS-F01
            </td>
            <td style={{ textAlign: 'center', border: 'none', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>
              DOCUMENTO OFICIAL GENERADO POR SISTEMA SGD-DUNCAN
            </td>
            <td style={{ textAlign: 'right', border: 'none', padding: '2px 4px' , verticalAlign: 'middle', lineHeight: 1.2}}>
              DESARROLLADO POR ERGOEXPRESS, C.A. - RIF: J-50251246-2
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  );
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

  const isExtintores = metadata.tipo?.nombre?.toLowerCase().includes('extintor') || false;

  React.useEffect(() => {
    const load = async () => {
      const [empresas, tipos] = await Promise.all([
        dbService.getEmpresas(),
        dbService.getTiposInspeccion(),
      ]);
      const empresa = empresas.find((e) => e.id === inspection.empresaId);
      const tipo = tipos.find((t) => t.id === inspection.tipoInspeccionId);

      const locs = await dbService.getLocalidades(inspection.empresaId);
      const localidad = locs.find((l) => l.id === inspection.localidadId);

      const ests = await dbService.getEstablecimientos(inspection.localidadId);
      const establecimiento = ests.find(
        (e) => e.id === inspection.establecimientoId,
      );

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
    const element = reportRef.current;
    if (!element) {
      setExporting(false);
      return;
    }

    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    const currentScrollY = window.scrollY;
    const currentScrollX = window.scrollX;
    window.scrollTo({ left: 0, top: 0, behavior: "auto" });

    // Construct Filename: [Tipo]-[Empresa]-[Empresa]-[Establecimiento]-[Fecha dd-mm-aa]-[Correlativo]
    const tipo =
      metadata.tipo?.codigo ||
      metadata.tipo?.id?.substring(0, 3).toUpperCase() ||
      "INSP";
    const empresa = metadata.empresa?.codigo || "DDC";
    const est =
      metadata.establecimiento?.iniciales ||
      metadata.establecimiento?.nombre?.substring(0, 3).toUpperCase() ||
      "EST";

    const d = new Date(inspection.fecha);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    const dateStr = `${day}-${month}-${year}`;

    const refParts = (inspection.referencia || "").split("-");
    const correlativo = refParts[refParts.length - 1] || "0000";

    const fileName = `${tipo}-${empresa}-${est}-${dateStr}-${correlativo}.pdf`;
    const refCode = inspection.referencia?.startsWith("REF")
      ? inspection.referencia
      : `REF-${inspection.referencia || inspection.id.substring(0, 8).toUpperCase()}`;

    // Temporarily configure the live visible element to render perfectly at exactly targetWidth for the PDF snapshot
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;
    
    const targetWidth = isExtintores ? "794px" : "820px";
    element.style.setProperty("width", targetWidth, "important");
    element.style.setProperty("max-width", targetWidth, "important");

    // Initialize progressive feedback toasts for heavy/massive data loading
    const toastId = toast.loading("Optimizando imágenes de reporte y precargando recursos...");

    try {
      // 1. Programmatic CORS setup, pre-loading and resolution check for all images
      const images = Array.from(element.getElementsByTagName("img")) as HTMLImageElement[];
      await Promise.all(
        images.map(async (img) => {
          if (img.src && !img.src.startsWith("data:")) {
            img.setAttribute("crossorigin", "anonymous");
          }

          // Force programmatic load to guarantee canvas has complete pixels
          if (!img.complete) {
            await new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve(); // Avoid blocking if one image fails
            });
          }

          // 2. Dynamic Image Downscaling & Hot Compression to protect browser memory (V8)
          // Downscales camera-uploaded photos (>1MB) to web-safe resolution (max 800px) and converts to 80% JPEG.
          try {
            const maxDimension = 800;
            const nw = img.naturalWidth;
            const nh = img.naturalHeight;
            if (nw > maxDimension || nh > maxDimension) {
              const canvas = document.createElement("canvas");
              let w = nw;
              let h = nh;
              if (w > h) {
                if (w > maxDimension) {
                  h = Math.round((h * maxDimension) / w);
                  w = maxDimension;
                }
              } else {
                if (h > maxDimension) {
                  w = Math.round((w * maxDimension) / h);
                  h = maxDimension;
                }
              }
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(img, 0, 0, w, h);
                const compressed = canvas.toDataURL("image/jpeg", 0.8);
                img.src = compressed;
              }
            }
          } catch (err) {
            console.warn("Could not optimize image in-memory:", err);
          }
        })
      );

      // Give browser layout engine a short breath to render the compressed resources
      await new Promise((resolve) => setTimeout(resolve, 350));

      const opt = {
        margin: (isExtintores ? [3, 4, 3, 4] : [12, 10, 12, 10]) as [number, number, number, number],
        filename: fileName,
        image: { type: "png" as const },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false, 
          windowWidth: isExtintores ? 816 : 820,
          scrollX: 0,
          scrollY: 0,
          letterRendering: false
        },
        jsPDF: {
          unit: "mm" as const,
          format: "letter" as const,
          orientation: "portrait" as const,
          compress: true,
        },
        pagebreak: { mode: ["css", "legacy"] },
      };

      if (method === "download") {
        const worker = html2pdf().from(element).set(opt);
        await worker.save();
        
        try {
          const base64Pdf = await worker.outputPdf('datauristring');
          if (base64Pdf && user) {
            await dbService.saveReportePDF({
              tipo: 'Inspeccion',
              nombre: fileName,
              referencia: inspection.id,
              pdfData: base64Pdf,
              userId: user.uid,
              fecha: new Date().toISOString()
            });
          }
        } catch (e) {
          console.warn('No se pudo guardar en historial', e);
        }

        toast.dismiss(toastId);
        toast.success("Reporte descargado con éxito");
        return;
      }

      // Siempre descargamos y guardamos el PDF de manera directa y confiable, evitando navigator.share nativo
      try {
        const worker = html2pdf().from(element).set(opt);
        await worker.save();
        
        try {
          const base64Pdf = await worker.outputPdf('datauristring');
          if (base64Pdf && user) {
            await dbService.saveReportePDF({
              tipo: 'Inspeccion',
              nombre: fileName,
              referencia: inspection.id,
              pdfData: base64Pdf,
              userId: user.uid,
              fecha: new Date().toISOString()
            });
          }
        } catch (e) {
          console.warn('No se pudo guardar en historial', e);
        }

        const message = `Estimados,\n\nSe ha generado el Reporte de Inspección Técnico: ${refCode}.\n\n📄 Archivo: ${fileName}\n\n(Nota para el emisor: El archivo PDF correspondiente se ha guardado automáticamente en su carpeta de descargas del equipo, por favor adjúntelo antes de enviar).\n\nAtentamente,\nControl Técnico.`;
        
        toast.dismiss(toastId);
        if (method === "whatsapp") {
          const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
          window.open(url, "_blank");
          toast.success("PDF generado y descargado. Abriendo WhatsApp...");
        } else if (method === "email") {
          window.location.href = `mailto:?subject=Reporte de Inspección ${refCode}&body=${encodeURIComponent(message)}`;
          toast.success("PDF generado y descargado. Abriendo gestor de correo...");
        }
      } catch (e) {
        toast.dismiss(toastId);
        console.warn("Generation failed", e);
        throw e;
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Error sharing exported PDF:", error);
      toast.error("Ocurrió un error al intentar procesar el documento");
    } finally {
      // Clean up styling overrides and restore original view
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      
      window.scrollTo({ left: currentScrollX, top: currentScrollY, behavior: "auto" });
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
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
            /* Overrides to ensure top-tier, polished visual quality that matches the beautiful screen layout of the app */
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
              padding-left: 15px !important;
              padding-right: 15px !important;
              box-sizing: border-box !important;
            }

            `}</style>
          {isExtintores ? (
            <ExtintoresTemplate inspection={inspection} metadata={metadata} />
          ) : metadata.tipo?.codigo === 'DIST' || metadata.tipo?.nombre?.toLowerCase().includes('distribuidora') ? (
            <DistribuidorasTemplate inspection={inspection} metadata={metadata} />
          ) : metadata.tipo?.codigo === 'IMC' || metadata.tipo?.nombre?.toLowerCase().includes('montacargas') ? (
            <MontacargasTemplate inspection={inspection} metadata={metadata} />
          ) : (
            <>
            {/* HEADER SECTION - SAP STYLE */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: isExtintores ? '6px' : '10px' }}>
               <tbody>
                   <tr>
                       <td style={{ width: '20%', borderRight: '1px solid #000', padding: isExtintores ? '6px' : '12px', textAlign: 'center', verticalAlign: 'middle' }}>
                           <img src={getCompanyLogo(metadata)} alt={metadata?.empresa?.nombre || "Duncan"} style={{ maxHeight: isExtintores ? '38px' : '55px', maxWidth: '100%', width: 'auto', height: 'auto', display: 'block', margin: '0 auto' }} />
                       </td>
                       <td style={{ width: '55%', borderRight: '1px solid #000', padding: isExtintores ? '4px' : '8px', textAlign: 'center', verticalAlign: 'middle' }}>
                           <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', lineHeight: '1.2' }}>PROGRAMA DE SEGURIDAD Y SALUD EN EL TRABAJO</div>
                           <div style={{ fontSize: '13px', color: '#002855', fontWeight: 'bold', marginTop: '2px', textDecoration: 'underline' }}>{metadata.tipo?.nombre?.toUpperCase() || "REPORTE TÉCNICO DE INSPECCIÓN"}</div>
                       </td>
                       <td className="nested-table-container" style={{ width: '25%', padding: '0' }}>
                           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5px' }}>
                               <tbody>
                                   <tr><td style={{ borderBottom: '1px solid #000', padding: isExtintores ? '1.5px 4px' : '3px 6px' }}><strong>CÓDIGO DOC:</strong> {metadata.tipo?.codigo || 'GEN-SST-F01'}</td></tr>
                                   <tr><td style={{ borderBottom: '1px solid #000', padding: isExtintores ? '1.5px 4px' : '3px 6px' }}><strong>ID TRANS:</strong> {inspection.referencia || inspection.id.substring(0, 8).toUpperCase()}</td></tr>
                                   <tr><td style={{ padding: isExtintores ? '1.5px 4px' : '3px 6px' }}><strong>EMISIÓN:</strong> {formatDate(inspection.fecha)}</td></tr>
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
           <div style={{ border: '1px solid #000', marginBottom: isExtintores ? '6px' : '15px' }}>
             <div className="pdf-section-header">2.0 RESUMEN DE CUMPLIMIENTO TÉCNICO</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: '#e5e7eb' }}>
                  <th style={{ border: "1px solid #000", borderTop: 'none', padding: isExtintores ? "4px 6px" : "8px 10px", textAlign: "left", fontSize: isExtintores ? "8px" : "9px", width: "75%", verticalAlign: 'middle' }}>SECCIÓN / ÁREA DE EVALUACIÓN</th>
                  <th style={{ border: "1px solid #000", borderTop: 'none', padding: isExtintores ? "4px 6px" : "8px 10px", textAlign: "center", fontSize: isExtintores ? "8px" : "9px", width: "25%", verticalAlign: 'middle' }}>NIVEL DE CONFORMIDAD (%)</th>
                </tr>
              </thead>
              <tbody>
                {metadata.tipo?.secciones.map(sec => {
                  let c = 0, na = 0, total = 0;
                  sec.items.forEach(item => {
                    const val = String(inspection.respuestas?.[item.id] || "N/A").toUpperCase();
                    if (["C", "SI", "BUENO", "OPERATIVO", "OK", "CONFORME", "EXISTE"].includes(val)) c++;
                    else if (["N/A", "NA"].includes(val)) na++;
                    total++;
                  });
                  const validTotal = total - na;
                  const perc = validTotal > 0 ? Math.round((c / validTotal) * 100) : 100;
                  
                  return (
                    <tr key={sec.id}>
                      <td style={{ border: "1px solid #000", padding: isExtintores ? "4px 6px" : "8px 10px", fontSize: isExtintores ? '8px' : '9px', verticalAlign: 'middle' }}>{sec.titulo.toUpperCase()}</td>
                      <td style={{ border: "1px solid #000", padding: isExtintores ? "4px 6px" : "8px 10px", textAlign: "center", fontWeight: "bold", fontSize: isExtintores ? '8px' : '9px', verticalAlign: 'middle' }}>
                        <span style={{ color: perc >= 90 ? '#166534' : perc >= 75 ? '#854d0e' : '#991b1b' }}>{perc}%</span>
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <td style={{ border: "1px solid #000", padding: isExtintores ? "4px 6px" : "8px 10px", fontSize: isExtintores ? '8.5px' : '9px', fontWeight: 'bold', textAlign: 'right', verticalAlign: 'middle' }}>PUNTUACIÓN GLOBAL DE CONFORMIDAD:</td>
                  <td style={{ border: "1px solid #000", padding: isExtintores ? "4px 6px" : "8px 10px", textAlign: "center", fontWeight: "bold", fontSize: isExtintores ? '9px' : '11px', color: '#004B93', verticalAlign: 'middle' }}>
                    {inspection.puntuacionConformidad || 0}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CUERPO TÉCNICO DE LA INSPECCIÓN */}
          <div className="pdf-section-header" style={{ border: '1px solid #000', borderBottom: 'none' }}>3.0 HALLAZGOS Y EVIDENCIAS DE CAMPO</div>
          <div style={{ border: '1px solid #000', marginBottom: isExtintores ? '6px' : '20px' }}>
            {metadata.tipo?.secciones.map((sec, i) => (
              <div key={sec.id} style={{ pageBreakInside: "auto" }}>
                <div className="pdf-subsection-header" style={{ borderBottom: '1px solid #000', borderTop: i > 0 ? '1px solid #000' : 'none' }}>
                  {`3.${i + 1} ${sec.titulo.toUpperCase()}`}
                </div>
                <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9fafb" }}>
                      <th style={{ borderBottom: "1px solid #000", borderRight: '1px solid #000', padding: isExtintores ? "4px 6px" : "8px 10px", textAlign: "left", fontSize: isExtintores ? "8px" : "9px", width: "75%", verticalAlign: 'middle' }}>REQUERIMIENTO / PUNTO DE CONTROL</th>
                      <th style={{ borderBottom: "1px solid #000", padding: isExtintores ? "4px 6px" : "8px 10px", textAlign: "center", fontSize: isExtintores ? "8px" : "9px", width: "25%", verticalAlign: 'middle' }}>RESULTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.items.map(item => {
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
                         smallVal = val === "C" ? "CONFORME (C)" : val; 
                       }
                       else if (isNegative) { 
                         c = "#b91c1c"; 
                         smallVal = val === "NC" ? "NO CONFORME (NC)" : (val === "NO_EXISTE" ? "NO EXISTE" : val); 
                       }
                       else if (isNeutral) { 
                         c = "#c2410c"; 
                         smallVal = "OBSERVACIÓN (OM)"; 
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
                                 <span style={{ display: 'inline', wordBreak: 'normal', overflowWrap: 'anywhere' }}>{item.pregunta}</span>
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
                  metadata.tipo?.secciones.forEach((sec: any) => {
                    const found = sec.items.find((it: any) => it.id === fotoId);
                    if (found) itemName = found.pregunta;
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
          )}
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
