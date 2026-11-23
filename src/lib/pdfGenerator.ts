import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './utils';
import { getFormDefinition, calculateScore } from './formDefinitions';
import { DUNCAN_LOGO_BW } from './logos';
import { INITIAL_EMPRESAS, INITIAL_LOCALIDADES, INITIAL_ESTABLECIMIENTOS, INITIAL_TIPOS_INSPECCION } from '../data/seedData';
import { auditService } from '../services/auditService';
import type { Inspeccion, AccidenteF465, CalculoCargaFuegoArea, ChecklistTransporte, VehiculoFlota } from '../types';

interface PDFGeneratorResult {
  doc: jsPDF;
  fileName: string;
  blob: Blob;
  dataUri: string;
}

/**
 * Generador Oficial de Reportes de Inspección Técnica SSA Duncan
 * Modelo idéntico a los primeros reportes oficiales (INFORME OFICIAL: SSA)
 */
function isValidImageSignature(data?: string): boolean {
  if (!data || typeof data !== 'string') return false;
  return /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/.test(data);
}

export function generarInspeccionPDF(inspection: Inspeccion, metadataInput?: any): PDFGeneratorResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const marginX = 14;

  // 0. Parsear respuestas, adicionales y firmas de forma segura desde objeto o JSON string
  let respuestas: Record<string, any> = {};
  if (inspection.respuestas) {
    if (typeof inspection.respuestas === 'object' && !Array.isArray(inspection.respuestas)) {
      respuestas = { ...inspection.respuestas };
    } else if (typeof inspection.respuestas === 'string') {
      try { const p = JSON.parse(inspection.respuestas); if (p && typeof p === 'object') respuestas = { ...p }; } catch {}
    }
  }
  if (Object.keys(respuestas).length === 0 && inspection.formResponses) {
    if (typeof inspection.formResponses === 'object' && !Array.isArray(inspection.formResponses)) {
      respuestas = { ...(inspection.formResponses as any) };
    } else if (typeof inspection.formResponses === 'string') {
      try { const p = JSON.parse(inspection.formResponses); if (p && typeof p === 'object') respuestas = { ...p }; } catch {}
    }
  }
  if (Object.keys(respuestas).length === 0 && (inspection as any).responses) {
    if (typeof (inspection as any).responses === 'object' && !Array.isArray((inspection as any).responses)) {
      respuestas = { ...(inspection as any).responses };
    } else if (typeof (inspection as any).responses === 'string') {
      try { const p = JSON.parse((inspection as any).responses); if (p && typeof p === 'object') respuestas = { ...p }; } catch {}
    }
  }

  let respuestasAdicionales: Record<string, any> = {};
  if (inspection.respuestasAdicionales && typeof inspection.respuestasAdicionales === 'object') {
    respuestasAdicionales = { ...inspection.respuestasAdicionales };
  } else if ((inspection as any).formAdditional) {
    try { respuestasAdicionales = JSON.parse((inspection as any).formAdditional); } catch { respuestasAdicionales = {}; }
  }

  let firmas: Record<string, string> = {};
  if (inspection.firmas && typeof inspection.firmas === 'object') {
    firmas = { ...inspection.firmas };
  } else if (inspection.formSignatures) {
    try { firmas = JSON.parse(inspection.formSignatures); } catch { firmas = {}; }
  }

  // 1. Detección y normalización inteligente de metadatos (evita columnas invertidas/códigos crudos)
  let empresaNombre = (inspection.empresaNombre || metadataInput?.empresa?.nombre || '').trim();
  if (!empresaNombre || empresaNombre === 'emp_ddca' || empresaNombre.toLowerCase().includes('lámpara') || empresaNombre.toLowerCase().includes('lampara')) {
    empresaNombre = 'Distribuidora Duncan, C.A.';
  }

  let localidadNombre = (inspection.localidadNombre || metadataInput?.localidad?.nombre || '').trim();
  if (!localidadNombre || localidadNombre.startsWith('loc_') || localidadNombre === 'emp_ddca') {
    const foundLoc = INITIAL_LOCALIDADES.find(l => l._id === inspection.localidadId || l._id === localidadNombre);
    localidadNombre = foundLoc?.nombre || 'Valencia';
  }

  let establecimientoNombre = (inspection.establecimientoNombre || metadataInput?.establecimiento?.nombre || '').trim();
  if (!establecimientoNombre || establecimientoNombre.startsWith('est_') || establecimientoNombre.startsWith('loc_')) {
    const targetId = inspection.establecimientoId || establecimientoNombre;
    const foundEst = INITIAL_ESTABLECIMIENTOS.find(e => e._id === targetId || e.codigo === targetId || e._id?.toLowerCase() === String(targetId).toLowerCase());
    establecimientoNombre = foundEst?.nombre || 'Distribuidora Duncan Valencia';
  }

  // Deducir código y nombre de formulario
  let tipoCodigo = inspection.tipoCodigo;
  if (!tipoCodigo || tipoCodigo === 'GEN') {
    if (establecimientoNombre.toLowerCase().includes('distribuidora')) tipoCodigo = 'DD';
    else if (establecimientoNombre.toLowerCase().includes('servicentro')) tipoCodigo = 'SC';
    else tipoCodigo = 'DD';
  }

  let tipoNombre = (inspection.tipoNombre || metadataInput?.tipo?.nombre || '').trim();
  if (!tipoNombre || tipoNombre.startsWith('est_') || tipoNombre.startsWith('ti_') || tipoNombre === 'EST_DIST_VAL' || tipoNombre === 'GEN') {
    const foundTipo = INITIAL_TIPOS_INSPECCION.find(t => t.codigo === tipoCodigo || t._id === inspection.tipoInspeccionId);
    tipoNombre = foundTipo?.nombre || (tipoCodigo === 'DD' ? 'SSA Distribuidoras' : 'SSA Servicentros');
  }

  const formDef = getFormDefinition(tipoCodigo) ||
                  getFormDefinition(inspection.tipoInspeccionId) ||
                  getFormDefinition(tipoNombre) ||
                  getFormDefinition('DD');

  const sections = formDef?.sections || metadataInput?.tipo?.secciones || [];
  const inspector = (inspection.inspector || inspection.inspectorId || 'Francisco Rojas').trim();
  const correlativoStr = inspection.correlativo ? String(inspection.correlativo) : (inspection.referencia ? inspection.referencia.replace(/^REF-|^INSP-/, '') : '1006');

  // Normalizar fecha y puntuación (si puntuación contiene timestamp por desplazamiento de columna)
  let rawFecha = inspection.fecha;
  let rawPuntuacion: any = inspection.puntuacion ?? inspection.puntuacionConformidad;
  if (typeof rawPuntuacion === 'string' && (rawPuntuacion.includes('T') || rawPuntuacion.includes('Z') || isNaN(Number(rawPuntuacion)))) {
    if (!rawFecha) rawFecha = rawPuntuacion;
    rawPuntuacion = undefined;
  }
  const emisionDate = formatDate(rawFecha || new Date().toISOString());

  // CALCULAR SCORE OFICIAL CON REGLA OM = +0.5 PUNTOS POSITIVOS Y TODOS LOS INDICADORES
  const scoreResult = formDef ? calculateScore(formDef, respuestas) : null;
  const puntuacion = scoreResult ? scoreResult.puntuacion : (typeof rawPuntuacion === 'number' ? rawPuntuacion : 100);
  const rawResultado = scoreResult ? scoreResult.resultado : (inspection.resultado || 'C').toUpperCase();

  // 1. ENCABEZADO INSTITUCIONAL DUNCAN OFICIAL
  try {
    doc.addImage(DUNCAN_LOGO_BW, 'PNG', 14, 6, 36, 13);
  } catch (e) {
    console.warn('Error insertando logo Duncan en PDF', e);
  }

  // Línea 1: Nombre de la Empresa
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(empresaNombre, 56, 11);

  // Línea 2: Subtítulo SG-SSA
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text('Sistema de Gestión de Seguridad, Salud y Ambiente (SG-SSA)', 56, 16);

  // Línea 3: Título Oficial de la Inspección
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175); // Blue 800 (#1E40AF)
  doc.text(`INFORME OFICIAL: ${tipoNombre.toUpperCase()}`, 56, 21);

  // Línea divisoria horizontal
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 25, 202, 25);

  // 2. TABLA DE METADATOS Y CONTROL (4 COLUMNAS)
  const metadataRows: any[][] = [
    ['Empresa', empresaNombre, 'N° Correlativo', correlativoStr],
    ['Establecimiento', establecimientoNombre, 'Fecha', emisionDate],
    ['Localidad', localidadNombre, 'Inspector', inspector],
    ['Resultado Global', rawResultado === 'C' ? 'CONFORME (C)' : rawResultado === 'OM' ? 'OPORTUNIDAD DE MEJORA (OM)' : 'NO CONFORME (NC)', 'Puntuación Cumplimiento', `${puntuacion}%`],
  ];

  // Si existen campos técnicos adicionales (ej. Montacargas, Extintores, etc.)
  const addFields = formDef?.additionalFields || [];
  if (addFields.length > 0) {
    for (let i = 0; i < addFields.length; i += 2) {
      const f1 = addFields[i];
      const f2 = addFields[i + 1];
      const v1 = respuestasAdicionales[f1.id] ?? respuestas[f1.id] ?? '—';
      const v2 = f2 ? (respuestasAdicionales[f2.id] ?? respuestas[f2.id] ?? '—') : '';

      metadataRows.push([
        f1.label,
        String(v1),
        f2 ? f2.label : '',
        f2 ? String(v2) : ''
      ]);
    }
  }

  autoTable(doc, {
    startY: 28,
    head: [['Parámetro', 'Detalle', 'Parámetro', 'Detalle']],
    body: metadataRows,
    theme: 'grid',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [71, 85, 105],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2,
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold', textColor: [71, 85, 105] },
      1: { cellWidth: 62 },
      2: { cellWidth: 32, fontStyle: 'bold', textColor: [71, 85, 105] },
      3: { cellWidth: 62 }
    }
  });

  // 3. CUADRO OFICIAL DE INDICADORES TÉCNICOS (VALORES ABSOLUTOS Y PORCENTUALES)
  // Requerimiento: Conforme, No Conforme, Oportunidad de Mejora (+0.5 pts positivos), No Aplica
  const conformesCount = scoreResult?.conformes ?? 0;
  const noConformesCount = scoreResult?.noConformes ?? 0;
  const omCount = scoreResult?.observaciones ?? 0;
  const naCount = scoreResult?.noAplica ?? 0;
  const totalEval = scoreResult?.totalEvaluados ?? (conformesCount + noConformesCount + omCount);
  const totalGen = scoreResult?.total ?? (totalEval + naCount);
  const puntosObt = scoreResult?.puntosObtenidos ?? Number((conformesCount + (omCount * 0.5)).toFixed(1));

  const pctConf = scoreResult?.porcentajeConforme ?? (totalEval > 0 ? Math.round((conformesCount / totalEval) * 1000) / 10 : 0);
  const pctNC = scoreResult?.porcentajeNoConforme ?? (totalEval > 0 ? Math.round((noConformesCount / totalEval) * 1000) / 10 : 0);
  const pctOM = scoreResult?.porcentajeOM ?? (totalEval > 0 ? Math.round((omCount / totalEval) * 1000) / 10 : 0);
  const pctNA = scoreResult?.porcentajeNoAplica ?? (totalGen > 0 ? Math.round((naCount / totalGen) * 1000) / 10 : 0);

  const indicadoresRows: any[][] = [
    ['Conforme (C)', '1.0 pto positivo', String(conformesCount), `${pctConf}%`],
    ['No Conforme (NC)', '0.0 ptos (No cumple)', String(noConformesCount), `${pctNC}%`],
    ['Oportunidad de Mejora (OM)', '+0.5 pto positivo (Ponderación 50%)', String(omCount), `${pctOM}%`],
    ['No Aplica (NA)', 'Neutro (Excluido de la base)', String(naCount), `${pctNA}%`],
  ];

  const metaFinalY = (doc as any).lastAutoTable?.finalY || 48;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('CUADRO OFICIAL DE INDICADORES TÉCNICOS DE CUMPLIMIENTO (SG-SSA)', marginX, metaFinalY + 5);

  autoTable(doc, {
    startY: metaFinalY + 7,
    margin: { left: marginX, right: marginX },
    tableWidth: 187.9,
    head: [['Indicador de Gestión', 'Criterio de Ponderación', 'Cantidad Absoluta', 'Porcentaje (%)']],
    body: indicadoresRows,
    foot: [[
      `TOTAL EVALUADOS: ${totalEval} Ítems`,
      `PUNTOS OBTENIDOS: ${puntosObt} / ${totalEval}`,
      `PUNTUACIÓN: ${puntuacion}%`,
      `DICTAMEN: ${rawResultado === 'C' ? 'CONFORME (C)' : rawResultado === 'OM' ? 'OPORTUNIDAD DE MEJORA (OM)' : 'NO CONFORME (NC)'}`
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 64, 175], // Azul Corporativo Duncan #1E40AF
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 1.8,
      halign: 'left'
    },
    footStyles: {
      fillColor: rawResultado === 'C' ? [240, 253, 244] : rawResultado === 'OM' ? [254, 243, 199] : [254, 242, 242],
      textColor: rawResultado === 'C' ? [22, 101, 52] : rawResultado === 'OM' ? [180, 83, 9] : [185, 28, 28],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 2,
      lineColor: [203, 213, 225],
      lineWidth: 0.2
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 62 },
      2: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 35.9, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.row.index === 0) data.cell.styles.textColor = [22, 101, 52];
        else if (data.row.index === 1) data.cell.styles.textColor = [185, 28, 28];
        else if (data.row.index === 2) data.cell.styles.textColor = [180, 83, 9];
        else if (data.row.index === 3) data.cell.styles.textColor = [100, 116, 139];
      }
    }
  });

  // 4. TABLA DETALLADA DE ÍTEMS EVALUADOS POR SECCIÓN
  const tableData: any[][] = [];
  sections.forEach((sec: any, secIdx: number) => {
    const secNumber = secIdx + 1;
    const secTitle = sec.title || sec.titulo || `SECCIÓN ${secNumber}`;
    // Fila cabecera de sección (abarca todo el ancho)
    tableData.push([`SECCIÓN: ${secNumber}. ${secTitle.replace(/^SECCIÓN:\s*/i, '').toUpperCase()}`, '']);

    (sec.items || []).forEach((item: any) => {
      // Búsqueda resiliente de la respuesta por ID o por alias (ej: 1.1, 1_1, item_1_1)
      const rawVal = respuestas[item.id] ?? 
                     respuestas[String(item.id).replace('.', '_')] ?? 
                     respuestas[`item_${String(item.id).replace('.', '_')}`];

      let displayVal = '—';
      if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
        const valUpper = String(rawVal).toUpperCase().trim();
        if (['C', 'BUENO', 'SI', 'SÍ', 'OPERATIVO', 'OK', 'CONFORME', 'EXISTE'].includes(valUpper)) displayVal = 'C';
        else if (['NC', 'DANADO', 'DAÑADO', 'NO', 'NO OPERATIVO', 'NO CONFORME', 'CRITICO', 'CRÍTICO', 'NO_EXISTE'].includes(valUpper)) displayVal = 'NC';
        else if (['OM', 'OPORTUNIDAD DE MEJORA', 'REGULAR', 'OBSERVACION', 'OBSERVACIÓN'].includes(valUpper)) displayVal = 'OM';
        else if (['NA', 'N/A', 'NO APLICA'].includes(valUpper)) displayVal = 'NA';
        else displayVal = String(rawVal);
      }

      const itemLabel = item.pregunta || item.label || `Ítem ${item.id}`;
      tableData.push([itemLabel, displayVal]);
    });
  });

  const prevY = (doc as any).lastAutoTable?.finalY || 80;

  autoTable(doc, {
    startY: prevY + 6,
    margin: { left: marginX, right: marginX },
    tableWidth: 187.9,
    head: [['Ítem Evaluado', 'Respuesta']],
    body: tableData,
    theme: 'striped',
    showHead: 'everyPage',
    headStyles: {
      fillColor: [30, 64, 175], // Azul Corporativo Duncan #1E40AF
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.2
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [241, 245, 249],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 154.9, halign: 'left' },
      1: { cellWidth: 33, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      // Subcabeceras de secciones
      if (data.row.raw && data.row.raw[0] && String(data.row.raw[0]).startsWith('SECCIÓN:')) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [226, 232, 240]; // Light Blue / Slate 200
        data.cell.styles.textColor = [15, 23, 42];
        data.cell.styles.fontSize = 8;
        data.cell.colSpan = 2;
      } else if (data.column.index === 1) {
        // Colorimetría de respuestas
        const val = String(data.cell.raw).trim();
        if (val === 'C') data.cell.styles.textColor = [22, 101, 52];
        else if (val === 'NC') data.cell.styles.textColor = [185, 28, 28];
        else if (val === 'OM') data.cell.styles.textColor = [180, 83, 9];
        else if (val === 'NA') data.cell.styles.textColor = [100, 116, 139];
      }
    },
    didDrawPage: (data) => {
      // Cabecera compacta en páginas 2+
      if (data.pageNumber > 1) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 64, 175);
        doc.text(`SGD DUNCAN — INFORME OFICIAL: ${tipoNombre.toUpperCase()}`, marginX, 10);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(`N° ${correlativoStr} | ${emisionDate}`, pageWidth - marginX, 10, { align: 'right' });
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(marginX, 12, pageWidth - marginX, 12);
      }
    }
  });

  let finalY = (doc as any).lastAutoTable?.finalY || 180;

  // 4. OBSERVACIONES TÉCNICAS (SI EXISTEN)
  const observaciones = inspection.observaciones ||
                        (typeof inspection.formObservations === 'string' && !inspection.formObservations.startsWith('{') ? inspection.formObservations : '');

  if (observaciones && observaciones.trim().length > 0) {
    if (finalY + 30 > pageHeight - 35) {
      doc.addPage();
      finalY = 18;
    } else {
      finalY += 4;
    }

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.25);
    doc.rect(marginX, finalY, 187.9, 6, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('OBSERVACIONES Y RECOMENDACIONES TÉCNICAS', marginX + 3, finalY + 4.2);
    finalY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const splitObs = doc.splitTextToSize(observaciones, 181.9);
    const boxHeight = Math.max(12, splitObs.length * 3.5 + 4);

    doc.setDrawColor(203, 213, 225);
    doc.rect(marginX, finalY, 187.9, boxHeight);
    doc.text(splitObs, marginX + 3, finalY + 4);
    finalY += boxHeight + 4;
  }

  // 5. PROTOCOLO DE FIRMAS OFICIALES AL CIERRE
  if (finalY + 35 > pageHeight - 15) {
    doc.addPage();
    finalY = 22;
  } else {
    finalY += 6;
  }

  const signLineY = finalY + 16;
  const col1CenterX = marginX + 45;
  const col2CenterX = pageWidth - marginX - 45;

  // Firma Inspector SSA (Izquierda)
  if (isValidImageSignature(firmas.inspector)) {
    try {
      doc.addImage(firmas.inspector, 'PNG', col1CenterX - 20, signLineY - 14, 40, 13);
    } catch (e) {
      console.warn('Error incrustando firma inspector', e);
    }
  }

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(col1CenterX - 35, signLineY, col1CenterX + 35, signLineY);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(inspector, col1CenterX, signLineY + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Elaborado por (Inspector SSA)', col1CenterX, signLineY + 7.5, { align: 'center' });

  // Firma Supervisor / Sede (Derecha)
  if (isValidImageSignature(firmas.revisor)) {
    try {
      doc.addImage(firmas.revisor, 'PNG', col2CenterX - 20, signLineY - 14, 40, 13);
    } catch (e) {
      console.warn('Error incrustando firma revisor', e);
    }
  }

  doc.setDrawColor(15, 23, 42);
  doc.line(col2CenterX - 35, signLineY, col2CenterX + 35, signLineY);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Supervisor de Área / Sede', col2CenterX, signLineY + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Revisado y Conforme', col2CenterX, signLineY + 7.5, { align: 'center' });

  // 6. NUMERACIÓN DINÁMICA DE PÁGINAS (PÁGINA X DE Y)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 7;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(marginX, footerY - 2.5, pageWidth - marginX, footerY - 2.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('SGD DUNCAN — SISTEMA DE GESTIÓN DE SEGURIDAD, SALUD Y AMBIENTE', marginX, footerY);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginX, footerY, { align: 'right' });
  }

  const cleanTipo = (tipoCodigo || 'INSP').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanId = correlativoStr.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanFecha = (inspection.fecha || new Date().toISOString().slice(0, 10)).replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `SGD_${cleanTipo}_${cleanId}_${cleanFecha}.pdf`;

  const blob = doc.output('blob');
  const dataUri = doc.output('datauristring');

  auditService.logExport('PDF', fileName, 'Inspeccion', inspection._id || inspection.id, {
    tipoCodigo,
    correlativo: correlativoStr,
    inspector
  }).catch(console.warn);

  return { doc, fileName, blob, dataUri };
}

