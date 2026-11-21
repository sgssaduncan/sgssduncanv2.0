export type TipoEvaluacionMedica = 
  | 'PRE_EMPLEO'
  | 'PRE_VACACIONAL'
  | 'POST_VACACIONAL'
  | 'EGRESO'
  | 'ESPECIAL_PLOMBEMIA'
  | 'ESPECIAL'
  | 'ATENCION_MEDICA_PRIMARIA'
  | 'PERIODICA_ANUAL'
  | 'REINCORPORACION'
  | 'REUBICACION';

export type EstadoEvaluacionMedica = 
  | 'SOLICITADA'
  | 'AGENDADA'
  | 'REALIZADA'
  | 'CANCELADA';

export type AptitudMedica = 
  | 'APTO'
  | 'APTO_CON_RESTRICCIONES'
  | 'NO_APTO_TEMPORAL'
  | 'NO_APTO';

export interface EvaluacionMedica {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  empleadoCedula: string;
  empleadoCargo: string;
  empleadoDepartamento: string;
  empresaNombre?: string;
  establecimientoNombre?: string;
  tipoEvaluacion: TipoEvaluacionMedica;
  estado: EstadoEvaluacionMedica;
  fechaSolicitud: string;
  fechaAgendada?: string;
  fechaRealizada?: string;
  motivoConsulta?: string;
  
  // Vacacional
  fechaInicioVacaciones?: string;
  fechaReintegro?: string;
  diasVacacionesPendientes?: number;
  alertaFatiga?: boolean;
  
  // Resultados específicos de Baterías Duncan
  plombemiaPbB?: number; // µg/dL
  plombemiaALA?: number; // mg/g creatinina
  audiometria?: 'NORMAL' | 'HIPOACUSIA_LEVE' | 'HIPOACUSIA_MODERADA' | 'HIPOACUSIA_SEVERA';
  espirometria?: 'NORMAL' | 'PATRON_OBSTRUCTIVO' | 'PATRON_RESTRICTIVO';
  aptitud?: AptitudMedica;
  restricciones?: string;
  comentariosResultados?: string;
  
  // Autorización clínica / laboratorio
  clinicaAutorizada?: string;
  numeroAutorizacion?: string;
  medicoTratante?: string;
  archivosResultados?: string[];

  // Auditoría y firmas
  solicitadoPor: string;
  solicitadoPorNombre: string;
  firmaSolicitante?: string;
  firmaMedico?: string;
  firmaTrabajador?: string;
}

export interface AlertaVacaciones {
  empleadoId: string;
  empleadoNombre: string;
  cedula: string;
  cargo: string;
  departamento: string;
  establecimiento: string;
  diasVencidos: number;
  periodosVencidos: number;
  esChofer: boolean;
  nivelRiesgoFatiga: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
}

// ============================================================
// V-EXPRESS: VIGILANCIA EPIDEMIOLÓGICA Y SALUD OCUPACIONAL
// ============================================================

export interface ConsultaMedicaDiaria {
  id: string;
  fecha: string;
  hora: string;
  cedula: string;
  codigoFicha?: string;
  nombreApellido: string;
  genero: 'M' | 'F' | 'MASCULINO' | 'FEMENINO';
  edad: number;
  empresaNombre: string;
  departamento: string;
  sucursal: string;
  cargo: string;
  puesto?: string;
  turno?: string;
  supervisorInmediato?: string;
  tipoConsulta: 'Consulta 1' | 'Control' | 'Emergencia' | 'Adecuación' | 'Evaluación Brigadista' | string;
  enfermeroNombre?: string;
  medicoNombre: string;
  ciMedico?: string;
  numeroMSDS?: string;
  numeroCMV?: string;
  
  // Constantes y Signos Vitales
  temperaturaC?: number;
  saturacionO2?: number; // %
  frecuenciaCardiacaPpm?: number; // ppm
  presionSistolica?: number; // mmHg
  presionDiastolica?: number; // mmHg
  condicionPresion?: string;
  
  // Diagnóstico e Impresión Clínica
  impresionDiagnostica: string;
  diagnosticoDetallado?: string;
  sistemaAfectado: string;
  esInfecciosoContagioso: boolean;
  clasificacionGeneral: 'Enfermedad Común' | 'Accidente de Trabajo' | 'Accidente Común' | 'Enfermedad Ocupacional' | string;
  
  // Tratamiento Suministrado en Servicio
  tratamientoSuministrado?: string;
  medicamento?: string;
  viaSuministro?: string;
  cantidadSuministrada?: string;
  
