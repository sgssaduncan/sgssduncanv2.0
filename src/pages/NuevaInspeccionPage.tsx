import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useSGD } from '../contexts/SGDContext';
import { 
  Plus, 
  ArrowLeft, 
  Building2, 
  ClipboardCheck, 
  User, 
  Search, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Calendar
} from 'lucide-react';
import { today } from '../lib/utils';
import toast from 'react-hot-toast';

export default function NuevaInspeccionPage() {
  const navigate = useNavigate();
  const { createInspeccion, empresas, localidades, establecimientos, tiposInspeccion, currentUser } = useSGD();

  const [form, setForm] = useState({
    empresaId: empresas[0]?._id || '',
    localidadId: '',
    establecimientoId: '',
    tipoInspeccionId: '',
    fecha: today(),
    inspector: currentUser?.nombre || 'Francisco Rojas',
    observaciones: '',
  });
  const [loading, setLoading] = useState(false);
  const [searchTipo, setSearchTipo] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');

  const selectedTipoObj = tiposInspeccion.find(t => t._id === form.tipoInspeccionId);

  // Categorías únicas
  const categorias = ['TODAS', ...Array.from(new Set(tiposInspeccion.map(t => t.categoria || 'General')))];

  const tiposFiltrados = tiposInspeccion.filter(t => {
    const matchesSearch = (t.nombre || '').toLowerCase().includes(searchTipo.toLowerCase()) ||
                          (t.codigo || '').toLowerCase().includes(searchTipo.toLowerCase()) ||
                          (t.descripcion || '').toLowerCase().includes(searchTipo.toLowerCase());
    const matchesCat = selectedCategoria === 'TODAS' || t.categoria === selectedCategoria;
    return matchesSearch && matchesCat;
  });

  const localidadesFiltradas = localidades.filter(l => !form.empresaId || l.empresaId === form.empresaId);
  const establecimientosFiltrados = establecimientos.filter(e =>
    (!form.localidadId || e.localidadId === form.localidadId)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'empresaId') { updated.localidadId = ''; updated.establecimientoId = ''; }
      if (name === 'localidadId') { updated.establecimientoId = ''; }
      return updated;
    });
  };

  const handleSelectTipo = (tipoId: string) => {
    setForm(prev => ({ ...prev, tipoInspeccionId: tipoId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipoInspeccionId) {
      toast.error('Por favor selecciona primero el tipo de inspección');
      return;
    }
    if (!form.establecimientoId || !form.inspector.trim()) {
      toast.error('Por favor completa todos los campos de ubicación e inspector');
      return;
    }
    setLoading(true);
    try {
      const id = await createInspeccion(form);
      toast.success('Inspección creada exitosamente');
      navigate(`/inspecciones/${id}/formulario`);
    } catch (err) {
      toast.error('Error al crear la inspección');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 bg-white shadow-sm"
          title="Regresar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Plus className="h-6 w-6 text-blue-600" /> Nueva Inspección SSA
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Paso 1: Selecciona el tipo de inspección para desplegar la ubicación y datos del inspector
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BLOQUE 1: TIPO DE INSPECCIÓN (PRIMERO) */}
        <div className="card shadow-sm border border-slate-200">
          <div className="card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                1
              </div>
              <div>
                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                  <ClipboardCheck className="h-5 w-5 text-blue-600" /> Tipo de Inspección *
                </h2>
                <p className="text-xs text-slate-500">Selecciona el protocolo técnico que vas a auditar</p>
              </div>
            </div>

            {selectedTipoObj && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span className="truncate max-w-[200px]">{selectedTipoObj.icono} {selectedTipoObj.nombre}</span>
              </div>
            )}
          </div>

          <div className="card-body space-y-4">
            {/* Buscador y Filtros por Categoría */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar tipo de inspección (ej: Extintores, Montacargas, Botiquines...)"
                  value={searchTipo}
                  onChange={(e) => setSearchTipo(e.target.value)}
                  className="input pl-9 text-xs"
                />
              </div>

              {/* Categorías */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categorias.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategoria(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategoria === cat
                        ? 'bg-slate-900 text-yellow-400 font-bold shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de Tipos de Inspección */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {tiposFiltrados.map(tipo => {
                const isSelected = form.tipoInspeccionId === tipo._id;
                return (
                  <div
                    key={tipo._id}
                    onClick={() => handleSelectTipo(tipo._id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <span className="text-2xl shrink-0 p-1 bg-white rounded-lg border border-slate-100 shadow-xs">
                      {tipo.icono}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-sm font-bold truncate ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
                          {tipo.nombre}
                        </p>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{tipo.descripcion || tipo.codigo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {tipo.frecuencia}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {tipo.categoria}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MENSAJE GUÍA O CAMPOS DE CAPTURAS 1 Y 2 */}
        {!form.tipoInspeccionId ? (
          <div className="bg-amber-50/70 border-2 border-dashed border-amber-200 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-sm border border-amber-100">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Selecciona primero un Tipo de Inspección</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Una vez seleccionado el protocolo técnico, aparecerán automáticamente los campos de <strong>Ubicación</strong> (Empresa, Localidad, Establecimiento) y de <strong>Inspector y Fecha</strong>.
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* CAPTURA 1: UBICACIÓN */}
            <div className="card shadow-sm border border-slate-200">
              <div className="card-header flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  2
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-blue-600" /> Ubicación
                  </h2>
                  <p className="text-xs text-slate-500">Define la sede o establecimiento donde se ejecutará la inspección</p>
                </div>
              </div>

              <div className="card-body space-y-4">
                <div>
                  <label className="label font-bold text-xs text-slate-700">Empresa *</label>
                  <select name="empresaId" className="select" value={form.empresaId} onChange={handleChange} required>
                    <option value="">Selecciona una empresa</option>
                    {empresas.map(e => <option key={e._id} value={e._id}>{e.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label font-bold text-xs text-slate-700">Localidad *</label>
                  <select name="localidadId" className="select" value={form.localidadId} onChange={handleChange} required>
                    <option value="">Selecciona una localidad</option>
                    {localidadesFiltradas.map(l => <option key={l._id} value={l._id}>{l.nombre} — {l.estado}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label font-bold text-xs text-slate-700">Establecimiento *</label>
                  <select name="establecimientoId" className="select" value={form.establecimientoId} onChange={handleChange} required>
                    <option value="">Selecciona un establecimiento</option>
                    {establecimientosFiltrados.map(e => <option key={e._id} value={e._id}>{e.nombre} ({e.tipo})</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* CAPTURA 2: INSPECTOR Y FECHA */}
            <div className="card shadow-sm border border-slate-200">
              <div className="card-header flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  3
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                    <User className="h-4 w-4 text-blue-600" /> Inspector y Fecha
                  </h2>
                  <p className="text-xs text-slate-500">Datos del auditor responsable y fecha de realización</p>
                </div>
              </div>

              <div className="card-body space-y-4">
                <div>
                  <label className="label font-bold text-xs text-slate-700">Inspector *</label>
                  <input 
                    type="text" 
                    name="inspector" 
                    className="input" 
                    placeholder="Nombre del inspector"
                    value={form.inspector} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div>
                  <label className="label font-bold text-xs text-slate-700">Fecha de Inspección *</label>
                  <input 
                    type="date" 
                    name="fecha" 
                    className="input"
                    value={form.fecha} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div>
                  <label className="label font-bold text-xs text-slate-700">Observaciones iniciales</label>
                  <textarea 
                    name="observaciones" 
                    className="input resize-none" 
                    rows={3}
                    placeholder="Observaciones previas a la inspección (opcional)"
                    value={form.observaciones} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="p-4 bg-white border border-slate-200 flex flex-col sm:flex-row gap-3 rounded-2xl shadow-sm">
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="btn-secondary flex-1 py-3"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading || !form.establecimientoId} 
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 font-bold shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> 
                    Creando inspección...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" /> Iniciar Inspección
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}
