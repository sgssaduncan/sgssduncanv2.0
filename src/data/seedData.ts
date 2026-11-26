// ============================================================
// SGD DUNCAN 2.0 — DATOS MAESTROS (SEED DATA BLINDADOS)
// 5 Empresas Grupo Duncan | 11 Localidades | 63 Establecimientos | 16 Tipos de Inspección
// ============================================================

import type { Empresa, Localidad, Establecimiento, TipoInspeccion, Empleado, Usuario } from '../types';

export async function loadInitialEmpleados(): Promise<Empleado[]> {
  const { PAYROLL_ACTIVE_WORKERS } = await import('./seedEmpleados');
  return PAYROLL_ACTIVE_WORKERS;
}

export const INITIAL_EMPRESAS: Empresa[] = [
  { _id: 'emp_adca', codigo: 'ADCA', nombre: 'Acumuladores Duncan, C.A.', rif: 'J-00000350-5', direccion: 'Av. Milán, Edificio Nageben Piso 1, Los Ruices Sur, Caracas 1071' },
  { _id: 'emp_ddca', codigo: 'DDCA', nombre: 'Distribuidora Duncan, C.A.', rif: 'J-00100047-0', direccion: 'Av. Milán, Edificio Nageben, Los Ruices Sur, Caracas' },
  { _id: 'emp_fdc', codigo: 'FDC', nombre: 'Fundición del Centro, C.A.', rif: 'J-07504381-8', direccion: 'Zona Industrial Las Vegas, Cagua, Edo. Aragua' },
  { _id: 'emp_inv', codigo: 'INV1286', nombre: 'Inversiones 1286, C.A.', rif: 'J-00239353-0', direccion: 'Caracas, Distrito Capital' },
  { _id: 'emp_tay', codigo: 'TAY', nombre: 'Transporte Ayacucho, C.A.', rif: 'J-00084321-0', direccion: 'Cagua / Caracas, Venezuela' },
];

export const INITIAL_LOCALIDADES: Localidad[] = [
  { _id: 'loc_caracas', empresaId: 'emp_ddca', nombre: 'Caracas', region: 'Gran Caracas', estado: 'Distrito Capital' },
  { _id: 'loc_valencia', empresaId: 'emp_ddca', nombre: 'Valencia', region: 'Central', estado: 'Carabobo' },
  { _id: 'loc_maracaibo', empresaId: 'emp_ddca', nombre: 'Maracaibo', region: 'Occidente', estado: 'Zulia' },
  { _id: 'loc_barquisimeto', empresaId: 'emp_ddca', nombre: 'Barquisimeto', region: 'Centro-Occidente', estado: 'Lara' },
  { _id: 'loc_barcelona', empresaId: 'emp_ddca', nombre: 'Barcelona', region: 'Oriente', estado: 'Anzoátegui' },
  { _id: 'loc_pto_ordaz', empresaId: 'emp_ddca', nombre: 'Puerto Ordaz', region: 'Guayana', estado: 'Bolívar' },
  { _id: 'loc_punto_fijo', empresaId: 'emp_ddca', nombre: 'Punto Fijo', region: 'Falcón', estado: 'Falcón' },
  { _id: 'loc_san_cristobal', empresaId: 'emp_ddca', nombre: 'San Cristóbal', region: 'Los Andes', estado: 'Táchira' },
  { _id: 'loc_porlamar', empresaId: 'emp_ddca', nombre: 'Porlamar', region: 'Insular', estado: 'Nueva Esparta' },
  { _id: 'loc_maracay', empresaId: 'emp_ddca', nombre: 'Maracay', region: 'Central', estado: 'Aragua' },
  { _id: 'loc_el_vigia', empresaId: 'emp_ddca', nombre: 'El Vigía', region: 'Los Andes', estado: 'Mérida' },
];

