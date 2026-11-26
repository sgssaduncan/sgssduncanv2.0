import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  Clock, 
  User, 
  Eye, 
  X, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Globe, 
  Terminal, 
  Layers, 
  RefreshCw 
} from 'lucide-react';
import { auditService } from '../services/auditService';
import type { 
  AuditLogEntry, 
  AuditModule, 
  AuditAction, 
  AuditSeverity 
} from '../types/audit';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const MODULOS: { id: AuditModule | 'TODOS'; label: string }[] = [
  { id: 'TODOS', label: 'Todos los Módulos' },
  { id: 'AUTENTICACION', label: 'Autenticación & Sesión' },
  { id: 'NAVEGACION', label: 'Navegación / Vistas' },
  { id: 'INSPECCIONES', label: 'Inspecciones Técnicas' },
  { id: 'SALUD_OCUPACIONAL', label: 'Salud Ocupacional (V-EXPRESS)' },
  { id: 'ACCIDENTES_F465', label: 'Accidentes F-465 & Árbol de Causas' },
  { id: 'DOTACION_EPP', label: 'Dotación EPP & Uniformes' },
  { id: 'TRANSPORTE_FLOTA', label: 'Transporte & Control Carga' },
  { id: 'CARGA_FUEGO', label: 'Carga de Fuego & Extintores' },
  { id: 'LOTO_PERMISOS', label: 'LOTO & Permisos PTAR' },
  { id: 'COMITES_CSSL', label: 'Comités CSSL & Delegados' },
  { id: 'REPORTES_EXPORTACIONES', label: 'Reportes & Exportaciones' },
  { id: 'USUARIOS_SEGURIDAD', label: 'Usuarios & Seguridad' },
  { id: 'CONFIGURACION_SISTEMA', label: 'Configuración & Sistema' }
];

