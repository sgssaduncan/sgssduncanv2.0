// ============================================================
// SGD DUNCAN 2.0 — DOTACIÓN EPP Y UNIFORMES TIPOS
// Normas: LOPCYMAT, NT-03-2016 (Norma Técnica Inpsasel)
// ============================================================

export type CategoriaInventario = 
  | 'Protección de Cabeza'
  | 'Protección Ocular y Facial'
  | 'Protección Respiratoria'
  | 'Protección Auditiva'
  | 'Protección de Manos y Brazos'
  | 'Protección de Pies y Piernas'
  | 'Ropa de Trabajo / Uniforme'
  | 'Protección contra Caídas'
  | 'Protección Química / Ácido'
  | 'EPP'
  | string;

export interface TallaStock {
  talla: string;
  cantidad: number;
}

export interface InventarioItem {
  id: string;
  codigo: string;
  nombre: string;
  categoria: CategoriaInventario;
  descripcion: string;
  fotoUrl?: string;
  stock: TallaStock[];
  stockMinimo?: number;
  unidad?: string;
  createdAt?: string;
  
  // Venezuelan SST Compliance (LOPCYMAT & NT-03-2016)
  normaCovenin?: string;
  certificacionInternacional?: string;
  vidaUtilEstimadaMeses?: number;
  documentoEficacia?: string;
  esFajaLumbar?: boolean;
  fabricante?: string;
  proveedor?: string;
  nivelProteccion?: string;
  instruccionesUsoMantenimiento?: string;
  validoSsst?: boolean;
  validoDelegados?: boolean;
  validoTrabajadores?: boolean;
  firmaSsstNombre?: string;
  firmaDelegadoNombre?: string;
}

export type EstadoSolicitudEPP = 
  | 'Solicitada' 
  | 'Aprobada por Supervisor' 
  | 'Aprobada por SSA' 
  | 'Despachada' 
  | 'Entregada' 
  | 'Recibida' 
  | 'Rechazada' 
  | 'Pendiente' 
  | 'Aprobada'
  | string;

export interface SolicitudEPPItem {
  itemId: string;
  cantidad: number;
  talla: string;
}

export interface SolicitudEPP {
  id: string;
  empleadoId: string;
  empleadoNombre?: string;
  empleadoCedula?: string;
  solicitanteId: string;
  fechaSolicitud: string;
  estado: EstadoSolicitudEPP;
  items: SolicitudEPPItem[];
  motivo: string;
  motivoRechazo?: string;
  createdAt?: string;
  actaEntregaUrl?: string;
  firmaEntrega?: string;
  
  // Prescripción y validación médica
  prescripcionMedicaValidada?: boolean;
  medicoValidador?: string;
  registroPrescripcion?: string;
  duracionTratamientoDias?: number;
}

export interface EntregaEPP {
  id: string;
  solicitudId?: string;
  empleadoId: string;
  entregadoPor: string;
  fechaEntrega: string;
  items: SolicitudEPPItem[];
  firmaUrl?: string;
  fotoEvidencia?: string;
  comentarios?: string;
  createdAt?: string;
  actaEntregaPdfUrl?: string;
  
  // Constancias legales LOPCYMAT
  inducidoTeoricoPractico?: boolean;
  constanciaSujetoRiesgos?: boolean;
}