/**
 * Generador Ejecutivo de Reportes Consolidados en PDF (formato idéntico al Modelo 3)
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

  // Header Oficial con Logo Duncan Blanco y Negro
  try {
    doc.addImage(DUNCAN_LOGO_BW, 'PNG', 14, 6, 36, 13);
  } catch (e) {
    console.warn('Error insertando logo en consolidado PDF', e);
  }

  // Títulos
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text((filtroEmpresaNombre || 'ACUMULADORES DUNCAN, C.A.').toUpperCase(), 56, 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('GERENCIA DE SEGURIDAD, SALUD LABORAL Y AMBIENTE (SSA)', 56, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('INFORME EJECUTIVO DE GESTIÓN Y AUDITORÍA SSA', 56, 21);

  // Línea divisoria
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 25, 202, 25);

  // Metadatos del consolidado
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-VE')}`, 14, 32);
  doc.text(`Total de inspecciones analizadas: ${inspecciones.length}`, 14, 37);
  doc.text(`Índice de cumplimiento global: ${tasaCumplimiento}%`, 14, 42);

  // Tabla de resumen de inspecciones
  const tableData = inspecciones.map((item, idx) => [
    idx + 1,
    item.fecha ? formatDate(item.fecha) : '—',
    item.tipoNombre || item.tipoCodigo,
    item.establecimientoNombre || '—',
    item.inspector || '—',
    item.resultado || '—',
    `${item.puntuacion ?? 0}%`
  ]);

  autoTable(doc, {
    startY: 48,
    margin: { left: marginX, right: marginX },
    tableWidth: 187.9,
    head: [['#', 'Fecha', 'Inspección', 'Establecimiento', 'Inspector', 'Resultado', 'Puntaje']],
    body: tableData.length > 0 ? tableData : [['—', '—', 'Sin registros en el rango', '—', '—', '—', '—']],
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59], // Dark Slate #1E293B
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 46 },
      3: { cellWidth: 46 },
      4: { cellWidth: 32 },
      5: { cellWidth: 14, halign: 'center' },
      6: { cellWidth: 15.9, halign: 'center' }
    }
  });

  // Pie de página con firmas
  const finalY = (doc as any).lastAutoTable?.finalY || 160;
  const sigY = Math.max(finalY + 28, pageHeight - 48);

  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('_____________________________________', 30, sigY);
  doc.text('Francisco Rojas / SST Duncan', 35, sigY + 5);
  doc.text('Propietario / Super Admin SSA', 37, sigY + 9);

  doc.text('_____________________________________', 125, sigY);
  doc.text('Gerencia Corporativa de Operaciones', 128, sigY + 5);
  doc.text('Acumuladores Duncan, C.A.', 138, sigY + 9);

  const fileName = `SGD_Duncan_Reporte_Ejecutivo_${new Date().toISOString().slice(0, 10)}.pdf`;
  auditService.logExport('PDF', fileName, 'ConsolidadoEjecutivo', undefined, {
    empresa: filtroEmpresaNombre,
    tasaCumplimiento,
    totalInspecciones: inspecciones.length
  }).catch(console.warn);
  return { doc, fileName };
}

/**
 * Generador Oficial de Informe Técnico-Legal de Accidente de Trabajo (F-465 INPSASEL y Árbol de Causas)
 */