export const INITIAL_ESTABLECIMIENTOS: Establecimiento[] = [
  {
    "_id": "est_dist_barca",
    "codigo": "DDBARCA",
    "nombre": "Distribuidora Duncan Barcelona",
    "localidadId": "loc_barcelona",
    "localidadNombre": "Barcelona",
    "tipo": "Distribuidora",
    "empresaId": "emp_ddca",
    "empresaNombre": "Distribuidora Duncan, C.A."
  },
  {
    "_id": "est_dist_bqto",
    "codigo": "DDBQTO",
    "nombre": "Distribuidora Duncan Barquisimeto",
    "localidadId": "loc_barquisimeto",
    "localidadNombre": "Barquisimeto",
    "tipo": "Distribuidora",
    "empresaId": "emp_ddca",
    "empresaNombre": "Distribuidora Duncan, C.A."
  },
  {
    "_id": "est_dist_ccs",
    "codigo": "DDCCS",
    "nombre": "Distribuidora Duncan Caracas",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Distribuidora",
    "empresaId": "emp_ddca",
    "empresaNombre": "Distribuidora Duncan, C.A."
  },
  {
    "_id": "est_dist_mbo",
    "codigo": "DDMBO",
    "nombre": "Distribuidora Duncan Maracaibo",
    "localidadId": "loc_maracaibo",
    "localidadNombre": "Maracaibo",
    "tipo": "Distribuidora",
    "empresaId": "emp_ddca",
    "empresaNombre": "Distribuidora Duncan, C.A."
  },
  {
    "_id": "est_dist_mcy",
    "codigo": "DDMCY",
    "nombre": "Distribuidora Duncan Maracay",
    "localidadId": "loc_maracay",
    "localidadNombre": "Maracay",
    "tipo": "Distribuidora",
    "empresaId": "emp_ddca",
    "empresaNombre": "Distribuidora Duncan, C.A."
  },
  {
    "_id": "est_dist_pmar",
    "codigo": "DDPMAR",
    "nombre": "Distribuidora Duncan Porlamar",
    "localidadId": "loc_porlamar",
    "localidadNombre": "Porlamar",
    "tipo": "Distribuidora",
    "empresaId": "emp_ddca",
    "empresaNombre": "Distribuidora Duncan, C.A."
  },
  {
    "_id": "est_dist_pord",
    "codigo": "DDPORD",
    "nombre": "Distribuidora Duncan Puerto Ordaz",
    "localidadId": "loc_pto_ordaz",
    "localidadNombre": "Puerto Ordaz",
    "tipo": "Distribuidora",
    "empresaId": "emp_ddca",
    "empresaNombre": "Distribuidora Duncan, C.A."
  },
  {
    "_id": "est_dist_pfijo",
    "codigo": "DDPFIJO",
    "nombre": "Distribuidora Duncan Punto Fijo",
    "localidadId": "loc_punto_fijo",
    "localidadNombre": "Punto Fijo",
    "tipo": "Distribuidora",
    "empresaId": "emp_ddca",
    "empresaNombre": "Distribuidora Duncan, C.A."
  },
  {
    "_id": "est_dist_sancris",
    "codigo": "DDSANCRIS",
    "nombre": "Distribuidora Duncan San Cristóbal",
    "localidadId": "loc_san_cristobal",
    "localidadNombre": "San Cristóbal",
    "tipo": "Distribuidora",
    "empresaId": "emp_ddca",
    "empresaNombre": "Distribuidora Duncan, C.A."
  },
  {
    "_id": "est_dist_val",
    "codigo": "DDVAL",
    "nombre": "Distribuidora Duncan Valencia",
    "localidadId": "loc_valencia",
    "localidadNombre": "Valencia",
    "tipo": "Distribuidora",
    "empresaId": "emp_ddca",
    "empresaNombre": "Distribuidora Duncan, C.A."
  },
  {
    "_id": "est_dist_vigia",
    "codigo": "DDVIGIA",
    "nombre": "Distribuidora Duncan El Vigía",
    "localidadId": "loc_el_vigia",
    "localidadNombre": "El Vigía",
    "tipo": "Distribuidora",
    "empresaId": "emp_ddca",
    "empresaNombre": "Distribuidora Duncan, C.A."
  },
  {
    "_id": "est_sc_sccabimas",
    "codigo": "SCCABIMAS",
    "nombre": "Servicentro Cabimas",
    "localidadId": "loc_maracaibo",
    "localidadNombre": "Maracaibo",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sccojd",
    "codigo": "SCCOJD",
    "nombre": "Servicentro Ciudad Ojedad",
    "localidadId": "loc_maracaibo",
    "localidadNombre": "Maracaibo",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scdrprt",
    "codigo": "SCDRPRT",
    "nombre": "Servicentro Dr. Portillo",
    "localidadId": "loc_maracaibo",
    "localidadNombre": "Maracaibo",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scll",
    "codigo": "SCLL",
    "nombre": "Servicentro La Limpia",
    "localidadId": "loc_maracaibo",
    "localidadNombre": "Maracaibo",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scvdr",
    "codigo": "SCVDR",
    "nombre": "Servicentro Villa Del Rosario",
    "localidadId": "loc_maracaibo",
    "localidadNombre": "Maracaibo",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scvdr",
    "codigo": "SCVDR",
    "nombre": "Servicentro Valera",
    "localidadId": "loc_maracaibo",
    "localidadNombre": "Maracaibo",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scmntc",
    "codigo": "SCMNTC",
    "nombre": "Servicentro Monte Claro",
    "localidadId": "loc_maracaibo",
    "localidadNombre": "Maracaibo",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sccr",
    "codigo": "SCCR",
    "nombre": "Servicentro Coro",
    "localidadId": "loc_punto_fijo",
    "localidadNombre": "Punto Fijo",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scpds",
    "codigo": "SCPDS",
    "nombre": "Servicentro Puerta Del Sol",
    "localidadId": "loc_san_cristobal",
    "localidadNombre": "San Cristóbal",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scmrd",
    "codigo": "SCMRD",
    "nombre": "Servicentro Merida",
    "localidadId": "loc_el_vigia",
    "localidadNombre": "El Vigía",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scvlr",
    "codigo": "SCVLR",
    "nombre": "Servicentro Valera",
    "localidadId": "loc_el_vigia",
    "localidadNombre": "El Vigía",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scbqmt",
    "codigo": "SCBQMT",
    "nombre": "Servicentro Barquisimeto",
    "localidadId": "loc_barquisimeto",
    "localidadNombre": "Barquisimeto",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scgnr",
    "codigo": "SCGNR",
    "nombre": "Servicentro Guanare",
    "localidadId": "loc_barquisimeto",
    "localidadNombre": "Barquisimeto",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scbrn",
    "codigo": "SCBRN",
    "nombre": "Servicentro Barinas",
    "localidadId": "loc_barquisimeto",
    "localidadNombre": "Barquisimeto",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sclmchln",
    "codigo": "SCLMCHLN",
    "nombre": "Servicentro La Quizanda",
    "localidadId": "loc_valencia",
    "localidadNombre": "Valencia",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sclqznd",
    "codigo": "SCLQZND",
    "nombre": "Servicentro Santa Cecilia",
    "localidadId": "loc_valencia",
    "localidadNombre": "Valencia",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scstaccl",
    "codigo": "SCSTACCL",
    "nombre": "Servicentro Puerto Cabello",
    "localidadId": "loc_valencia",
    "localidadNombre": "Valencia",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scptocbll",
    "codigo": "SCPTOCBLL",
    "nombre": "Servicentro Guacara",
    "localidadId": "loc_valencia",
    "localidadNombre": "Valencia",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sctptp",
    "codigo": "SCTPTP",
    "nombre": "Servicentro Tapa Tapa",
    "localidadId": "loc_maracay",
    "localidadNombre": "Maracay",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sclolv",
    "codigo": "SCLOLV",
    "nombre": "Servicentro Los Olivos",
    "localidadId": "loc_maracay",
    "localidadNombre": "Maracay",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scvdlp",
    "codigo": "SCVDLP",
    "nombre": "Servicentro Valle De La Pascua",
    "localidadId": "loc_maracay",
    "localidadNombre": "Maracay",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scsfrnd",
    "codigo": "SCSFRND",
    "nombre": "Servicentro San Fernando",
    "localidadId": "loc_maracay",
    "localidadNombre": "Maracay",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scct",
    "codigo": "SCCT",
    "nombre": "Servicentro Catia",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scgrns",
    "codigo": "SCGRNS",
    "nombre": "Servicentro Guarenas",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scgtr",
    "codigo": "SCGTR",
    "nombre": "Servicentro Guatire",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sclclfrn",
    "codigo": "SCLCLFRN",
    "nombre": "Servicentro La California",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sclgr",
    "codigo": "SCLGR",
    "nombre": "Servicentro La Guaira",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scltrnd",
    "codigo": "SCLTRND",
    "nombre": "Servicentro La Trinidad",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sclaccs",
    "codigo": "SCLACCS",
    "nombre": "Servicentro Las Acacias",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sclchgrms",
    "codigo": "SCLCHGRMS",
    "nombre": "Servicentro Los Chaguaramos",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sclrc",
    "codigo": "SCLRC",
    "nombre": "Servicentro Los Ruices",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scltqs",
    "codigo": "SCLTQS",
    "nombre": "Servicentro Los Teques",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scaltmr",
    "codigo": "SCALTMR",
    "nombre": "Servicentro Altamira",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sccmntr",
    "codigo": "SCCMNTR",
    "nombre": "Servicentro Cementerio",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sccrrvrd",
    "codigo": "SCCRRVRD",
    "nombre": "Servicentro Cerro Verde",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sclrxprss",
    "codigo": "SCLRXPRSS",
    "nombre": "Servicentro Los Ruices Express",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scmrprz",
    "codigo": "SCMRPRZ",
    "nombre": "Servicentro Mariperez",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scsnmrtn",
    "codigo": "SCSNMRTN",
    "nombre": "Servicentro San Martin",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scchrllv",
    "codigo": "SCCHRLLV",
    "nombre": "Servicentro Charallave",
    "localidadId": "loc_caracas",
    "localidadNombre": "Caracas",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scanc",
    "codigo": "SCANC",
    "nombre": "Servicentro Anaco",
    "localidadId": "loc_barcelona",
    "localidadNombre": "Barcelona",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scbrcln",
    "codigo": "SCBRCLN",
    "nombre": "Servicentro Barcelona",
    "localidadId": "loc_barcelona",
    "localidadNombre": "Barcelona",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sccmn",
    "codigo": "SCCMN",
    "nombre": "Servicentro Cumana",
    "localidadId": "loc_barcelona",
    "localidadNombre": "Barcelona",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sceltgrt",
    "codigo": "SCELTGRT",
    "nombre": "Servicentro El Tigre",
    "localidadId": "loc_barcelona",
    "localidadNombre": "Barcelona",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scplc",
    "codigo": "SCPLC",
    "nombre": "Servicentro Puerto La Cruz",
    "localidadId": "loc_barcelona",
    "localidadNombre": "Barcelona",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sccblvr",
    "codigo": "SCCBLVR",
    "nombre": "Servicentro Unare",
    "localidadId": "loc_pto_ordaz",
    "localidadNombre": "Puerto Ordaz",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scmtrn",
    "codigo": "SCMTRN",
    "nombre": "Servicentro San Felix",
    "localidadId": "loc_pto_ordaz",
    "localidadNombre": "Puerto Ordaz",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scptordz",
    "codigo": "SCPTORDZ",
    "nombre": "Servicentro Upata",
    "localidadId": "loc_pto_ordaz",
    "localidadNombre": "Puerto Ordaz",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scsnflx",
    "codigo": "SCSNFLX",
    "nombre": "Servicentro Ciudad Bolivar",
    "localidadId": "loc_pto_ordaz",
    "localidadNombre": "Puerto Ordaz",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_scunr",
    "codigo": "SCUNR",
    "nombre": "Servicentro Maturin",
    "localidadId": "loc_pto_ordaz",
    "localidadNombre": "Puerto Ordaz",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  },
  {
    "_id": "est_sc_sclrbls",
    "codigo": "SCLRBLS",
    "nombre": "Servicentro Los Robles",
    "localidadId": "loc_porlamar",
    "localidadNombre": "Porlamar",
    "tipo": "Servicentro",
    "empresaId": "emp_inv",
    "empresaNombre": "Inversiones 1286, C.A."
  }
];

