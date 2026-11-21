// ============================================================
// SGD DUNCAN 2.0 — COMITÉS CSSL Y DELEGADOS DE PREVENCIÓN (INCLUSIONES V2)
// Normas: LOPCYMAT Art. 41-48, Reglamento Parcial
// ============================================================

export type RolComite = 'DELEGADO_PREVENCION' | 'REPRESENTANTE_PATRONO';

export interface MiembroCSSL {
  id: string;
  empleadoId?: string;
  nombreCompleto: string;
  cedula: string;
  cargoEmpresa: string;
  departamento: string;
  rolComite: RolComite;
  fechaEleccionDesignacion: string;
  numeroRegistroINPSASEL?: string;
  activo: boolean;
  telefono?: string;
  email?: string;
}

export interface ComiteCSSL {
  id: string;
  sedeId: string;
  sedeNombre: string;
  numeroRegistroComiteINPSASEL: string;
  fechaRegistroINPSASEL: string;
  fechaVencimientoVigencia: string; // Vigencia de 2 años según LOPCYMAT
  diasParaVencer: number;
  estatusVigencia: 'VIGENTE' | 'PROXIMO_A_VENCER' | 'VENCIDO';
  miembros: MiembroCSSL[];
}

export interface MinutaReunionCSSL {
  id: string;
  comiteId: string;
  sedeNombre: string;
  correlativoMinuta: string;
  tipoReunion: 'ORDINARIA_MENSUAL' | 'EXTRAORDINARIA';
  fechaReunion: string;
  horaInicio: string;
  horaFin: string;
  lugarReunion: string;
  
  // Asistentes
  asistentesDelegados: string[];
  asistentesPatrono: string[];
  invitadosEspeciales?: string[];
  
  // Puntos Tratados
  puntosTratados: string[];
  accidentesRevisados?: string[];
  informeInspeccionesSSA?: string;
  
  // Acuerdos y Seguimiento
  acuerdos: Array<{
    id: string;
    descripcion: string;
    responsable: string;
    fechaLimite: string;
    estado: 'PENDIENTE' | 'CUMPLIDO';
  }>;
  
  // Archivo Digitalizado de Minuta Sellada y Firmada
  urlMinutaFirmadaPDF?: string;
  archivoBase64?: string;
  firmasDigitales?: Record<string, string>;
  creadoPor: string;
}
