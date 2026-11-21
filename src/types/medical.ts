export type TipoEvaluacionMedica = 
  | 'PRE_EMPLEO'
  | 'PRE_VACACIONAL'
  | 'POST_VACACIONAL'
  | 'EGRESO'
  | 'ESPECIAL_PLOMBEMIA'
  | 'ESPECIAL'
  | 'ATENCION_MEDICA_PRIMARIA'
  | 'PERIODICA_ANUAL';

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
