import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileSpreadsheet, 
  FileText, 
  Scale, 
  Calculator, 
  ShieldAlert, 
  Gauge, 
  Wrench, 
  ChevronRight,
  Navigation,
  Save,
  X,
  FileCheck,
  Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { dbService } from '../services/db';
import type { 
  ChecklistTransporte, 
  VehiculoFlota, 
  TipoChecklistTransporte, 
  SemaforoSalida, 
  ItemBateriaPeso 
} from '../types/transport';
import { exportCurrentViewData } from '../lib/exportUtils';
import SignaturePad from '../components/SignaturePad';
import InteractiveMap from '../components/InteractiveMap';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

// Modelos estándar de baterías Duncan con peso nominal unitario en Kg
const MODELOS_BATERIAS_DUNCAN: { codigo: string; nombre: string; pesoKg: number }[] = [
  { codigo: '24MR', nombre: 'Duncan 24MR (Automotriz)', pesoKg: 15.5 },
  { codigo: '34MR', nombre: 'Duncan 34MR (Automotriz)', pesoKg: 17.0 },
  { codigo: '27MR', nombre: 'Duncan 27MR (Camioneta / SUV)', pesoKg: 20.5 },
  { codigo: '31MR', nombre: 'Duncan 31MR (Trompa de Camión)', pesoKg: 26.0 },
  { codigo: '4D', nombre: 'Duncan 4D (Carga Pesada / Autobús)', pesoKg: 38.0 },
  { codigo: '8D', nombre: 'Duncan 8D (Carga Extra Pesada)', pesoKg: 55.0 },
  { codigo: '42MR', nombre: 'Duncan 42MR / 48MR (Compactos)', pesoKg: 14.0 },
  { codigo: 'USADO_CASCO', nombre: 'Casco Usado / Chatarra (Recuperación)', pesoKg: 16.0 },
];

