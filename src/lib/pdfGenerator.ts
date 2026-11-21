import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './utils';
import { getFormDefinition } from './formDefinitions';
import type { Inspeccion } from '../types';

interface PDFGeneratorResult {
  doc: jsPDF;
  fileName: string;
  blob: Blob;
  dataUri: string;
}

/**
 * Mapeo legal y de códigos documentales oficiales Duncan por tipo de inspección
 */
function getDocumentControlInfo(tipoCodigo: string, tipoNombre: string): { docCode: string; legalRef: string; docTitle: string } {
  const code = (tipoCodigo || '').toUpperCase();
  const name = (tipoNombre || '').toLowerCase();

  if (code.includes('EXT') || name.includes('extintor')) {
    return {
      docCode: 'SST-F-EXT-01',
      legalRef: 'CUMPLIMIENTO COVENIN 1040 / COVENIN 758 / LOPCYMAT ART. 53, 54, 59-62',
      docTitle: 'ACTA DE INSPECCIÓN: EXTINTORES PORTÁTILES'
    };
  }
  if (code.includes('FYD') || code.includes('FLP') || name.includes('ducha') || name.includes('lavaojo')) {
    return {
      docCode: 'SST-F-DLA-02',
      legalRef: 'CUMPLIMIENTO COVENIN 3478 / ANSI Z358.1 / LOPCYMAT ART. 53, 54, 59-62',
      docTitle: 'ACTA DE INSPECCIÓN: FUENTES Y DUCHAS DE EMERGENCIA'
    };
  }
  if (code.includes('MTCG') || code.includes('IMC') || name.includes('montacarga')) {
    return {
      docCode: 'SST-F-MTC-03',
      legalRef: 'CUMPLIMIENTO COVENIN 2245 / COVENIN 3188 / LOPCYMAT ART. 53, 54, 59-62',
      docTitle: 'ACTA DE INSPECCIÓN: MONTACARGAS Y EQUIPOS MÓVILES'
    };
  }
  if (code.includes('SC') || name.includes('servicentro')) {
    return {
      docCode: 'SST-F-SRV-04',
      legalRef: 'CUMPLIMIENTO LOPCYMAT / NT-01-2008 / NORMAS COVENIN VIGENTES',
      docTitle: 'ACTA DE INSPECCIÓN: SSA SERVICENTROS DUNCAN'
    };
  }
  if (code.includes('DD') || code.includes('DIST') || name.includes('distribuidora')) {
    return {
      docCode: 'SST-F-DST-05',
      legalRef: 'CUMPLIMIENTO LOPCYMAT / NT-01-2008 / NORMAS COVENIN VIGENTES',
      docTitle: 'ACTA DE INSPECCIÓN: SSA DISTRIBUIDORAS DUNCAN'
    };
  }
  if (code.includes('VHT') || code.includes('VTC') || name.includes('vehiculo') || name.includes('transporte')) {
    return {
      docCode: 'SST-F-TRP-06',
      legalRef: 'CUMPLIMIENTO COVENIN 2226 / INTT / LOPCYMAT ART. 53, 54, 59-62',
      docTitle: 'ACTA DE INSPECCIÓN: TRANSPORTE Y FLOTA VEHICULAR'
    };
  }
  if (code.includes('OL') || name.includes('limpieza') || name.includes('orden')) {
    return {
      docCode: 'SST-F-OYL-07',
      legalRef: 'CUMPLIMIENTO COVENIN 2226 / 5S INDUSTRIAL / LOPCYMAT ART. 53, 54, 59-62',
      docTitle: 'ACTA DE INSPECCIÓN: ORDEN Y LIMPIEZA INDUSTRIAL'
    };
  }
  if (code.includes('BTQ') || name.includes('botiquin') || name.includes('botiquín')) {
    return {
      docCode: 'SST-F-BTQ-08',
      legalRef: 'CUMPLIMIENTO COVENIN 2605 / COVENIN 3478 / LOPCYMAT ART. 53, 54, 59-62',
      docTitle: 'ACTA DE INSPECCIÓN: BOTIQUINES DE PRIMEROS AUXILIOS'
    };
  }
  if (code.includes('LEM') || name.includes('lampara') || name.includes('iluminacion') || name.includes('luces')) {
    return {
      docCode: 'SST-F-LUM-09',
      legalRef: 'CUMPLIMIENTO COVENIN 1472 / LOPCYMAT ART. 53, 54, 59-62',
      docTitle: 'ACTA DE INSPECCIÓN: ILUMINACIÓN Y LUCES DE EMERGENCIA'
    };
  }
  if (code.includes('DI') || code.includes('SCI') || name.includes('incendio') || name.includes('alarma')) {
    return {
      docCode: 'SST-F-SCI-10',
      legalRef: 'CUMPLIMIENTO COVENIN 1376 / 1331 / LOPCYMAT ART. 53, 54, 59-62',
      docTitle: 'ACTA DE INSPECCIÓN: SISTEMAS DE PROTECCIÓN CONTRA INCENDIOS'
    };
  }
  if (code.includes('EPP') || name.includes('epp') || name.includes('proteccion')) {
    return {
      docCode: 'SST-F-EPP-11',
      legalRef: 'CUMPLIMIENTO LOPCYMAT ART. 53, 54, 59-62 / NT-03-2016',
      docTitle: 'ACTA DE INSPECCIÓN: EQUIPOS DE PROTECCIÓN PERSONAL (E.P.P.)'
    };
  }

  return {
    docCode: `SST-F-${code || 'GEN'}-01`,
    legalRef: 'CUMPLIMIENTO LOPCYMAT ART. 53, 54, 59-62 / NORMAS COVENIN E INPSASEL VIGENTES',
    docTitle: `ACTA DE INSPECCIÓN TÉCNICA: ${(tipoNombre || 'GESTIÓN SSA').toUpperCase()}`
  };
}

