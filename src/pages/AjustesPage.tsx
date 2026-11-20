import React, { useState } from 'react';
import { useSGD } from '../contexts/SGDContext';
import { Settings, Save, ExternalLink, Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { isSheetsConfigured } from '../lib/googleSheetsClient';
import toast from 'react-hot-toast';

export default function AjustesPage() {
  const { sheetsUrl, updateSheetsUrl, isOnline, pendingSyncCount, isSyncing, syncNow, refreshData } = useSGD();
  const [urlInput, setUrlInput] = useState(sheetsUrl);
  const [testando, setTestando] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'error' | null>(null);

  const handleSave = () => {
    updateSheetsUrl(urlInput.trim());
    toast.success('URL de Google Sheets guardada');
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!urlInput.trim()) { toast.error('Ingresa la URL primero'); return; }
    setTestando(true);
    setTestResult(null);
    try {
      const res = await fetch(`${urlInput.trim()}?action=ping`);
      if (res.ok) { setTestResult('ok'); toast.success('Conexión exitosa con Google Sheets'); }
      else { setTestResult('error'); toast.error('Error de conexión con Google Sheets'); }
    } catch {
      setTestResult('error');
      toast.error('No se pudo conectar. Verifica la URL.');
    } finally { setTestando(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-xl">
            <Settings className="h-6 w-6 text-slate-600" />
          </div>
          Ajustes del Sistema
        </h1>
        <p className="text-sm text-slate-500 mt-1">Configura la conexión con Google Sheets y otras opciones</p>
      </div>

      {/* Estado de conexión */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          {isOnline ? <Wifi className="h-5 w-5 text-emerald-500" /> : <WifiOff className="h-5 w-5 text-amber-500" />}
          Estado de Conexión
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-700">Internet</span>
            <span className={`badge ${isOnline ? 'badge-green' : 'badge-yellow'}`}>
              {isOnline ? '✓ En línea' : '⚠ Sin conexión'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-700">Google Sheets</span>
            <span className={`badge ${isSheetsConfigured() ? 'badge-green' : 'badge-gray'}`}>
              {isSheetsConfigured() ? '✓ Configurado' : 'No configurado'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-700">Cola offline</span>
            <span className={`badge ${pendingSyncCount > 0 ? 'badge-yellow' : 'badge-green'}`}>
              {pendingSyncCount > 0 ? `${pendingSyncCount} pendiente(s)` : '✓ Sincronizado'}
            </span>
          </div>
        </div>
        {pendingSyncCount > 0 && isOnline && (
          <button onClick={syncNow} disabled={isSyncing}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : `Sincronizar ahora (${pendingSyncCount})`}
          </button>
        )}
      </div>

      {/* Configuración Google Sheets */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-slate-900">🔗 Conexión con Google Sheets</h2>
          <p className="text-xs text-slate-500 mt-1">Backend gratuito para almacenar todos los datos en la nube</p>
        </div>
        <div className="card-body space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 space-y-2">
            <p className="font-medium flex items-center gap-2"><Info className="h-4 w-4" /> ¿Cómo configurar?</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Crea una copia del <strong>Google Sheets plantilla</strong> en tu Google Drive</li>
              <li>Abre el <strong>Editor de Apps Script</strong> (Extensiones → Apps Script)</li>
              <li>Pega el código <code>Code.gs</code> proporcionado y despliega como <strong>Web App</strong></li>
              <li>Copia la URL generada y pégala aquí abajo</li>
            </ol>
            <a href="https://script.google.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-700 hover:underline font-medium text-xs">
              Abrir Google Apps Script <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div>
            <label className="label">URL del Web App de Google Apps Script</label>
            <input type="url" className="input font-mono text-xs"
              placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
              value={urlInput} onChange={e => setUrlInput(e.target.value)} />
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${testResult === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {testResult === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {testResult === 'ok' ? 'Conexión exitosa con Google Sheets' : 'No se pudo conectar. Verifica la URL.'}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleTest} disabled={testando || !urlInput.trim()} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              {testando ? <span className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full" /> : <Wifi className="h-4 w-4" />}
              Probar conexión
            </button>
            <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Save className="h-4 w-4" /> Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Acciones de datos */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-slate-900">🗃️ Datos Locales</h2>
        </div>
        <div className="card-body space-y-3">
          <button onClick={refreshData} className="btn-secondary w-full flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4" /> Recargar datos desde servidor
          </button>
          <button
            onClick={() => {
              if (confirm('¿Estás seguro de limpiar todos los datos locales? Esta acción no se puede deshacer.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            🗑️ Limpiar datos locales (caché)
          </button>
        </div>
      </div>

      {/* Info de la app */}
      <div className="card p-5 text-center text-sm text-slate-500 space-y-1">
        <p className="font-medium text-slate-700">SGD Duncan 2.0</p>
        <p>Sistema de Gestión Digital — SSA Duncan</p>
        <p>Backend: Google Sheets · Deploy: Vercel</p>
        <p className="text-xs">© 2026 ErgoExpress C.A. — Todos los derechos reservados</p>
      </div>
    </div>
  );
}
