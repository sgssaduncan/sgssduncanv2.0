import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import type { EvaluacionMedica } from '../types/medical';
import { Activity, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';

interface Props {
  evaluaciones: EvaluacionMedica[];
}

const COLORS = ['#e11d48', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#475569'];

export default function MedicalEvaluationsCharts({ evaluaciones }: Props) {
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      'SOLICITADA': 0,
      'AGENDADA': 0,
      'REALIZADA': 0,
      'CANCELADA': 0
    };
    evaluaciones.forEach(ev => {
      if (counts[ev.estado] !== undefined) {
        counts[ev.estado]++;
      } else {
        counts[ev.estado] = 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }));
  }, [evaluaciones]);

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    evaluaciones.forEach(ev => {
      const label = ev.tipoEvaluacion.replace(/_/g, ' ');
      counts[label] = (counts[label] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [evaluaciones]);

  const monthData = useMemo(() => {
    const counts: Record<string, number> = {};
    evaluaciones.forEach(ev => {
      const date = new Date(ev.fechaSolicitud);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      counts[monthYear] = (counts[monthYear] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-6); // last 6 months
  }, [evaluaciones]);


  if (evaluaciones.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner mb-6 space-y-6">
      <div className="flex items-center gap-2 mb-4 text-slate-800">
        <Activity size={20} className="text-rose-600" />
        <h2 className="text-lg font-black uppercase tracking-widest">Estadísticas de Salud Ocupacional</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Distribucion por Estado */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2 mb-4">
            <PieChartIcon size={16} /> Por Estado
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribucion por Tipo */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2 mb-4">
            <BarChart2 size={16} /> Por Tipo de Evaluación
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

         {/* Tendencia Temporal */}
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2 mb-4">
            <BarChart2 size={16} /> Evolución (Últimos Meses)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
