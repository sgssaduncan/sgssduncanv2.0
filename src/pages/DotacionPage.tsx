import React from 'react';
import { Package, AlertCircle } from 'lucide-react';

export default function DotacionPage() {
  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-xl">
            <Package className="h-6 w-6 text-purple-600" />
          </div>
          Dotación EPP
        </h1>
        <p className="text-sm text-slate-500 mt-1">Gestión de Equipos de Protección Personal</p>
      </div>
      <div className="card p-10 text-center text-slate-400">
        <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Módulo en construcción</p>
        <p className="text-sm mt-1">Este módulo estará disponible próximamente</p>
      </div>
    </div>
  );
}
