import React from 'react';
import { Lock } from 'lucide-react';

export default function LotoPage() {
  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>
          LOTO — Lockout / Tagout
        </h1>
        <p className="text-sm text-slate-500 mt-1">Control de energías peligrosas</p>
      </div>
      <div className="card p-10 text-center text-slate-400">
        <Lock className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Módulo en construcción</p>
        <p className="text-sm mt-1">Gestión de equipos LOTO, bloqueos y capacitaciones</p>
      </div>
    </div>
  );
}
