import * as XLSX from 'xlsx';
import { auditService } from '../services/auditService';
import type { Inspeccion, Empresa, Localidad, Establecimiento, TipoInspeccion, UserProfile, PlanAccion, Empleado } from '../types';
import type { EvaluacionMedica } from '../types/medical';
import type { PermisoTrabajo } from '../types/permits';

export interface CatalogsContext {
  empresas?: Empresa[];
  localidades?: Localidad[];
  establecimientos?: Establecimiento[];
  tipos?: TipoInspeccion[];
  users?: UserProfile[];
}

export interface ConsolidatedRowItem {
  ambito: string;
  nombre: string;
  eficiencia: number;
  ponderacion: number;
  ponderado: number;
  isLocalidadHeader?: boolean;
  promedioRegion?: number;
}

/**
 * Downloads a string content as a CSV file with UTF-8 BOM so Excel opens it correctly
 */
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  auditService.logExport('CSV', filename, 'Dataset', undefined).catch(console.warn);
}

/**
 * Escapes a field for CSV
 */
function escapeCSVField(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Converts array of objects to CSV string
 */
export function jsonToCSV(items: Record<string, any>[]): string {
  if (items.length === 0) return '';
  const headers = Object.keys(items[0]);
  const headerLine = headers.map(escapeCSVField).join(',');
  const lines = items.map(row => headers.map(h => escapeCSVField(row[h])).join(','));
  return [headerLine, ...lines].join('\r\n');
}

/**
 * Adjusts column widths for a worksheet based on cell content
 */
function autoFitColumns(ws: XLSX.WorkSheet, dataRows: any[][]) {
  const colWidths: number[] = [];
  dataRows.forEach(row => {
    row.forEach((cell, colIdx) => {
      const len = cell ? String(cell).length : 0;
      colWidths[colIdx] = Math.max(colWidths[colIdx] || 10, len + 3);
    });
  });
  ws['!cols'] = colWidths.map(w => ({ wch: Math.min(Math.max(w, 10), 60) }));
}

/**
 * Helper to resolve friendly names from catalogs
 */
export function resolveInspectionNames(insp: Inspeccion, catalogs: CatalogsContext) {
  const empresa = catalogs.empresas?.find(e => e.id === insp.empresaId)?.nombre || insp.empresaId || 'N/D';
  const localidad = catalogs.localidades?.find(l => l.id === insp.localidadId)?.nombre || insp.localidadId || 'N/D';
  const establecimiento = catalogs.establecimientos?.find(e => e.id === insp.establecimientoId)?.nombre || insp.establecimientoId || 'N/D';
  const tipo = catalogs.tipos?.find(t => t.id === insp.tipoInspeccionId)?.nombre || insp.tipoInspeccionId || 'N/D';
  const inspector = catalogs.users?.find(u => u.id === insp.inspectorId)?.displayName || insp.inspectorId || 'N/D';
  
  return { empresa, localidad, establecimiento, tipo, inspector };
}

/**
 * Format date nicely for exports
 */
export function formatExportDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return dateStr;
  }
}

/**
 * EXPORT 1: Inspections Records -> Excel (.xlsx)
 * Generates a workbook with:
 * - Sheet 1: "Lista de Inspecciones" (Summary table)
 * - Sheet 2: "Detalle de Respuestas" (Itemized questions and responses)
 */
