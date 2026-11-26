import './polyfills';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

declare global {
  interface Window {
    __SGD_MOUNTED__?: boolean;
    __SGD_CLEAR_AND_RELOAD__?: (fullReset?: boolean) => void;
  }
}

const rootEl = document.getElementById('root');

if (rootEl) {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    window.__SGD_MOUNTED__ = true;
    try {
      sessionStorage.removeItem('sgd_boot_healed_v1');
      sessionStorage.removeItem('sgd_chunk_reload_once');
    } catch {}
  } catch (err: any) {
    console.error('[SGD Boot] Error crítico montando React:', err);
    rootEl.innerHTML = `
      <div style="min-height:100vh;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,sans-serif;">
        <div style="max-width:420px;width:100%;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:24px;text-align:center;">
          <h2 style="margin:0 0 8px;font-size:18px;font-weight:800;color:#fbbf24;">SGD Duncan 2.0</h2>
          <p style="margin:0 0 16px;font-size:13px;color:#cbd5e1;">No se pudo iniciar la aplicación en este dispositivo (${String(err?.message || 'Error de inicio').replace(/</g, '&lt;')}).</p>
          <button onclick="window.__SGD_CLEAR_AND_RELOAD__ ? window.__SGD_CLEAR_AND_RELOAD__(false) : location.reload()" style="width:100%;padding:12px;border:none;border-radius:10px;background:#f59e0b;color:#0f172a;font-weight:800;font-size:13px;cursor:pointer;">
            Reparar Caché y Recargar
          </button>
        </div>
      </div>
    `;
  }
}
