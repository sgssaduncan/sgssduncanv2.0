// ============================================================
// SGD DUNCAN 2.0 — LOTO (LOCKOUT / TAGOUT) TIPOS
// ============================================================

export type TipoEnergiaLoto = 
  | 'Eléctrica' 
  | 'Neumática' 
  | 'Hidráulica' 
  | 'Térmica' 
  | 'Química' 
  | 'Mecánica' 
  | 'Residual';

export interface FuenteEnergia {
  id?: string;
  tipo: TipoEnergiaLoto;
  magnitud: string;
  ubicacionDispositivo?: string;
  ubicacionAislamiento?: string;
  dispositivoBloqueo?: string;
  dispositivoCierre?: string;
  metodoDisipacion?: string;
  fotoUrl?: string;
}

export interface LotoEquipo {
  id: string;
  codigo: string;
  nombre: string;
  empresaId: string;
  localidadId: string;
  establecimientoId: string;
  fuentesEnergia: FuenteEnergia[];
  procedimientoPasos: string[];
  ultimaInspeccionAnual?: string;
  estado: 'Operativo' | 'Bloqueado' | 'Mantenimiento';
  fotoUrl?: string;
  createdAt?: string;
}

export type EstadoLotoBloqueo = 
  | 'Activo' 
  | 'Completado' 
  | 'Cancelado'
  | 'En Progreso'
  | 'Bloqueado'
  | 'Liberando'
  | string;

export interface PasosConfirmadosLoto {
  notificacion: boolean;
  apagado: boolean;
  aislamiento: boolean;
  bloqueoEtiquetado: boolean;
  energiaCero: boolean;
  inspeccionVisual: boolean;
}

export interface RetiroValidadoLoto {
  areaDespejada: boolean;
  personalNotificado: boolean;
  herramientasRetiradas: boolean;
  guardasReinstaladas: boolean;
}

export interface LotoBloqueo {
  id: string;
  equipoId: string;
  autorizadoId: string;
  permisoId?: string;
  tipoBloqueo: 'Individual' | 'Grupal';
  colegasGrupo?: string[];
  estado: EstadoLotoBloqueo;
  turno?: string;
  pasosConfirmados: PasosConfirmadosLoto;
  retiroValidado: RetiroValidadoLoto;
  firmaAutorizadoApagado?: string;
  firmaAutorizadoRetiro?: string;
  fechaInicio: string;
  fechaFin?: string;
  motivo: string;
  candadosUsados?: number;
  observaciones?: string;
  createdAt?: string;
}

export interface LotoCapacitacion {
  id: string;
  empleadoId: string;
  fechaTraining: string;
  instructor: string;
  calificacion: number;
  venceFecha: string;
  estado: 'Vigente' | 'Vencido';
}

export interface LotoAuditoria {
  id: string;
  equipoId: string;
  auditorId: string;
  fechaAuditoria: string;
  conformidad: boolean;
  observaciones: string;
}
