/**
 * SGD DUNCAN 2.0 — Exportador y Generador de Planes de Acción Institucionales
 * Genera la estructura oficial Duncan en formatos CSV, Excel (.xlsx), Correo Electrónico
 * y WhatsApp para No Conformidades (NC) y Oportunidades de Mejora (OM) por inspección.
 */

import * as XLSX from 'xlsx';
import type { Inspeccion, PlanAccion } from '../types';
import { formatDate, getReportHeaderTitle } from './utils';

export interface ActionPlanExportMeta {
  empresaNombre?: string;
  localidadNombre?: string;
  establecimientoNombre?: string;
  tipoNombre?: string;
  tipoCodigo?: string;
  rondaNo?: number;
  revisorNombre?: string;
}

function getMesAno(dateStr?: string): string {
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

function getNivelConformidad(puntuacion?: number): string {
  const p = typeof puntuacion === 'number' ? puntuacion : 100;
  if (p >= 85) return 'ALTO';
  if (p >= 70) return 'MEDIO';
  return 'BAJO';
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
  // Fecha cierre estimada 15 días posteriores
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
  lines.push(`,Departamento de Seguridad y Salud Laboral (SSA),,,,,,,,,0`);

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
    const legal = `"${(item.aspectoLegal || item.notas || 'Normativa legal COVENIN / RCHST').replace(/"/g, '""').trim()}"`;
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
}

/**
 * Exporta el Plan de Acción oficial a Excel (.xlsx)
 */
export function exportActionPlanToExcel(
  inspeccion: Inspeccion,
  items: PlanAccion[],
  meta?: ActionPlanExportMeta
) {
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

  const rows: any[][] = [
    [`Programa de Seguridad y Salud en el Trabajo - ${tipoNom.toUpperCase().includes('SERVI') ? 'Inspección de Servicentros' : 'Inspección de Distribuidoras'}`],
    ['Código', 'Departamento emisor', '', '', '', '', '', '', '', 'N° Revisión:', '0'],
    ['', 'Departamento de Seguridad y Salud Laboral (SSA)'],
    [`PLAN ACCION ${estNombre} ${mesAno}`],
    [`PLAN DE ACCIÓN DERIVADO DE ${headerTipo}`],
    [],
    ['Id', 'EMPRESA - LOCALIDAD - ESTABLECIMIENTO - FECHA', '', '', '', '', 'Ronda N°', 'Fecha de Inspección', 'Fecha de Cierre', 'Porcentaje Obtenido', 'Nivel de Conformidad'],
    [correlStr, `${empNombre} - ${locNombre} - ${estNombre} - ${mesAno}`, '', '', '', '', meta?.rondaNo || 1, fechaInsp, fechaCierre, `${puntuacionVal}%`, nivelConf],
    [],
    ['LEYENDA: C: Conforme; OM: Oportunidad de Mejora; NC: No Conforme; NA: No aplica; SSA: Seguridad, Salud, Ambiente; INFRA: Infraestructura; VEHCP: Vehículos y Equipos Móviles; LEGAL: Legal / Normativo'],
    [],
    ['Aspectos evaluado', 'Preguntas', 'Aspecto legal -técnico', 'Grupos o familias', 'Areas responsables', 'Conformidad', 'Prioridad', 'Fecha de ejecución', 'Fecha de verificación', 'Recursos necesarios', 'Observaciones']
  ];

  items.forEach(item => {
    rows.push([
      item.aspectoEvaluado || item.seccion || 'Seguridad Industrial',
      item.preguntaTexto || item.hallazgo || '',
      item.aspectoLegal || item.notas || 'COVENIN / RCHST',
      item.grupoPilar || 'SSA',
      item.areaResponsable || item.departamento || 'VENTAS - OPERACIONES',
      item.conformidad || (item.prioridad === 'Critica' ? 'NC' : 'OM'),
      item.prioridad || 'Media',
      item.fechaEjecucion || item.fechaLimite || '',
      item.fechaVerificacion || '',
      item.recursosNecesarios || '',
      item.observaciones || item.recomendacion || ''
    ]);
  });

  rows.push([]);
  rows.push(['Personal que realizó la Inspección']);
  rows.push(['Realizada por:', '', '', '', 'Revisado por:']);
  rows.push([inspector, '', '', '', revisor]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Auto-ajustar anchos de columnas
  const colWidths = [
    { wch: 26 }, // Aspecto evaluado
    { wch: 45 }, // Preguntas
    { wch: 38 }, // Aspecto legal
    { wch: 12 }, // Grupos
    { wch: 24 }, // Areas responsables
    { wch: 12 }, // Conformidad
    { wch: 12 }, // Prioridad
    { wch: 16 }, // Fecha ejec
    { wch: 16 }, // Fecha verif
    { wch: 22 }, // Recursos
    { wch: 35 }, // Observaciones
  ];
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Plan de Acción');
  const filename = `Plan_Accion_${estNombre.replace(/\s+/g, '_')}_${correlStr}.xlsx`;
  XLSX.writeFile(wb, filename);
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
3. Se adjunta el archivo oficial de planificación (.xlsx / .csv) generado por la plataforma SGD Duncan 2.0.

Atentamente,
Departamento de Seguridad y Salud Laboral (SSA)
Acumuladores Duncan, C.A. / Grupo Duncan`;

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { subject, body, mailtoUrl };
}
