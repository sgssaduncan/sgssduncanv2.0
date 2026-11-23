// Dataset oficial consolidado SSA Duncan 70 Sedes (Nativo TypeScript)

export interface MatrixRow {
  ambito: 'LOCALIDAD' | 'DISTRIBUIDORA' | 'SERVICENTRO';
  item: string;
  ef: number | null;
  pond: number | null;
  pondVal: number | null;
  promReg?: number | null;
  ronda1?: number | null;
  ronda2?: number | null;
  hasRonda2?: boolean;
  distribuidora?: string;
  pilarInfra?: number | null;
  pilarLegal?: number | null;
  pilarSSA?: number | null;
  pilarVeh?: number | null;
}

export const SAMPLE_MATRIX_DATA_2024_2025: MatrixRow[] = [
  {
    "ambito": "LOCALIDAD",
    "item": "PUERTO ORDAZ",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 89.8,
    "ronda1": 85.33,
    "ronda2": 89.8,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "PUERTO ORDAZ",
    "ef": 88.02,
    "pond": 0.4,
    "pondVal": 35.21,
    "promReg": null,
    "ronda1": 84.91,
    "ronda2": 88.02,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 94.76,
    "pond": 0.05,
    "pondVal": 4.74,
    "promReg": null,
    "ronda1": 72.56,
    "ronda2": 94.76,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "UNARE",
    "ef": 97.03,
    "pond": 0.1,
    "pondVal": 9.7,
    "promReg": null,
    "ronda1": 91.09,
    "ronda2": 97.03,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SAN FELIX",
    "ef": 94.28,
    "pond": 0.1,
    "pondVal": 9.43,
    "promReg": null,
    "ronda1": 95.11,
    "ronda2": 94.28,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "UPATA",
    "ef": 91.53,
    "pond": 0.1,
    "pondVal": 9.15,
    "promReg": null,
    "ronda1": 89.47,
    "ronda2": 91.53,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CIUDAD BOLIVAR",
    "ef": 90.18,
    "pond": 0.1,
    "pondVal": 9.02,
    "promReg": null,
    "ronda1": 79.54,
    "ronda2": 90.18,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "MATURIN",
    "ef": 90.49,
    "pond": 0.1,
    "pondVal": 9.05,
    "promReg": null,
    "ronda1": 87.17,
    "ronda2": 90.49,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "PUNTO FIJO",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 88.09,
    "ronda1": 87.83,
    "ronda2": 88.09,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "PUNTO FIJO",
    "ef": 87.71,
    "pond": 0.4,
    "pondVal": 35.08,
    "promReg": null,
    "ronda1": 88.17,
    "ronda2": 87.71,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 93.02,
    "pond": 0.05,
    "pondVal": 4.65,
    "promReg": null,
    "ronda1": 72.56,
    "ronda2": 93.02,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CORO",
    "ef": 89.72,
    "pond": 0.5,
    "pondVal": 44.86,
    "promReg": null,
    "ronda1": 90.87,
    "ronda2": 89.72,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "PORLAMAR",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 88.82,
    "ronda1": 82.76,
    "ronda2": 88.82,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "PORLAMAR",
    "ef": 89.31,
    "pond": 0.4,
    "pondVal": 35.72,
    "promReg": null,
    "ronda1": 76.82,
    "ronda2": 89.31,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 78.49,
    "pond": 0.05,
    "pondVal": 3.92,
    "promReg": null,
    "ronda1": 78.49,
    "ronda2": 78.49,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LOS ROBLES",
    "ef": 91.35,
    "pond": 0.5,
    "pondVal": 45.67,
    "promReg": null,
    "ronda1": 89.21,
    "ronda2": 91.35,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "SAN CRISTOBAL",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 91.58,
    "ronda1": 88.41,
    "ronda2": 91.58,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "SAN CRISTOBAL",
    "ef": 90.04,
    "pond": 0.4,
    "pondVal": 36.02,
    "promReg": null,
    "ronda1": 86.76,
    "ronda2": 90.04,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 99.15,
    "pond": 0.05,
    "pondVal": 4.96,
    "promReg": null,
    "ronda1": 50.0,
    "ronda2": 99.15,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "PUERTA DEL SOL",
    "ef": 94.22,
    "pond": 0.5,
    "pondVal": 47.11,
    "promReg": null,
    "ronda1": 95.42,
    "ronda2": 94.22,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "BARCELONA",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 83.32,
    "ronda1": 80.1,
    "ronda2": 83.32,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "BARCELONA",
    "ef": 83.15,
    "pond": 0.4,
    "pondVal": 33.26,
    "promReg": null,
    "ronda1": 75.48,
    "ronda2": 83.15,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 78.83,
    "pond": 0.05,
    "pondVal": 3.94,
    "promReg": null,
    "ronda1": 78.83,
    "ronda2": 78.83,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "Tigrito",
    "ef": 85.98,
    "pond": 0.125,
    "pondVal": 10.75,
    "promReg": null,
    "ronda1": 81.26,
    "ronda2": 85.98,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "Anaco",
    "ef": 86.29,
    "pond": 0.125,
    "pondVal": 10.79,
    "promReg": null,
    "ronda1": 90.6,
    "ronda2": 86.29,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "Cumana",
    "ef": 81.63,
    "pond": 0.125,
    "pondVal": 10.2,
    "promReg": null,
    "ronda1": 85.78,
    "ronda2": 81.63,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "Puerto la Cruz",
    "ef": 87.06,
    "pond": 0.125,
    "pondVal": 10.88,
    "promReg": null,
    "ronda1": 82.06,
    "ronda2": 87.06,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "MARACAIBO",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 79.28,
    "ronda1": 82.19,
    "ronda2": 79.28,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "MARACAIBO",
    "ef": 84.25,
    "pond": 0.4,
    "pondVal": 33.7,
    "promReg": null,
    "ronda1": 84.11,
    "ronda2": 84.25,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 55.5,
    "pond": 0.05,
    "pondVal": 2.78,
    "promReg": null,
    "ronda1": 87.34,
    "ronda2": 55.5,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CABIMAS",
    "ef": 76.69,
    "pond": 0.0833,
    "pondVal": 6.39,
    "promReg": null,
    "ronda1": 76.4,
    "ronda2": 76.69,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CIUDAD OJEDA",
    "ef": 92.47,
    "pond": 0.0833,
    "pondVal": 7.7,
    "promReg": null,
    "ronda1": 78.05,
    "ronda2": 92.47,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "VILLA DEL ROSARIO",
    "ef": 75.11,
    "pond": 0.0833,
    "pondVal": 6.26,
    "promReg": null,
    "ronda1": 86.48,
    "ronda2": 75.11,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "DR. PORTILLO",
    "ef": 77.79,
    "pond": 0.0833,
    "pondVal": 6.48,
    "promReg": null,
    "ronda1": 84.86,
    "ronda2": 77.79,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA LIMPIA",
    "ef": 77.46,
    "pond": 0.0833,
    "pondVal": 6.45,
    "promReg": null,
    "ronda1": 85.58,
    "ronda2": 77.46,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "MONTE CLARO",
    "ef": 72.16,
    "pond": 0.0833,
    "pondVal": 6.01,
    "promReg": null,
    "ronda1": 76.82,
    "ronda2": 72.16,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "CARACAS",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 89.28,
    "ronda1": 83.35,
    "ronda2": 89.28,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "CARACAS",
    "ef": 92.14,
    "pond": 0.4,
    "pondVal": 36.86,
    "promReg": null,
    "ronda1": 77.26,
    "ronda2": 92.14,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 76.54,
    "pond": 0.05,
    "pondVal": 3.83,
    "promReg": null,
    "ronda1": 81.78,
    "ronda2": 76.54,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CHAGUARAMOS",
    "ef": 90.18,
    "pond": 0.0294,
    "pondVal": 2.65,
    "promReg": null,
    "ronda1": 89.62,
    "ronda2": 90.18,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "ALTAMIRA",
    "ef": 73.17,
    "pond": 0.0294,
    "pondVal": 2.15,
    "promReg": null,
    "ronda1": 75.48,
    "ronda2": 73.17,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CATIA",
    "ef": 95.34,
    "pond": 0.0294,
    "pondVal": 2.8,
    "promReg": null,
    "ronda1": 89.55,
    "ronda2": 95.34,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CEMENTERIO",
    "ef": 91.66,
    "pond": 0.0294,
    "pondVal": 2.69,
    "promReg": null,
    "ronda1": 92.53,
    "ronda2": 91.66,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CERRO VERDE",
    "ef": 89.7,
    "pond": 0.0294,
    "pondVal": 2.64,
    "promReg": null,
    "ronda1": 93.72,
    "ronda2": 89.7,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CHARALLAVE",
    "ef": 88.7,
    "pond": 0.0294,
    "pondVal": 2.61,
    "promReg": null,
    "ronda1": 86.52,
    "ronda2": 88.7,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "GUARENAS",
    "ef": 90.66,
    "pond": 0.0294,
    "pondVal": 2.67,
    "promReg": null,
    "ronda1": 92.97,
    "ronda2": 90.66,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "GUATIRE",
    "ef": 90.45,
    "pond": 0.0294,
    "pondVal": 2.66,
    "promReg": null,
    "ronda1": 93.81,
    "ronda2": 90.45,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA CALIFORNIA",
    "ef": 87.26,
    "pond": 0.0294,
    "pondVal": 2.57,
    "promReg": null,
    "ronda1": 87.83,
    "ronda2": 87.26,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA GUAIRA",
    "ef": 87.19,
    "pond": 0.0294,
    "pondVal": 2.56,
    "promReg": null,
    "ronda1": 87.78,
    "ronda2": 87.19,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA TRINIDAD",
    "ef": 93.29,
    "pond": 0.0294,
    "pondVal": 2.74,
    "promReg": null,
    "ronda1": 91.16,
    "ronda2": 93.29,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LAS ACACIAS",
    "ef": 92.55,
    "pond": 0.0294,
    "pondVal": 2.72,
    "promReg": null,
    "ronda1": 90.36,
    "ronda2": 92.55,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LOS TEQUES",
    "ef": 91.96,
    "pond": 0.0294,
    "pondVal": 2.7,
    "promReg": null,
    "ronda1": 90.24,
    "ronda2": 91.96,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LOS RUICES",
    "ef": 95.17,
    "pond": 0.0294,
    "pondVal": 2.8,
    "promReg": null,
    "ronda1": 89.45,
    "ronda2": 95.17,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "EXPRESS LOS RUICES",
    "ef": 95.17,
    "pond": 0.0294,
    "pondVal": 2.8,
    "promReg": null,
    "ronda1": 89.45,
    "ronda2": 95.17,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "MARIPEREZ",
    "ef": 88.01,
    "pond": 0.0294,
    "pondVal": 2.59,
    "promReg": null,
    "ronda1": 93.6,
    "ronda2": 88.01,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SAN MARTIN",
    "ef": 92.72,
    "pond": 0.0294,
    "pondVal": 2.73,
    "promReg": null,
    "ronda1": 91.13,
    "ronda2": 92.72,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "BARQUISIMETO",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 79.75,
    "ronda1": 81.67,
    "ronda2": 79.75,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "BARQUISIMETO",
    "ef": 83.1,
    "pond": 0.4,
    "pondVal": 33.24,
    "promReg": null,
    "ronda1": 79.51,
    "ronda2": 83.1,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 69.95,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 68.71,
    "ronda2": 69.95,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "BARINAS",
    "ef": 83.6,
    "pond": 0.25,
    "pondVal": 20.9,
    "promReg": null,
    "ronda1": 84.09,
    "ronda2": 83.6,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "GUANARE",
    "ef": 74.44,
    "pond": 0.25,
    "pondVal": 18.61,
    "promReg": null,
    "ronda1": 87.62,
    "ronda2": 74.44,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "MARACAY",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 89.78,
    "ronda1": 86.43,
    "ronda2": 89.78,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "MARACAY",
    "ef": 90.2,
    "pond": 0.4,
    "pondVal": 36.08,
    "promReg": null,
    "ronda1": 87.43,
    "ronda2": 90.2,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 94.76,
    "pond": 0.05,
    "pondVal": 4.74,
    "promReg": null,
    "ronda1": 72.56,
    "ronda2": 94.76,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SAN FERNANDO DE APURE",
    "ef": 85.74,
    "pond": 0.125,
    "pondVal": 10.72,
    "promReg": null,
    "ronda1": 82.74,
    "ronda2": 85.74,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "VALLE DE LA PASCUA",
    "ef": 91.2,
    "pond": 0.125,
    "pondVal": 11.4,
    "promReg": null,
    "ronda1": 90.92,
    "ronda2": 91.2,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SAN JACINTO",
    "ef": 92.5,
    "pond": 0.125,
    "pondVal": 11.56,
    "promReg": null,
    "ronda1": 90.79,
    "ronda2": 92.5,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "TAPATAPA",
    "ef": 94.22,
    "pond": 0.125,
    "pondVal": 11.78,
    "promReg": null,
    "ronda1": 90.22,
    "ronda2": 94.22,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "VALENCIA",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 89.6,
    "ronda1": 89.6,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "VALENCIA",
    "ef": 87.71,
    "pond": 0.4,
    "pondVal": 35.08,
    "promReg": null,
    "ronda1": 87.71,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 72.56,
    "pond": 0.05,
    "pondVal": 3.63,
    "promReg": null,
    "ronda1": 72.56,
    "ronda2": 94.76,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SERV.GUACARA",
    "ef": 95.42,
    "pond": 0.125,
    "pondVal": 11.93,
    "promReg": null,
    "ronda1": 95.42,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA QUIZANDA",
    "ef": 95.41,
    "pond": 0.125,
    "pondVal": 11.93,
    "promReg": null,
    "ronda1": 95.41,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SANTA CECILIA",
    "ef": 93.99,
    "pond": 0.125,
    "pondVal": 11.75,
    "promReg": null,
    "ronda1": 93.99,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "PUERTO CABELLO",
    "ef": 94.27,
    "pond": 0.125,
    "pondVal": 11.78,
    "promReg": null,
    "ronda1": 94.27,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "LOCALIDAD",
    "item": "EL VIGIA",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 81.23,
    "ronda1": 80.8,
    "ronda2": 81.23,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "EL VIGIA",
    "ef": 86.2,
    "pond": 0.4,
    "pondVal": 34.48,
    "promReg": null,
    "ronda1": 91.05,
    "ronda2": 86.2,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 95.01,
    "pond": 0.05,
    "pondVal": 4.75,
    "promReg": null,
    "ronda1": 89.72,
    "ronda2": 95.01,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "MERIDA",
    "ef": 82.0,
    "pond": 0.25,
    "pondVal": 20.5,
    "promReg": null,
    "ronda1": 80.0,
    "ronda2": 82.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "VALERA",
    "ef": 72.01,
    "pond": 0.25,
    "pondVal": 18.0,
    "promReg": null,
    "ronda1": 65.57,
    "ronda2": 72.01,
    "hasRonda2": true
  }
];