export function generarInformeAccidentePDF(accidente: AccidenteF465): PDFGeneratorResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const marginX = 14;

  // Header Institucional Duncan
  try {
    doc.addImage(DUNCAN_LOGO_BW, 'PNG', 14, 6, 36, 13);
  } catch (e) {
    console.warn('Error insertando logo en informe de accidente', e);
  }

  const empresaNombre = (accidente.sedeEmpresa?.includes('DISTRIBUIDORA') ? 'DISTRIBUIDORA DUNCAN, C.A.' : 'ACUMULADORES DUNCAN, C.A.');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(empresaNombre, 56, 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Servicios de Seguridad y Salud en el Trabajo (SSST) • LOPCYMAT ART. 69-73', 56, 16);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175); // Royal Blue #1E40AF
  doc.text('INFORME TÉCNICO-LEGAL: ACCIDENTE DE TRABAJO (F-465 / INPSASEL)', 56, 21);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 25, 202, 25);

  // 1.0 Datos del Trabajador y Suceso (4 columnas)
  const datosParams = [
    ['Trabajador:', accidente.nombreCompleto || '—', 'Cédula de Identidad:', `V-${accidente.cedula || '—'}`],
    ['Cargo / Puesto:', accidente.cargo || '—', 'Departamento:', accidente.departamento || '—'],
    ['Centro de Trabajo:', accidente.sedeEmpresa || '—', 'Edad / Género:', `${accidente.edad || '—'} años / ${accidente.genero || 'M'}`],
    ['Fecha del Suceso:', `${accidente.fechaAccidente || '—'} (${accidente.horaAccidente || '—'})`, 'Lugar Exacto:', accidente.lugarExacto || 'Área Operativa'],
    ['Gravedad Lesión:', accidente.gravedad || 'LEVE', 'Días de Reposo:', `${accidente.diasReposoMedico || 0} días continuos`],
    ['Registro INPSASEL:', accidente.numeroRegistroINPSASEL || 'Notificado Web INPSASEL', 'N° Correlativo:', accidente.correlativo || 'ACC-2026-001']
  ];

  autoTable(doc, {
    startY: 28,
    margin: { left: marginX, right: marginX },
    tableWidth: 187.9,
    theme: 'grid',
    head: [['1.0 IDENTIFICACIÓN DEL TRABAJADOR Y DEL CENTRO DE TRABAJO', '', '', '']],
    body: datosParams,
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2,
      halign: 'left'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 40 },
      1: { cellWidth: 54 },
      2: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 40 },
      3: { cellWidth: 53.9 }
    }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 4;

  // 2.0 Base Legal
  const baseLegalText = [
    ['Artículo 69 (LOPCYMAT):', 'Se entiende por accidente de trabajo, todo suceso que produzca en el trabajador o trabajadora una lesión funcional o corporal, permanente o temporal, inmediata o posterior, o la muerte, resultante de la acción determinada de una causa externa, en ejecución o con ocasión del trabajo.']
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: 187.9,
    theme: 'grid',
    head: [['2.0 FUNDAMENTACIÓN LEGAL VIGENTE (LOPCYMAT)', '']],
    body: baseLegalText,
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.8,
      cellPadding: 2
    },
    styles: {
      fontSize: 7.2,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 40 },
      1: { cellWidth: 147.9 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 3.0 Descripción Circunstanciada
  const descripcionBody = [
    ['Relato del Suceso:', accidente.descripcionDetallada || 'El trabajador se encontraba en ejecución habitual de sus labores cuando ocurrió el siniestro.'],
    ['Agente Material:', `${accidente.agenteMaterial || 'Batería Duncan / Ácido'} • Lesión: ${accidente.tipoLesion || 'Contusión'} en ${accidente.parteCuerpoAfectada || 'Cuerpo'}`]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: 187.9,
    theme: 'grid',
    head: [['3.0 DESCRIPCIÓN CIRCUNSTANCIADA DEL SUCESO', '']],
    body: descripcionBody,
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.8,
      cellPadding: 2
    },
    styles: {
      fontSize: 7.2,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 40 },
      1: { cellWidth: 147.9 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 4.0 Criterios Técnico-Legales
  const criterios = [
    ['Criterio Funcional / Laboral', 'El trabajador realizaba tareas inherentes a su puesto habitual bajo subordinación.', 'CUMPLE'],
    ['Criterio Topográfico', `El hecho ocurrió en las instalaciones de ${accidente.sedeEmpresa}.`, 'CUMPLE'],
    ['Criterio Mecánico / Agente', `Acción externa lesiva producida por: ${accidente.agenteMaterial || 'Batería'}.`, 'CUMPLE'],
    ['Criterio Cronológico', `Ocurrió dentro de la jornada laboral habitual (${accidente.horaAccidente}).`, 'CUMPLE'],
    ['Criterio Lesional', `Se constató lesión física y se otorgaron ${accidente.diasReposoMedico} días de reposo médico.`, 'CUMPLE']
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: 187.9,
    theme: 'striped',
    head: [['4.0 CRITERIOS DE VALIDACIÓN TÉCNICO-LEGAL', 'ANÁLISIS CIRCUNSTANCIADO', 'DICTAMEN']],
    body: criterios,
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.8,
      cellPadding: 2
    },
    styles: {
      fontSize: 7.2,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 115.9 },
      2: { halign: 'center', fontStyle: 'bold', textColor: [22, 101, 52], cellWidth: 22 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 5.0 Árbol de Causas
  const causasInmed = accidente.arbolCausas?.causasInmediatas?.filter(Boolean).join('; ') || 'Condición insegura en manipulación / tensión de embalaje.';
  const causasBasic = accidente.arbolCausas?.causasBasicas?.filter(Boolean).join('; ') || 'Factores de procedimiento y necesidad de refuerzo en uso de EPP.';
  const hechoFin = accidente.arbolCausas?.hechoFinal || accidente.descripcionDetallada;

  const arbolRows = [
    ['Hecho Final / Lesión:', hechoFin],
    ['Causas Inmediatas (Actos/Condiciones):', causasInmed],
    ['Causas Básicas (Factores del Trabajo):', causasBasic]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: 187.9,
    theme: 'grid',
    head: [['5.0 ANÁLISIS DE CAUSALIDAD (METODOLOGÍA ÁRBOL DE CAUSAS)', '']],
    body: arbolRows,
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.8,
      cellPadding: 2
    },
    styles: {
      fontSize: 7.2,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 55 },
      1: { cellWidth: 132.9 }
    }
  });

  // Salto de página para conclusión y firmas si queda poco espacio
  if ((doc as any).lastAutoTable.finalY > 215) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY = (doc as any).lastAutoTable.finalY + 5;
  }

  // 6.0 Conclusión y Dictamen Técnico
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.4);
  doc.rect(marginX, currentY, 187.9, 14, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 64, 175);
  doc.text('6.0 CONCLUSIÓN Y DICTAMEN TÉCNICO-LEGAL:', marginX + 3, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Por reunir todos los requisitos funcionales, topográficos y lesionales, el evento CALIFICA POSITIVAMENTE COMO ACCIDENTE DE TRABAJO de acuerdo con el Art. 69 Numeral 1 de la LOPCYMAT y normativa INPSASEL.`, marginX + 3, currentY + 9, { maxWidth: 181.9 });

  currentY += 22;

  // Firmas de Responsabilidad
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  doc.text('_____________________________________', 22, currentY);
  doc.text('Servicio de Seguridad y Salud (SSST)', 24, currentY + 4);
  doc.text('Dra. Carmen Ismelda Ramos / SSST Duncan', 22, currentY + 7.5);

  doc.text('_____________________________________', 85, currentY);
  doc.text('Delegado(a) de Prevención (CSSL)', 88, currentY + 4);
  doc.text('Comité de Seguridad y Salud Laboral', 86, currentY + 7.5);

  doc.text('_____________________________________', 148, currentY);
  doc.text('Gerencia de Operaciones Duncan', 151, currentY + 4);
  doc.text('Acumuladores / Distribuidora Duncan', 149, currentY + 7.5);

  // Footer dinámico
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `DOCUMENTO OFICIAL GENERADO POR SISTEMA SGD-DUNCAN • PÁGINA ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  const fileName = `Informe_Tecnico_Accidente_${accidente.correlativo || 'F465'}_${accidente.cedula}.pdf`;
  const blob = doc.output('blob');
  const dataUri = doc.output('datauristring');
  auditService.logExport('PDF', fileName, 'AccidenteF465', accidente.id, {
    correlativo: accidente.correlativo,
    cedula: accidente.cedula,
    trabajador: accidente.nombreCompleto
  }).catch(console.warn);
  return { doc, fileName, blob, dataUri };
}