export function exportInspectionsToExcel(
  inspections: Inspeccion[],
  catalogs: CatalogsContext,
  options: { includeDetails?: boolean; filenamePrefix?: string } = {}
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumen de Inspecciones
  const summaryRows = inspections.map(i => {
    const names = resolveInspectionNames(i, catalogs);
    const answersCount = i.respuestas ? Object.keys(i.respuestas).length : 0;
    const photosCount = i.fotos ? Object.keys(i.fotos).length : 0;

    return {
      'ID Inspección': i.id,
      'Referencia': i.referencia || `#${i.id.substring(0, 8).toUpperCase()}`,
      'Tipo de Inspección': names.tipo,
      'Empresa': names.empresa,
      'Localidad': names.localidad,
      'Establecimiento': names.establecimiento,
      'Fecha': formatExportDate(i.fecha),
      'Estado': i.estado,
      '% Conformidad': i.puntuacionConformidad !== undefined ? `${i.puntuacionConformidad}%` : 'N/D',
      'Inspector': names.inspector,
      'Total Ítems Evaluados': answersCount,
      'Total Fotos': photosCount,
      'Observaciones': i.observaciones || '',
      'Coordenadas GPS': i.coordenadas ? `${i.coordenadas.lat.toFixed(6)}, ${i.coordenadas.lng.toFixed(6)}` : 'N/D',
      'Creado': formatExportDate(i.createdAt),
      'Actualizado': formatExportDate(i.updatedAt)
    };
  });

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  // Auto-fit columns
  if (summaryRows.length > 0) {
    const header = Object.keys(summaryRows[0]);
    const matrix = [header, ...summaryRows.map(r => Object.values(r))];
    autoFitColumns(wsSummary, matrix);
  }
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Inspecciones');

  // Sheet 2: Detalle Pregunta por Pregunta (si se solicita o por defecto para análisis profundo)
  if (options.includeDetails !== false) {
    const detailRows: any[] = [];
    
    inspections.forEach(i => {
      const names = resolveInspectionNames(i, catalogs);
      const tipoObj = catalogs.tipos?.find(t => t.id === i.tipoInspeccionId);

      if (i.respuestas && typeof i.respuestas === 'object') {
        Object.entries(i.respuestas).forEach(([itemId, valor]) => {
          let preguntaText = itemId;
          let seccionText = 'General';
          let refLegal = '';

          if (tipoObj?.secciones) {
            for (const sec of tipoObj.secciones) {
              const item = sec.items?.find((it: any) => it.id === itemId);
              if (item) {
                preguntaText = item.pregunta;
                seccionText = sec.titulo;
                refLegal = item.referenciaLegal || '';
                break;
              }
            }
          }

          const hasPhoto = i.fotos && i.fotos[itemId] ? 'Sí' : 'No';

          detailRows.push({
            'ID Inspección': i.id,
            'Referencia': i.referencia || `#${i.id.substring(0, 8).toUpperCase()}`,
            'Fecha': formatExportDate(i.fecha),
            'Tipo': names.tipo,
            'Localidad': names.localidad,
            'Establecimiento': names.establecimiento,
            'Sección': seccionText,
            'Ítem / Pregunta': preguntaText,
            'Respuesta': String(valor ?? ''),
            'Foto Adjunta': hasPhoto,
            'Referencia Legal': refLegal
          });
        });
      }
    });

    if (detailRows.length > 0) {
      const wsDetail = XLSX.utils.json_to_sheet(detailRows);
      const header = Object.keys(detailRows[0]);
      const matrix = [header, ...detailRows.map(r => Object.values(r))];
      autoFitColumns(wsDetail, matrix);
      XLSX.utils.book_append_sheet(wb, wsDetail, 'Detalle de Ítems');
    }
  }

  const filename = `${options.filenamePrefix || 'Inspecciones_SST'}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
  auditService.logExport('EXCEL', filename, 'Inspecciones', undefined, { total: inspections.length }).catch(console.warn);
}

/**
 * EXPORT 2: Inspections Records -> CSV (.csv)
 */
export function exportInspectionsToCSV(
  inspections: Inspeccion[],
  catalogs: CatalogsContext,
  options: { detailed?: boolean; filenamePrefix?: string } = {}
) {
  if (options.detailed) {
    const detailRows: any[] = [];
    inspections.forEach(i => {
      const names = resolveInspectionNames(i, catalogs);
      const tipoObj = catalogs.tipos?.find(t => t.id === i.tipoInspeccionId);

      if (i.respuestas) {
        Object.entries(i.respuestas).forEach(([itemId, valor]) => {
          let preguntaText = itemId;
          let seccionText = 'General';

          if (tipoObj?.secciones) {
            for (const sec of tipoObj.secciones) {
              const item = sec.items?.find((it: any) => it.id === itemId);
              if (item) {
                preguntaText = item.pregunta;
                seccionText = sec.titulo;
                break;
              }
            }
          }

          detailRows.push({
            ID_Inspeccion: i.id,
            Referencia: i.referencia || i.id.substring(0, 8).toUpperCase(),
            Fecha: formatExportDate(i.fecha),
            Tipo: names.tipo,
            Empresa: names.empresa,
            Localidad: names.localidad,
            Establecimiento: names.establecimiento,
            Inspector: names.inspector,
            Estado: i.estado,
            Seccion: seccionText,
            Pregunta: preguntaText,
            Respuesta: String(valor ?? ''),
            TieneFoto: i.fotos && i.fotos[itemId] ? 'SI' : 'NO'
          });
        });
      }
    });

    const csv = jsonToCSV(detailRows);
    const filename = `${options.filenamePrefix || 'Inspecciones_Detalladas'}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  } else {
    const summaryRows = inspections.map(i => {
      const names = resolveInspectionNames(i, catalogs);
      return {
        ID_Inspeccion: i.id,
        Referencia: i.referencia || i.id.substring(0, 8).toUpperCase(),
        Tipo_Inspeccion: names.tipo,
        Empresa: names.empresa,
        Localidad: names.localidad,
        Establecimiento: names.establecimiento,
        Fecha: formatExportDate(i.fecha),
        Estado: i.estado,
        Conformidad_Porcentaje: i.puntuacionConformidad ?? '',
        Inspector: names.inspector,
        Observaciones: i.observaciones || '',
        Coordenadas: i.coordenadas ? `${i.coordenadas.lat};${i.coordenadas.lng}` : ''
      };
    });

    const csv = jsonToCSV(summaryRows);
    const filename = `${options.filenamePrefix || 'Inspecciones_Resumen'}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  }
}

/**
 * EXPORT 3: Consolidated Report -> Excel (.xlsx)
 */
export function exportConsolidatedReportToExcel(
  reportRows: ConsolidatedRowItem[],
  baseInspections: Inspeccion[],
  catalogs: CatalogsContext,
  regionName: string = 'TODAS'
) {
  const wb = XLSX.utils.book_new();

  // 1. Matriz Consolidada
  let currentLoc = '';
  const matrixData: any[] = [];

  reportRows.forEach(row => {
    if (row.isLocalidadHeader) {
      currentLoc = row.nombre;
      matrixData.push({
        'Localidad': row.nombre,
        'Ámbito': 'CONSOLIDADO REGIONAL',
        'Instalación / Equipo': `Consolidado General ${row.nombre}`,
        'Eficiencia (%)': Number(row.promedioRegion?.toFixed(1)) || 0,
        'Ponderación (%)': 100,
        'Ponderado': Number(row.promedioRegion?.toFixed(2)) || 0,
        'Consolidado Región (%)': Number(row.promedioRegion?.toFixed(1)) || 0
      });
    } else {
      matrixData.push({
        'Localidad': currentLoc,
        'Ámbito': row.ambito,
        'Instalación / Equipo': row.nombre,
        'Eficiencia (%)': Math.round(row.eficiencia),
        'Ponderación (%)': Number((row.ponderacion * 100).toFixed(1)),
        'Ponderado': Number(row.ponderado.toFixed(2)),
        'Consolidado Región (%)': ''
      });
    }
  });

  const wsMatrix = XLSX.utils.json_to_sheet(matrixData);
  if (matrixData.length > 0) {
    const header = Object.keys(matrixData[0]);
    const matrix = [header, ...matrixData.map(r => Object.values(r))];
    autoFitColumns(wsMatrix, matrix);
  }
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Matriz Consolidada');

  // 2. Resumen por Localidad
  const locSummaries = reportRows
    .filter(r => r.isLocalidadHeader)
    .map(r => {
      const prom = Number(r.promedioRegion?.toFixed(1)) || 0;
      let estatus = 'Crítico (< 75%)';
      if (prom >= 90) estatus = 'Óptimo (>= 90%)';
      else if (prom >= 75) estatus = 'Aceptable (75% - 89%)';

      const itemsInLoc = reportRows.filter(sub => !sub.isLocalidadHeader && matrixData.find(m => m.Localidad === r.nombre && m['Instalación / Equipo'] === sub.nombre));

      return {
        'Localidad': r.nombre,
        'Promedio Eficiencia (%)': prom,
        'Nivel de Cumplimiento': estatus,
        'Áreas Evaluadas': itemsInLoc.length
      };
    });

  if (locSummaries.length > 0) {
    const wsSummary = XLSX.utils.json_to_sheet(locSummaries);
    const header = Object.keys(locSummaries[0]);
    const matrix = [header, ...locSummaries.map(r => Object.values(r))];
    autoFitColumns(wsSummary, matrix);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Localidades');
  }

  // 3. Inspecciones Base Auditadas
  if (baseInspections.length > 0) {
    const baseRows = baseInspections.map(i => {
      const names = resolveInspectionNames(i, catalogs);
      return {
        'ID': i.id,
        'Referencia': i.referencia || i.id.substring(0, 8).toUpperCase(),
        'Fecha': formatExportDate(i.fecha),
        'Tipo': names.tipo,
        'Localidad': names.localidad,
        'Establecimiento': names.establecimiento,
        'Inspector': names.inspector,
        'Conformidad (%)': i.puntuacionConformidad !== undefined ? `${i.puntuacionConformidad}%` : 'N/D'
      };
    });
    const wsBase = XLSX.utils.json_to_sheet(baseRows);
    const header = Object.keys(baseRows[0]);
    const matrix = [header, ...baseRows.map(r => Object.values(r))];
    autoFitColumns(wsBase, matrix);
    XLSX.utils.book_append_sheet(wb, wsBase, 'Inspecciones Auditoría');
  }

  const cleanRegion = regionName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Reporte_Consolidado_SST_${cleanRegion}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
  auditService.logExport('EXCEL', filename, 'ConsolidadoRegion', undefined, { region: regionName }).catch(console.warn);
}

/**
 * EXPORT 4: Consolidated Report -> CSV (.csv)
 */
export function exportConsolidatedReportToCSV(
  reportRows: ConsolidatedRowItem[],
  regionName: string = 'TODAS'
) {
  let currentLoc = '';
  const rows = reportRows.map(r => {
    if (r.isLocalidadHeader) {
      currentLoc = r.nombre;
      return {
        Localidad: r.nombre,
        Ambito: 'CONSOLIDADO_LOCALIDAD',
        Instalacion_Equipo: 'Total Localidad',
        Eficiencia_Porcentaje: r.promedioRegion?.toFixed(1) || '0.0',
        Ponderacion_Porcentaje: '100',
        Ponderado: r.promedioRegion?.toFixed(2) || '0.00',
        Consolidado_Localidad: r.promedioRegion?.toFixed(1) || '0.0'
      };
    }
    return {
      Localidad: currentLoc,
      Ambito: r.ambito,
      Instalacion_Equipo: r.nombre,
      Eficiencia_Porcentaje: Math.round(r.eficiencia).toString(),
      Ponderacion_Porcentaje: (r.ponderacion * 100).toFixed(1),
      Ponderado: r.ponderado.toFixed(2),
      Consolidado_Localidad: ''
    };
  });

  const csv = jsonToCSV(rows);
  const cleanRegion = regionName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Reporte_Consolidado_SST_${cleanRegion}_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

/**
 * EXPORT 5: Single Inspection -> Excel (.xlsx)
 */
export function exportSingleInspectionToExcel(
  inspection: Inspeccion,
  metadata: any
) {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Información General
  const generalInfo = [
    ['REPORTE DE INSPECCIÓN INDIVIDUAL'],
    ['Sistema de Gestión de Seguridad y Salud en el Trabajo - SGD Duncan'],
    [],
    ['Campo', 'Valor'],
    ['ID Inspección', inspection.id],
    ['Referencia', inspection.referencia || inspection.id.substring(0, 8).toUpperCase()],
    ['Fecha de Inspección', formatExportDate(inspection.fecha)],
    ['Tipo de Inspección', metadata?.tipo?.nombre || inspection.tipoInspeccionId],
    ['Empresa', metadata?.empresa?.nombre || inspection.empresaId],
    ['Localidad', metadata?.localidad?.nombre || inspection.localidadId],
    ['Establecimiento', metadata?.establecimiento?.nombre || inspection.establecimientoId],
    ['Inspector', inspection.inspectorId],
    ['Estado', inspection.estado],
    ['Conformidad (%)', `${inspection.puntuacionConformidad || 0}%`],
    ['Observaciones', inspection.observaciones || 'Sin observaciones registradas'],
    ['Coordenadas GPS', inspection.coordenadas ? `${inspection.coordenadas.lat}, ${inspection.coordenadas.lng}` : 'N/A']
  ];

  const wsGeneral = XLSX.utils.aoa_to_sheet(generalInfo);
  autoFitColumns(wsGeneral, generalInfo);
  XLSX.utils.book_append_sheet(wb, wsGeneral, 'Información General');

  // Hoja 2: Cuestionario y Respuestas
  const qaRows: any[] = [];
  const secciones = metadata?.tipo?.secciones || [];

  if (secciones.length > 0) {
    secciones.forEach((sec: any) => {
      sec.items?.forEach((item: any) => {
        const val = inspection.respuestas?.[item.id] ?? 'N/A';
        const hasPhoto = inspection.fotos?.[item.id] ? 'Sí' : 'No';
        qaRows.push({
          'Sección': sec.titulo,
          'Ítem / Pregunta': item.pregunta,
          'Tipo de Respuesta': item.tipoRespuesta,
          'Respuesta Registrada': String(val),
          'Foto Evidencia': hasPhoto,
          'Base Legal': item.referenciaLegal || ''
        });
      });
    });
  } else if (inspection.respuestas) {
    Object.entries(inspection.respuestas).forEach(([key, val]) => {
      qaRows.push({
        'Sección': 'General',
        'Ítem / Pregunta': key,
        'Tipo de Respuesta': 'N/D',
        'Respuesta Registrada': String(val),
        'Foto Evidencia': inspection.fotos?.[key] ? 'Sí' : 'No',
        'Base Legal': ''
      });
    });
  }

  if (qaRows.length > 0) {
    const wsQA = XLSX.utils.json_to_sheet(qaRows);
    const header = Object.keys(qaRows[0]);
    const matrix = [header, ...qaRows.map(r => Object.values(r))];
    autoFitColumns(wsQA, matrix);
    XLSX.utils.book_append_sheet(wb, wsQA, 'Cuestionario Evaluado');
  }

  const ref = inspection.referencia || inspection.id.substring(0, 8).toUpperCase();
  const filename = `Inspeccion_${ref}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
  auditService.logExport('EXCEL', filename, 'Inspeccion', inspection.id, { ref }).catch(console.warn);
}

