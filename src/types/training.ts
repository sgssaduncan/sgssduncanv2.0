// ============================================================
// SGD DUNCAN 2.0 — FORMACIÓN Y CAPACITACIONES (INCLUSIONES V2)
// Enfoque: RACDA Materiales Peligrosos (Baterías/Ácido/Plomo) cada 2 meses
// Manejo Defensivo, Operación de Montacargas, Inducción General
// ============================================================

export type TipoCapacitacion = 
  | 'RACDA_MATERIALES_PELIGROSOS'
  | 'MANEJO_DEFENSIVO'
  | 'MONTACARGAS_SEGURO'
  | 'INDUCCION_NUEVO_INGRESO'
  | 'LOTO_BLOQUEO_ENERGIA'
  | 'PRIMEROS_AUXILIOS_DERRAMES_ACIDO'
  | 'PREVENCION_INCENDIOS_EXTINTORES';

export type EstatusVigenciaCapacitacion = 'VIGENTE' | 'PROXIMO_A_VENCER' | 'VENCIDO';

export interface CapacitacionRegistro {
  id: string;
  codigoCurso: string;
  tipo: TipoCapacitacion;
  titulo: string;
  fechaEjecucion: string;
  duracionHoras: number;
  instructorNombre: string;
  enteCapacitador: 'INTERNO_SSA' | 'EXTERNO_CERTIFICADO';
  sedeNombre: string;
  
  // Participantes
  participantes: Array<{
    empleadoId: string;
    nombre: string;
    cedula: string;
    cargo: string;
    esChofer: boolean;
    asistio: boolean;
    calificacion?: number; // 0-20
    aprobado: boolean;
    fechaVencimiento: string; // RACDA cada 2 meses (60 días) para choferes
  }>;
  
  // Evidencias
  listaAsistenciaFoto?: string;
  materialApoyoUrl?: string;
  observaciones?: string;
}

export interface MatrizVigenciaPersonal {
  empleadoId: string;
  nombre: string;
  cedula: string;
  cargo: string;
  sede: string;
  esChofer: boolean;
  
  // Estatus RACDA (crítico para transporte de baterías Duncan)
  racdaUltimaFecha?: string;
  racdaProximaFecha?: string;
  racdaDiasRestantes?: number;
  racdaSemaforo: EstatusVigenciaCapacitacion;
  
  // Otros cursos obligatorios
  manejoDefensivoSemaforo?: EstatusVigenciaCapacitacion;
  montacargasSemaforo?: EstatusVigenciaCapacitacion;
  induccionCompleta: boolean;
  totalHorasAnio: number;
}
