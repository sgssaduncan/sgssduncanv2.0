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

  // Mapear campos si faltan para compatibilidad total con el template avanzado
  const inspectionFull: Inspeccion = {
    ...inspeccion,
    id: inspeccion._id || inspeccion.id,
    empresaId: inspeccion.empresaId || 'emp_ddca',
    localidadId: inspeccion.localidadId || 'loc_caracas',
    establecimientoId: inspeccion.establecimientoId || 'est_dist_ccs',
    tipoInspeccionId: inspeccion.tipoInspeccionId || 'ti_ext',
    inspectorId: inspeccion.inspectorId || inspeccion.inspector || 'Francisco Rojas',
    inspector: inspeccion.inspector || inspeccion.inspectorId || 'Francisco Rojas',
    fecha: inspeccion.fecha,
    estado: (inspeccion.estado === 'completada' ? 'Completada' : inspeccion.estado === 'en_progreso' ? 'En Progreso' : 'Borrador') as any,
    respuestas: inspeccion.respuestas || (inspeccion.formResponses ? JSON.parse(inspeccion.formResponses) : {}),
    puntuacionConformidad: inspeccion.puntuacion || inspeccion.puntuacionConformidad || 100,
    observaciones: inspeccion.observaciones || inspeccion.formObservations || '',
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
