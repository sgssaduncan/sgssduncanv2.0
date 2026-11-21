import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './utils';
import { getFormDefinition } from './formDefinitions';
import { DUNCAN_LOGO_BW } from './logos';
import type { Inspeccion } from '../types';

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
export function generarInspeccionPDF(inspection: Inspeccion, metadataInput?: any): PDFGeneratorResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const marginX = 14;

  // Resolver metadatos y definición de formulario
  const tipoCodigo = inspection.tipoCodigo || 'GEN';
  const tipoNombre = inspection.tipoNombre || metadataInput?.tipo?.nombre || 'Inspección Técnica SSA';
  const formDef = getFormDefinition(tipoCodigo) ||
                  getFormDefinition(inspection.tipoInspeccionId) ||
                  getFormDefinition(tipoNombre);

  const sections = formDef?.sections || metadataInput?.tipo?.secciones || [];
  const empresaNombre = inspection.empresaNombre || metadataInput?.empresa?.nombre || 'Distribuidora Duncan, C.A.';
  const localidadNombre = inspection.localidadNombre || metadataInput?.localidad?.nombre || 'Valencia';
  const establecimientoNombre = inspection.establecimientoNombre || metadataInput?.establecimiento?.nombre || 'Sede Principal';
  const inspector = (inspection.inspector || inspection.inspectorId || 'Francisco Rojas').trim();
  const correlativoStr = inspection.correlativo ? String(inspection.correlativo) : (inspection.referencia ? inspection.referencia.replace(/^REF-|^INSP-/, '') : '1001');
  const emisionDate = formatDate(inspection.fecha);
  const rawResultado = (inspection.resultado || 'C').toUpperCase();
  const puntuacion = inspection.puntuacion ?? inspection.puntuacionConformidad ?? 100;

  // Parsear respuestas, adicionales y firmas de forma segura
  let respuestas: Record<string, any> = {};
  if (inspection.respuestas && typeof inspection.respuestas === 'object') {
    respuestas = { ...inspection.respuestas };
  } else if (inspection.formResponses) {
    try { respuestas = JSON.parse(inspection.formResponses); } catch { respuestas = {}; }
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
    ['Resultado', rawResultado, 'Puntuación', `${puntuacion}%`],
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

  // 3. TABLA DETALLADA DE ÍTEMS EVALUADOS POR SECCIÓN
  const tableData: any[][] = [];
  sections.forEach((sec: any, secIdx: number) => {
    const secNumber = secIdx + 1;
    const secTitle = sec.title || sec.titulo || `SECCIÓN ${secNumber}`;
    // Fila cabecera de sección (abarca todo el ancho)
    tableData.push([`SECCIÓN: ${secNumber}. ${secTitle.replace(/^SECCIÓN:\s*/i, '').toUpperCase()}`, '']);

    (sec.items || []).forEach((item: any) => {
      const rawVal = respuestas[item.id];
      let displayVal = '—';
      if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
        const valUpper = String(rawVal).toUpperCase().trim();
        if (['C', 'BUENO', 'SI', 'SÍ', 'OPERATIVO', 'OK', 'CONFORME', 'EXISTE'].includes(valUpper)) displayVal = 'C';
        else if (['NC', 'DANADO', 'DAÑADO', 'NO', 'NO OPERATIVO', 'NO CONFORME', 'CRITICO', 'CRÍTICO', 'NO_EXISTE'].includes(valUpper)) displayVal = 'NC';
        else if (valUpper === 'OM') displayVal = 'OM';
        else if (['NA', 'N/A', 'NO APLICA'].includes(valUpper)) displayVal = 'NA';
        else displayVal = String(rawVal);
      }

      const itemLabel = item.pregunta || item.label || `Ítem ${item.id}`;
      tableData.push([itemLabel, displayVal]);
    });
  });

  const prevY = (doc as any).lastAutoTable?.finalY || 55;

  autoTable(doc, {
    startY: prevY + 5,
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
  if (firmas.inspector && firmas.inspector.startsWith('data:image')) {
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
  if (firmas.revisor && firmas.revisor.startsWith('data:image')) {
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
  return { doc, fileName };
}
