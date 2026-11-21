import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, X, Shield, Users, Save, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import type { TipoTrabajoRiesgoso } from '../types/permits';
import { cn } from '../lib/utils';

interface PermitConfigModalProps {
  onClose: () => void;
}

const TIPO_TRABAJOS: TipoTrabajoRiesgoso[] = [
  'CALIENTE', 
  'ESPACIOS_CONFINADOS', 
  'ENERGIA_PELIGROSA_LOTO', 
  'ALTURA', 
  'EXCAVACION', 
  'ALTA_TENSION'
];

const NIVELES_RIESGO = ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'];
const APROBADORES_OPCIONES = ['EMISOR', 'PREVENCIONISTA (SST)', 'GERENTE DE ÁREA', 'RESPONSABLE LEGAL'];

export default function PermitConfigModal({ onClose }: PermitConfigModalProps) {
  const [config, setConfig] = useState<Record<string, { riesgo: string; aprobadores: string[] }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sgd_permits_config');
      if (stored) {
        setConfig(JSON.parse(stored));
      } else {
        const defaults: Record<string, { riesgo: string; aprobadores: string[] }> = {};
        TIPO_TRABAJOS.forEach(t => {
          defaults[t] = {
            riesgo: t === 'CALIENTE' || t === 'ESPACIOS_CONFINADOS' ? 'CRITICO' : 'ALTO',
            aprobadores: ['EMISOR', 'PREVENCIONISTA (SST)']
          };
        });
        setConfig(defaults);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRiesgoChange = (tipo: string, riesgo: string) => {
    setConfig(prev => ({
      ...prev,
      [tipo]: {
        ...(prev[tipo] || { aprobadores: [] }),
        riesgo
      }
    }));
  };

  const handleAprobadorToggle = (tipo: string, rol: string) => {
    setConfig(prev => {
      const current = prev[tipo]?.aprobadores || [];
      const updated = current.includes(rol)
        ? current.filter(r => r !== rol)
        : [...current, rol];
      return {
        ...prev,
        [tipo]: {
          ...(prev[tipo] || { riesgo: 'ALTO' }),
          aprobadores: updated
        }
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('sgd_permits_config', JSON.stringify(config));
      toast.success('Configuración de permisos guardada con éxito.');
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 my-8"
      >
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 text-slate-900 rounded-lg">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Matriz de Configuración de Permisos</h2>
              <p className="text-sm text-slate-400">Niveles de riesgo y flujos de aprobación (ISO 45001 / OSHA)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-8 text-center text-slate-400">Cargando parámetros...</div>
          ) : (
            <div className="space-y-4">
              {TIPO_TRABAJOS.map(tipo => {
                const conf = config[tipo] || { riesgo: 'ALTO', aprobadores: [] };
                return (
                  <div key={tipo} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <ShieldAlert size={16} className="text-amber-500" />
                        {tipo.replace(/_/g, ' ')}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Riesgo:</span>
                        <select 
                          value={conf.riesgo}
                          onChange={(e) => handleRiesgoChange(tipo, e.target.value)}
                          className={cn(
                            "text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors outline-none",
                            conf.riesgo === 'CRITICO' && "bg-red-50 text-red-700 border-red-200",
                            conf.riesgo === 'ALTO' && "bg-orange-50 text-orange-700 border-orange-200",
                            conf.riesgo === 'MEDIO' && "bg-amber-50 text-amber-700 border-amber-200",
                            conf.riesgo === 'BAJO' && "bg-emerald-50 text-emerald-700 border-emerald-200"
                          )}
                        >
                          {NIVELES_RIESGO.map(nr => (
                            <option key={nr} value={nr}>{nr}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                        <Users size={12} /> Aprobadores Requeridos:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {APROBADORES_OPCIONES.map(rol => {
                          const isSelected = conf.aprobadores.includes(rol);
                          return (
                            <button
                              key={rol}
                              type="button"
                              onClick={() => handleAprobadorToggle(tipo, rol)}
                              className={cn(
                                "text-xs px-2.5 py-1 rounded-full font-medium border transition-colors",
                                isSelected 
                                  ? "bg-slate-900 border-slate-900 text-white" 
                                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                              )}
                            >
                              {rol}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            disabled={saving}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-sm transition-colors text-sm"
          >
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