  // Reposo Médico
  tieneReposo: boolean;
  fechaInicioReposo?: string;
  fechaReintegro?: string;
  diasReposo?: number;
  
  // Referencia a Especialista
  fueReferido: boolean;
  especialidadReferida?: string;
  motivoReferencia?: string;
  
  observacionesEvolucion?: string;
  createdAt?: string;
}

export interface ControlPresionArterial {
  id: string;
  fecha: string;
  hora: string;
  cedula: string;
  codigoFicha?: string;
  nombreApellido: string;
  genero: 'M' | 'F' | 'MASCULINO' | 'FEMENINO';
  edad: number;
  departamento: string;
  sucursal: string;
  cargo: string;
  diagnostico: string;
  presionSistolica: number;
  presionDiastolica: number;
  condicion: 'Óptima (<120/80)' | 'Normal (120-129/80-84)' | 'Normal Alta (130-139/85-89)' | 'HTA Grado 1 (140-159/90-99)' | 'HTA Grado 2 (160-179/100-109)' | 'Crisis Hipertensiva (≥180/110)' | string;
  medicamentoAntihipertensivo?: string;
  dosis?: string;
  administradoEnServicio: boolean;
  observaciones?: string;
  createdAt?: string;
}

export interface CertificadoAptitudPsicofisica {
  id: string;
  fecha: string;
  hora: string;
  lugar: string;
  tipoEvaluacion: string;
  cedula: string;
  codigoFicha?: string;
  nombreApellido: string;
  genero: string;
  edad: number;
  sucursal: string;
  empresaNombre: string;
  departamento: string;
  cargo: string;
  
  conceptoAptitud: 'NO_EXISTE_CONTRAINDICACION' | 'APTO_CON_LIMITACIONES' | 'TRATAMIENTO_MEDICO' | 'TRATAMIENTO_QUIRURGICO' | 'RECHAZADO_NO_APTO';
  
  restricciones: {
    noLevantarPesoMayor22Kg: boolean;
    noExposicionPolvoAcidoGasPlomo: boolean;
    noUbicarLugarRuidoso: boolean;
    evitarExcesivoCaminar: boolean;
    evitarPosicionSentadaExceso: boolean;
    evitarPosicionPieExceso: boolean;
    trabajarSoloHorasDiurnas: boolean;
    noPosicionCuclillas: boolean;
    usoBotasCorreccionOrtopedica: boolean;
    instruidoSeguridadHigiene: boolean;
    instruidoPrimerosAuxilios: boolean;
    otrasRestricciones?: string;
  };
  
  fueReferidoEspecialidad?: string;
  observacionesComentarios: string;
  medicoNombre: string;
  ciMedico?: string;
  numeroMSDS?: string;
  numeroCMV?: string;
  firmaMedico?: string;
  firmaTrabajador?: string;
  createdAt?: string;
}

export interface EvaluacionGoniometria {
  id: string;
  fecha: string;
  hora: string;
  cedula: string;
  codigoFicha?: string;
  nombreApellido: string;
  genero: string;
  edad: number;
  empresaNombre: string;
  departamento: string;
  sucursal: string;
  cargo: string;
  medicoNombre: string;
  
  cervical: {
    flexion: number; // 0-45
    extension: number; // 0-45
    rotacionIzq: number; // 0-60
    rotacionDer: number; // 0-60
    inclinacionIzq: number; // 0-45
    inclinacionDer: number; // 0-45
  };
  
  lumbar: {
    flexion: number; // 0-80
    extension: number; // 0-30
    rotacionIzq: number; // 0-45
    rotacionDer: number; // 0-45
    lateralizacionIzq: number; // 0-35
    lateralizacionDer: number; // 0-35
  };
  
  hombroDerecho: {
    flexion: number; // 0-180
    extension: number; // 0-60
    abduccion: number; // 0-180
    rotacionInterna: number; // 0-70
    rotacionExterna: number; // 0-90
  };
  hombroIzquierdo: {
    flexion: number;
    extension: number;
    abduccion: number;
    rotacionInterna: number;
    rotacionExterna: number;
  };
  
  diagnosticoBiomecanico: string;
  limitacionFuncionalDetectada: boolean;
  observaciones?: string;
  createdAt?: string;
}

export interface MorbilidadReporteItem {
  sistema: string;
  diagnostico: string;
  totalCasos: number;
  casosMasculino: number;
  casosFemenino: number;
  diasReposoAcumulados: number;
  porcentaje: number;
}
