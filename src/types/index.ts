// ============================================================
// SGD DUNCAN 2.0 — TIPOS PRINCIPALES
// ============================================================

export type Rol = 'Propietario / Super Admin' | 'Super Admin' | 'Admin' | 'Inspector';
export type EstadoInspeccion = 'en_progreso' | 'completada' | 'borrador';
export type ResultadoInspeccion = 'C' | 'NC' | 'OM' | 'NA' | undefined;
export type PrioridadAccion = 'Critica' | 'Alta' | 'Media' | 'Baja';
export type EstadoAccion = 'pendiente' | 'en_ejecucion' | 'cerrada' | 'vencida';

export interface Empresa {
  _id: string;
  codigo: string;
  nombre: string;
  rif: string;
  direccion?: string;
}

export interface Localidad {
  _id: string;
  empresaId: string;
  nombre: string;
  region?: string;
  estado?: string;
}

export interface Establecimiento {
  _id: string;
  nombre: string;
  localidadId: string;
  localidadNombre: string;
  tipo: 'Distribuidora' | 'Servicentro' | 'Oficina' | 'Planta';
  empresaId?: string;
  empresaNombre?: string;
  direccion?: string;
  activo?: boolean;
}

export interface TipoInspeccion {
  _id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  frecuencia?: string;
  categoria?: string;
  icono?: string;
}

export interface Inspeccion {
  _id: string;
  correlativo?: number;
  empresaId: string;
  empresaNombre: string;
  localidadId: string;
  localidadNombre: string;
  establecimientoId: string;
  establecimientoNombre: string;
  tipoInspeccionId: string;
  tipoNombre: string;
  tipoCodigo: string;
  fecha: string;
  inspector: string;
  estado: EstadoInspeccion;
  resultado?: ResultadoInspeccion;
  puntuacion?: number;
  observaciones?: string;
  formResponses?: string; // JSON serialized
  formObservations?: string;
  formAdditional?: string;
  formSignatures?: string;
  creadoPor?: string;
  actualizadoEn?: string;
  geoLat?: number;
  geoLon?: number;
}

export interface PlanAccion {
  _id: string;
  inspeccionId: string;
  empresaNombre?: string;
  establecimientoNombre?: string;
  tipoInspeccionCodigo?: string;
  tipoInspeccionNombre?: string;
  item?: string;
  seccion?: string;
  hallazgo: string;
  descripcion?: string;
  responsable: string;
  departamento?: string;
  fechaDeteccion?: string;
  fechaLimite?: string;
  prioridad: PrioridadAccion;
  estado: EstadoAccion;
  notas?: string;
  creadoEn?: string;
}

export interface Empleado {
  _id: string;
  codigo?: string;
  cedula: string;
  nombre: string;
  cargo: string;
  departamento?: string;
  empresaId?: string;
  empresaNombre?: string;
  establecimientoId?: string;
  activo?: boolean;
}

export interface Usuario {
  _id: string;
  email: string;
  nombre: string;
  rol: Rol;
  password?: string;
  empresaId?: string;
  activo?: boolean;
  fotoUrl?: string;
}

export interface AuditLog {
  _id: string;
  usuario: string;
  accion: string;
  entidad?: string;
  entidadId?: string;
  detalles?: string;
  timestamp: string;
}

export interface DashboardStats {
  totalInspecciones: number;
  conformes: number;
  noConformes: number;
  tasaCumplimiento: number;
}

export interface PlanStats {
  total: number;
  pendientes: number;
  enEjecucion: number;
  cerradas: number;
  vencidas: number;
}

export interface InitData {
  app: { name: string; version: string };
  catalogos: {
    empresas: Empresa[];
    localidades: Localidad[];
    establecimientos: Establecimiento[];
    tiposInspeccion: TipoInspeccion[];
  };
  usuarios: Usuario[];
  stats: DashboardStats;
  planStats: PlanStats;
  inspeccionesRecientes: Inspeccion[];
}

export interface ArticuloEPP {
  _id: string;
  codigo: string;
  nombre: string;
  categoria: 'Protección Cabeza' | 'Protección Ocular' | 'Protección Respiratoria' | 'Protección Auditiva' | 'Protección Manos' | 'Calzado y Ropa';
  stockActual: number;
  stockMinimo: number;
  unidad: string;
  talla?: string;
}

export interface DotacionEPP {
  _id: string;
  empleadoId?: string;
  empleadoNombre: string;
  cedula: string;
  cargo: string;
  empresaNombre: string;
  establecimientoNombre: string;
  articulos: { articuloId: string; nombre: string; cantidad: number; talla?: string }[];
  fechaEntrega: string;
  proximaEntrega?: string;
  entregadoPor: string;
  firmaRecibido?: string;
}

export interface EquipoLOTO {
  _id: string;
  tag: string;
  nombre: string;
  ubicacion: string;
  tipoEnergia: 'Eléctrica' | 'Química / Ácido' | 'Neumática' | 'Mecánica' | 'Térmica';
  dispositivoBloqueo: string;
  procedimiento: string;
}

export interface BloqueoLOTO {
  _id: string;
  equipoTag: string;
  equipoNombre: string;
  ubicacion: string;
  motivo: string;
  responsable: string;
  fechaInicio: string;
  horaInicio: string;
  fechaFinEstimada?: string;
  estado: 'Activo' | 'Liberado';
  candadosColocados: number;
  energiaCeroVerificada: boolean;
}

export interface EvaluacionMedica {
  _id: string;
  empleadoId?: string;
  empleadoNombre: string;
  cedula: string;
  empresaNombre: string;
  establecimientoNombre: string;
  tipoEvaluacion: 'Pre-empleo' | 'Periódica Anual' | 'Pre-vacacional' | 'Post-vacacional' | 'Egreso' | 'Especial Plombemia';
  fecha: string;
  medicoTratante: string;
  plombemiaValor?: number; // µg/dL (Plomo en sangre para Duncan)
  audiometria?: 'Normal' | 'Hipoacusia Leve' | 'Hipoacusia Moderada';
  aptitud: 'Apto' | 'Apto con Restricciones' | 'No Apto Temporal';
  observaciones?: string;
}
