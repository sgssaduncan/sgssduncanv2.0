export type TipoTrabajoRiesgoso = 
  | 'CALIENTE' 
  | 'ESPACIOS_CONFINADOS' 
  | 'ENERGIA_PELIGROSA_LOTO' 
  | 'ALTURA' 
  | 'EXCAVACION' 
  | 'ALTA_TENSION'
  | 'FRIO';

export type RolPermiso = 'EMISOR' | 'RECEPTOR' | 'EJECUTOR' | 'INSPECTOR_HSE';

export type EstadoPermiso = 
  | 'SOLICITUD' 
  | 'AST_PENDIENTE' 
  | 'VALIDACION_CAMPO' 
  | 'APROBADO' 
  | 'EN_EJECUCION' 
  | 'SUSPENDIDO' 
  | 'CERRADO' 
  | 'CANCELADO';

export interface EvaluacionAST {
  id: string;
  pasos: string[];
  peligros: string[];
  riesgosAsociados: string[];
  medidasControl: string[];
  firmas: Record<string, string>;
}

// Dynamic special certificates and checklists
export interface ChecklistConfinados {
  o2: number; // Safes match: 19.5% - 22.5%
  lel: number; // < 10%
  co: number; // < 35 ppm
  h2s: number; // < 10 ppm
  vigenciaGases: string;
  inspectorAtmosfera?: string;
  ventilacionForzadaOk?: boolean;
  equiposIluminacionOk?: boolean;
  arriesgadoOk?: boolean;
}

export interface ChecklistAltura {
  arnesOk: boolean;
  anclajesOk: boolean;
  lineasVidaOk: boolean;
  barandasOk?: boolean;
  capacitacionAlturaOk?: boolean;
  aptoAlturaSalud?: boolean;
}

export interface ChecklistLoto {
  apagadoConfirmado: boolean;
  aislamientoConfirmado: boolean;
  candadosInstalados: boolean;
  etiquetasColocadas?: boolean;
  alivioEnergiaConfirmado: boolean;
  pruebaCeroConfirmado: boolean;
}

export interface ChecklistExcavacion {
  entibacionOk: boolean;
  distanciaSeguraOk: boolean;
  verificacionRedesSubtOk: boolean;
  accesosOk: boolean;
  escalerasEvacuacionOk?: boolean;
}

export interface ChecklistIzamiento {
  vientosOk: boolean;
  aparejosCertificados: boolean;
  delimitacionAreaOk: boolean;
  operadorCalificado: boolean;
  vientosFuertesFrenado?: boolean;
}

export interface ControlCampo {
  pruebasGasesValidas?: boolean;
  eppVerificados?: boolean;
  lotoAplicado?: boolean;
  medicionesLel?: number;
  medicionesO2?: number;
  observacionesAdicionales: string;
}

export interface PermisoTrabajo {
  id: string;
  codigoPermiso: string;
  fechaSolicitud: string;
  vigenciaInicio: string;
  vigenciaFin: string;
  tipoTrabajo: TipoTrabajoRiesgoso;
  
  // High-Risk ISO 45001 Advanced Fields
  tipoPermisoPrincipal: 'FRIO' | 'CALIENTE';
  certificadosAnexos: {
    confinados: boolean;
    altura: boolean;
    loto: boolean;
    excavacion: boolean;
    izamiento: boolean;
  };
  checklistConfinados?: ChecklistConfinados;
  checklistAltura?: ChecklistAltura;
  checklistLoto?: ChecklistLoto;
  checklistExcavacion?: ChecklistExcavacion;
  checklistIzamiento?: ChecklistIzamiento;
  
  descripcionTrabajo: string;
  ubicacionDato: string;
  estado: EstadoPermiso;
  astAsociado?: EvaluacionAST;
  controlesCampo?: ControlCampo;
  
  responsables: {
    ejecutorId: string;
    emisorId: string;
    supervisorId: string;
    receptorId?: string;
    inspectorHseId?: string;
  };
  
  // Digital Signatures base64 string
  firmasDigitales?: {
    firmaEjecutor?: string;
    firmaEmisor?: string;
    firmaReceptor?: string;
    firmaRescueHse?: string;
  };

  // Stop Work Authority details
  swaDetalles?: {
    motivo: string;
    reportadoPor: string;
    fechaHora: string;
  };

  coordenadas?: {
    lat: number;
    lng: number;
  };

  historialEventos: Array<{
    estado: EstadoPermiso;
    timestamp: string;
    usuarioId: string;
    comentario?: string;
  }>;
}
