// ============================================================
// SGD DUNCAN 2.0 — DEFINICIONES DE TIPOS GLOBALES
// ============================================================

export type Role = 'Super Admin' | 'Propietario / Super Admin' | 'Admin' | 'Inspector' | 'Supervisor';
export type Rol = Role;

/**
 * Validador de cuentas de Propietarios y Administradores Principales
 * basándose en el rol asignado o cuenta corporativa autorizada.
 */
export function isOwnerOrDeveloperEmail(email?: string, rol?: string): boolean {
  if (rol && (rol.includes('Propietario') || rol.includes('Super Admin'))) return true;
  if (!email) return false;
  const e = email.toLowerCase().trim();
  return (
    e === 'sgssaduncan@gmail.com' ||
    e === 'admin@duncan.com.ve' ||
    e === 'vera.hugo712@gmail.com' ||
    e.endsWith('@duncan.com.ve')
  );
}

export interface UserProfile {
  id?: string;
  _id?: string;
  email: string;
  displayName?: string;
  nombre?: string;
  role?: Role;
  rol?: Role;
  password?: string;
  photoURL?: string;
  fotoUrl?: string;
  empresaId?: string;
  activo?: boolean;
  cedula?: string;
  cargo?: string;
  localidad?: string;
  createdAt?: string;
}

export type Usuario = UserProfile;

export interface Empresa {
  id?: string;
  _id?: string;
  nombre: string;
  codigo: string;
  rif: string;
  direccion?: string;
  logoUrl?: string;
}

export interface Localidad {
  id?: string;
  _id?: string;
  empresaId: string;
  nombre: string;
  region?: string;
  estado?: string;
}

export interface Establecimiento {
  id?: string;
  _id?: string;
  codigo?: string;
  localidadId: string;
  localidadNombre?: string;
  nombre: string;
  tipo?: 'Distribuidora' | 'Servicentro' | 'Oficina' | 'Planta' | string;
  iniciales?: string;
  empresaId?: string;
  empresaNombre?: string;
  direccion?: string;
  activo?: boolean;
}

export type TipoRespuesta = 
  | 'C_NC_OM_NA' 
  | 'BUENO_DANADO_NA' 
  | 'BUENO_MALO_NA' 
  | 'EXISTE_NO_DESACTUALIZADO' 
  | 'SI_NO' 
  | 'SI_NO_NA' 
  | 'OPERATIVO_NO' 
  | 'SELECT' 
  | 'TEXT' 
  | 'DATE' 
  | 'NUMBER' 
  | 'ESTADO_EQUIPO';

export interface ItemInspeccion {
  id: string;
  pregunta: string;
  tipoRespuesta: TipoRespuesta;
  opciones?: string[];
  referenciaLegal?: string;
}

export interface SeccionInspeccion {
  id: string;
  titulo: string;
  items: ItemInspeccion[];
}

export interface TipoInspeccion {
  id?: string;
  _id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  frecuencia?: string;
  categoria?: string;
  icono?: string;
  secciones?: SeccionInspeccion[];
}

export type EstadoInspeccion = 'Borrador' | 'En Progreso' | 'Completada' | 'en_progreso' | 'completada' | 'borrador';
export type ResultadoInspeccion = 'C' | 'NC' | 'OM' | 'NA' | undefined;

