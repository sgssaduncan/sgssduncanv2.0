import React from 'react';
import { dbService } from '../services/db';
import type { AuditLog } from '../types';
import { formatDateTime } from '../lib/utils';
import { 
  Activity, 
  Search, 
  Filter, 
  History, 
  User, 
  Globe, 
  ShieldCheck,
  FileText,
  AlertCircle,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AuditLogs() {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  const exportToCSV = () => {
    const headers = ['Fecha', 'Usuario', 'Acción', 'Recurso', 'Detalles'];
    const rows = logs.map(l => [
      formatDateTime(l.timestamp),
      l.userEmail,
      l.action,
      l.resourceType,
      l.details.replace(/,/g, ';') // Simple escape
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auditoria_ssa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await dbService.getAuditLogs();
        if (mounted) {
          setLogs(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading audit logs:', err);
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filteredLogs = logs.filter(log => 
    log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <FileText className="text-emerald-500" size={16} />;
      case 'UPDATE': return <Activity className="text-blue-500" size={16} />;
      case 'DELETE': return <AlertCircle className="text-rose-500" size={16} />;
      default: return <History className="text-slate-400" size={16} />;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
            <ShieldCheck className="text-blue-600" />
            Control de Auditoría
          </h1>
          <p className="text-slate-500 text-sm font-medium">Seguimiento detallado de todas las acciones en el sistema</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
        >
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por usuario, acción o detalle..."
          className="bg-transparent border-none outline-none text-sm w-full font-medium"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha y Hora</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acción</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo Recurso</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-bold text-slate-600">{formatDateTime(log.timestamp)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                        {(log.userEmail || '?')[0]}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{log.userEmail || 'Usuario Anonimo'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {getActionIcon(log.action)}
                      <span className="text-[10px] font-black uppercase tracking-tight">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase">
                      {log.resourceType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs truncate" title={log.details}>
                      {log.details}
                    </p>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 grayscale opacity-50">
                      <Activity size={40} className="text-slate-300" />
                      <p className="text-sm font-bold text-slate-400">No se encontraron registros de auditoría</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Vista móvil (cards) */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
          {filteredLogs.map(log => (
            <div key={log.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                    {(log.userEmail || '?')[0]}
                  </div>
                  <span className="text-xs font-bold text-slate-700 truncate w-32">{log.userEmail || 'Usuario Anonimo'}</span>
                </div>
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{formatDateTime(log.timestamp)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {getActionIcon(log.action)}
                  <span className="text-[10px] font-black uppercase tracking-tight">{log.action}</span>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase">
                  {log.resourceType}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/50 p-2 rounded truncate" title={log.details}>
                {log.details}
              </p>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="py-20 text-center">
              <div className="flex flex-col items-center gap-2 grayscale opacity-50">
                <Activity size={40} className="text-slate-300" />
                <p className="text-sm font-bold text-slate-400">No se encontraron registros de auditoría</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