/**
 * EXPORT 6: Single Inspection -> CSV (.csv)
 */
export function exportSingleInspectionToCSV(
  inspection: Inspeccion,
  metadata: any
) {
  const secciones = metadata?.tipo?.secciones || [];
  const qaRows: any[] = [];

  if (secciones.length > 0) {
    secciones.forEach((sec: any) => {
      sec.items?.forEach((item: any) => {
        const val = inspection.respuestas?.[item.id] ?? 'N/A';
        qaRows.push({
          ID_Inspeccion: inspection.id,
          Referencia: inspection.referencia || inspection.id.substring(0, 8).toUpperCase(),
          Fecha: formatExportDate(inspection.fecha),
          Tipo: metadata?.tipo?.nombre || inspection.tipoInspeccionId,
          Empresa: metadata?.empresa?.nombre || inspection.empresaId,
          Localidad: metadata?.localidad?.nombre || inspection.localidadId,
          Establecimiento: metadata?.establecimiento?.nombre || inspection.establecimientoId,
          Seccion: sec.titulo,
          Pregunta: item.pregunta,
          Respuesta: String(val),
          TieneFoto: inspection.fotos?.[item.id] ? 'SI' : 'NO'
        });
      });
    });
  } else if (inspection.respuestas) {
    Object.entries(inspection.respuestas).forEach(([key, val]) => {
      qaRows.push({
        ID_Inspeccion: inspection.id,
        Referencia: inspection.referencia || inspection.id.substring(0, 8).toUpperCase(),
        Fecha: formatExportDate(inspection.fecha),
        Tipo: inspection.tipoInspeccionId,
        Empresa: inspection.empresaId,
        Localidad: inspection.localidadId,
        Establecimiento: inspection.establecimientoId,
        Seccion: 'General',
        Pregunta: key,
        Respuesta: String(val),
        TieneFoto: inspection.fotos?.[key] ? 'SI' : 'NO'
      });
    });
  }

  const csv = jsonToCSV(qaRows);
  const ref = inspection.referencia || inspection.id.substring(0, 8).toUpperCase();
  const filename = `Inspeccion_${ref}_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

/**
 * EXPORT 7: Generic Current View Data -> Excel (.xlsx) or CSV (.csv)
 * Universal offline reporting function to export any filtered view's dataset.
 */
export function exportCurrentViewData(
  rows: Record<string, any>[],
  format: 'excel' | 'csv',
  filenamePrefix: string = 'Reporte_Vista_SST',
  sheetName: string = 'Datos Exportados'
) {
  if (!rows || rows.length === 0) return;
  const dateStamp = new Date().toISOString().split('T')[0];

  if (format === 'csv') {
    const csv = jsonToCSV(rows);
    downloadCSV(csv, `${filenamePrefix}_${dateStamp}.csv`);
    return;
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  const header = Object.keys(rows[0]);
  const matrix = [header, ...rows.map(r => Object.values(r))];
  autoFitColumns(ws, matrix);
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  const fileNameOut = `${filenamePrefix}_${dateStamp}.xlsx`;
  XLSX.writeFile(wb, fileNameOut);
  auditService.logExport('EXCEL', fileNameOut, 'DatasetView', undefined, { totalRows: rows.length }).catch(console.warn);
}

/**
 * Helper to determine effective Action Plan status (detecting overdue items)
 */
function getEffectiveActionPlanStatus(plan: PlanAccion): string {
  if (plan.estado === 'Cerrado') return 'Cerrado';
  if (plan.fechaLimite && new Date(plan.fechaLimite) < new Date()) return 'Vencido';
  return plan.estado;
}

/**
 * EXPORT 8: Action Plans (Planes de Acción) -> Excel (.xlsx)
 * Includes:
 * - Sheet 1: "Planes de Acción" (Main current view table)
 * - Sheet 2: "Historial de Seguimiento" (Status transitions & comments)
 * - Sheet 3: "Resumen KPIs" (Counts by status and priority for offline analysis)
 */
export function exportActionPlansToExcel(
  planes: PlanAccion[],
  empleados: Empleado[] = [],
  inspecciones: Inspeccion[] = [],
  options: { includeHistory?: boolean; filenamePrefix?: string; viewFilterName?: string } = {}
) {
  const wb = XLSX.utils.book_new();

  const planRows = planes.map(p => {
    const resp = empleados.find(e => e.id === p.responsableId);
    const insp = inspecciones.find(i => i.id === p.inspeccionId);
    const effectiveStatus = getEffectiveActionPlanStatus(p);
    const daysRemaining = p.fechaLimite
      ? Math.ceil((new Date(p.fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      'ID Plan': p.id,
      'Código Corto': `#${p.id.substring(0, 8).toUpperCase()}`,
      'Ref. Inspección': insp?.referencia || (p.inspeccionId ? `#${p.inspeccionId.substring(0, 8).toUpperCase()}` : 'Manual / Directo'),
      'Hallazgo / Desviación': p.hallazgo,
      'Descripción Detallada': p.descripcion || '',
      'Recomendación Técnica': p.recomendacion || '',
      'Responsable Asignado': resp?.nombre || 'Sin asignar',
      'Cargo Responsable': resp?.cargo || 'N/D',
      'Departamento': p.departamento || resp?.departamento || 'General',
      'Prioridad': p.prioridad,
      'Estado Registrado': p.estado,
      'Estado Efectivo': effectiveStatus,
      'Fecha Límite': formatExportDate(p.fechaLimite),
      'Días para Vencimiento': p.estado === 'Cerrado' ? 'Cerrado' : (daysRemaining !== null ? `${daysRemaining} días` : 'N/D'),
      'Fecha Creación': formatExportDate(p.createdAt),
      'Comentarios de Cierre': p.comentariosCierre || '',
      'Evidencia Fotográfica Cierre': p.fotoCierre ? 'Sí' : 'No',
      'Total Cambios Historial': p.history?.length || 0
    };
  });

  const wsPlanes = XLSX.utils.json_to_sheet(planRows);
  if (planRows.length > 0) {
    const header = Object.keys(planRows[0]);
    const matrix = [header, ...planRows.map(r => Object.values(r))];
    autoFitColumns(wsPlanes, matrix);
  }
  XLSX.utils.book_append_sheet(wb, wsPlanes, 'Planes de Acción');

  // Sheet 2: Historial de Seguimiento
  if (options.includeHistory !== false) {
    const historyRows: Record<string, any>[] = [];
    planes.forEach(p => {
      if (p.history && p.history.length > 0) {
        p.history.forEach((h, idx) => {
          historyRows.push({
            'ID Plan': p.id,
            'Código Plan': `#${p.id.substring(0, 8).toUpperCase()}`,
            'Hallazgo': p.hallazgo,
            'Paso #': idx + 1,
            'Estado Aplicado': h.status,
            'Actualizado Por': h.updatedBy,
            'Fecha y Hora': formatExportDate(h.updatedAt),
            'Comentario / Observación': h.comment || ''
          });
        });
      }
    });

    if (historyRows.length > 0) {
      const wsHistory = XLSX.utils.json_to_sheet(historyRows);
      const header = Object.keys(historyRows[0]);
      const matrix = [header, ...historyRows.map(r => Object.values(r))];
      autoFitColumns(wsHistory, matrix);
      XLSX.utils.book_append_sheet(wb, wsHistory, 'Historial Seguimiento');
    }
  }

  // Sheet 3: Resumen KPIs Offline
  const total = planes.length || 1;
  const cerrados = planes.filter(p => p.estado === 'Cerrado').length;
  const vencidos = planes.filter(p => getEffectiveActionPlanStatus(p) === 'Vencido').length;
  const enEjecucion = planes.filter(p => p.estado === 'En ejecución').length;
  const aprobados = planes.filter(p => p.estado === 'Aprobado').length;
  const pendientes = planes.filter(p => p.estado === 'Pendiente').length;

  const kpiRows = [
    { 'Indicador / Categoría': 'Filtro de Vista Exportada', 'Cantidad': options.viewFilterName || 'Todos', 'Porcentaje (%)': '100%' },
    { 'Indicador / Categoría': 'Total Planes de Acción Exportados', 'Cantidad': planes.length, 'Porcentaje (%)': '100%' },
    { 'Indicador / Categoría': 'Estado: Cerrados (Cumplidos)', 'Cantidad': cerrados, 'Porcentaje (%)': `${Math.round((cerrados / total) * 100)}%` },
    { 'Indicador / Categoría': 'Estado: En Ejecución', 'Cantidad': enEjecucion, 'Porcentaje (%)': `${Math.round((enEjecucion / total) * 100)}%` },
    { 'Indicador / Categoría': 'Estado: Aprobados', 'Cantidad': aprobados, 'Porcentaje (%)': `${Math.round((aprobados / total) * 100)}%` },
    { 'Indicador / Categoría': 'Estado: Pendientes', 'Cantidad': pendientes, 'Porcentaje (%)': `${Math.round((pendientes / total) * 100)}%` },
    { 'Indicador / Categoría': 'Estado Efectivo: Vencidos (Alerta)', 'Cantidad': vencidos, 'Porcentaje (%)': `${Math.round((vencidos / total) * 100)}%` },
    { 'Indicador / Categoría': 'Prioridad: Inmediato', 'Cantidad': planes.filter(p => p.prioridad === 'Inmediato').length, 'Porcentaje (%)': `${Math.round((planes.filter(p => p.prioridad === 'Inmediato').length / total) * 100)}%` },
    { 'Indicador / Categoría': 'Prioridad: Corto Plazo', 'Cantidad': planes.filter(p => p.prioridad === 'Corto Plazo').length, 'Porcentaje (%)': `${Math.round((planes.filter(p => p.prioridad === 'Corto Plazo').length / total) * 100)}%` },
    { 'Indicador / Categoría': 'Prioridad: Medio Plazo', 'Cantidad': planes.filter(p => p.prioridad === 'Medio Plazo').length, 'Porcentaje (%)': `${Math.round((planes.filter(p => p.prioridad === 'Medio Plazo').length / total) * 100)}%` },
    { 'Indicador / Categoría': 'Prioridad: Largo Plazo', 'Cantidad': planes.filter(p => p.prioridad === 'Largo Plazo').length, 'Porcentaje (%)': `${Math.round((planes.filter(p => p.prioridad === 'Largo Plazo').length / total) * 100)}%` }
  ];

  const wsKPI = XLSX.utils.json_to_sheet(kpiRows);
  const kpiHeader = Object.keys(kpiRows[0]);
  autoFitColumns(wsKPI, [kpiHeader, ...kpiRows.map(r => Object.values(r))]);
  XLSX.utils.book_append_sheet(wb, wsKPI, 'Resumen KPIs');

  const filename = `${options.filenamePrefix || 'Planes_Accion_SST'}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
  auditService.logExport('EXCEL', filename, 'PlanesAccion', undefined, { total: planes.length }).catch(console.warn);
}

/**
 * EXPORT 9: Action Plans (Planes de Acción) -> CSV (.csv)
 */
export function exportActionPlansToCSV(
  planes: PlanAccion[],
  empleados: Empleado[] = [],
  inspecciones: Inspeccion[] = [],
  options: { filenamePrefix?: string } = {}
) {
  const rows = planes.map(p => {
    const resp = empleados.find(e => e.id === p.responsableId);
    const insp = inspecciones.find(i => i.id === p.inspeccionId);
    const effectiveStatus = getEffectiveActionPlanStatus(p);

    return {
      ID_Plan: p.id,
      Codigo: p.id.substring(0, 8).toUpperCase(),
      Ref_Inspeccion: insp?.referencia || (p.inspeccionId ? p.inspeccionId.substring(0, 8).toUpperCase() : 'MANUAL'),
      Hallazgo: p.hallazgo,
      Descripcion: p.descripcion || '',
      Recomendacion: p.recomendacion || '',
      Responsable: resp?.nombre || 'Sin asignar',
      Cargo_Responsable: resp?.cargo || 'N/D',
      Departamento: p.departamento || resp?.departamento || 'General',
      Prioridad: p.prioridad,
      Estado_Registrado: p.estado,
      Estado_Efectivo: effectiveStatus,
      Fecha_Limite: formatExportDate(p.fechaLimite),
      Fecha_Creacion: formatExportDate(p.createdAt),
      Comentarios_Cierre: p.comentariosCierre || '',
      Tiene_Evidencia_Cierre: p.fotoCierre ? 'SI' : 'NO'
    };
  });

  const csv = jsonToCSV(rows);
  const filename = `${options.filenamePrefix || 'Planes_Accion_SST'}_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

