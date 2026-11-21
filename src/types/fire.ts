// ============================================================
// SGD DUNCAN 2.0 — CARGA DE FUEGO E INCENDIOS (INCLUSIONES V2)
// Normas: COVENIN 1040, NFPA 10, COVENIN 823
// ============================================================

export type ClasificacionRiesgoIncendio = 'LEVE_BAJO' | 'ORDINARIO_MODERADO' | 'EXTRA_ALTO';

export interface CalculoCargaFuegoArea {
  id: string;
  sedeNombre: string;
  areaNombre: string; // ej: Almacén de Baterías, Carga de Ácido, Taller de Servicio, Oficinas
  superficieM2: number;
  clasificacionRiesgo: ClasificacionRiesgoIncendio;
  
  // Materiales Combustibles Presentes
  materiales: Array<{
    tipoMaterial: 'Madera/Paletas' | 'Plástico/Cajas Baterías' | 'Cartón/Embalaje' | 'Líquidos Inflamables/Solventes' | 'Gomas/Cables';
    pesoTotalKg: number;
    poderCalorificoMcalKg: number; // Kcal/kg o Mcal/kg
    caloriasSubtotalMcal: number;
  }>;
  
  cargaTermicaTotalMcal: number;
  densidadCargaCalorificaMcalM2: number; // Carga / Superficie m2
  potencialExtintorRequerido: string; // ej: "4-A : 40-B:C"
  cantidadExtintoresRequerida: number;
  cantidadExtintoresActuales: number;
  deficitExtintores: number;
  distanciaMaximaRecorridoMetros: number; // 15m para alto riesgo, 20m para ordinario
  cumpleNorma: boolean;
  observaciones: string;
}

export interface InspeccionCentralIncendio {
  id: string;
  sedeNombre: string;
  fechaInspeccion: string;
  inspectorNombre: string;
  
  // Sistema de Bombas Contra Incendio
  bombaPrincipalPresionPsi: number;
  bombaJockeyPresionPsi: number;
  arranqueAutomaticoProbado: boolean;
  nivelTanqueAguaM3: number;
  nivelTanquePorcentaje: number;
  valvulasSuccionDescargaAbiertas: boolean;
  
  // Panel de Alarma y Detección
  panelCentralOperativo: boolean;
  sensoresHumoOperativos: boolean;
  sensoresTemperaturaOperativos: boolean;
  estacionesManualesOperativas: boolean;
  bateriasRespaldoOperativas: boolean;
  
  // Rociadores y Mangueras
  redRociadoresPresurizada: boolean;
  mangueras2yMedioBuenEstado: boolean;
  siamesaBomberosDespejada: boolean;
  
  estatusFinal: 'OPERATIVO_CONFORME' | 'OBSERVACIONES_MENORES' | 'CRITICO_INOPERATIVO';
  fallasDetectadas: string[];
  firmasDigitales?: Record<string, string>;
}

export interface ExtintorEquipo {
  id: string;
  sedeNombre: string;
  codigoUbicacion: string; // ej: EXT-01, EXT-02
  tipoAgente: 'PQS ABC' | 'CO2' | 'Agua Presurizada' | 'Solkaflam / HFC' | 'Acetato Potasio (K)';
  capacidadLbs: number;
  fechaUltimaRecarga: string;
  fechaProximoVencimiento: string;
  diasParaVencer: number;
  estatusSemaforo: 'VIGENTE' | 'PROXIMO_A_VENCER' | 'VENCIDO';
  manometroPresionOk: boolean;
  precintoSeguridadOk: boolean;
  senalizacionVisible: boolean;
  alturaInstalacionMetros: number;
}

export interface PermisoBomberos {
  id: string;
  empresaNombre: string;
  localidadNombre: string;
  establecimientoNombre: string;
  fechaEmision: string;
  fechaVencimiento: string;
  periodicidad: 'Anual' | 'Semestral' | string;
  areaM2: number;
  estado: string;
  municipio: string;
  estatusVigencia: 'Vigente' | 'Próximo a Vencer' | 'Vencido';
  diasRestantes: number;
  numeroCertificado?: string;
  cuerpoBomberos?: string;
  contactoTelefono?: string;
  contactoCorreo?: string;
  observaciones?: string;
  elaboradoPor?: string;
  revisadoPor?: string;
  soporteUrl?: string;
  createdAt?: string;
}