export interface Inspeccion {
  id?: string;
  _id?: string;
  correlativo?: number;
  empresaId: string;
  empresaNombre?: string;
  localidadId: string;
  localidadNombre?: string;
  establecimientoId: string;
  establecimientoNombre?: string;
  tipoInspeccionId: string;
  tipoNombre?: string;
  tipoCodigo?: string;
  fecha: string;
  inspectorId?: string;
  inspector?: string;
  estado: EstadoInspeccion;
  resultado?: ResultadoInspeccion;
  respuestas: Record<string, any>;
  respuestasAdicionales?: Record<string, string>;
  formResponses?: string;
  formObservations?: string;
  formAdditional?: string;
  formSignatures?: string;
  fotos?: Record<string, string[] | string>;
  firmas?: {
    inspector?: string;
    revisor?: string;
  };
  coordenadas?: {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp?: string;
    mapUrl?: string;
  };
  geoLat?: number;
  geoLon?: number;
  geoAccuracy?: number;
  geoTimestamp?: string;
  puntuacionConformidad?: number;
  puntuacion?: number;
  observaciones?: string;
  referencia?: string;
  creadoPor?: string;
  actualizadoEn?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type EstadoPlanAccion = 'Pendiente' | 'Aprobado' | 'En ejecución' | 'Cerrado' | 'Vencido' | 'pendiente' | 'en_ejecucion' | 'cerrada' | 'vencida';
export type PrioridadPlanAccion = 'Critica' | 'Alta' | 'Media' | 'Baja' | 'Inmediato' | 'Corto Plazo' | 'Medio Plazo' | 'Largo Plazo';
export type PrioridadAccion = PrioridadPlanAccion;
export type EstadoAccion = EstadoPlanAccion;

export interface PlanAccion {
  id?: string;
  _id?: string;
  inspeccionId: string;
  inspeccionCorrelativo?: string;
  empresaId?: string;
  empresaNombre?: string;
  establecimientoId?: string;
  establecimientoNombre?: string;
  localidadId?: string;
  localidadNombre?: string;
  tipoInspeccionCodigo?: string;
  tipoInspeccionNombre?: string;
  item?: string;
  seccion?: string;
  hallazgo: string;
  descripcion?: string;
  responsableId?: string;
  responsable: string;
  departamento?: string;
  prioridad: PrioridadPlanAccion;
  fechaDeteccion?: string;
  fechaLimite: string;
  recomendacion?: string;
  estado: EstadoPlanAccion;
  aspectoEvaluado?: string;
  preguntaTexto?: string;
  aspectoLegal?: string;
  grupoPilar?: string;
  areaResponsable?: string;
  conformidad?: 'NC' | 'OM';
  fechaEjecucion?: string;
  fechaVerificacion?: string;
  recursosNecesarios?: string;
  observaciones?: string;
  rondaNo?: number;
  comentariosCierre?: string;
  fotoCierre?: string;
  history?: any[];
  notas?: string;
  creadoEn?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Empleado {
  id?: string;
  _id?: string;
  codigo?: string;
  cedula: string;
  nombre: string;
  cargo: string;
  departamento?: string;
  empresaId?: string;
  empresaNombre?: string;
  establecimientoId?: string;
  sedeNombre?: string;
  activo?: boolean;
  fechaIngreso?: string;
  ultimoDisfruteVacacional?: string;
  diasVacacionesPendientes?: number;
  telefono?: string;
  email?: string;
  genero?: 'M' | 'F';
  sexo?: string;
  fechaNacimiento?: string;
  edad?: number;
  direccion?: string;
  // Campos Nómina Duncan (ERP 22 columnas)
  nombreNomina?: string;
  codigoEmpleado?: string;
  tipoCentroCosto?: string;
  codigoSituacion?: string;
  antiguedadAnos?: number;
  antiguedadMeses?: number;
  antiguedadDias?: number;
  numeroCentroCostos?: string;
  centroCostosDescripcion?: string;
  sucursal?: string;
  fechaVencimientoContrato?: string;
  direccionResidencia?: string;
  ciudadResidencia?: string;
  estadoResidencia?: string;
  tallaCamisa?: string;
  tallaPantalon?: string;
  tallaCalzado?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  observaciones?: string;
  fechaActualizacion?: string;
}

export interface AuditLog {
  id?: string;
  _id?: string;
  usuario?: string;
  userEmail?: string;
  accion?: string;
  action?: string;
  entidad?: string;
  resourceType?: string;
  entidadId?: string;
  resourceId?: string;
  detalles?: string;
  details?: string;
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

export interface ReportePDF {
  id?: string;
  tipo: string;
  titulo?: string;
  nombre?: string;
  fecha?: string;
  fechaGeneracion?: string;
  url?: string;
  generadoPor?: string;
  referencia?: string;
  pdfData?: string | any;
  datos?: any;
  userId?: string;
}

// Re-export specialized types
export * from './permits';
export * from './medical';
export * from './transport';
export * from './accidents';
export * from './committees';
export * from './training';
export * from './fire';
export * from './loto';
export * from './dotacion';
