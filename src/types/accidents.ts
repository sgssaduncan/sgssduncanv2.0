// ============================================================
// SGD DUNCAN 2.0 — ACCIDENTABILIDAD, MORBILIDAD Y ÁRBOL DE CAUSAS (INCLUSIONES V2)
// Normas: LOPCYMAT, F-465 INPSASEL, COVENIN 474-97
// ============================================================

export type TipoSuceso = 'ACCIDENTE_TRABAJO' | 'INCIDENTE_PELIGROSO' | 'ENFERMEDAD_OCUPACIONAL' | 'ACCIDENTE_ITINERE';

export type GravedadAccidente = 'LEVE' | 'MODERADO' | 'GRAVE' | 'MUY_GRAVE' | 'FATAL';

export interface AccidenteF465 {
  id: string;
  correlativo: string;
  fechaNotificacion: string;
  tipoSuceso: TipoSuceso;
  gravedad: GravedadAccidente;
  
  // Datos del Lesionado
  empleadoId: string;
  nombreCompleto: string;
  cedula: string;
  edad: number;
  genero: 'M' | 'F';
  cargo: string;
  antiguedadPuesto: string;
  departamento: string;
  sedeEmpresa: string;
  
  // Datos del Accidente
  fechaAccidente: string;
  horaAccidente: string;
  jornadaHoras: number;
  lugarExacto: string;
  actividadHabitual: boolean;
  descripcionDetallada: string;
  
  // Lesión y Días Perdidos
  tipoLesion: string; // ej: Quemadura ácida, Traumatismo, Aplastamiento
  parteCuerpoAfectada: string;
  agenteMaterial: string; // ej: Batería Duncan 4D, Ácido Sulfúrico, Montacargas
  diasReposoMedico: number;
  diasPerdidos: number;
  diasCargados: number;
  
  // Notificación INPSASEL
  notificadoINPSASEL: boolean;
  fechaNotificacionINPSASEL?: string;
  numeroRegistroINPSASEL?: string;
  comiteCSSLNotificado: boolean;
  
  // Asistente Árbol de Causas
  investigacionCompleta: boolean;
  investigadorId: string;
  investigadorNombre: string;
  arbolCausas?: InvestigacionArbolCausas;
  
  // Archivos y firmas
  archivosAdjuntos?: string[];
  firmaInvestigador?: string;
  firmaDelegadoPrevencion?: string;
  firmaRepresentantePatrono?: string;
}

export interface NodoCausa {
  id: string;
  tipo: 'HECHO' | 'VARIACION' | 'CAUSA_INMEDIATA' | 'CAUSA_BASICA';
  descripcion: string;
  categoria: 'INDIVIDUO' | 'TAREA' | 'MATERIAL' | 'MEDIO_AMBIENTE' | 'ORGANIZACION';
  padreId?: string;
}

export interface MedidaCorrectiva {
  id: string;
  accion: string;
  responsable: string;
  fechaCompromiso: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'CUMPLIDA';
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
}

export interface InvestigacionArbolCausas {
  accidenteId: string;
  fechaInvestigacion: string;
  equipoInvestigador: string[];
  hechoFinal: string;
  nodos: NodoCausa[];
  causasInmediatas: string[]; // Actos y Condiciones inseguras
  causasBasicas: string[];    // Factores personales y del trabajo
  medidasCorrectivas: MedidaCorrectiva[];
  conclusiones: string;
}

export interface EstadisticasAccidentalidad {
  periodoMes: string;
  periodoAnio: number;
  horasHombreTrabajadas: number;
  totalAccidentesConPerdida: number;
  totalAccidentesSinPerdida: number;
  totalIncidentes: number;
  totalDiasPerdidos: number;
  indiceFrecuenciaBruta: number; // (Total Accidentes * 1,000,000) / HHT
  indiceFrecuenciaNeta: number;  // (Accidentes con Reposo * 1,000,000) / HHT
  indiceSeveridad: number;       // (Total Días Perdidos * 1,000,000) / HHT
  tasaIncidencia: number;
}
