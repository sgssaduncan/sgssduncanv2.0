import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Building2,
  Store,
  Calendar,
  Truck,
  BatteryCharging,
  Download,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  ChevronRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import {
  CRITERIOS_DISTRIBUIDORAS_OFICIALES,
  CRITERIOS_SERVICENTROS_OFICIALES,
  FRECUENCIAS_INSPECCIONES_OFICIALES,
  FLOTA_NACIONAL_DUNCAN,
  PESO_ACUMULADORES_DUNCAN,
  CriterioEvaluacion
} from '../data/criteriosOficialesData';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'distribuidoras' | 'servicentros' | 'frecuencias' | 'flota' | 'baterias';
}

export default function CatalogoCriteriosModal({ isOpen, onClose, defaultTab = 'distribuidoras' }: Props) {
  const [activeTab, setActiveTab] = useState<'distribuidoras' | 'servicentros' | 'frecuencias' | 'flota' | 'baterias'>(defaultTab);
  const [search, setSearch] = useState('');
  const [pilarFilter, setPilarFilter] = useState<string>('TODOS');
  const [areaFilter, setAreaFilter] = useState<string>('TODAS');

  if (!isOpen) return null;

  // Filtrado de Criterios Distribuidoras
  const filteredDist = useMemo(() => {
    return CRITERIOS_DISTRIBUIDORAS_OFICIALES.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        c.num.toLowerCase().includes(q) ||
        c.pregunta.toLowerCase().includes(q) ||
        c.preguntaResumida.toLowerCase().includes(q) ||
        c.aspectoLegal.toLowerCase().includes(q) ||
        c.aspecto.toLowerCase().includes(q);
      const matchPilar = pilarFilter === 'TODOS' || c.grupoPilar === pilarFilter;
      const matchArea = areaFilter === 'TODAS' || c.areaResponsable.includes(areaFilter);
      return matchSearch && matchPilar && matchArea;
    });
  }, [search, pilarFilter, areaFilter]);

  // Filtrado de Criterios Servicentros
  const filteredServ = useMemo(() => {
    return CRITERIOS_SERVICENTROS_OFICIALES.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        c.num.toLowerCase().includes(q) ||
        c.pregunta.toLowerCase().includes(q) ||
        c.preguntaResumida.toLowerCase().includes(q) ||
        c.aspectoLegal.toLowerCase().includes(q) ||
        c.aspecto.toLowerCase().includes(q);
      const matchPilar = pilarFilter === 'TODOS' || c.grupoPilar === pilarFilter;
      const matchArea = areaFilter === 'TODAS' || c.areaResponsable.includes(areaFilter);
      return matchSearch && matchPilar && matchArea;
    });
  }, [search, pilarFilter, areaFilter]);

  // Filtrado de Frecuencias
  const filteredFrec = useMemo(() => {
    return FRECUENCIAS_INSPECCIONES_OFICIALES.filter(f => {
      const q = search.toLowerCase();
      return !q ||
        f.inspeccion.toLowerCase().includes(q) ||
        f.ubicacion.toLowerCase().includes(q) ||
        f.area.toLowerCase().includes(q) ||
        f.frecuencia.toLowerCase().includes(q) ||
        f.responsables.toLowerCase().includes(q);
    });
  }, [search]);

  // Filtrado de Flota
  const filteredFlota = useMemo(() => {
    return FLOTA_NACIONAL_DUNCAN.filter(v => {
      const q = search.toLowerCase();
      return !q ||
        v.placas.toLowerCase().includes(q) ||
        v.marca.toLowerCase().includes(q) ||
        v.modelo.toLowerCase().includes(q) ||
        v.distribuidora.toLowerCase().includes(q) ||
        v.observaciones.toLowerCase().includes(q);
    });
  }, [search]);

  // Filtrado de Baterías
  const filteredBaterias = useMemo(() => {
    return PESO_ACUMULADORES_DUNCAN.filter(b => {
      const q = search.toLowerCase();
      return !q ||
        b.denominacion.toLowerCase().includes(q) ||
        b.familia.toLowerCase().includes(q) ||
        b.mercado.toLowerCase().includes(q);
    });
  }, [search]);

  // Exportar vista activa a Excel
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      if (activeTab === 'distribuidoras') {
        const ws = XLSX.utils.json_to_sheet(filteredDist);
        XLSX.utils.book_append_sheet(wb, ws, 'Criterios Distribuidoras');
      } else if (activeTab === 'servicentros') {
        const ws = XLSX.utils.json_to_sheet(filteredServ);
        XLSX.utils.book_append_sheet(wb, ws, 'Criterios Servicentros');
      } else if (activeTab === 'frecuencias') {
        const ws = XLSX.utils.json_to_sheet(filteredFrec);
        XLSX.utils.book_append_sheet(wb, ws, 'Frecuencias Inspecciones');
      } else if (activeTab === 'flota') {
        const ws = XLSX.utils.json_to_sheet(filteredFlota);
        XLSX.utils.book_append_sheet(wb, ws, 'Flota Nacional Duncan');
      } else {
        const ws = XLSX.utils.json_to_sheet(filteredBaterias);
        XLSX.utils.book_append_sheet(wb, ws, 'Catálogo Baterías Duncan');
      }

      XLSX.writeFile(wb, `SGD_Duncan_Catalogo_${activeTab.toUpperCase()}.xlsx`);
      toast.success('Archivo Excel descargado exitosamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al exportar a Excel.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>Catálogo Maestro de Criterios SSA Duncan</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">
                  SGD 2.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                173 Criterios Distribuidoras • 117 Servicentros • 24 Frecuencias • 65 Flota • 70 Baterías
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title="Descargar datos en Excel"
            >
              <FileSpreadsheet size={14} />
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Barra de Pestañas */}
        <div className="flex items-center gap-1 p-2 sm:p-2.5 bg-slate-950/80 border-b border-slate-800 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'distribuidoras', label: 'Distribuidoras (173)', icon: Building2 },
            { id: 'servicentros', label: 'Servicentros (117)', icon: Store },
            { id: 'frecuencias', label: 'Frecuencias (24)', icon: Calendar },
            { id: 'flota', label: 'Flota Nacional (65)', icon: Truck },
            { id: 'baterias', label: 'Pesos Baterías (70)', icon: BatteryCharging }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setPilarFilter('TODOS');
                  setAreaFilter('TODAS');
                }}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-black transition-all shrink-0 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por texto, norma COVENIN, código..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Filtros de Pilar y Área (para Distribuidoras y Servicentros) */}
          {(activeTab === 'distribuidoras' || activeTab === 'servicentros') && (
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-none">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">Pilar:</span>
              {['TODOS', 'INFRA', 'LEGAL', 'SSA', ...(activeTab === 'distribuidoras' ? ['VEHCP'] : [])].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPilarFilter(p)}
                  className={`text-[10px] font-black px-2 py-1 rounded-lg border transition-all ${
                    pilarFilter === p
                      ? 'bg-amber-400 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Contenido Scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          
          {/* TAB 1: DISTRIBUIDORAS */}
          {activeTab === 'distribuidoras' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>Mostrando {filteredDist.length} de {CRITERIOS_DISTRIBUIDORAS_OFICIALES.length} criterios</span>
                <span>Normativa: LOPCYMAT • INPSASEL • COVENIN • RCHST</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {filteredDist.map((c, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-slate-900 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded font-mono font-black text-xs">
                          {c.num}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                          c.grupoPilar === 'INFRA' ? 'bg-amber-950 text-amber-300 border-amber-500/40' :
                          c.grupoPilar === 'LEGAL' ? 'bg-blue-950 text-blue-300 border-blue-500/40' :
                          c.grupoPilar === 'SSA' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' :
                          'bg-purple-950 text-purple-300 border-purple-500/40'
                        }`}>
                          Pilar: {c.grupoPilar}
                        </span>
                        <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-bold">
                          Área: {c.areaResponsable}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {c.aspecto}
                        </span>
                      </div>
                      <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 shrink-0 font-mono">
                        Ítem #{c.item}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {c.preguntaResumida}
                    </h4>

                    <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 italic">
                      "{c.pregunta}"
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      <Scale size={13} className="text-amber-400 shrink-0" />
                      <span className="font-medium">Base Legal / Técnica: <strong className="text-slate-200">{c.aspectoLegal}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SERVICENTROS */}
          {activeTab === 'servicentros' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>Mostrando {filteredServ.length} de {CRITERIOS_SERVICENTROS_OFICIALES.length} criterios</span>
                <span>Normativa: LOPCYMAT • INPSASEL • COVENIN • RCHST</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {filteredServ.map((c, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-slate-900 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded font-mono font-black text-xs">
                          {c.num}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                          c.grupoPilar === 'INFRA' ? 'bg-amber-950 text-amber-300 border-amber-500/40' :
                          c.grupoPilar === 'LEGAL' ? 'bg-blue-950 text-blue-300 border-blue-500/40' :
                          'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        }`}>
                          Pilar: {c.grupoPilar}
                        </span>
                        <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-bold">
                          Área: {c.areaResponsable}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {c.aspecto}
                        </span>
                      </div>
                      <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 shrink-0 font-mono">
                        Ítem #{c.item}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {c.preguntaResumida}
                    </h4>

                    <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 italic">
                      "{c.pregunta}"
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      <Scale size={13} className="text-amber-400 shrink-0" />
                      <span className="font-medium">Base Legal / Técnica: <strong className="text-slate-200">{c.aspectoLegal}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FRECUENCIAS */}
          {activeTab === 'frecuencias' && (
            <div className="space-y-3">
              <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">Ítem</th>
                      <th className="py-3 px-3">Ubicación</th>
                      <th className="py-3 px-3">Inspección</th>
                      <th className="py-3 px-3">Área Evaluada</th>
                      <th className="py-3 px-3 text-center">Frecuencia</th>
                      <th className="py-3 px-3">Responsables</th>
                      <th className="py-3 px-3 text-right">Formulario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium bg-slate-900/60">
                    {filteredFrec.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400">#{f.item}</td>
                        <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                          {f.ubicacion === 'Distribuidora' ? <Building2 size={13} className="text-amber-400" /> : <Store size={13} className="text-blue-400" />}
                          <span>{f.ubicacion}</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-200">{f.inspeccion}</td>
                        <td className="py-2.5 px-3 text-slate-300">{f.area}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                            f.frecuencia === 'Diaria' ? 'bg-amber-950 text-amber-300 border-amber-500/40' :
                            f.frecuencia === 'Quincenal' ? 'bg-purple-950 text-purple-300 border-purple-500/40' :
                            f.frecuencia === 'Mensual' ? 'bg-blue-950 text-blue-300 border-blue-500/40' :
                            'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          }`}>
                            {f.frecuencia}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{f.responsables}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-[10px] text-amber-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            Nativo SGD 2.0
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FLOTA */}
          {activeTab === 'flota' && (
            <div className="space-y-3">
              <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">N°</th>
                      <th className="py-3 px-3">Placas</th>
                      <th className="py-3 px-3">Marca y Modelo</th>
                      <th className="py-3 px-3 text-center">Año</th>
                      <th className="py-3 px-3 text-center">Capacidad de Carga</th>
                      <th className="py-3 px-3">Distribuidora Asignada</th>
                      <th className="py-3 px-3">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium bg-slate-900/60">
                    {filteredFlota.map((v, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400">#{v.item}</td>
                        <td className="py-2.5 px-3 font-mono font-black text-amber-400">{v.placas}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{v.marca} {v.modelo}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-300">{v.ano}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-400">
                          {v.capacidadCargaKg.toLocaleString('es-VE')} Kg
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{v.distribuidora}</td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">{v.observaciones || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: BATERÍAS */}
          {activeTab === 'baterias' && (
            <div className="space-y-3">
              <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">N°</th>
                      <th className="py-3 px-3">Denominación</th>
                      <th className="py-3 px-3">Familia</th>
                      <th className="py-3 px-3">Mercado</th>
                      <th className="py-3 px-3 text-center">Voltaje</th>
                      <th className="py-3 px-3 text-center">Peso Nominal (Kg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium bg-slate-900/60">
                    {filteredBaterias.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400">#{b.num}</td>
                        <td className="py-2.5 px-3 font-black text-amber-400">{b.denominacion}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{b.familia}</td>
                        <td className="py-2.5 px-3 text-slate-300">{b.mercado}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">{b.voltaje} V</td>
                        <td className="py-2.5 px-3 text-center font-mono font-black text-emerald-400">
                          {b.pesoKg} Kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 font-bold">
            <ShieldCheck size={14} className="text-emerald-400" />
            Base Normativa Oficial Duncan SSA • LOPCYMAT • INPSASEL • COVENIN
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
