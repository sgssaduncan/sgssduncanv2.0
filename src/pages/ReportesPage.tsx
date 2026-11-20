import React from 'react';
import { FileText } from 'lucide-react';

export default function ReportesPage() {
  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          Reportes y Estadísticas
        </h1>
        <p className="text-sm text-slate-500 mt-1">Generación de informes consolidados PDF/Excel</p>
      </div>
      <div className="card p-10 text-center text-slate-400">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Módulo en construcción</p>
        <p className="text-sm mt-1">Reportes consolidados, gráficas y exportación</p>
      </div>
    </div>
  );
}