export const SAMPLE_MATRIX_DATA_2025_2026: MatrixRow[] = [
  {
    "ambito": "LOCALIDAD",
    "item": "PUERTO ORDAZ",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 82.91,
    "ronda1": 78.61,
    "ronda2": 82.91,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "PUERTO ORDAZ",
    "ef": 74.08,
    "pond": 0.4,
    "pondVal": 29.63,
    "promReg": null,
    "ronda1": 73.15,
    "ronda2": 74.08,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 94.76,
    "pond": 0.05,
    "pondVal": 4.74,
    "promReg": null,
    "ronda1": 72.56,
    "ronda2": 94.76,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "UNARE",
    "ef": 97.03,
    "pond": 0.1,
    "pondVal": 9.7,
    "promReg": null,
    "ronda1": 69.45,
    "ronda2": 97.03,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SAN FELIX",
    "ef": 94.28,
    "pond": 0.1,
    "pondVal": 9.43,
    "promReg": null,
    "ronda1": 91.11,
    "ronda2": 94.28,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "UPATA",
    "ef": 91.53,
    "pond": 0.1,
    "pondVal": 9.15,
    "promReg": null,
    "ronda1": 93.68,
    "ronda2": 91.53,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CIUDAD BOLIVAR",
    "ef": 83.77,
    "pond": 0.1,
    "pondVal": 8.38,
    "promReg": null,
    "ronda1": 77.68,
    "ronda2": 83.77,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "MATURIN",
    "ef": 83.77,
    "pond": 0.1,
    "pondVal": 8.38,
    "promReg": null,
    "ronda1": 90.32,
    "ronda2": 83.77,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "PUNTO FIJO",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 90.48,
    "ronda1": 89.86,
    "ronda2": 90.48,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "PUNTO FIJO",
    "ef": 89.8,
    "pond": 0.4,
    "pondVal": 35.92,
    "promReg": null,
    "ronda1": 90.82,
    "ronda2": 89.8,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 94.16,
    "pond": 0.05,
    "pondVal": 4.71,
    "promReg": null,
    "ronda1": 94.16,
    "ronda2": 94.16,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CORO",
    "ef": 92.7,
    "pond": 0.5,
    "pondVal": 46.35,
    "promReg": null,
    "ronda1": 90.64,
    "ronda2": 92.7,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "PORLAMAR",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 74.57,
    "ronda1": 74.57,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "PORLAMAR",
    "ef": 74.5,
    "pond": 0.4,
    "pondVal": 29.8,
    "promReg": null,
    "ronda1": 74.5,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 82.41,
    "pond": 0.05,
    "pondVal": 4.12,
    "promReg": null,
    "ronda1": 82.41,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LOS ROBLES",
    "ef": 74.3,
    "pond": 0.5,
    "pondVal": 37.15,
    "promReg": null,
    "ronda1": 74.3,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "LOCALIDAD",
    "item": "SAN CRISTOBAL",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 89.39,
    "ronda1": 89.39,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "SAN CRISTOBAL",
    "ef": 89.58,
    "pond": 0.4,
    "pondVal": 35.83,
    "promReg": null,
    "ronda1": 89.58,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 86.0,
    "pond": 0.05,
    "pondVal": 4.3,
    "promReg": null,
    "ronda1": 86.0,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "PUERTA DEL SOL",
    "ef": 91.51,
    "pond": 0.5,
    "pondVal": 45.76,
    "promReg": null,
    "ronda1": 91.51,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "LOCALIDAD",
    "item": "BARCELONA",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 83.32,
    "ronda1": 88.3,
    "ronda2": 83.32,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "BARCELONA",
    "ef": 83.15,
    "pond": 0.4,
    "pondVal": 33.26,
    "promReg": null,
    "ronda1": 98.16,
    "ronda2": 83.15,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 78.83,
    "pond": 0.05,
    "pondVal": 3.94,
    "promReg": null,
    "ronda1": 78.83,
    "ronda2": 78.83,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "Tigrito",
    "ef": 85.98,
    "pond": 0.125,
    "pondVal": 10.75,
    "promReg": null,
    "ronda1": 83.0,
    "ronda2": 85.98,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "Anaco",
    "ef": 86.29,
    "pond": 0.125,
    "pondVal": 10.79,
    "promReg": null,
    "ronda1": 91.9,
    "ronda2": 86.29,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "Cumana",
    "ef": 81.63,
    "pond": 0.125,
    "pondVal": 10.2,
    "promReg": null,
    "ronda1": 80.32,
    "ronda2": 81.63,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "Puerto la Cruz",
    "ef": 87.06,
    "pond": 0.125,
    "pondVal": 10.88,
    "promReg": null,
    "ronda1": 77.57,
    "ronda2": 87.06,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "MARACAIBO",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 75.47,
    "ronda1": 75.47,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "MARACAIBO",
    "ef": 68.82,
    "pond": 0.4,
    "pondVal": 27.53,
    "promReg": null,
    "ronda1": 68.82,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 87.34,
    "pond": 0.05,
    "pondVal": 4.37,
    "promReg": null,
    "ronda1": 87.34,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CABIMAS",
    "ef": 79.68,
    "pond": 0.0833,
    "pondVal": 6.64,
    "promReg": null,
    "ronda1": 79.68,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CIUDAD OJEDA",
    "ef": 79.65,
    "pond": 0.0833,
    "pondVal": 6.63,
    "promReg": null,
    "ronda1": 79.65,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "VILLA DEL ROSARIO",
    "ef": 84.38,
    "pond": 0.0833,
    "pondVal": 7.03,
    "promReg": null,
    "ronda1": 84.38,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "DR. PORTILLO",
    "ef": 77.7,
    "pond": 0.0833,
    "pondVal": 6.47,
    "promReg": null,
    "ronda1": 77.7,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA LIMPIA",
    "ef": 78.28,
    "pond": 0.0833,
    "pondVal": 6.52,
    "promReg": null,
    "ronda1": 78.28,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "MONTE CLARO",
    "ef": 81.15,
    "pond": 0.0833,
    "pondVal": 6.76,
    "promReg": null,
    "ronda1": 81.15,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "LOCALIDAD",
    "item": "CARACAS",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 81.13,
    "ronda1": 85.02,
    "ronda2": 81.13,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "CARACAS",
    "ef": 72.0,
    "pond": 0.4,
    "pondVal": 28.8,
    "promReg": null,
    "ronda1": 79.62,
    "ronda2": 72.0,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 76.54,
    "pond": 0.05,
    "pondVal": 3.83,
    "promReg": null,
    "ronda1": 100.0,
    "ronda2": 76.54,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 100.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CHAGUARAMOS",
    "ef": 90.18,
    "pond": 0.0278,
    "pondVal": 2.51,
    "promReg": null,
    "ronda1": 89.62,
    "ronda2": 90.18,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "ALTAMIRA",
    "ef": 73.17,
    "pond": 0.0278,
    "pondVal": 2.03,
    "promReg": null,
    "ronda1": 75.48,
    "ronda2": 73.17,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CATIA",
    "ef": 95.34,
    "pond": 0.0278,
    "pondVal": 2.65,
    "promReg": null,
    "ronda1": 89.55,
    "ronda2": 95.34,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CEMENTERIO",
    "ef": 91.66,
    "pond": 0.0278,
    "pondVal": 2.55,
    "promReg": null,
    "ronda1": 92.53,
    "ronda2": 91.66,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CERRO VERDE",
    "ef": 89.7,
    "pond": 0.0278,
    "pondVal": 2.49,
    "promReg": null,
    "ronda1": 93.72,
    "ronda2": 89.7,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CHARALLAVE",
    "ef": 88.7,
    "pond": 0.0278,
    "pondVal": 2.47,
    "promReg": null,
    "ronda1": 57.77,
    "ronda2": 88.7,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "GUARENAS",
    "ef": 90.66,
    "pond": 0.0278,
    "pondVal": 2.52,
    "promReg": null,
    "ronda1": 78.32,
    "ronda2": 90.66,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "GUATIRE",
    "ef": 90.45,
    "pond": 0.0278,
    "pondVal": 2.51,
    "promReg": null,
    "ronda1": 81.25,
    "ronda2": 90.45,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "HORIZONTE",
    "ef": 87.0,
    "pond": 0.0278,
    "pondVal": 2.42,
    "promReg": null,
    "ronda1": 85.0,
    "ronda2": 87.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA CALIFORNIA",
    "ef": 87.26,
    "pond": 0.0278,
    "pondVal": 2.43,
    "promReg": null,
    "ronda1": 87.83,
    "ronda2": 87.26,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA GUAIRA",
    "ef": 87.19,
    "pond": 0.0278,
    "pondVal": 2.42,
    "promReg": null,
    "ronda1": 87.78,
    "ronda2": 87.19,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA TRINIDAD",
    "ef": 93.29,
    "pond": 0.0278,
    "pondVal": 2.59,
    "promReg": null,
    "ronda1": 91.16,
    "ronda2": 93.29,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LAS ACACIAS",
    "ef": 92.55,
    "pond": 0.0278,
    "pondVal": 2.57,
    "promReg": null,
    "ronda1": 90.36,
    "ronda2": 92.55,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LOS TEQUES",
    "ef": 91.96,
    "pond": 0.0278,
    "pondVal": 2.56,
    "promReg": null,
    "ronda1": 90.24,
    "ronda2": 91.96,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LOS RUICES",
    "ef": 95.17,
    "pond": 0.0278,
    "pondVal": 2.65,
    "promReg": null,
    "ronda1": 89.45,
    "ronda2": 95.17,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "EXPRESS LOS RUICES",
    "ef": 95.17,
    "pond": 0.0278,
    "pondVal": 2.65,
    "promReg": null,
    "ronda1": 89.45,
    "ronda2": 95.17,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "MARIPEREZ",
    "ef": 88.01,
    "pond": 0.0278,
    "pondVal": 2.45,
    "promReg": null,
    "ronda1": 93.6,
    "ronda2": 88.01,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SAN MARTIN",
    "ef": 92.72,
    "pond": 0.0278,
    "pondVal": 2.58,
    "promReg": null,
    "ronda1": 91.13,
    "ronda2": 92.72,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "BARQUISIMETO",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 91.35,
    "ronda1": 91.35,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "BARQUISIMETO",
    "ef": 92.32,
    "pond": 0.4,
    "pondVal": 36.93,
    "promReg": null,
    "ronda1": 92.32,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 95.09,
    "pond": 0.05,
    "pondVal": 4.75,
    "promReg": null,
    "ronda1": 95.09,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "BARINAS",
    "ef": 94.12,
    "pond": 0.125,
    "pondVal": 11.77,
    "promReg": null,
    "ronda1": 94.12,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "GUANARE",
    "ef": 91.1,
    "pond": 0.125,
    "pondVal": 11.39,
    "promReg": null,
    "ronda1": 91.1,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "DEL ESTE",
    "ef": 92.61,
    "pond": 0.125,
    "pondVal": 11.58,
    "promReg": null,
    "ronda1": 92.61,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "ACARIGUA",
    "ef": 91.49,
    "pond": 0.125,
    "pondVal": 11.44,
    "promReg": null,
    "ronda1": 91.49,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "LOCALIDAD",
    "item": "MARACAY",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 87.24,
    "ronda1": 68.35,
    "ronda2": 87.24,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "MARACAY",
    "ef": 92.54,
    "pond": 0.4,
    "pondVal": 37.02,
    "promReg": null,
    "ronda1": 62.95,
    "ronda2": 92.54,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 99.66,
    "pond": 0.05,
    "pondVal": 4.98,
    "promReg": null,
    "ronda1": 72.56,
    "ronda2": 99.66,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SAN FERNANDO DE APURE",
    "ef": 88.49,
    "pond": 0.125,
    "pondVal": 11.06,
    "promReg": null,
    "ronda1": 82.74,
    "ronda2": 88.49,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "VALLE DE LA PASCUA",
    "ef": 91.2,
    "pond": 0.125,
    "pondVal": 11.4,
    "promReg": null,
    "ronda1": 90.92,
    "ronda2": 91.2,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SAN JACINTO",
    "ef": 80.71,
    "pond": 0.125,
    "pondVal": 10.09,
    "promReg": null,
    "ronda1": 58.87,
    "ronda2": 80.71,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "TAPATAPA",
    "ef": 73.53,
    "pond": 0.125,
    "pondVal": 9.19,
    "promReg": null,
    "ronda1": 55.77,
    "ronda2": 73.53,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "VALENCIA",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 86.9,
    "ronda1": 86.59,
    "ronda2": 86.9,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "VALENCIA",
    "ef": 92.96,
    "pond": 0.4,
    "pondVal": 37.18,
    "promReg": null,
    "ronda1": 94.38,
    "ronda2": 92.96,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 54.25,
    "pond": 0.05,
    "pondVal": 2.71,
    "promReg": null,
    "ronda1": 54.25,
    "ronda2": 54.25,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 100.0,
    "pond": 0.05,
    "pondVal": 5.0,
    "promReg": null,
    "ronda1": 100.0,
    "ronda2": 100.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SERV.GUACARA",
    "ef": 76.54,
    "pond": 0.125,
    "pondVal": 9.57,
    "promReg": null,
    "ronda1": 84.38,
    "ronda2": 76.54,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA QUIZANDA",
    "ef": 89.57,
    "pond": 0.125,
    "pondVal": 11.2,
    "promReg": null,
    "ronda1": 77.95,
    "ronda2": 89.57,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SANTA CECILIA",
    "ef": 90.89,
    "pond": 0.125,
    "pondVal": 11.36,
    "promReg": null,
    "ronda1": 82.67,
    "ronda2": 90.89,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "PUERTO CABELLO",
    "ef": 79.0,
    "pond": 0.125,
    "pondVal": 9.88,
    "promReg": null,
    "ronda1": 83.99,
    "ronda2": 79.0,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "EL VIGIA",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 85.08,
    "ronda1": 85.76,
    "ronda2": 85.08,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "EL VIGIA",
    "ef": 86.2,
    "pond": 0.4,
    "pondVal": 34.48,
    "promReg": null,
    "ronda1": 96.4,
    "ronda2": 86.2,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Vehículos Carga Pesada",
    "ef": 95.01,
    "pond": 0.05,
    "pondVal": 4.75,
    "promReg": null,
    "ronda1": 89.72,
    "ronda2": 95.01,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "MERIDA",
    "ef": 97.39,
    "pond": 0.25,
    "pondVal": 24.35,
    "promReg": null,
    "ronda1": 91.29,
    "ronda2": 97.39,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "VALERA",
    "ef": 72.01,
    "pond": 0.25,
    "pondVal": 18.0,
    "promReg": null,
    "ronda1": 65.57,
    "ronda2": 72.01,
    "hasRonda2": true
  }
];

