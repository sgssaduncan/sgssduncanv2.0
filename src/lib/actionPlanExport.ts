/**
 * SGD DUNCAN 2.0 — Exportador Oficial y Generador de Planes de Acción Institucionales
 * Genera la estructura y visualización oficial de Grupo Duncan en:
 * 1. Formato Excel (.xlsx) de alta fidelidad visual (colores corporativos, bordes, celdas combinadas y formato condicional)
 * 2. Formato PDF Editable e Interactivo (con campos AcroForm editables en tiempo real y maquetación ejecutiva)
 * 3. Integración para correo electrónico y WhatsApp institucional
 */

import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Inspeccion, PlanAccion } from '../types';
import { formatDate, getReportHeaderTitle } from './utils';
import { DUNCAN_LOGO_BW } from './logos';
import { auditService } from '../services/auditService';

export interface ActionPlanExportMeta {
  empresaNombre?: string;
  localidadNombre?: string;
  establecimientoNombre?: string;
  tipoNombre?: string;
  tipoCodigo?: string;
  rondaNo?: number;
  revisorNombre?: string;
}

export function getMesAno(dateStr?: string): string {
  if (!dateStr) return 'ABRIL - 2026';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return 'ABRIL - 2026';
    const meses = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    return `${meses[d.getMonth()]} - ${d.getFullYear()}`;
  } catch {
    return 'ABRIL - 2026';
  }
}

export function getNivelConformidad(puntuacion?: number): string {
  const p = typeof puntuacion === 'number' ? puntuacion : 100;
  if (p >= 85) return 'ALTO';
  if (p >= 70) return 'MEDIO';
  return 'BAJO';
}

// Estilos de bordes y colores corporativos estándar Duncan
const BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
};

const BORDER_HEADER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF475569' } },
  left: { style: 'thin', color: { argb: 'FF475569' } },
  bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
  right: { style: 'thin', color: { argb: 'FF475569' } }
};

/**
 * =========================================================================
 * 1. EXPORTACIÓN OFICIAL A EXCEL (.XLSX) CON VISUAL PROFESIONAL
 * Idéntico en colores, bordes, fuentes y distribución a la plantilla institucional
 * =========================================================================
 */