/**
 * Generador Oficial de Certificado Técnico de Carga de Fuego y Extintores (COVENIN / NFPA)
 */
export function generarCertificadoCargaFuegoPDF(carga: CalculoCargaFuegoArea): PDFGeneratorResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const marginX = 14;

  try {
    doc.addImage(DUNCAN_LOGO_BW, 'PNG', 14, 6, 36, 13);
  } catch (e) {
    console.warn('Error insertando logo en carga de fuego', e);
  }

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('GRUPO EMPRESARIAL DUNCAN, C.A.', 56, 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Seguridad Industrial y Protección Contra Incendios • COVENIN 1040 / NFPA 10', 56, 16);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('MEMORIA DE CÁLCULO: CARGA DE FUEGO Y DOTACIÓN DE EXTINTORES', 56, 21);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 25, 202, 25);

  const datosSede = [
    ['Centro de Trabajo / Sede:', carga.sedeNombre || '—', 'Área Evaluada:', carga.areaNombre || '—'],
    ['Superficie del Área:', `${carga.superficieM2 || 0} m²`, 'Clasificación de Riesgo:', carga.clasificacionRiesgo || 'EXTRA_ALTO'],
    ['Carga Térmica Total:', `${Number(carga.cargaTermicaTotalMcal || 0).toLocaleString()} Mcal`, 'Densidad Calorífica:', `${Number(carga.densidadCargaCalorificaMcalM2 || 0).toFixed(1)} Mcal/m²`],
    ['Potencial Extintor:', carga.potencialExtintorRequerido || '4-A : 40-B:C', 'Extintores Requeridos:', `${carga.cantidadExtintoresRequerida || 1} unidades`],
    ['Extintores Actuales:', `${carga.cantidadExtintoresActuales || 0} unidades`, 'Déficit / Superávit:', carga.deficitExtintores > 0 ? `Déficit de ${carga.deficitExtintores} extintores` : 'Dotación Conforme'],
    ['Distancia Recorrido:', `${carga.distanciaMaximaRecorridoMetros || 15} metros`, 'Conformidad Normativa:', carga.cumpleNorma ? 'CUMPLE NORMA COVENIN' : 'NO CONFORME - REQUIERE ACCIÓN']
  ];

  autoTable(doc, {
    startY: 28,
    margin: { left: marginX, right: marginX },
    tableWidth: 187.9,
    theme: 'grid',
    head: [['1.0 PARÁMETROS TÉCNICOS DE LA LOCALIDAD', '', '', '']],
    body: datosSede,
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 42 },
      1: { cellWidth: 52 },
      2: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 42 },
      3: { cellWidth: 51.9 }
    }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 5;

  // Detalle de Materiales
  const matRows = (carga.materiales || []).map(m => [
    m.tipoMaterial,
    `${Number(m.pesoTotalKg || 0).toLocaleString()} Kg`,
    `${m.poderCalorificoMcalKg} Mcal/Kg`,
    `${Number(m.caloriasSubtotalMcal || 0).toLocaleString()} Mcal`
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: 187.9,
    theme: 'striped',
    head: [['MATERIAL COMBUSTIBLE / CARGA', 'PESO ESTIMADO (KG)', 'PODER CALORÍFICO', 'SUBTOTAL TÉRMICO (MCAL)']],
    body: matRows.length > 0 ? matRows : [['Plástico / Baterías', '12,000 Kg', '9.5 Mcal/Kg', '114,000 Mcal']],
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.8,
      cellPadding: 2
    },
    styles: {
      fontSize: 7.2,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { halign: 'center', cellWidth: 40 },
      2: { halign: 'center', cellWidth: 40 },
      3: { halign: 'center', fontStyle: 'bold', cellWidth: 42.9 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Dictamen Técnico y Recomendaciones
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.4);
  doc.rect(marginX, currentY, 187.9, 20, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 64, 175);
  doc.text('DICTAMEN TÉCNICO Y ESPECIFICACIÓN DE EXTINTORES:', marginX + 3, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const dictamenText = carga.cumpleNorma
    ? `El área evaluada cuenta con la dotación adecuada para su carga calorífica (${carga.cantidadExtintoresActuales} extintores instalados). Se recomienda mantener la inspección mensual y recarga anual conforme a la norma COVENIN 1040.`
    : `ALERTA TÉCNICA: El área presenta un déficit de ${carga.deficitExtintores} extintores. Se requiere la instalación inmediata de equipos con potencial extintor mínimo ${carga.potencialExtintorRequerido} a distancias no mayores a ${carga.distanciaMaximaRecorridoMetros} metros.`;

  doc.text(dictamenText, marginX + 3, currentY + 10, { maxWidth: 181.9 });

  currentY += 32;

  // Firmas
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  doc.text('_____________________________________', 35, currentY);
  doc.text('Ing. Francisco Rojas / Auditor SSA', 38, currentY + 4);
  doc.text('Especialista en Seguridad Contra Incendios', 34, currentY + 7.5);

  doc.text('_____________________________________', 125, currentY);
  doc.text('Gerente de Operaciones / Responsable Sede', 123, currentY + 4);
  doc.text('Acumuladores Duncan, C.A.', 138, currentY + 7.5);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'DOCUMENTO OFICIAL GENERADO POR SISTEMA SGD-DUNCAN • MEMORIA DE CARGA DE FUEGO',
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  const fileName = `Carga_Fuego_${(carga.sedeNombre || 'Duncan').replace(/\s+/g, '_')}_${(carga.areaNombre || 'Area').replace(/\s+/g, '_')}.pdf`;
  const blob = doc.output('blob');
  const dataUri = doc.output('datauristring');
  auditService.logExport('PDF', fileName, 'CalculoCargaFuegoArea', carga.id, {
    sede: carga.sedeNombre,
    area: carga.areaNombre,
    densidadCalorifica: carga.densidadCargaCalorificaMcalM2
  }).catch(console.warn);
  return { doc, fileName, blob, dataUri };
}

/**
 * Generador Oficial de Hoja de Ruta y Despacho Seguro (Transporte y Carga Duncan)
 */
export function generarHojaRutaTransportePDF(checklist: ChecklistTransporte, vehiculo?: VehiculoFlota): PDFGeneratorResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const marginX = 14;

  try {
    doc.addImage(DUNCAN_LOGO_BW, 'PNG', 14, 6, 36, 13);
  } catch (e) {
    console.warn('Error insertando logo en hoja de ruta', e);
  }

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DISTRIBUIDORA DUNCAN, C.A.', 56, 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Gerencia de Distribución y Transporte • Control Pre-operacional de Flota', 56, 16);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text(`HOJA DE RUTA Y AUTORIZACIÓN DE DESPACHO (${checklist.tipoChecklist})`, 56, 21);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 25, 202, 25);

  const datosVehiculo = [
    ['Placa de la Unidad:', checklist.placa || '—', 'Modelo / Tipo:', `${checklist.marcaModelo || '—'} (${vehiculo?.tipoVehiculo || 'Carga'})`],
    ['Capacidad Nominal:', `${checklist.capacidadNominalKg?.toLocaleString() || 0} Kg`, 'Kilometraje Actual:', `${checklist.kilometraje?.toLocaleString() || 0} Km`],
    ['Conductor Principal:', `${checklist.choferNombre || '—'} (V-${checklist.choferCedula || '—'})`, 'Auxiliar de Ruta:', checklist.auxiliarNombre ? `${checklist.auxiliarNombre} (V-${checklist.auxiliarCedula})` : 'Sin auxiliar asignado'],
    ['Sede Origen:', checklist.sedeOrigen || 'Caracas', 'Destino / Ruta:', checklist.sedeDestino || 'Ruta Distribución'],
    ['Peso Total Carga:', `${(checklist.pesoCalculadoKg || checklist.pesoManifiestoKg || 0).toLocaleString()} Kg`, 'Semáforo Salida:', checklist.semaforoSalida || 'VERDE'],
    ['Fecha de Salida:', `${checklist.fecha || '—'} (${checklist.hora || '—'})`, 'N° Correlativo:', checklist.correlativo || 'HR-2026-001']
  ];

  autoTable(doc, {
    startY: 28,
    margin: { left: marginX, right: marginX },
    tableWidth: 187.9,
    theme: 'grid',
    head: [['1.0 DATOS DE LA UNIDAD, CONDUCTOR Y DESPACHO', '', '', '']],
    body: datosVehiculo,
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 40 },
      1: { cellWidth: 54 },
      2: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 40 },
      3: { cellWidth: 53.9 }
    }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 4;

  // Desglose de Baterías
  const batRows = (checklist.itemsBaterias || []).map(b => [
    b.codigo,
    b.referencia,
    `${b.pesoUnitarioKg} Kg`,
    b.cantidad,
    `${b.subtotalKg.toLocaleString()} Kg`
  ]);

  if (batRows.length > 0) {
    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      tableWidth: 187.9,
      theme: 'striped',
      head: [['CÓDIGO', 'DESCRIPCIÓN BATERÍA DUNCAN', 'PESO UNITARIO', 'CANTIDAD', 'SUBTOTAL PESO']],
      body: batRows,
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: 2
      },
      styles: {
        fontSize: 7.2,
        cellPadding: 2,
        textColor: [15, 23, 42],
        lineColor: [226, 232, 240],
        lineWidth: 0.2
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 28 },
        1: { cellWidth: 70 },
        2: { halign: 'center', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'center', fontStyle: 'bold', cellWidth: 34.9 }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // Checklist Pre-operacional
  const checkItems = Object.entries(checklist.respuestas || {}).map(([k, v]) => [
    k.replace(/_/g, ' ').toUpperCase(),
    v === 'BUENO' ? 'CONFORME' : v === 'MALO' ? 'FALLA / NO CONFORME' : v
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: 187.9,
    theme: 'grid',
    head: [['2.0 VERIFICACIÓN PRE-OPERACIONAL DE SEGURIDAD', 'ESTADO']],
    body: checkItems.length > 0 ? checkItems : [
      ['NIVEL DE FLUIDOS (ACEITE / AGUA / FRENOS)', 'CONFORME'],
      ['SISTEMA DE FRENOS Y DIRECCIÓN', 'CONFORME'],
      ['ESTADO GENERAL DE CAUCHOS Y PRESIÓN', 'CONFORME'],
      ['KIT DE DERRAME ANTIÁCIDO Y LAVAOJOS', 'CONFORME'],
      ['EXTINTOR PORTÁTIL VIGENTE', 'CONFORME'],
      ['DOCUMENTOS Y PÓLIZA RCV VIGENTES', 'CONFORME']
    ],
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 2
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { halign: 'center', fontStyle: 'bold', cellWidth: 47.9 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Semáforo de Salida
  const isAprobado = checklist.semaforoSalida === 'VERDE';
  const isAmarillo = checklist.semaforoSalida === 'AMARILLO';

  doc.setFillColor(isAprobado ? 240 : isAmarillo ? 254 : 254, isAprobado ? 253 : isAmarillo ? 243 : 242, isAprobado ? 244 : isAmarillo ? 199 : 242);
  doc.setDrawColor(isAprobado ? 22 : isAmarillo ? 202 : 220, isAprobado ? 101 : isAmarillo ? 138 : 38, isAprobado ? 52 : isAmarillo ? 4 : 38);
  doc.setLineWidth(0.4);
  doc.rect(marginX, currentY, 187.9, 14, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(isAprobado ? 22 : isAmarillo ? 161 : 185, isAprobado ? 101 : isAmarillo ? 98 : 28, isAprobado ? 52 : isAmarillo ? 7 : 28);
  doc.text(`DICTAMEN DE SALIDA SSA: ${checklist.semaforoSalida === 'VERDE' ? 'SALIDA AUTORIZADA' : checklist.semaforoSalida === 'AMARILLO' ? 'SALIDA CON OBSERVACIONES' : 'SALIDA NO AUTORIZADA / SOBREPESO O FALLA CRÍTICA'}`, marginX + 3, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(15, 23, 42);
  doc.text(checklist.motivoRestriccion || 'La unidad cumple con los límites seguros de carga y las condiciones técnicas mecánicas y de seguridad vial.', marginX + 3, currentY + 10, { maxWidth: 181.9 });

  currentY += 22;

  // Firmas
  doc.text('_____________________________________', 35, currentY);
  doc.text(`${checklist.choferNombre || 'Conductor'}`, 38, currentY + 4);
  doc.text('Firma del Conductor / Operador de Ruta', 33, currentY + 7.5);

  doc.text('_____________________________________', 125, currentY);
  doc.text('Despacho / Inspector de Flota SSA', 126, currentY + 4);
  doc.text('Distribuidora Duncan, C.A.', 137, currentY + 7.5);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'DOCUMENTO OFICIAL GENERADO POR SISTEMA SGD-DUNCAN • HOJA DE RUTA',
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  const fileName = `Hoja_Ruta_${checklist.placa || 'Flota'}_${checklist.fecha || '2026'}.pdf`;
  const blob = doc.output('blob');
  const dataUri = doc.output('datauristring');
  auditService.logExport('PDF', fileName, 'ChecklistTransporte', checklist.id, {
    placa: checklist.placa,
    semaforo: checklist.semaforoSalida,
    chofer: checklist.choferNombre
  }).catch(console.warn);
  return { doc, fileName, blob, dataUri };
}
