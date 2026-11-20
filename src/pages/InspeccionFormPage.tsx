import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSGD } from '../contexts/SGDContext';
import { ArrowLeft, Save, CheckCircle, AlertTriangle, FileText, Camera, Trash2, Upload, X } from 'lucide-react';
import { FORM_REGISTRY, calculateScore } from '../lib/formDefinitions';
import { DynamicInspectionForm } from '../components/DynamicInspectionForm';
import { formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

export default function InspeccionFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInspeccionById, saveFormData, completeInspeccion } = useSGD();

  const inspeccion = id ? getInspeccionById(id) : undefined;

  const formDef = useMemo(() => {
    if (!inspeccion) return null;
    return FORM_REGISTRY[inspeccion.tipoCodigo] || FORM_REGISTRY.EXT;
  }, [inspeccion]);

  const initialResponses = useMemo(() => {
    try {
      return inspeccion?.formResponses ? JSON.parse(inspeccion.formResponses) : {};
    } catch {
      return {};
    }
  }, [inspeccion]);

  const initialObservations = useMemo(() => {
    try {
      return inspeccion?.formObservations ? JSON.parse(inspeccion.formObservations) : {};
    } catch {
      return {};
    }
  }, [inspeccion]);

  const initialAdditional = useMemo(() => {
    try {
      return inspeccion?.formAdditional ? JSON.parse(inspeccion.formAdditional) : {};
    } catch {
      return {};
    }
  }, [inspeccion]);

  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

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

  if (!formDef) {
    return (
      <div className="py-16 text-center text-slate-500">
        <p className="font-semibold text-lg">Formulario no configurado para este tipo</p>
        <Link to="/inspecciones" className="btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver a Inspecciones
        </Link>
      </div>
    );
  }

  const handleSave = async (data: {
    responses: Record<string, string>;
    observations: Record<string, string>;
    additional: Record<string, string>;
    signatures: Record<string, string>;
    score: ReturnType<typeof calculateScore>;
  }) => {
    setSaving(true);
    try {
      await saveFormData({
        inspeccionId: inspeccion._id,
        responses: JSON.stringify(data.responses),
        observations: JSON.stringify(data.observations),
        additional: JSON.stringify(data.additional),
        signatures: JSON.stringify(data.signatures),
        puntuacion: data.score.puntuacion,
        resultado: data.score.resultado,
      });
      toast.success('Progreso guardado correctamente');
    } catch (err) {
      toast.error('Error al guardar el progreso');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (data: {
    responses: Record<string, string>;
    observations: Record<string, string>;
    additional: Record<string, string>;
    signatures: Record<string, string>;
    score: ReturnType<typeof calculateScore>;
  }) => {
    setCompleting(true);
    try {
      // Guardar primero
      await saveFormData({
        inspeccionId: inspeccion._id,
        responses: JSON.stringify(data.responses),
        observations: JSON.stringify(data.observations),
        additional: JSON.stringify(data.additional),
        signatures: JSON.stringify(data.signatures),
        puntuacion: data.score.puntuacion,
        resultado: data.score.resultado,
      });
      // Completar
      await completeInspeccion(inspeccion._id);
      toast.success('¡Inspección completada con éxito!');
      navigate(`/inspecciones/${inspeccion._id}`);
    } catch (err) {
      toast.error('Error al completar la inspección');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/inspecciones')}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-blue text-xs">{inspeccion.tipoCodigo}</span>
              <h1 className="text-xl font-bold text-slate-900">{formDef.name}</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {inspeccion.establecimientoNombre} · {inspeccion.empresaNombre} · {formatDate(inspeccion.fecha)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/inspecciones/${inspeccion._id}`}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <FileText className="h-4 w-4" /> Ver Reporte
          </Link>
        </div>
      </div>

      {/* Dynamic Form */}
      <DynamicInspectionForm
        formDef={formDef}
        initialResponses={initialResponses}
        initialObservations={initialObservations}
        initialAdditional={initialAdditional}
        onSave={handleSave}
      />
    </div>
  );
}
