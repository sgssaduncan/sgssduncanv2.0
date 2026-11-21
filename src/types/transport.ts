// ============================================================
// SGD DUNCAN 2.0 — TRANSPORTE Y CONTROL DE CARGA (INCLUSIONES V2)
// ============================================================

export type TipoChecklistTransporte = 'DIARIA' | 'SEMANAL' | 'SSA';

export type SemaforoSalida = 'VERDE' | 'AMARILLO' | 'ROJO';

export interface VehiculoFlota {
  id: string;
  placa: string;
  marcaModelo: string;
  capacidadNominalKg: number;
  margenSeguridadKg?: number; // Capacidad útil recomendada
  tipoVehiculo: 'Camión Chasis Largo' | 'Gandola / Chuto' | 'Furgón 350' | 'Pick-up' | 'Panel';
  sedeAsignada: string;
  choferHabitual?: string;
  estatus: 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'INOPERATIVO';
  kilometrajeActual: number;
  vencimientoRACDA?: string;
  vencimientoPermisoBomberos?: string;
  vencimientoPoliza?: string;
}

export interface ItemBateriaPeso {
  codigo: string;
  referencia: string;
  pesoUnitarioKg: number;
  cantidad: number;
  subtotalKg: number;
}

export interface ChecklistTransporte {
  id: string;
  correlativo: string;
  fecha: string;
  hora: string;
  tipoChecklist: TipoChecklistTransporte;
  
  // Datos del Vehículo y Personal
  vehiculoId: string;
  placa: string;
  marcaModelo: string;
  capacidadNominalKg: number;
  kilometraje: number;
  sedeOrigen: string;
  sedeDestino?: string;
  
  choferId: string;
  choferNombre: string;
  choferCedula: string;
  auxiliarId?: string; // NO obligatorio según INCLUSIONES V2
  auxiliarNombre?: string;
  auxiliarCedula?: string;
  
  // Control de Carga y Calculadora de Baterías Servicentros
  tieneCarga: boolean;
  pesoManifiestoKg: number;
  itemsBaterias?: ItemBateriaPeso[];
  pesoCalculadoKg?: number;
  pesoTotalKg: number;
  porcentajeCapacidad: number; // (pesoTotalKg / capacidadNominalKg) * 100
  excedeCapacidad: boolean;
  
  // Respuestas de Inspección Técnica
  // Tipo 'DIARIA': luces, frenos, neumáticos, niveles de aceite/agua, extintor, retrovisores
  // Tipo 'SEMANAL': dirección, suspensión, transmisión, batería propia, limpiaparabrisas, gato y llave
  // Tipo 'SSA': botiquín primeros auxilios, RACDA vigente, MSDS de baterías ácidas, EPP chofer, cuñas, conos, kit antiderrame
  respuestas: Record<string, 'BUENO' | 'REGULAR' | 'MALO' | 'NO_APLICA'>;
  fallasCriticas: string[];
  fallasMenores: string[];
  observaciones: string;
  
  // Semáforo de Salida Automatizado
  // VERDE: Conforme (<=90% peso, sin fallas críticas)
  // AMARILLO: Con observaciones (>90% y <=100% peso, o fallas menores no críticas de carrocería)
  // ROJO: NO SALE (Fallas críticas: frenos, dirección, neumáticos o sobrepeso >100%)
  semaforoSalida: SemaforoSalida;
  motivoRestriccion?: string;
  
  // Evidencias y Geolocalización
  coordenadas?: {
    lat: number;
    lng: number;
  };
  fotosEvidencias?: string[];
  
  // Firmas digitales
  firmaChofer?: string;
  firmaSupervisorSSA?: string;
  firmaDespachador?: string;
}
