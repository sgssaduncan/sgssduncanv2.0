import React from 'react';
import { Stethoscope } from 'lucide-react';

export default function MedicoPage() {
  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-xl">
            <Stethoscope className="h-6 w-6 text-teal-600" />
          </div>
          Evaluaciones Médicas Ocupacionales
        </h1>
        <p className="text-sm text-slate-500 mt-1">Control de evaluaciones médicas del personal</p>
      </div>
      <div className="card p-10 text-center text-slate-400">
        <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Módulo en construcción</p>
        <p className="text-sm mt-1">Próximamente disponible</p>
      </div>
    </div>
  );
}
