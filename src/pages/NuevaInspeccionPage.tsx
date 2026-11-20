import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSGD } from '../contexts/SGDContext';
import { Plus, ArrowLeft, Calendar, Building2, ClipboardCheck, User } from 'lucide-react';
import { today } from '../lib/utils';
import toast from 'react-hot-toast';

export default function NuevaInspeccionPage() {
  const navigate = useNavigate();
  const { createInspeccion, empresas, localidades, establecimientos, tiposInspeccion } = useSGD();

  const [form, setForm] = useState({
    empresaId: empresas[0]?._id || '',
    localidadId: '',
    establecimientoId: '',
    tipoInspeccionId: '',
    fecha: today(),
    inspector: '',
    observaciones: '',
  });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.establecimientoId || !form.tipoInspeccionId || !form.inspector.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
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
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Plus className="h-6 w-6 text-blue-600" /> Nueva Inspección
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Registra una nueva inspección SSA</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="card-header">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" /> Ubicación
          </h2>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="label">Empresa *</label>
            <select name="empresaId" className="select" value={form.empresaId} onChange={handleChange} required>
              <option value="">Selecciona una empresa</option>
              {empresas.map(e => <option key={e._id} value={e._id}>{e.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Localidad *</label>
            <select name="localidadId" className="select" value={form.localidadId} onChange={handleChange} required>
              <option value="">Selecciona una localidad</option>
              {localidadesFiltradas.map(l => <option key={l._id} value={l._id}>{l.nombre} — {l.estado}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Establecimiento *</label>
            <select name="establecimientoId" className="select" value={form.establecimientoId} onChange={handleChange} required>
              <option value="">Selecciona un establecimiento</option>
              {establecimientosFiltrados.map(e => <option key={e._id} value={e._id}>{e.nombre} ({e.tipo})</option>)}
            </select>
          </div>
        </div>

        <div className="border-t border-slate-100">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-blue-600" /> Tipo de Inspección
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tiposInspeccion.map(tipo => (
                <label key={tipo._id} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  form.tipoInspeccionId === tipo._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                  <input type="radio" name="tipoInspeccionId" value={tipo._id}
                    checked={form.tipoInspeccionId === tipo._id}
                    onChange={handleChange} className="sr-only" />
                  <span className="text-xl">{tipo.icono}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{tipo.nombre}</p>
                    <p className="text-xs text-slate-500">{tipo.frecuencia} · {tipo.categoria}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" /> Inspector y Fecha
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="label">Inspector *</label>
              <input type="text" name="inspector" className="input" placeholder="Nombre del inspector"
                value={form.inspector} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Fecha de Inspección *</label>
              <input type="date" name="fecha" className="input"
                value={form.fecha} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Observaciones iniciales</label>
              <textarea name="observaciones" className="input resize-none" rows={3}
                placeholder="Observaciones previas a la inspección (opcional)"
                value={form.observaciones} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 rounded-b-xl">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? (
              <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Creando...</>
            ) : (
              <><Plus className="h-4 w-4" /> Iniciar Inspección</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
