import { useState, useEffect } from 'react';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';

interface InteractiveMapProps {
  value?: { lat: number; lng: number };
  onChange?: (value: { lat: number; lng: number }) => void;
  readOnly?: boolean;
  label?: string;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
}

export default function InteractiveMap({
  value,
  onChange,
  readOnly = false,
  label = "Ubicación Geográfica GPS",
  defaultCenter = { lat: 10.4806, lng: -66.9036 } // Caracas, Venezuela
}: InteractiveMapProps) {
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | undefined>(value || defaultCenter);
  const [loadingGps, setLoadingGps] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  useEffect(() => {
    if (value) {
      setCurrentPos(value);
    }
  }, [value]);

  const captureGps = () => {
    if (readOnly || !onChange) return;
    if (!navigator.geolocation) {
      alert('La geolocalización no es compatible con este navegador.');
      return;
    }

    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6))
        };
        setAccuracy(Math.round(position.coords.accuracy));
        setCurrentPos(newPos);
        onChange(newPos);
        setLoadingGps(false);
      },
      (error) => {
        console.warn('GPS capture error:', error.message);
        setLoadingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin size={14} className="text-red-500" />
          {label}
        </label>
        {!readOnly && (
          <button
            type="button"
            onClick={captureGps}
            disabled={loadingGps}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg shadow-sm transition-colors"
          >
            <Navigation size={12} className={loadingGps ? "animate-spin" : ""} />
            {loadingGps ? 'Obteniendo GPS...' : 'Capturar Mi Ubicación'}
          </button>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm">
            GPS
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">
              {currentPos ? `Lat: ${currentPos.lat.toFixed(4)}, Lon: ${currentPos.lng.toFixed(4)}` : 'Sin coordenadas asignadas'}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              {accuracy ? `Precisión aproximada: ±${accuracy}m` : 'Referencia sedes Duncan Venezuela'}
            </div>
          </div>
        </div>

        {currentPos && (
          <a
            href={`https://www.google.com/maps?q=${currentPos.lat},${currentPos.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium underline flex items-center gap-1"
          >
            Ver en Google Maps
          </a>
        )}
      </div>
    </div>
  );
}
