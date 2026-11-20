import React from 'react';
import { Users } from 'lucide-react';

export default function UsuariosPage() {
  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-xl">
            <Users className="h-6 w-6 text-slate-600" />
          </div>
          Usuarios y Roles
        </h1>
        <p className="text-sm text-slate-500 mt-1">Gestión de acceso al sistema</p>
      </div>
      <div className="card p-10 text-center text-slate-400">
        <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Módulo en construcción</p>
        <p className="text-sm mt-1">Gestión de usuarios, roles y permisos</p>
      </div>
    </div>
  );
}