export async function exportActionPlanToExcel(
  inspeccion: Inspeccion,
  items: PlanAccion[],
  meta?: ActionPlanExportMeta
): Promise<Blob> {
  const empNombre = (meta?.empresaNombre || inspeccion.empresaNombre || 'DISTRIBUIDORA DUNCAN C.A.').toUpperCase();
  const locNombre = (meta?.localidadNombre || inspeccion.localidadNombre || 'VALENCIA').toUpperCase();
  const estNombre = (meta?.establecimientoNombre || inspeccion.establecimientoNombre || 'DISTRIBUIDORA DUNCAN VALENCIA').toUpperCase();
  const tipoNom = meta?.tipoNombre || inspeccion.tipoNombre || 'Distribuidoras';
  const tipoCod = meta?.tipoCodigo || inspeccion.tipoCodigo || 'DD';
  const mesAno = getMesAno(inspeccion.fecha);
  const correlStr = String(inspeccion.correlativo || (inspeccion.referencia ? inspeccion.referencia.replace(/^REF-|^INSP-/, '') : '14'));
  const headerTipo = getReportHeaderTitle(tipoNom, tipoCod);

  const puntuacionVal = typeof inspeccion.puntuacion === 'number' ? inspeccion.puntuacion : 92.3;
  const nivelConf = getNivelConformidad(puntuacionVal);
  const fechaInsp = inspeccion.fecha ? String(inspeccion.fecha).split('T')[0] : '2026-04-22';
  const dClose = new Date(fechaInsp);
  const fechaCierre = isNaN(dClose.getTime()) 
    ? '2026-04-24' 
    : new Date(dClose.getTime() + 15 * 86400000).toISOString().split('T')[0];

  const inspector = inspeccion.inspector || 'Alberto Becerra';
  const revisor = meta?.revisorNombre || 'Jesús Contreras';

  const wb = new ExcelJS.Workbook();
  wb.creator = 'SG-SSA Grupo Duncan 2.0';
  wb.lastModifiedBy = inspector;
  wb.created = new Date();
  wb.modified = new Date();

  const ws = wb.addWorksheet('PLAN', {
    views: [{ showGridLines: true }],
    pageSetup: {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    }
  });

  // Configuración de anchos de columna exactos
  ws.columns = [
    { key: 'colA', width: 24 }, // Aspectos evaluado
    { key: 'colB', width: 44 }, // Preguntas
    { key: 'colC', width: 34 }, // Aspecto legal - técnico
    { key: 'colD', width: 16 }, // Grupos o familias
    { key: 'colE', width: 25 }, // Areas responsables
    { key: 'colF', width: 15 }, // Conformidad
    { key: 'colG', width: 14 }, // Prioridad
    { key: 'colH', width: 18 }, // Fecha de ejecución
    { key: 'colI', width: 18 }, // Fecha de verificación
    { key: 'colJ', width: 28 }, // Recursos necesarios
    { key: 'colK', width: 36 }  // Observaciones
  ];

  // FILA 1: Programa y Subtítulo
  ws.mergeCells('B1:K1');
  const cellB1 = ws.getCell('B1');
  cellB1.value = `Programa de Seguridad y Salud en el Trabajo\n${tipoNom.toUpperCase().includes('SERVI') ? 'Inspección de Servicentros' : 'Inspección de Distribuidoras'}`;
  cellB1.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  cellB1.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  ws.getRow(1).height = 34;

  // FILA 2: Código / Departamento / Revisión (Encabezados de Metadatos)
  const cellA2 = ws.getCell('A2');
  cellA2.value = 'Código';
  cellA2.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF334155' } };
  cellA2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  cellA2.alignment = { horizontal: 'center', vertical: 'middle' };
  cellA2.border = BORDER_THIN;

  ws.mergeCells('B2:J2');
  const cellB2 = ws.getCell('B2');
  cellB2.value = 'Departamento emisor';
  cellB2.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF334155' } };
  cellB2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  cellB2.alignment = { horizontal: 'center', vertical: 'middle' };
  cellB2.border = BORDER_THIN;

  const cellK2 = ws.getCell('K2');
  cellK2.value = 'N° Revisión:';
  cellK2.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF334155' } };
  cellK2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  cellK2.alignment = { horizontal: 'center', vertical: 'middle' };
  cellK2.border = BORDER_THIN;
  ws.getRow(2).height = 18;

  // FILA 3: Valores de Metadatos
  const cellA3 = ws.getCell('A3');
  cellA3.value = `PLAN-ACC-${tipoCod}`;
  cellA3.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
  cellA3.alignment = { horizontal: 'center', vertical: 'middle' };
  cellA3.border = BORDER_THIN;

  ws.mergeCells('B3:J3');
  const cellB3 = ws.getCell('B3');
  cellB3.value = 'Departamento de Seguridad y Salud Laboral (SSA)';
  cellB3.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
  cellB3.alignment = { horizontal: 'center', vertical: 'middle' };
  cellB3.border = BORDER_THIN;

  const cellK3 = ws.getCell('K3');
  cellK3.value = 0;
  cellK3.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
  cellK3.alignment = { horizontal: 'center', vertical: 'middle' };
  cellK3.border = BORDER_THIN;
  ws.getRow(3).height = 20;

  // FILA 4: Título Localidad y Mes
  const cellA4 = ws.getCell('A4');
  cellA4.value = `PLAN ACCION ${estNombre} ${mesAno}`;
  cellA4.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  cellA4.alignment = { horizontal: 'left', vertical: 'middle' };
  ws.getRow(4).height = 24;

  // FILA 5: Banner Principal Oficial (Dark Slate Duncan)
  ws.mergeCells('A5:K5');
  const cellA5 = ws.getCell('A5');
  cellA5.value = `PLAN DE ACCIÓN DERIVADO DE ${headerTipo}`;
  cellA5.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  cellA5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  cellA5.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(5).height = 26;

  // FILA 6: Espacio
  ws.getRow(6).height = 8;

  // FILA 7: Ficha de Control - Encabezados
  const controlHeaders = [
    { col: 'A', text: 'Id' },
    { col: 'B', text: 'EMPRESA - LOCALIDAD - ESTABLECIMIENTO - FECHA' },
    { col: 'G', text: 'Ronda N°' },
    { col: 'H', text: 'Fecha de Inspección' },
    { col: 'I', text: 'Fecha de Cierre' },
    { col: 'J', text: 'Porcentaje Obtenido' },
    { col: 'K', text: 'Nivel de Conformidad' }
  ];

  ws.mergeCells('B7:F7');
  controlHeaders.forEach(ch => {
    const c = ws.getCell(`${ch.col}7`);
    c.value = ch.text;
    c.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = BORDER_HEADER;
  });
  // bordes para celdas intermedias del merge
  ['C7', 'D7', 'E7', 'F7'].forEach(cRef => {
    ws.getCell(cRef).border = BORDER_HEADER;
  });
  ws.getRow(7).height = 22;

  // FILA 8: Ficha de Control - Datos
  ws.mergeCells('B8:F8');
  const cellA8 = ws.getCell('A8');
  cellA8.value = Number(correlStr) || correlStr;
  cellA8.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
  cellA8.alignment = { horizontal: 'center', vertical: 'middle' };
  cellA8.border = BORDER_THIN;

  const cellB8 = ws.getCell('B8');
  cellB8.value = `${empNombre} - ${locNombre} - ${estNombre} - ${mesAno}`;
  cellB8.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF0F172A' } };
  cellB8.alignment = { horizontal: 'left', vertical: 'middle' };
  cellB8.border = BORDER_THIN;
  ['C8', 'D8', 'E8', 'F8'].forEach(cRef => {
    ws.getCell(cRef).border = BORDER_THIN;
  });

  const cellG8 = ws.getCell('G8');
  cellG8.value = meta?.rondaNo || 1;
  cellG8.font = { name: 'Arial', size: 9, bold: false, color: { argb: 'FF0F172A' } };
  cellG8.alignment = { horizontal: 'center', vertical: 'middle' };
  cellG8.border = BORDER_THIN;

  const cellH8 = ws.getCell('H8');
  cellH8.value = fechaInsp;
  cellH8.font = { name: 'Arial', size: 8.5, bold: false, color: { argb: 'FF0F172A' } };
  cellH8.alignment = { horizontal: 'center', vertical: 'middle' };
  cellH8.border = BORDER_THIN;

  const cellI8 = ws.getCell('I8');
  cellI8.value = fechaCierre;
  cellI8.font = { name: 'Arial', size: 8.5, bold: false, color: { argb: 'FF0F172A' } };
  cellI8.alignment = { horizontal: 'center', vertical: 'middle' };
  cellI8.border = BORDER_THIN;

  const cellJ8 = ws.getCell('J8');
  cellJ8.value = puntuacionVal / 100;
  cellJ8.numFmt = '0.0%';
  cellJ8.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
  cellJ8.alignment = { horizontal: 'center', vertical: 'middle' };
  cellJ8.border = BORDER_THIN;

  const cellK8 = ws.getCell('K8');
  cellK8.value = nivelConf;
  cellK8.font = { 
    name: 'Arial', 
    size: 9, 
    bold: true, 
    color: { 
      argb: nivelConf === 'ALTO' ? 'FF16A34A' : nivelConf === 'MEDIO' ? 'FFD97706' : 'FFDC2626' 
    } 
  };
  cellK8.alignment = { horizontal: 'center', vertical: 'middle' };
  cellK8.border = BORDER_THIN;
  ws.getRow(8).height = 22;

  // FILA 9: Espacio
  ws.getRow(9).height = 8;

  // FILA 10: Leyenda Oficial
  ws.mergeCells('A10:K10');
  const cellA10 = ws.getCell('A10');
  cellA10.value = 'LEYENDA: C: Conforme; OM: Oportunidad de Mejora; NC: No Conforme; NA: No aplica; SSA: Seguridad; Salud, Ambiente; INFRA: Infraestructura; VEHCP: Vehículos y Equipos Móviles; LEGAL: Legal / Normativo';
  cellA10.font = { name: 'Arial', size: 8, italic: true, bold: true, color: { argb: 'FF475569' } };
  cellA10.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  cellA10.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  cellA10.border = BORDER_THIN;
  ws.getRow(10).height = 20;

  // FILA 11: Espacio
  ws.getRow(11).height = 8;

  // FILA 12: Encabezados de la Tabla de Hallazgos (11 columnas)
  const tableHeaders = [
    'Aspectos evaluado',
    'Preguntas',
    'Aspecto legal -técnico',
    'Grupos o familias',
    'Areas responsables',
    'Conformidad',
    'Prioridad',
    'Fecha de ejecución',
    'Fecha de verificación',
    'Recursos necesarios',
    'Observaciones'
  ];

  const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  tableHeaders.forEach((th, idx) => {
    const c = ws.getCell(`${colLetters[idx]}12`);
    c.value = th;
    c.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = BORDER_HEADER;
  });
  ws.getRow(12).height = 28;

  // FILAS 13 EN ADELANTE: Items de No Conformidad y Oportunidades de Mejora
  let currentRow = 13;
  items.forEach((item, itemIdx) => {
    const r = ws.getRow(currentRow);
    const isEven = itemIdx % 2 === 1;
    const zebraBg = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

    const confVal = item.conformidad || (item.prioridad === 'Critica' ? 'NC' : 'OM');
    const prioVal = item.prioridad || (confVal === 'NC' ? 'Alta' : 'Media');

    // 1. Aspecto evaluado
    const cA = r.getCell(1);
    cA.value = item.aspectoEvaluado || item.seccion || 'Seguridad Industrial';
    cA.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    cA.font = { name: 'Arial', size: 8.5 };

    // 2. Preguntas / Hallazgo
    const cB = r.getCell(2);
    cB.value = item.preguntaTexto || item.hallazgo || '';
    cB.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    cB.font = { name: 'Arial', size: 8.5 };

    // 3. Aspecto legal-técnico
    const cC = r.getCell(3);
    cC.value = item.aspectoLegal || item.notas || 'COVENIN / RCHST';
    cC.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    cC.font = { name: 'Arial', size: 8, color: { argb: 'FF334155' } };

    // 4. Grupos o familias
    const cD = r.getCell(4);
    cD.value = item.grupoPilar || 'SSA';
    cD.alignment = { horizontal: 'center', vertical: 'middle' };
    cD.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF0F172A' } };

    // 5. Areas responsables
    const cE = r.getCell(5);
    cE.value = item.areaResponsable || item.departamento || 'VENTAS - OPERACIONES';
    cE.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    cE.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF334155' } };

    // 6. Conformidad (Resaltado condicional institucional)
    const cF = r.getCell(6);
    cF.value = confVal;
    cF.alignment = { horizontal: 'center', vertical: 'middle' };
    if (confVal === 'NC') {
      cF.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF991B1B' } };
      cF.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
    } else {
      cF.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF92400E' } };
      cF.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
    }

    // 7. Prioridad
    const cG = r.getCell(7);
    cG.value = prioVal;
    cG.alignment = { horizontal: 'center', vertical: 'middle' };
    cG.font = { 
      name: 'Arial', 
      size: 8.5, 
      bold: true, 
      color: { 
        argb: (prioVal === 'Alta' || prioVal === 'Critica') ? 'FFDC2626' : prioVal === 'Media' ? 'FFD97706' : 'FF2563EB' 
      } 
    };

    // 8. Fecha de ejecución
    const cH = r.getCell(8);
    cH.value = item.fechaEjecucion || item.fechaLimite || '';
    cH.alignment = { horizontal: 'center', vertical: 'middle' };
    cH.font = { name: 'Arial', size: 8.5 };

    // 9. Fecha de verificación
    const cI = r.getCell(9);
    cI.value = item.fechaVerificacion || '';
    cI.alignment = { horizontal: 'center', vertical: 'middle' };
    cI.font = { name: 'Arial', size: 8.5 };

    // 10. Recursos necesarios
    const cJ = r.getCell(10);
    cJ.value = item.recursosNecesarios || '';
    cJ.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    cJ.font = { name: 'Arial', size: 8.5 };

    // 11. Observaciones
    const cK = r.getCell(11);
    cK.value = item.observaciones || item.recomendacion || '';
    cK.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    cK.font = { name: 'Arial', size: 8.5 };

    // Aplicar bordes y fondo general de fila
    for (let cIdx = 1; cIdx <= 11; cIdx++) {
      const cell = r.getCell(cIdx);
      cell.border = BORDER_THIN;
      if (cIdx !== 6) { // Excepto Conformidad que tiene su color propio
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zebraBg } };
      }
    }

    // Altura dinámica según contenido
    const maxLen = Math.max(
      (cB.value as string).length,
      (cC.value as string).length,
      (cK.value as string).length
    );
    r.height = maxLen > 100 ? 46 : maxLen > 50 ? 34 : 24;

    currentRow++;
  });

  // Espacio antes de firmas
  currentRow++;
  ws.getRow(currentRow).height = 10;
  currentRow++;

  // CUADRO DE FIRMAS INSTITUCIONAL
  ws.mergeCells(`A${currentRow}:K${currentRow}`);
  const cellSigTitle = ws.getCell(`A${currentRow}`);
  cellSigTitle.value = 'Personal que realizó la Inspección';
  cellSigTitle.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
  cellSigTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
  cellSigTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(currentRow).height = 20;
  currentRow++;

  // Encabezados de Firmas
  ws.mergeCells(`A${currentRow}:E${currentRow}`);
  const cellSig1 = ws.getCell(`A${currentRow}`);
  cellSig1.value = 'Realizada por:';
  cellSig1.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF334155' } };
  cellSig1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  cellSig1.alignment = { horizontal: 'center', vertical: 'middle' };
  cellSig1.border = BORDER_THIN;
  ['B', 'C', 'D', 'E'].forEach(col => ws.getCell(`${col}${currentRow}`).border = BORDER_THIN);

  ws.mergeCells(`F${currentRow}:K${currentRow}`);
  const cellSig2 = ws.getCell(`F${currentRow}`);
  cellSig2.value = 'Revisado por:';
  cellSig2.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF334155' } };
  cellSig2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  cellSig2.alignment = { horizontal: 'center', vertical: 'middle' };
  cellSig2.border = BORDER_THIN;
  ['G', 'H', 'I', 'J', 'K'].forEach(col => ws.getCell(`${col}${currentRow}`).border = BORDER_THIN);
  ws.getRow(currentRow).height = 18;
  currentRow++;

  // Nombres de Firmantes
  ws.mergeCells(`A${currentRow}:E${currentRow}`);
  const cellName1 = ws.getCell(`A${currentRow}`);
  cellName1.value = inspector;
  cellName1.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
  cellName1.alignment = { horizontal: 'center', vertical: 'middle' };
  cellName1.border = BORDER_THIN;
  ['B', 'C', 'D', 'E'].forEach(col => ws.getCell(`${col}${currentRow}`).border = BORDER_THIN);

  ws.mergeCells(`F${currentRow}:K${currentRow}`);
  const cellName2 = ws.getCell(`F${currentRow}`);
  cellName2.value = revisor;
  cellName2.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
  cellName2.alignment = { horizontal: 'center', vertical: 'middle' };
  cellName2.border = BORDER_THIN;
  ['G', 'H', 'I', 'J', 'K'].forEach(col => ws.getCell(`${col}${currentRow}`).border = BORDER_THIN);
  ws.getRow(currentRow).height = 26;

  // Generar Buffer y Descargar
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const filename = `Plan_Accion_${estNombre.replace(/\s+/g, '_')}_${correlStr}.xlsx`;

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  auditService.logExport('EXCEL', filename, 'PlanAccion', inspeccion.id).catch(console.warn);
  return blob;
}

