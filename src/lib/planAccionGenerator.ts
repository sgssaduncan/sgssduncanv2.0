// =========================================================================
// SGD DUNCAN 2.0 — GENERADOR CANÓNICO DE PLANES DE ACCIÓN DESDE INSPECCIONES
// Extrae automáticamente desviaciones (NC: No Conforme) y mejoras (OM: Oportunidad de Mejora)
// vinculándolas al establecimiento, empresa, norma legal y responsable específico.
// =========================================================================

import type { Inspeccion, PlanAccion, EstadoPlanAccion, PrioridadPlanAccion } from '../types';
import { getFormDefinition, resolveItemResponse, classifyResponse } from './formDefinitions';
import { resolveEmpresaInfo } from './empresaResolver';

/**
 * Genera la lista de planes de acción obligatorios para una inspección que contenga
 * respuestas calificadas como No Conforme (NC) u Oportunidad de Mejora (OM).
 */
export function generatePlanesAccionFromInspeccion(inspeccion: Inspeccion): PlanAccion[] {
  if (!inspeccion) return [];

  // 1. Extraer respuestas normalizadas
  let respuestas: Record<string, any> = {};
  if (inspeccion.respuestas && typeof inspeccion.respuestas === 'object' && Object.keys(inspeccion.respuestas).length > 0) {
    respuestas = { ...inspeccion.respuestas };
  } else if (inspeccion.formResponses) {
    try {
      const p = JSON.parse(inspeccion.formResponses);
      if (p && typeof p === 'object') respuestas = { ...p };
    } catch {}
  } else if ((inspeccion as any).responses) {
    try {
      const p = typeof (inspeccion as any).responses === 'string' 
        ? JSON.parse((inspeccion as any).responses) 
        : (inspeccion as any).responses;
      if (p && typeof p === 'object') respuestas = { ...p };
    } catch {}
  }

  // Si no hay respuestas en memoria, buscar en localStorage si está en entorno de navegador
  if (Object.keys(respuestas).length === 0 && typeof window !== 'undefined') {
    const keys = [
      inspeccion._id,
      inspeccion.id,
      inspeccion.correlativo ? String(inspeccion.correlativo) : null,
      inspeccion.referencia
    ].filter(Boolean) as string[];

    for (const k of keys) {
      try {
        const raw = localStorage.getItem(`sgd_inspection_responses_${k}`) || localStorage.getItem(`sgd_draft_resp_${k}`);
        if (raw) {
          const p = JSON.parse(raw);
          if (p && typeof p === 'object' && Object.keys(p).length > 0) {
            respuestas = { ...p };
            break;
          }
        }
      } catch {}
    }
  }

  if (Object.keys(respuestas).length === 0) {
    return [];
  }

  // 2. Resolver la definición del formulario
  const tipoCodigo = inspeccion.tipoCodigo || 'DD';
  const formDef = getFormDefinition(tipoCodigo) ||
                  getFormDefinition(inspeccion.tipoInspeccionId) ||
                  getFormDefinition(inspeccion.tipoNombre) ||
                  getFormDefinition('DD');

  if (!formDef || !formDef.sections) return [];

  // 3. Resolver datos del establecimiento y empresa
  const resolvedEmp = resolveEmpresaInfo({
    empresaId: inspeccion.empresaId,
    empresaNombre: inspeccion.empresaNombre,
    establecimientoId: inspeccion.establecimientoId,
    establecimientoNombre: inspeccion.establecimientoNombre
  });

  const empNombre = resolvedEmp.nombre;
  const estNombre = inspeccion.establecimientoNombre || 'Distribuidora Duncan Valencia';
  const estId = inspeccion.establecimientoId || 'est_dist_val';
  const inspId = String(inspeccion._id || inspeccion.id || inspeccion.correlativo || 'insp');
  const correlStr = inspeccion.correlativo ? String(inspeccion.correlativo) : (inspeccion.referencia ? inspeccion.referencia.replace(/^REF-|^INSP-/, '') : '1006');
  const refCode = inspeccion.referencia || `INSP-${correlStr}`;

  const fechaDeteccion = inspeccion.fecha 
    ? String(inspeccion.fecha).split('T')[0] 
    : new Date().toISOString().split('T')[0];

  // Plazos normativos oficiales:
  // NC (No Conforme): Plazo perentorio de 15 días continuos
  // OM (Oportunidad de Mejora): Plazo de 30 días continuos
  const detDate = new Date(fechaDeteccion);
  const baseTime = isNaN(detDate.getTime()) ? Date.now() : detDate.getTime();
  const fechaLimiteNC = new Date(baseTime + 15 * 86400000).toISOString().split('T')[0];
  const fechaLimiteOM = new Date(baseTime + 30 * 86400000).toISOString().split('T')[0];

  const nowIso = new Date().toISOString();
  const planesGenerados: PlanAccion[] = [];

  // 4. Recorrer secciones e ítems del formulario evaluando las respuestas
  formDef.sections.forEach(section => {
    (section.items || []).forEach(item => {
      const rawVal = resolveItemResponse(respuestas, item);
      const classification = classifyResponse(rawVal);

      if (classification === 'NC' || classification === 'OM') {
        const isNC = classification === 'NC';
        const cleanItemId = String(item.id).replace(/\./g, '_');
        const planId = `plan_${inspId}_${cleanItemId}`;

        const itemLabel = item.label || item.preguntaOriginal || `Ítem ${item.id}`;
        const preguntaTexto = item.preguntaOriginal || item.label || '';
        const aspectoLegal = item.aspectoLegal || '';
        const areaResp = item.areaResponsable || 'Operaciones & SSA';
        const seccionNombre = item.aspecto || section.title.replace(/^\d+\.\s*/, '') || 'Seguridad Industrial';

        const hallazgoTitulo = isNC
          ? `[NO CONFORME] Criterio ${item.id}: ${itemLabel}`
          : `[OPORTUNIDAD DE MEJORA] Criterio ${item.id}: ${itemLabel}`;

        const descripcionCompleta = preguntaTexto 
          ? `Hallazgo evidenciado en ${estNombre}: ${preguntaTexto}`
          : `Desviación en ${estNombre} sobre criterio ${item.id}.`;

        const recomendacionTexto = aspectoLegal
          ? `Adecuar las instalaciones/procesos conforme a la norma: ${aspectoLegal}`
          : (isNC ? 'Corregir inmediatamente la condición subestándar y levantar evidencia fotográfica.' : 'Implementar medidas preventivas de optimización continua.');

        const prioridad: PrioridadPlanAccion = isNC ? 'Critica' : 'Media';
        const fechaLimite = isNC ? fechaLimiteNC : fechaLimiteOM;

        const plan: PlanAccion = {
          id: planId,
          _id: planId,
          inspeccionId: inspId,
          inspeccionCorrelativo: correlStr,
          empresaId: resolvedEmp.id,
          empresaNombre: empNombre,
          establecimientoId: estId,
          establecimientoNombre: estNombre,
          localidadId: inspeccion.localidadId || 'loc_valencia',
          localidadNombre: inspeccion.localidadNombre || 'Valencia',
          tipoInspeccionCodigo: tipoCodigo,
          tipoInspeccionNombre: inspeccion.tipoNombre || formDef.name,
          item: item.id,
          seccion: seccionNombre,
          hallazgo: hallazgoTitulo,
          descripcion: descripcionCompleta,
          recomendacion: recomendacionTexto,
          responsable: inspeccion.inspector || 'Supervisor SST Duncan',
          responsableId: inspeccion.inspectorId || 'supervisor_sede',
          departamento: areaResp,
          prioridad: prioridad,
          fechaDeteccion: fechaDeteccion,
          fechaLimite: fechaLimite,
          estado: 'Pendiente',
          notas: aspectoLegal ? `Base Legal: ${aspectoLegal}` : `Inspección Ref: ${refCode}`,
          createdAt: nowIso,
          updatedAt: nowIso,
          history: [
            {
              status: 'Pendiente',
              updatedBy: inspeccion.inspector || 'Sistema Automatizado SGD',
              updatedAt: nowIso,
              comment: `Plan generado automáticamente por detección de ${isNC ? 'No Conformidad (NC)' : 'Oportunidad de Mejora (OM)'} en inspección ${refCode}.`
            }
          ]
        };

        planesGenerados.push(plan);
      }
    });
  });

  return planesGenerados;
}

/**
 * Escanea una colección completa de inspecciones y genera todos los planes de acción
 * consolidándolos de forma única por ID para evitar duplicados.
 */
export function generatePlanesAccionFromInspecciones(inspecciones: Inspeccion[]): PlanAccion[] {
  if (!inspecciones || !Array.isArray(inspecciones)) return [];
  
  const map = new Map<string, PlanAccion>();

  inspecciones.forEach(insp => {
    const planes = generatePlanesAccionFromInspeccion(insp);
    planes.forEach(p => {
      const key = p.id || p._id || `${p.inspeccionId}_${p.item}`;
      if (!map.has(key)) {
        map.set(key, p);
      }
    });
  });

  return Array.from(map.values());
}
