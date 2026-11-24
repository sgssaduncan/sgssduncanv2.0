import { useState, useMemo, useEffect } from "react";
import { 
  CheckCircle2, 
  Info, 
  XCircle, 
  AlertTriangle, 
  MinusCircle, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  BarChart3,
  MapPin,
  Camera,
  Trash2,
  ExternalLink,
  RefreshCw,
  X,
  Maximize2,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import type { InspectionFormDef, FormSection, FormItem, ResponseType } from "../lib/formDefinitions";
import { calculateScore } from "../lib/formDefinitions";
import { compressMultipleFiles } from "../lib/imageCompressor";
import toast from "react-hot-toast";

export interface GeoLocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: string;
  mapUrl?: string;
}

interface Props {
  formDef: InspectionFormDef;
  initialResponses?: Record<string, string>;
  initialObservations?: Record<string, string>;
  initialAdditional?: Record<string, string>;
  initialPhotos?: Record<string, string[] | string>;
  initialCoords?: GeoLocationData | null;
  onSave: (data: {
    responses: Record<string, string>;
    observations: Record<string, string>;
    additional: Record<string, string>;
    signatures: Record<string, string>;
    photos: Record<string, string[]>;
    coords: GeoLocationData | null;
    score: ReturnType<typeof calculateScore>;
  }) => void;
  onComplete?: (data: {
    responses: Record<string, string>;
    observations: Record<string, string>;
    additional: Record<string, string>;
    signatures: Record<string, string>;
    photos: Record<string, string[]>;
    coords: GeoLocationData | null;
    score: ReturnType<typeof calculateScore>;
  }) => void;
  readOnly?: boolean;
  inspeccionId?: string;
}