export const SAMPLE_MATRIX_DATA_2026_2027: MatrixRow[] = [
  {
    "ambito": "LOCALIDAD",
    "item": "PUERTO ORDAZ",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 82.91,
    "ronda1": 78.61,
    "ronda2": 82.91,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "PUERTO ORDAZ",
    "ef": 74.08,
    "pond": 0.4,
    "pondVal": 29.63,
    "promReg": null,
    "ronda1": 73.15,
    "ronda2": 74.08,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Veh\u00edculos Carga Pesada",
    "ef": 94.76,
    "pond": 0.05,
    "pondVal": 4.74,
    "promReg": null,
    "ronda1": 72.56,
    "ronda2": 94.76,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "UNARE",
    "ef": 97.03,
    "pond": 0.1,
    "pondVal": 9.7,
    "promReg": null,
    "ronda1": 69.45,
    "ronda2": 97.03,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SAN FELIX",
    "ef": 94.28,
    "pond": 0.1,
    "pondVal": 9.43,
    "promReg": null,
    "ronda1": 91.11,
    "ronda2": 94.28,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "UPATA",
    "ef": 91.53,
    "pond": 0.1,
    "pondVal": 9.15,
    "promReg": null,
    "ronda1": 93.68,
    "ronda2": 91.53,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CIUDAD BOLIVAR",
    "ef": 83.77,
    "pond": 0.1,
    "pondVal": 8.38,
    "promReg": null,
    "ronda1": 77.68,
    "ronda2": 83.77,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "MATURIN",
    "ef": 83.77,
    "pond": 0.1,
    "pondVal": 8.38,
    "promReg": null,
    "ronda1": 90.32,
    "ronda2": 83.77,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "PUNTO FIJO",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 90.48,
    "ronda1": 89.86,
    "ronda2": 90.48,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "PUNTO FIJO",
    "ef": 89.8,
    "pond": 0.4,
    "pondVal": 35.92,
    "promReg": null,
    "ronda1": 90.82,
    "ronda2": 89.8,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Veh\u00edculos Carga Pesada",
    "ef": 94.16,
    "pond": 0.05,
    "pondVal": 4.71,
    "promReg": null,
    "ronda1": 94.16,
    "ronda2": 94.16,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CORO",
    "ef": 92.7,
    "pond": 0.5,
    "pondVal": 46.35,
    "promReg": null,
    "ronda1": 90.64,
    "ronda2": 92.7,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "PORLAMAR",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 74.57,
    "ronda1": 74.57,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "PORLAMAR",
    "ef": 74.5,
    "pond": 0.4,
    "pondVal": 29.8,
    "promReg": null,
    "ronda1": 74.5,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Veh\u00edculos Carga Pesada",
    "ef": 82.41,
    "pond": 0.05,
    "pondVal": 4.12,
    "promReg": null,
    "ronda1": 82.41,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LOS ROBLES",
    "ef": 74.3,
    "pond": 0.5,
    "pondVal": 37.15,
    "promReg": null,
    "ronda1": 74.3,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "LOCALIDAD",
    "item": "SAN CRISTOBAL",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 89.39,
    "ronda1": 89.39,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "SAN CRISTOBAL",
    "ef": 89.58,
    "pond": 0.4,
    "pondVal": 35.83,
    "promReg": null,
    "ronda1": 89.58,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Veh\u00edculos Carga Pesada",
    "ef": 86.0,
    "pond": 0.05,
    "pondVal": 4.3,
    "promReg": null,
    "ronda1": 86.0,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "PUERTA DEL SOL",
    "ef": 91.51,
    "pond": 0.5,
    "pondVal": 45.76,
    "promReg": null,
    "ronda1": 91.51,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "LOCALIDAD",
    "item": "BARCELONA",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 83.32,
    "ronda1": 88.3,
    "ronda2": 83.32,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "BARCELONA",
    "ef": 83.15,
    "pond": 0.4,
    "pondVal": 33.26,
    "promReg": null,
    "ronda1": 98.16,
    "ronda2": 83.15,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Veh\u00edculos Carga Pesada",
    "ef": 78.83,
    "pond": 0.05,
    "pondVal": 3.94,
    "promReg": null,
    "ronda1": 78.83,
    "ronda2": 78.83,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "Tigrito",
    "ef": 85.98,
    "pond": 0.125,
    "pondVal": 10.75,
    "promReg": null,
    "ronda1": 83.0,
    "ronda2": 85.98,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "Anaco",
    "ef": 86.29,
    "pond": 0.125,
    "pondVal": 10.79,
    "promReg": null,
    "ronda1": 91.9,
    "ronda2": 86.29,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "Cumana",
    "ef": 81.63,
    "pond": 0.125,
    "pondVal": 10.2,
    "promReg": null,
    "ronda1": 80.32,
    "ronda2": 81.63,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "Puerto la Cruz",
    "ef": 87.06,
    "pond": 0.125,
    "pondVal": 10.88,
    "promReg": null,
    "ronda1": 77.57,
    "ronda2": 87.06,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "MARACAIBO",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 75.47,
    "ronda1": 75.47,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "MARACAIBO",
    "ef": 68.82,
    "pond": 0.4,
    "pondVal": 27.53,
    "promReg": null,
    "ronda1": 68.82,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Veh\u00edculos Carga Pesada",
    "ef": 87.34,
    "pond": 0.05,
    "pondVal": 4.37,
    "promReg": null,
    "ronda1": 87.34,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CABIMAS",
    "ef": 79.68,
    "pond": 0.0833,
    "pondVal": 6.64,
    "promReg": null,
    "ronda1": 79.68,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CIUDAD OJEDA",
    "ef": 79.65,
    "pond": 0.0833,
    "pondVal": 6.63,
    "promReg": null,
    "ronda1": 79.65,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "VILLA DEL ROSARIO",
    "ef": 84.38,
    "pond": 0.0833,
    "pondVal": 7.03,
    "promReg": null,
    "ronda1": 84.38,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "DR. PORTILLO",
    "ef": 77.7,
    "pond": 0.0833,
    "pondVal": 6.47,
    "promReg": null,
    "ronda1": 77.7,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA LIMPIA",
    "ef": 78.28,
    "pond": 0.0833,
    "pondVal": 6.52,
    "promReg": null,
    "ronda1": 78.28,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "MONTE CLARO",
    "ef": 81.15,
    "pond": 0.0833,
    "pondVal": 6.76,
    "promReg": null,
    "ronda1": 81.15,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "LOCALIDAD",
    "item": "CARACAS",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 81.13,
    "ronda1": 85.02,
    "ronda2": 81.13,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "CARACAS",
    "ef": 72.0,
    "pond": 0.4,
    "pondVal": 28.8,
    "promReg": null,
    "ronda1": 79.62,
    "ronda2": 72.0,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Veh\u00edculos Carga Pesada",
    "ef": 76.54,
    "pond": 0.05,
    "pondVal": 3.83,
    "promReg": null,
    "ronda1": 100.0,
    "ronda2": 76.54,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 100.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CHAGUARAMOS",
    "ef": 90.18,
    "pond": 0.0278,
    "pondVal": 2.51,
    "promReg": null,
    "ronda1": 89.62,
    "ronda2": 90.18,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "ALTAMIRA",
    "ef": 73.17,
    "pond": 0.0278,
    "pondVal": 2.03,
    "promReg": null,
    "ronda1": 75.48,
    "ronda2": 73.17,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CATIA",
    "ef": 95.34,
    "pond": 0.0278,
    "pondVal": 2.65,
    "promReg": null,
    "ronda1": 89.55,
    "ronda2": 95.34,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CEMENTERIO",
    "ef": 91.66,
    "pond": 0.0278,
    "pondVal": 2.55,
    "promReg": null,
    "ronda1": 92.53,
    "ronda2": 91.66,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CERRO VERDE",
    "ef": 89.7,
    "pond": 0.0278,
    "pondVal": 2.49,
    "promReg": null,
    "ronda1": 93.72,
    "ronda2": 89.7,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "CHARALLAVE",
    "ef": 88.7,
    "pond": 0.0278,
    "pondVal": 2.47,
    "promReg": null,
    "ronda1": 57.77,
    "ronda2": 88.7,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "GUARENAS",
    "ef": 90.66,
    "pond": 0.0278,
    "pondVal": 2.52,
    "promReg": null,
    "ronda1": 78.32,
    "ronda2": 90.66,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "GUATIRE",
    "ef": 90.45,
    "pond": 0.0278,
    "pondVal": 2.51,
    "promReg": null,
    "ronda1": 81.25,
    "ronda2": 90.45,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "HORIZONTE",
    "ef": 87.0,
    "pond": 0.0278,
    "pondVal": 2.42,
    "promReg": null,
    "ronda1": 85.0,
    "ronda2": 87.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA CALIFORNIA",
    "ef": 87.26,
    "pond": 0.0278,
    "pondVal": 2.43,
    "promReg": null,
    "ronda1": 87.83,
    "ronda2": 87.26,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA GUAIRA",
    "ef": 87.19,
    "pond": 0.0278,
    "pondVal": 2.42,
    "promReg": null,
    "ronda1": 87.78,
    "ronda2": 87.19,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA TRINIDAD",
    "ef": 93.29,
    "pond": 0.0278,
    "pondVal": 2.59,
    "promReg": null,
    "ronda1": 91.16,
    "ronda2": 93.29,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LAS ACACIAS",
    "ef": 92.55,
    "pond": 0.0278,
    "pondVal": 2.57,
    "promReg": null,
    "ronda1": 90.36,
    "ronda2": 92.55,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LOS TEQUES",
    "ef": 91.96,
    "pond": 0.0278,
    "pondVal": 2.56,
    "promReg": null,
    "ronda1": 90.24,
    "ronda2": 91.96,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LOS RUICES",
    "ef": 95.17,
    "pond": 0.0278,
    "pondVal": 2.65,
    "promReg": null,
    "ronda1": 89.45,
    "ronda2": 95.17,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "EXPRESS LOS RUICES",
    "ef": 95.17,
    "pond": 0.0278,
    "pondVal": 2.65,
    "promReg": null,
    "ronda1": 89.45,
    "ronda2": 95.17,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "MARIPEREZ",
    "ef": 88.01,
    "pond": 0.0278,
    "pondVal": 2.45,
    "promReg": null,
    "ronda1": 93.6,
    "ronda2": 88.01,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SAN MARTIN",
    "ef": 92.72,
    "pond": 0.0278,
    "pondVal": 2.58,
    "promReg": null,
    "ronda1": 91.13,
    "ronda2": 92.72,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "BARQUISIMETO",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 91.35,
    "ronda1": 91.35,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "BARQUISIMETO",
    "ef": 92.32,
    "pond": 0.4,
    "pondVal": 36.93,
    "promReg": null,
    "ronda1": 92.32,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Veh\u00edculos Carga Pesada",
    "ef": 95.09,
    "pond": 0.05,
    "pondVal": 4.75,
    "promReg": null,
    "ronda1": 95.09,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "BARINAS",
    "ef": 94.12,
    "pond": 0.125,
    "pondVal": 11.77,
    "promReg": null,
    "ronda1": 94.12,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "GUANARE",
    "ef": 91.1,
    "pond": 0.125,
    "pondVal": 11.39,
    "promReg": null,
    "ronda1": 91.1,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "DEL ESTE",
    "ef": 92.61,
    "pond": 0.125,
    "pondVal": 11.58,
    "promReg": null,
    "ronda1": 92.61,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "SERVICENTRO",
    "item": "ACARIGUA",
    "ef": 91.49,
    "pond": 0.125,
    "pondVal": 11.44,
    "promReg": null,
    "ronda1": 91.49,
    "ronda2": null,
    "hasRonda2": false
  },
  {
    "ambito": "LOCALIDAD",
    "item": "MARACAY",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 87.24,
    "ronda1": 68.35,
    "ronda2": 87.24,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "MARACAY",
    "ef": 92.54,
    "pond": 0.4,
    "pondVal": 37.02,
    "promReg": null,
    "ronda1": 62.95,
    "ronda2": 92.54,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Veh\u00edculos Carga Pesada",
    "ef": 99.66,
    "pond": 0.05,
    "pondVal": 4.98,
    "promReg": null,
    "ronda1": 72.56,
    "ronda2": 99.66,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SAN FERNANDO DE APURE",
    "ef": 88.49,
    "pond": 0.125,
    "pondVal": 11.06,
    "promReg": null,
    "ronda1": 82.74,
    "ronda2": 88.49,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "VALLE DE LA PASCUA",
    "ef": 91.2,
    "pond": 0.125,
    "pondVal": 11.4,
    "promReg": null,
    "ronda1": 90.92,
    "ronda2": 91.2,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SAN JACINTO",
    "ef": 80.71,
    "pond": 0.125,
    "pondVal": 10.09,
    "promReg": null,
    "ronda1": 58.87,
    "ronda2": 80.71,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "TAPATAPA",
    "ef": 73.53,
    "pond": 0.125,
    "pondVal": 9.19,
    "promReg": null,
    "ronda1": 55.77,
    "ronda2": 73.53,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "VALENCIA",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 86.9,
    "ronda1": 86.59,
    "ronda2": 86.9,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "VALENCIA",
    "ef": 92.96,
    "pond": 0.4,
    "pondVal": 37.18,
    "promReg": null,
    "ronda1": 94.38,
    "ronda2": 92.96,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Veh\u00edculos Carga Pesada",
    "ef": 54.25,
    "pond": 0.05,
    "pondVal": 2.71,
    "promReg": null,
    "ronda1": 54.25,
    "ronda2": 54.25,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 100.0,
    "pond": 0.05,
    "pondVal": 5.0,
    "promReg": null,
    "ronda1": 100.0,
    "ronda2": 100.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SERV.GUACARA",
    "ef": 76.54,
    "pond": 0.125,
    "pondVal": 9.57,
    "promReg": null,
    "ronda1": 84.38,
    "ronda2": 76.54,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "LA QUIZANDA",
    "ef": 89.57,
    "pond": 0.125,
    "pondVal": 11.2,
    "promReg": null,
    "ronda1": 77.95,
    "ronda2": 89.57,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "SANTA CECILIA",
    "ef": 90.89,
    "pond": 0.125,
    "pondVal": 11.36,
    "promReg": null,
    "ronda1": 82.67,
    "ronda2": 90.89,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "PUERTO CABELLO",
    "ef": 79.0,
    "pond": 0.125,
    "pondVal": 9.88,
    "promReg": null,
    "ronda1": 83.99,
    "ronda2": 79.0,
    "hasRonda2": true
  },
  {
    "ambito": "LOCALIDAD",
    "item": "EL VIGIA",
    "ef": null,
    "pond": null,
    "pondVal": null,
    "promReg": 85.08,
    "ronda1": 85.76,
    "ronda2": 85.08,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "EL VIGIA",
    "ef": 86.2,
    "pond": 0.4,
    "pondVal": 34.48,
    "promReg": null,
    "ronda1": 96.4,
    "ronda2": 86.2,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Veh\u00edculos Carga Pesada",
    "ef": 95.01,
    "pond": 0.05,
    "pondVal": 4.75,
    "promReg": null,
    "ronda1": 89.72,
    "ronda2": 95.01,
    "hasRonda2": true
  },
  {
    "ambito": "DISTRIBUIDORA",
    "item": "Montacargas",
    "ef": 70.0,
    "pond": 0.05,
    "pondVal": 3.5,
    "promReg": null,
    "ronda1": 70.0,
    "ronda2": 70.0,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "MERIDA",
    "ef": 97.39,
    "pond": 0.25,
    "pondVal": 24.35,
    "promReg": null,
    "ronda1": 91.29,
    "ronda2": 97.39,
    "hasRonda2": true
  },
  {
    "ambito": "SERVICENTRO",
    "item": "VALERA",
    "ef": 72.01,
    "pond": 0.25,
    "pondVal": 18.0,
    "promReg": null,
    "ronda1": 65.57,
    "ronda2": 72.01,
    "hasRonda2": true
  }
];

