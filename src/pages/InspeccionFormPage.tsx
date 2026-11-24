import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSGD } from '../contexts/SGDContext';
import { ArrowLeft, Save, CheckCircle, AlertTriangle, FileText, Camera, Trash2, Upload, X } from 'lucide-react';
import { FORM_REGISTRY, getFormDefinition, calculateScore, resolveItemResponse } from '../lib/formDefinitions';
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
    return getFormDefinition(inspeccion.tipoCodigo) ||
           getFormDefinition(inspeccion.tipoInspeccionId) ||
           getFormDefinition(inspeccion.tipoNombre);
  }, [inspeccion]);

  const initialResponses = useMemo(() => {
    let rawParsed: Record<string, any> = {};
    try {
      // 1. Direct object
      if (inspeccion?.respuestas && typeof inspeccion.respuestas === 'object' && Object.keys(inspeccion.respuestas).length > 0) {
        rawParsed = { ...inspeccion.respuestas };
      }
      // 2. Parsed formResponses
      else if (inspeccion?.formResponses) {
        const p = JSON.parse(inspeccion.formResponses);
        if (p && typeof p === 'object' && Object.keys(p).length > 0) rawParsed = { ...p };
      }
      // 3. Backup keys in localStorage
      if (Object.keys(rawParsed).length === 0) {
        const keys = [
          id,
          inspeccion?._id,
          inspeccion?.id,
          inspeccion?.correlativo ? String(inspeccion.correlativo) : null
        ].filter(Boolean) as string[];

        for (const k of keys) {
          const raw = localStorage.getItem(`sgd_inspection_responses_${k}`) || localStorage.getItem(`sgd_draft_resp_${k}`);
          if (raw) {
            const p = JSON.parse(raw);
            if (p && typeof p === 'object' && Object.keys(p).length > 0) {
              rawParsed = { ...p };
              break;
            }
          }
        }
      }
    } catch {
      rawParsed = {};
    }

    if (!formDef || Object.keys(rawParsed).length === 0) return rawParsed;

    // Normalizar hacia IDs canónicos de los items del formulario
    const normalized: Record<string, string> = { ...rawParsed };
    for (const section of formDef.sections) {
      for (const item of section.items) {
        if (!normalized[item.id]) {
          const resolved = resolveItemResponse(rawParsed, item);
          if (resolved) {
            normalized[item.id] = resolved;
          }
        }
      }
    }
    return normalized;
  }, [inspeccion, id, formDef]);

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
      <div className="py-16 text-center text-slate-500 card p-8 max-w-md mx-auto my-12 border border-slate-200">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="font-bold text-lg text-slate-800">Formulario no encontrado</p>
        <p className="text-xs text-slate-500 mt-1">
          No se encontró la plantilla para "{inspeccion.tipoNombre || inspeccion.tipoCodigo}".
        </p>
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
      const targetId = inspeccion._id || inspeccion.id || String(inspeccion.correlativo) || id || '';
      const correl = inspeccion.correlativo || (id && !isNaN(Number(id)) ? Number(id) : undefined);

      // Respaldo redundante inmediato en localStorage
      const backupKeys = [targetId, inspeccion._id, inspeccion.id, String(correl), id].filter(Boolean) as string[];
      for (const k of backupKeys) {
        try {
          localStorage.setItem(`sgd_inspection_responses_${k}`, JSON.stringify(data.responses));
          localStorage.setItem(`sgd_draft_resp_${k}`, JSON.stringify(data.responses));
          localStorage.setItem(`sgd_inspection_score_${k}`, JSON.stringify({
            puntuacion: data.score.puntuacion,
            resultado: data.score.resultado
          }));
        } catch {}
      }

      await saveFormData({
        inspeccionId: targetId,
        _id: inspeccion._id || targetId,
        id: inspeccion.id || targetId,
        correlativo: correl,
        referencia: inspeccion.referencia || `INSP-${correl || targetId}`,
        responses: JSON.stringify(data.responses),
        respuestas: data.responses,
        observations: JSON.stringify(data.observations),
        additional: JSON.stringify(data.additional),
        signatures: JSON.stringify(data.signatures),
        puntuacion: data.score.puntuacion,
        resultado: data.score.resultado,
      });

      const dictamen = data.score.resultado === 'C' ? 'Conforme' : data.score.resultado === 'OM' ? 'Oportunidad de Mejora' : 'No Conforme';
      toast.success(`Progreso guardado (${data.score.puntuacion}% · ${dictamen})`);
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
      const targetId = inspeccion._id || inspeccion.id || String(inspeccion.correlativo) || id || '';
      const correl = inspeccion.correlativo || (id && !isNaN(Number(id)) ? Number(id) : undefined);

      const backupKeys = [targetId, inspeccion._id, inspeccion.id, String(correl), id].filter(Boolean) as string[];
      for (const k of backupKeys) {
        try {
          localStorage.setItem(`sgd_inspection_responses_${k}`, JSON.stringify(data.responses));
          localStorage.setItem(`sgd_draft_resp_${k}`, JSON.stringify(data.responses));
          localStorage.setItem(`sgd_inspection_score_${k}`, JSON.stringify({
            puntuacion: data.score.puntuacion,
            resultado: data.score.resultado
          }));
        } catch {}
      }

      // Guardar primero
      await saveFormData({
        inspeccionId: targetId,
        _id: inspeccion._id || targetId,
        id: inspeccion.id || targetId,
        correlativo: correl,
        referencia: inspeccion.referencia || `INSP-${correl || targetId}`,
        responses: JSON.stringify(data.responses),
        respuestas: data.responses,
        observations: JSON.stringify(data.observations),
        additional: JSON.stringify(data.additional),
        signatures: JSON.stringify(data.signatures),
        puntuacion: data.score.puntuacion,
        resultado: data.score.resultado,
      });

      // Completar pasando todos los datos calculados
      await completeInspeccion(targetId, {
        puntuacion: data.score.puntuacion,
        resultado: data.score.resultado,
        respuestas: data.responses,
        responses: JSON.stringify(data.responses),
        observaciones: JSON.stringify(data.observations),
        signatures: JSON.stringify(data.signatures)
      });
      toast.success('¡Inspección completada con éxito!');
      navigate(`/inspecciones/${targetId}`);
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
        onComplete={handleComplete}
        inspeccionId={inspeccion._id || inspeccion.id || String(inspeccion.correlativo) || id}
      />
    </div>
  );
}
