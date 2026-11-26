import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Download,
  Building2,
  Store,
  Clock,
  Scale,
  Truck,
  ListFilter,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Save,
  Shield,
  Layers,
  Sparkles,
  Info,
  MapPin
} from 'lucide-react';
import { criteriosService } from '../services/criteriosService';
import type {
  CriterioEvaluacion,
  FrecuenciaInspeccion,
  VehiculoFlotaOficial,
  ListasMaestras
} from '../data/criteriosOficialesData';
import type { PonderacionRegion, PonderacionItem } from '../data/ponderacionesData';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function CriteriosPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'Super Admin' || profile?.role === 'Propietario / Super Admin' || profile?.role === 'Admin';

  const [activeTab, setActiveTab] = useState<'distribuidoras' | 'servicentros' | 'frecuencias' | 'ponderaciones' | 'flota' | 'listas'>('distribuidoras');
  
  // Datasets en memoria reactiva
  const [criteriosDist, setCriteriosDist] = useState<CriterioEvaluacion[]>([]);
  const [criteriosServ, setCriteriosServ] = useState<CriterioEvaluacion[]>([]);
  const [frecuencias, setFrecuencias] = useState<FrecuenciaInspeccion[]>([]);
  const [ponderaciones, setPonderaciones] = useState<PonderacionRegion[]>([]);
  const [flota, setFlota] = useState<VehiculoFlotaOficial[]>([]);
  const [listas, setListas] = useState<ListasMaestras | null>(null);

  // Filtros y búsquedas
  const [search, setSearch] = useState('');
  const [pilarFilter, setPilarFilter] = useState('TODOS');
  const [areaFilter, setAreaFilter] = useState('TODAS');
  const [frecuenciaFilter, setFrecuenciaFilter] = useState('TODAS');
  const [ubicacionFilter, setUbicacionFilter] = useState('TODAS');
  const [scSubTab, setScSubTab] = useState<'criterios' | 'sedes'>('criterios');
  const [scLocalidadFilter, setScLocalidadFilter] = useState('TODAS');

  // Modales de Edición / Creación
  const [editingCriterio, setEditingCriterio] = useState<{ tipo: 'distribuidoras' | 'servicentros'; item: CriterioEvaluacion } | null>(null);
  const [isNewCriterio, setIsNewCriterio] = useState(false);

  const [editingFrecuencia, setEditingFrecuencia] = useState<FrecuenciaInspeccion | null>(null);
  const [isNewFrecuencia, setIsNewFrecuencia] = useState(false);

  const [editingPonderacion, setEditingPonderacion] = useState<{ region: string; itemIdx: number; item: PonderacionItem } | null>(null);

  const loadAll = () => {
    setCriteriosDist(criteriosService.getCriteriosDistribuidoras());
    setCriteriosServ(criteriosService.getCriteriosServicentros());
    setFrecuencias(criteriosService.getFrecuencias());
    setPonderaciones(criteriosService.getPonderaciones());
    setFlota(criteriosService.getFlota());
    setListas(criteriosService.getListas());
  };

  useEffect(() => {
    loadAll();

    const handleUpdate = () => loadAll();
    window.addEventListener('sgd_criterios_updated', handleUpdate);
    return () => window.removeEventListener('sgd_criterios_updated', handleUpdate);
  }, []);

  // -------------------------------------------------------------------------
  // FILTRADO DINÁMICO
  // -------------------------------------------------------------------------
  const filteredDist = useMemo(() => {
    return criteriosDist.filter(c => {
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
  }, [criteriosDist, search, pilarFilter, areaFilter]);

  const filteredServ = useMemo(() => {
    return criteriosServ.filter(c => {
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
  }, [criteriosServ, search, pilarFilter, areaFilter]);

  const filteredFrec = useMemo(() => {
    return frecuencias.filter(f => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        f.inspeccion.toLowerCase().includes(q) ||
        f.ubicacion.toLowerCase().includes(q) ||
        f.area.toLowerCase().includes(q) ||
        f.frecuencia.toLowerCase().includes(q) ||
        f.responsables.toLowerCase().includes(q);
      const matchFrec = frecuenciaFilter === 'TODAS' || f.frecuencia === frecuenciaFilter;
      const matchUbi = ubicacionFilter === 'TODAS' || f.ubicacion === ubicacionFilter;
      return matchSearch && matchFrec && matchUbi;
    });
  }, [frecuencias, search, frecuenciaFilter, ubicacionFilter]);

  const filteredFlota = useMemo(() => {
    return flota.filter(v => {
      const q = search.toLowerCase();
      return !q ||
        v.placas.toLowerCase().includes(q) ||
        v.marca.toLowerCase().includes(q) ||
        v.modelo.toLowerCase().includes(q) ||
        v.distribuidora.toLowerCase().includes(q) ||
        v.observaciones.toLowerCase().includes(q);
    });
  }, [flota, search]);

  const scLocalidades = useMemo(() => {
    if (!listas?.servicentros) return [];
    const setLoc = new Set<string>();
    listas.servicentros.forEach(s => {
      if (s.nombre !== 'Consolidado' && s.localidad) {
        setLoc.add(s.localidad.toUpperCase());
      }
    });
    return Array.from(setLoc).sort();
  }, [listas?.servicentros]);

  const filteredServicentrosSedes = useMemo(() => {
    if (!listas?.servicentros) return [];
    return listas.servicentros
      .filter(s => s.nombre !== 'Consolidado')
      .filter(s => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
          s.nombre.toLowerCase().includes(q) ||
          s.localidad.toLowerCase().includes(q) ||
          s.abrev.toLowerCase().includes(q);
        const matchLoc = scLocalidadFilter === 'TODAS' || s.localidad.toUpperCase() === scLocalidadFilter.toUpperCase();
        return matchSearch && matchLoc;
      });
  }, [listas?.servicentros, search, scLocalidadFilter]);

  // -------------------------------------------------------------------------
  // HANDLERS CRITERIOS
  // -------------------------------------------------------------------------
  const handleSaveCriterio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCriterio) return;

    const { tipo, item } = editingCriterio;
    const userEmail = profile?.email || 'admin@duncan.com.ve';

    if (isNewCriterio) {
      if (tipo === 'distribuidoras') {
        criteriosService.addCriterioDistribuidora(item, userEmail);
      } else {
        criteriosService.addCriterioServicentro(item, userEmail);
      }
      toast.success('Criterio agregado con éxito');
    } else {
      if (tipo === 'distribuidoras') {
        criteriosService.updateCriterioDistribuidora(item.item, item, userEmail);
      } else {
        criteriosService.updateCriterioServicentro(item.item, item, userEmail);
      }
      toast.success('Criterio actualizado correctamente');
    }

    setEditingCriterio(null);
    setIsNewCriterio(false);
    loadAll();
  };

  const handleDeleteCriterio = (tipo: 'distribuidoras' | 'servicentros', itemIndex: number, pregunta: string) => {
    if (!confirm(`¿Está seguro de eliminar el criterio #${itemIndex}?\n"${pregunta.substring(0, 60)}..."`)) return;
    const userEmail = profile?.email || 'admin@duncan.com.ve';
    if (tipo === 'distribuidoras') {
      criteriosService.deleteCriterioDistribuidora(itemIndex, userEmail);
    } else {
      criteriosService.deleteCriterioServicentro(itemIndex, userEmail);
    }
    toast.success('Criterio eliminado');
    loadAll();
  };

  // -------------------------------------------------------------------------
  // HANDLERS FRECUENCIAS
  // -------------------------------------------------------------------------
  const handleSaveFrecuencia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFrecuencia) return;

    const userEmail = profile?.email || 'admin@duncan.com.ve';

    if (isNewFrecuencia) {
      criteriosService.addFrecuencia(editingFrecuencia, userEmail);
      toast.success('Frecuencia de inspección agregada');
    } else {
      criteriosService.updateFrecuencia(editingFrecuencia.item, editingFrecuencia, userEmail);
      toast.success('Frecuencia de inspección actualizada');
    }

    setEditingFrecuencia(null);
    setIsNewFrecuencia(false);
    loadAll();
  };

  const handleDeleteFrecuencia = (itemIndex: number, inspNombre: string) => {
    if (!confirm(`¿Está seguro de eliminar la frecuencia para "${inspNombre}"?`)) return;
    const userEmail = profile?.email || 'admin@duncan.com.ve';
    criteriosService.deleteFrecuencia(itemIndex, userEmail);
    toast.success('Frecuencia eliminada');
    loadAll();
  };

  // -------------------------------------------------------------------------
  // HANDLERS PONDERACIONES
  // -------------------------------------------------------------------------
  const handleSavePonderacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPonderacion) return;

    const userEmail = profile?.email || 'admin@duncan.com.ve';
    criteriosService.updatePonderacionItem(
      editingPonderacion.region,
      editingPonderacion.itemIdx,
      {
        eficiencia: editingPonderacion.item.eficiencia,
        ponderacion: editingPonderacion.item.ponderacion
      },
      userEmail
    );

    toast.success('Ponderación actualizada');
    setEditingPonderacion(null);
    loadAll();
  };

  // -------------------------------------------------------------------------
  // RESET GENERAL
  // -------------------------------------------------------------------------
  const handleResetCatalog = () => {
    const catalogName = activeTab === 'distribuidoras' ? 'distribuidoras' :
      activeTab === 'servicentros' ? 'servicentros' :
      activeTab === 'frecuencias' ? 'frecuencias' :
      activeTab === 'ponderaciones' ? 'ponderaciones' :
      activeTab === 'flota' ? 'flota' : 'todo';

    if (!confirm(`¿Desea restablecer "${activeTab.toUpperCase()}" a los valores oficiales de fábrica de Duncan? Se descartarán las modificaciones locales de esta tabla.`)) return;

    const userEmail = profile?.email || 'admin@duncan.com.ve';
    criteriosService.resetCatalog(catalogName as any, userEmail);
    toast.success('Catálogo restablecido a valores oficiales');
    loadAll();
  };

  return (
    <div className="space-y-6">
      {/* CABECERA PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Criterios, Frecuencias y Tablas Maestras SSA
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              Oficial Duncan
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Gestión integral de criterios de evaluación, frecuencias de ejecución, actores responsables y ponderaciones por región.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleResetCatalog}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              title="Restablecer pestaña activa a los valores oficiales por defecto"
            >
              <RotateCcw size={14} />
              <span>Restablecer</span>
            </button>
          )}

          <button
            onClick={() => void criteriosService.exportAllCatalogsToExcel()}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Exportar catálogo completo con todas las tablas a Excel (.xlsx)"
          >
            <Download size={14} />
            <span>Exportar Excel</span>
          </button>

          {isAdmin && (activeTab === 'distribuidoras' || activeTab === 'servicentros') && (
            <button
              onClick={() => {
                setIsNewCriterio(true);
                setEditingCriterio({
                  tipo: activeTab,
                  item: {
                    item: 0,
                    conjunto: 1,
                    num: '1.99',
                    aspecto: 'General',
                    pregunta: '',
                    preguntaResumida: '',
                    aspectoLegal: 'COVENIN / LOPCYMAT',
                    grupoPilar: 'SSA',
                    areaResponsable: 'VENTAS - SSA'
                  }
                });
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Nuevo Criterio</span>
            </button>
          )}

          {isAdmin && activeTab === 'frecuencias' && (
            <button
              onClick={() => {
                setIsNewFrecuencia(true);
                setEditingFrecuencia({
                  item: 0,
                  ubicacion: 'Distribuidora',
                  inspeccion: 'Nueva Inspección',
                  area: 'Todas',
                  frecuencia: 'Mensual',
                  formularioLink: 'https://forms.office.com',
                  responsables: 'Operaciones - Ventas'
                });
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Nueva Frecuencia</span>
            </button>
          )}
        </div>
      </div>

      {/* PESTAÑAS PRINCIPALES */}
      <div className="flex border-b border-slate-200 gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'distribuidoras', label: 'Distribuidoras', count: criteriosDist.length, icon: Building2 },
          { id: 'servicentros', label: 'Servicentros', count: criteriosServ.length, icon: Store },
          { id: 'frecuencias', label: 'Frecuencias & Actores', count: frecuencias.length, icon: Clock },
          { id: 'ponderaciones', label: 'Ponderaciones Regionales', count: ponderaciones.length, icon: Scale },
          { id: 'flota', label: 'Flota Nacional', count: flota.length, icon: Truck },
          { id: 'listas', label: 'Listas Maestras', count: null, icon: ListFilter }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearch('');
              }}
              className={`pb-3 px-3.5 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 border-b-2 cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar criterio, norma legal, equipo, frecuencia, sede..."
              className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {(activeTab === 'distribuidoras' || (activeTab === 'servicentros' && scSubTab === 'criterios')) && (
            <div className="flex gap-2">
              <select
                value={pilarFilter}
                onChange={e => setPilarFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100 cursor-pointer"
              >
                <option value="TODOS">Todos los Pilares</option>
                <option value="INFRA">INFRA (Infraestructura)</option>
                <option value="LEGAL">LEGAL (Normativo)</option>
                <option value="SSA">SSA (Seguridad y Salud)</option>
                <option value="VEHCP">VEHCP (Vehículos / Equipos)</option>
              </select>

              <select
                value={areaFilter}
                onChange={e => setAreaFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100 cursor-pointer"
              >
                <option value="TODAS">Todas las Áreas</option>
                <option value="VENTAS">Ventas</option>
                <option value="OPERACIONES">Operaciones</option>
                <option value="SSA">SSA</option>
              </select>
            </div>
          )}

          {activeTab === 'servicentros' && scSubTab === 'sedes' && (
            <div className="flex gap-2">
              <select
                value={scLocalidadFilter}
                onChange={e => setScLocalidadFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100 cursor-pointer"
              >
                <option value="TODAS">Todas las Regiones ({listas?.servicentros?.filter(s => s.nombre !== 'Consolidado').length || 47} Sedes)</option>
                {scLocalidades.map(loc => (
                  <option key={loc} value={loc}>Región {loc}</option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'frecuencias' && (
            <div className="flex gap-2">
              <select
                value={frecuenciaFilter}
                onChange={e => setFrecuenciaFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100 cursor-pointer"
              >
                <option value="TODAS">Todas las Frecuencias</option>
                <option value="Diaria">Diaria</option>
                <option value="Quincenal">Quincenal</option>
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
              </select>

              <select
                value={ubicacionFilter}
                onChange={e => setUbicacionFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100 cursor-pointer"
              >
                <option value="TODAS">Todas las Ubicaciones</option>
                <option value="Distribuidora">Distribuidoras</option>
                <option value="Servicentro">Servicentros</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL POR PESTAÑA */}
      {/* 1. DISTRIBUIDORAS (173 CRITERIOS) */}
      {activeTab === 'distribuidoras' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Criterios de Evaluación Distribuidoras ({filteredDist.length} de {criteriosDist.length})
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              18 Aspectos · Ponderaciones: SSA (30%), VEHCP (25%), INFRA (22.5%), LEGAL (22.5%)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-3 w-12 text-center">#</th>
                  <th className="px-3 py-3 w-36">Aspecto</th>
                  <th className="px-4 py-3">Pregunta Evaluada</th>
                  <th className="px-4 py-3 w-48">Aspecto Legal - Técnico</th>
                  <th className="px-3 py-3 w-24 text-center">Pilar</th>
                  <th className="px-3 py-3 w-32">Área Resp.</th>
                  {isAdmin && <th className="px-3 py-3 w-20 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDist.map((c) => (
                  <tr key={c.item} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-3 py-3 text-center font-mono font-bold text-slate-500">
                      {c.item}
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-800">
                      {c.aspecto}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900 leading-snug">{c.pregunta}</p>
                      {c.preguntaResumida && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">Resumen: {c.preguntaResumida}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600 font-medium">
                      {c.aspectoLegal}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider ${
                        c.grupoPilar === 'SSA' ? 'bg-emerald-100 text-emerald-800' :
                        c.grupoPilar === 'INFRA' ? 'bg-blue-100 text-blue-800' :
                        c.grupoPilar === 'LEGAL' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {c.grupoPilar}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[11px] font-bold text-slate-700">
                      {c.areaResponsable}
                    </td>
                    {isAdmin && (
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setIsNewCriterio(false);
                              setEditingCriterio({ tipo: 'distribuidoras', item: { ...c } });
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar criterio"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteCriterio('distribuidoras', c.item, c.pregunta)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar criterio"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. SERVICENTROS (117 CRITERIOS Y 47 SEDES) */}
      {activeTab === 'servicentros' && (
        <div className="space-y-4">
          {/* Sub-selector de vista: Criterios vs Directorio de Sedes */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 w-full sm:w-fit border border-slate-200">
            <button
              type="button"
              onClick={() => setScSubTab('criterios')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                scSubTab === 'criterios'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen size={14} />
              <span>Criterios de Evaluación ({criteriosServ.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setScSubTab('sedes')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                scSubTab === 'sedes'
                  ? 'bg-white text-amber-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store size={14} />
              <span>Directorio de Servicentros ({listas?.servicentros?.filter(s => s.nombre !== 'Consolidado').length || 47} Sedes)</span>
            </button>
          </div>

          {/* VISTA A: LISTA / DIRECTORIO DE SEDES SERVICENTROS */}
          {scSubTab === 'sedes' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 bg-amber-50/70 border-b border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Store size={14} className="text-amber-600" />
                    Red Nacional Oficial de Servicentros ({filteredServicentrosSedes.length} de {listas?.servicentros?.filter(s => s.nombre !== 'Consolidado').length || 47} Sedes)
                  </span>
                  <span className="text-[11px] text-amber-800/80 font-medium block mt-0.5">
                    Puntos de diagnóstico, recarga y venta al detal · Operados por Inversiones 1286, C.A. (RIF: J-00239353-0)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-950 border border-amber-300">
                    Formulario Oficial SSA Servicentros (117 Criterios)
                  </span>
                </div>
              </div>

              {filteredServicentrosSedes.length === 0 ? (
                <div className="p-10 text-center text-slate-500 space-y-2">
                  <Store className="h-10 w-10 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No se encontraron servicentros con el filtro o búsqueda actual</p>
                  <button
                    onClick={() => { setSearch(''); setScLocalidadFilter('TODAS'); }}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-black uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-3 py-3 w-12 text-center">#</th>
                        <th className="px-4 py-3 w-40">Región / Localidad</th>
                        <th className="px-4 py-3">Nombre Oficial del Servicentro</th>
                        <th className="px-3 py-3 w-32 text-center">Código / Abrev</th>
                        <th className="px-4 py-3 w-48">Empresa Operadora</th>
                        <th className="px-3 py-3 w-28 text-center">Estatus</th>
                        <th className="px-3 py-3 w-32 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredServicentrosSedes.map((sc, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/20 transition-colors">
                          <td className="px-3 py-3 text-center font-mono font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-bold">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                              <MapPin size={11} className="text-amber-600 shrink-0" />
                              {sc.localidad}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 text-xs">
                              Servicentro {sc.nombre}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              Adscrito a la red operativa de {sc.localidad}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                              {sc.abrev || 'S/C'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-medium text-[11px]">
                            Inversiones 1286, C.A.
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              Operativo
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setScSubTab('criterios')}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Ver los 117 criterios de evaluación de servicentros"
                            >
                              Ver Criterios
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VISTA B: CRITERIOS DE EVALUACIÓN (117) */}
          {scSubTab === 'criterios' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Criterios de Evaluación Servicentros ({filteredServ.length} de {criteriosServ.length})
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  13 Aspectos · Ponderaciones: SSA (40%), INFRA (30%), LEGAL (30%)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-black uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-3 py-3 w-12 text-center">#</th>
                      <th className="px-3 py-3 w-36">Aspecto</th>
                      <th className="px-4 py-3">Pregunta Evaluada</th>
                      <th className="px-4 py-3 w-48">Aspecto Legal - Técnico</th>
                      <th className="px-3 py-3 w-24 text-center">Pilar</th>
                      <th className="px-3 py-3 w-32">Área Resp.</th>
                      {isAdmin && <th className="px-3 py-3 w-20 text-center">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredServ.map((c) => (
                      <tr key={c.item} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-3 py-3 text-center font-mono font-bold text-slate-500">
                          {c.item}
                        </td>
                        <td className="px-3 py-3 font-bold text-slate-800">
                          {c.aspecto}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 leading-snug">{c.pregunta}</p>
                          {c.preguntaResumida && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5">Resumen: {c.preguntaResumida}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-600 font-medium">
                          {c.aspectoLegal}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider ${
                            c.grupoPilar === 'SSA' ? 'bg-emerald-100 text-emerald-800' :
                            c.grupoPilar === 'INFRA' ? 'bg-blue-100 text-blue-800' :
                            c.grupoPilar === 'LEGAL' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {c.grupoPilar}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[11px] font-bold text-slate-700">
                          {c.areaResponsable}
                        </td>
                        {isAdmin && (
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setIsNewCriterio(false);
                                  setEditingCriterio({ tipo: 'servicentros', item: { ...c } });
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar criterio"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteCriterio('servicentros', c.item, c.pregunta)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Eliminar criterio"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. FRECUENCIAS DE EJECUCIÓN Y ACTORES RESPONSABLES (24 FORMULARIOS) */}
      {activeTab === 'frecuencias' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Frecuencias de Ejecución y Actores Responsables ({filteredFrec.length} de {frecuencias.length})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Cronograma normativo oficial de periodicidad e inspecciones por sede y actor
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-200">
                Operaciones - Ventas
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200">
                SSA
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-3 w-12 text-center">#</th>
                  <th className="px-3 py-3 w-32">Ubicación</th>
                  <th className="px-4 py-3">Inspección / Formulario</th>
                  <th className="px-3 py-3 w-36">Área Aplicable</th>
                  <th className="px-3 py-3 w-28 text-center">Frecuencia</th>
                  <th className="px-4 py-3 w-48">Actores Responsables</th>
                  <th className="px-3 py-3 w-28 text-center">Formulario</th>
                  {isAdmin && <th className="px-3 py-3 w-20 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFrec.map((f) => (
                  <tr key={f.item} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-3 py-3 text-center font-mono font-bold text-slate-500">
                      {f.item}
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-800">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        f.ubicacion === 'Distribuidora' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {f.ubicacion}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {f.inspeccion}
                    </td>
                    <td className="px-3 py-3 text-slate-600 font-medium">
                      {f.area}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider ${
                        f.frecuencia === 'Diaria' ? 'bg-rose-100 text-rose-800' :
                        f.frecuencia === 'Quincenal' ? 'bg-orange-100 text-orange-800' :
                        f.frecuencia === 'Mensual' ? 'bg-blue-100 text-blue-800' :
                        f.frecuencia === 'Trimestral' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {f.frecuencia}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {f.responsables}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {f.formularioLink ? (
                        <a
                          href={f.formularioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <span>Abrir</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setIsNewFrecuencia(false);
                              setEditingFrecuencia({ ...f });
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar frecuencia"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteFrecuencia(f.item, f.inspeccion)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar frecuencia"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PONDERACIONES REGIONALES PARA TOTALIZACIÓN (RONDA 1 2025-2026) */}
      {activeTab === 'ponderaciones' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">
                Esquema Oficial de Totalización Regional (Ronda 1 2025-2026)
              </h4>
              <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                Cada región pondera su Distribuidora Principal (40%), Vehículos de Carga (5%), Montacargas (5%) y la red de Servicentros adscritos. Los administradores pueden ajustar las ponderaciones y eficiencias meta de cada sede.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {ponderaciones.map((reg) => (
              <div key={reg.region} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                      <Scale size={15} className="text-yellow-400" />
                      Región {reg.region}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Promedio:</span>
                    <span className="text-sm font-black px-2.5 py-0.5 bg-yellow-400 text-slate-950 rounded-lg">
                      {reg.promedioRegion}%
                    </span>
                  </div>
                </div>

                <div className="p-3 flex-1 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-100">
                      <tr>
                        <th className="px-2.5 py-2">Establecimiento / Equipo</th>
                        <th className="px-2 py-2 text-center">% Efic.</th>
                        <th className="px-2 py-2 text-center">Pond.</th>
                        <th className="px-2 py-2 text-center">% Ponderado</th>
                        {isAdmin && <th className="px-2 py-2 text-center w-12">Edit</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reg.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-2.5 py-2 font-bold text-slate-800">
                            {it.nombre}
                          </td>
                          <td className="px-2 py-2 text-center font-mono font-bold text-slate-700">
                            {it.eficiencia}%
                          </td>
                          <td className="px-2 py-2 text-center font-mono text-slate-500">
                            {it.ponderacion}
                          </td>
                          <td className="px-2 py-2 text-center font-mono font-black text-blue-700">
                            {it.ponderado}%
                          </td>
                          {isAdmin && (
                            <td className="px-2 py-2 text-center">
                              <button
                                onClick={() => setEditingPonderacion({ region: reg.region, itemIdx: idx, item: { ...it } })}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Modificar ponderación"
                              >
                                <Edit2 size={12} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FLOTA NACIONAL (65 VEHÍCULOS) */}
      {activeTab === 'flota' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Flota Nacional Oficial Duncan ({filteredFlota.length} de {flota.length} unidades)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Camiones de Carga Pesada y Liviana asignados por Distribuidora
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-3 w-12 text-center">#</th>
                  <th className="px-3 py-3 w-28">Placas</th>
                  <th className="px-3 py-3 w-28">Marca</th>
                  <th className="px-4 py-3">Modelo</th>
                  <th className="px-3 py-3 w-20 text-center">Año</th>
                  <th className="px-3 py-3 w-32 text-center">Capacidad (Kg)</th>
                  <th className="px-4 py-3 w-36">Distribuidora</th>
                  <th className="px-4 py-3">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFlota.map((v) => (
                  <tr key={v.item} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-3 py-3 text-center font-mono font-bold text-slate-500">
                      {v.item}
                    </td>
                    <td className="px-3 py-3 font-mono font-black text-blue-700">
                      {v.placas}
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-800">
                      {v.marca}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {v.modelo}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-slate-600">
                      {v.ano || '—'}
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-bold text-slate-700">
                      {v.capacidadCargaKg ? `${v.capacidadCargaKg.toLocaleString()} Kg` : '—'}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {v.distribuidora}
                    </td>
                    <td className="px-4 py-3 text-slate-500 italic text-[11px]">
                      {v.observaciones || 'Operativo en sede'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. LISTAS MAESTRAS */}
      {activeTab === 'listas' && listas && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Building2 size={14} className="text-blue-600" /> Empresas del Grupo
            </h4>
            <div className="space-y-1.5">
              {listas.empresas.map((emp, i) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex justify-between">
                  <span>{emp.nombre}</span>
                  <span className="font-mono text-[10px] text-slate-400">{emp.rif}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Store size={14} className="text-amber-600" /> Agentes de Extinción y Capacidades
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Agentes</label>
                <div className="flex flex-wrap gap-1.5">
                  {listas.agentesExtinguidores.map((ag, i) => (
                    <span key={i} className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg font-bold text-[10px]">
                      {ag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Capacidades</label>
                <div className="flex flex-wrap gap-1.5">
                  {listas.capacidadesExtintores.map((cap, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold text-[10px]">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Acciones Requeridas</label>
                <div className="flex flex-wrap gap-1.5">
                  {listas.accionesRequeridas.map((acc, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold text-[10px]">
                      {acc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Layers size={14} className="text-purple-600" /> Sedes Distribuidoras ({listas.distribuidoras.length})
            </h4>
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              {listas.distribuidoras.map((d, i) => (
                <div key={i} className="p-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex justify-between">
                  <span>{d.nombre}</span>
                  <span className="font-mono text-[10px] text-slate-400">{d.tblNombre}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Store size={14} className="text-amber-600" /> Sedes Servicentros ({listas.servicentros.filter(s => s.nombre !== 'Consolidado').length})
              </span>
              <span className="font-mono text-[10px] text-slate-400">INV1286</span>
            </h4>
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              {listas.servicentros.filter(s => s.nombre !== 'Consolidado').map((sc, i) => (
                <div key={i} className="p-2 bg-slate-50 hover:bg-amber-50/40 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-between transition-colors">
                  <div className="truncate pr-2">
                    <span className="text-slate-900 block truncate">{sc.nombre}</span>
                    <span className="text-[10px] text-slate-400 font-medium block">{sc.localidad}</span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-200/70 text-slate-700 rounded shrink-0">
                    {sc.abrev || 'S/C'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL DE EDICIÓN / CREACIÓN DE CRITERIO (DIST / SC)           */}
      {/* ------------------------------------------------------------- */}
      {editingCriterio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Edit2 className="text-blue-600" size={18} />
                {isNewCriterio ? 'Nuevo Criterio' : `Editar Criterio #${editingCriterio.item.item}`}
                <span className="text-xs font-bold text-slate-400">({editingCriterio.tipo})</span>
              </h3>
              <button
                onClick={() => setEditingCriterio(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCriterio} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Aspecto Evaluado</label>
                  <input
                    type="text"
                    required
                    value={editingCriterio.item.aspecto}
                    onChange={e => setEditingCriterio({
                      ...editingCriterio,
                      item: { ...editingCriterio.item, aspecto: e.target.value }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Identificador N° (ej: 1.1, 2.3)</label>
                  <input
                    type="text"
                    required
                    value={editingCriterio.item.num}
                    onChange={e => setEditingCriterio({
                      ...editingCriterio,
                      item: { ...editingCriterio.item, num: e.target.value }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">Pregunta Original Completa</label>
                <textarea
                  required
                  rows={3}
                  value={editingCriterio.item.pregunta}
                  onChange={e => setEditingCriterio({
                    ...editingCriterio,
                    item: { ...editingCriterio.item, pregunta: e.target.value }
                  })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">Pregunta Resumida (Para vista móvil y reportes compactos)</label>
                <input
                  type="text"
                  value={editingCriterio.item.preguntaResumida || ''}
                  onChange={e => setEditingCriterio({
                    ...editingCriterio,
                    item: { ...editingCriterio.item, preguntaResumida: e.target.value }
                  })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">Aspecto Legal - Técnico (Leyes, Reglamentos, COVENIN)</label>
                <textarea
                  rows={2}
                  value={editingCriterio.item.aspectoLegal || ''}
                  onChange={e => setEditingCriterio({
                    ...editingCriterio,
                    item: { ...editingCriterio.item, aspectoLegal: e.target.value }
                  })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Grupo o Familia (Pilar)</label>
                  <select
                    value={editingCriterio.item.grupoPilar}
                    onChange={e => setEditingCriterio({
                      ...editingCriterio,
                      item: { ...editingCriterio.item, grupoPilar: e.target.value }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100 cursor-pointer"
                  >
                    <option value="INFRA">INFRA (Infraestructura)</option>
                    <option value="LEGAL">LEGAL (Normativo)</option>
                    <option value="SSA">SSA (Seguridad y Salud)</option>
                    <option value="VEHCP">VEHCP (Vehículos / Equipos)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Área Responsable</label>
                  <input
                    type="text"
                    required
                    value={editingCriterio.item.areaResponsable}
                    onChange={e => setEditingCriterio({
                      ...editingCriterio,
                      item: { ...editingCriterio.item, areaResponsable: e.target.value }
                    })}
                    placeholder="VENTAS - SSA, OPERACIONES, etc."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCriterio(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-200"
                >
                  <Save size={14} />
                  <span>Guardar Criterio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL DE EDICIÓN / CREACIÓN DE FRECUENCIA                     */}
      {/* ------------------------------------------------------------- */}
      {editingFrecuencia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Clock className="text-blue-600" size={18} />
                {isNewFrecuencia ? 'Nueva Frecuencia de Inspección' : `Editar Frecuencia #${editingFrecuencia.item}`}
              </h3>
              <button
                onClick={() => setEditingFrecuencia(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFrecuencia} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Ubicación</label>
                  <select
                    value={editingFrecuencia.ubicacion}
                    onChange={e => setEditingFrecuencia({ ...editingFrecuencia, ubicacion: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100"
                  >
                    <option value="Distribuidora">Distribuidora</option>
                    <option value="Servicentro">Servicentro</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Frecuencia</label>
                  <select
                    value={editingFrecuencia.frecuencia}
                    onChange={e => setEditingFrecuencia({ ...editingFrecuencia, frecuencia: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100"
                  >
                    <option value="Diaria">Diaria</option>
                    <option value="Quincenal">Quincenal</option>
                    <option value="Mensual">Mensual</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Semestral">Semestral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">Nombre de la Inspección / Formulario</label>
                <input
                  type="text"
                  required
                  value={editingFrecuencia.inspeccion}
                  onChange={e => setEditingFrecuencia({ ...editingFrecuencia, inspeccion: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Área Aplicable</label>
                  <input
                    type="text"
                    required
                    value={editingFrecuencia.area}
                    onChange={e => setEditingFrecuencia({ ...editingFrecuencia, area: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Actores Responsables</label>
                  <select
                    value={editingFrecuencia.responsables}
                    onChange={e => setEditingFrecuencia({ ...editingFrecuencia, responsables: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100"
                  >
                    <option value="Operaciones - Ventas">Operaciones - Ventas</option>
                    <option value="SSA">SSA</option>
                    <option value="Operaciones">Operaciones</option>
                    <option value="Ventas">Ventas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">Enlace a Formulario Oficial (URL)</label>
                <input
                  type="url"
                  value={editingFrecuencia.formularioLink || ''}
                  onChange={e => setEditingFrecuencia({ ...editingFrecuencia, formularioLink: e.target.value })}
                  placeholder="https://forms.office.com/r/..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFrecuencia(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-200"
                >
                  <Save size={14} />
                  <span>Guardar Frecuencia</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL DE EDICIÓN DE PONDERACIÓN REGIONAL                      */}
      {/* ------------------------------------------------------------- */}
      {editingPonderacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Scale className="text-yellow-500" size={18} />
                Editar Ponderación · {editingPonderacion.region}
              </h3>
              <button
                onClick={() => setEditingPonderacion(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePonderacion} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">Sede / Equipo</label>
                <input
                  type="text"
                  disabled
                  value={editingPonderacion.item.nombre}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">% Eficiencia Meta</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={editingPonderacion.item.eficiencia}
                    onChange={e => setEditingPonderacion({
                      ...editingPonderacion,
                      item: { ...editingPonderacion.item, eficiencia: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-slate-500 block mb-1">Ponderación (0.0 a 1.0)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    required
                    value={editingPonderacion.item.ponderacion}
                    onChange={e => setEditingPonderacion({
                      ...editingPonderacion,
                      item: { ...editingPonderacion.item, ponderacion: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-100 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center text-blue-900">
                <span className="text-[10px] uppercase font-black">Nuevo % Ponderado Resultante:</span>
                <span className="font-mono font-black text-sm text-blue-700">
                  {((editingPonderacion.item.eficiencia || 0) * (editingPonderacion.item.ponderacion || 0)).toFixed(2)}%
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPonderacion(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-200"
                >
                  <Save size={14} />
                  <span>Actualizar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