export const INITIAL_TIPOS_INSPECCION: TipoInspeccion[] = [
  { _id: 'ti_ext', codigo: 'EXT', nombre: 'Extintores', descripcion: 'Inspección de extintores portátiles', frecuencia: 'Mensual', categoria: 'Seguridad', icono: '🔥' },
  { _id: 'ti_di', codigo: 'DI', nombre: 'Detección de Incendios', descripcion: 'Sistema de detección y alarma de incendios', frecuencia: 'Mensual', categoria: 'Seguridad', icono: '🚨' },
  { _id: 'ti_flp', codigo: 'FLP', nombre: 'Fuente Lavaojos Portátil', descripcion: 'Inspección de fuente lavaojos portátil', frecuencia: 'Mensual', categoria: 'Salud', icono: '🚿' },
  { _id: 'ti_fd', codigo: 'FYD', nombre: 'Fuente y Ducha de Emergencia', descripcion: 'Inspección de fuente y ducha de emergencia', frecuencia: 'Mensual', categoria: 'Salud', icono: '🚿' },
  { _id: 'ti_ol', codigo: 'OL', nombre: 'Orden y Limpieza', descripcion: 'Inspección de orden y limpieza general', frecuencia: 'Mensual', categoria: 'Ambiente', icono: '🏭' },
  { _id: 'ti_kd', codigo: 'KPD', nombre: 'Kit para Derrames', descripcion: 'Inspección de kit para control de derrames', frecuencia: 'Mensual', categoria: 'Ambiente', icono: '⚠️' },
  { _id: 'ti_mc', codigo: 'MTCG', nombre: 'Montacargas', descripcion: 'Inspección de montacargas', frecuencia: 'Diaria', categoria: 'Seguridad', icono: '🏗️' },
  { _id: 'ti_le', codigo: 'LEM', nombre: 'Lámparas de Emergencia', descripcion: 'Inspección de lámparas de emergencia', frecuencia: 'Mensual', categoria: 'Seguridad', icono: '💡' },
  { _id: 'ti_idv', codigo: 'VHT', nombre: 'Inspección Diaria Vehículo', descripcion: 'Inspección diaria de vehículos de transporte', frecuencia: 'Diaria', categoria: 'Seguridad', icono: '🚛' },
  { _id: 'ti_he', codigo: 'HEQ', nombre: 'Herramientas y Equipos', descripcion: 'Inspección de herramientas y equipos', frecuencia: 'Mensual', categoria: 'Seguridad', icono: '🧰' },
  { _id: 'ti_dd', codigo: 'DD', nombre: 'SSA Distribuidoras', descripcion: 'Inspección SSA para Distribuidoras', frecuencia: 'Mensual', categoria: 'SSA General', icono: '📋' },
  { _id: 'ti_sc', codigo: 'SC', nombre: 'SSA Servicentros', descripcion: 'Inspección SSA para Servicentros', frecuencia: 'Mensual', categoria: 'SSA General', icono: '🏪' },
  { _id: 'ti_etc', codigo: 'VTC', nombre: 'Evaluación Transporte de Carga', descripcion: 'Evaluación de transporte de carga', frecuencia: 'Mensual', categoria: 'Seguridad', icono: '🚗' },
  { _id: 'ti_mc_ssa', codigo: 'MTCG_SSA', nombre: 'Montacargas SSA', descripcion: 'Inspección SSA de montacargas', frecuencia: 'Mensual', categoria: 'Seguridad', icono: '🏗️' },
  { _id: 'ti_pb', codigo: 'PB', nombre: 'Permisos de Bomberos', descripcion: 'Control de permisos de bomberos vigentes', frecuencia: 'Anual', categoria: 'Legal', icono: '📄' },
  { _id: 'ti_gen', codigo: 'GEN', nombre: 'Inspección General', descripcion: 'Inspección general de instalaciones', frecuencia: 'Mensual', categoria: 'SSA General', icono: '📊' },
];