export const OFFICIAL_SERVICENTROS_2024_2025: any[] = [
  {
    "id": 1,
    "distribuidora": "SAN CRISTOBAL",
    "name": "PUERTA DEL SOL",
    "ronda1": 84,
    "ronda2": 86,
    "hasRonda2": true,
    "ef": 86
  },
  {
    "id": 2,
    "distribuidora": "VIGIA",
    "name": "MERIDA",
    "ronda1": 84,
    "ronda2": 87,
    "hasRonda2": true,
    "ef": 87
  },
  {
    "id": 3,
    "distribuidora": "VIGIA",
    "name": "VALERA",
    "ronda1": 84,
    "ronda2": 87,
    "hasRonda2": true,
    "ef": 87
  },
  {
    "id": 4,
    "distribuidora": "MARACAIBO",
    "name": "CABIMAS",
    "ronda1": 87,
    "ronda2": 89,
    "hasRonda2": true,
    "ef": 89
  },
  {
    "id": 5,
    "distribuidora": "MARACAIBO",
    "name": "CIUDAD OJEDA",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 6,
    "distribuidora": "MARACAIBO",
    "name": "VILLA DEL ROSARIO",
    "ronda1": 86,
    "ronda2": 89,
    "hasRonda2": true,
    "ef": 89
  },
  {
    "id": 7,
    "distribuidora": "MARACAIBO",
    "name": "DR. PORTILLO",
    "ronda1": 74,
    "ronda2": 80,
    "hasRonda2": true,
    "ef": 80
  },
  {
    "id": 8,
    "distribuidora": "MARACAIBO",
    "name": "LA LIMPIA",
    "ronda1": 86,
    "ronda2": 89,
    "hasRonda2": true,
    "ef": 89
  },
  {
    "id": 9,
    "distribuidora": "MARACAIBO",
    "name": "MONTE CLARO",
    "ronda1": 80,
    "ronda2": 86,
    "hasRonda2": true,
    "ef": 86
  },
  {
    "id": 10,
    "distribuidora": "PUNTO FIJO",
    "name": "CORO",
    "ronda1": 95,
    "ronda2": null,
    "hasRonda2": false,
    "ef": 95
  },
  {
    "id": 11,
    "distribuidora": "BARQUISIMETO",
    "name": "GUANARE",
    "ronda1": 84,
    "ronda2": 87,
    "hasRonda2": true,
    "ef": 87
  },
  {
    "id": 12,
    "distribuidora": "BARQUISIMETO",
    "name": "BARINAS",
    "ronda1": 84,
    "ronda2": 87,
    "hasRonda2": true,
    "ef": 87
  },
  {
    "id": 13,
    "distribuidora": "VALENCIA",
    "name": "SERV.GUACARA",
    "ronda1": 87,
    "ronda2": 88,
    "hasRonda2": true,
    "ef": 88
  },
  {
    "id": 14,
    "distribuidora": "VALENCIA",
    "name": "LA QUIZANDA",
    "ronda1": 84,
    "ronda2": 89,
    "hasRonda2": true,
    "ef": 89
  },
  {
    "id": 15,
    "distribuidora": "VALENCIA",
    "name": "SANTA CECILIA",
    "ronda1": 89,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 16,
    "distribuidora": "VALENCIA",
    "name": "PUERTO CABELLO",
    "ronda1": 84,
    "ronda2": 85,
    "hasRonda2": true,
    "ef": 85
  },
  {
    "id": 17,
    "distribuidora": "MARACAY",
    "name": "SAN FERNANDO DE APURE",
    "ronda1": 80,
    "ronda2": 85,
    "hasRonda2": true,
    "ef": 85
  },
  {
    "id": 18,
    "distribuidora": "MARACAY",
    "name": "VALLE DE LA PASCUA",
    "ronda1": 87,
    "ronda2": 89,
    "hasRonda2": true,
    "ef": 89
  },
  {
    "id": 19,
    "distribuidora": "MARACAY",
    "name": "SAN JACINTO",
    "ronda1": 74,
    "ronda2": 79,
    "hasRonda2": true,
    "ef": 79
  },
  {
    "id": 20,
    "distribuidora": "MARACAY",
    "name": "TAPATAPA",
    "ronda1": 75,
    "ronda2": 80,
    "hasRonda2": true,
    "ef": 80
  },
  {
    "id": 21,
    "distribuidora": "PORLAMAR",
    "name": "LOS ROBLES",
    "ronda1": 76,
    "ronda2": 80,
    "hasRonda2": true,
    "ef": 80
  },
  {
    "id": 22,
    "distribuidora": "BARCELONA",
    "name": "ANACO",
    "ronda1": 70,
    "ronda2": 75,
    "hasRonda2": true,
    "ef": 75
  },
  {
    "id": 23,
    "distribuidora": "BARCELONA",
    "name": "EL TIGRITO",
    "ronda1": 75,
    "ronda2": 80,
    "hasRonda2": true,
    "ef": 80
  },
  {
    "id": 24,
    "distribuidora": "BARCELONA",
    "name": "PUERTO LA CRUZ",
    "ronda1": 84,
    "ronda2": 87,
    "hasRonda2": true,
    "ef": 87
  },
  {
    "id": 25,
    "distribuidora": "BARCELONA",
    "name": "CUMANA",
    "ronda1": 75,
    "ronda2": 80,
    "hasRonda2": true,
    "ef": 80
  },
  {
    "id": 26,
    "distribuidora": "PUERTO ORDAZ",
    "name": "UNARE",
    "ronda1": 65,
    "ronda2": 70,
    "hasRonda2": true,
    "ef": 70
  },
  {
    "id": 27,
    "distribuidora": "PUERTO ORDAZ",
    "name": "SAN FELIX",
    "ronda1": 65,
    "ronda2": 70,
    "hasRonda2": true,
    "ef": 70
  },
  {
    "id": 28,
    "distribuidora": "PUERTO ORDAZ",
    "name": "UPATA",
    "ronda1": 65,
    "ronda2": 70,
    "hasRonda2": true,
    "ef": 70
  },
  {
    "id": 29,
    "distribuidora": "PUERTO ORDAZ",
    "name": "CIUDAD BOLIVAR",
    "ronda1": 65,
    "ronda2": 70,
    "hasRonda2": true,
    "ef": 70
  },
  {
    "id": 30,
    "distribuidora": "PUERTO ORDAZ",
    "name": "MATURIN",
    "ronda1": 65,
    "ronda2": 70,
    "hasRonda2": true,
    "ef": 70
  },
  {
    "id": 31,
    "distribuidora": "LOS RUICES",
    "name": "CHAGUARAMOS",
    "ronda1": 84,
    "ronda2": 89,
    "hasRonda2": true,
    "ef": 89
  },
  {
    "id": 32,
    "distribuidora": "LOS RUICES",
    "name": "ALTAMIRA",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 33,
    "distribuidora": "LOS RUICES",
    "name": "CATIA",
    "ronda1": 88,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 34,
    "distribuidora": "LOS RUICES",
    "name": "CEMENTERIO",
    "ronda1": 86,
    "ronda2": 89,
    "hasRonda2": true,
    "ef": 89
  },
  {
    "id": 35,
    "distribuidora": "LOS RUICES",
    "name": "CERRO VERDE",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 36,
    "distribuidora": "LOS RUICES",
    "name": "CHARALLAVE",
    "ronda1": 88,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 37,
    "distribuidora": "LOS RUICES",
    "name": "GUARENAS",
    "ronda1": 86,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 38,
    "distribuidora": "LOS RUICES",
    "name": "GUATIRE",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 39,
    "distribuidora": "LOS RUICES",
    "name": "LA CALIFORNIA",
    "ronda1": 88,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 40,
    "distribuidora": "LOS RUICES",
    "name": "LA GUAIRA",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 41,
    "distribuidora": "LOS RUICES",
    "name": "LA TRINIDAD",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 42,
    "distribuidora": "LOS RUICES",
    "name": "LAS ACACIAS",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 43,
    "distribuidora": "LOS RUICES",
    "name": "LOS TEQUES",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 44,
    "distribuidora": "LOS RUICES",
    "name": "LOS RUICES",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 45,
    "distribuidora": "LOS RUICES",
    "name": "EXPRESS LOS RUICES",
    "ronda1": 89,
    "ronda2": 91,
    "hasRonda2": true,
    "ef": 91
  },
  {
    "id": 46,
    "distribuidora": "LOS RUICES",
    "name": "MARIPEREZ",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 47,
    "distribuidora": "LOS RUICES",
    "name": "SAN MARTIN",
    "ronda1": 90,
    "ronda2": 92,
    "hasRonda2": true,
    "ef": 92
  }
];

