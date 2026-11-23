import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSGD } from '../contexts/SGDContext';
import { ArrowLeft } from 'lucide-react';
import InspectionReport from '../components/InspectionReport';
import type { Inspeccion } from '../types';

export default function ReportePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInspeccionById } = useSGD();

  const inspeccion = id ? getInspeccionById(id) : undefined;

  if (!inspeccion) {
    return (
      <div className="py-16 text-center text-slate-500">
        <p className="font-semibold text-lg">Inspección no encontrada</p>
        <Link to="/inspecciones" className="btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver a Inspecciones
        </Link>
      </div>
    );
  }

  // Extraer respuestas, firmas y adicionales de forma segura
  let parsedResponses: Record<string, any> = {};
  try {
    if (inspeccion.respuestas && typeof inspeccion.respuestas === 'object' && Object.keys(inspeccion.respuestas).length > 0) {
      parsedResponses = { ...inspeccion.respuestas };
    } else if (inspeccion.formResponses) {
      const p = JSON.parse(inspeccion.formResponses);
      if (p && typeof p === 'object') parsedResponses = { ...p };
    }
  } catch (e) {
    parsedResponses = {};
  }

  // Si aún está vacío, recuperar desde respaldos de localStorage
  if (Object.keys(parsedResponses).length === 0 && typeof window !== 'undefined') {
    const backupKeys = [
      id,
      inspeccion._id,
      inspeccion.id,
      inspeccion.correlativo ? String(inspeccion.correlativo) : null,
      inspeccion.referencia
    ].filter(Boolean) as string[];

    for (const k of backupKeys) {
      try {
        const raw = localStorage.getItem(`sgd_inspection_responses_${k}`) || localStorage.getItem(`sgd_draft_resp_${k}`);
        if (raw) {
          const p = JSON.parse(raw);
          if (p && typeof p === 'object' && Object.keys(p).length > 0) {
            parsedResponses = { ...p };
            break;
          }
        }
      } catch {}
    }
  }

  let parsedFirmas: Record<string, string> = {};
  try {
    if (inspeccion.firmas && typeof inspeccion.firmas === 'object') {
      parsedFirmas = { ...inspeccion.firmas };
    } else if (inspeccion.formSignatures) {
      parsedFirmas = JSON.parse(inspeccion.formSignatures);
    }
  } catch (e) {
    parsedFirmas = {};
  }

  let parsedAdditional: Record<string, string> = {};
  try {
    if (inspeccion.respuestasAdicionales && typeof inspeccion.respuestasAdicionales === 'object') {
      parsedAdditional = { ...inspeccion.respuestasAdicionales };
    } else if (inspeccion.formAdditional) {
      parsedAdditional = JSON.parse(inspeccion.formAdditional);
    }
  } catch (e) {
    parsedAdditional = {};
  }

  // Si hay campos adicionales (ubicacion, capacidad, etc.), integrarlos en respuestas para templates
  Object.entries(parsedAdditional).forEach(([k, v]) => {
    if (v && !parsedResponses[k]) {
      parsedResponses[k] = v;
    }
  });

  // Mapear campos si faltan para compatibilidad total con el template avanzado
  const inspectionFull: Inspeccion = {
    ...inspeccion,
    id: inspeccion._id || inspeccion.id,
    empresaId: inspeccion.empresaId || 'emp_ddca',
    empresaNombre: inspeccion.empresaNombre || 'Distribuidora Duncan, C.A.',
    localidadId: inspeccion.localidadId || 'loc_caracas',
    localidadNombre: inspeccion.localidadNombre || 'Caracas',
    establecimientoId: inspeccion.establecimientoId || 'est_dist_ccs',
    establecimientoNombre: inspeccion.establecimientoNombre || 'Distribuidora Duncan Caracas',
    tipoInspeccionId: inspeccion.tipoInspeccionId || 'ti_ext',
    tipoCodigo: inspeccion.tipoCodigo || 'GEN',
    tipoNombre: inspeccion.tipoNombre || 'Inspección SSA',
    inspectorId: inspeccion.inspectorId || inspeccion.inspector || 'Francisco Rojas',
    inspector: inspeccion.inspector || inspeccion.inspectorId || 'Francisco Rojas',
    fecha: inspeccion.fecha,
    estado: (inspeccion.estado === 'completada' ? 'Completada' : inspeccion.estado === 'en_progreso' ? 'En Progreso' : 'Borrador') as any,
    respuestas: parsedResponses,
    firmas: parsedFirmas,
    respuestasAdicionales: parsedAdditional,
    puntuacionConformidad: inspeccion.puntuacion ?? inspeccion.puntuacionConformidad ?? 100,
    observaciones: inspeccion.observaciones || (typeof inspeccion.formObservations === 'string' && !inspeccion.formObservations.startsWith('{') ? inspeccion.formObservations : '') || '',
    referencia: inspeccion.referencia || `INSP-${inspeccion.correlativo || '001'}`,
    createdAt: inspeccion.createdAt || inspeccion.actualizadoEn || new Date().toISOString(),
    updatedAt: inspeccion.updatedAt || inspeccion.actualizadoEn || new Date().toISOString(),
  };

  return (
    <InspectionReport
      inspection={inspectionFull}
      onBack={() => navigate('/inspecciones')}
      onEdit={() => navigate(`/inspecciones/${id}/formulario`)}
    />
  );
}