// Response button component (Optimizado para toque táctil en móviles)
function ResponseButton({ value, selected, onClick, disabled }: { value: string; selected: boolean; onClick: () => void; disabled?: boolean }) {
  const styles: Record<string, { bg: string; icon: any; label: string; ring: string }> = {
    "C": { bg: "bg-emerald-600 text-white border-emerald-600 shadow-sm", icon: CheckCircle2, label: "C · Conforme", ring: "ring-emerald-400" },
    "NC": { bg: "bg-red-600 text-white border-red-600 shadow-sm", icon: XCircle, label: "NC · No Conforme", ring: "ring-red-400" },
    "OM": { bg: "bg-amber-500 text-white border-amber-500 shadow-sm", icon: AlertTriangle, label: "OM · Mejora", ring: "ring-amber-400" },
    "NA": { bg: "bg-slate-600 text-white border-slate-600 shadow-sm", icon: MinusCircle, label: "NA · No Aplica", ring: "ring-slate-400" },
    "Bueno": { bg: "bg-emerald-600 text-white border-emerald-600 shadow-sm", icon: CheckCircle2, label: "Bueno", ring: "ring-emerald-400" },
    "Dañado": { bg: "bg-red-600 text-white border-red-600 shadow-sm", icon: XCircle, label: "Dañado", ring: "ring-red-400" },
    "No Aplica": { bg: "bg-slate-600 text-white border-slate-600 shadow-sm", icon: MinusCircle, label: "No Aplica", ring: "ring-slate-400" },
    "Si": { bg: "bg-emerald-600 text-white border-emerald-600 shadow-sm", icon: CheckCircle2, label: "Sí", ring: "ring-emerald-400" },
    "No": { bg: "bg-red-600 text-white border-red-600 shadow-sm", icon: XCircle, label: "No", ring: "ring-red-400" },
    "Operativo": { bg: "bg-emerald-600 text-white border-emerald-600 shadow-sm", icon: CheckCircle2, label: "Operativo", ring: "ring-emerald-400" },
    "No Operativo": { bg: "bg-red-600 text-white border-red-600 shadow-sm", icon: XCircle, label: "No Operativo", ring: "ring-red-400" },
  };

  const style = styles[value] || { bg: "bg-slate-700 text-white border-slate-700", icon: MinusCircle, label: value, ring: "ring-slate-400" };
  const Icon = style.icon;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all touch-active flex-1 sm:flex-initial min-w-[70px] sm:min-w-[90px] ${
        selected ? `${style.bg} ring-2 ring-offset-1 ${style.ring} shadow-md scale-102` : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-2xs"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{style.label}</span>
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
  photos,
  onAddPhotos,
  onRemovePhoto,
  onPreviewPhoto,
}: { 
  section: FormSection; 
  responses: Record<string, string>;
  observations: Record<string, string>;
  onResponse: (itemId: string, value: string) => void;
  onObservation: (sectionId: string, value: string) => void;
  readOnly?: boolean;
  sectionIndex: number;
  photos: Record<string, string[]>;
  onAddPhotos: (itemId: string, files: FileList | null) => void;
  onRemovePhoto: (itemId: string, index: number) => void;
  onPreviewPhoto: (url: string, title: string, index: number, total: number) => void;
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
          <div className="divide-y divide-slate-100">
            {section.items.map((item) => {
              const options = getOptionsForType(item.responseType, item);
              const isSelectType = item.responseType === "SELECT";
              const itemPhotos = photos[item.id] || [];
              const cameraInputId = `camera-input-${item.id}`;
              const galleryInputId = `gallery-input-${item.id}`;
              
              return (
                <div key={item.id} className={`px-4 sm:px-6 py-4 flex flex-col gap-3 transition-colors ${responses[item.id] ? "" : "bg-amber-50/15"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
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
                        {itemPhotos.length > 0 && (
                          <span className="text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-300 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                            <Camera className="h-3 w-3" /> {itemPhotos.length} {itemPhotos.length === 1 ? 'Foto' : 'Fotos'}
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
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1.5 italic">
                          "{item.preguntaOriginal}"
                        </p>
                      )}
                    </div>

                    {/* Controles de respuesta */}
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
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto pt-1 sm:pt-0">
                          {options.map(opt => (
                            <ResponseButton
                              key={opt}
                              value={opt}
                              selected={responses[item.id] === opt}
                              onClick={() => onResponse(item.id, opt)}
                              disabled={readOnly}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECCIÓN DE EVIDENCIA FOTOGRÁFICA Y DETALLES GRÁFICOS */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Camera className="h-3.5 w-3.5 text-slate-400" />
                        <span>Evidencias Gráficas ({itemPhotos.length}):</span>
                      </div>

                      {!readOnly && (
                        <div className="flex items-center gap-2">
                          {/* Input oculto para Cámara Directa */}
                          <input
                            id={cameraInputId}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              onAddPhotos(item.id, e.target.files);
                              e.target.value = '';
                            }}
                          />
                          <label
                            htmlFor={cameraInputId}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer transition-colors shadow-2xs active:scale-95"
                            title="Tomar foto con la cámara"
                          >
                            <Camera className="h-3.5 w-3.5 text-blue-600" />
                            <span>Cámara</span>
                          </label>

                          {/* Input oculto para Galería / Selección múltiple */}
                          <input
                            id={galleryInputId}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              onAddPhotos(item.id, e.target.files);
                              e.target.value = '';
                            }}
                          />
                          <label
                            htmlFor={galleryInputId}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer transition-colors shadow-2xs active:scale-95"
                            title="Seleccionar fotos de la galería o archivos"
                          >
                            <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Galería (+)</span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Galería de miniaturas por ítem */}
                    {itemPhotos.length > 0 ? (
                      <div className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-thin">
                        {itemPhotos.map((photoUrl, photoIdx) => (
                          <div
                            key={photoIdx}
                            className="relative group shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shadow-2xs"
                          >
                            <img
                              src={photoUrl}
                              alt={`Evidencia ${item.id}-${photoIdx + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => onPreviewPhoto(photoUrl, item.label, photoIdx, itemPhotos.length)}
                            />
                            
                            <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 text-white text-[9px] font-bold text-center py-0.5">
                              {photoIdx + 1}/{itemPhotos.length}
                            </div>

                            {/* Botón ampliar */}
                            <button
                              type="button"
                              onClick={() => onPreviewPhoto(photoUrl, item.label, photoIdx, itemPhotos.length)}
                              className="absolute top-1 left-1 p-1 bg-slate-900/70 hover:bg-slate-900 text-white rounded-md opacity-80 group-hover:opacity-100 transition-opacity"
                              title="Ampliar foto"
                            >
                              <Maximize2 className="h-3 w-3" />
                            </button>

                            {/* Botón eliminar */}
                            {!readOnly && (
                              <button
                                type="button"
                                onClick={() => onRemovePhoto(item.id, photoIdx)}
                                className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-xs opacity-80 group-hover:opacity-100 transition-opacity"
                                title="Eliminar esta foto"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        Sin fotografías adjuntas. Puede tomar fotos ilimitadas según su criterio.
                      </div>
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

export function DynamicInspectionForm({ 
  formDef, 
  initialResponses, 
  initialObservations, 
  initialAdditional, 
  initialPhotos,
  initialCoords,
  onSave, 
  onComplete, 
  readOnly, 
  inspeccionId 
}: Props) {
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

  // Manejo de fotos múltiples por ítem
  const [photos, setPhotos] = useState<Record<string, string[]>>(() => {
    const normalized: Record<string, string[]> = {};
    if (initialPhotos) {
      Object.entries(initialPhotos).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          normalized[key] = val;
        } else if (typeof val === 'string' && val.trim().length > 0) {
          // Podría ser un JSON stringificado
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) normalized[key] = parsed;
            else normalized[key] = [val];
          } catch {
            normalized[key] = [val];
          }
        }
      });
      return normalized;
    }
    if (typeof window !== "undefined" && inspeccionId) {
      try {
        const raw = localStorage.getItem(`sgd_inspection_photos_${inspeccionId}`);
        if (raw) {
          const p = JSON.parse(raw);
          if (p && typeof p === "object") return p;
        }
      } catch {}
    }
    return {};
  });

  // Manejo de geolocalización GPS
  const [coords, setCoords] = useState<GeoLocationData | null>(() => {
    if (initialCoords && initialCoords.lat && initialCoords.lng) return initialCoords;
    if (typeof window !== "undefined" && inspeccionId) {
      try {
        const raw = localStorage.getItem(`sgd_inspection_coords_${inspeccionId}`);
        if (raw) {
          const p = JSON.parse(raw);
          if (p && p.lat && p.lng) return p;
        }
      } catch {}
    }
    return null;
  });
  const [locating, setLocating] = useState(false);

  // Visor Lightbox a pantalla completa
  const [previewPhoto, setPreviewPhoto] = useState<{
    url: string;
    title: string;
    index: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (initialResponses && Object.keys(initialResponses).length > 0) {
      setResponses(prev => Object.keys(prev).length === 0 ? initialResponses : { ...initialResponses, ...prev });
    }
  }, [initialResponses]);

  useEffect(() => {
    if (initialPhotos && Object.keys(initialPhotos).length > 0) {
      const normalized: Record<string, string[]> = {};
      Object.entries(initialPhotos).forEach(([key, val]) => {
        if (Array.isArray(val)) normalized[key] = val;
        else if (typeof val === 'string' && val.trim().length > 0) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) normalized[key] = parsed;
            else normalized[key] = [val];
          } catch {
            normalized[key] = [val];
          }
        }
      });
      setPhotos(prev => ({ ...normalized, ...prev }));
    }
  }, [initialPhotos]);

  useEffect(() => {
    if (initialCoords && initialCoords.lat && initialCoords.lng) {
      setCoords(initialCoords);
    }
  }, [initialCoords]);

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

  useEffect(() => {
    if (inspeccionId && typeof window !== "undefined") {
      try {
        localStorage.setItem(`sgd_inspection_photos_${inspeccionId}`, JSON.stringify(photos));
      } catch {}
    }
  }, [photos, inspeccionId]);

  useEffect(() => {
    if (inspeccionId && coords && typeof window !== "undefined") {
      try {
        localStorage.setItem(`sgd_inspection_coords_${inspeccionId}`, JSON.stringify(coords));
      } catch {}
    }
  }, [coords, inspeccionId]);

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

  // Función de captura GPS
  const handleGetLocation = () => {
    if (readOnly) return;
    if (!navigator.geolocation) {
      toast.error("Su navegador no soporta geolocalización GPS");
      return;
    }

    setLocating(true);
    const toastId = toast.loading("Obteniendo coordenadas satelitales GPS...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords: GeoLocationData = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: new Date().toISOString(),
          mapUrl: `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`
        };
        setCoords(newCoords);
        setLocating(false);
        toast.success(`📍 GPS registrado (Precisión: ±${newCoords.accuracy}m)`, { id: toastId });
      },
      (err) => {
        setLocating(false);
        console.warn("Error GPS:", err);
        let msg = "No se pudo obtener la ubicación GPS.";
        if (err.code === 1) msg = "Permiso de ubicación denegado. Habilite el GPS en el navegador.";
        else if (err.code === 2) msg = "Señal GPS no disponible temporalmente.";
        else if (err.code === 3) msg = "Tiempo de espera agotado al conectar con el satélite.";
        toast.error(msg, { id: toastId });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Agregar fotos comprimidas client-side
  const handleAddPhotos = async (itemId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const toastId = toast.loading(`Comprimiendo ${files.length} ${files.length === 1 ? 'imagen' : 'imágenes'}...`);
    try {
      const compressedList = await compressMultipleFiles(files, { maxWidth: 1200, maxHeight: 1200, quality: 0.75 });
      setPhotos(prev => {
        const existing = prev[itemId] || [];
        return {
          ...prev,
          [itemId]: [...existing, ...compressedList]
        };
      });
      toast.success(`${compressedList.length} ${compressedList.length === 1 ? 'foto agregada' : 'fotos agregadas'}`, { id: toastId });
    } catch (err) {
      console.error("Error al procesar imágenes:", err);
      toast.error("Error al procesar las fotos", { id: toastId });
    }
  };

  // Eliminar foto de un ítem
  const handleRemovePhoto = (itemId: string, index: number) => {
    if (readOnly) return;
    setPhotos(prev => {
      const existing = prev[itemId] || [];
      const updated = existing.filter((_, i) => i !== index);
      const next = { ...prev };
      if (updated.length > 0) {
        next[itemId] = updated;
      } else {
        delete next[itemId];
      }
      return next;
    });
    toast.success("Foto eliminada");
  };

  const handleSave = () => {
    onSave({ responses, observations, additional, signatures, photos, coords, score });
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ responses, observations, additional, signatures, photos, coords, score });
    } else {
      onSave({ responses, observations, additional, signatures, photos, coords, score });
    }
  };

  return (
    <div className="space-y-4">
      {/* Score card - sticky at top */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 sticky top-0 z-10">
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

      {/* BLOQUE DE GEOLOCALIZACIÓN GPS (REQUERIMIENTO OBLIGATORIO) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${coords ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Geolocalización de la Inspección</h3>
                {coords ? (
                  <span className="badge badge-green text-[10px] font-bold">📍 GPS REGISTRADO</span>
                ) : (
                  <span className="badge badge-amber text-[10px] font-bold">PENDIENTE REGISTRAR</span>
                )}
              </div>
              {coords ? (
                <div className="mt-1 text-xs text-slate-600 space-y-0.5">
                  <p className="font-mono font-bold text-slate-800">
                    Lat: {coords.lat.toFixed(6)} · Lng: {coords.lng.toFixed(6)}
                    {coords.accuracy && <span className="text-slate-500 font-sans font-normal ml-1.5">(±{coords.accuracy}m precisión)</span>}
                  </p>
                  {coords.timestamp && (
                    <p className="text-[11px] text-slate-500">
                      Capturado: {new Date(coords.timestamp).toLocaleString('es-VE')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5">
                  Capture la ubicación GPS para certificar la presencia física en el establecimiento.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {coords && (
              <a
                href={coords.mapUrl || `https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-2xs"
                title="Abrir ubicación en Google Maps"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Ver en Mapa</span>
              </a>
            )}

            {!readOnly && (
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs touch-active ${
                  coords 
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                } ${locating ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {locating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-current" />
                    <span>Conectando con GPS...</span>
                  </>
                ) : coords ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Actualizar GPS</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    <span>Registrar GPS Actual</span>
                  </>
                )}
              </button>
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
          photos={photos}
          onAddPhotos={handleAddPhotos}
          onRemovePhoto={handleRemovePhoto}
          onPreviewPhoto={(url, title, index, total) => setPreviewPhoto({ url, title, index, total })}
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

      {/* Save & Complete buttons at bottom (Grandes y táctiles) */}
      {!readOnly && (
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-5 border-t border-slate-200 pb-16 lg:pb-0">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl transition-all shadow-xs text-sm touch-active"
          >
            <Save className="h-5 w-5" />
            <span>Guardar Borrador</span>
          </button>
          <button
            type="button"
            onClick={handleComplete}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3.5 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-md shadow-emerald-600/20 text-sm touch-active"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>Finalizar Inspección</span>
          </button>
        </div>
      )}

      {/* VISOR MODAL LIGHTBOX A PANTALLA COMPLETA */}
      {previewPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex flex-col justify-between p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="flex items-center justify-between text-white pb-2 max-w-4xl mx-auto w-full" onClick={e => e.stopPropagation()}>
            <div className="min-w-0 pr-4">
              <h4 className="font-bold text-sm truncate">{previewPhoto.title}</h4>
              <p className="text-xs text-slate-400">Evidencia gráfica {previewPhoto.index + 1} de {previewPhoto.total}</p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              className="p-2 text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 max-w-4xl mx-auto w-full" onClick={e => e.stopPropagation()}>
            <img
              src={previewPhoto.url}
              alt={previewPhoto.title}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl border border-slate-700"
            />
          </div>

          <div className="text-center text-xs text-slate-400 pt-2" onClick={e => e.stopPropagation()}>
            Toque fuera de la imagen o presione Cerrar para volver al formulario
          </div>
        </div>
      )}
    </div>
  );
}
