import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Save, 
  ShieldCheck, 
  Building, 
  Briefcase, 
  Calendar, 
  Phone, 
  Mail, 
  Shirt, 
  HeartHandshake, 
  Clock, 
  RefreshCw,
  FileCheck,
  FileType
} from 'lucide-react';
import { dbService } from '../services/db';
import { auditService } from '../services/auditService';
import { useSGD } from '../contexts/SGDContext';
import { useAuth } from '../hooks/useAuth';
import { canAccessNomina, type Empleado, type Empresa, type Establecimiento } from '../types';
import { parseWorkerFile, type ParsedWorkerResult } from '../lib/workerFileParser';
import { DUNCAN_LOGO_BW } from '../lib/logos';
import { cn, formatDate } from '../lib/utils';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function TrabajadoresPage() {
  const { currentUser, empresas, establecimientos } = useSGD();
  const { isSuperAdmin } = useAuth();
  
  // Verificación estricta de acceso a Nómina y Datos Sensibles
  const hasNominaAccess = canAccessNomina(currentUser);

  // Verificación de autorizaciones operativas
  const rol = currentUser?.rol?.toUpperCase() || '';
  const canManage = isSuperAdmin || 
                    rol.includes('ADMIN') || 
                    rol.includes('SUPER') || 
                    rol.includes('TALENTO') || 
                    rol.includes('RRHH') || 
                    rol.includes('SSST') || 
                    rol.includes('AUDITOR');

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('TODAS');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('ACTIVOS');

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Empleado>>({
    cedula: '',
    nombre: '',
    cargo: '',
    departamento: 'Operaciones',
    empresaNombre: 'Distribuidora Duncan, C.A.',
    sedeNombre: 'Distribuidora Valencia',
    fechaIngreso: '2023-01-15',
    ultimoDisfruteVacacional: '2025-06-10',
    diasVacacionesPendientes: 15,
    telefono: '',
    email: '',
    genero: 'M',
    tallaCamisa: 'M',
    tallaPantalon: '32',
    tallaCalzado: '42',
    contactoEmergenciaNombre: '',
    contactoEmergenciaTelefono: '',
    observaciones: '',
    activo: true
  });

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedWorkerResult | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (hasNominaAccess) {
      loadEmpleados();
    } else {
      setLoading(false);
    }
  }, [hasNominaAccess]);

  const loadEmpleados = async () => {
    if (!hasNominaAccess) return;
    try {
      setLoading(true);
      const data = await dbService.getEmpleados();
      setEmpleados(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar la nómina de trabajadores');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    if (!canManage) {
      toast.error('No tienes permisos para registrar trabajadores');
      return;
    }
    setSelectedEmpleado(null);
    setFormData({
      cedula: '',
      nombre: '',
      cargo: '',
      departamento: 'Operaciones',
      empresaNombre: empresas[0]?.nombre || 'Distribuidora Duncan, C.A.',
      sedeNombre: establecimientos[0]?.nombre || 'Sede Principal',
      fechaIngreso: new Date().toISOString().split('T')[0],
      ultimoDisfruteVacacional: '',
      diasVacacionesPendientes: 15,
      telefono: '',
      email: '',
      genero: 'M',
      tallaCamisa: 'M',
      tallaPantalon: '32',
      tallaCalzado: '42',
      contactoEmergenciaNombre: '',
      contactoEmergenciaTelefono: '',
      observaciones: '',
      activo: true
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (emp: Empleado) => {
    if (!canManage) {
      toast.error('No tienes permisos para modificar trabajadores');
      return;
    }
    setSelectedEmpleado(emp);
    setFormData({ ...emp });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    if (!formData.cedula || !formData.nombre) {
      toast.error('Cédula y Nombre son obligatorios');
      return;
    }

    try {
      if (selectedEmpleado && (selectedEmpleado.id || selectedEmpleado._id)) {
        const id = (selectedEmpleado.id || selectedEmpleado._id)!;
        await dbService.updateEmpleado(id, formData);
        toast.success('Trabajador actualizado exitosamente');
      } else {
        await dbService.saveEmpleado(formData as any);
        toast.success('Trabajador creado exitosamente');
      }
      setIsFormModalOpen(false);
      await loadEmpleados();
    } catch (err) {
      console.error(err);
      toast.error('Error guardando los datos del trabajador');
    }
  };

  const handleDelete = async (emp: Empleado) => {
    if (!canManage) {
      toast.error('No tienes permisos para eliminar trabajadores');
      return;
    }
    if (!confirm(`¿Estás seguro de eliminar a ${emp.nombre} (${emp.cedula}) de la nómina activa? Esta acción quedará auditada.`)) {
      return;
    }

    try {
      const id = (emp.id || emp._id)!;
      await dbService.deleteEmpleado(id);
      toast.success('Trabajador eliminado de la base de datos');
      await loadEmpleados();
    } catch (e) {
      console.error(e);
      toast.error('Error al eliminar trabajador');
    }
  };

  // Manejo de carga de archivos (Excel, Word, PDF)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setParsing(true);
    setParsedResult(null);

    try {
      const result = await parseWorkerFile(file);
      setParsedResult(result);
      if (result.success) {
        toast.success(`Se detectaron ${result.validRows.length} trabajadores válidos en el archivo`);
      } else {
        toast.error('No se pudieron extraer trabajadores válidos del archivo');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Error procesando el archivo');
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedResult || parsedResult.validRows.length === 0 || !canManage) return;

    setImporting(true);
    try {
      const res = await dbService.importEmpleados(parsedResult.validRows, replaceExisting);
      toast.success(`Nómina actualizada: ${res.added} nuevos, ${res.updated} actualizados (Total: ${res.total})`);
      setIsImportModalOpen(false);
      setImportFile(null);
      setParsedResult(null);
      await loadEmpleados();
    } catch (err) {
      console.error(err);
      toast.error('Error al importar trabajadores a la base de datos');
    } finally {
      setImporting(false);
    }
  };

  // Filtrado
  const filtered = empleados.filter(emp => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      emp.nombre.toLowerCase().includes(q) ||
      emp.cedula.toLowerCase().includes(q) ||
      emp.cargo.toLowerCase().includes(q) ||
      (emp.departamento && emp.departamento.toLowerCase().includes(q)) ||
      (emp.sedeNombre && emp.sedeNombre.toLowerCase().includes(q));

    const matchEmpresa = filtroEmpresa === 'TODAS' || 
      emp.empresaNombre === filtroEmpresa ||
      emp.empresaNombre?.toLowerCase().trim() === filtroEmpresa.toLowerCase().trim() ||
      (filtroEmpresa.includes('Acumuladores') && emp.empresaNombre?.includes('Acumuladores')) ||
      (filtroEmpresa.includes('Distribuidora') && emp.empresaNombre?.includes('Distribuidora')) ||
      (filtroEmpresa.includes('Fundic') && (emp.empresaNombre?.includes('Fundición') || emp.empresaNombre?.includes('Fundicion'))) ||
      (filtroEmpresa.includes('1286') && emp.empresaNombre?.includes('1286')) ||
      (filtroEmpresa.includes('Ayacucho') && emp.empresaNombre?.includes('Ayacucho'));
    const matchEstado = filtroEstado === 'TODOS' || 
                        (filtroEstado === 'ACTIVOS' && emp.activo !== false) || 
                        (filtroEstado === 'INACTIVOS' && emp.activo === false);

    return matchSearch && matchEmpresa && matchEstado;
  });

  // Métricas
  const totalActivos = empleados.filter(e => e.activo !== false).length;
  const totalInactivos = empleados.filter(e => e.activo === false).length;
  const duncanPlanta = empleados.filter(e => e.empresaNombre?.includes('Acumuladores')).length;
  const duncanDist = empleados.filter(e => e.empresaNombre?.includes('Distribuidora')).length;
  const fundicionCentro = empleados.filter(e => e.empresaNombre?.includes('Fundición') || e.empresaNombre?.includes('Fundicion')).length;
  const inversiones1286 = empleados.filter(e => e.empresaNombre?.includes('1286')).length;
  const transporteAyacucho = empleados.filter(e => e.empresaNombre?.includes('Ayacucho')).length;

  // Exportar Excel
  const exportToExcel = () => {
    try {
      const rows = filtered.map(e => ({
        'Cédula': e.cedula,
        'Nombres y Apellidos': e.nombre,
        'Cargo': e.cargo,
        'Departamento': e.departamento || 'Operaciones',
        'Empresa': e.empresaNombre || 'Duncan',
        'Sede / Localidad': e.sedeNombre || 'N/A',
        'Fecha Ingreso': e.fechaIngreso || 'N/A',
        'Último Disfrute Vacacional': e.ultimoDisfruteVacacional || 'N/A',
        'Días Vacaciones': e.diasVacacionesPendientes ?? 15,
        'Teléfono': e.telefono || 'N/A',
        'Correo': e.email || 'N/A',
        'Género': e.genero || 'M',
        'Talla Camisa': e.tallaCamisa || 'M',
        'Talla Pantalón': e.tallaPantalon || '32',
        'Talla Calzado': e.tallaCalzado || '42',
        'Estatus': e.activo !== false ? 'ACTIVO' : 'INACTIVO'
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Nómina_Trabajadores');
      XLSX.writeFile(wb, `SGD_Duncan_Nomina_Trabajadores_${new Date().toISOString().slice(0, 10)}.xlsx`);
      auditService.logExport('EXCEL', 'Nomina_Trabajadores.xlsx', 'Empleados', undefined, { total: filtered.length });
      toast.success('Nómina exportada a Excel');
    } catch (e) {
      console.error(e);
      toast.error('Error exportando nómina');
    }
  };

  // Exportar PDF Oficial
  const exportToPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
      const pageWidth = 279.4;
      const pageHeight = 215.9;

      try {
        doc.addImage(DUNCAN_LOGO_BW, 'PNG', 14, 8, 36, 13);
      } catch (e) {
        console.warn('Error insertando logo en PDF nómina', e);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('ACUMULADORES DUNCAN, C.A. / DISTRIBUIDORA DUNCAN, C.A.', 56, 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text('GERENCIA DE GESTIÓN HUMANA Y SEGURIDAD, SALUD Y AMBIENTE (SSST)', 56, 18);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 64, 175);
      doc.text(`LISTADO MAESTRO DE TRABAJADORES ACTIVOS (${filtered.length} REGISTROS)`, 56, 23);

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.line(14, 27, pageWidth - 14, 27);

      const tableRows = filtered.map(e => [
        e.cedula,
        e.nombre,
        e.cargo,
        e.departamento || 'Operaciones',
        e.empresaNombre || 'Duncan',
        e.sedeNombre || '—',
        e.fechaIngreso || '—',
        e.ultimoDisfruteVacacional || '—',
        e.activo !== false ? 'ACTIVO' : 'INACTIVO'
      ]);

      autoTable(doc, {
        startY: 32,
        head: [['Cédula', 'Trabajador', 'Cargo / Puesto', 'Departamento', 'Razón Social', 'Sede', 'F. Ingreso', 'Últ. Vacaciones', 'Estatus']],
        body: tableRows,
        margin: { left: 14, right: 14 },
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      const fileName = `SGD_Duncan_Nomina_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
      auditService.logExport('PDF', fileName, 'Empleados', undefined, { total: filtered.length });
      toast.success('Listado de trabajadores descargado en PDF');
    } catch (e) {
      console.error(e);
      toast.error('Error generando PDF');
    }
  };

  if (!hasNominaAccess) {
    return (
      <div className="card p-8 sm:p-12 text-center max-w-xl mx-auto mt-8 sm:mt-12 space-y-5 shadow-2xl border border-rose-200/80 bg-white rounded-3xl">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8 text-rose-600" />
        </div>
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800">
            Acceso Restringido • Confidencial
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Nómina y Datos del Personal
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            De acuerdo con las normativas corporativas de privacidad y gobernanza de <strong>Distribuidora Duncan</strong>,
            la nómina de personal, cédulas, datos salariales y expedientes privados están estrictamente protegidos.
          </p>
        </div>

        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 text-left space-y-2">
          <p className="font-bold flex items-center gap-2 text-amber-950">
            <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
            Niveles Autorizados para Consultar este Módulo:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li><strong>Propietarios y Desarrolladores del Sistema</strong> (Control total de nóminas).</li>
            <li><strong>Administradores Autorizados</strong> con el privilegio especial de nómina expresamente concedido por un Propietario.</li>
          </ul>
        </div>

        <p className="text-[11px] text-slate-400">
          Los cargos operativos (Gerentes de Distribuidora, Supervisores de Detal, Coordinadores, Jefes de Almacén, Vendedores y Técnicos)
          gestionan al personal de su sede a través de Dotación EPP, Transporte, LOTO y Permisos de Trabajo sin acceso a la nómina completa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-400 text-slate-900 rounded-xl shadow-sm">
            <Users size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">Base de Datos de Trabajadores</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                NÓMINA MAESTRA
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Carga masiva multi-formato (Excel, Word, PDF) y gestión integral de personal para Salud Ocupacional, EPP y Transporte
            </p>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={loadEmpleados}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200"
            title="Recargar datos"
          >
            <RefreshCw size={15} />
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <FileSpreadsheet size={15} /> Excel
          </button>

          <button
            onClick={exportToPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
          >
            <Download size={15} /> PDF
          </button>

          {canManage && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <Upload size={15} /> Importar Nómina
              </button>

              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl text-xs font-black shadow-sm transition-colors"
              >
                <UserPlus size={16} /> Nuevo Trabajador
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alerta de Modo Solo Lectura si no tiene permisos */}
      {!canManage && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-900">
          <ShieldCheck size={20} className="text-amber-600 shrink-0" />
          <div>
            <strong>Modo Consulta Activo:</strong> Tu perfil ({rol || 'Usuario'}) tiene permisos de lectura sobre la base de datos de trabajadores. La creación, edición o carga masiva de nómina está reservada al personal autorizado de Gestión Humana y SSST.
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Nómina Activa</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalActivos}</div>
          <div className="text-[11px] text-slate-400">Total Grupo Duncan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Acumuladores</span>
            <Building size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">{duncanPlanta}</div>
          <div className="text-[11px] text-slate-400">Planta & Producción</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Distribuidora</span>
            <Briefcase size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{duncanDist}</div>
          <div className="text-[11px] text-slate-400">Logística & Servicentros</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Fundición Centro</span>
            <Building size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">{fundicionCentro}</div>
          <div className="text-[11px] text-slate-400">Planta Cagua</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
            <span>Inv. 1286 / Ayacucho</span>
            <Clock size={16} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{inversiones1286 + transporteAyacucho}</div>
          <div className="text-[11px] text-slate-400">Inv: {inversiones1286} | Ayac: {transporteAyacucho}</div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cédula (V-...), nombre, cargo, departamento o sede..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filtroEmpresa}
            onChange={e => setFiltroEmpresa(e.target.value)}
            className="select text-xs py-2 px-3 border border-slate-200 rounded-xl"
          >
            <option value="TODAS">Todas las Empresas ({totalActivos})</option>
            {empresas.map(emp => {
              const count = empleados.filter(e => 
                e.empresaNombre?.toLowerCase().trim() === emp.nombre.toLowerCase().trim() ||
                (emp.codigo === 'ADCA' && e.empresaNombre?.includes('Acumuladores')) ||
                (emp.codigo === 'DDCA' && e.empresaNombre?.includes('Distribuidora')) ||
                (emp.codigo === 'FDC' && (e.empresaNombre?.includes('Fundición') || e.empresaNombre?.includes('Fundicion'))) ||
                (emp.codigo === 'INV1286' && e.empresaNombre?.includes('1286')) ||
                (emp.codigo === 'TAY' && e.empresaNombre?.includes('Ayacucho'))
              ).length;
              return (
                <option key={emp._id} value={emp.nombre}>{emp.nombre} ({count})</option>
              );
            })}
          </select>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(['ACTIVOS', 'TODOS', 'INACTIVOS'] as const).map(est => (
              <button
                key={est}
                onClick={() => setFiltroEstado(est)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  filtroEstado === est ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                )}
              >
                {est === 'ACTIVOS' ? 'Activos' : est === 'TODOS' ? 'Todos' : 'Inactivos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla Principal de Trabajadores */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Cargando base de datos de trabajadores...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Users size={36} className="mx-auto opacity-30 text-slate-400" />
            <p className="font-semibold text-sm text-slate-600">No se encontraron trabajadores registrados</p>
            <p className="text-xs text-slate-400">Puedes cargar un archivo de nómina (Excel, Word o PDF) o agregar manualmente.</p>
            {canManage && (
              <div className="flex justify-center gap-2 pt-2">
                <button onClick={() => setIsImportModalOpen(true)} className="btn-secondary text-xs">
                  <Upload size={14} /> Importar Archivo
                </button>
                <button onClick={handleOpenCreate} className="btn-primary text-xs">
                  <UserPlus size={14} /> Crear Trabajador
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Cédula</th>
                    <th className="py-3 px-4">Trabajador</th>
                    <th className="py-3 px-4">Cargo / Puesto</th>
                    <th className="py-3 px-4">Departamento</th>
                    <th className="py-3 px-4">Empresa / Sede</th>
                    <th className="py-3 px-4">Ingreso</th>
                    <th className="py-3 px-4">Estatus</th>
                    {canManage && <th className="py-3 px-4 text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(emp => (
                    <tr key={emp.id || emp._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {emp.cedula}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{emp.nombre}</div>
                        <div className="text-[10px] text-slate-400">{emp.email || emp.telefono || 'Sin datos de contacto'}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                        {emp.cargo}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        {emp.departamento || 'General'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 text-[11px]">{emp.empresaNombre || 'Duncan'}</div>
                        <div className="text-[10px] text-slate-400">{emp.sedeNombre || 'Sede Principal'}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {emp.fechaIngreso ? formatDate(emp.fechaIngreso) : '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                          emp.activo !== false ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
                        )}>
                          {emp.activo !== false ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      {canManage && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar datos"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(emp)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar de nómina"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <span>Mostrando <strong className="text-slate-800">{filtered.length}</strong> de <strong className="text-slate-800">{empleados.length}</strong> trabajadores registrados</span>
              <span className="font-semibold text-slate-600">{filtroEmpresa === 'TODAS' ? 'Nómina Consolidada 5 Empresas Grupo Duncan' : filtroEmpresa}</span>
            </div>
          </>
        )}
      </div>

      {/* MODAL 1: FORMULARIO CREAR / EDITAR TRABAJADOR */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 my-8"
            >
              <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-yellow-400 text-slate-900 rounded-lg">
                    {selectedEmpleado ? <Edit2 size={18} /> : <UserPlus size={18} />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {selectedEmpleado ? `Editar Trabajador: ${selectedEmpleado.nombre}` : 'Registrar Nuevo Trabajador'}
                    </h3>
                    <p className="text-xs text-slate-400">Base de datos de nómina y expediente laboral Duncan</p>
                  </div>
                </div>
                <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {/* 1. Datos de Identificación y Cargo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cédula de Identidad *</label>
                    <input
                      type="text"
                      placeholder="V-12345678 o E-82345678"
                      value={formData.cedula || ''}
                      onChange={e => setFormData({ ...formData, cedula: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 uppercase font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombres y Apellidos *</label>
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={formData.nombre || ''}
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cargo / Puesto de Trabajo *</label>
                    <input
                      type="text"
                      placeholder="ej: Operador de Ensamble, Chofer, Supervisor..."
                      value={formData.cargo || ''}
                      onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Departamento / Área *</label>
                    <input
                      type="text"
                      placeholder="ej: Producción, Logística, Mantenimiento..."
                      value={formData.departamento || ''}
                      onChange={e => setFormData({ ...formData, departamento: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400"
                      required
                    />
                  </div>
                </div>

                {/* 2. Empresa y Sede */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Empresa / Razón Social *</label>
                    <select
                      value={formData.empresaNombre || ''}
                      onChange={e => setFormData({ ...formData, empresaNombre: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                      required
                    >
                      {empresas.map(emp => (
                        <option key={emp._id} value={emp.nombre}>{emp.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sede / Establecimiento</label>
                    <select
                      value={formData.sedeNombre || ''}
                      onChange={e => setFormData({ ...formData, sedeNombre: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="">Selecciona establecimiento</option>
                      {establecimientos.map(est => (
                        <option key={est._id} value={est.nombre}>{est.nombre} ({est.tipo})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Fechas Laborales y Vacaciones */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fecha de Ingreso</label>
                    <input
                      type="date"
                      value={formData.fechaIngreso || ''}
                      onChange={e => setFormData({ ...formData, fechaIngreso: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Último Disfrute Vacacional</label>
                    <input
                      type="date"
                      value={formData.ultimoDisfruteVacacional || ''}
                      onChange={e => setFormData({ ...formData, ultimoDisfruteVacacional: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Días Vacaciones Pendientes</label>
                    <input
                      type="number"
                      value={formData.diasVacacionesPendientes ?? 15}
                      onChange={e => setFormData({ ...formData, diasVacacionesPendientes: parseInt(e.target.value) || 0 })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* 4. Contacto y Datos Personales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Teléfono</label>
                    <input
                      type="text"
                      placeholder="ej: 0414-1234567"
                      value={formData.telefono || ''}
                      onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="usuario@duncan.com"
                      value={formData.email || ''}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Género</label>
                    <select
                      value={formData.genero || 'M'}
                      onChange={e => setFormData({ ...formData, genero: e.target.value as any })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="M">Masculino (M)</option>
                      <option value="F">Femenino (F)</option>
                    </select>
                  </div>
                </div>

                {/* 5. Tallas de Dotación EPP */}
                <div className="p-3 bg-yellow-50/50 rounded-xl border border-yellow-200 space-y-2">
                  <div className="font-bold text-yellow-950 flex items-center gap-1.5">
                    <Shirt size={14} /> Tallas de Dotación EPP
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block">Talla Camisa:</label>
                      <input
                        type="text"
                        placeholder="S, M, L, XL..."
                        value={formData.tallaCamisa || ''}
                        onChange={e => setFormData({ ...formData, tallaCamisa: e.target.value.toUpperCase() })}
                        className="w-full p-2 border border-slate-200 rounded-lg uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block">Talla Pantalón:</label>
                      <input
                        type="text"
                        placeholder="30, 32, 34, 36..."
                        value={formData.tallaPantalon || ''}
                        onChange={e => setFormData({ ...formData, tallaPantalon: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block">Talla Calzado:</label>
                      <input
                        type="text"
                        placeholder="39, 40, 41, 42..."
                        value={formData.tallaCalzado || ''}
                        onChange={e => setFormData({ ...formData, tallaCalzado: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Contacto de Emergencia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contacto de Emergencia</label>
                    <input
                      type="text"
                      placeholder="Nombre del familiar"
                      value={formData.contactoEmergenciaNombre || ''}
                      onChange={e => setFormData({ ...formData, contactoEmergenciaNombre: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Teléfono de Emergencia</label>
                    <input
                      type="text"
                      placeholder="Teléfono del contacto"
                      value={formData.contactoEmergenciaTelefono || ''}
                      onChange={e => setFormData({ ...formData, contactoEmergenciaTelefono: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Estatus Activo */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="activoCheck"
                    checked={formData.activo !== false}
                    onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="activoCheck" className="font-bold text-slate-800">
                    Trabajador activo en nómina operativa
                  </label>
                </div>

                {/* Botones del Modal */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <Save size={14} /> Guardar Trabajador
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CARGA MASIVA MULTI-FORMATO (EXCEL, WORD, PDF) */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 my-8"
            >
              <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <Upload size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Importador Inteligente de Nómina</h3>
                    <p className="text-xs text-slate-400">Carga archivos Excel (.xlsx/.xls/.csv), Word (.docx) o PDF (.pdf)</p>
                  </div>
                </div>
                <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
                {/* Zona de Drop / Carga de Archivo */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 rounded-2xl text-center cursor-pointer transition-colors space-y-2"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv,.docx,.pdf"
                    className="hidden"
                  />
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-blue-600 shadow-sm border border-blue-100">
                    <FileType size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {importFile ? importFile.name : 'Haz clic o arrastra aquí el archivo de nómina'}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Soporta libros Excel (.xlsx, .xls), listados CSV, tablas de Word (.docx) y documentos PDF (.pdf)
                    </p>
                  </div>
                </div>

                {/* Estado de Procesamiento */}
                {parsing && (
                  <div className="p-4 bg-slate-50 rounded-xl text-center space-y-2">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
                    <p className="font-bold text-slate-700">Analizando estructura y detectando cédulas...</p>
                  </div>
                )}

                {/* Previsualización de Datos Detectados */}
                {parsedResult && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800">
                          {parsedResult.validRows.length} trabajadores identificados con éxito
                        </span>
                        <span className="text-slate-500 block text-[11px]">
                          Tipo de archivo: <strong className="uppercase font-mono">{parsedResult.fileType}</strong> • {parsedResult.fileName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold text-[11px]">
                          <input
                            type="checkbox"
                            checked={replaceExisting}
                            onChange={e => setReplaceExisting(e.target.checked)}
                            className="rounded text-blue-600"
                          />
                          Actualizar existentes si coincide Cédula
                        </label>
                      </div>
                    </div>

                    {/* Alertas o Advertencias */}
                    {parsedResult.warnings.length > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                        {parsedResult.warnings.map((w, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <AlertTriangle size={14} className="shrink-0 text-amber-600" />
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tabla de Muestra Previa (Primeros 10) */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="p-2.5 bg-slate-100 font-bold text-slate-700 text-[11px]">
                        Vista Previa de Importación (primeros registros):
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
                            <tr>
                              <th className="p-2">Cédula</th>
                              <th className="p-2">Trabajador</th>
                              <th className="p-2">Cargo</th>
                              <th className="p-2">Departamento</th>
                              <th className="p-2">Empresa</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {parsedResult.validRows.slice(0, 8).map((r, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="p-2 font-bold text-slate-900">{r.cedula}</td>
                                <td className="p-2 font-sans font-medium text-slate-800">{r.nombre}</td>
                                <td className="p-2 font-sans text-slate-600">{r.cargo}</td>
                                <td className="p-2 font-sans text-slate-500">{r.departamento}</td>
                                <td className="p-2 font-sans text-slate-500 truncate max-w-[150px]">{r.empresaNombre}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de Confirmación */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!parsedResult || parsedResult.validRows.length === 0 || importing}
                  onClick={handleConfirmImport}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  {importing ? (
                    <>
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                      Guardando en Base de Datos...
                    </>
                  ) : (
                    <>
                      <FileCheck size={15} /> Confirmar e Importar {parsedResult ? `(${parsedResult.validRows.length})` : ''}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
