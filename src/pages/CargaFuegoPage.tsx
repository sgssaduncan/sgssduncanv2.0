import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Plus, 
  Search, 
  Calendar, 
  Calculator, 
  ShieldCheck, 
  ShieldAlert, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  X,
  Save,
  Wrench,
  Gauge,
  Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { dbService } from '../services/db';
import type { 
  CalculoCargaFuegoArea, 
  InspeccionCentralIncendio, 
  ExtintorEquipo,
  PermisoBomberos,
  ClasificacionRiesgoIncendio 
} from '../types/fire';
import { exportCurrentViewData } from '../lib/exportUtils';
import { cn } from '../lib/utils';
import { generarCertificadoCargaFuegoPDF } from '../lib/pdfGenerator';
import toast from 'react-hot-toast';

export default function CargaFuegoPage() {
  const { profile } = useAuth();
  const [cargas, setCargas] = useState<CalculoCargaFuegoArea[]>([]);
  const [extintores, setExtintores] = useState<ExtintorEquipo[]>([]);
  const [permisos, setPermisos] = useState<PermisoBomberos[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'calculadora' | 'extintores' | 'permisos-bomberos'>('calculadora');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCalculadoraOpen, setIsCalculadoraOpen] = useState(false);
  const [isPermisoModalOpen, setIsPermisoModalOpen] = useState(false);

  // Form State Permiso de Bomberos
  const [pbEmpresa, setPbEmpresa] = useState('DISTRIBUIDORA DUNCAN, C.A.');
  const [pbLocalidad, setPbLocalidad] = useState('VALENCIA');
  const [pbEstablecimiento, setPbEstablecimiento] = useState('SERVICENTRO GUACARA');
  const [pbEmision, setPbEmision] = useState(new Date().toISOString().split('T')[0]);
  const [pbVencimiento, setPbVencimiento] = useState(new Date(Date.now() + 365*24*3600*1000).toISOString().split('T')[0]);
  const [pbArea, setPbArea] = useState<number>(450);
  const [pbEstado, setPbEstado] = useState('Carabobo');
  const [pbMunicipio, setPbMunicipio] = useState('Guacara');
  const [pbCertificado, setPbCertificado] = useState('');
  const [pbCuerpoBomberos, setPbCuerpoBomberos] = useState('');
  const [pbTelefono, setPbTelefono] = useState('');
  const [pbCorreo, setPbCorreo] = useState('');
  const [pbObservaciones, setPbObservaciones] = useState('');

  // Form State Calculadora COVENIN / NFPA
  const [sedeNombre, setSedeNombre] = useState('Distribuidora Duncan Caracas');
  const [areaNombre, setAreaNombre] = useState('Almacén Central de Baterías');
  const [superficieM2, setSuperficieM2] = useState<number>(650);
  const [riesgo, setRiesgo] = useState<ClasificacionRiesgoIncendio>('EXTRA_ALTO');
  
  // Materiales combustibles y poder calorífico (Mcal/Kg)
  const [pesoPlastico, setPesoPlastico] = useState<number>(12000); // 9.5 Mcal/kg
  const [pesoMadera, setPesoMadera] = useState<number>(8500);     // 4.5 Mcal/kg
  const [pesoCarton, setPesoCarton] = useState<number>(2000);     // 4.0 Mcal/kg
  const [extintoresActuales, setExtintoresActuales] = useState<number>(8);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cData, eData, pData] = await Promise.all([
        dbService.getCargasFuego(),
        dbService.getExtintores(),
        dbService.getPermisosBomberos()
      ]);
      setCargas(cData);
      setExtintores(eData);
      setPermisos(pData);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar datos contra incendios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cálculos COVENIN 1040 / NFPA 10
  const calPlastico = pesoPlastico * 9.5;
  const calMadera = pesoMadera * 4.5;
  const calCarton = pesoCarton * 4.0;
  const cargaTermicaTotal = calPlastico + calMadera + calCarton;
  const densidadCarga = superficieM2 > 0 ? (cargaTermicaTotal / superficieM2) : 0;
  
  // Requerimiento de extintores según NFPA: 1 extintor cada 150m2 para riesgo alto, cada 200m2 para ordinario
  const factorArea = riesgo === 'EXTRA_ALTO' ? 80 : riesgo === 'ORDINARIO_MODERADO' ? 150 : 250;
  const extintoresRequeridos = Math.ceil(superficieM2 / factorArea);
  const deficit = Math.max(0, extintoresRequeridos - extintoresActuales);
  const cumple = extintoresActuales >= extintoresRequeridos;

  const handleSaveCalculo = async () => {
    try {
      await dbService.saveCargaFuego({
        sedeNombre,
        areaNombre,
        superficieM2,
        clasificacionRiesgo: riesgo,
        materiales: [
          { tipoMaterial: 'Plástico/Cajas Baterías', pesoTotalKg: pesoPlastico, poderCalorificoMcalKg: 9.5, caloriasSubtotalMcal: calPlastico },
          { tipoMaterial: 'Madera/Paletas', pesoTotalKg: pesoMadera, poderCalorificoMcalKg: 4.5, caloriasSubtotalMcal: calMadera },
          { tipoMaterial: 'Cartón/Embalaje', pesoTotalKg: pesoCarton, poderCalorificoMcalKg: 4.0, caloriasSubtotalMcal: calCarton }
        ],
        cargaTermicaTotalMcal: cargaTermicaTotal,
        densidadCargaCalorificaMcalM2: Number(densidadCarga.toFixed(1)),
        potencialExtintorRequerido: riesgo === 'EXTRA_ALTO' ? '4-A : 80-B:C' : '2-A : 40-B:C',
        cantidadExtintoresRequerida: extintoresRequeridos,
        cantidadExtintoresActuales: extintoresActuales,
        deficitExtintores: deficit,
        distanciaMaximaRecorridoMetros: riesgo === 'EXTRA_ALTO' ? 15 : 20,
        cumpleNorma: cumple,
        observaciones: `Cálculo realizado según COVENIN 1040 y NFPA 10 para ${areaNombre}.`
      });

      toast.success('Cálculo de carga calorífica guardado');
      setIsCalculadoraOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar cálculo');
    }
  };

  const handleSavePermiso = async () => {
    try {
      const vDate = new Date(pbVencimiento).getTime();
      const now = Date.now();
      const diffDays = Math.ceil((vDate - now) / (1000 * 3600 * 24));
      const estatus: 'Vigente' | 'Próximo a Vencer' | 'Vencido' = 
        diffDays <= 0 ? 'Vencido' : diffDays <= 60 ? 'Próximo a Vencer' : 'Vigente';

      await dbService.savePermisoBomberos({
        empresaNombre: pbEmpresa,
        localidadNombre: pbLocalidad,
        establecimientoNombre: pbEstablecimiento,
        fechaEmision: pbEmision,
        fechaVencimiento: pbVencimiento,
        periodicidad: 'Anual',
        areaM2: pbArea,
        estado: pbEstado,
        municipio: pbMunicipio,
        estatusVigencia: estatus,
        diasRestantes: diffDays,
        numeroCertificado: pbCertificado,
        cuerpoBomberos: pbCuerpoBomberos,
        contactoTelefono: pbTelefono,
        contactoCorreo: pbCorreo,
        observaciones: pbObservaciones,
        elaboradoPor: profile?.nombre || 'Inspector SSA Duncan',
        revisadoPor: 'Gerencia General SSA Duncan'
      });

      toast.success('Permiso de Bomberos registrado correctamente');
      setIsPermisoModalOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar permiso de bomberos');
    }
  };

  const handleExport = (format: 'excel' | 'csv') => {
    if (activeTab === 'calculadora') {
      const data = cargas.map(c => ({
        'Sede': c.sedeNombre,
        'Área': c.areaNombre,
        'Superficie (m2)': c.superficieM2,
        'Riesgo': c.clasificacionRiesgo,
        'Carga Térmica (Mcal)': c.cargaTermicaTotalMcal,
        'Densidad (Mcal/m2)': c.densidadCargaCalorificaMcalM2,
        'Extintores Requeridos': c.cantidadExtintoresRequerida,
        'Extintores Actuales': c.cantidadExtintoresActuales,
        'Déficit': c.deficitExtintores,
        'Cumple Norma': c.cumpleNorma ? 'SÍ' : 'NO'
      }));
      exportCurrentViewData(data, format, `Carga_Fuego_COVENIN_${new Date().toISOString().split('T')[0]}`);
    } else if (activeTab === 'extintores') {
      const data = extintores.map(e => ({
        'Sede': e.sedeNombre,
        'Código': e.codigoUbicacion,
        'Agente': e.tipoAgente,
        'Capacidad (Lbs)': e.capacidadLbs,
        'Última Recarga': e.fechaUltimaRecarga,
        'Próximo Vencimiento': e.fechaProximoVencimiento,
        'Días Restantes': e.diasParaVencer,
        'Semáforo': e.estatusSemaforo,
        'Manómetro OK': e.manometroPresionOk ? 'SÍ' : 'NO'
      }));
      exportCurrentViewData(data, format, `Control_Extintores_Duncan_${new Date().toISOString().split('T')[0]}`);
    } else {
      const data = permisos.map(p => ({
        'Empresa': p.empresaNombre,
        'Localidad': p.localidadNombre,
        'Establecimiento': p.establecimientoNombre,
        'Fecha de Emisión': p.fechaEmision,
        'Fecha de Vencimiento': p.fechaVencimiento,
        'Periodicidad': p.periodicidad,
        'Área (m2)': p.areaM2,
        'Estado': p.estado,
        'Municipio': p.municipio,
        'Vigencia': p.estatusVigencia,
        'Días Restantes': p.diasRestantes,
        'N° Certificado': p.numeroCertificado || '',
        'Cuerpo de Bomberos': p.cuerpoBomberos || '',
        'Teléfono': p.contactoTelefono || '',
        'Correo': p.contactoCorreo || '',
        'Observaciones': p.observaciones || ''
      }));
      exportCurrentViewData(data, format, `Vigencia_Permisos_Bomberos_Duncan_${new Date().toISOString().split('T')[0]}`);
    }
    toast.success(`Datos exportados a ${format === 'excel' ? 'Excel' : 'CSV'}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-400 text-slate-900 rounded-xl shadow-sm">
            <Flame size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Carga Calorífica, Incendios y Extintores</h1>
            <p className="text-sm text-slate-500">
              Calculadora de Carga de Fuego COVENIN 1040 / NFPA 10, Inspección Central de Incendios y Control de Extintores
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
            onClick={() => setIsCalculadoraOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl font-bold text-xs shadow-sm transition-colors"
          >
            <Calculator size={15} />
            Calcular Carga
          </button>

          <button
            onClick={() => setIsPermisoModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
          >
            <ShieldCheck size={15} className="text-yellow-400" />
            + Registrar Permiso Bomberos
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('calculadora')}
          className={cn(
            "px-4 py-2 text-sm font-bold rounded-xl transition-colors whitespace-nowrap",
            activeTab === 'calculadora' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          Cálculos de Carga Calorífica ({cargas.length})
        </button>
        <button
          onClick={() => setActiveTab('extintores')}
          className={cn(
            "px-4 py-2 text-sm font-bold rounded-xl transition-colors whitespace-nowrap",
            activeTab === 'extintores' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          Control de Extintores ({extintores.length})
        </button>
        <button
          onClick={() => setActiveTab('permisos-bomberos')}
          className={cn(
            "px-4 py-2 text-sm font-bold rounded-xl transition-colors whitespace-nowrap",
            activeTab === 'permisos-bomberos' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          Permisos de Bomberos ({permisos.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'calculadora' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cargas.map(c => (
            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{c.areaNombre}</h3>
                  <div className="text-xs text-slate-500">{c.sedeNombre} • {c.superficieM2} m²</div>
                </div>
                <span className={cn(
                  "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                  c.cumpleNorma ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                )}>
                  {c.cumpleNorma ? 'Cumple COVENIN / NFPA' : `Déficit: ${c.deficitExtintores} extintores`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Carga Térmica Total:</span>
                  <span className="font-bold text-slate-800 text-sm">{c.cargaTermicaTotalMcal.toLocaleString()} Mcal</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Densidad Calorífica:</span>
                  <span className="font-bold text-slate-800 text-sm">{c.densidadCargaCalorificaMcalM2} Mcal/m²</span>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-950 space-y-1">
                <div className="flex justify-between">
                  <span>Potencial Requerido:</span>
                  <span className="font-bold">{c.potencialExtintorRequerido}</span>
                </div>
                <div className="flex justify-between">
                  <span>Extintores Necesarios:</span>
                  <span className="font-bold">{c.cantidadExtintoresRequerida} unidades</span>
                </div>
                <div className="flex justify-between">
                  <span>Extintores Instalados:</span>
                  <span className="font-bold">{c.cantidadExtintoresActuales} unidades</span>
                </div>
                <div className="flex justify-between">
                  <span>Distancia Máxima:</span>
                  <span className="font-bold">{c.distanciaMaximaRecorridoMetros} metros</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    try {
                      const { doc, fileName } = generarCertificadoCargaFuegoPDF(c);
                      doc.save(fileName);
                      toast.success('Certificado Técnico de Carga de Fuego descargado');
                    } catch (err) {
                      console.error(err);
                      toast.error('Error generando certificado PDF');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download size={13} /> Certificado COVENIN / NFPA (PDF)
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'extintores' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {extintores.map(e => (
            <div key={e.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-800 text-sm">{e.codigoUbicacion}</span>
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full border",
                  e.estatusSemaforo === 'VIGENTE' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  e.estatusSemaforo === 'PROXIMO_A_VENCER' ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-red-50 text-red-700 border-red-200"
                )}>
                  {e.estatusSemaforo === 'VIGENTE' ? 'Vigente' : e.estatusSemaforo === 'PROXIMO_A_VENCER' ? 'Próximo a Vencer' : 'Vencido'}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {e.tipoAgente} • {e.capacidadLbs} Lbs • {e.sedeNombre}
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Última Recarga:</span>
                  <span className="font-semibold text-slate-700">{e.fechaUltimaRecarga}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vence:</span>
                  <span className="font-semibold text-slate-700">{e.fechaProximoVencimiento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Días Restantes:</span>
                  <span className="font-bold text-emerald-700">{e.diasParaVencer} días</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Tabla de Permisos de Bomberos */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Control Nacional de Vigencia de Permisos de Bomberos</h3>
              <p className="text-xs text-slate-500">Vistos Buenos y Certificados de Prevención e Inspección de Incendios en los 70 locales Duncan</p>
            </div>
            <button
              onClick={() => setIsPermisoModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              <Plus size={14} className="text-yellow-400" /> Nuevo Registro
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Empresa / Localidad</th>
                  <th className="p-3">Establecimiento</th>
                  <th className="p-3">N° Certificado / Cuerpo</th>
                  <th className="p-3">Emisión</th>
                  <th className="p-3">Vencimiento</th>
                  <th className="p-3">Área (m²)</th>
                  <th className="p-3">Estado / Municipio</th>
                  <th className="p-3">Vigencia (Semáforo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permisos.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-800">
                      <div>{p.empresaNombre}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{p.localidadNombre}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-700">{p.establecimientoNombre}</td>
                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-800">{p.numeroCertificado || 'S/N'}</div>
                      <div className="text-[10px] text-slate-500">{p.cuerpoBomberos || 'Cuerpo Municipal'}</div>
                    </td>
                    <td className="p-3 text-slate-600">{p.fechaEmision}</td>
                    <td className="p-3 text-slate-600 font-medium">{p.fechaVencimiento}</td>
                    <td className="p-3 font-bold text-slate-700">{p.areaM2} m²</td>
                    <td className="p-3 text-slate-600">{p.estado} / {p.municipio}</td>
                    <td className="p-3">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border",
                        p.estatusVigencia === 'Vigente' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        p.estatusVigencia === 'Próximo a Vencer' ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-red-50 text-red-700 border-red-200"
                      )}>
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          p.estatusVigencia === 'Vigente' ? "bg-emerald-500" :
                          p.estatusVigencia === 'Próximo a Vencer' ? "bg-amber-500" : "bg-red-500"
                        )} />
                        {p.estatusVigencia} ({p.diasRestantes}d)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Calculadora */}
      {isCalculadoraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 my-8"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Calculadora de Carga Calorífica (COVENIN 1040 / NFPA 10)</h2>
                <p className="text-sm text-slate-400">Dimensionamiento de Potencial de Extinción para Baterías Duncan</p>
              </div>
              <button onClick={() => setIsCalculadoraOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Sede Duncan</label>
                  <input
                    type="text"
                    value={sedeNombre}
                    onChange={(e) => setSedeNombre(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Área o Departamento</label>
                  <input
                    type="text"
                    value={areaNombre}
                    onChange={(e) => setAreaNombre(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Superficie Total (m²)</label>
                  <input
                    type="number"
                    value={superficieM2}
                    onChange={(e) => setSuperficieM2(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Clasificación de Riesgo</label>
                  <select
                    value={riesgo}
                    onChange={(e) => setRiesgo(e.target.value as ClasificacionRiesgoIncendio)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                  >
                    <option value="EXTRA_ALTO">Extra / Alto (Almacén de Baterías / Carga Ácida)</option>
                    <option value="ORDINARIO_MODERADO">Ordinario / Moderado (Talleres Servicentro)</option>
                    <option value="LEVE_BAJO">Leve / Bajo (Oficinas Administrativas)</option>
                  </select>
                </div>
              </div>

              {/* Materiales Combustibles */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Materiales Combustibles Presentes (Kg)
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Plásticos (9.5 Mcal/kg)</label>
                    <input
                      type="number"
                      value={pesoPlastico}
                      onChange={(e) => setPesoPlastico(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Madera (4.5 Mcal/kg)</label>
                    <input
                      type="number"
                      value={pesoMadera}
                      onChange={(e) => setPesoMadera(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Cartón (4.0 Mcal/kg)</label>
                    <input
                      type="number"
                      value={pesoCarton}
                      onChange={(e) => setPesoCarton(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Resultado del Cálculo */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl space-y-2 text-xs text-yellow-950">
                <div className="flex justify-between font-bold text-sm">
                  <span>Carga Térmica Total:</span>
                  <span>{cargaTermicaTotal.toLocaleString()} Mcal ({densidadCarga.toFixed(1)} Mcal/m²)</span>
                </div>
                <div className="flex justify-between">
                  <span>Extintores Requeridos según Norma:</span>
                  <span className="font-bold text-slate-900">{extintoresRequeridos} extintores</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-yellow-200">
                  <span>Extintores Actuales en Área:</span>
                  <input
                    type="number"
                    value={extintoresActuales}
                    onChange={(e) => setExtintoresActuales(Number(e.target.value))}
                    className="w-16 text-center text-xs p-1 bg-white border border-yellow-300 rounded font-bold"
                  />
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>Estatus:</span>
                  <span className={cumple ? "text-emerald-700" : "text-red-700"}>
                    {cumple ? 'CUMPLE CON LA NORMA' : `DÉFICIT DE ${deficit} EXTINTORES`}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCalculadoraOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCalculo}
                className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-sm text-sm"
              >
                <Save size={16} />
                Guardar Cálculo COVENIN
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Modal Permiso de Bomberos */}
      {isPermisoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-100 my-8"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Registrar Permiso de Bomberos</h2>
                <p className="text-sm text-slate-400">Inspección de Prevención y Vigencia Legal de Establecimiento</p>
              </div>
              <button onClick={() => setIsPermisoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Empresa</label>
                  <select
                    value={pbEmpresa}
                    onChange={(e) => setPbEmpresa(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                  >
                    <option value="DISTRIBUIDORA DUNCAN, C.A.">DISTRIBUIDORA DUNCAN, C.A.</option>
                    <option value="ACUMULADORES DUNCAN, C.A.">ACUMULADORES DUNCAN, C.A.</option>
                    <option value="INVERSIONES 1286, C.A.">INVERSIONES 1286, C.A.</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Localidad</label>
                  <input
                    type="text"
                    value={pbLocalidad}
                    onChange={(e) => setPbLocalidad(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Establecimiento / Servicentro</label>
                <input
                  type="text"
                  value={pbEstablecimiento}
                  onChange={(e) => setPbEstablecimiento(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Fecha Emisión</label>
                  <input
                    type="date"
                    value={pbEmision}
                    onChange={(e) => setPbEmision(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Fecha Vencimiento</label>
                  <input
                    type="date"
                    value={pbVencimiento}
                    onChange={(e) => setPbVencimiento(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Área (m²)</label>
                  <input
                    type="number"
                    value={pbArea}
                    onChange={(e) => setPbArea(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Estado</label>
                  <input
                    type="text"
                    value={pbEstado}
                    onChange={(e) => setPbEstado(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Municipio</label>
                  <input
                    type="text"
                    value={pbMunicipio}
                    onChange={(e) => setPbMunicipio(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">N° Certificado / Oficio</label>
                  <input
                    type="text"
                    value={pbCertificado}
                    placeholder="CB-2025-012"
                    onChange={(e) => setPbCertificado(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Cuerpo de Bomberos</label>
                  <input
                    type="text"
                    value={pbCuerpoBomberos}
                    placeholder="Bomberos Municipales"
                    onChange={(e) => setPbCuerpoBomberos(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={pbTelefono}
                    placeholder="0241-1234567"
                    onChange={(e) => setPbTelefono(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={pbCorreo}
                    placeholder="contacto@bomberos.gob.ve"
                    onChange={(e) => setPbCorreo(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Observaciones</label>
                <textarea
                  value={pbObservaciones}
                  rows={2}
                  onChange={(e) => setPbObservaciones(e.target.value)}
                  placeholder="Detalles de la inspección, observaciones del cuerpo de bomberos..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPermisoModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePermiso}
                className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-sm text-sm"
              >
                <Save size={16} />
                Guardar Permiso
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