/**
 * Generador Universal de Reportes de Inspección en PDF con Estándar Corporativo Duncan SAP/ISO
 * Idéntico en arquitectura, calidad de vectores y rigor legal a Acta_EPP... (PDF 1)
 */
export function generarInspeccionPDF(inspection: Inspeccion, metadataInput?: any): PDFGeneratorResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 187.9 mm
  let currentY = 14;

  // Resolver metadatos y definición de formulario de forma exhaustiva
  const tipoCodigo = inspection.tipoCodigo || 'GEN';
  const tipoNombre = inspection.tipoNombre || 'Inspección Técnica SSA';
  const formDef = getFormDefinition(tipoCodigo) ||
                  getFormDefinition(inspection.tipoInspeccionId) ||
                  getFormDefinition(tipoNombre);

  const sections = formDef?.sections || metadataInput?.tipo?.secciones || [];
  const { docCode, legalRef, docTitle } = getDocumentControlInfo(tipoCodigo, tipoNombre);

  const empresaNombre = inspection.empresaNombre || metadataInput?.empresa?.nombre || 'DISTRIBUIDORA DUNCAN, C.A.';
  const rif = metadataInput?.empresa?.rif || 'J-00041246-0';
  const localidadNombre = inspection.localidadNombre || metadataInput?.localidad?.nombre || 'CARACAS';
  const establecimientoNombre = inspection.establecimientoNombre || metadataInput?.establecimiento?.nombre || 'SEDE PRINCIPAL';
  const inspector = (inspection.inspector || inspection.inspectorId || 'FRANCISCO ROJAS').toUpperCase();
  const refCode = inspection.referencia || (inspection.id || (inspection as any)._id || 'INSP-1001').substring(0, 10).toUpperCase();
  const correlativoStr = inspection.correlativo ? `N° ${String(inspection.correlativo).padStart(4, '0')}` : refCode;
  const emisionDate = formatDate(inspection.fecha);

  // Parsear respuestas y firmas
  let respuestas: Record<string, any> = {};
  if (inspection.respuestas && typeof inspection.respuestas === 'object') {
    respuestas = { ...inspection.respuestas };
  } else if (inspection.formResponses) {
    try { respuestas = JSON.parse(inspection.formResponses); } catch { respuestas = {}; }
  }

  let firmas: Record<string, string> = {};
  if (inspection.firmas && typeof inspection.firmas === 'object') {
    firmas = { ...inspection.firmas };
  } else if (inspection.formSignatures) {
    try { firmas = JSON.parse(inspection.formSignatures); } catch { firmas = {}; }
  }

  // 1. ENCABEZADO INSTITUCIONAL CORPORATIVO (FORMATO SAP / ISO 9001 DUNCAN - 3 CAJAS)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(marginX, currentY, contentWidth, 24);

  const col1W = contentWidth * 0.22; // 41.3 mm
  const col2W = contentWidth * 0.50; // 94.0 mm
  const col3W = contentWidth * 0.28; // 52.6 mm

  doc.line(marginX + col1W, currentY, marginX + col1W, currentY + 24);
  doc.line(marginX + col1W + col2W, currentY, marginX + col1W + col2W, currentY + 24);

  // Columna 1: Bloque Marca Duncan SSA
  doc.setFillColor(0, 75, 147); // Azul Corporativo Duncan #004B93
  doc.roundedRect(marginX + 4, currentY + 3.5, col1W - 8, 10, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DUNCAN', marginX + col1W / 2, currentY + 10, { align: 'center' });

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(6.5);
  doc.text('GESTIÓN INTEGRAL', marginX + col1W / 2, currentY + 17.5, { align: 'center' });
  doc.text('SEGURIDAD Y SALUD (SSA)', marginX + col1W / 2, currentY + 21, { align: 'center' });

  // Columna 2: Título Central de Protocolo
  const centerColX = marginX + col1W + col2W / 2;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PROGRAMA DE SEGURIDAD Y SALUD EN EL TRABAJO', centerColX, currentY + 7.5, { align: 'center' });

  doc.setTextColor(0, 40, 85); // #002855 Azul Marino
  doc.setFontSize(10.5);
  doc.text(docTitle, centerColX, currentY + 14, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(legalRef, centerColX, currentY + 19.5, { align: 'center' });

  // Columna 3: Matriz Técnica de Control Documental
  const col3X = marginX + col1W + col2W;
  doc.setLineWidth(0.25);
  doc.line(col3X, currentY + 6, col3X + col3W, currentY + 6);
  doc.line(col3X, currentY + 12, col3X + col3W, currentY + 12);
  doc.line(col3X, currentY + 18, col3X + col3W, currentY + 18);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CÓDIGO DOC:', col3X + 2, currentY + 4.2);
  doc.text('ID TRANS:', col3X + 2, currentY + 10.2);
  doc.text('EMISIÓN:', col3X + 2, currentY + 16.2);
  doc.text('ESTATUS:', col3X + 2, currentY + 22.2);

  doc.setFont('helvetica', 'normal');
  doc.text(docCode, col3X + 20, currentY + 4.2);
  doc.text(correlativoStr, col3X + 20, currentY + 10.2);
  doc.text(emisionDate, col3X + 20, currentY + 16.2);

  const rawResultado = (inspection.resultado || 'C').toUpperCase();
  const isConforme = rawResultado === 'C' || (inspection.puntuacion ?? inspection.puntuacionConformidad ?? 100) >= 70;
  doc.setFont('helvetica', 'bold');
  if (rawResultado === 'C' || rawResultado === 'CONFORME') {
    doc.setTextColor(22, 101, 52); // Verde
    doc.text('CONFORME', col3X + 20, currentY + 22.2);
  } else if (rawResultado === 'NC' || rawResultado === 'NO CONFORME') {
    doc.setTextColor(185, 28, 28); // Rojo
    doc.text('NO CONFORME', col3X + 20, currentY + 22.2);
  } else {
    doc.setTextColor(180, 83, 9); // Ámbar
    doc.text('OBS. MAYOR', col3X + 20, currentY + 22.2);
  }

  currentY += 28;

  // 2. SECCIÓN 1.0: DATOS DE IDENTIFICACIÓN Y CONTROL TÉCNICO
  doc.setFillColor(0, 75, 147);
  doc.rect(marginX, currentY, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('1.0 DATOS DE IDENTIFICACIÓN Y CONTROL TÉCNICO', marginX + 3, currentY + 4.2);
  currentY += 6;

  const globalScore = inspection.puntuacion ?? inspection.puntuacionConformidad ?? 100;
  const nivelStr = globalScore >= 90 ? 'ALTO (CONFORME)' : globalScore >= 70 ? 'MEDIO (OBSERVACIONES)' : 'CRÍTICO (NO CONFORME)';
  const nivelColor: [number, number, number] = globalScore >= 90 ? [22, 101, 52] : globalScore >= 70 ? [180, 83, 9] : [185, 28, 28];

  const idBody: any[] = [
    [
      { content: 'EMPRESA:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 32 } },
      { content: empresaNombre.toUpperCase(), styles: { cellWidth: 68 } },
      { content: 'RIF / FISCAL:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 26 } },
      { content: rif, styles: { cellWidth: contentWidth - 126 } }
    ],
    [
      { content: 'ESTABLECIMIENTO:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: establecimientoNombre.toUpperCase() },
      { content: 'LOCALIDAD:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: localidadNombre.toUpperCase() }
    ],
    [
      { content: 'INSPECTOR SSA:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: inspector },
      { content: 'FECHA AUDITORÍA:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: emisionDate }
    ],
    [
      { content: 'TIPO DE PROTOCOLO:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: tipoNombre.toUpperCase() },
      { content: 'RESULTADO / ÍNDICE:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: `${globalScore}% — ${nivelStr}`, styles: { fontStyle: 'bold', textColor: nivelColor } }
    ]
  ];

  const addFields = formDef?.additionalFields || [];
  const addResp = (inspection.respuestasAdicionales || {}) as Record<string, any>;
  if (addFields.length > 0) {
    for (let i = 0; i < addFields.length; i += 2) {
      const f1 = addFields[i];
      const f2 = addFields[i + 1];
      const v1 = addResp[f1.id] ?? respuestas[f1.id] ?? '—';
      const v2 = f2 ? (addResp[f2.id] ?? respuestas[f2.id] ?? '—') : '';

      idBody.push([
        { content: `${f1.label.toUpperCase()}:`, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        { content: String(v1).toUpperCase() },
        { content: f2 ? `${f2.label.toUpperCase()}:` : '', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        { content: f2 ? String(v2).toUpperCase() : '' }
      ]);
    }
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [15, 23, 42],
      lineColor: [0, 0, 0],
      lineWidth: 0.25
    },
    body: idBody
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // 3. SECCIÓN 2.0: RESUMEN NUMÉRICO Y DETERMINACIÓN DE CONFORMIDAD
  // Cálculo exacto de estadísticas por sección
  interface SectionStat {
    id: string;
    titulo: string;
    total: number;
    c: number;
    nc: number;
    om: number;
    na: number;
    pct: number;
  }

  const sectionStats: SectionStat[] = sections.map((sec: any) => {
    let c = 0, nc = 0, om = 0, na = 0, total = 0;
    (sec.items || []).forEach((item: any) => {
      const rawVal = respuestas[item.id];
      if (rawVal === undefined || rawVal === null || rawVal === '') return;
      total++;
      const val = String(rawVal).toUpperCase().trim();
      if (['C', 'BUENO', 'SI', 'SÍ', 'OPERATIVO', 'OK', 'CONFORME', 'EXISTE'].includes(val)) c++;
      else if (['NC', 'DANADO', 'DAÑADO', 'NO', 'NO OPERATIVO', 'NO CONFORME', 'CRITICO', 'CRÍTICO', 'NO_EXISTE'].includes(val)) nc++;
      else if (val === 'OM') om++;
      else if (['NA', 'N/A', 'NO APLICA'].includes(val)) na++;
      else c++; // Texto descriptivo o informativo cuenta como conforme si fue registrado
    });
    const applicable = total - na;
    const pct = applicable > 0 ? Math.round((c / applicable) * 100) : 100;
    return {
      id: sec.id,
      titulo: sec.title || sec.titulo || 'Sección General',
      total, c, nc, om, na, pct
    };
  });

  const totTotal = sectionStats.reduce((acc, s) => acc + s.total, 0);
  const totC = sectionStats.reduce((acc, s) => acc + s.c, 0);
  const totNC = sectionStats.reduce((acc, s) => acc + s.nc, 0);
  const totOM = sectionStats.reduce((acc, s) => acc + s.om, 0);
  const totNA = sectionStats.reduce((acc, s) => acc + s.na, 0);

  doc.setFillColor(0, 75, 147);
  doc.rect(marginX, currentY, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('2.0 RESUMEN NUMÉRICO Y DETERMINACIÓN DE CONFORMIDAD', marginX + 3, currentY + 4.2);
  currentY += 6;

  const summaryBody = sectionStats.map(s => [
    s.titulo.toUpperCase(),
    String(s.total),
    String(s.c),
    String(s.nc),
    String(s.om),
    String(s.na),
    `${s.pct}%`
  ]);

  summaryBody.push([
    'PUNTUACIÓN GLOBAL Y TOTALES AUDITADOS:',
    String(totTotal),
    String(totC),
    String(totNC),
    String(totOM),
    String(totNA),
    `${globalScore}%`
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
    theme: 'grid',
    headStyles: {
      fillColor: [226, 232, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 7.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
      halign: 'center'
    },
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 85, halign: 'left', fontStyle: 'bold' },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 16, halign: 'center', textColor: [22, 101, 52], fontStyle: 'bold' },
      3: { cellWidth: 16, halign: 'center', textColor: [185, 28, 28], fontStyle: 'bold' },
      4: { cellWidth: 16, halign: 'center', textColor: [180, 83, 9], fontStyle: 'bold' },
      5: { cellWidth: 16, halign: 'center', textColor: [100, 116, 139] },
      6: { cellWidth: 22.9, halign: 'center', fontStyle: 'bold' }
    },
    head: [['SECCIÓN / ÁREA DE EVALUACIÓN', 'TOTAL', 'C', 'NC', 'OM', 'NA', 'CONFORME']],
    body: summaryBody,
    didParseCell: (data) => {
      // Estilo para la fila de totales
      if (data.row.index === summaryBody.length - 1) {
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.fontStyle = 'bold';
        if (data.column.index === 6) {
          data.cell.styles.textColor = nivelColor;
          data.cell.styles.fontSize = 8.5;
        }
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // 4. SECCIÓN 3.0: DETALLE TÉCNICO DE EVALUACIÓN Y PUNTOS DE CONTROL
  // Si estamos muy cerca del pie de página, abrir nueva página para el detalle
  if (currentY + 25 > pageHeight - 20) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFillColor(0, 75, 147);
  doc.rect(marginX, currentY, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('3.0 DETALLE TÉCNICO DE EVALUACIÓN Y PUNTOS DE CONTROL', marginX + 3, currentY + 4.2);
  currentY += 6;

  // Construir filas para todos los ítems por sección
  const itemsTableRows: any[] = [];
  sections.forEach((sec: any, secIdx: number) => {
    // Fila cabecera de sección dentro de la tabla
    itemsTableRows.push([
      {
        content: `SECCIÓN ${secIdx + 1}: ${(sec.title || sec.titulo || '').toUpperCase()}`,
        colSpan: 4,
        styles: {
          fillColor: [241, 245, 249],
          textColor: [0, 40, 85],
          fontStyle: 'bold',
          fontSize: 7.5,
          halign: 'left'
        }
      }
    ]);

    (sec.items || []).forEach((item: any, itIdx: number) => {
      const rawVal = respuestas[item.id] ?? '—';
      const valUpper = String(rawVal).toUpperCase().trim();

      let smallVal = String(rawVal);
      let textColor: [number, number, number] = [0, 0, 0];

      if (['C', 'BUENO', 'SI', 'SÍ', 'OPERATIVO', 'OK', 'CONFORME', 'EXISTE'].includes(valUpper)) {
        smallVal = valUpper === 'C' ? 'CONFORME (C)' : valUpper === 'SI' ? 'SÍ' : valUpper;
        textColor = [22, 101, 52];
      } else if (['NC', 'DANADO', 'DAÑADO', 'NO', 'NO OPERATIVO', 'NO CONFORME', 'CRITICO', 'CRÍTICO', 'NO_EXISTE'].includes(valUpper)) {
        smallVal = valUpper === 'NC' ? 'NO CONFORME (NC)' : valUpper;
        textColor = [185, 28, 28];
      } else if (valUpper === 'OM') {
        smallVal = 'OBSERVACIÓN (OM)';
        textColor = [180, 83, 9];
      } else if (['NA', 'N/A', 'NO APLICA'].includes(valUpper)) {
        smallVal = 'NO APLICA';
        textColor = [100, 116, 139];
      }

      const itemRef = item.referenciaLegal || item.referencia || 'NORMA COVENIN / SST';
      const itemLabel = item.pregunta || item.label || `Punto ${item.id}`;

      itemsTableRows.push([
        item.id || String(itIdx + 1),
        itemLabel,
        itemRef,
        {
          content: smallVal,
          styles: { fontStyle: 'bold', textColor, halign: 'center' }
        }
      ]);
    });
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
    theme: 'grid',
    showHead: 'everyPage',
    headStyles: {
      fillColor: [226, 232, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 7.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
      halign: 'center'
    },
    styles: {
      font: 'helvetica',
      fontSize: 7.2,
      cellPadding: 2,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 105, halign: 'left' },
      2: { cellWidth: 38, halign: 'left', fontSize: 6.5, textColor: [71, 85, 105] },
      3: { cellWidth: 32.9, halign: 'center' }
    },
    head: [['ID', 'PUNTO DE CONTROL / REQUERIMIENTO TÉCNICO', 'REFERENCIA NORMATIVA', 'CONFORMIDAD']],
    body: itemsTableRows,
    didDrawPage: (data) => {
      // Encabezado compacto en páginas subsiguientes
      if (data.pageNumber > 1) {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(0, 40, 85);
        doc.text(`SGD DUNCAN SSA | ${docTitle.toUpperCase()}`, marginX, 10);
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(7);
        doc.text(`TRANS: ${correlativoStr} | ${emisionDate}`, pageWidth - marginX, 10, { align: 'right' });
        doc.line(marginX, 12, pageWidth - marginX, 12);
      }

      // Pie de página oficial
      const footerY = pageHeight - 8;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(marginX, footerY - 3, pageWidth - marginX, footerY - 3);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(`ERP REG: ${docCode}-MOD-090`, marginX, footerY);
      doc.text(`DOCUMENTO GENERADO POR SISTEMA SGD-DUNCAN`, pageWidth / 2, footerY, { align: 'center' });
      doc.text('GRUPO EMPRESARIAL DUNCAN', pageWidth - marginX, footerY, { align: 'right' });
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // 5. SECCIÓN 4.0: OBSERVACIONES TÉCNICAS Y RECOMENDACIONES
  const observaciones = inspection.observaciones ||
                        (typeof inspection.formObservations === 'string' && !inspection.formObservations.startsWith('{') ? inspection.formObservations : '') ||
                        'Sin observaciones adicionales registradas durante la inspección técnica.';

  if (currentY + 28 > pageHeight - 45) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFillColor(0, 75, 147);
  doc.rect(marginX, currentY, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('4.0 OBSERVACIONES TÉCNICAS Y RECOMENDACIONES', marginX + 3, currentY + 4.2);
  currentY += 6;

  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.rect(marginX, currentY, contentWidth, 16, 'FD');

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  const splitObs = doc.splitTextToSize(String(observaciones).substring(0, 400), contentWidth - 6);
  doc.text(splitObs, marginX + 3, currentY + 4.5);
  currentY += 20;

  // 6. SECCIÓN 5.0: PROTOCOLO DE VALIDACIÓN Y CIERRE CONFORME
  if (currentY + 48 > pageHeight - 12) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFillColor(229, 231, 235);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.rect(marginX, currentY, contentWidth, 6, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('5.0 PROTOCOLO DE VALIDACIÓN Y CIERRE CONFORME', marginX + contentWidth / 2, currentY + 4.2, { align: 'center' });
  currentY += 6;

  const signBoxHeight = 36;
  const halfW = contentWidth / 2;
  doc.rect(marginX, currentY, contentWidth, signBoxHeight);
  doc.line(marginX + halfW, currentY, marginX + halfW, currentY + signBoxHeight);

  // Columna Izquierda: Firma Inspector SSA
  const activeInspectorSig = firmas.inspector;
  if (activeInspectorSig && activeInspectorSig.startsWith('data:image')) {
    try {
      doc.addImage(activeInspectorSig, 'PNG', marginX + (halfW - 40) / 2, currentY + 2, 40, 18);
    } catch (e) {
      console.warn('No se pudo renderizar firma de inspector', e);
    }
  }

  doc.setLineWidth(0.3);
  doc.line(marginX + 14, currentY + 23, marginX + halfW - 14, currentY + 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text(inspector, marginX + halfW / 2, currentY + 27, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('FIRMA AUTORIZADA: INSPECTOR SST / SSA', marginX + halfW / 2, currentY + 31, { align: 'center' });
  doc.text('CONTROL DE AUDITORÍA Y VERIFICACIÓN EN CAMPO', marginX + halfW / 2, currentY + 34, { align: 'center' });

  // Columna Derecha: Validación Responsable / Sede
  const activeRevisorSig = firmas.revisor;
  if (activeRevisorSig && activeRevisorSig.startsWith('data:image')) {
    try {
      doc.addImage(activeRevisorSig, 'PNG', marginX + halfW + (halfW - 40) / 2, currentY + 2, 40, 18);
    } catch (e) {
      console.warn('No se pudo renderizar firma de revisor', e);
    }
  }

  doc.setTextColor(0, 0, 0);
  doc.line(marginX + halfW + 14, currentY + 23, marginX + contentWidth - 14, currentY + 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('RESPONSABLE DE ESTABLECIMIENTO / SUPERVISIÓN', marginX + halfW + halfW / 2, currentY + 27, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('FIRMA Y SELLO: GERENCIA / JEFATURA', marginX + halfW + halfW / 2, currentY + 31, { align: 'center' });
  doc.text(`VALIDACIÓN CONFORME: ${establecimientoNombre.toUpperCase()}`, marginX + halfW + halfW / 2, currentY + 34, { align: 'center' });

  // 7. SEGUNDA PASADA: NUMERACIÓN DINÁMICA DE PÁGINAS (PÁGINA X / Y)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(0, 0, 0);
    doc.text(`DOCUMENTO GENERADO POR SISTEMA SGD-DUNCAN - PÁGINA ${i} / ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
  }

  const cleanTipo = (tipoCodigo || 'INSP').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanId = (inspection.correlativo ? `N${String(inspection.correlativo).padStart(4, '0')}` : refCode).replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanFecha = (inspection.fecha || new Date().toISOString().slice(0, 10)).replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Acta_Inspeccion_${cleanTipo}_${cleanId}_${cleanFecha}.pdf`;

  const blob = doc.output('blob');
  const dataUri = doc.output('datauristring');

  return { doc, fileName, blob, dataUri };
}

/**
 * Generador Ejecutivo de Reportes Consolidados en PDF (formato estándar para ReportesPage)
 */
export function generarConsolidadoEjecutivoPDF(
  inspecciones: Inspeccion[],
  filtroEmpresaNombre: string,
  tasaCumplimiento: number
): { doc: jsPDF; fileName: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  let currentY = 14;

  // Header 3 Cajas
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(marginX, currentY, contentWidth, 24);

  const col1W = contentWidth * 0.22;
  const col2W = contentWidth * 0.50;
  const col3W = contentWidth * 0.28;

  doc.line(marginX + col1W, currentY, marginX + col1W, currentY + 24);
  doc.line(marginX + col1W + col2W, currentY, marginX + col1W + col2W, currentY + 24);

  // Logo Duncan
  doc.setFillColor(0, 75, 147);
  doc.roundedRect(marginX + 4, currentY + 3.5, col1W - 8, 10, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DUNCAN', marginX + col1W / 2, currentY + 10, { align: 'center' });

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(6.5);
  doc.text('GESTIÓN INTEGRAL', marginX + col1W / 2, currentY + 17.5, { align: 'center' });
  doc.text('SEGURIDAD Y SALUD (SSA)', marginX + col1W / 2, currentY + 21, { align: 'center' });

  // Título
  const centerColX = marginX + col1W + col2W / 2;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PROGRAMA DE SEGURIDAD Y SALUD EN EL TRABAJO', centerColX, currentY + 7.5, { align: 'center' });

  doc.setTextColor(0, 40, 85);
  doc.setFontSize(11);
  doc.text('INFORME EJECUTIVO DE GESTIÓN Y AUDITORÍA SSA', centerColX, currentY + 14, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('CONSOLIDACIÓN CORPORATIVA DE AUDITORÍAS / LOPCYMAT ART. 53-62', centerColX, currentY + 19.5, { align: 'center' });

  // Metadatos
  const col3X = marginX + col1W + col2W;
  doc.setLineWidth(0.25);
  doc.line(col3X, currentY + 6, col3X + col3W, currentY + 6);
  doc.line(col3X, currentY + 12, col3X + col3W, currentY + 12);
  doc.line(col3X, currentY + 18, col3X + col3W, currentY + 18);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CÓDIGO DOC:', col3X + 2, currentY + 4.2);
  doc.text('EMISIÓN:', col3X + 2, currentY + 10.2);
  doc.text('TOTAL AUD:', col3X + 2, currentY + 16.2);
  doc.text('ÍNDICE SSA:', col3X + 2, currentY + 22.2);

  doc.setFont('helvetica', 'normal');
  doc.text('SST-F-INF-CONSOLIDADO', col3X + 20, currentY + 4.2);
  doc.text(new Date().toLocaleDateString('es-VE'), col3X + 20, currentY + 10.2);
  doc.text(String(inspecciones.length), col3X + 20, currentY + 16.2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text(`${tasaCumplimiento}%`, col3X + 20, currentY + 22.2);

  currentY += 28;

  // Sección 1.0: Filtros y Parámetros
  doc.setFillColor(0, 75, 147);
  doc.rect(marginX, currentY, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('1.0 PARÁMETROS DEL INFORME CONSOLIDADO', marginX + 3, currentY + 4.2);
  currentY += 6;

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 2, textColor: [15, 23, 42], lineColor: [0, 0, 0], lineWidth: 0.25 },
    body: [
      [
        { content: 'ALCANCE EMPRESARIAL:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 40 } },
        { content: filtroEmpresaNombre.toUpperCase(), styles: { cellWidth: 54 } },
        { content: 'TOTAL INSPECCIONES:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 38 } },
        { content: String(inspecciones.length), styles: { cellWidth: contentWidth - 132 } }
      ],
      [
        { content: 'TASA GLOBAL DE CUMPLIMIENTO:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        { content: `${tasaCumplimiento}% (${tasaCumplimiento >= 85 ? 'CONFORME' : 'REQUIERE ATENCIÓN'})`, styles: { fontStyle: 'bold', textColor: tasaCumplimiento >= 85 ? [22, 101, 52] : [185, 28, 28] } },
        { content: 'SISTEMA EMISOR:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        { content: 'SGD DUNCAN 2.0 (PWA CLOUD)' }
      ]
    ]
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // Sección 2.0: Resumen de Auditorías
  doc.setFillColor(0, 75, 147);
  doc.rect(marginX, currentY, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('2.0 DETALLE DE INSPECCIONES Y AUDITORÍAS REGISTRADAS', marginX + 3, currentY + 4.2);
  currentY += 6;

  const tableData = inspecciones.map((it, idx) => [
    String(idx + 1).padStart(2, '0'),
    it.fecha ? formatDate(it.fecha) : '—',
    it.tipoNombre || it.tipoCodigo,
    it.establecimientoNombre || '—',
    it.inspector || '—',
    it.resultado || '—',
    `${it.puntuacion ?? 0}%`
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
    theme: 'grid',
    showHead: 'everyPage',
    headStyles: { fillColor: [226, 232, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7.5, lineColor: [0, 0, 0], lineWidth: 0.25, halign: 'center' },
    styles: { font: 'helvetica', fontSize: 7.2, cellPadding: 2, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.25, valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 48 },
      3: { cellWidth: 46 },
      4: { cellWidth: 32 },
      5: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      6: { cellWidth: 15.9, halign: 'center', fontStyle: 'bold' }
    },
    head: [['#', 'FECHA', 'TIPO DE INSPECCIÓN', 'ESTABLECIMIENTO', 'INSPECTOR', 'RESULT.', 'SCORE']],
    body: tableData.length > 0 ? tableData : [['—', '—', 'SIN REGISTROS', '—', '—', '—', '—']],
    didDrawPage: (data) => {
      const footerY = pageHeight - 8;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(marginX, footerY - 3, pageWidth - marginX, footerY - 3);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text('ERP REG: SST-CONSOL-MOD-090', marginX, footerY);
      doc.text(`DOCUMENTO GENERADO POR SISTEMA SGD-DUNCAN - PÁGINA ${data.pageNumber}`, pageWidth / 2, footerY, { align: 'center' });
      doc.text('GRUPO EMPRESARIAL DUNCAN', pageWidth - marginX, footerY, { align: 'right' });
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Protocolo de Firmas
  if (currentY + 45 > pageHeight - 12) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFillColor(229, 231, 235);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.rect(marginX, currentY, contentWidth, 6, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('3.0 VALIDACIÓN Y CONFORMIDAD EJECUTIVA', marginX + contentWidth / 2, currentY + 4.2, { align: 'center' });
  currentY += 6;

  const signBoxHeight = 34;
  const halfW = contentWidth / 2;
  doc.rect(marginX, currentY, contentWidth, signBoxHeight);
  doc.line(marginX + halfW, currentY, marginX + halfW, currentY + signBoxHeight);

  doc.setLineWidth(0.3);
  doc.line(marginX + 14, currentY + 22, marginX + halfW - 14, currentY + 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('FRANCISCO ROJAS', marginX + halfW / 2, currentY + 26, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('GERENCIA DE SEGURIDAD, SALUD Y AMBIENTE (SSA)', marginX + halfW / 2, currentY + 30, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.line(marginX + halfW + 14, currentY + 22, marginX + contentWidth - 14, currentY + 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('GERENCIA CORPORATIVA DE OPERACIONES', marginX + halfW + halfW / 2, currentY + 26, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('GRUPO EMPRESARIAL DUNCAN', marginX + halfW + halfW / 2, currentY + 30, { align: 'center' });

  // Paginación dinámica
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(0, 0, 0);
    doc.text(`DOCUMENTO GENERADO POR SISTEMA SGD-DUNCAN - PÁGINA ${i} / ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
  }

  const fileName = `Informe_Ejecutivo_SSA_${new Date().toISOString().slice(0, 10)}.pdf`;
  return { doc, fileName };
}