/**
 * Cuentas iniciales sanitizadas sin contraseñas ni datos privados.
 * La autenticación y verificación de credenciales es 100% procesada en el backend.
 */
export const INITIAL_USUARIOS: Usuario[] = [
  {
    _id: 'usr_admin_duncan',
    email: 'admin@duncan.com.ve',
    cedula: 'V-10000001',
    nombre: 'Administrador Duncan Master',
    cargo: 'Gerente General SST Duncan',
    localidad: 'Oficinas Centrales Los Ruices',
    rol: 'Propietario / Super Admin',
    activo: true,
  },
  {
    _id: 'usr_hugo_vera',
    email: 'vera.hugo712@gmail.com',
    cedula: 'V-14785236',
    nombre: 'Hugo Vera',
    cargo: 'Administrador SSA Duncan',
    localidad: 'Valencia / Central',
    rol: 'Admin',
    activo: true,
    password: 'Tarugo369#*$',
  },
  {
    _id: 'usr_sst_duncan',
    email: 'sst@duncan.com.ve',
    cedula: 'V-10000002',
    nombre: 'Coordinador SST / SSA Duncan',
    cargo: 'Especialista Técnico SSA',
    localidad: 'Planta Principal Los Ruices',
    rol: 'Admin',
    activo: true,
  },
  {
    _id: 'usr_inspector_duncan',
    email: 'inspector@duncan.com.ve',
    cedula: 'V-10000003',
    nombre: 'Inspector de Seguridad y Salud',
    cargo: 'Inspector Técnico SSA',
    localidad: 'Planta Principal Los Ruices',
    rol: 'Inspector',
    activo: true,
  }
];

