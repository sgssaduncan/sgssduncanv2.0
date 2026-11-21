import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCheck2, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  FileSpreadsheet, 
  FileText, 
  Save, 
  X, 
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  Ban
} from 'lucide-react';
import type { CertificadoAptitudPsicofisica } from '../types/medical';
import { dbService } from '../services/db';
import { exportCurrentViewData } from '../lib/exportUtils';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function VexpressAptitudManager() {
  const [certificados, setCertificados] = useState<CertificadoAptitudPsicofisica[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCertificado, setSelectedCertificado] = useState<CertificadoAptitudPsicofisica | null>(null);

  // Form State
  const [lugar, setLugar] = useState('CARACAS');
  const [tipoEvaluacion, setTipoEvaluacion] = useState('Pre-Vacacional');
  const [cedula, setCedula] = useState('');
  const [codigoFicha, setCodigoFicha] = useState('');
  const [nombreApellido, setNombreApellido] = useState('');
  const [genero, setGenero] = useState('FEMENINO');
  const [edad, setEdad] = useState<number>(26);
  const [sucursal, setSucursal] = useState('CARACAS');
  const [empresaNombre, setEmpresaNombre] = useState('INVERSIONES 1286 C.A.');
  const [departamento, setDepartamento] = useState('COMPRAS INTERNACIONALES');
  const [cargo, setCargo] = useState('ANALISTA DE IMPORTACION');
  const [conceptoAptitud, setConceptoAptitud] = useState<CertificadoAptitudPsicofisica['conceptoAptitud']>('NO_EXISTE_CONTRAINDICACION');

  // Restricciones oficiales VEXPRESS
  const [noLevantar22Kg, setNoLevantar22Kg] = useState(false);
  const [noPolvoAcidoPlomo, setNoPolvoAcidoPlomo] = useState(false);
  const [noLugarRuidoso, setNoLugarRuidoso] = useState(false);
  const [evitarCaminarExceso, setEvitarCaminarExceso] = useState(false);
  const [evitarSentadoExceso, setEvitarSentadoExceso] = useState(false);
  const [evitarPieExceso, setEvitarPieExceso] = useState(false);
  const [soloHorasDiurnas, setSoloHorasDiurnas] = useState(false);
  const [noCuclillas, setNoCuclillas] = useState(false);
  const [botasOrtopedicas, setBotasOrtopedicas] = useState(false);
  const [instruidoHigiene, setInstruidoHigiene] = useState(true);
  const [instruidoPrimerosAux, setInstruidoPrimerosAux] = useState(true);
  const [otrasRestricciones, setOtrasRestricciones] = useState('');
  const [observaciones, setObservaciones] = useState('Sin contraindicación médica para sus labores habituales.');
  const [medicoNombre, setMedicoNombre] = useState('RAMOS MARTINEZ CARMEN ISMELDA');
  const [ciMedico, setCiMedico] = useState('6211215');
  const [numeroMSDS, setNumeroMSDS] = useState('43739');
  const [numeroCMV, setNumeroCMV] = useState('17585');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dbService.getAptitudesPsicofisicas();
      setCertificados(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar certificados de aptitud');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!nombreApellido || !cedula || !cargo) {
      toast.error('Complete los datos obligatorios del trabajador.');
      return;
    }

    try {
      const now = new Date();
      const fecha = now.toISOString().split('T')[0];
      const hora = now.toTimeString().split(' ')[0].substring(0, 5);

      await dbService.saveAptitudPsicofisica({
        fecha,
        hora,
        lugar,
        tipoEvaluacion,
        cedula,
        codigoFicha,
        nombreApellido,
        genero,
        edad,
        sucursal,
        empresaNombre,
        departamento,
        cargo,
        conceptoAptitud,
        restricciones: {
          noLevantarPesoMayor22Kg: noLevantar22Kg,
          noExposicionPolvoAcidoGasPlomo: noPolvoAcidoPlomo,
          noUbicarLugarRuidoso: noLugarRuidoso,
          evitarExcesivoCaminar: evitarCaminarExceso,
          evitarPosicionSentadaExceso: evitarSentadoExceso,
          evitarPosicionPieExceso: evitarPieExceso,
          trabajarSoloHorasDiurnas: soloHorasDiurnas,
          noPosicionCuclillas: noCuclillas,
          usoBotasCorreccionOrtopedica: botasOrtopedicas,
          instruidoSeguridadHigiene: instruidoHigiene,
          instruidoPrimerosAuxilios: instruidoPrimerosAux,
          otrasRestricciones
        },
        observacionesComentarios: observaciones,
        medicoNombre,
        ciMedico,
        numeroMSDS,
        numeroCMV
      });

      toast.success('Certificado de Aptitud Psicofísica emitido con éxito');
      setIsModalOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error('Error al emitir certificado APF');
    }
  };

  const handleExport = (format: 'excel' | 'csv') => {
    if (certificados.length === 0) {
      toast.error('No hay certificados para exportar');
      return;
    }
    const data = certificados.map(c => ({
      'Fecha': c.fecha,
      'Hora': c.hora,
      'Lugar': c.lugar,
      'Tipo Evaluación': c.tipoEvaluacion,
      'Cédula': c.cedula,
      'Ficha': c.codigoFicha || '',
      'Trabajador': c.nombreApellido,
      'Género': c.genero,
      'Edad': c.edad,
      'Empresa': c.empresaNombre,
      'Sucursal': c.sucursal,
      'Departamento': c.departamento,
      'Cargo': c.cargo,
      'Concepto Aptitud': c.conceptoAptitud,
      'Límite 22Kg': c.restricciones?.noLevantarPesoMayor22Kg ? 'SÍ' : 'NO',
      'No Ácidos/Plomo': c.restricciones?.noExposicionPolvoAcidoGasPlomo ? 'SÍ' : 'NO',
      'Observaciones': c.observacionesComentarios,
      'Médico': c.medicoNombre,
      'MSDS': c.numeroMSDS || '',
      'CMV': c.numeroCMV || ''
    }));

    exportCurrentViewData(data, format, `VEXPRESS_Certificados_APF_${new Date().toISOString().split('T')[0]}`);
    toast.success(`Datos exportados a ${format === 'excel' ? 'Excel (.xlsx)' : 'CSV'}`);
  };

  const getAptitudBadge = (aptitud: CertificadoAptitudPsicofisica['conceptoAptitud']) => {
    switch (aptitud) {
      case 'NO_EXISTE_CONTRAINDICACION':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">APTO SIN CONTRAINDICACIÓN</span>;
      case 'APTO_CON_LIMITACIONES':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">APTO CON RESTRICCIONES</span>;
      case 'TRATAMIENTO_MEDICO':
      case 'TRATAMIENTO_QUIRURGICO':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">TRATAMIENTO REQUERIDO</span>;
      case 'RECHAZADO_NO_APTO':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">NO APTO</span>;
      default:
        return null;
    }
  };

  const filtered = certificados.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.nombreApellido.toLowerCase().includes(q) ||
      c.cedula.toLowerCase().includes(q) ||
      c.cargo.toLowerCase().includes(q) ||
      c.tipoEvaluacion.toLowerCase().includes(q) ||
      c.sucursal.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Sub-header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileCheck2 size={18} className="text-emerald-600" />
            Certificados de Aptitud Psicofísica (REG_APF)
          </h2>
          <p className="text-xs text-slate-500">
            Dictamen legal de aptitud ocupacional, limitaciones biomecánicas y restricciones ambientales
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm"
              title="Exportar a Excel"
            >
              <FileSpreadsheet size={13} />
              Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1 px-2.5 py-1 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
              title="Exportar a CSV"
            >
              <FileText size={13} />
              CSV
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl font-bold text-xs shadow-sm transition-colors ml-auto sm:ml-0"
          >
            <Plus size={15} />
            + Emitir Certificado APF
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por trabajador, cédula, cargo o tipo de evaluación..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-slate-600 font-semibold">
            Limpiar
          </button>
        )}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            Cargando certificados APF...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            No se encontraron certificados de aptitud psicofísica.
          </div>
        ) : (
          filtered.map(c => {
            const hasRestricciones = Object.values(c.restricciones || {}).some(v => v === true || typeof v === 'string' && v.trim());
            return (
              <div 
                key={c.id} 
                onClick={() => setSelectedCertificado(c)}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {c.tipoEvaluacion}
                    </span>
                    {getAptitudBadge(c.conceptoAptitud)}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{c.nombreApellido}</h3>
                    <div className="text-[11px] text-slate-500">C.I. {c.cedula} • {c.cargo} • {c.sucursal}</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    <div className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                      Dictamen / Observaciones:
                    </div>
                    <p className="line-clamp-2 italic text-slate-600">"{c.observacionesComentarios}"</p>
                  </div>

                  {/* Badges de Restricciones Activas */}
                  {hasRestricciones && (
                    <div className="flex flex-wrap gap-1 text-[9px] pt-1">
                      {c.restricciones.noLevantarPesoMayor22Kg && (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-bold">
                          Máx 22 Kg
                        </span>
                      )}
                      {c.restricciones.noExposicionPolvoAcidoGasPlomo && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-bold">
                          No Plomo/Ácidos
                        </span>
                      )}
                      {c.restricciones.usoBotasCorreccionOrtopedica && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-bold">
                          Calzado Ortopédico
                        </span>
                      )}
                      {c.restricciones.trabajarSoloHorasDiurnas && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md font-bold">
                          Solo Horas Diurnas
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Fecha: {c.fecha} • {c.lugar}</span>
                  <span className="font-bold text-blue-600 hover:text-blue-800">Ver Certificado Oficial &rarr;</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Emisión APF */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 my-8"
          >
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FileCheck2 size={18} className="text-yellow-400" />
                  Emitir Certificado de Aptitud Psicofísica (REG_APF)
                </h3>
                <p className="text-xs text-slate-400">Certificación médico-laboral conforme a LOPCYMAT y V-EXPRESS</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 max-h-[75vh] overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Tipo de Evaluación</label>
                  <select
                    value={tipoEvaluacion}
                    onChange={(e) => setTipoEvaluacion(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                  >
                    <option value="Pre-Empleo">Pre-Empleo</option>
                    <option value="Pre-Vacacional">Pre-Vacacional</option>
                    <option value="Post-Vacacional">Post-Vacacional</option>
                    <option value="Ocupacional / Periódico">Ocupacional / Periódico</option>
                    <option value="Re-incorporación">Re-incorporación</option>
                    <option value="Reubicación">Reubicación</option>
                    <option value="Egreso">Egreso</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Lugar de Emisión</label>
                  <input
                    type="text"
                    value={lugar}
                    onChange={(e) => setLugar(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Cédula</label>
                  <input
                    type="text"
                    value={cedula}
                    placeholder="V-20123456"
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Ficha</label>
                  <input
                    type="text"
                    value={codigoFicha}
                    placeholder="222497"
                    onChange={(e) => setCodigoFicha(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Nombre y Apellido</label>
                  <input
                    type="text"
                    value={nombreApellido}
                    onChange={(e) => setNombreApellido(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Empresa</label>
                  <input
                    type="text"
                    value={empresaNombre}
                    onChange={(e) => setEmpresaNombre(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Sucursal</label>
                  <input
                    type="text"
                    value={sucursal}
                    onChange={(e) => setSucursal(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Cargo</label>
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Concepto de Aptitud */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Concepto Médico-Legal de Aptitud
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="aptitud"
                      checked={conceptoAptitud === 'NO_EXISTE_CONTRAINDICACION'}
                      onChange={() => setConceptoAptitud('NO_EXISTE_CONTRAINDICACION')}
                    />
                    <span className="font-bold text-emerald-800">Apto sin contraindicación</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="aptitud"
                      checked={conceptoAptitud === 'APTO_CON_LIMITACIONES'}
                      onChange={() => setConceptoAptitud('APTO_CON_LIMITACIONES')}
                    />
                    <span className="font-bold text-amber-800">Apto con limitaciones / restricciones</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="aptitud"
                      checked={conceptoAptitud === 'TRATAMIENTO_MEDICO'}
                      onChange={() => setConceptoAptitud('TRATAMIENTO_MEDICO')}
                    />
                    <span className="font-bold text-blue-800">Debe recibir tratamiento médico</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="aptitud"
                      checked={conceptoAptitud === 'RECHAZADO_NO_APTO'}
                      onChange={() => setConceptoAptitud('RECHAZADO_NO_APTO')}
                    />
                    <span className="font-bold text-red-800">No Apto / Rechazado</span>
                  </label>
                </div>
              </div>

              {/* Limitaciones y Restricciones VEXPRESS */}
              <div className="p-3 bg-yellow-50/60 border border-yellow-200 rounded-xl space-y-2">
                <span className="font-bold text-yellow-950 uppercase tracking-wider text-[11px] block">
                  Limitaciones y Restricciones Laborales (V-EXPRESS)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={noLevantar22Kg} onChange={(e) => setNoLevantar22Kg(e.target.checked)} />
                    No levantar/traccionar más de 22 Kg
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={noPolvoAcidoPlomo} onChange={(e) => setNoPolvoAcidoPlomo(e.target.checked)} />
                    No exponer a polvos, ácidos sulfúrico o plomo
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={noLugarRuidoso} onChange={(e) => setNoLugarRuidoso(e.target.checked)} />
                    No ubicar en áreas con ruido excesivo
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={evitarPieExceso} onChange={(e) => setEvitarPieExceso(e.target.checked)} />
                    Evitar bipedestación prolongada
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={soloHorasDiurnas} onChange={(e) => setSoloHorasDiurnas(e.target.checked)} />
                    Trabajar únicamente en horario diurno
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={botasOrtopedicas} onChange={(e) => setBotasOrtopedicas(e.target.checked)} />
                    Uso de botas con corrección ortopédica
                  </label>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Observaciones y Recomendaciones Clínicas</label>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  placeholder="Recomendaciones dietéticas, pausas activas, higiene postural..."
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-sm text-xs"
              >
                <Save size={15} />
                Emitir Certificado APF
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Detalle Oficial Certificado APF */}
      {selectedCertificado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-100 my-8"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center print:bg-white print:text-black">
              <div className="flex items-center gap-3">
                <img src="/duncan-logo-color.png" alt="Duncan" className="h-6 w-auto print:hidden" />
                <img src="/duncan-logo-bw.png" alt="Duncan" className="h-6 w-auto hidden print:block" />
                <div>
                  <h3 className="font-bold text-lg">Certificado de Aptitud Psicofísica</h3>
                  <p className="text-xs text-slate-400 print:text-slate-600">Servicios de Seguridad y Salud en el Trabajo (SSST)</p>
                </div>
              </div>
              <button onClick={() => setSelectedCertificado(null)} className="text-slate-400 hover:text-white print:hidden">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Evaluación: {selectedCertificado.tipoEvaluacion}</span>
                  <span>Fecha: {selectedCertificado.fecha}</span>
                </div>
                <div>Trabajador: <strong>{selectedCertificado.nombreApellido}</strong> • C.I. {selectedCertificado.cedula}</div>
                <div>Cargo: {selectedCertificado.cargo} • Sucursal: {selectedCertificado.sucursal} ({selectedCertificado.empresaNombre})</div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="text-[10px] text-emerald-800 uppercase font-semibold block">Concepto Médico Legal:</span>
                <span className="text-base font-black text-emerald-950">
                  {selectedCertificado.conceptoAptitud === 'NO_EXISTE_CONTRAINDICACION' ? 'APTO SIN CONTRAINDICACIÓN ACTUAL' :
                   selectedCertificado.conceptoAptitud === 'APTO_CON_LIMITACIONES' ? 'APTO CON RESTRICCIONES Y LIMITACIONES' :
                   selectedCertificado.conceptoAptitud}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Observaciones y Recomendaciones:</span>
                <p className="text-slate-700 italic">"{selectedCertificado.observacionesComentarios}"</p>
              </div>

              {/* Firmas */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="text-center">
                  <div className="border-b border-slate-400 h-12 mb-1"></div>
                  <div className="font-bold text-slate-700">{selectedCertificado.medicoNombre}</div>
                  <div className="text-[10px] text-slate-400">Médico Ocupacional • MSDS: {selectedCertificado.numeroMSDS || '43739'} • CMV: {selectedCertificado.numeroCMV || '17585'}</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-400 h-12 mb-1"></div>
                  <div className="font-bold text-slate-700">{selectedCertificado.nombreApellido}</div>
                  <div className="text-[10px] text-slate-400">Trabajador Evaluado (C.I. {selectedCertificado.cedula})</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                <Printer size={14} /> Imprimir Certificado
              </button>
              <button
                onClick={() => setSelectedCertificado(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
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
