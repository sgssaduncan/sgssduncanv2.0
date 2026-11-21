/**
 * Tipos y esquemas para el Sistema de Auditoría Exhaustiva y Trazabilidad Forense
 * SG-SSA Duncan 2.0
 */

export type AuditModule = 
  | 'AUTENTICACION'
  | 'NAVEGACION'
  | 'INSPECCIONES'
  | 'PLAN_ACCION'
  | 'DOTACION_EPP'
  | 'SALUD_OCUPACIONAL'
  | 'ACCIDENTES_F465'
  | 'CARGA_FUEGO'
  | 'TRANSPORTE_FLOTA'
  | 'LOTO_PERMISOS'
  | 'COMITES_CSSL'
  | 'FORMACION_RACDA'
  | 'REPORTES_EXPORTACIONES'
  | 'USUARIOS_SEGURIDAD'
  | 'CONFIGURACION_SISTEMA';

export type AuditAction =
  | 'INICIO_SESION'
  | 'CIERRE_SESION'
  | 'REGISTRO_USUARIO'
  | 'FALLO_AUTENTICACION'
  | 'ACCESO_VISTA'
  | 'CREAR'
  | 'ACTUALIZAR'
  | 'ELIMINAR'
  | 'FIRMAR'
  | 'COMPLETAR'
  | 'APROBAR'
  | 'RECHAZAR'
  | 'DESCARGAR_PDF'
  | 'EXPORTAR_EXCEL'
  | 'EXPORTAR_CSV'
  | 'IMPRIMIR'
  | 'CAMBIO_ROL'
  | 'RESTABLECER_CONTRASENA'
  | 'SINCRONIZACION'
  | 'AUTORIZACION_SALIDA'
  | 'EMISION_REPOSO'
  | 'EMISION_REFERENCIA'
  | 'CIERRE_ACCION';

export type AuditSeverity = 'INFO' | 'AVISO' | 'CRITICO' | 'SEGURIDAD';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO 8601
  fechaFormateada: string; // DD/MM/YYYY HH:mm:ss
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  usuarioRol: string;
  usuarioSede?: string;
  usuarioEmpresa?: string;
  modulo: AuditModule;
  accion: AuditAction;
  entidadTipo: string; // ej: 'Inspeccion', 'AccidenteF465', 'ReposoMedico'
  entidadId?: string;
  entidadCodigo?: string;
  descripcion: string;
  detalles?: Record<string, any>;
  severidad: AuditSeverity;
  ip?: string;
  userAgent: string;
  dispositivo: 'Desktop' | 'Mobile' | 'Tablet';
  plataforma: string;
  online: boolean;
  ruta?: string;
  previousHash?: string;
  hash?: string;
}

export interface AuditFilter {
  search?: string;
  modulo?: AuditModule | 'TODOS';
  accion?: AuditAction | 'TODAS';
  severidad?: AuditSeverity | 'TODAS';
  usuarioId?: string | 'TODOS';
  fechaDesde?: string;
  fechaHasta?: string;
}
