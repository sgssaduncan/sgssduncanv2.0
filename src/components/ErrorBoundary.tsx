import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó una excepción no controlada:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleClearCache = () => {
    try {
      // Limpiar datos potencialmente corruptos manteniendo credenciales maestras
      const keysToRemove = [
        'sgd_solicitudes_epp',
        'sgd_entregas_epp',
        'sgd_offline_queue'
      ];
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-rose-200 p-6 md:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={32} />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Recuperación Segura SGD Duncan 2.0
              </span>
              <h2 className="text-xl font-bold text-slate-800 mt-2">
                {this.props.fallbackTitle || 'Se detectó una inconsistencia visual en este módulo'}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                El sistema aisló el error para prevenir la pérdida de datos y permitirle continuar operando con normalidad.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-900 text-rose-300 p-3 rounded-xl text-left text-[11px] font-mono overflow-x-auto max-h-32 border border-slate-800">
                <p className="font-bold text-white">{this.state.error.name}: {this.state.error.message}</p>
                {this.state.error.stack && (
                  <p className="text-[10px] text-slate-400 mt-1 whitespace-pre-wrap">{this.state.error.stack.split('\n').slice(0, 3).join('\n')}</p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="bg-duncan-blue hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <RotateCcw size={15} />
                Recargar Módulo
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Home size={15} />
                Ir al Tablero Principal
              </button>

              <button
                onClick={this.handleClearCache}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-rose-200"
                title="Restaura la estructura de datos locales si hay inconsistencias"
              >
                <Trash2 size={15} />
                Limpiar Cache de Dotación
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
