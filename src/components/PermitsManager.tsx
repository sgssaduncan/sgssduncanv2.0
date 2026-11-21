import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  FileWarning, 
  Key, 
  Flame, 
  HardHat, 
  Pickaxe, 
  Zap, 
  MapPin, 
  Search, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  Settings, 
  Snowflake, 
  FileSpreadsheet, 
  FileText,
  Plus
} from 'lucide-react';
import type { PermisoTrabajo, TipoTrabajoRiesgoso, ControlCampo } from '../types/permits';
import PermitForm from './PermitForm';
import PermitReviewModal from './PermitReviewModal';
import PermitConfigModal from './PermitConfigModal';
import { exportWorkPermitsData } from '../lib/exportUtils';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { dbService } from '../services/db';
import toast from 'react-hot-toast';

export default function PermitsManager() {
  const { profile, isSuperAdmin } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [permisoToReview, setPermisoToReview] = useState<PermisoTrabajo | null>(null);
  const [permisos, setPermisos] = useState<PermisoTrabajo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPermisos = async () => {
    try {
      setLoading(true);
      const data = await dbService.getPermisosTrabajo();
      setPermisos(data);
    } catch (error) {
      console.error("Error fetching permits:", error);
      toast.error('Error al cargar permisos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermisos();
  }, []);

  const filteredPermisos = permisos.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      (p.codigoPermiso || '').toLowerCase().includes(q) || 
      (p.tipoTrabajo || '').toLowerCase().replace(/_/g, ' ').includes(q) || 
      (p.estado || '').toLowerCase().replace(/_/g, ' ').includes(q) ||
      (p.ubicacionDato || '').toLowerCase().includes(q) ||
      (p.descripcionTrabajo || '').toLowerCase().includes(q)
    );
  });

  const handleExportCurrentView = (format: 'excel' | 'csv') => {
    if (filteredPermisos.length === 0) {
      toast.error('No hay permisos en la vista actual para exportar');
      return;
    }
    exportWorkPermitsData(filteredPermisos, format);
    toast.success(`Exportados ${filteredPermisos.length} permisos de trabajo a ${format === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)'}`);
  };

  const ICON_MAP: Record<TipoTrabajoRiesgoso, any> = {
    'CALIENTE': Flame,
    'ESPACIOS_CONFINADOS': MapPin,
    'ENERGIA_PELIGROSA_LOTO': Key,
    'ALTURA': HardHat,
    'EXCAVACION': Pickaxe,
    'ALTA_TENSION': Zap,
    'FRIO': Snowflake
  };

  const THEME_MAP: Record<TipoTrabajoRiesgoso, string> = {
    'CALIENTE': 'text-orange-600 bg-orange-100 border-orange-200',
    'ESPACIOS_CONFINADOS': 'text-violet-600 bg-violet-100 border-violet-200',
    'ENERGIA_PELIGROSA_LOTO': 'text-red-600 bg-red-100 border-red-200',
    'ALTURA': 'text-blue-600 bg-blue-100 border-blue-200',
    'EXCAVACION': 'text-amber-700 bg-amber-100 border-amber-200',
    'ALTA_TENSION': 'text-yellow-600 bg-yellow-100 border-yellow-200',
    'FRIO': 'text-sky-600 bg-sky-100 border-sky-200'
  };

  const handleSavePermit = async (p: Partial<PermisoTrabajo>) => {
    try {
      await dbService.savePermisoTrabajo(p);
      toast.success('Permiso de trabajo solicitado correctamente');
      setIsFormOpen(false);
      await loadPermisos();
    } catch (e) {
      console.error(e);
      toast.error('Error al solicitar permiso');
    }
  };

  const handleUpdateEstado = async (
    id: string, 
    nuevoEstado: PermisoTrabajo['estado'], 
    controles?: ControlCampo,
    firmas?: Partial<NonNullable<PermisoTrabajo['firmasDigitales']>>
  ) => {
    try {
      const updateData: Partial<PermisoTrabajo> = { estado: nuevoEstado };
      if (controles) updateData.controlesCampo = controles;
      if (firmas) {
        const actual = permisos.find(p => p.id === id);
        updateData.firmasDigitales = {
          ...(actual?.firmasDigitales || {}),
          ...firmas
        };
      }
      await dbService.updatePermisoTrabajo(id, updateData);
      toast.success(`Permiso actualizado a: ${nuevoEstado}`);
      setPermisoToReview(null);
      await loadPermisos();
    } catch (e) {
      console.error(e);
      toast.error('Error al actualizar el permiso');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-400 text-slate-900 rounded-xl shadow-sm">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Permisos de Trabajo de Alto Riesgo (PTAR)</h1>
              <p className="text-sm text-slate-500">Gestión de Seguridad Operacional y Flujos de Autorización (ISO 45001 / OSHA)</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {isSuperAdmin && (
            <button
              onClick={() => setIsConfigOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors border border-slate-200"
              title="Configurar Matriz de Riesgos y Aprobadores"
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Configuración</span>
            </button>
          )}

          {/* Export Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleExportCurrentView('excel')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm"
              title="Exportar vista actual a Excel (.xlsx)"
            >
              <FileSpreadsheet size={14} />
              Excel
            </button>
            <button
              onClick={() => handleExportCurrentView('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
              title="Exportar vista actual a CSV (.csv)"
            >
              <FileText size={14} />
              CSV
            </button>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl font-bold text-sm shadow-sm transition-colors ml-auto md:ml-0"
          >
            <Plus size={18} />
            Solicitar Permiso
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por código, tipo de trabajo, ubicación, estado..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Grid of Permits */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 text-slate-400">
          Cargando permisos de trabajo...
        </div>
      ) : filteredPermisos.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <FileWarning size={24} />
          </div>
          <h3 className="font-bold text-slate-700">No se encontraron permisos de trabajo</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            {searchQuery ? 'Prueba ajustando los términos de búsqueda.' : 'Crea una nueva solicitud de permiso de trabajo de alto riesgo para comenzar el flujo de autorización.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredPermisos.map((p) => {
              const Icon = ICON_MAP[p.tipoTrabajo] || ShieldAlert;
              const theme = THEME_MAP[p.tipoTrabajo] || 'text-slate-600 bg-slate-100 border-slate-200';

              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setPermisoToReview(p)}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5", theme)}>
                        <Icon size={14} />
                        {p.tipoTrabajo.replace(/_/g, ' ')}
                      </span>
                      <span className={cn(
                        "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                        p.estado === 'APROBADO' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        p.estado === 'SOLICITUD' && "bg-amber-50 text-amber-700 border-amber-200",
                        p.estado === 'VALIDACION_CAMPO' && "bg-blue-50 text-blue-700 border-blue-200",
                        p.estado === 'SUSPENDIDO' && "bg-red-50 text-red-700 border-red-200",
                        p.estado === 'CERRADO' && "bg-slate-100 text-slate-700 border-slate-200"
                      )}>
                        {p.estado.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-400">{p.codigoPermiso}</div>
                      <h3 className="font-bold text-slate-800 text-base line-clamp-1">{p.descripcionTrabajo}</h3>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5 line-clamp-1">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span>{p.ubicacionDato}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-400 shrink-0" />
                        <span>Inicio: {p.vigenciaInicio || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {p.fechaSolicitud?.split('T')[0] || p.fechaSolicitud}
                    </span>
                    <span className="font-semibold text-yellow-600 hover:text-yellow-700">Ver Detalles &rarr;</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modales */}
      {isFormOpen && (
        <PermitForm
          onClose={() => setIsFormOpen(false)}
          onSave={handleSavePermit}
        />
      )}

      {isConfigOpen && (
        <PermitConfigModal
          onClose={() => setIsConfigOpen(false)}
        />
      )}

      {permisoToReview && (
        <PermitReviewModal
          permiso={permisoToReview}
          onClose={() => setPermisoToReview(null)}
          onUpdateEstado={(estado, controles, firmas) => 
            handleUpdateEstado(permisoToReview.id, estado, controles, firmas)
          }
        />
      )}
    </div>
  );
}
