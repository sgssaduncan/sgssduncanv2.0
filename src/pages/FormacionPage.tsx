import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Award, 
  Clock, 
  ShieldAlert, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  X,
  Save,
  Truck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { dbService } from '../services/db';
import type { CapacitacionRegistro, TipoCapacitacion, EstatusVigenciaCapacitacion } from '../types/training';
import { exportCurrentViewData } from '../lib/exportUtils';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function FormacionPage() {
  const { profile } = useAuth();
  const [capacitaciones, setCapacitaciones] = useState<CapacitacionRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<CapacitacionRegistro | null>(null);

  // Form State
  const [tipo, setTipo] = useState<TipoCapacitacion>('RACDA_MATERIALES_PELIGROSOS');
  const [titulo, setTitulo] = useState('Manejo y Transporte Seguro de Sustancias y Materiales Peligrosos (RACDA)');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [duracionHoras, setDuracionHoras] = useState<number>(8);
  const [instructor, setInstructor] = useState('Ing. Francisco Rojas');
  const [sedeNombre, setSedeNombre] = useState('Distribuidora Duncan Caracas');
  const [participantesTexto, setParticipantesTexto] = useState(
    'José Ramón Hernández - V-12450891 - Chofer\nLuis Alberto Gómez - V-16890451 - Chofer\nCarlos Eduardo Mendoza - V-15892341 - Técnico'
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dbService.getCapacitaciones();
      setCapacitaciones(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar capacitaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCurso = async () => {
    if (!titulo || !instructor) {
      toast.error('Complete los datos obligatorios del curso.');
      return;
    }

    try {
      // Para choferes, la vigencia RACDA es cada 2 meses (60 días) según INCLUSIONES V2
      const diasVigencia = tipo === 'RACDA_MATERIALES_PELIGROSOS' ? 60 : 365;
      const fechaVence = new Date(Date.now() + diasVigencia * 86400000).toISOString().split('T')[0];

      const parts = participantesTexto.split('\n').filter(Boolean).map((line, idx) => {
        const segs = line.split('-').map(s => s.trim());
        const esChofer = (segs[2] || '').toLowerCase().includes('chofer') || tipo.includes('RACDA');
        return {
          empleadoId: `emp_part_${idx}`,
          nombre: segs[0] || 'Trabajador',
          cedula: segs[1] || 'V-00000000',
          cargo: segs[2] || 'Personal Operativo',
          esChofer,
          asistio: true,
          calificacion: 19,
          aprobado: true,
          fechaVencimiento: fechaVence
        };
      });

      await dbService.saveCapacitacion({
        tipo,
        titulo,
        fechaEjecucion: fecha,
        duracionHoras,
        instructorNombre: instructor,
        enteCapacitador: 'INTERNO_SSA',
        sedeNombre,
        participantes: parts
      });

      toast.success('Capacitación registrada con semáforo de vigencia actualizado.');
      setIsModalOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar capacitación');
    }
  };

  const handleExport = (format: 'excel' | 'csv') => {
    if (capacitaciones.length === 0) {
      toast.error('No hay capacitaciones para exportar');
      return;
    }
    const rows: any[] = [];
    capacitaciones.forEach(c => {
      c.participantes.forEach(p => {
        rows.push({
          'Código': c.codigoCurso,
          'Curso': c.titulo,
          'Tipo': c.tipo,
          'Fecha Ejecución': c.fechaEjecucion,
          'Horas': c.duracionHoras,
          'Instructor': c.instructorNombre,
          'Sede': c.sedeNombre,
          'Participante': p.nombre,
          'Cédula': p.cedula,
          'Cargo': p.cargo,
          'Es Chofer': p.esChofer ? 'SÍ' : 'NO',
          'Vencimiento RACDA/Curso': p.fechaVencimiento,
          'Calificación': p.calificacion || 20
        });
      });
    });

    exportCurrentViewData(rows, format, `Matriz_Capacitaciones_RACDA_Duncan_${new Date().toISOString().split('T')[0]}`);
    toast.success(`Exportados ${rows.length} registros a ${format === 'excel' ? 'Excel' : 'CSV'}`);
  };

  const filtered = capacitaciones.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.titulo.toLowerCase().includes(q) ||
      c.codigoCurso.toLowerCase().includes(q) ||
      c.sedeNombre.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-400 text-slate-900 rounded-xl shadow-sm">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Formación, Inducción y RACDA</h1>
            <p className="text-sm text-slate-500">
              Control Obligatorio RACDA para Choferes (cada 2 meses), Manejo Defensivo y Montacargas Duncan
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Export Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm"
              title="Exportar a Excel"
            >
              <FileSpreadsheet size={14} />
              Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
              title="Exportar a CSV"
            >
              <FileText size={14} />
              CSV
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl font-bold text-sm shadow-sm transition-colors ml-auto md:ml-0"
          >
            <Plus size={18} />
            Nueva Capacitación
          </button>
        </div>
      </div>

      {/* Alerta Destacada RACDA Choferes */}
      <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-start gap-3">
        <Truck size={20} className="text-yellow-700 shrink-0 mt-0.5" />
        <div className="text-xs text-yellow-900">
          <span className="font-bold">Protocolo de Transporte de Materiales Peligrosos (RACDA Baterías Duncan):</span>
          <p className="mt-0.5">
            Los choferes que transportan ácido y plomo deben renovar su certificación de inducción RACDA cada 60 días (2 meses). Semáforo Verde (&gt;15 días), Amarillo (&lt;15 días), Rojo (Vencido - Salida bloqueada).
          </p>
        </div>
      </div>

      {/* Grid of Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div
            key={c.id}
            onClick={() => setSelectedCurso(c)}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer space-y-3"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg">
                {c.codigoCurso}
              </span>
              <span className="text-xs font-semibold text-slate-400">{c.fechaEjecucion}</span>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 text-base">{c.titulo}</h3>
              <div className="text-xs text-slate-500 mt-1">Instructor: {c.instructorNombre} • {c.duracionHoras}h</div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Sede:</span>
                <span className="font-semibold text-slate-700">{c.sedeNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Participantes:</span>
                <span className="font-bold text-emerald-700">{c.participantes.length} aprobados</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs text-yellow-600 font-bold">
              <span>Ver Certificaciones</span>
              <span>&rarr;</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nueva Capacitacion */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 my-8"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Registro de Capacitación y Matriz RACDA</h2>
                <p className="text-sm text-slate-400">Control de Horas Hombre Formadas y Semáforo de Vigencia</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Tipo de Capacitación</label>
                <select
                  value={tipo}
                  onChange={(e) => {
                    const t = e.target.value as TipoCapacitacion;
                    setTipo(t);
                    if (t === 'RACDA_MATERIALES_PELIGROSOS') {
                      setTitulo('Manejo y Transporte Seguro de Sustancias y Materiales Peligrosos (RACDA)');
                    } else if (t === 'MANEJO_DEFENSIVO') {
                      setTitulo('Manejo Defensivo y Seguridad Vial para Transporte de Carga');
                    } else if (t === 'MONTACARGAS_SEGURO') {
                      setTitulo('Operación Segura de Montacargas y Manipulación de Paletas');
                    }
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                >
                  <option value="RACDA_MATERIALES_PELIGROSOS">RACDA Materiales Peligrosos (Cada 2 meses)</option>
                  <option value="MANEJO_DEFENSIVO">Manejo Defensivo</option>
                  <option value="MONTACARGAS_SEGURO">Operación de Montacargas SSA</option>
                  <option value="INDUCCION_NUEVO_INGRESO">Inducción General Nuevo Ingreso</option>
                  <option value="PREVENCION_INCENDIOS_EXTINTORES">Uso de Extintores y Control de Incendios</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Título del Curso *</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Duración (Horas)</label>
                  <input
                    type="number"
                    value={duracionHoras}
                    onChange={(e) => setDuracionHoras(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Instructor SSA</label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Participantes (Nombre - Cédula - Cargo, uno por línea)
                </label>
                <textarea
                  rows={4}
                  value={participantesTexto}
                  onChange={(e) => setParticipantesTexto(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCurso}
                className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-sm text-sm"
              >
                <Save size={16} />
                Guardar Capacitación
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