const SEVERIDADES: { id: AuditSeverity | 'TODAS'; label: string; color: string }[] = [
  { id: 'TODAS', label: 'Todas', color: 'bg-slate-100 text-slate-700' },
  { id: 'INFO', label: 'Info', color: 'bg-blue-100 text-blue-700' },
  { id: 'AVISO', label: 'Aviso', color: 'bg-amber-100 text-amber-700' },
  { id: 'CRITICO', label: 'Crítico', color: 'bg-orange-100 text-orange-700' },
  { id: 'SEGURIDAD', label: 'Seguridad', color: 'bg-red-100 text-red-700' }
];

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduloFiltro, setModuloFiltro] = useState<AuditModule | 'TODOS'>('TODOS');
  const [severidadFiltro, setSeveridadFiltro] = useState<AuditSeverity | 'TODAS'>('TODAS');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    loadLogs();

    // Escuchar eventos en vivo
    const handleNewEvent = (e: any) => {
      if (e.detail) {
        setLogs(prev => [e.detail, ...prev]);
      }
    };
    window.addEventListener('sgd_audit_event_logged', handleNewEvent);
    return () => window.removeEventListener('sgd_audit_event_logged', handleNewEvent);
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await auditService.getLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
      toast.error('Error cargando registros de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const filtrados = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      l.usuarioNombre.toLowerCase().includes(q) ||
      l.usuarioEmail.toLowerCase().includes(q) ||
      l.descripcion.toLowerCase().includes(q) ||
      (l.entidadCodigo && l.entidadCodigo.toLowerCase().includes(q)) ||
      (l.entidadId && l.entidadId.toLowerCase().includes(q)) ||
      l.modulo.toLowerCase().includes(q) ||
      l.accion.toLowerCase().includes(q);

    const matchModulo = moduloFiltro === 'TODOS' || l.modulo === moduloFiltro;
    const matchSeveridad = severidadFiltro === 'TODAS' || l.severidad === severidadFiltro;

    return matchSearch && matchModulo && matchSeveridad;
  });

  // Métricas
  const totalEventos = logs.length;
  const totalCriticos = logs.filter(l => l.severidad === 'CRITICO' || l.severidad === 'SEGURIDAD').length;
  const totalDescargas = logs.filter(l => l.accion === 'DESCARGAR_PDF' || l.accion === 'EXPORTAR_EXCEL' || l.accion === 'EXPORTAR_CSV').length;
  const usuariosUnicos = Array.from(new Set(logs.map(l => l.usuarioId))).length;

  const handleExportExcel = async () => {
    try {
      await auditService.exportToExcel(filtrados);
      toast.success('Bitácora de auditoría exportada a Excel');
    } catch (e) {
      console.error(e);
      toast.error('Error exportando auditoría');
    }
  };

  const handleExportCSV = async () => {
    try {
      await auditService.exportToCSV(filtrados);
      toast.success('Bitácora exportada a CSV');
    } catch (e) {
      console.error(e);
      toast.error('Error exportando auditoría');
    }
  };

  const handleExportPDF = async () => {
    try {
      const doc = await auditService.generateAuditReportPDF(filtrados, `${moduloFiltro !== 'TODOS' ? moduloFiltro : 'Todos'} • ${severidadFiltro !== 'TODAS' ? severidadFiltro : 'Todas'}`);
      doc.save(`SGD_Duncan_Certificado_Auditoria_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('Certificado Oficial de Auditoría en PDF generado');
    } catch (e) {
      console.error(e);
      toast.error('Error generando certificado PDF');
    }
  };

  const getSeveridadBadge = (sev: AuditSeverity) => {
    switch (sev) {
      case 'INFO':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'AVISO':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CRITICO':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'SEGURIDAD':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDeviceIcon = (disp: string) => {
    if (disp === 'Mobile') return <Smartphone size={13} className="text-slate-400" />;
    if (disp === 'Tablet') return <Tablet size={13} className="text-slate-400" />;
    return <Laptop size={13} className="text-slate-400" />;
  };

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* Header Institucional */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-yellow-400 rounded-xl shadow-sm">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">Centro de Auditoría Forense & Trazabilidad</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-yellow-400 border border-slate-800">
                INMUTABLE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro cronológico ininterrumpido de accesos, mutaciones de datos, firmas digitales y descargas oficiales
            </p>
          </div>
        </div>

        {/* Acciones de exportación */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={loadLogs}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200"
            title="Recargar bitácora"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <FileText size={15} /> CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-yellow-400 rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Download size={15} /> Certificado PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Total Eventos</span>
            <Activity size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalEventos.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">Trazabilidad activa 100%</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Eventos Críticos / Alertas</span>
            <AlertTriangle size={16} className="text-orange-500" />
          </div>
          <div className="text-2xl font-black text-orange-600">{totalCriticos}</div>
          <div className="text-[11px] text-slate-400">Mutaciones y alertas legales</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Documentos Descargados</span>
            <Download size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{totalDescargas}</div>
          <div className="text-[11px] text-slate-400">PDFs y reportes exportados</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Usuarios Auditados</span>
            <User size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">{usuariosUnicos}</div>
          <div className="text-[11px] text-slate-400">Cuentas con actividad registrada</div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por usuario, correo, descripción, código de inspección o referencia..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={moduloFiltro}
              onChange={e => setModuloFiltro(e.target.value as any)}
              className="select text-xs py-2 px-3 border border-slate-200 rounded-xl"
            >
              {MODULOS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtros de Severidad por Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
            <Filter size={13} /> Severidad:
          </span>
          {SEVERIDADES.map(s => (
            <button
              key={s.id}
              onClick={() => setSeveridadFiltro(s.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                severidadFiltro === s.id
                  ? "bg-slate-900 text-yellow-400 shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              )}
            >
              {s.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">
            {filtrados.length} evento(s) encontrado(s)
          </span>
        </div>
      </div>

      {/* Tabla de Eventos de Auditoría */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Cargando bitácora de trazabilidad...
          </div>
        ) : filtrados.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <ShieldCheck size={36} className="mx-auto opacity-30 text-slate-400" />
            <p className="font-semibold text-sm text-slate-600">No se encontraron eventos con los filtros aplicados</p>
            <p className="text-xs text-slate-400">Intenta restablecer la búsqueda o cambiar los módulos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Usuario Responsable</th>
                  <th className="py-3 px-4">Módulo</th>
                  <th className="py-3 px-4">Acción</th>
                  <th className="py-3 px-4">Severidad</th>
                  <th className="py-3 px-4">Descripción del Suceso</th>
                  <th className="py-3 px-4">Dispositivo</th>
                  <th className="py-3 px-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map(l => (
                  <tr 
                    key={l.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => setSelectedLog(l)}
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {l.fechaFormateada}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{l.usuarioNombre}</div>
                      <div className="text-[10px] text-slate-400">{l.usuarioRol} • {l.usuarioEmail}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {l.modulo.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[10px]">
                        {l.accion.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border", getSeveridadBadge(l.severidad))}>
                        {l.severidad}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <div className="text-slate-800 line-clamp-2 leading-relaxed">
                        {l.descripcion}
                      </div>
                      {l.entidadCodigo && (
                        <span className="inline-block mt-0.5 text-[10px] font-mono text-blue-600 bg-blue-50 px-1 rounded">
                          Ref: {l.entidadCodigo}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {getDeviceIcon(l.dispositivo)}
                        <span>{l.dispositivo}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(l);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalle forense completo"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalle Forense del Evento */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 my-8"
            >
              {/* Header Modal */}
              <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-yellow-400">{selectedLog.id}</span>
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border", getSeveridadBadge(selectedLog.severidad))}>
                      {selectedLog.severidad}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{selectedLog.descripcion}</h3>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenido Técnico */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
                {/* Cuadrícula de metadatos */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px]">FECHA Y HORA LOCAL:</span>
                    <span className="font-bold text-slate-800">{selectedLog.fechaFormateada}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px]">TIMESTAMP ISO:</span>
                    <span className="font-mono text-[11px] text-slate-700">{selectedLog.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px]">USUARIO IDENTIFICADO:</span>
                    <span className="font-bold text-slate-800">{selectedLog.usuarioNombre}</span>
                    <span className="block text-slate-500 text-[10px]">{selectedLog.usuarioEmail} ({selectedLog.usuarioRol})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px]">SEDE / EMPRESA:</span>
                    <span className="font-semibold text-slate-800">{selectedLog.usuarioSede || 'N/A'}</span>
                    <span className="block text-slate-500 text-[10px]">{selectedLog.usuarioEmpresa || 'Duncan'}</span>
                  </div>
                </div>

                {/* Módulo y Entidad */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div>
                    <span className="text-blue-900/60 block font-semibold text-[10px]">MÓDULO:</span>
                    <span className="font-bold text-blue-950">{selectedLog.modulo}</span>
                  </div>
                  <div>
                    <span className="text-blue-900/60 block font-semibold text-[10px]">ACCIÓN OPERACIONAL:</span>
                    <span className="font-bold text-blue-950">{selectedLog.accion}</span>
                  </div>
                  <div>
                    <span className="text-blue-900/60 block font-semibold text-[10px]">TIPO DE ENTIDAD:</span>
                    <span className="font-semibold text-blue-900">{selectedLog.entidadTipo}</span>
                  </div>
                  <div>
                    <span className="text-blue-900/60 block font-semibold text-[10px]">ID / REFERENCIA:</span>
                    <span className="font-mono text-blue-900">{selectedLog.entidadCodigo || selectedLog.entidadId || '—'}</span>
                  </div>
                </div>

                {/* Datos del Cliente y Entorno */}
                <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-semibold text-[10px]">FIRMA DIGITAL DEL DISPOSITIVO & RED:</span>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      {getDeviceIcon(selectedLog.dispositivo)} {selectedLog.dispositivo} ({selectedLog.plataforma})
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-600 font-mono">IP: {selectedLog.ip || '192.168.1.100'}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-600">Estado: {selectedLog.online ? 'En Línea' : 'Offline'}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate pt-1">
                    UA: {selectedLog.userAgent}
                  </div>
                  {selectedLog.ruta && (
                    <div className="text-[10px] text-slate-600 pt-0.5">
                      Ruta URL activa: <strong className="font-mono text-blue-600">{selectedLog.ruta}</strong>
                    </div>
                  )}
                </div>

                {/* Payload JSON de Detalles */}
                {selectedLog.detalles && Object.keys(selectedLog.detalles).length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                      <Terminal size={14} className="text-blue-600" /> Carga Útil Técnica (Payload / Diff):
                    </div>
                    <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-slate-800">
                      {JSON.stringify(selectedLog.detalles, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
