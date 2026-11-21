import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BriefcaseMedical, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Building2, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  X, 
  Save, 
  Stethoscope, 
  Share2,
  FileCheck2
} from 'lucide-react';
import type { RegistroReferenciaMedica } from '../types/medical';
import { dbService } from '../services/db';
import { exportCurrentViewData } from '../lib/exportUtils';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function VexpressReferenciasManager() {
  const [referencias, setReferencias] = useState<RegistroReferenciaMedica[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReferencia, setSelectedReferencia] = useState<RegistroReferenciaMedica | null>(null);

  // Form State
  const [cedula, setCedula] = useState('');
  const [nombreApellido, setNombreApellido] = useState('');
  const [genero, setGenero] = useState('MASCULINO');
  const [edad, setEdad] = useState<number>(35);
  const [empresaNombre, setEmpresaNombre] = useState('ACUMULADORES DUNCAN, C.A.');
  const [sucursal, setSucursal] = useState('LOS RUICES');
  const [departamento, setDepartamento] = useState('PRODUCCIÓN Y CARGA');
  const [cargo, setCargo] = useState('TÉCNICO OPERATIVO');
  
  const [especialidad, setEspecialidad] = useState('Traumatología');
  const [centroSaludSugerido, setCentroSaludSugerido] = useState('Centro Médico Docente / IVSS');
  const [motivoReferencia, setMotivoReferencia] = useState('');
  const [resumenClinico, setResumenClinico] = useState('');
  const [diagnosticoPresuntivo, setDiagnosticoPresuntivo] = useState('');
  const [examenesParaclinicosAnexos, setExamenesParaclinicosAnexos] = useState('');
  const [medicoRemitente, setMedicoRemitente] = useState('Dra. Carmen Ismelda Ramos Martínez');
  const [ciMedico, setCiMedico] = useState('6211215');
  const [numeroMSDS, setNumeroMSDS] = useState('43739');
  const [numeroCMV, setNumeroCMV] = useState('17585');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dbService.getReferenciasMedicas();
      setReferencias(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar referencias médicas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim() || !nombreApellido.trim() || !motivoReferencia.trim()) {
      toast.error('Complete los datos obligatorios de la referencia médica.');
      return;
    }

    try {
      await dbService.saveReferenciaMedica({
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cedula: cedula.trim(),
        nombreApellido: nombreApellido.trim().toUpperCase(),
        genero,
        edad: Number(edad),
        empresaNombre,
        sucursal,
        departamento,
        cargo: cargo.trim().toUpperCase(),
        especialidad,
        centroSaludSugerido: centroSaludSugerido.trim(),
        motivoReferencia: motivoReferencia.trim(),
        resumenClinico: resumenClinico.trim(),
        diagnosticoPresuntivo: diagnosticoPresuntivo.trim(),
        examenesParaclinicosAnexos: examenesParaclinicosAnexos.trim(),
        medicoRemitente: medicoRemitente.trim(),
        ciMedico: ciMedico.trim(),
        numeroMSDS: numeroMSDS.trim(),
        numeroCMV: numeroCMV.trim()
      });

      toast.success('Referencia a especialista registrada exitosamente');
      setIsModalOpen(false);
      resetForm();
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar referencia');
    }
  };

  const resetForm = () => {
    setCedula('');
    setNombreApellido('');
    setMotivoReferencia('');
    setResumenClinico('');
    setDiagnosticoPresuntivo('');
    setExamenesParaclinicosAnexos('');
  };

  const filteredReferencias = referencias.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      (r.nombreApellido || '').toLowerCase().includes(q) ||
      (r.cedula || '').toLowerCase().includes(q) ||
      (r.especialidad || '').toLowerCase().includes(q) ||
      (r.sucursal || '').toLowerCase().includes(q) ||
      (r.diagnosticoPresuntivo || '').toLowerCase().includes(q)
    );
  });

  const handleExport = (format: 'excel' | 'csv') => {
    if (filteredReferencias.length === 0) {
      toast.error('No hay referencias en la vista actual');
      return;
    }
    const data = filteredReferencias.map(r => ({
      Fecha: r.fecha,
      Hora: r.hora,
      Cedula: r.cedula,
      Trabajador: r.nombreApellido,
      Sucursal: r.sucursal,
      Departamento: r.departamento,
      Cargo: r.cargo,
      Especialidad: r.especialidad,
      Centro_Salud: r.centroSaludSugerido,
      Motivo: r.motivoReferencia,
      Diagnostico_Presuntivo: r.diagnosticoPresuntivo,
      Medico_Remitente: r.medicoRemitente
    }));
    exportCurrentViewData(data, format, `Control_Referencias_Especialistas_Duncan_${new Date().toISOString().split('T')[0]}`);
    toast.success(`Exportados ${filteredReferencias.length} registros`);
  };

  return (
    <div className="space-y-6">
      {/* Acciones y Búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cédula, trabajador, especialidad o diagnóstico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 text-xs w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-sm"
              title="Exportar a Excel"
            >
              <FileSpreadsheet size={14} /> Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs"
              title="Exportar a CSV"
            >
              <FileText size={14} /> CSV
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-xs py-2 px-4 shadow-sm"
          >
            <Plus size={16} /> Nueva Referencia
          </button>
        </div>
      </div>

      {/* Tabla de Referencias */}
      <div className="card shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Trabajador / Cédula</th>
                <th className="p-3">Sucursal / Dpto</th>
                <th className="p-3">Especialidad Remitida</th>
                <th className="p-3">Diagnóstico Presuntivo</th>
                <th className="p-3">Centro Asistencial</th>
                <th className="p-3">Médico SSST</th>
                <th className="p-3 text-right">Formato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Cargando referencias médicas...
                  </td>
                </tr>
              ) : filteredReferencias.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No se encontraron referencias médicas registradas
                  </td>
                </tr>
              ) : (
                filteredReferencias.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-600 whitespace-nowrap">
                      {item.fecha}
                      <span className="block text-[10px] text-slate-400">{item.hora}</span>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{item.nombreApellido}</p>
                      <p className="text-[11px] text-slate-500 font-mono">V-{item.cedula} • {item.cargo}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">{item.sucursal}</p>
                      <p className="text-[11px] text-slate-500">{item.departamento}</p>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 text-[11px]">
                        {item.especialidad}
                      </span>
                    </td>
                    <td className="p-3 max-w-[220px]">
                      <p className="font-medium text-slate-800 truncate" title={item.diagnosticoPresuntivo}>
                        {item.diagnosticoPresuntivo}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{item.motivoReferencia}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-slate-700 font-medium">{item.centroSaludSugerido || 'IVSS / Público'}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-slate-700 font-medium">{item.medicoRemitente}</p>
                      <p className="text-[10px] text-slate-400">CMV: {item.numeroCMV || '17585'}</p>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedReferencia(item)}
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold border border-slate-200 inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Printer size={13} /> Formato
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Referencia */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden my-8"
            >
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <BriefcaseMedical className="text-yellow-400" size={20} />
                  <h3 className="font-bold text-base">Referencia Médica a Especialista (REG_REFERENCIA)</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
                {/* Datos del Paciente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label font-bold text-slate-700">Cédula de Identidad *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Ej: 15892341"
                      value={cedula}
                      onChange={e => setCedula(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label font-bold text-slate-700">Nombres y Apellidos *</label>
                    <input
                      type="text"
                      className="input uppercase"
                      placeholder="Nombre del trabajador"
                      value={nombreApellido}
                      onChange={e => setNombreApellido(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="label font-bold text-slate-700">Género</label>
                    <select className="select" value={genero} onChange={e => setGenero(e.target.value)}>
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMENINO">Femenino</option>
                    </select>
                  </div>
                  <div>
                    <label className="label font-bold text-slate-700">Edad</label>
                    <input
                      type="number"
                      className="input"
                      value={edad}
                      onChange={e => setEdad(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="label font-bold text-slate-700">Sucursal / Sede</label>
                    <input
                      type="text"
                      className="input uppercase"
                      value={sucursal}
                      onChange={e => setSucursal(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label font-bold text-slate-700">Departamento</label>
                    <input
                      type="text"
                      className="input uppercase"
                      value={departamento}
                      onChange={e => setDepartamento(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label font-bold text-slate-700">Especialidad Requerida *</label>
                    <select className="select font-bold text-blue-900" value={especialidad} onChange={e => setEspecialidad(e.target.value)}>
                      <option value="Traumatología">Traumatología y Ortopedia</option>
                      <option value="Oftalmología">Oftalmología Ocupacional</option>
                      <option value="Cardiología">Cardiología</option>
                      <option value="Neumonología">Neumonología</option>
                      <option value="Otorrinolaringología">Otorrinolaringología (Audiología)</option>
                      <option value="Medicina Interna">Medicina Interna</option>
                      <option value="Toxicología (Plomo / Ácidos)">Toxicología Ocupacional (Plomo / Ácido)</option>
                      <option value="Dermatología">Dermatología</option>
                      <option value="Neurología">Neurología</option>
                      <option value="Fisiatría / Terapia Física">Fisiatría / Rehabilitación</option>
                    </select>
                  </div>
                  <div>
                    <label className="label font-bold text-slate-700">Centro Asistencial Sugerido</label>
                    <input
                      type="text"
                      className="input"
                      value={centroSaludSugerido}
                      onChange={e => setCentroSaludSugerido(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label font-bold text-slate-700">Motivo de la Referencia *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej: Evaluación especializada por lumbago incapacitante recurrente..."
                    value={motivoReferencia}
                    onChange={e => setMotivoReferencia(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="label font-bold text-slate-700">Resumen Clínico y Hallazgos Relevantes</label>
                  <textarea
                    className="input resize-none"
                    rows={3}
                    placeholder="Antecedentes, sintomatología actual, evolución y tratamientos administrados..."
                    value={resumenClinico}
                    onChange={e => setResumenClinico(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label font-bold text-slate-700">Diagnóstico Presuntivo (CIE-10)</label>
                    <input
                      type="text"
                      className="input font-semibold"
                      placeholder="Ej: M54.5 - Lumbalgia mecánica / H10.1 - Conjuntivitis"
                      value={diagnosticoPresuntivo}
                      onChange={e => setDiagnosticoPresuntivo(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label font-bold text-slate-700">Exámenes Paraclínicos Anexos / Solicitados</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Ej: Rx columna AP y lateral, Resonancia Magnética..."
                      value={examenesParaclinicosAnexos}
                      onChange={e => setExamenesParaclinicosAnexos(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary px-4 py-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-5 py-2 font-bold shadow-md flex items-center gap-2"
                  >
                    <Save size={16} /> Emitir Referencia
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Visor / Impresión de Formato Oficial FORMATO REFERENCIA ESPECIALISTA.pdf */}
      <AnimatePresence>
        {selectedReferencia && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden my-8"
            >
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center print:hidden">
                <div className="flex items-center gap-2">
                  <Printer size={18} className="text-yellow-400" />
                  <h3 className="font-bold text-sm">Formato Oficial de Referencia Médica Especializada</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Printer size={13} /> Imprimir
                  </button>
                  <button onClick={() => setSelectedReferencia(null)} className="text-slate-400 hover:text-white p-1">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Formato Oficial Impreso */}
              <div className="p-8 space-y-5 text-slate-900 text-xs font-sans print:p-2">
                {/* Cabecera Oficial Duncan */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src="/duncan-logo-bw.png" alt="Duncan" className="h-9 w-auto object-contain" />
                    <div>
                      <p className="font-bold text-sm text-slate-900 leading-none">{selectedReferencia.empresaNombre}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Servicios de Seguridad y Salud en el Trabajo (SSST)</p>
                      <p className="text-[9px] text-slate-500 font-mono">ERP REG: SSST-FMT-REF-02 • INTERCONSULTA MÉDICA</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      REF-{String(selectedReferencia.id || '').toUpperCase()}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Fecha: {selectedReferencia.fecha} ({selectedReferencia.hora})</p>
                  </div>
                </div>

                <div className="text-center py-1 bg-slate-100 rounded border border-slate-200">
                  <h2 className="font-bold text-sm tracking-wide text-slate-900 uppercase">
                    HOJA DE REFERENCIA MÉDICA A ESPECIALISTA
                  </h2>
                </div>

                {/* Destinatario */}
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
                  <p><strong>AL ESPECIALISTA EN:</strong> <span className="font-black text-blue-900 text-sm uppercase">{selectedReferencia.especialidad}</span></p>
                  <p className="text-[11px] text-slate-600 mt-0.5"><strong>Centro Asistencial:</strong> {selectedReferencia.centroSaludSugerido || 'IVSS / Centro de Salud de la Red Asistencial'}</p>
                </div>

                {/* 1. Datos del Paciente */}
                <div className="border border-slate-200 rounded-lg p-3 space-y-1.5 bg-slate-50/50">
                  <p className="font-bold text-slate-800 text-[11px] border-b border-slate-200 pb-1 uppercase">
                    1. Datos Sociodemográficos y Laborales
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <p><strong>Paciente:</strong> {selectedReferencia.nombreApellido}</p>
                    <p><strong>Cédula de Identidad:</strong> V-{selectedReferencia.cedula}</p>
                    <p><strong>Cargo / Puesto:</strong> {selectedReferencia.cargo}</p>
                    <p><strong>Departamento:</strong> {selectedReferencia.departamento}</p>
                    <p><strong>Centro de Trabajo:</strong> {selectedReferencia.sucursal}</p>
                    <p><strong>Género / Edad:</strong> {selectedReferencia.genero} • {selectedReferencia.edad} años</p>
                  </div>
                </div>

                {/* 2. Motivo y Resumen Clínico */}
                <div className="border border-slate-200 rounded-lg p-3 space-y-1.5 bg-slate-50/50">
                  <p className="font-bold text-slate-800 text-[11px] border-b border-slate-200 pb-1 uppercase">
                    2. Criterio de Interconsulta y Hallazgos
                  </p>
                  <p><strong>Motivo de la Referencia:</strong> {selectedReferencia.motivoReferencia}</p>
                  <p><strong>Resumen Clínico / Examen Físico:</strong> {selectedReferencia.resumenClinico || 'Paciente evaluado en servicio médico por sintomatología ocupacional.'}</p>
                  <p><strong>Diagnóstico Presuntivo:</strong> <span className="font-mono font-bold text-slate-900">{selectedReferencia.diagnosticoPresuntivo}</span></p>
                  <p><strong>Exámenes Anexos / Solicitados:</strong> {selectedReferencia.examenesParaclinicosAnexos || 'Ninguno anexado'}</p>
                </div>

                <p className="text-[10px] text-slate-500 italic text-center">
                  Agradecemos a la estimada especialidad remitir contra-referencia con informe médico y recomendaciones de aptitud laboral.
                </p>

                {/* Firmas Oficiales */}
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="border-t border-slate-400 text-center pt-2">
                    <p className="font-bold text-[11px]">{selectedReferencia.medicoRemitente}</p>
                    <p className="text-[10px] text-slate-500">Médico Remitente SSST Duncan</p>
                    <p className="text-[9px] text-slate-400">MPPS: {selectedReferencia.numeroMSDS || '43739'} • CMV: {selectedReferencia.numeroCMV || '17585'}</p>
                  </div>
                  <div className="border-t border-slate-400 text-center pt-2">
                    <p className="font-bold text-[11px]">Sello y Firma Especialista Receptor</p>
                    <p className="text-[10px] text-slate-500">Centro Médico / Hospital / IVSS</p>
                    <p className="text-[9px] text-slate-400">Fecha de Recepción: ____/____/2026</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
