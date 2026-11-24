import { useState, useMemo, useEffect } from "react";
import { CheckCircle2, Info, XCircle, AlertTriangle, MinusCircle, ChevronDown, ChevronUp, Save, BarChart3 } from "lucide-react";
import type { InspectionFormDef, FormSection, FormItem, ResponseType } from "../lib/formDefinitions";
import { calculateScore } from "../lib/formDefinitions";

interface Props {
  formDef: InspectionFormDef;
  initialResponses?: Record<string, string>;
  initialObservations?: Record<string, string>;
  initialAdditional?: Record<string, string>;
  onSave: (data: {
    responses: Record<string, string>;
    observations: Record<string, string>;
    additional: Record<string, string>;
    signatures: Record<string, string>;
    score: ReturnType<typeof calculateScore>;
  }) => void;
  onComplete?: (data: {
    responses: Record<string, string>;
    observations: Record<string, string>;
    additional: Record<string, string>;
    signatures: Record<string, string>;
    score: ReturnType<typeof calculateScore>;
  }) => void;
  readOnly?: boolean;
  inspeccionId?: string;
}

// Response button component
function ResponseButton({ value, selected, onClick, disabled }: { value: string; selected: boolean; onClick: () => void; disabled?: boolean }) {
  const styles: Record<string, { bg: string; icon: any; label: string }> = {
    "C": { bg: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: CheckCircle2, label: "C" },
    "NC": { bg: "bg-red-100 text-red-700 border-red-300", icon: XCircle, label: "NC" },
    "OM": { bg: "bg-amber-100 text-amber-700 border-amber-300", icon: AlertTriangle, label: "OM" },
    "NA": { bg: "bg-slate-100 text-slate-500 border-slate-300", icon: MinusCircle, label: "NA" },
    "Bueno": { bg: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: CheckCircle2, label: "Bueno" },
    "Dañado": { bg: "bg-red-100 text-red-700 border-red-300", icon: XCircle, label: "Dañado" },
    "No Aplica": { bg: "bg-slate-100 text-slate-500 border-slate-300", icon: MinusCircle, label: "N/A" },
    "Si": { bg: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: CheckCircle2, label: "Sí" },
    "No": { bg: "bg-red-100 text-red-700 border-red-300", icon: XCircle, label: "No" },
    "Operativo": { bg: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: CheckCircle2, label: "Operativo" },
    "No Operativo": { bg: "bg-red-100 text-red-700 border-red-300", icon: XCircle, label: "No Operativo" },
  };

  const style = styles[value] || { bg: "bg-slate-100 text-slate-600 border-slate-300", icon: MinusCircle, label: value };
  const Icon = style.icon;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
        selected ? `${style.bg} ring-2 ring-offset-1 ring-current shadow-sm scale-105` : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {style.label}
    </button>
  );
}

function getOptionsForType(type: ResponseType, item: FormItem): string[] {
  switch (type) {
    case "C_NC_OM_NA": return ["C", "NC", "OM", "NA"];
    case "BUENO_DANADO_NA": return ["Bueno", "Dañado", "No Aplica"];
    case "SI_NO": return ["Si", "No"];
    case "SI_NO_NA": return ["Si", "No", "NA"];
    case "OPERATIVO_NO": return ["Operativo", "No Operativo"];
    case "SELECT": return item.options || [];
    default: return [];
  }
}

