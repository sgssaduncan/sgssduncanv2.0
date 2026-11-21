import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart2,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Maximize2,
  ExternalLink,
  ShieldCheck,
  Layers,
  Calendar,
  Sparkles,
  Wifi,
  FileText,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { useSGD } from '../contexts/SGDContext';
import toast from 'react-hot-toast';

export default function ConsolidadorPage() {
  const { inspecciones, establecimientos, localidades, isOnline, refreshData } = useSGD();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'2026-2027' | '2025-2026' | '2024-2025' | 'ALL'>('2026-2027');
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Cantidad de inspecciones registradas en la aplicación
  const completedInspections = inspecciones.filter(i => i.estado === 'Completada');

  // Enviar datos en vivo al consolidador embebido
  const syncLiveToIframe = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;

    try {
      // 1. Guardar en localStorage para persistencia unificada
      localStorage.setItem('sgd_inspecciones', JSON.stringify(inspecciones));
      localStorage.setItem('sgd_establecimientos', JSON.stringify(establecimientos));
      localStorage.setItem('sgd_localidades', JSON.stringify(localidades));

      // 2. Transmitir via postMessage al iframe
      iframeRef.current.contentWindow.postMessage({
        type: 'SYNC_SGD_DATA',
        period: selectedPeriod,
        payload: {
          totalInspecciones: inspecciones.length,
          completadas: completedInspections.length,
          inspecciones,
          establecimientos,
          localidades
        }
      }, '*');

      toast.success(`¡Sincronizadas ${completedInspections.length} inspecciones en vivo con Reportes Consolidados!`);
    } catch (err) {
      console.error('Error sincronizando con iframe:', err);
    }
  };

  const handlePeriodChange = (period: '2026-2027' | '2025-2026' | '2024-2025' | 'ALL') => {
    setSelectedPeriod(period);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SET_PERIOD',
        period
      }, '*');
      toast.success(`Cambiando a Período ${period === 'ALL' ? 'Comparativo (2024-2027)' : period}...`);
    }
  };

  const handleManualRefresh = async () => {
    setIsSyncingLive(true);
    const toastId = toast.loading('Sincronizando con base de datos de SGD 2.0...');
    try {
      await refreshData();
      syncLiveToIframe();
      toast.dismiss(toastId);
    } catch (e: any) {
      toast.dismiss(toastId);
      toast.error('Error al sincronizar datos.');
    } finally {
      setIsSyncingLive(false);
    }
  };

  const openFullscreen = () => {
    window.open('/consolidador_ssa_duncan.html', '_blank');
  };

  // Sincronizar automáticamente cuando el iframe termina de cargar
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setTimeout(() => {
      syncLiveToIframe();
    }, 600);
  };

  useEffect(() => {
    if (iframeLoaded) {
      syncLiveToIframe();
    }
  }, [inspecciones.length]);

  return (
    <div className="space-y-4">
      {/* Encabezado Corporativo del Módulo Reportes Consolidados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="p-2 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400">
                <BarChart2 size={24} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                  Reportes Consolidados
                  <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-md">
                    SSA Duncan
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Matriz Integral 70 Sedes, Distribuidoras (4P), Servicentros (3P), Flota, Montacargas, Hallazgos y Comparativo Anual
                </p>
              </div>
            </div>

            {/* Badges de Cobertura y Normativa */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-bold">
              <span className="bg-slate-950 px-2.5 py-0.5 rounded border border-amber-400/30 text-amber-300">
                Períodos: 2024-2025 • 2025-2026 • 2026-2027
              </span>
              <span className="bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800 text-slate-300">
                LOPCYMAT Art. 62
              </span>
              <span className="bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800 text-slate-300">
                INPSASEL NT-03-2016
              </span>
              <span className="bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800 text-slate-300">
                COVENIN
              </span>
              <span className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                <CheckCircle2 size={12} className="text-emerald-400" />
                {completedInspections.length} Inspecciones Registradas en Vivo
              </span>
            </div>
          </div>

          {/* Barra de Controles y Acciones Rápidas */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Selector de Período Rápido */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
              <Calendar size={14} className="text-amber-400 ml-1.5" />
              <select
                value={selectedPeriod}
                onChange={e => handlePeriodChange(e.target.value as any)}
                className="bg-transparent text-xs text-white font-bold px-2 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="2026-2027" className="bg-slate-900 text-white font-bold">
                  Período 2026-2027 (En vivo SGD)
                </option>
                <option value="2025-2026" className="bg-slate-900 text-white">
                  Período 2025-2026
                </option>
                <option value="2024-2025" className="bg-slate-900 text-white">
                  Período 2024-2025 (Histórico)
                </option>
                <option value="ALL" className="bg-slate-900 text-amber-300 font-bold">
                  Comparativo (3 Períodos)
                </option>
              </select>
            </div>

            {/* Botón de Sincronización en Vivo */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isSyncingLive}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-400/30 text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title="Sincronizar inspecciones de la aplicación"
            >
              <RefreshCw size={14} className={isSyncingLive ? 'animate-spin' : ''} />
              <span>Sincronizar en Vivo</span>
            </button>

            {/* Abrir en Pantalla Completa / Pestaña Independiente */}
            <button
              type="button"
              onClick={openFullscreen}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              title="Abrir consolidador en pestaña dedicada"
            >
              <ExternalLink size={14} />
              <span>Abrir en Pantalla Completa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor Completo e Interactivo del Consolidador SSA 70 Sedes */}
      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-800 bg-[#020617] shadow-2xl">
        <iframe
          ref={iframeRef}
          id="consolidador-frame"
          src="/consolidador_ssa_duncan.html"
          onLoad={handleIframeLoad}
          title="Consolidador SSA Matriz Integral Duncan"
          className="w-full h-[calc(100vh-170px)] min-h-[920px] border-0"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}