export const OFFICIAL_SERVICENTROS_2025_2026: any[] = [
  {
    "id": 1,
    "distribuidora": "SAN CRISTOBAL",
    "name": "PUERTA DEL SOL",
    "ronda1": 84,
    "ronda2": 86,
    "hasRonda2": true,
    "ef": 86
  },
  {
    "id": 2,
    "distribuidora": "VIGIA",
    "name": "MERIDA",
    "ronda1": 84,
    "ronda2": 87,
    "hasRonda2": true,
    "ef": 87
  },
  {
    "id": 3,
    "distribuidora": "VIGIA",
    "name": "VALERA",
    "ronda1": 84,
    "ronda2": 87,
    "hasRonda2": true,
    "ef": 87
  },
  {
    "id": 4,
    "distribuidora": "MARACAIBO",
    "name": "CABIMAS",
    "ronda1": 79.68,
    "ronda2": null,
    "hasRonda2": false,
    "ef": 79.68
  },
  {
    "id": 5,
    "distribuidora": "MARACAIBO",
    "name": "CIUDAD OJEDA",
    "ronda1": 79.65,
    "ronda2": null,
    "hasRonda2": false,
    "ef": 79.65
  },
  {
    "id": 6,
    "distribuidora": "MARACAIBO",
    "name": "VILLA DEL ROSARIO",
    "ronda1": 84.38,
    "ronda2": null,
    "hasRonda2": false,
    "ef": 84.38
  },
  {
    "id": 7,
    "distribuidora": "MARACAIBO",
    "name": "DR. PORTILLO",
    "ronda1": 77.7,
    "ronda2": null,
    "hasRonda2": false,
    "ef": 77.7
  },
  {
    "id": 8,
    "distribuidora": "MARACAIBO",
    "name": "LA LIMPIA",
    "ronda1": 78.28,
    "ronda2": null,
    "hasRonda2": false,
    "ef": 78.28
  },
  {
    "id": 9,
    "distribuidora": "MARACAIBO",
    "name": "MONTE CLARO",
    "ronda1": 81.15,
    "ronda2": null,
    "hasRonda2": false,
    "ef": 81.15
  },
  {
    "id": 10,
    "distribuidora": "PUNTO FIJO",
    "name": "CORO",
    "ronda1": 95,
    "ronda2": null,
    "hasRonda2": false,
    "ef": 95
  },
  {
    "id": 11,
    "distribuidora": "BARQUISIMETO",
    "name": "DEL ESTE",
    "nuevo": true,
    "ronda1": 88,
    "ronda2": 92.5,
    "hasRonda2": true,
    "ef": 92.5
  },
  {
    "id": 12,
    "distribuidora": "BARQUISIMETO",
    "name": "ACARIGUA",
    "nuevo": true,
    "ronda1": 88,
    "ronda2": 92.5,
    "hasRonda2": true,
    "ef": 92.5
  },
  {
    "id": 13,
    "distribuidora": "BARQUISIMETO",
    "name": "GUANARE",
    "ronda1": 84,
    "ronda2": 87,
    "hasRonda2": true,
    "ef": 87
  },
  {
    "id": 14,
    "distribuidora": "BARQUISIMETO",
    "name": "BARINAS",
    "ronda1": 84,
    "ronda2": 87,
    "hasRonda2": true,
    "ef": 87
  },
  {
    "id": 15,
    "distribuidora": "VALENCIA",
    "name": "SERV.GUACARA",
    "ronda1": 87,
    "ronda2": 88,
    "hasRonda2": true,
    "ef": 88
  },
  {
    "id": 16,
    "distribuidora": "VALENCIA",
    "name": "LA QUIZANDA",
    "ronda1": 84,
    "ronda2": 89,
    "hasRonda2": true,
    "ef": 89
  },
  {
    "id": 17,
    "distribuidora": "VALENCIA",
    "name": "SANTA CECILIA",
    "ronda1": 89,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 18,
    "distribuidora": "VALENCIA",
    "name": "PUERTO CABELLO",
    "ronda1": 84,
    "ronda2": 85,
    "hasRonda2": true,
    "ef": 85
  },
  {
    "id": 19,
    "distribuidora": "MARACAY",
    "name": "SAN FERNANDO DE APURE",
    "ronda1": 82.74,
    "ronda2": 85.74,
    "hasRonda2": true,
    "ef": 85.74
  },
  {
    "id": 20,
    "distribuidora": "MARACAY",
    "name": "VALLE DE LA PASCUA",
    "ronda1": 90.92,
    "ronda2": 91.2,
    "hasRonda2": true,
    "ef": 91.2
  },
  {
    "id": 21,
    "distribuidora": "MARACAY",
    "name": "SAN JACINTO",
    "ronda1": 58.87,
    "ronda2": 80.71,
    "hasRonda2": true,
    "ef": 80.71
  },
  {
    "id": 22,
    "distribuidora": "MARACAY",
    "name": "TAPATAPA",
    "ronda1": 55.77,
    "ronda2": 73.53,
    "hasRonda2": true,
    "ef": 73.53
  },
  {
    "id": 23,
    "distribuidora": "PORLAMAR",
    "name": "LOS ROBLES",
    "ronda1": 76,
    "ronda2": 80,
    "hasRonda2": true,
    "ef": 80
  },
  {
    "id": 24,
    "distribuidora": "BARCELONA",
    "name": "ANACO",
    "ronda1": 75,
    "ronda2": 78,
    "hasRonda2": true,
    "ef": 78
  },
  {
    "id": 25,
    "distribuidora": "BARCELONA",
    "name": "EL TIGRITO",
    "ronda1": 80,
    "ronda2": 83,
    "hasRonda2": true,
    "ef": 83
  },
  {
    "id": 26,
    "distribuidora": "BARCELONA",
    "name": "PUERTO LA CRUZ",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 27,
    "distribuidora": "BARCELONA",
    "name": "CUMANA",
    "ronda1": 80,
    "ronda2": 85,
    "hasRonda2": true,
    "ef": 85
  },
  {
    "id": 28,
    "distribuidora": "PUERTO ORDAZ",
    "name": "UNARE",
    "ronda1": 70,
    "ronda2": 73,
    "hasRonda2": true,
    "ef": 73
  },
  {
    "id": 29,
    "distribuidora": "PUERTO ORDAZ",
    "name": "SAN FELIX",
    "ronda1": 70,
    "ronda2": 73,
    "hasRonda2": true,
    "ef": 73
  },
  {
    "id": 30,
    "distribuidora": "PUERTO ORDAZ",
    "name": "UPATA",
    "ronda1": 70,
    "ronda2": 73,
    "hasRonda2": true,
    "ef": 73
  },
  {
    "id": 31,
    "distribuidora": "PUERTO ORDAZ",
    "name": "CIUDAD BOLIVAR",
    "ronda1": 70,
    "ronda2": 73,
    "hasRonda2": true,
    "ef": 73
  },
  {
    "id": 32,
    "distribuidora": "PUERTO ORDAZ",
    "name": "MATURIN",
    "ronda1": 70,
    "ronda2": 73,
    "hasRonda2": true,
    "ef": 73
  },
  {
    "id": 33,
    "distribuidora": "LOS RUICES",
    "name": "CHAGUARAMOS",
    "ronda1": 84,
    "ronda2": 89,
    "hasRonda2": true,
    "ef": 89
  },
  {
    "id": 34,
    "distribuidora": "LOS RUICES",
    "name": "ALTAMIRA",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 35,
    "distribuidora": "LOS RUICES",
    "name": "CATIA",
    "ronda1": 88,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 36,
    "distribuidora": "LOS RUICES",
    "name": "CEMENTERIO",
    "ronda1": 86,
    "ronda2": 89,
    "hasRonda2": true,
    "ef": 89
  },
  {
    "id": 37,
    "distribuidora": "LOS RUICES",
    "name": "CERRO VERDE",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 38,
    "distribuidora": "LOS RUICES",
    "name": "CHARALLAVE",
    "ronda1": 88,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 39,
    "distribuidora": "LOS RUICES",
    "name": "GUARENAS",
    "ronda1": 86,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 40,
    "distribuidora": "LOS RUICES",
    "name": "GUATIRE",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 41,
    "distribuidora": "LOS RUICES",
    "name": "HORIZONTE",
    "nuevo": true,
    "ronda1": 88,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 42,
    "distribuidora": "LOS RUICES",
    "name": "LA CALIFORNIA",
    "ronda1": 88,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 43,
    "distribuidora": "LOS RUICES",
    "name": "LA GUAIRA",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 44,
    "distribuidora": "LOS RUICES",
    "name": "LA TRINIDAD",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 45,
    "distribuidora": "LOS RUICES",
    "name": "LAS ACACIAS",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 46,
    "distribuidora": "LOS RUICES",
    "name": "LOS TEQUES",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 47,
    "distribuidora": "LOS RUICES",
    "name": "LOS RUICES",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 48,
    "distribuidora": "LOS RUICES",
    "name": "EXPRESS LOS RUICES",
    "ronda1": 89,
    "ronda2": 91,
    "hasRonda2": true,
    "ef": 91
  },
  {
    "id": 49,
    "distribuidora": "LOS RUICES",
    "name": "MARIPEREZ",
    "ronda1": 87,
    "ronda2": 90,
    "hasRonda2": true,
    "ef": 90
  },
  {
    "id": 50,
    "distribuidora": "LOS RUICES",
    "name": "SAN MARTIN",
    "ronda1": 90,
    "ronda2": 92,
    "hasRonda2": true,
    "ef": 92
  }
];

export const VALID_LOCALIDADES = [
  'BARCELONA', 'BARQUISIMETO', 'CARACAS', 'EL VIGIA', 'MARACAIBO', 'MARACAY',
  'PORLAMAR', 'PUERTO ORDAZ', 'PUNTO FIJO', 'SAN CRISTOBAL', 'VALENCIA'
];

export const DEPARTAMENTOS_RESPONSABLES = [
  { id: 'MANT', nombre: 'Mantenimiento e Infraestructura', color: '#f59e0b' },
  { id: 'SSA', nombre: 'Seguridad y Salud Laboral (SSA)', color: '#10b981' },
  { id: 'OPS', nombre: 'Operaciones y Logística', color: '#3b82f6' },
  { id: 'RRHH', nombre: 'Gestión Humana y Capacitación', color: '#8b5cf6' },
  { id: 'SERV', nombre: 'Servicios Generales y Suministros', color: '#ec4899' }
];