function SectionCard({ 
  section, 
  responses, 
  observations, 
  onResponse, 
  onObservation, 
  readOnly,
  sectionIndex,
}: { 
  section: FormSection; 
  responses: Record<string, string>;
  observations: Record<string, string>;
  onResponse: (itemId: string, value: string) => void;
  onObservation: (sectionId: string, value: string) => void;
  readOnly?: boolean;
  sectionIndex: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const answered = section.items.filter(i => responses[i.id]).length;
  const total = section.items.length;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm">
            {sectionIndex + 1}
          </span>
          <div className="text-left">
            <h3 className="font-semibold text-slate-900">{section.title}</h3>
            {section.description && <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${progress === 100 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-slate-500 font-medium">{answered}/{total}</span>
          </div>
          {expanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100">
          <div className="divide-y divide-slate-50">
            {section.items.map((item) => {
              const options = getOptionsForType(item.responseType, item);
              const isSelectType = item.responseType === "SELECT";
              
              return (
                <div key={item.id} className={`px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${responses[item.id] ? "" : "bg-amber-50/20"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-slate-600 font-mono text-xs font-black bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {item.id}
                      </span>
                      {item.grupoPilar && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border uppercase ${
                          item.grupoPilar === 'INFRA' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          item.grupoPilar === 'LEGAL' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          item.grupoPilar === 'SSA' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          'bg-purple-100 text-purple-800 border-purple-300'
                        }`}>
                          {item.grupoPilar}
                        </span>
                      )}
                      {item.areaResponsable && (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          {item.areaResponsable}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-slate-800 block">
                      {item.label}
                    </span>
                    {item.aspectoLegal && (
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        ⚖️ {item.aspectoLegal}
                      </span>
                    )}
                    {item.preguntaOriginal && item.preguntaOriginal !== item.label && (
                      <button
                        type="button"
                        onClick={() => setExpandedDetails(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 mt-1"
                      >
                        <Info className="h-3 w-3" />
                        <span>{expandedDetails[item.id] ? "Ocultar texto normativo completo" : "Ver texto normativo completo"}</span>
                      </button>
                    )}
                    {expandedDetails[item.id] && item.preguntaOriginal && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1 italic">
                        "{item.preguntaOriginal}"
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {item.responseType === "TEXT" ? (
                      <input
                        type="text"
                        value={responses[item.id] || ""}
                        onChange={e => onResponse(item.id, e.target.value)}
                        disabled={readOnly}
                        placeholder="Escriba aquí..."
                        className="w-full sm:w-56 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : item.responseType === "NUMBER" ? (
                      <input
                        type="number"
                        value={responses[item.id] || ""}
                        onChange={e => onResponse(item.id, e.target.value)}
                        disabled={readOnly}
                        placeholder="0"
                        className="w-24 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : item.responseType === "DATE" ? (
                      <input
                        type="date"
                        value={responses[item.id] || ""}
                        onChange={e => onResponse(item.id, e.target.value)}
                        disabled={readOnly}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : isSelectType ? (
                      <select
                        value={responses[item.id] || ""}
                        onChange={e => onResponse(item.id, e.target.value)}
                        disabled={readOnly}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccione...</option>
                        {options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      options.map(opt => (
                        <ResponseButton
                          key={opt}
                          value={opt}
                          selected={responses[item.id] === opt}
                          onClick={() => onResponse(item.id, opt)}
                          disabled={readOnly}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {section.hasObservations && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
              <label className="text-xs font-medium text-slate-500 uppercase">Observaciones de esta sección</label>
              <textarea
                value={observations[section.id] || ""}
                onChange={e => onObservation(section.id, e.target.value)}
                disabled={readOnly}
                placeholder="Describir observaciones encontradas..."
                className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DynamicInspectionForm({ formDef, initialResponses, initialObservations, initialAdditional, onSave, onComplete, readOnly, inspeccionId }: Props) {
  const [responses, setResponses] = useState<Record<string, string>>(() => {
    if (initialResponses && Object.keys(initialResponses).length > 0) return initialResponses;
    if (typeof window !== "undefined") {
      const keys = [inspeccionId, formDef?.code].filter(Boolean) as string[];
      for (const k of keys) {
        const raw = localStorage.getItem(`sgd_inspection_responses_${k}`) || localStorage.getItem(`sgd_draft_resp_${k}`);
        if (raw) {
          try {
            const p = JSON.parse(raw);
            if (p && typeof p === "object" && Object.keys(p).length > 0) return p;
          } catch {}
        }
      }
    }
    return {};
  });
  const [observations, setObservations] = useState<Record<string, string>>(initialObservations || {});
  const [additional, setAdditional] = useState<Record<string, string>>(initialAdditional || {});
  const [signatures, setSignatures] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialResponses && Object.keys(initialResponses).length > 0) {
      setResponses(prev => Object.keys(prev).length === 0 ? initialResponses : { ...initialResponses, ...prev });
    }
  }, [initialResponses]);

  // Persistencia inmediata en tiempo real en localStorage
  useEffect(() => {
    if (Object.keys(responses).length > 0 && typeof window !== "undefined") {
      const keys = [inspeccionId, formDef?.code].filter(Boolean) as string[];
      for (const k of keys) {
        try {
          localStorage.setItem(`sgd_draft_resp_${k}`, JSON.stringify(responses));
          localStorage.setItem(`sgd_inspection_responses_${k}`, JSON.stringify(responses));
        } catch {}
      }
    }
  }, [responses, inspeccionId, formDef?.code]);

  const score = useMemo(() => calculateScore(formDef, responses), [formDef, responses]);

  const totalItems = formDef.sections.reduce((sum, s) => sum + s.items.length, 0);
  const answeredItems = Object.keys(responses).filter(k => 
    formDef.sections.some(s => s.items.some(i => i.id === k))
  ).length;
  const completionPct = totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0;

  const handleResponse = (itemId: string, value: string) => {
    if (readOnly) return;
    setResponses(prev => ({ ...prev, [itemId]: value }));
  };

  const handleObservation = (sectionId: string, value: string) => {
    if (readOnly) return;
    setObservations(prev => ({ ...prev, [sectionId]: value }));
  };

  const handleSave = () => {
    onSave({ responses, observations, additional, signatures, score });
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ responses, observations, additional, signatures, score });
    } else {
      onSave({ responses, observations, additional, signatures, score });
    }
  };

  return (
    <div className="space-y-4">
      {/* Score card - sticky at top */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-16 h-16 rounded-xl text-2xl font-bold ${
              answeredItems === 0 ? "bg-slate-100 text-slate-400" :
              score.resultado === "C" ? "bg-emerald-100 text-emerald-700" :
              score.resultado === "NC" ? "bg-red-100 text-red-700" :
              score.resultado === "OM" ? "bg-amber-100 text-amber-700" :
              "bg-slate-100 text-slate-500"
            }`}>
              {answeredItems > 0 ? `${score.puntuacion}%` : "—"}
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {answeredItems === 0 ? "Sin evaluar" : 
                 score.resultado === "C" ? "Conforme" :
                 score.resultado === "NC" ? "No Conforme" :
                 score.resultado === "OM" ? "Oportunidad de Mejora (OM)" : "No Aplica"}
              </p>
              <p className="text-xs text-slate-500">
                {answeredItems} de {totalItems} ítems evaluados ({completionPct}%)
              </p>
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shadow-xs">
                  ✓ C: {score.conformes} ({score.porcentajeConforme}%)
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 shadow-xs">
                  ▲ OM (+0.5 pts): {score.observaciones} ({score.porcentajeOM}%)
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 shadow-xs">
                  ✗ NC: {score.noConformes} ({score.porcentajeNoConforme}%)
                </span>
                {score.noAplica > 0 && (
                  <span className="inline-flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    ○ NA: {score.noAplica} ({score.porcentajeNoAplica}%)
                  </span>
                )}
                <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Pts: {score.puntosObtenidos}/{score.totalEvaluados}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 sm:w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${completionPct === 100 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${completionPct}%` }} />
            </div>
            {!readOnly && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition-colors shadow-xs"
                  title="Guardar borrador"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Guardar</span> Borrador
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
                  title="Finalizar inspección"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Finalizar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional fields */}
      {formDef.additionalFields && formDef.additionalFields.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Datos Específicos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formDef.additionalFields.map(field => (
              <div key={field.id}>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === "select" ? (
                  <select
                    value={additional[field.id] || ""}
                    onChange={e => setAdditional(prev => ({ ...prev, [field.id]: e.target.value }))}
                    disabled={readOnly}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione...</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : field.type === "date" ? (
                  <input
                    type="date"
                    value={additional[field.id] || ""}
                    onChange={e => setAdditional(prev => ({ ...prev, [field.id]: e.target.value }))}
                    disabled={readOnly}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : field.type === "number" ? (
                  <input
                    type="number"
                    value={additional[field.id] || ""}
                    onChange={e => setAdditional(prev => ({ ...prev, [field.id]: e.target.value }))}
                    disabled={readOnly}
                    placeholder={field.placeholder}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={additional[field.id] || ""}
                    onChange={e => setAdditional(prev => ({ ...prev, [field.id]: e.target.value }))}
                    disabled={readOnly}
                    placeholder={field.placeholder}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form sections */}
      {formDef.sections.map((section, idx) => (
        <SectionCard
          key={section.id}
          section={section}
          responses={responses}
          observations={observations}
          onResponse={handleResponse}
          onObservation={handleObservation}
          readOnly={readOnly}
          sectionIndex={idx}
        />
      ))}

      {/* Signatures */}
      {formDef.signatureFields && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Firmas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formDef.signatureFields.map(field => (
              <div key={field}>
                <label className="text-sm font-medium text-slate-700 mb-1 block">{field}</label>
                <input
                  type="text"
                  value={signatures[field] || ""}
                  onChange={e => setSignatures(prev => ({ ...prev, [field]: e.target.value }))}
                  disabled={readOnly}
                  placeholder={`Nombre de ${field.toLowerCase()}`}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save & Complete buttons at bottom */}
      {!readOnly && (
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors shadow-xs text-sm"
          >
            <Save className="h-4 w-4" />
            Guardar Borrador
          </button>
          <button
            type="button"
            onClick={handleComplete}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
          >
            <CheckCircle2 className="h-4 w-4" />
            Finalizar Inspección
          </button>
        </div>
      )}
    </div>
  );
}
