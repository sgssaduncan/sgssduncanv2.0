import React, { useState } from 'react';
import {
  Lock, Unlock, Plus, AlertTriangle, ShieldCheck,
  CheckCircle2, Zap, Flame, Gauge, Clock, User
} from 'lucide-react';
import { gsApi } from '../lib/googleSheetsClient';
import type { EquipoLOTO, BloqueoLOTO } from '../types';
import { today, formatDate } from '../lib/utils';
import { useSGD } from '../contexts/SGDContext';
import toast from 'react-hot-toast';

export default function LotoPage() {
  const { currentUser } = useSGD();
  const [activeTab, setActiveTab] = useState<'equipos' | 'bloqueos'>('bloqueos');
  const [equipos, setEquipos] = useState<EquipoLOTO[]>(() => gsApi.getLotoEquipos());
  const [bloqueos, setBloqueos] = useState<BloqueoLOTO[]>(() => gsApi.getLotoBloqueos());
  const [modalOpen, setModalOpen] = useState(false);

  // Formulario nuevo bloqueo
  const [formEquipoTag, setFormEquipoTag] = useState(equipos[0]?.tag || '');
  const [formMotivo, setFormMotivo] = useState('');
  const [formResponsable, setFormResponsable] = useState(currentUser?.nombre || '');
  const [formCandados, setFormCandados] = useState(2);
  const [formEnergiaCero, setFormEnergiaCero] = useState(false);

  const bloqueosActivos = bloqueos.filter(b => b.estado === 'Activo');

  const handleCrearBloqueo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEnergiaCero) {
      toast.error('Es OBLIGATORIO verificar y certificar la Energía Cero antes de bloquear');
      return;
    }

    const eq = equipos.find(e => e.tag === formEquipoTag);
    const now = new Date();
    const hora = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const nuevoBloqueo: BloqueoLOTO = {
      _id: `bloq_${Date.now()}`,
      equipoTag: formEquipoTag,
      equipoNombre: eq?.nombre || 'Equipo Industrial',
      ubicacion: eq?.ubicacion || 'Planta Duncan',
      motivo: formMotivo.trim() || 'Mantenimiento preventivo',
      responsable: formResponsable.trim() || (currentUser?.nombre || 'Inspector LOTO'),
      fechaInicio: today(),
      horaInicio: hora,
      estado: 'Activo',
      candadosColocados: formCandados,
      energiaCeroVerificada: true,
    };

    const updated = [nuevoBloqueo, ...bloqueos];
    setBloqueos(updated);
    localStorage.setItem('sgd_loto_bloqueos', JSON.stringify(updated));

    gsApi.logAudit({
      usuario: currentUser?.nombre || 'Sistema',
      accion: 'APERTURA_LOTO',
      entidad: 'BloqueoLOTO',
      entidadId: nuevoBloqueo._id,
      detalles: `Bloqueo activo en ${nuevoBloqueo.equipoTag} (${nuevoBloqueo.equipoNombre}) por ${nuevoBloqueo.responsable}`,
    });

    toast.success(`Bloqueo LOTO activado en ${nuevoBloqueo.equipoTag}`);
    setModalOpen(false);
    setActiveTab('bloqueos');
  };

  const handleLiberarBloqueo = (id: string) => {
    if (!window.confirm('¿Confirmas que el personal está despejado, las protecciones reinstaladas y se pueden retirar los candados?')) {
      return;
    }

    const updated = bloqueos.map(b => {
      if (b._id === id) {
        return { ...b, estado: 'Liberado' as const };
      }
      return b;
    });

    setBloqueos(updated);
    localStorage.setItem('sgd_loto_bloqueos', JSON.stringify(updated));

    gsApi.logAudit({
      usuario: currentUser?.nombre || 'Sistema',
      accion: 'CIERRE_LOTO',
      entidad: 'BloqueoLOTO',
      entidadId: id,
      detalles: `Bloqueo LOTO liberado por ${currentUser?.nombre}`,
    });

    toast.success('Procedimiento LOTO liberado y equipo restablecido');
  };

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Lock className="h-6 w-6" />
            </div>
            LOTO — Control de Energías Peligrosas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de bloqueo, etiquetado y desenergización de equipos de alta energía (Baterías Duncan)
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
        >
          <Lock className="h-4 w-4" />
          <span>Registrar Bloqueo LOTO</span>
        </button>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipos en Catálogo LOTO</p>
            <p className="text-2xl font-bold text-slate-900">{equipos.length}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className={`p-3 rounded-xl ${bloqueosActivos.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bloqueos Activos en Curso</p>
            <p className="text-2xl font-bold text-slate-900">
              {bloqueosActivos.length} <span className="text-xs font-normal text-slate-400">equipos intervenidos</span>
            </p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Procedimientos Ejecutados</p>
            <p className="text-2xl font-bold text-slate-900">{bloqueos.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('bloqueos')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'bloqueos'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Bloqueos en Curso e Histórico ({bloqueos.length})
        </button>
        <button
          onClick={() => setActiveTab('equipos')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'equipos'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Equipos y Puntos de Bloqueo ({equipos.length})
        </button>
      </div>

      {/* TAB 1: BLOQUEOS ACTIVOS */}
      {activeTab === 'bloqueos' && (
        <div className="space-y-4">
          {bloqueos.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">
              <Lock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-slate-600">No hay procedimientos LOTO registrados</p>
              <p className="text-xs text-slate-400 mt-1">Utiliza el botón para iniciar un bloqueo de seguridad</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bloqueos.map(b => {
                const isActive = b.estado === 'Activo';
                return (
                  <div
                    key={b._id}
                    className={`card p-5 border-l-4 flex flex-col justify-between transition-all ${
                      isActive ? 'border-l-rose-500 shadow-md bg-rose-50/20' : 'border-l-emerald-500 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-amber-400">
                          {b.equipoTag}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isActive ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          {b.estado}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base">{b.equipoNombre}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{b.ubicacion}</p>

                      <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Motivo:</span>
                          <span className="font-medium text-slate-800">{b.motivo}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Responsable:</span>
                          <span className="font-bold text-slate-900">{b.responsable}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Inicio:</span>
                          <span className="text-slate-700">{formatDate(b.fechaInicio)} a las {b.horaInicio}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Candados colocados:</span>
                          <span className="font-bold text-amber-700">{b.candadosColocados} candado(s)</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Energía Cero Certificada
                      </span>
                      {isActive && (
                        <button
                          onClick={() => handleLiberarBloqueo(b._id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Unlock className="w-3 h-3" /> Liberar y Desbloquear
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EQUIPOS REGISTRADOS */}
      {activeTab === 'equipos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {equipos.map(eq => (
            <div key={eq._id} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-amber-400">
                  {eq.tag}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900">
                  {eq.tipoEnergia}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{eq.nombre}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{eq.ubicacion}</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p><strong>Dispositivo de Bloqueo:</strong> {eq.dispositivoBloqueo}</p>
                <p><strong>Procedimiento:</strong> {eq.procedimiento}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NUEVO BLOQUEO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                Registrar Bloqueo de Energía (LOTO)
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearBloqueo} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Equipo / Punto de Bloqueo *
                </label>
                <select
                  value={formEquipoTag}
                  onChange={e => setFormEquipoTag(e.target.value)}
                  className="input w-full text-sm"
                >
                  {equipos.map(eq => (
                    <option key={eq._id} value={eq.tag}>
                      [{eq.tag}] {eq.nombre} — {eq.ubicacion} ({eq.tipoEnergia})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Motivo de la Intervención *
                </label>
                <input
                  type="text"
                  required
                  value={formMotivo}
                  onChange={e => setFormMotivo(e.target.value)}
                  placeholder="Ej: Mantenimiento correctivo en barras de potencia"
                  className="input w-full text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Responsable de la Maniobra *
                  </label>
                  <input
                    type="text"
                    required
                    value={formResponsable}
                    onChange={e => setFormResponsable(e.target.value)}
                    className="input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cantidad de Candados *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formCandados}
                    onChange={e => setFormCandados(parseInt(e.target.value) || 1)}
                    className="input w-full text-sm font-bold"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="energiaCero"
                    checked={formEnergiaCero}
                    onChange={e => setFormEnergiaCero(e.target.checked)}
                    className="w-5 h-5 text-amber-600 rounded border-slate-300 mt-0.5"
                  />
                  <label htmlFor="energiaCero" className="text-xs font-bold text-slate-900 leading-tight cursor-pointer">
                    Certifico que se verificó la ausencia total de energía residual (Energía Cero) mediante instrumento de medición calibrado (Voltímetro / Manómetro).
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-2"
                >
                  Activar Bloqueo LOTO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}