export default function TransportePage() {
  const { profile } = useAuth();
  const [checklists, setChecklists] = useState<ChecklistTransporte[]>([]);
  const [vehiculos, setVehiculos] = useState<VehiculoFlota[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistTransporte | null>(null);

  // Form State
  const [tipoChecklist, setTipoChecklist] = useState<TipoChecklistTransporte>('DIARIA');
  const [selectedVehiculoId, setSelectedVehiculoId] = useState('');
  const [kilometraje, setKilometraje] = useState<number>(0);
  const [sedeOrigen, setSedeOrigen] = useState('Distribuidora Duncan Caracas');
  const [sedeDestino, setSedeDestino] = useState('');
  const [choferNombre, setChoferNombre] = useState('Luis Alberto Gómez');
  const [choferCedula, setChoferCedula] = useState('V-16890451');
  const [auxiliarNombre, setAuxiliarNombre] = useState(''); // Opcional según INCLUSIONES V2
  const [auxiliarCedula, setAuxiliarCedula] = useState('');

  // Control de Carga State
  const [tieneCarga, setTieneCarga] = useState(true);
  const [pesoManifiesto, setPesoManifiesto] = useState<number>(0);
  const [bateriasCarga, setBateriasCarga] = useState<Record<string, number>>({});
  const [usarCalculadora, setUsarCalculadora] = useState(false);

  // Respuestas técnicas
  const [respuestas, setRespuestas] = useState<Record<string, 'BUENO' | 'REGULAR' | 'MALO' | 'NO_APLICA'>>({});
  const [observaciones, setObservaciones] = useState('');
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [firmaChofer, setFirmaChofer] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [chkData, vehData] = await Promise.all([
        dbService.getTransporteChecklists(),
        dbService.getVehiculosFlota()
      ]);
      setChecklists(chkData);
      setVehiculos(vehData);
      if (vehData.length > 0 && !selectedVehiculoId) {
        setSelectedVehiculoId(vehData[0].id);
        setKilometraje(vehData[0].kilometrajeActual);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar datos de transporte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const vehiculoActual = vehiculos.find(v => v.id === selectedVehiculoId);

  // Cálculo de Carga en tiempo real
  const pesoCalculadoBaterias = Object.entries(bateriasCarga).reduce((acc, [codigo, cant]) => {
    const item = MODELOS_BATERIAS_DUNCAN.find(m => m.codigo === codigo);
    return acc + (item ? item.pesoKg * cant : 0);
  }, 0);

  const pesoTotalEfectivo = tieneCarga 
    ? (usarCalculadora ? pesoCalculadoBaterias : pesoManifiesto) 
    : 0;

  const capacidadNominal = vehiculoActual?.capacidadNominalKg || 10000;
  const porcentajeCapacidad = capacidadNominal > 0 ? (pesoTotalEfectivo / capacidadNominal) * 100 : 0;
  const excedeCapacidad = pesoTotalEfectivo > capacidadNominal;

  // Evaluación automática de fallas críticas y semáforo de salida
  const fallasCriticasDetectadas: string[] = [];
  const fallasMenoresDetectadas: string[] = [];

  Object.entries(respuestas).forEach(([item, estado]) => {
    if (estado === 'MALO') {
      if (
        item.includes('freno') || 
        item.includes('direccion') || 
        item.includes('neumatico') || 
        item.includes('luces_freno') ||
        item.includes('extintor')
      ) {
        fallasCriticasDetectadas.push(item);
      } else {
        fallasMenoresDetectadas.push(item);
      }
    }
  });

  let semaforoSalida: SemaforoSalida = 'VERDE';
  let motivoRestriccion = '';

  if (excedeCapacidad) {
    semaforoSalida = 'ROJO';
    motivoRestriccion = `SOBREPESO CRÍTICO: Carga (${pesoTotalEfectivo.toLocaleString()} Kg) excede la capacidad nominal (${capacidadNominal.toLocaleString()} Kg).`;
  } else if (fallasCriticasDetectadas.length > 0) {
    semaforoSalida = 'ROJO';
    motivoRestriccion = `FALLA CRÍTICA EN SEGURIDAD: ${fallasCriticasDetectadas.join(', ')}. Salida no autorizada según normativa SSA.`;
  } else if (porcentajeCapacidad > 90 || fallasMenoresDetectadas.length > 0) {
    semaforoSalida = 'AMARILLO';
    motivoRestriccion = `CONDICIÓN DE ADVERTENCIA: ${porcentajeCapacidad > 90 ? 'Carga cercana al límite (>90%). ' : ''}${fallasMenoresDetectadas.length > 0 ? 'Fallas menores reportadas.' : ''}`;
  }

  const handleBateriaCountChange = (codigo: string, delta: number) => {
    setBateriasCarga(prev => {
      const current = prev[codigo] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [codigo]: next };
    });
  };

  const handleSaveChecklist = async () => {
    if (!selectedVehiculoId || !choferNombre) {
      toast.error('Complete los datos obligatorios del vehículo y chofer.');
      return;
    }

    try {
      const itemsList: ItemBateriaPeso[] = Object.entries(bateriasCarga)
        .filter(([_, cant]) => cant > 0)
        .map(([codigo, cantidad]) => {
          const mod = MODELOS_BATERIAS_DUNCAN.find(m => m.codigo === codigo)!;
          return {
            codigo,
            referencia: mod.nombre,
            pesoUnitarioKg: mod.pesoKg,
            cantidad,
            subtotalKg: mod.pesoKg * cantidad
          };
        });

      await dbService.saveTransporteChecklist({
        tipoChecklist,
        vehiculoId: selectedVehiculoId,
        placa: vehiculoActual?.placa || '',
        marcaModelo: vehiculoActual?.marcaModelo || '',
        capacidadNominalKg: capacidadNominal,
        kilometraje,
        sedeOrigen,
        sedeDestino,
        choferId: 'chofer_01',
        choferNombre,
        choferCedula,
        auxiliarNombre: auxiliarNombre || undefined,
        auxiliarCedula: auxiliarCedula || undefined,
        tieneCarga,
        pesoManifiestoKg: pesoManifiesto,
        pesoCalculadoKg: pesoCalculadoBaterias,
        itemsBaterias: itemsList,
        pesoTotalKg: pesoTotalEfectivo,
        porcentajeCapacidad: Number(porcentajeCapacidad.toFixed(1)),
        excedeCapacidad,
        respuestas,
        fallasCriticas: fallasCriticasDetectadas,
        fallasMenores: fallasMenoresDetectadas,
        observaciones,
        semaforoSalida,
        motivoRestriccion: motivoRestriccion || undefined,
        coordenadas,
        firmaChofer: firmaChofer || undefined
      });

      toast.success(`Checklist ${tipoChecklist} registrado. Semáforo: ${semaforoSalida}`);
      setIsModalOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar el checklist');
    }
  };

  const handleExport = (format: 'excel' | 'csv') => {
    if (checklists.length === 0) {
      toast.error('No hay despachos para exportar');
      return;
    }
    const dataToExport = checklists.map(c => ({
      'Correlativo': c.correlativo,
      'Fecha': c.fecha,
      'Hora': c.hora,
      'Tipo Checklist': c.tipoChecklist,
      'Placa': c.placa,
      'Vehículo': c.marcaModelo,
      'Capacidad (Kg)': c.capacidadNominalKg,
      'Peso Manifiesto (Kg)': c.pesoManifiestoKg,
      'Peso Total (Kg)': c.pesoTotalKg,
      '% Capacidad': `${c.porcentajeCapacidad}%`,
      'Semáforo': c.semaforoSalida,
      'Chofer': c.choferNombre,
      'Cédula Chofer': c.choferCedula,
      'Auxiliar': c.auxiliarNombre || 'N/A (Solo chofer)',
      'Sede Origen': c.sedeOrigen,
      'Sede Destino': c.sedeDestino || 'N/A',
      'Observaciones': c.observaciones || ''
    }));

    exportCurrentViewData(dataToExport, format, `Historico_Transporte_Carga_Duncan_${new Date().toISOString().split('T')[0]}`);
    toast.success(`Exportados ${checklists.length} registros a ${format === 'excel' ? 'Excel' : 'CSV'}`);
  };

  const filteredChecklists = checklists.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.correlativo.toLowerCase().includes(q) ||
      c.placa.toLowerCase().includes(q) ||
      c.choferNombre.toLowerCase().includes(q) ||
      c.tipoChecklist.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-400 text-slate-900 rounded-xl shadow-sm">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Transporte, Flota y Control de Carga</h1>
            <p className="text-sm text-slate-500">
              Listas de Inspección (Diaria, Semanal, SSA), Calculadora de Baterías Servicentros y Semáforo de Salida
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Export Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm"
              title="Exportar histórico a Excel (.xlsx)"
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
            Nuevo Despacho / Checklist
          </button>
        </div>
      </div>

      {/* Flota de Vehículos Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vehiculos.map(v => (
          <div key={v.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 text-sm">{v.marcaModelo}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                {v.placa}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Capacidad Nominal:</span>
              <span className="font-bold text-slate-700">{v.capacidadNominalKg.toLocaleString()} Kg</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Margen Seguro:</span>
              <span className="font-semibold text-emerald-600">{v.margenSeguridadKg?.toLocaleString() || (v.capacidadNominalKg * 0.9).toLocaleString()} Kg</span>
            </div>
            <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
              <span>RACDA: {v.vencimientoRACDA || 'Vigente'}</span>
              <span className="font-semibold text-emerald-600">● Operativo</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por placa, correlativo, chofer o tipo de lista..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
        />
      </div>

      {/* Grid of Checklists */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 text-slate-400">
          Cargando registros de transporte...
        </div>
      ) : filteredChecklists.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 space-y-3">
          <Truck size={32} className="mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700">No hay checklists de transporte registrados</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Registra una nueva inspección vehicular antes de la salida para calcular la carga y verificar el semáforo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredChecklists.map(c => {
              const semaforoColor = 
                c.semaforoSalida === 'VERDE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                c.semaforoSalida === 'AMARILLO' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-red-50 text-red-700 border-red-200';

              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedItem(c)}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg">
                      {c.tipoChecklist} • {c.correlativo}
                    </span>
                    <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1", semaforoColor)}>
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {c.semaforoSalida === 'VERDE' ? 'Aprobado' : c.semaforoSalida === 'AMARILLO' ? 'Advertencia' : 'NO SALE'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{c.marcaModelo} ({c.placa})</h3>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <User size={13} className="text-slate-400" />
                      Chofer: {c.choferNombre} {c.auxiliarNombre ? `• Aux: ${c.auxiliarNombre}` : '• Solo chofer'}
                    </div>
                  </div>

                  {/* Barra de Capacidad */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Carga: {c.pesoTotalKg.toLocaleString()} Kg</span>
                      <span className="font-semibold">{c.porcentajeCapacidad}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          c.porcentajeCapacidad <= 90 ? "bg-emerald-500" :
                          c.porcentajeCapacidad <= 100 ? "bg-amber-500" : "bg-red-500"
                        )}
                        style={{ width: `${Math.min(100, c.porcentajeCapacidad)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                    <span>{c.fecha} {c.hora}</span>
                    <span className="font-semibold text-yellow-600">Ver Detalles &rarr;</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Nuevo Checklist con Calculadora de Baterías */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 my-8"
          >
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400 text-slate-900 rounded-lg">
                  <Truck size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Inspección de Vehículo y Control de Carga</h2>
                  <p className="text-sm text-slate-400">Protocolo de Despacho y Semáforo de Salida Duncan</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {/* Selector de Tipo de Checklist */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Tipo de Lista de Inspección
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['DIARIA', 'SEMANAL', 'SSA'] as TipoChecklistTransporte[]).map(tipo => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setTipoChecklist(tipo)}
                      className={cn(
                        "p-3 rounded-xl border text-center font-bold text-xs transition-colors",
                        tipoChecklist === tipo 
                          ? "bg-yellow-400 border-yellow-500 text-slate-900 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {tipo === 'DIARIA' && '1. Diaria (Pre-Salida)'}
                      {tipo === 'SEMANAL' && '2. Semanal (Mecánica)'}
                      {tipo === 'SSA' && '3. SSA (Seguridad/RACDA)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Datos del Vehículo y Personal */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck size={14} /> Vehículo y Conductor
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Vehículo Asignado *</label>
                    <select
                      value={selectedVehiculoId}
                      onChange={(e) => {
                        setSelectedVehiculoId(e.target.value);
                        const v = vehiculos.find(x => x.id === e.target.value);
                        if (v) setKilometraje(v.kilometrajeActual);
                      }}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none font-medium"
                    >
                      {vehiculos.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.marcaModelo} ({v.placa}) - Cap: {v.capacidadNominalKg.toLocaleString()} Kg
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Kilometraje Actual</label>
                    <input
                      type="number"
                      value={kilometraje}
                      onChange={(e) => setKilometraje(Number(e.target.value))}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Chofer Conductor *</label>
                    <input
                      type="text"
                      value={choferNombre}
                      onChange={(e) => setChoferNombre(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Auxiliar de Carga <span className="text-slate-400 font-normal">(Opcional - INCLUSIONES V2)</span>
                    </label>
                    <input
                      type="text"
                      value={auxiliarNombre}
                      onChange={(e) => setAuxiliarNombre(e.target.value)}
                      placeholder="Dejar vacío si va solo el chofer"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Control de Carga y Calculadora de Baterías Duncan */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale size={14} /> Control de Carga (Kg Manifiesto vs Capacidad Nominal)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setUsarCalculadora(!usarCalculadora)}
                    className="flex items-center gap-1 text-xs font-bold text-yellow-700 hover:text-yellow-800"
                  >
                    <Calculator size={13} />
                    {usarCalculadora ? 'Ingresar Peso Directo' : 'Abrir Calculadora de Baterías'}
                  </button>
                </div>

                {!usarCalculadora ? (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Peso Total según Manifiesto de Carga (Kg)
                    </label>
                    <input
                      type="number"
                      value={pesoManifiesto}
                      onChange={(e) => setPesoManifiesto(Number(e.target.value))}
                      placeholder="Ej. 7850"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none font-bold text-slate-800 text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">
                      Calculadora con pesos oficiales de baterías Duncan para Servicentros y Distribución:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {MODELOS_BATERIAS_DUNCAN.map(b => (
                        <div key={b.codigo} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-800">{b.nombre}</div>
                            <div className="text-[11px] text-slate-400">{b.pesoKg} Kg / unidad</div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleBateriaCountChange(b.codigo, -5)}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold">{bateriasCarga[b.codigo] || 0}</span>
                            <button
                              type="button"
                              onClick={() => handleBateriaCountChange(b.codigo, 5)}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resumen de Carga y Semáforo */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">Peso Total Estimado:</span>
                    <span className="font-bold text-base text-slate-900">{pesoTotalEfectivo.toLocaleString()} Kg</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">Capacidad Nominal Vehículo:</span>
                    <span className="font-bold text-slate-800">{capacidadNominal.toLocaleString()} Kg</span>
                  </div>

                  {/* Barra de Capacidad */}
                  <div className="space-y-1">
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          porcentajeCapacidad <= 90 ? "bg-emerald-500" :
                          porcentajeCapacidad <= 100 ? "bg-amber-500" : "bg-red-500"
                        )}
                        style={{ width: `${Math.min(100, porcentajeCapacidad)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>0 Kg</span>
                      <span>90% Margen Seguro</span>
                      <span>100% Límite</span>
                    </div>
                  </div>

                  {/* Visualización del Semáforo */}
                  <div className={cn(
                    "p-3 rounded-xl border flex items-center justify-between",
                    semaforoSalida === 'VERDE' && "bg-emerald-50 border-emerald-200 text-emerald-900",
                    semaforoSalida === 'AMARILLO' && "bg-amber-50 border-amber-200 text-amber-900",
                    semaforoSalida === 'ROJO' && "bg-red-50 border-red-200 text-red-900"
                  )}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span className={cn(
                        "w-3.5 h-3.5 rounded-full animate-pulse",
                        semaforoSalida === 'VERDE' && "bg-emerald-500",
                        semaforoSalida === 'AMARILLO' && "bg-amber-500",
                        semaforoSalida === 'ROJO' && "bg-red-500"
                      )} />
                      Semáforo de Salida: {semaforoSalida === 'VERDE' ? 'VERDE (AUTORIZADO)' : semaforoSalida === 'AMARILLO' ? 'AMARILLO (CON ADVERTENCIA)' : 'ROJO (NO SALE)'}
                    </div>
                    <span className="text-xs font-bold">{porcentajeCapacidad.toFixed(1)}%</span>
                  </div>
                  {motivoRestriccion && (
                    <div className="text-xs font-semibold text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                      {motivoRestriccion}
                    </div>
                  )}
                </div>
              </div>

              {/* Items de Inspección Técnica según Tipo */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench size={14} /> Puntos de Inspección ({tipoChecklist})
                </h3>

                <div className="space-y-2">
                  {(tipoChecklist === 'DIARIA' ? [
                    { id: 'luces_delanteras', label: 'Luces Delanteras y Altas' },
                    { id: 'luces_freno', label: 'Luces de Freno y Cruces' },
                    { id: 'frenos_servicio', label: 'Frenos de Servicio y Aire/Líquido' },
                    { id: 'neumaticos', label: 'Estado y Presión de Neumáticos' },
                    { id: 'niveles_aceite_agua', label: 'Niveles de Aceite, Refrigerante y Liga' },
                    { id: 'extintor_pqs', label: 'Extintor PQS Vigente y Sujeto' }
                  ] : tipoChecklist === 'SEMANAL' ? [
                    { id: 'sistema_direccion', label: 'Terminales y Caja de Dirección' },
                    { id: 'suspension_amortiguadores', label: 'Hojas de Ballestas y Amortiguadores' },
                    { id: 'bateria_propia', label: 'Bornes de Batería y Alternador' },
                    { id: 'gato_llave_repuesto', label: 'Gato Hidráulico, Llave de Cruz y Repuesto' }
                  ] : [
                    { id: 'botiquin_ssa', label: 'Botiquín de Primeros Auxilios SSA Completo' },
                    { id: 'permiso_racda', label: 'Guía RACDA y Fichas de Seguridad MSDS de Ácido' },
                    { id: 'epp_chofer', label: 'EPP del Conductor (Botas, Lentes, Guantes Nitrilo)' },
                    { id: 'kit_antiderrame', label: 'Kit de Neutralización de Derrames de Ácido' }
                  ]).map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <div className="flex gap-1">
                        {(['BUENO', 'REGULAR', 'MALO'] as const).map(op => (
                          <button
                            key={op}
                            type="button"
                            onClick={() => setRespuestas(prev => ({ ...prev, [item.id]: op }))}
                            className={cn(
                              "px-2 py-1 rounded text-[11px] font-bold border transition-colors",
                              respuestas[item.id] === op
                                ? (op === 'BUENO' ? 'bg-emerald-600 text-white border-emerald-600' :
                                   op === 'REGULAR' ? 'bg-amber-500 text-white border-amber-500' :
                                   'bg-red-600 text-white border-red-600')
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            )}
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geolocalización */}
              <InteractiveMap
                value={coordenadas}
                onChange={setCoordenadas}
                label="Geolocalización de Salida y Verificación de Fallas"
              />

              {/* Firma Chofer */}
              <SignaturePad
                label="Firma de Conformidad del Chofer Conductor"
                onSave={setFirmaChofer}
                defaultValue={firmaChofer}
              />
            </div>

            {/* Modal Footer */}
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
                onClick={handleSaveChecklist}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 font-bold rounded-xl shadow-sm transition-colors text-sm",
                  semaforoSalida === 'ROJO' 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "bg-yellow-400 hover:bg-yellow-500 text-slate-900"
                )}
              >
                <Save size={16} />
                {semaforoSalida === 'ROJO' ? 'Registrar Salida Bloqueada (ROJO)' : 'Autorizar y Registrar Salida'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Detalle de Checklist */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-100 my-8"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedItem.correlativo}</h2>
                <p className="text-xs text-slate-400">{selectedItem.tipoChecklist} • {selectedItem.marcaModelo} ({selectedItem.placa})</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-semibold text-slate-500">Semáforo de Salida:</div>
                  <div className="font-bold text-sm">{selectedItem.semaforoSalida}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-500">Carga Total:</div>
                  <div className="font-bold text-sm">{selectedItem.pesoTotalKg.toLocaleString()} Kg ({selectedItem.porcentajeCapacidad}%)</div>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-800">Conductor:</div>
                <div>{selectedItem.choferNombre} (C.I. {selectedItem.choferCedula})</div>
                <div>Auxiliar: {selectedItem.auxiliarNombre || 'N/A (Solo chofer)'}</div>
              </div>

              {selectedItem.itemsBaterias && selectedItem.itemsBaterias.length > 0 && (
                <div>
                  <div className="font-bold text-slate-800 mb-1">Detalle de Baterías Cargadas:</div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    {selectedItem.itemsBaterias.map(b => (
                      <div key={b.codigo} className="flex justify-between p-2 border-b border-slate-100">
                        <span>{b.referencia} x {b.cantidad}</span>
                        <span className="font-bold">{b.subtotalKg.toLocaleString()} Kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.firmaChofer && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="font-bold text-slate-700 mb-1">Firma del Conductor:</div>
                  <img src={selectedItem.firmaChofer} alt="Firma" className="h-16 border rounded bg-slate-50 p-1" />
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