export const INITIAL_INSPECCIONES: any[] = [];
export const INITIAL_PLAN_ACCION: any[] = [];

export const INITIAL_EPP_INVENTARIO: any[] = [
  { id: 'epp_01', _id: 'epp_01', codigo: 'EPP-CAS-01', nombre: 'Casco Dieléctrico Tipo I Clase E con Barbiquejo', categoria: 'Protección Cabeza', stockActual: 45, stockMinimo: 15, unidad: 'Und', stock: [{ talla: 'Ajustable', cantidad: 45 }] },
  { id: 'epp_02', _id: 'epp_02', codigo: 'EPP-LEN-02', nombre: 'Lentes de Seguridad Antiempañantes Antiácido', categoria: 'Protección Ocular', stockActual: 68, stockMinimo: 20, unidad: 'Und', stock: [{ talla: 'Única', cantidad: 68 }] },
  { id: 'epp_03', _id: 'epp_03', codigo: 'EPP-RES-03', nombre: 'Respirador Media Cara con Filtros para Vapores y Nieblas Ácidas', categoria: 'Protección Respiratoria', stockActual: 18, stockMinimo: 10, unidad: 'Und', stock: [{ talla: 'S (Pequeño)', cantidad: 4 }, { talla: 'M (Mediano)', cantidad: 8 }, { talla: 'L (Grande)', cantidad: 6 }] },
  { id: 'epp_04', _id: 'epp_04', codigo: 'EPP-GNT-04', nombre: 'Guantes de Nitrilo Pesado Antiácido Sulfúrico', categoria: 'Protección Manos', stockActual: 82, stockMinimo: 25, unidad: 'Par', stock: [{ talla: '7 (S)', cantidad: 12 }, { talla: '8 (M)', cantidad: 25 }, { talla: '9 (L)', cantidad: 30 }, { talla: '10 (XL)', cantidad: 15 }] },
  { id: 'epp_05', _id: 'epp_05', codigo: 'EPP-GNT-05', nombre: 'Guantes de Vaqueta / Carnaza para Carga y Estibado', categoria: 'Protección Manos', stockActual: 90, stockMinimo: 30, unidad: 'Par', stock: [{ talla: '8 (M)', cantidad: 25 }, { talla: '9 (L)', cantidad: 40 }, { talla: '10 (XL)', cantidad: 25 }] },
  { id: 'epp_06', _id: 'epp_06', codigo: 'EPP-BOT-06', nombre: 'Botas de Seguridad con Puntera Dieléctrica y Suela Resistente a Ácidos', categoria: 'Calzado y Ropa', stockActual: 24, stockMinimo: 12, unidad: 'Par', stock: [
    { talla: '37', cantidad: 2 }, { talla: '38', cantidad: 3 }, { talla: '39', cantidad: 4 },
    { talla: '40', cantidad: 5 }, { talla: '41', cantidad: 4 }, { talla: '42', cantidad: 3 },
    { talla: '43', cantidad: 2 }, { talla: '44', cantidad: 1 }
  ]},
  { id: 'epp_07', _id: 'epp_07', codigo: 'EPP-PET-07', nombre: 'Pechera / Delantal de PVC Antiácido de Alta Resistencia', categoria: 'Calzado y Ropa', stockActual: 32, stockMinimo: 10, unidad: 'Und', stock: [{ talla: 'Única', cantidad: 32 }] },
  { id: 'epp_08', _id: 'epp_08', codigo: 'EPP-AUD-08', nombre: 'Protector Auditivo Tipo Copa NRR 27dB', categoria: 'Protección Auditiva', stockActual: 28, stockMinimo: 10, unidad: 'Und', stock: [{ talla: 'Ajustable', cantidad: 28 }] },
];