/**
 * =========================================================================
 * 2. EXPORTACIÓN OFICIAL A PDF EDITABLE E INTERACTIVO
 * Genera el documento oficial con campos interactivos editables (AcroForm)
 * y una maquetación visual ejecutiva con logotipo, colores y estructura idéntica
 * =========================================================================
 */
export function exportActionPlanToPDF(
  inspeccion: Inspeccion,
  items: PlanAccion[],
  meta?: ActionPlanExportMeta
): { doc: jsPDF; fileName: string; blob: Blob } {
  const empNombre = (meta?.empresaNombre || inspeccion.empresaNombre || 'DISTRIBUIDORA DUNCAN C.A.').toUpperCase();
  const locNombre = (meta?.localidadNombre || inspeccion.localidadNombre || 'VALENCIA').toUpperCase();
  const estNombre = (meta?.establecimientoNombre || inspeccion.establecimientoNombre || 'DISTRIBUIDORA DUNCAN VALENCIA').toUpperCase();
  const tipoNom = meta?.tipoNombre || inspeccion.tipoNombre || 'Distribuidoras';
  const tipoCod = meta?.tipoCodigo || inspeccion.tipoCodigo || 'DD';
  const mesAno = getMesAno(inspeccion.fecha);
  const correlStr = String(inspeccion.correlativo || (inspeccion.referencia ? inspeccion.referencia.replace(/^REF-|^INSP-/, '') : '14'));
  const headerTipo = getReportHeaderTitle(tipoNom, tipoCod);

  const puntuacionVal = typeof inspeccion.puntuacion === 'number' ? inspeccion.puntuacion : 92.3;
  const nivelConf = getNivelConformidad(puntuacionVal);
  const fechaInsp = inspeccion.fecha ? String(inspeccion.fecha).split('T')[0] : '2026-04-22';
  const dClose = new Date(fechaInsp);
  const fechaCierre = isNaN(dClose.getTime()) 
    ? '2026-04-24' 
    : new Date(dClose.getTime() + 15 * 86400000).toISOString().split('T')[0];

  const inspector = inspeccion.inspector || 'Alberto Becerra';
  const revisor = meta?.revisorNombre || 'Jesús Contreras';

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = 279.4;
  const marginX = 12;
  const contentWidth = pageWidth - (marginX * 2); // 255.4 mm

  // 1. LOGO DUNCAN
  try {
    if (DUNCAN_LOGO_BW) {
      doc.addImage(DUNCAN_LOGO_BW, 'PNG', marginX, 8, 38, 12);
    }
  } catch (err) {
    console.warn('Could not add logo to PDF:', err);
  }

  // 2. PROGRAMA Y REVISIÓN (ENCABEZADO INSTITUCIONAL)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('PROGRAMA DE SEGURIDAD Y SALUD EN EL TRABAJO', 55, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(tipoNom.toUpperCase().includes('SERVI') ? 'Inspección de Servicentros' : 'Inspección de Distribuidoras', 55, 17);

  // Cuadro de código institucional a la derecha
  const boxX = 214;
  const boxY = 8;
  const boxW = 53;
  const boxH = 12;
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(boxX, boxY, boxW, boxH, 'FD');
  doc.line(boxX, boxY + 6, boxX + boxW, boxY + 6);
  doc.line(boxX + 26, boxY, boxX + 26, boxY + boxH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('CÓDIGO', boxX + 2, boxY + 4);
  doc.text('N° REVISIÓN', boxX + 28, boxY + 4);

  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`PLAN-ACC-${tipoCod}`, boxX + 2, boxY + 10);
  doc.text('0 (OFICIAL)', boxX + 28, boxY + 10);

  // 3. TÍTULO DEL PLAN Y LOCALIDAD
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`PLAN ACCION ${estNombre} ${mesAno}`, marginX, 25);

  // 4. BANNER INSTITUCIONAL OFICIAL (SLATE OSCURO)
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(marginX, 28, contentWidth, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`PLAN DE ACCIÓN DERIVADO DE ${headerTipo}`, pageWidth / 2, 32.5, { align: 'center' });

  // 5. FICHA DE CONTROL (METADATOS DE INSPECCIÓN)
  const fichaY = 37;
  const fichaHeaders = [
    { text: 'Id', w: 12 },
    { text: 'EMPRESA - LOCALIDAD - ESTABLECIMIENTO - FECHA', w: 114 },
    { text: 'Ronda N°', w: 16 },
    { text: 'F. Inspección', w: 24 },
    { text: 'F. Cierre', w: 24 },
    { text: '% Obtenido', w: 28 },
    { text: 'Nivel Conformidad', w: 37.4 }
  ];

  let curX = marginX;
  doc.setFillColor(51, 65, 85); // slate-700
  doc.setDrawColor(203, 213, 225);
  fichaHeaders.forEach(fh => {
    doc.rect(curX, fichaY, fh.w, 5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(fh.text, curX + (fh.w / 2), fichaY + 3.5, { align: 'center' });
    curX += fh.w;
  });

  const fichaData = [
    { text: correlStr, w: 12, align: 'center' as const, bold: true },
    { text: `${empNombre} - ${locNombre} - ${estNombre} - ${mesAno}`, w: 114, align: 'left' as const, bold: true },
    { text: String(meta?.rondaNo || 1), w: 16, align: 'center' as const, bold: false },
    { text: fechaInsp, w: 24, align: 'center' as const, bold: false },
    { text: fechaCierre, w: 24, align: 'center' as const, bold: false },
    { text: `${puntuacionVal}%`, w: 28, align: 'center' as const, bold: true },
    { text: nivelConf, w: 37.4, align: 'center' as const, bold: true, color: nivelConf === 'ALTO' ? [22, 163, 74] : nivelConf === 'MEDIO' ? [217, 119, 6] : [220, 38, 38] }
  ];

  curX = marginX;
  doc.setFillColor(255, 255, 255);
  fichaData.forEach(fd => {
    doc.rect(curX, fichaY + 5, fd.w, 6, 'FD');
    doc.setFont('helvetica', fd.bold ? 'bold' : 'normal');
    doc.setFontSize(7.5);
    if (fd.color) {
      doc.setTextColor(fd.color[0], fd.color[1], fd.color[2]);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    const txtX = fd.align === 'center' ? curX + (fd.w / 2) : curX + 2;
    doc.text(fd.text, txtX, fichaY + 9, { align: fd.align });
    curX += fd.w;
  });

  // 6. LEYENDA
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, 50, contentWidth, 4.5, 'FD');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'LEYENDA: C: Conforme; OM: Oportunidad de Mejora; NC: No Conforme; NA: No aplica; SSA: Seguridad, Salud, Ambiente; INFRA: Infraestructura; VEHCP: Vehículos y Equipos Móviles; LEGAL: Legal / Normativo',
    marginX + 2,
    53.2
  );

  // 7. TABLA DE DESVIACIONES CON CAMPOS INTERACTIVOS EDITABLES (ACROFORM)
  const tableData = items.map(item => {
    const conf = item.conformidad || (item.prioridad === 'Critica' ? 'NC' : 'OM');
    const prio = item.prioridad || (conf === 'NC' ? 'Alta' : 'Media');
    return [
      item.aspectoEvaluado || item.seccion || 'Seguridad Industrial',
      item.preguntaTexto || item.hallazgo || '',
      item.aspectoLegal || item.notas || 'COVENIN / RCHST',
      item.grupoPilar || 'SSA',
      item.areaResponsable || item.departamento || 'VENTAS - OPERACIONES',
      conf,
      prio,
      item.fechaEjecucion || item.fechaLimite || '',
      item.fechaVerificacion || '',
      item.recursosNecesarios || '',
      item.observaciones || item.recomendacion || ''
    ];
  });

  autoTable(doc, {
    startY: 56.5,
    margin: { left: marginX, right: marginX, bottom: 22 },
    head: [[
      'Aspectos evaluado',
      'Preguntas',
      'Aspecto legal -técnico',
      'Grupos o familias',
      'Areas responsables',
      'Conformidad',
      'Prioridad',
      'Fecha ejecución',
      'Fecha verificación',
      'Recursos necesarios',
      'Observaciones'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontSize: 7.2,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    styles: {
      font: 'helvetica',
      fontSize: 6.8,
      cellPadding: 1.5,
      valign: 'middle',
      lineColor: [203, 213, 225],
      lineWidth: 0.15
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Aspecto evaluado
      1: { cellWidth: 44 }, // Preguntas
      2: { cellWidth: 32 }, // Aspecto legal
      3: { cellWidth: 15, halign: 'center', fontStyle: 'bold' }, // Grupos
      4: { cellWidth: 24, fontStyle: 'bold' }, // Areas
      5: { cellWidth: 14, halign: 'center', fontStyle: 'bold' }, // Conformidad
      6: { cellWidth: 16, halign: 'center' }, // Prioridad
      7: { cellWidth: 18, halign: 'center' }, // F. Ejecución
      8: { cellWidth: 18, halign: 'center' }, // F. Verificación
      9: { cellWidth: 22 }, // Recursos
      10: { cellWidth: 22.4 } // Observaciones
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didDrawCell: (data) => {
      // 1. Badge coloreado para No Conformidad (NC) y Oportunidad de Mejora (OM)
      if (data.section === 'body' && data.column.index === 5) {
        const val = data.cell.text[0];
        doc.saveGraphicsState();
        if (val === 'NC') {
          doc.setFillColor(254, 226, 226); // red-100
          doc.rect(data.cell.x + 0.8, data.cell.y + 0.8, data.cell.width - 1.6, data.cell.height - 1.6, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(153, 27, 27); // red-800
          doc.text('NC', data.cell.x + (data.cell.width / 2), data.cell.y + (data.cell.height / 2) + 1.2, { align: 'center' });
        } else {
          doc.setFillColor(254, 243, 199); // amber-100
          doc.rect(data.cell.x + 0.8, data.cell.y + 0.8, data.cell.width - 1.6, data.cell.height - 1.6, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(146, 64, 14); // amber-800
          doc.text('OM', data.cell.x + (data.cell.width / 2), data.cell.y + (data.cell.height / 2) + 1.2, { align: 'center' });
        }
        doc.restoreGraphicsState();
      }

      // 2. Colores de Prioridad
      if (data.section === 'body' && data.column.index === 6) {
        const pVal = data.cell.text[0];
        doc.saveGraphicsState();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        if (pVal === 'Alta' || pVal === 'Critica') {
          doc.setTextColor(220, 38, 38);
        } else if (pVal === 'Media') {
          doc.setTextColor(217, 119, 6);
        } else {
          doc.setTextColor(37, 99, 235);
        }
        doc.text(pVal, data.cell.x + (data.cell.width / 2), data.cell.y + (data.cell.height / 2) + 1.2, { align: 'center' });
        doc.restoreGraphicsState();
      }

      // 3. CAMPOS INTERACTIVOS EDITABLES (ACROFORM) en columnas de acción
      // Permite editar directamente en Adobe Acrobat, Chrome o Edge:
      // Columna 7: Fecha ejecución
      // Columna 8: Fecha verificación
      // Columna 9: Recursos necesarios
      // Columna 10: Observaciones / Seguimiento
      if (data.section === 'body' && [7, 8, 9, 10].includes(data.column.index)) {
        try {
          const AcroFormTextField = (doc as any).AcroFormTextField || (doc as any).AcroForm?.TextField;
          if (AcroFormTextField && typeof (doc as any).addField === 'function') {
            const tf = new AcroFormTextField();
            const colName = data.column.index === 7 ? 'fEjec' : data.column.index === 8 ? 'fVerif' : data.column.index === 9 ? 'recursos' : 'obs';
            tf.fieldName = `${colName}_row_${data.row.index}`;
            tf.Rect = [data.cell.x + 0.4, data.cell.y + 0.4, data.cell.width - 0.8, data.cell.height - 0.8];
            tf.value = data.cell.text.join(' ') || '';
            tf.multiline = data.column.index >= 9;
            tf.fontSize = 6.8;
            (doc as any).addField(tf);
          }
        } catch {
          // Si el visor no soporta AcroForm, el texto dibujado permanece visible
        }
      }
    }
  });

  // 8. CUADRO DE FIRMAS AL PIE DE LA ÚLTIMA PÁGINA
  const lastY = (doc as any).lastAutoTable?.finalY || 160;
  let sigY = lastY + 6;

  // Si no cabe en la página actual, agregar nueva página
  if (sigY > 175) {
    doc.addPage();
    sigY = 20;
  }

  const sigBoxW = contentWidth;
  doc.setFillColor(51, 65, 85);
  doc.rect(marginX, sigY, sigBoxW, 5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Personal que realizó la Inspección', marginX + (sigBoxW / 2), sigY + 3.5, { align: 'center' });

  const halfW = sigBoxW / 2;
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, sigY + 5, halfW, 5, 'FD');
  doc.rect(marginX + halfW, sigY + 5, halfW, 5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Realizada por:', marginX + (halfW / 2), sigY + 8.5, { align: 'center' });
  doc.text('Revisado por:', marginX + halfW + (halfW / 2), sigY + 8.5, { align: 'center' });

  doc.setFillColor(255, 255, 255);
  doc.rect(marginX, sigY + 10, halfW, 11, 'FD');
  doc.rect(marginX + halfW, sigY + 10, halfW, 11, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(inspector, marginX + (halfW / 2), sigY + 15, { align: 'center' });
  doc.text(revisor, marginX + halfW + (halfW / 2), sigY + 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Inspector SSA', marginX + (halfW / 2), sigY + 18.5, { align: 'center' });
  doc.text('Coordinador / Especialista SSA', marginX + halfW + (halfW / 2), sigY + 18.5, { align: 'center' });

  // 9. PIE DE PÁGINA INSTITUCIONAL EN TODAS LAS HOJAS
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Grupo Duncan · Sistema de Gestión de Seguridad, Salud y Ambiente (SG-SSA) · Ref: INSP-${correlStr}`,
      marginX,
      208
    );
    doc.text(
      `Página ${p} de ${totalPages} · Documento Oficial con Formulario Editable`,
      pageWidth - marginX,
      208,
      { align: 'right' }
    );
  }

  const fileName = `Plan_Accion_${estNombre.replace(/\s+/g, '_')}_${correlStr}.pdf`;
  const blob = doc.output('blob');

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    doc.save(fileName);
  }

  auditService.logExport('PDF', fileName, 'PlanAccion', inspeccion.id).catch(console.warn);
  return { doc, fileName, blob };
}

/**
 * Genera la cadena CSV oficial idéntica a la plantilla institucional Duncan
 */
export function generateActionPlanCSV(
  inspeccion: Inspeccion,
  items: PlanAccion[],
  meta?: ActionPlanExportMeta
): string {
  const empNombre = (meta?.empresaNombre || inspeccion.empresaNombre || 'DISTRIBUIDORA DUNCAN C.A.').toUpperCase();
  const locNombre = (meta?.localidadNombre || inspeccion.localidadNombre || 'VALENCIA').toUpperCase();
  const estNombre = (meta?.establecimientoNombre || inspeccion.establecimientoNombre || 'DISTRIBUIDORA DUNCAN VALENCIA').toUpperCase();
  const tipoNom = meta?.tipoNombre || inspeccion.tipoNombre || 'Distribuidoras';
  const tipoCod = meta?.tipoCodigo || inspeccion.tipoCodigo || 'DD';
  const mesAno = getMesAno(inspeccion.fecha);
  const correlStr = String(inspeccion.correlativo || (inspeccion.referencia ? inspeccion.referencia.replace(/^REF-|^INSP-/, '') : '14'));
  const headerTipo = getReportHeaderTitle(tipoNom, tipoCod);

  const puntuacionVal = typeof inspeccion.puntuacion === 'number' ? inspeccion.puntuacion : 92.3;
  const nivelConf = getNivelConformidad(puntuacionVal);
  const puntDecimal = (puntuacionVal / 100).toFixed(4);

  const fechaInsp = inspeccion.fecha ? String(inspeccion.fecha).split('T')[0] : '2026-04-22';
  const dClose = new Date(fechaInsp);
  const fechaCierre = isNaN(dClose.getTime()) 
    ? '2026-04-24' 
    : new Date(dClose.getTime() + 15 * 86400000).toISOString().split('T')[0];

  const inspector = inspeccion.inspector || 'Alberto Becerra';
  const revisor = meta?.revisorNombre || 'Jesús Contreras';

  const lines: string[] = [];

  // 1. Encabezado de Programa y Código
  lines.push(`"Programa de Seguridad y Salud en el Trabajo\n${tipoNom.toUpperCase().includes('SERVI') ? 'Inspección de Servicentros' : 'Inspección de Distribuidoras'}",,,,,,,,,`);
  lines.push(`Código,Departamento emisor,,,,,,,,,N° Revisión:`);
  lines.push(`PLAN-ACC-${tipoCod},Departamento de Seguridad y Salud Laboral (SSA),,,,,,,,,0`);

  // 2. Títulos de Plan de Acción
  lines.push(`PLAN ACCION ${estNombre} ${mesAno},,,,,,,,,,`);
  lines.push(`PLAN DE ACCIÓN DERIVADO DE ${headerTipo},,,,,,,,,,`);
  lines.push(`,,,,,,,,,,`);

  // 3. Ficha de Control
  lines.push(`Id,EMPRESA - LOCALIDAD - ESTABLECIMIENTO - FECHA,,,,,Ronda N°,Fecha de Inspección,Fecha de Cierre,Porcentaje Obtenido,Nivel de Conformidad`);
  lines.push(`${correlStr},${empNombre} - ${locNombre} - ${estNombre} - ${mesAno},,,,,${meta?.rondaNo || 1},${fechaInsp},${fechaCierre},${puntDecimal},${nivelConf}`);
  lines.push(`,,,,,,,,,,`);

  // 4. Leyenda
  lines.push(`"LEYENDA: C: Conforme; OM: Oportunidad de Mejora; NC: No Conforme; NA: No aplica; SSA: Seguridad; Salud, Ambiente; INFRA: Infraestructura; VEHCP: Vehículos y Equipos Móviles; LEGAL: Legal / Normativo",,,,,,,,,,`);
  lines.push(`,,,,,,,,,,`);

  // 5. Tabla de Desviaciones (Columnas Oficiales)
  lines.push(`Aspectos evaluado,Preguntas,Aspecto legal -técnico,Grupos o familias,Areas responsables,Conformidad,Prioridad,Fecha de ejecución,Fecha de verificación,Recursos necesarios,Observaciones`);

  items.forEach(item => {
    const asp = `"${(item.aspectoEvaluado || item.seccion || 'Seguridad Industrial').replace(/"/g, '""').trim()}"`;
    const preg = `"${(item.preguntaTexto || item.hallazgo || '').replace(/"/g, '""').trim()}"`;
    const legal = `"${(item.aspectoLegal || item.notas || 'COVENIN / RCHST').replace(/"/g, '""').trim()}"`;
    const grupo = `"${(item.grupoPilar || 'SSA').replace(/"/g, '""').trim()}"`;
    const area = `"${(item.areaResponsable || item.departamento || 'VENTAS - OPERACIONES').replace(/"/g, '""').trim()}"`;
    const conf = item.conformidad || (item.prioridad === 'Critica' ? 'NC' : 'OM');
    const prio = item.prioridad || (conf === 'NC' ? 'Alta' : 'Media');
    const fEjec = item.fechaEjecucion || item.fechaLimite || '';
    const fVerif = item.fechaVerificacion || '';
    const recursos = `"${(item.recursosNecesarios || '').replace(/"/g, '""')}"`;
    const obs = `"${(item.observaciones || item.recomendacion || '').replace(/"/g, '""')}"`;

    lines.push(`${asp},${preg},${legal},${grupo},${area},${conf},${prio},${fEjec},${fVerif},${recursos},${obs}`);
  });

  // 6. Firmas de Cierre
  lines.push(`,,,,,,,,,,`);
  lines.push(`Personal que realizó la Inspección,,,,,,,,,,`);
  lines.push(`Realizada por:,,,,Revisado por:,,,,,,`);
  lines.push(`"${inspector.replace(/"/g, '""')}",,,,"${revisor.replace(/"/g, '""')}",,,,,,`);

  return lines.join('\r\n');
}

/**
 * Descarga el archivo CSV oficial con UTF-8 BOM
 */
export function downloadActionPlanCSV(
  inspeccion: Inspeccion,
  items: PlanAccion[],
  meta?: ActionPlanExportMeta
) {
  const csvContent = generateActionPlanCSV(inspeccion, items, meta);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const correlStr = String(inspeccion.correlativo || (inspeccion.referencia ? inspeccion.referencia.replace(/^REF-|^INSP-/, '') : '1001'));
  const filename = `Plan_Accion_${inspeccion.establecimientoNombre ? inspeccion.establecimientoNombre.replace(/\s+/g, '_') : 'Sede'}_${correlStr}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  auditService.logExport('CSV', filename, 'PlanAccion', inspeccion.id).catch(console.warn);
}

/**
 * Genera el asunto y cuerpo de correo electrónico oficial institucional para la gerencia
 */
export function generateActionPlanEmailData(
  inspeccion: Inspeccion,
  items: PlanAccion[],
  meta?: ActionPlanExportMeta
): { subject: string; body: string; mailtoUrl: string } {
  const estNombre = meta?.establecimientoNombre || inspeccion.establecimientoNombre || 'Distribuidora Valencia';
  const empNombre = meta?.empresaNombre || inspeccion.empresaNombre || 'Grupo Duncan';
  const correlStr = String(inspeccion.correlativo || (inspeccion.referencia ? inspeccion.referencia.replace(/^REF-|^INSP-/, '') : '1001'));
  const refCode = inspeccion.referencia || `INSP-${correlStr}`;
  const fechaInsp = formatDate(inspeccion.fecha);
  const puntuacionVal = typeof inspeccion.puntuacion === 'number' ? inspeccion.puntuacion : 100;
  const nivelConf = getNivelConformidad(puntuacionVal);

  const ncs = items.filter(i => (i.conformidad === 'NC') || (i.prioridad === 'Critica') || (i.hallazgo || '').includes('NO CONFORME'));
  const oms = items.filter(i => (i.conformidad === 'OM') || !ncs.includes(i));

  const subject = `PLAN DE ACCIÓN DERIVADO DE INSPECCIÓN — ${estNombre.toUpperCase()} (Ref: ${refCode})`;

  const itemsListText = items.map((it, idx) => {
    const tipoBadge = it.conformidad || (it.prioridad === 'Critica' ? 'NC' : 'OM');
    return `${idx + 1}. [${tipoBadge}] ${it.aspectoEvaluado || it.seccion || 'Área'}: ${it.preguntaTexto || it.hallazgo}\n   • Norma: ${it.aspectoLegal || 'Normativa técnica aplicable'}\n   • Responsable: ${it.areaResponsable || it.departamento || 'Operaciones'}\n   • Fecha Límite Ejecución: ${it.fechaEjecucion || it.fechaLimite || '15 días'}`;
  }).join('\n\n');

  const body = `Estimado Equipo de Gerencia, Operaciones y Establecimiento,
${estNombre} · ${empNombre}

Por medio de la presente, la Coordinación del Sistema de Gestión de Seguridad, Salud y Ambiente (SG-SSA) de Acumuladores Duncan emite formalmente el PLAN DE ACCIÓN DERIVADO DE LA INSPECCIÓN TÉCNICA realizada el ${fechaInsp}.

RESUMEN EJECUTIVO DE LA EVALUACIÓN:
==================================================
• Establecimiento: ${estNombre} (${inspeccion.localidadNombre || 'General'})
• N° de Inspección: ${refCode} (Correlativo: N° ${correlStr})
• Puntuación Obtenida: ${puntuacionVal}% (Nivel de Conformidad: ${nivelConf})
• No Conformidades Críticas (NC): ${ncs.length} (Plazo perentorio de subsanación: 15 días continuos)
• Oportunidades de Mejora (OM): ${oms.length} (Plazo de adecuación: 30 días continuos)
• Total Acciones Requeridas: ${items.length}

DETALLE DE ACCIONES CORRECTIVAS Y PREVENTIVAS REQUERIDAS:
==================================================
${itemsListText}

INSTRUCCIONES DE SEGUIMIENTO:
1. Las áreas responsables deben coordinar de inmediato las adecuaciones físicas, operativas y documentales señaladas.
2. Cada acción debe contar con su registro fotográfico de subsanación para el cierre formal del punto.
3. Se adjuntan los archivos oficiales generados por la plataforma SGD Duncan 2.0:
   - Archivo Excel Profesional (.xlsx): Formato oficial para seguimiento de cuadrillas y gerencia.
   - Archivo PDF Interactivo Editable (.pdf): Documento formal con campos interactivos editables para registro de fecha de subsanación, verificación y recursos.

Atentamente,
Departamento de Seguridad y Salud Laboral (SSA)
Acumuladores Duncan, C.A. / Grupo Duncan`;

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { subject, body, mailtoUrl };
}
