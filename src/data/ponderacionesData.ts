// =========================================================================
// SGD DUNCAN 2.0 — PONDERACIONES OFICIALES PARA TOTALIZACIÓN (RONDA 1 2025-2026)
// Extraído de la especificación oficial de Distribuidoras y Servicentros Duncan
// =========================================================================

export interface PonderacionItem {
  nombre: string;
  eficiencia: number;
  ponderacion: number;
  ponderado: number;
}

export interface PonderacionRegion {
  region: string;
  promedioRegion: number;
  items: PonderacionItem[];
}

export const PONDERACIONES_TOTALIZACION_OFICIALES: PonderacionRegion[] = [
  {
    region: 'PUERTO ORDAZ',
    promedioRegion: 77.0,
    items: [
      { nombre: 'DISTRIBUIDORA DUNCAN PUERTO ORDAZ', eficiencia: 90, ponderacion: 0.40, ponderado: 36.0 },
      { nombre: 'Vehículos Carga Pesada', eficiencia: 50, ponderacion: 0.05, ponderado: 2.5 },
      { nombre: 'Montacargas', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'SERVICENTRO CIUDAD BOLIVAR', eficiencia: 70, ponderacion: 0.10, ponderado: 7.0 },
      { nombre: 'SERVICENTRO MATURIN', eficiencia: 70, ponderacion: 0.10, ponderado: 7.0 },
      { nombre: 'SERVICENTRO SAN FELIX', eficiencia: 70, ponderacion: 0.10, ponderado: 7.0 },
      { nombre: 'SERVICENTRO UNARE', eficiencia: 70, ponderacion: 0.10, ponderado: 7.0 },
      { nombre: 'SERVICENTRO UPATA', eficiencia: 70, ponderacion: 0.10, ponderado: 7.0 }
    ]
  },
  {
    region: 'PUNTO FIJO',
    promedioRegion: 75.1,
    items: [
      { nombre: 'DIST PUNTO FIJO', eficiencia: 69, ponderacion: 0.40, ponderado: 27.6 },
      { nombre: 'Vehículos Carga Pesada', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'Montacargas', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'SERVICIENTRO CORO', eficiencia: 95, ponderacion: 0.50, ponderado: 47.5 }
    ]
  },
  {
    region: 'PORLAMAR',
    promedioRegion: 83.0,
    items: [
      { nombre: 'DIST PORLAMAR', eficiencia: 90, ponderacion: 0.40, ponderado: 36.0 },
      { nombre: 'Vehículos Carga Pesada', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'Montacargas', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'LOS ROBLES', eficiencia: 80, ponderacion: 0.50, ponderado: 40.0 }
    ]
  },
  {
    region: 'SAN CRISTOBAL',
    promedioRegion: 79.8,
    items: [
      { nombre: 'DIST SAN CRISTOBAL', eficiencia: 92, ponderacion: 0.40, ponderado: 36.8 },
      { nombre: 'Vehículos Carga Pesada', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'Montacargas', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'PUERTA DEL SOL', eficiencia: 86, ponderacion: 0.50, ponderado: 43.0 }
    ]
  },
  {
    region: 'BARCELONA',
    promedioRegion: 83.25,
    items: [
      { nombre: 'DIST BARCELONA', eficiencia: 90, ponderacion: 0.40, ponderado: 36.0 },
      { nombre: 'Vehículos Carga Pesada', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'Montacargas', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'CUMANA', eficiencia: 80, ponderacion: 0.125, ponderado: 10.0 },
      { nombre: 'TIGRE', eficiencia: 80, ponderacion: 0.125, ponderado: 10.0 },
      { nombre: 'ANACO', eficiencia: 75, ponderacion: 0.125, ponderado: 9.375 },
      { nombre: 'PUERTO LA CRUZ', eficiencia: 87, ponderacion: 0.125, ponderado: 10.875 }
    ]
  },
  {
    region: 'MARACAIBO',
    promedioRegion: 84.98,
    items: [
      { nombre: 'DIST MARACAIBO', eficiencia: 86, ponderacion: 0.40, ponderado: 34.4 },
      { nombre: 'Vehículos Carga Pesada', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'Montacargas', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'DR. PORTILLO', eficiencia: 80, ponderacion: 0.0833, ponderado: 6.67 },
      { nombre: 'LA LIMPIA', eficiencia: 89, ponderacion: 0.0833, ponderado: 7.42 },
      { nombre: 'MONTE CLARO', eficiencia: 86, ponderacion: 0.0833, ponderado: 7.17 },
      { nombre: 'CIUDAD OJEDA', eficiencia: 90, ponderacion: 0.0833, ponderado: 7.50 },
      { nombre: 'CABIMAS', eficiencia: 89, ponderacion: 0.0833, ponderado: 7.42 },
      { nombre: 'VILLA DEL ROSARIO', eficiencia: 89, ponderacion: 0.0833, ponderado: 7.42 }
    ]
  },
  {
    region: 'GRAN CARACAS',
    promedioRegion: 90.19,
    items: [
      { nombre: 'DIST LOS RUICES', eficiencia: 95, ponderacion: 0.40, ponderado: 38.0 },
      { nombre: 'Vehículos Carga Pesada', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'Montacargas', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'LOS RUICES (SC)', eficiencia: 90, ponderacion: 0.02, ponderado: 1.8 },
      { nombre: 'Montacargas (Los Ruices)', eficiencia: 90, ponderacion: 0.01, ponderado: 0.9 },
      { nombre: 'XPRESS LOS RUICES', eficiencia: 91, ponderacion: 0.0294, ponderado: 2.68 },
      { nombre: 'CALIFORNIA', eficiencia: 90, ponderacion: 0.02, ponderado: 1.8 },
      { nombre: 'Montacargas (California)', eficiencia: 90, ponderacion: 0.01, ponderado: 0.9 },
      { nombre: 'CERRO VERDE', eficiencia: 90, ponderacion: 0.0294, ponderado: 2.65 },
      { nombre: 'TRINIDAD', eficiencia: 90, ponderacion: 0.0294, ponderado: 2.65 },
      { nombre: 'ALTAMIRA', eficiencia: 90, ponderacion: 0.02, ponderado: 1.8 },
      { nombre: 'Montacargas (Altamira)', eficiencia: 90, ponderacion: 0.01, ponderado: 0.9 },
      { nombre: 'MARIPEREZ', eficiencia: 90, ponderacion: 0.0294, ponderado: 2.65 },
      { nombre: 'CATIA', eficiencia: 90, ponderacion: 0.0294, ponderado: 2.65 },
      { nombre: 'SAN MARTIN', eficiencia: 92, ponderacion: 0.0294, ponderado: 2.71 },
      { nombre: 'CEMENTERIO', eficiencia: 89, ponderacion: 0.0294, ponderado: 2.62 },
      { nombre: 'LAS ACACIAS', eficiencia: 90, ponderacion: 0.0294, ponderado: 2.65 },
      { nombre: 'CHAGUARAMOS', eficiencia: 89, ponderacion: 0.0294, ponderado: 2.62 },
      { nombre: 'LA GUAIRA', eficiencia: 90, ponderacion: 0.0294, ponderado: 2.65 },
      { nombre: 'LOS TEQUES', eficiencia: 90, ponderacion: 0.0294, ponderado: 2.65 },
      { nombre: 'CHARALLAVE', eficiencia: 90, ponderacion: 0.0294, ponderado: 2.65 },
      { nombre: 'GUATIRE', eficiencia: 90, ponderacion: 0.0294, ponderado: 2.65 },
      { nombre: 'GUARENAS', eficiencia: 90, ponderacion: 0.0294, ponderado: 2.65 }
    ]
  },
  {
    region: 'BARQUISIMETO',
    promedioRegion: 86.5,
    items: [
      { nombre: 'DIST BARQUISIMETO', eficiencia: 90, ponderacion: 0.40, ponderado: 36.0 },
      { nombre: 'Vehículos Carga Pesada', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'Montacargas', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'BARINAS', eficiencia: 87, ponderacion: 0.25, ponderado: 21.75 },
      { nombre: 'GUANARE', eficiencia: 87, ponderacion: 0.25, ponderado: 21.75 }
    ]
  },
  {
    region: 'MARACAY',
    promedioRegion: 83.825,
    items: [
      { nombre: 'DIST MARACAY', eficiencia: 88, ponderacion: 0.40, ponderado: 35.2 },
      { nombre: 'Vehículos Carga Pesada', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'Montacargas', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'SAN JACINTO', eficiencia: 79, ponderacion: 0.125, ponderado: 9.875 },
      { nombre: 'TAPA TAPA', eficiencia: 80, ponderacion: 0.125, ponderado: 10.0 },
      { nombre: 'VDP (Valle de la Pascua)', eficiencia: 89, ponderacion: 0.125, ponderado: 11.125 },
      { nombre: 'APURE (San Fernando)', eficiencia: 85, ponderacion: 0.125, ponderado: 10.625 }
    ]
  },
  {
    region: 'VALENCIA',
    promedioRegion: 87.475,
    items: [
      { nombre: 'DIST VALENCIA', eficiencia: 89, ponderacion: 0.40, ponderado: 35.6 },
      { nombre: 'Vehículos Carga Pesada', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'Montacargas', eficiencia: 70, ponderacion: 0.05, ponderado: 3.5 },
      { nombre: 'GUACARA', eficiencia: 89, ponderacion: 0.125, ponderado: 11.125 },
      { nombre: 'PTO CABELLO', eficiencia: 90, ponderacion: 0.125, ponderado: 11.25 },
      { nombre: 'LA QUIZANDA', eficiencia: 90, ponderacion: 0.125, ponderado: 11.25 },
      { nombre: 'SANTA CECILIA', eficiencia: 90, ponderacion: 0.125, ponderado: 11.25 }
    ]
  }
];