/**
 * EXPORT 10: Medical Evaluations -> Excel (.xlsx) & CSV (.csv)
 */
export function exportMedicalEvaluationsData(
  evaluaciones: EvaluacionMedica[],
  format: 'excel' | 'csv',
  filenamePrefix: string = 'Evaluaciones_Medicas_SST'
) {
  const rows = evaluaciones.map(ev => ({
    'ID Evaluación': ev.id,
    'Código': `#${ev.id.substring(0, 6).toUpperCase()}`,
    'Trabajador': ev.empleadoNombre,
    'Cédula': ev.empleadoCedula,
    'Cargo': ev.empleadoCargo,
    'Departamento': ev.empleadoDepartamento,
    'Tipo de Evaluación': ev.tipoEvaluacion.replace(/_/g, ' '),
    'Estado': ev.estado,
    'Fecha Solicitud': formatExportDate(ev.fechaSolicitud),
    'Fecha Agendada': ev.fechaAgendada ? formatExportDate(ev.fechaAgendada) : 'N/A',
    'Fecha Realizada': ev.fechaRealizada ? formatExportDate(ev.fechaRealizada) : 'N/A',
    'Fecha Reintegro': ev.fechaReintegro ? formatExportDate(ev.fechaReintegro) : 'N/A',
    'Motivo / Observaciones': ev.motivoConsulta || ''
  }));

  exportCurrentViewData(rows, format, filenamePrefix, 'Evaluaciones Médicas');
}

