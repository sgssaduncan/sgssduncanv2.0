import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Search, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Clock, 
  AlertTriangle, 
  FileSpreadsheet, 
  Download,
  X,
  Save,
  CheckCircle2,
  Building
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { dbService } from '../services/db';
import type { ComiteCSSL, MinutaReunionCSSL, MiembroCSSL } from '../types/committees';
import { exportCurrentViewData } from '../lib/exportUtils';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function ComitesPage() {
  const { profile, isSuperAdmin } = useAuth();
  const [comites, setComites] = useState<ComiteCSSL[]>([]);
  const [minutas, setMinutas] = useState<MinutaReunionCSSL[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'comites' | 'minutas'>('comites');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMinutaModalOpen, setIsMinutaModalOpen] = useState(false);
  const [selectedMinuta, setSelectedMinuta] = useState<MinutaReunionCSSL | null>(null);

  // Form State para Minuta Mensual CSSL
  const [sedeNombre, setSedeNombre] = useState('Distribuidora Duncan Caracas');
  const [fechaReunion, setFechaReunion] = useState(new Date().toISOString().split('T')[0]);
  const [tipoReunion, setTipoReunion] = useState<'ORDINARIA_MENSUAL' | 'EXTRAORDINARIA'>('ORDINARIA_MENSUAL');
  const [asistentesDelegados, setAsistentesDelegados] = useState('Pedro José Ruiz (Delegado Prevención)');
  const [asistentesPatrono, setAsistentesPatrono] = useState('Ing. Francisco Rojas (Representante Patrono)');
  const [puntosTratados, setPuntosTratados] = useState('');
  const [acuerdos, setAcuerdos] = useState<{ descripcion: string; responsable: string; fecha: string }[]>([
    { descripcion: '', responsable: 'Comité CSSL', fecha: '' }
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [comData, minData] = await Promise.all([
        dbService.getComitesCSSL(),
        dbService.getMinutasCSSL()
      ]);
      setComites(comData);
      setMinutas(minData);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar comités CSSL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveMinuta = async () => {
    if (!puntosTratados.trim()) {
      toast.error('Especifique los puntos tratados en la reunión del Comité.');
      return;
    }

    try {
      await dbService.saveMinutaCSSL({
        comiteId: comites[0]?.id || 'cssl_01',
        sedeNombre,
        tipoReunion,
        fechaReunion,
        horaInicio: '09:00',
        horaFin: '11:00',
        lugarReunion: `Sala de Reuniones SSA - ${sedeNombre}`,
        asistentesDelegados: asistentesDelegados.split('\n').filter(Boolean),
        asistentesPatrono: asistentesPatrono.split('\n').filter(Boolean),
        puntosTratados: puntosTratados.split('\n').filter(Boolean),
        acuerdos: acuerdos.filter(a => a.descripcion).map((a, i) => ({
          id: `ac_${i}`,
          descripcion: a.descripcion,
          responsable: a.responsable,
          fechaLimite: a.fecha || new Date().toISOString().split('T')[0],
          estado: 'PENDIENTE'
        })),
        creadoPor: profile?.displayName || 'Secretario CSSL'
      });

      toast.success('Minuta mensual del Comité CSSL guardada con éxito.');
      setIsMinutaModalOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar minuta');
    }
  };

  const handleExport = (format: 'excel' | 'csv') => {
    if (activeTab === 'comites') {
      const dataToExport = comites.map(c => ({
        'Sede': c.sedeNombre,
        'Registro INPSASEL': c.numeroRegistroComiteINPSASEL,
        'Fecha Registro': c.fechaRegistroINPSASEL,
        'Fecha Vencimiento (2 Años)': c.fechaVencimientoVigencia,
        'Días Restantes': c.diasParaVencer,
        'Estatus Vigencia': c.estatusVigencia,
        'Miembros Registrados': c.miembros.map(m => `${m.nombreCompleto} (${m.rolComite})`).join('; ')
      }));
      exportCurrentViewData(dataToExport, format, `Comites_CSSL_Vigencias_INPSASEL_${new Date().toISOString().split('T')[0]}`);
    } else {
      const dataToExport = minutas.map(m => ({
        'Correlativo': m.correlativoMinuta,
        'Fecha': m.fechaReunion,
        'Sede': m.sedeNombre,
        'Tipo Reunión': m.tipoReunion,
        'Asistentes Delegados': m.asistentesDelegados.join('; '),
        'Asistentes Patrono': m.asistentesPatrono.join('; '),
        'Puntos Tratados': m.puntosTratados.join('; '),
        'Acuerdos': m.acuerdos.map(a => `${a.descripcion} (${a.responsable})`).join('; ')
      }));
      exportCurrentViewData(dataToExport, format, `Minutas_Reunion_CSSL_${new Date().toISOString().split('T')[0]}`);
    }
    toast.success(`Datos exportados a ${format === 'excel' ? 'Excel' : 'CSV'}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-400 text-slate-900 rounded-xl shadow-sm">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Comités de Seguridad y Salud Laboral (CSSL)</h1>
            <p className="text-sm text-slate-500">
              Auditoría Remota, Delegados de Prevención, Vigencia ante INPSASEL (2 años) y Minutas Mensuales
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Export Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm"
              title="Exportar a Excel"
            >
              <FileSpreadsheet size={14} />
              Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
              title="Exportar a CSV"
            >
              <FileText size={14} />
              CSV
            </button>
          </div>

          <button
            onClick={() => setIsMinutaModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl font-bold text-sm shadow-sm transition-colors ml-auto md:ml-0"
          >
            <Plus size={18} />
            Nueva Minuta CSSL
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('comites')}
          className={cn(
            "px-4 py-2 text-sm font-bold rounded-xl transition-colors",
            activeTab === 'comites' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          Comités y Delegados de Prevención ({comites.length})
        </button>
        <button
          onClick={() => setActiveTab('minutas')}
          className={cn(
            "px-4 py-2 text-sm font-bold rounded-xl transition-colors",
            activeTab === 'minutas' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          Repositorio de Minutas Mensuales ({minutas.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'comites' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comites.map(c => (
            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{c.sedeNombre}</h3>
                  <div className="text-xs text-slate-500">Registro INPSASEL: <strong className="text-slate-700">{c.numeroRegistroComiteINPSASEL}</strong></div>
                </div>
                <span className={cn(
                  "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                  c.estatusVigencia === 'VIGENTE' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  c.estatusVigencia === 'PROXIMO_A_VENCER' ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-red-50 text-red-700 border-red-200"
                )}>
                  {c.estatusVigencia === 'VIGENTE' ? 'Vigente (2 años)' : c.estatusVigencia}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Fecha Registro:</span>
                  <span className="font-semibold text-slate-700">{c.fechaRegistroINPSASEL}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vencimiento Vigencia:</span>
                  <span className="font-semibold text-slate-700">{c.fechaVencimientoVigencia}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Días Restantes:</span>
                  <span className="font-bold text-emerald-700">{c.diasParaVencer} días</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Miembros del Comité</div>
                <div className="space-y-2">
                  {c.miembros.map(m => (
                    <div key={m.id} className="p-2.5 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{m.nombreCompleto}</div>
                        <div className="text-slate-400">C.I. {m.cedula} • {m.cargoEmpresa}</div>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded",
                        m.rolComite === 'DELEGADO_PREVENCION' ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                      )}>
                        {m.rolComite === 'DELEGADO_PREVENCION' ? 'Delegado Prevención' : 'Representante Patrono'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {minutas.map(m => (
            <div
              key={m.id}
              onClick={() => setSelectedMinuta(m)}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer space-y-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg">
                  {m.correlativoMinuta}
                </span>
                <span className="text-xs font-semibold text-slate-400">{m.fechaReunion}</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">{m.sedeNombre}</h3>
                <div className="text-xs text-slate-500 mt-1">{m.tipoReunion.replace(/_/g, ' ')}</div>
              </div>
              <div className="text-xs text-slate-600 line-clamp-2">
                Puntos: {m.puntosTratados.join(', ')}
              </div>
              <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs text-yellow-600 font-bold">
                <span>{m.acuerdos.length} Acuerdos fijados</span>
                <span>Ver Minuta &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva Minuta */}
      {isMinutaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 my-8"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Minuta de Reunión Mensual CSSL</h2>
                <p className="text-sm text-slate-400">Cumplimiento del Art. 46 LOPCYMAT y Reglamento Parcial</p>
              </div>
              <button onClick={() => setIsMinutaModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Sede / Localidad</label>
                  <input
                    type="text"
                    value={sedeNombre}
                    onChange={(e) => setSedeNombre(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Fecha de Reunión</label>
                  <input
                    type="date"
                    value={fechaReunion}
                    onChange={(e) => setFechaReunion(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Delegados de Prevención Asistentes</label>
                <textarea
                  rows={2}
                  value={asistentesDelegados}
                  onChange={(e) => setAsistentesDelegados(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Representantes del Patrono Asistentes</label>
                <textarea
                  rows={2}
                  value={asistentesPatrono}
                  onChange={(e) => setAsistentesPatrono(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Puntos Tratados en el Orden del Día</label>
                <textarea
                  rows={4}
                  value={puntosTratados}
                  onChange={(e) => setPuntosTratados(e.target.value)}
                  placeholder="1. Revisión de condiciones y medio ambiente de trabajo...&#10;2. Análisis de accidentes e inspecciones SSA del mes...&#10;3. Seguimiento a dotación de EPP..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsMinutaModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveMinuta}
                className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-sm text-sm"
              >
                <Save size={16} />
                Guardar Minuta CSSL
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
