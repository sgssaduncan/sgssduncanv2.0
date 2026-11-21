import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Building2, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Save, 
  ShieldCheck,
  Stethoscope,
  Activity
} from 'lucide-react';
import type { RegistroReposoMedico } from '../types/medical';
import { dbService } from '../services/db';
import { exportCurrentViewData } from '../lib/exportUtils';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function VexpressRepososManager() {
  const [reposos, setReposos] = useState<RegistroReposoMedico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReposo, setSelectedReposo] = useState<RegistroReposoMedico | null>(null);
  const [selectedCertificado, setSelectedCertificado] = useState<RegistroReposoMedico | null>(null);

  // Form State
  const [cedula, setCedula] = useState('');
  const [nombreApellido, setNombreApellido] = useState('');
  const [genero, setGenero] = useState('MASCULINO');
  const [edad, setEdad] = useState<number>(35);
  const [empresaNombre, setEmpresaNombre] = useState('ACUMULADORES DUNCAN, C.A.');
  const [sucursal, setSucursal] = useState('LOS RUICES');
  const [departamento, setDepartamento] = useState('PRODUCCIÓN Y CARGA');
  const [cargo, setCargo] = useState('TÉCNICO OPERATIVO');
  const [tipoContingencia, setTipoContingencia] = useState('Enfermedad Ocupacional');
  const [diagnosticoCIE10, setDiagnosticoCIE10] = useState('');
  const [sistemaAfectado, setSistemaAfectado] = useState('Músculo-esquelético');
  const [fechaInicioReposo, setFechaInicioReposo] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFinReposo, setFechaFinReposo] = useState(new Date(Date.now() + 3*24*3600*1000).toISOString().split('T')[0]);
  const [centroEmisor, setCentroEmisor] = useState('SSST Duncan');
  const [medicoTratante, setMedicoTratante] = useState('Dra. Carmen Ismelda Ramos Martínez');
  const [ciMedico, setCiMedico] = useState('6211215');
  const [numeroColegioMedico, setNumeroColegioMedico] = useState('17585');
  const [observacionesValidacion, setObservacionesValidacion] = useState('');
  const [estatusValidacion, setEstatusValidacion] = useState<any>('VALIDADO_APTO');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dbService.getRepososMedicos();
      setReposos(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar reposos médicos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calcular días automáticamente
  const calcularDias = (inicio: string, fin: string) => {
    if (!inicio || !fin) return 1;
    const d1 = new Date(inicio);
    const d2 = new Date(fin);
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const diasCalculados = calcularDias(fechaInicioReposo, fechaFinReposo);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim() || !nombreApellido.trim() || !diagnosticoCIE10.trim()) {
      toast.error('Complete los campos obligatorios del reposo.');
      return;
    }

    try {
      await dbService.saveReposoMedico({
        cedula: cedula.trim(),
        nombreApellido: nombreApellido.trim().toUpperCase(),
        genero,
        edad: Number(edad),
        empresaNombre,
        sucursal,
        departamento,
        cargo: cargo.trim().toUpperCase(),
        tipoContingencia,
        diagnosticoCIE10: diagnosticoCIE10.trim(),
        sistemaAfectado,
        fechaInicioReposo,
        fechaFinReposo,
        diasReposo: diasCalculados,
        centroEmisor,
        medicoTratante: medicoTratante.trim(),
        ciMedico: ciMedico.trim(),
        numeroColegioMedico: numeroColegioMedico.trim(),
        estatusValidacion,
        observacionesValidacion: observacionesValidacion.trim(),
        fechaRegistro: new Date().toISOString().split('T')[0]
      });

      toast.success('Reposo médico registrado exitosamente');
      setIsModalOpen(false);
      resetForm();
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar reposo médico');
    }
  };

  const resetForm = () => {
    setCedula('');
    setNombreApellido('');
    setDiagnosticoCIE10('');
    setObservacionesValidacion('');
  };

  const filteredReposos = reposos.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      (r.nombreApellido || '').toLowerCase().includes(q) ||
      (r.cedula || '').toLowerCase().includes(q) ||
      (r.diagnosticoCIE10 || '').toLowerCase().includes(q) ||
      (r.sucursal || '').toLowerCase().includes(q) ||
      (r.tipoContingencia || '').toLowerCase().includes(q)
    );
  });

  const totalDiasPerdidos = reposos.reduce((acc, curr) => acc + (curr.diasReposo || 0), 0);
  const totalCasosLaborales = reposos.filter(r => r.tipoContingencia.includes('Accidente') || r.tipoContingencia.includes('Ocupacional')).length;

  const handleExport = (format: 'excel' | 'csv') => {
    if (filteredReposos.length === 0) {
      toast.error('No hay reposos en la vista actual');
      return;
    }
    const data = filteredReposos.map(r => ({
      Fecha: r.fechaRegistro,
      Cedula: r.cedula,
      Trabajador: r.nombreApellido,
      Sucursal: r.sucursal,
      Departamento: r.departamento,
      Cargo: r.cargo,
      Contingencia: r.tipoContingencia,
      Diagnostico_CIE10: r.diagnosticoCIE10,
      Sistema_Afectado: r.sistemaAfectado,
      Inicio_Reposo: r.fechaInicioReposo,
      Fin_Reposo: r.fechaFinReposo,
      Dias_Continuos: r.diasReposo,
      Centro_Emisor: r.centroEmisor,
      Medico: r.medicoTratante,
      Validacion: r.estatusValidacion
    }));
    exportCurrentViewData(data, format, `Control_Reposos_Medicos_Duncan_${new Date().toISOString().split('T')[0]}`);
    toast.success(`Exportados ${filteredReposos.length} registros`);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Reposos</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{reposos.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Registros epidemiológicos</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock size={22} />
          </div>
        </div>

        <div className="card p-4 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Días Acumulados</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{totalDiasPerdidos}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Días perdidos por reposo</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Calendar size={22} />
          </div>
        </div>

        <div className="card p-4 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Origen Laboral</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{totalCasosLaborales}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Accidentes / Ocupacionales</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="card p-4 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">SSST Duncan</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">100%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Validación médica al reintegro</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* Acciones y Búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cédula, trabajador, diagnóstico CIE-10 o sede..."
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
            <Plus size={16} /> Registrar Reposo
          </button>
        </div>
      </div>

      {/* Tabla de Reposos */}
      <div className="card shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Trabajador / Cédula</th>
                <th className="p-3">Sucursal / Dpto</th>
                <th className="p-3">Contingencia</th>
                <th className="p-3">Diagnóstico CIE-10</th>
                <th className="p-3 text-center">Lapso / Días</th>
                <th className="p-3">Centro Emisor</th>
                <th className="p-3 text-center">Estatus</th>
                <th className="p-3 text-right">Constancia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Cargando reposos médicos...
                  </td>
                </tr>
              ) : filteredReposos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No se encontraron registros de reposos médicos
                  </td>
                </tr>
              ) : (
                filteredReposos.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-600 whitespace-nowrap">{item.fechaRegistro}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{item.nombreApellido}</p>
                      <p className="text-[11px] text-slate-500 font-mono">V-{item.cedula} • {item.cargo}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">{item.sucursal}</p>
                      <p className="text-[11px] text-slate-500">{item.departamento}</p>
                    </td>
                    <td className="p-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold border",
                        item.tipoContingencia.includes('Accidente') 
                          ? "bg-red-50 text-red-700 border-red-200"
                          : item.tipoContingencia.includes('Ocupacional')
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {item.tipoContingencia}
                      </span>
                    </td>
                    <td className="p-3 max-w-[200px]">
                      <p className="font-medium text-slate-800 truncate" title={item.diagnosticoCIE10}>
                        {item.diagnosticoCIE10}
                      </p>
                      <p className="text-[10px] text-slate-400">{item.sistemaAfectado}</p>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 text-xs">
                        {item.diasReposo} días
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">{item.fechaInicioReposo} al {item.fechaFinReposo}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-slate-700">{item.centroEmisor}</p>
                      <p className="text-[10px] text-slate-400">{item.medicoTratante}</p>
                    </td>
                    <td className="p-3 text-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        item.estatusValidacion.includes('APTO') 
                          ? "bg-emerald-100 text-emerald-800" 
                          : item.estatusValidacion.includes('RESTRICCIONES')
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                      )}>
                        {item.estatusValidacion.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedCertificado(item)}
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

      {/* Modal Registrar Reposo */}
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
                  <Clock className="text-yellow-400" size={20} />
                  <h3 className="font-bold text-base">Registrar y Validar Reposo Médico (REG_REPOSO)</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
                {/* Datos del Trabajador */}
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
                    <label className="label font-bold text-slate-700">Cargo</label>
                    <input
                      type="text"
                      className="input uppercase"
                      value={cargo}
                      onChange={e => setCargo(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label font-bold text-slate-700">Empresa Razón Social</label>
                    <select className="select" value={empresaNombre} onChange={e => setEmpresaNombre(e.target.value)}>
                      <option value="ACUMULADORES DUNCAN, C.A.">ACUMULADORES DUNCAN, C.A.</option>
                      <option value="DISTRIBUIDORA DUNCAN, C.A.">DISTRIBUIDORA DUNCAN, C.A.</option>
                      <option value="SERVICENTROS DUNCAN, C.A.">SERVICENTROS DUNCAN, C.A.</option>
                    </select>
                  </div>
                </div>

                {/* Datos Médicos del Reposo */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label font-bold text-slate-700">Tipo de Contingencia *</label>
                      <select className="select font-bold" value={tipoContingencia} onChange={e => setTipoContingencia(e.target.value)}>
                        <option value="Enfermedad Común">Enfermedad Común</option>
                        <option value="Accidente de Trabajo">Accidente de Trabajo</option>
                        <option value="Accidente Común">Accidente Común (Trayecto / Extralaboral)</option>
                        <option value="Enfermedad Ocupacional">Enfermedad Ocupacional</option>
                        <option value="Maternidad">Maternidad</option>
                      </select>
                    </div>

                    <div>
                      <label className="label font-bold text-slate-700">Sistema Corporal Afectado</label>
                      <select className="select" value={sistemaAfectado} onChange={e => setSistemaAfectado(e.target.value)}>
                        <option value="Músculo-esquelético">Músculo-esquelético</option>
                        <option value="Órganos de los Sentidos (Ojos / Oídos)">Órganos de los Sentidos (Ojos / Oídos)</option>
                        <option value="Respiratorio">Respiratorio</option>
                        <option value="Digestivo">Digestivo</option>
                        <option value="Cardiovascular">Cardiovascular</option>
                        <option value="Tegumentario (Piel / Quemaduras)">Tegumentario (Piel / Quemaduras)</option>
                        <option value="Nervioso">Nervioso</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label font-bold text-slate-700">Diagnóstico e Impresión Clínica (CIE-10) *</label>
                    <input
                      type="text"
                      className="input font-semibold"
                      placeholder="Ej: M54.5 - Lumbago con ciática / T26.1 - Quemadura ocular"
                      value={diagnosticoCIE10}
                      onChange={e => setDiagnosticoCIE10(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="label font-bold text-slate-700">Fecha Inicio</label>
                      <input
                        type="date"
                        className="input"
                        value={fechaInicioReposo}
                        onChange={e => setFechaInicioReposo(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="label font-bold text-slate-700">Fecha Fin</label>
                      <input
                        type="date"
                        className="input"
                        value={fechaFinReposo}
                        onChange={e => setFechaFinReposo(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="label font-bold text-slate-700">Días Continuos</label>
                      <div className="input bg-slate-100 flex items-center font-black text-rose-600 text-sm">
                        {diasCalculados} días
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label font-bold text-slate-700">Centro Emisor</label>
                      <select className="select" value={centroEmisor} onChange={e => setCentroEmisor(e.target.value)}>
                        <option value="SSST Duncan">Servicio Médico SSST Duncan</option>
                        <option value="IVSS">Instituto Venezolano de los Seguros Sociales (IVSS)</option>
                        <option value="Clínica Privada">Clínica Privada / Policlínica</option>
                        <option value="Ambulatorio / Barrio Adentro">Ambulatorio Público</option>
                      </select>
                    </div>
                    <div>
                      <label className="label font-bold text-slate-700">Médico Tratante / Especialista</label>
                      <input
                        type="text"
                        className="input"
                        value={medicoTratante}
                        onChange={e => setMedicoTratante(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Validación y Reincorporación */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label font-bold text-slate-700">Estatus de Validación Médica SSST</label>
                    <select className="select font-bold text-emerald-800" value={estatusValidacion} onChange={e => setEstatusValidacion(e.target.value)}>
                      <option value="VALIDADO_APTO">VALIDADO APTO PARA TRABAJAR</option>
                      <option value="REINCORPORADO_CON_RESTRICCIONES">REINCORPORADO CON RESTRICCIONES ERGONÓMICAS</option>
                      <option value="PENDIENTE_VALIDACION">PENDIENTE VALIDACIÓN EN CAMPO</option>
                      <option value="RECHAZADO">RECHAZADO (NO PROCEDE)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label font-bold text-slate-700">Observaciones y Pautas de Reincorporación</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Ej: Uso de faja, no levantar peso > 20kg..."
                      value={observacionesValidacion}
                      onChange={e => setObservacionesValidacion(e.target.value)}
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
                    <Save size={16} /> Guardar Registro
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Visor / Impresión de Formato Oficial FORMATO REPOSO.pdf */}
      <AnimatePresence>
        {selectedCertificado && (
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
                  <h3 className="font-bold text-sm">Constancia Oficial de Validación de Reposo Médico</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Printer size={13} /> Imprimir
                  </button>
                  <button onClick={() => setSelectedCertificado(null)} className="text-slate-400 hover:text-white p-1">
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
                      <p className="font-bold text-sm text-slate-900 leading-none">{selectedCertificado.empresaNombre}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Servicios de Seguridad y Salud en el Trabajo (SSST)</p>
                      <p className="text-[9px] text-slate-500 font-mono">ERP REG: SSST-FMT-REPOSO-01 • LOPCYMAT ART. 69-73</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      ID: {String(selectedCertificado.id || '').toUpperCase()}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Emisión: {selectedCertificado.fechaRegistro}</p>
                  </div>
                </div>

                <div className="text-center py-1 bg-slate-100 rounded border border-slate-200">
                  <h2 className="font-bold text-sm tracking-wide text-slate-900 uppercase">
                    CONSTANCIA DE VALIDACIÓN Y CONTROL DE REPOSO MÉDICO
                  </h2>
                </div>

                {/* 1. Datos del Trabajador */}
                <div className="border border-slate-200 rounded-lg p-3 space-y-1.5 bg-slate-50/50">
                  <p className="font-bold text-slate-800 text-[11px] border-b border-slate-200 pb-1 uppercase">
                    1. Datos de Identificación del Trabajador
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <p><strong>Nombres y Apellidos:</strong> {selectedCertificado.nombreApellido}</p>
                    <p><strong>Cédula de Identidad:</strong> V-{selectedCertificado.cedula}</p>
                    <p><strong>Cargo / Ocupación:</strong> {selectedCertificado.cargo}</p>
                    <p><strong>Departamento:</strong> {selectedCertificado.departamento}</p>
                    <p><strong>Centro de Trabajo:</strong> {selectedCertificado.sucursal}</p>
                    <p><strong>Género / Edad:</strong> {selectedCertificado.genero} • {selectedCertificado.edad} años</p>
                  </div>
                </div>

                {/* 2. Diagnóstico y Lapso */}
                <div className="border border-slate-200 rounded-lg p-3 space-y-1.5 bg-slate-50/50">
                  <p className="font-bold text-slate-800 text-[11px] border-b border-slate-200 pb-1 uppercase">
                    2. Dictamen Médico y Días de Incapacidad Temporal
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <p><strong>Tipo de Contingencia:</strong> <span className="font-bold text-rose-700">{selectedCertificado.tipoContingencia}</span></p>
                    <p><strong>Sistema Afectado:</strong> {selectedCertificado.sistemaAfectado}</p>
                    <p className="col-span-2"><strong>Diagnóstico (CIE-10):</strong> <span className="font-mono font-bold">{selectedCertificado.diagnosticoCIE10}</span></p>
                    <p><strong>Fecha Inicio:</strong> {selectedCertificado.fechaInicioReposo}</p>
                    <p><strong>Fecha Fin:</strong> {selectedCertificado.fechaFinReposo}</p>
                    <p className="col-span-2"><strong>Total Días Continuos:</strong> <span className="font-black text-rose-700 text-sm">{selectedCertificado.diasReposo} días continuos</span></p>
                    <p><strong>Centro Emisor:</strong> {selectedCertificado.centroEmisor}</p>
                    <p><strong>Médico Emisor:</strong> {selectedCertificado.medicoTratante}</p>
                  </div>
                </div>

                {/* 3. Dictamen y Pautas de Reincorporación */}
                <div className="border border-slate-200 rounded-lg p-3 space-y-1 bg-slate-50/50">
                  <p className="font-bold text-slate-800 text-[11px] border-b border-slate-200 pb-1 uppercase">
                    3. Validación Médica SSST y Dictamen de Reincorporación
                  </p>
                  <p><strong>Estatus:</strong> <span className="font-bold text-emerald-800">{selectedCertificado.estatusValidacion.replace(/_/g, ' ')}</span></p>
                  <p><strong>Pautas Ergonómicas / Restricciones:</strong> {selectedCertificado.observacionesValidacion || 'Reincorporación habitual a sus funciones.'}</p>
                </div>

                {/* Firmas Oficiales */}
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="border-t border-slate-400 text-center pt-2">
                    <p className="font-bold text-[11px]">{selectedCertificado.medicoTratante}</p>
                    <p className="text-[10px] text-slate-500">Médico Ocupacional SSST</p>
                    <p className="text-[9px] text-slate-400">MPPS: {selectedCertificado.numeroColegioMedico || '17585'} • C.M.V.</p>
                  </div>
                  <div className="border-t border-slate-400 text-center pt-2">
                    <p className="font-bold text-[11px]">{selectedCertificado.nombreApellido}</p>
                    <p className="text-[10px] text-slate-500">Firma del Trabajador Conforme</p>
                    <p className="text-[9px] text-slate-400">C.I: V-{selectedCertificado.cedula}</p>
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