export const INITIAL_LOTO_EQUIPOS: any[] = [
  { _id: 'loto_01', tag: 'TGBT-01', nombre: 'Tablero General de Baja Tensión 480V', ubicacion: 'Sala de Carga y Formación', tipoEnergia: 'Eléctrica', dispositivoBloqueo: 'Bloqueador de interruptor de caja moldeada + Candado Rojo', procedimiento: 'Desconectar carga, bajar interruptor principal, verificar energía cero con voltímetro calibrado y colocar pinza múltiple.' },
  { _id: 'loto_02', tag: 'RECT-04', nombre: 'Rectificador de Carga DC Banco #4', ubicacion: 'Área de Formación de Baterías', tipoEnergia: 'Eléctrica', dispositivoBloqueo: 'Candado de seguridad rojo + tarjeta LOTO peligro no operar', procedimiento: 'Apagar banco, desconectar cables de carga, bloquear breaker de alimentación 220V trifásico.' },
  { _id: 'loto_03', tag: 'VALV-ACID-02', nombre: 'Válvula Principal de Dosificación Ácido Sulfúrico', ubicacion: 'Tanques de Almacenamiento de Ácido', tipoEnergia: 'Química / Ácido', dispositivoBloqueo: 'Bloqueador de válvula de bola con cable de acero y candado amarillo', procedimiento: 'Cerrar válvula de paso, purgar línea hacia tanque neutralizador, verificar manómetro en 0 PSI.' },
  { _id: 'loto_04', tag: 'COMP-01', nombre: 'Compresor de Tornillo Atlas Copco 120 PSI', ubicacion: 'Sala de Máquinas', tipoEnergia: 'Neumática', dispositivoBloqueo: 'Bloqueador de línea neumática de conexión rápida + candado', procedimiento: 'Apagar compresor, despresurizar tanque pulmón, cerrar válvula de suministro y bloquear interruptor.' },
];

export const INITIAL_EVALUACIONES_MEDICAS: any[] = [
  { _id: 'med_demo_01', empleadoNombre: 'Trabajador Demostración 01', cedula: 'V-10000001', empresaNombre: 'Acumuladores Duncan, C.A.', establecimientoNombre: 'Planta Los Ruices', tipoEvaluacion: 'Control Periódico', fecha: '2026-02-15', medicoTratante: 'Servicio Médico Ocupacional', plombemiaValor: 12.0, audiometria: 'Normal', aptitud: 'Apto', observaciones: 'Examen de control ocupacional sin observaciones.' },
  { _id: 'med_demo_02', empleadoNombre: 'Trabajador Demostración 02', cedula: 'V-10000002', empresaNombre: 'Acumuladores Duncan, C.A.', establecimientoNombre: 'Planta Los Ruices', tipoEvaluacion: 'Periódica Anual', fecha: '2026-01-20', medicoTratante: 'Servicio Médico Ocupacional', plombemiaValor: 14.5, audiometria: 'Normal', aptitud: 'Apto', observaciones: 'Condición apta con seguimiento de normas de higiene ocupacional.' },
];
