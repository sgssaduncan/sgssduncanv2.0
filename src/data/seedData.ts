// ============================================================
// SGD DUNCAN 2.0 — DATOS MAESTROS (SEED DATA)
// 3 Empresas | 11 Localidades | 63 Establecimientos | 16 Tipos de Inspección
// ============================================================

import type { Empresa, Localidad, Establecimiento, TipoInspeccion, Empleado, Usuario } from '../types';

export const INITIAL_EMPRESAS: Empresa[] = [
  { _id: 'emp_adca', codigo: 'ADCA', nombre: 'Acumuladores Duncan, C.A.', rif: 'J-00000350-5', direccion: 'Av. Milán, Edificio Nageben Piso 1, Los Ruices Sur, Caracas 1071' },
  { _id: 'emp_ddca', codigo: 'DDCA', nombre: 'Distribuidora Duncan, C.A.', rif: 'J-00100047-0', direccion: 'Av. Milán, Edificio Nageben, Los Ruices Sur, Caracas' },
  { _id: 'emp_inv', codigo: 'INV1286', nombre: 'Inversiones 1286, C.A.', rif: 'J-00239353-0', direccion: 'Caracas, Distrito Capital' },
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
  // DISTRIBUIDORAS
  { _id: 'est_dist_barca', nombre: 'Distribuidora Duncan Barcelona', localidadId: 'loc_barcelona', localidadNombre: 'Barcelona', tipo: 'Distribuidora', empresaId: 'emp_ddca', empresaNombre: 'Distribuidora Duncan, C.A.' },
  { _id: 'est_dist_bqto', nombre: 'Distribuidora Duncan Barquisimeto', localidadId: 'loc_barquisimeto', localidadNombre: 'Barquisimeto', tipo: 'Distribuidora', empresaId: 'emp_ddca', empresaNombre: 'Distribuidora Duncan, C.A.' },
  { _id: 'est_dist_ccs', nombre: 'Distribuidora Duncan Caracas', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Distribuidora', empresaId: 'emp_ddca', empresaNombre: 'Distribuidora Duncan, C.A.' },
  { _id: 'est_dist_mbo', nombre: 'Distribuidora Duncan Maracaibo', localidadId: 'loc_maracaibo', localidadNombre: 'Maracaibo', tipo: 'Distribuidora', empresaId: 'emp_ddca', empresaNombre: 'Distribuidora Duncan, C.A.' },
  { _id: 'est_dist_mcy', nombre: 'Distribuidora Duncan Maracay', localidadId: 'loc_maracay', localidadNombre: 'Maracay', tipo: 'Distribuidora', empresaId: 'emp_ddca', empresaNombre: 'Distribuidora Duncan, C.A.' },
  { _id: 'est_dist_pmar', nombre: 'Distribuidora Duncan Porlamar', localidadId: 'loc_porlamar', localidadNombre: 'Porlamar', tipo: 'Distribuidora', empresaId: 'emp_ddca', empresaNombre: 'Distribuidora Duncan, C.A.' },
  { _id: 'est_dist_pord', nombre: 'Distribuidora Duncan Puerto Ordaz', localidadId: 'loc_pto_ordaz', localidadNombre: 'Puerto Ordaz', tipo: 'Distribuidora', empresaId: 'emp_ddca', empresaNombre: 'Distribuidora Duncan, C.A.' },
  { _id: 'est_dist_pfijo', nombre: 'Distribuidora Duncan Punto Fijo', localidadId: 'loc_punto_fijo', localidadNombre: 'Punto Fijo', tipo: 'Distribuidora', empresaId: 'emp_ddca', empresaNombre: 'Distribuidora Duncan, C.A.' },
  { _id: 'est_dist_sancris', nombre: 'Distribuidora Duncan San Cristóbal', localidadId: 'loc_san_cristobal', localidadNombre: 'San Cristóbal', tipo: 'Distribuidora', empresaId: 'emp_ddca', empresaNombre: 'Distribuidora Duncan, C.A.' },
  { _id: 'est_dist_val', nombre: 'Distribuidora Duncan Valencia', localidadId: 'loc_valencia', localidadNombre: 'Valencia', tipo: 'Distribuidora', empresaId: 'emp_ddca', empresaNombre: 'Distribuidora Duncan, C.A.' },
  { _id: 'est_dist_vigia', nombre: 'Distribuidora Duncan El Vigía', localidadId: 'loc_el_vigia', localidadNombre: 'El Vigía', tipo: 'Distribuidora', empresaId: 'emp_ddca', empresaNombre: 'Distribuidora Duncan, C.A.' },
  // SERVICENTROS CARACAS
  { _id: 'est_sc_altamira', nombre: 'Servicentro Altamira', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_boleita', nombre: 'Servicentro Boleíta', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_caricuao', nombre: 'Servicentro Caricuao', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_catia', nombre: 'Servicentro Catia', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_ccs_centro', nombre: 'Servicentro Caracas Centro', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_ccs_sur', nombre: 'Servicentro Caracas Sur', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_chacao', nombre: 'Servicentro Chacao', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_coche', nombre: 'Servicentro Coche', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_el_llanito', nombre: 'Servicentro El Llanito', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_el_marques', nombre: 'Servicentro El Marqués', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_la_california', nombre: 'Servicentro La California', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_la_candelaria', nombre: 'Servicentro La Candelaria', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_la_florida', nombre: 'Servicentro La Florida', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_la_trinidad', nombre: 'Servicentro La Trinidad', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_las_mercedes', nombre: 'Servicentro Las Mercedes', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_los_ruices', nombre: 'Servicentro Los Ruices', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_macaracuay', nombre: 'Servicentro Macaracuay', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_mariperez', nombre: 'Servicentro Mariperez', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_prados_este', nombre: 'Servicentro Prados del Este', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_san_martin', nombre: 'Servicentro San Martín', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_sarria', nombre: 'Servicentro Sarría', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_sebucán', nombre: 'Servicentro Sebucán', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_valle', nombre: 'Servicentro El Valle', localidadId: 'loc_caracas', localidadNombre: 'Caracas', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  // SERVICENTROS INTERIOR
  { _id: 'est_sc_val_01', nombre: 'Servicentro Valencia Norte', localidadId: 'loc_valencia', localidadNombre: 'Valencia', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_val_02', nombre: 'Servicentro Valencia Sur', localidadId: 'loc_valencia', localidadNombre: 'Valencia', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_val_03', nombre: 'Servicentro Valencia Centro', localidadId: 'loc_valencia', localidadNombre: 'Valencia', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_mbo_01', nombre: 'Servicentro Maracaibo Norte', localidadId: 'loc_maracaibo', localidadNombre: 'Maracaibo', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_mbo_02', nombre: 'Servicentro Maracaibo Sur', localidadId: 'loc_maracaibo', localidadNombre: 'Maracaibo', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_bqto_01', nombre: 'Servicentro Barquisimeto Este', localidadId: 'loc_barquisimeto', localidadNombre: 'Barquisimeto', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_bqto_02', nombre: 'Servicentro Barquisimeto Oeste', localidadId: 'loc_barquisimeto', localidadNombre: 'Barquisimeto', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_barca_01', nombre: 'Servicentro Barcelona Principal', localidadId: 'loc_barcelona', localidadNombre: 'Barcelona', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_pord_01', nombre: 'Servicentro Puerto Ordaz', localidadId: 'loc_pto_ordaz', localidadNombre: 'Puerto Ordaz', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_pfijo_01', nombre: 'Servicentro Punto Fijo', localidadId: 'loc_punto_fijo', localidadNombre: 'Punto Fijo', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_sancris_01', nombre: 'Servicentro San Cristóbal', localidadId: 'loc_san_cristobal', localidadNombre: 'San Cristóbal', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_pmar_01', nombre: 'Servicentro Porlamar', localidadId: 'loc_porlamar', localidadNombre: 'Porlamar', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_mcy_01', nombre: 'Servicentro Maracay Norte', localidadId: 'loc_maracay', localidadNombre: 'Maracay', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_mcy_02', nombre: 'Servicentro Maracay Sur', localidadId: 'loc_maracay', localidadNombre: 'Maracay', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
  { _id: 'est_sc_vigia_01', nombre: 'Servicentro El Vigía', localidadId: 'loc_el_vigia', localidadNombre: 'El Vigía', tipo: 'Servicentro', empresaId: 'emp_inv', empresaNombre: 'Inversiones 1286, C.A.' },
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

export const INITIAL_USUARIOS: Usuario[] = [
  {
    _id: 'usr_francisco',
    email: 'francisco.rojasp@gmail.com',
    nombre: 'Francisco Rojas',
    rol: 'Propietario / Super Admin',
    password: 'Leo150873#*$',
    activo: true,
  },
  {
    _id: 'usr_sgssa',
    email: 'sgssaduncan@gmail.com',
    nombre: 'SST / SSA Duncan',
    rol: 'Propietario / Super Admin',
    password: 'Leo150873#*$',
    activo: true,
  },
];

export const INITIAL_INSPECCIONES: any[] = [];
export const INITIAL_PLAN_ACCION: any[] = [];
export const INITIAL_EMPLEADOS: Empleado[] = [
  { _id: 'emp_01', cedula: 'V-15894123', nombre: 'Carlos Eduardo Mendoza', cargo: 'Operador de Formación y Carga', departamento: 'Producción', empresaNombre: 'Acumuladores Duncan, C.A.', activo: true },
  { _id: 'emp_02', cedula: 'V-18765432', nombre: 'José Manuel Rivas', cargo: 'Técnico de Mantenimiento Eléctrico', departamento: 'Mantenimiento', empresaNombre: 'Acumuladores Duncan, C.A.', activo: true },
  { _id: 'emp_03', cedula: 'V-20112345', nombre: 'María Alejandra Delgado', cargo: 'Supervisora de Distribución', departamento: 'Logística', empresaNombre: 'Distribuidora Duncan, C.A.', activo: true },
  { _id: 'emp_04', cedula: 'V-14567890', nombre: 'Roberto Antonio Gómez', cargo: 'Mecánico / Operador de Montacargas', departamento: 'Almacén', empresaNombre: 'Distribuidora Duncan, C.A.', activo: true },
  { _id: 'emp_05', cedula: 'V-19345678', nombre: 'Luis Fernando Castillo', cargo: 'Técnico de Servicentro', departamento: 'Servicio al Cliente', empresaNombre: 'Inversiones 1286, C.A.', activo: true },
];

export const INITIAL_EPP_INVENTARIO: any[] = [
  { _id: 'epp_01', codigo: 'EPP-CAS-01', nombre: 'Casco Dieléctrico Tipo I Clase E con Barbiquejo', categoria: 'Protección Cabeza', stockActual: 45, stockMinimo: 15, unidad: 'Und' },
  { _id: 'epp_02', codigo: 'EPP-LEN-02', nombre: 'Lentes de Seguridad Antiempañantes Antiácido', categoria: 'Protección Ocular', stockActual: 68, stockMinimo: 20, unidad: 'Und' },
  { _id: 'epp_03', codigo: 'EPP-RES-03', nombre: 'Respirador Media Cara con Filtros para Vapores y Nieblas Ácidas', categoria: 'Protección Respiratoria', stockActual: 18, stockMinimo: 10, unidad: 'Und' },
  { _id: 'epp_04', codigo: 'EPP-GNT-04', nombre: 'Guantes de Nitrilo Pesado Antiácido Sulfúrico', categoria: 'Protección Manos', stockActual: 82, stockMinimo: 25, unidad: 'Par' },
  { _id: 'epp_05', codigo: 'EPP-GNT-05', nombre: 'Guantes de Vaqueta / Carnaza para Carga y Estibado', categoria: 'Protección Manos', stockActual: 90, stockMinimo: 30, unidad: 'Par' },
  { _id: 'epp_06', codigo: 'EPP-BOT-06', nombre: 'Botas de Seguridad con Puntera Dieléctrica y Suela Resistente a Ácidos', categoria: 'Calzado y Ropa', stockActual: 24, stockMinimo: 12, unidad: 'Par' },
  { _id: 'epp_07', codigo: 'EPP-PET-07', nombre: 'Pechera / Delantal de PVC Antiácido de Alta Resistencia', categoria: 'Calzado y Ropa', stockActual: 32, stockMinimo: 10, unidad: 'Und' },
  { _id: 'epp_08', codigo: 'EPP-AUD-08', nombre: 'Protector Auditivo Tipo Copa NRR 27dB', categoria: 'Protección Auditiva', stockActual: 28, stockMinimo: 10, unidad: 'Und' },
];

export const INITIAL_LOTO_EQUIPOS: any[] = [
  { _id: 'loto_01', tag: 'TGBT-01', nombre: 'Tablero General de Baja Tensión 480V', ubicacion: 'Sala de Carga y Formación', tipoEnergia: 'Eléctrica', dispositivoBloqueo: 'Bloqueador de interruptor de caja moldeada + Candado Rojo', procedimiento: 'Desconectar carga, bajar interruptor principal, verificar energía cero con voltímetro calibrado y colocar pinza múltiple.' },
  { _id: 'loto_02', tag: 'RECT-04', nombre: 'Rectificador de Carga DC Banco #4', ubicacion: 'Área de Formación de Baterías', tipoEnergia: 'Eléctrica', dispositivoBloqueo: 'Candado de seguridad rojo + tarjeta LOTO peligro no operar', procedimiento: 'Apagar banco, desconectar cables de carga, bloquear breaker de alimentación 220V trifásico.' },
  { _id: 'loto_03', tag: 'VALV-ACID-02', nombre: 'Válvula Principal de Dosificación Ácido Sulfúrico', ubicacion: 'Tanques de Almacenamiento de Ácido', tipoEnergia: 'Química / Ácido', dispositivoBloqueo: 'Bloqueador de válvula de bola con cable de acero y candado amarillo', procedimiento: 'Cerrar válvula de paso, purgar línea hacia tanque neutralizador, verificar manómetro en 0 PSI.' },
  { _id: 'loto_04', tag: 'COMP-01', nombre: 'Compresor de Tornillo Atlas Copco 120 PSI', ubicacion: 'Sala de Máquinas', tipoEnergia: 'Neumática', dispositivoBloqueo: 'Bloqueador de línea neumática de conexión rápida + candado', procedimiento: 'Apagar compresor, despresurizar tanque pulmón, cerrar válvula de suministro y bloquear interruptor.' },
];

export const INITIAL_EVALUACIONES_MEDICAS: any[] = [
  { _id: 'med_01', empleadoNombre: 'Carlos Eduardo Mendoza', cedula: 'V-15894123', empresaNombre: 'Acumuladores Duncan, C.A.', establecimientoNombre: 'Planta Los Ruices', tipoEvaluacion: 'Especial Plombemia', fecha: '2026-02-15', medicoTratante: 'Dra. Elena Silva (Médico Ocupacional)', plombemiaValor: 18.5, audiometria: 'Normal', aptitud: 'Apto', observaciones: 'Nivel de plomo en sangre dentro de los límites biológicos permisibles (< 30 µg/dL).' },
  { _id: 'med_02', empleadoNombre: 'José Manuel Rivas', cedula: 'V-18765432', empresaNombre: 'Acumuladores Duncan, C.A.', establecimientoNombre: 'Planta Los Ruices', tipoEvaluacion: 'Periódica Anual', fecha: '2026-01-20', medicoTratante: 'Dr. Marcos Valera', plombemiaValor: 24.2, audiometria: 'Normal', aptitud: 'Apto', observaciones: 'Examen físico y de laboratorio sin alteraciones relevantes. Se recomienda continuar uso estricto de respirador.' },
  { _id: 'med_03', empleadoNombre: 'Roberto Antonio Gómez', cedula: 'V-14567890', empresaNombre: 'Distribuidora Duncan, C.A.', establecimientoNombre: 'Distribuidora Valencia', tipoEvaluacion: 'Periódica Anual', fecha: '2026-02-05', medicoTratante: 'Dra. Elena Silva', plombemiaValor: 12.0, audiometria: 'Hipoacusia Leve', aptitud: 'Apto con Restricciones', observaciones: 'Uso obligatorio y permanente de protector auditivo en zona de carga y montacargas.' },
];