/**
 * EXPORT 11: Work Permits -> Excel (.xlsx) & CSV (.csv)
 */
export function exportWorkPermitsData(
  permisos: PermisoTrabajo[],
  format: 'excel' | 'csv',
  filenamePrefix: string = 'Permisos_Trabajo_SST'
) {
  const rows = permisos.map(p => ({
    'ID Permiso': p.id,
    'Folio / Código': p.codigoPermiso,
    'Tipo Trabajo Riesgoso': p.tipoTrabajo.replace(/_/g, ' '),
    'Estado': p.estado.replace(/_/g, ' '),
    'Ubicación / Área': p.ubicacionDato,
    'Descripción del Trabajo': p.descripcionTrabajo,
    'Fecha Solicitud': formatExportDate(p.fechaSolicitud),
    'Inicio Vigencia': p.vigenciaInicio ? formatExportDate(p.vigenciaInicio) : 'N/D',
    'Fin Vigencia': p.vigenciaFin ? formatExportDate(p.vigenciaFin) : 'N/D',
    'Pasos AST Asociados': p.astAsociado?.pasos?.length || 0,
    'Ejecutor': p.responsables?.ejecutorId || 'N/D',
    'Emisor': p.responsables?.emisorId || 'Pendiente',
    'Supervisor SST': p.responsables?.supervisorId || 'Pendiente'
  }));

  exportCurrentViewData(rows, format, filenamePrefix, 'Permisos de Trabajo');
}
