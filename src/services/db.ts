// ============================================================
// SGD DUNCAN 2.0 — SERVICIO DE BASE DE DATOS UNIFICADO (dbService)
// Costo Cero ($0): Almacenamiento Local (Optimistic Offline-First) +
// Sincronización Asíncrona con Google Apps Script & Google Sheets
// ============================================================

import { gsApi, getSheetsUrl, postGAS } from '../lib/googleSheetsClient';
import { 
  INITIAL_EMPRESAS, 
  INITIAL_LOCALIDADES, 
  INITIAL_ESTABLECIMIENTOS, 
  INITIAL_TIPOS_INSPECCION,
  INITIAL_EMPLEADOS,
  INITIAL_USUARIOS 
} from '../data/seedData';
import { TIPOS_INSPECCION_SEED } from '../constants/inspections';
import type { 
  Empresa, 
  Localidad, 
  Establecimiento, 
  TipoInspeccion, 
  Inspeccion, 
  PlanAccion, 
  Empleado,
  UserProfile,
  AuditLog,
  ReportePDF,
  Role,
  InventarioItem,
  SolicitudEPP,
  EntregaEPP,
  SolicitudEPPItem,
  LotoEquipo,
  LotoBloqueo,
  LotoCapacitacion,
  LotoAuditoria,
  EvaluacionMedica,
  PermisoTrabajo,
  ChecklistTransporte,
  VehiculoFlota,
  AccidenteF465,
  ComiteCSSL,
  MinutaReunionCSSL,
  CapacitacionRegistro,
  CalculoCargaFuegoArea,
  InspeccionCentralIncendio,
  ExtintorEquipo,
  PermisoBomberos,
  ConsultaMedicaDiaria,
  ControlPresionArterial,
  CertificadoAptitudPsicofisica,
  EvaluacionGoniometria,
  MorbilidadReporteItem
} from '../types';

// Storage keys
const SK = {
  USERS: 'sgd_usuarios',
  EMPRESAS: 'sgd_empresas',
  LOCALIDADES: 'sgd_localidades',
  ESTABLECIMIENTOS: 'sgd_establecimientos',
  TIPOS_INSP: 'sgd_tipos_inspeccion',
  EMPLEADOS: 'sgd_empleados',
  INSPECCIONES: 'sgd_inspecciones',
  PLAN_ACCION: 'sgd_plan_accion',
  INVENTARIO_EPP: 'sgd_inventario_epp',
  SOLICITUDES_EPP: 'sgd_solicitudes_epp',
  ENTREGAS_EPP: 'sgd_entregas_epp',
  LOTO_EQUIPOS: 'sgd_loto_equipos',
  LOTO_BLOQUEOS: 'sgd_loto_bloqueos',
  LOTO_CAPACITACIONES: 'sgd_loto_capacitaciones',
  LOTO_AUDITORIAS: 'sgd_loto_auditorias',
  PERMISOS_TRABAJO: 'sgd_permisos_trabajo',
  EVALUACIONES_MED: 'sgd_evaluaciones_med',
  CONSULTAS_MEDICAS: 'sgd_consultas_medicas',
  CONTROLES_PRESION: 'sgd_controles_presion',
  APTITUD_PSICOFISICA: 'sgd_aptitud_psicofisica',
  GONIOMETRIAS: 'sgd_goniometrias',
  TRANSPORTE_CHECKLISTS: 'sgd_transporte_checklists',
  TRANSPORTE_VEHICULOS: 'sgd_transporte_vehiculos',
  ACCIDENTES_F465: 'sgd_accidentes_f465',
  COMITES_CSSL: 'sgd_comites_cssl',
  MINUTAS_CSSL: 'sgd_minutas_cssl',
  CAPACITACIONES: 'sgd_capacitaciones',
  CARGAS_FUEGO: 'sgd_cargas_fuego',
  CENTRALES_INCENDIO: 'sgd_centrales_incendio',
  EXTINTORES: 'sgd_extintores',
  PERMISOS_BOMBEROS: 'sgd_permisos_bomberos',
  AUDIT_LOGS: 'sgd_audit_log',
  REPORTES_PDF: 'sgd_reportes_pdf'
};

function getLocal<T>(key: string, defaultVal: T[] = []): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultVal;
  }
}

function setLocal<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export const dbService = {
  // ============================================================
  // USUARIOS & PERFIL
  // ============================================================
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const users = await this.getUsers();
    const found = users.find(u => u.id === uid || u._id === uid);
    return found || null;
  },

  async getUsers(): Promise<UserProfile[]> {
    let users = getLocal<any>(SK.USERS);
    if (!users || users.length === 0) {
      users = INITIAL_USUARIOS.map(u => ({
        id: u._id,
        _id: u._id,
        email: u.email,
        displayName: u.nombre,
        nombre: u.nombre,
        role: u.rol as Role,
        rol: u.rol,
        activo: u.activo
      }));
      setLocal(SK.USERS, users);
    }
    return users.map(u => ({
      id: u.id || u._id,
      _id: u._id || u.id,
      email: u.email,
      displayName: u.displayName || u.nombre,
      nombre: u.nombre || u.displayName,
      role: (u.role || u.rol || 'Inspector') as Role,
      rol: u.rol || u.role,
      photoURL: u.photoURL || u.fotoUrl,
      fotoUrl: u.fotoUrl || u.photoURL,
      activo: u.activo !== false
    }));
  },

  async updateUserRole(uid: string, role: Role): Promise<void> {
    const users = getLocal<any>(SK.USERS);
    const idx = users.findIndex((u: any) => u.id === uid || u._id === uid);
    if (idx !== -1) {
      users[idx].role = role;
      users[idx].rol = role;
      setLocal(SK.USERS, users);
      await this.logAction('UPDATE', 'users', uid, `Rol de usuario ${uid} actualizado a ${role}`);
      postGAS('saveUsuario', users[idx]).catch(console.error);
    }
  },

  async createUserProfile(profile: UserProfile): Promise<void> {
    const users = getLocal<any>(SK.USERS);
    const id = profile.id || profile._id || genId('usr');
    const existingIdx = users.findIndex((u: any) => u.id === id || u.email?.toLowerCase() === profile.email.toLowerCase());
    const finalUser = {
      ...profile,
      id,
      _id: id,
      nombre: profile.displayName || profile.nombre,
      rol: profile.role
    };
    if (existingIdx !== -1) {
      users[existingIdx] = { ...users[existingIdx], ...finalUser };
    } else {
      users.push(finalUser);
    }
    setLocal(SK.USERS, users);
    postGAS('saveUsuario', finalUser).catch(console.error);
  },

  // ============================================================
  // CATÁLOGOS BASE
  // ============================================================
  async getEmpresas(): Promise<Empresa[]> {
    let list = getLocal<Empresa>(SK.EMPRESAS);
    if (!list || list.length === 0) {
      list = INITIAL_EMPRESAS.map(e => ({ ...e, id: e._id }));
      setLocal(SK.EMPRESAS, list);
    }
    return list;
  },

  async createEmpresa(data: Omit<Empresa, 'id'>): Promise<string> {
    const list = await this.getEmpresas();
    const id = genId('emp');
    const newEmp: Empresa = { id, _id: id, ...data };
    list.push(newEmp);
    setLocal(SK.EMPRESAS, list);
    await this.logAction('CREATE', 'empresas', id, `Empresa creada: ${data.nombre}`);
    return id;
  },

  async updateEmpresa(id: string, data: Partial<Empresa>): Promise<void> {
    const list = await this.getEmpresas();
    const idx = list.findIndex(e => e.id === id || e._id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setLocal(SK.EMPRESAS, list);
      await this.logAction('UPDATE', 'empresas', id, `Empresa actualizada: ${list[idx].nombre}`);
    }
  },

  async deleteEmpresa(id: string): Promise<void> {
    let list = await this.getEmpresas();
    list = list.filter(e => e.id !== id && e._id !== id);
    setLocal(SK.EMPRESAS, list);
    await this.logAction('DELETE', 'empresas', id, `Empresa eliminada`);
  },

  async batchSaveEmpresas(empresas: Empresa[]): Promise<void> {
    setLocal(SK.EMPRESAS, empresas);
    await this.logAction('BATCH_UPDATE', 'empresas', undefined, `${empresas.length} empresas guardadas`);
  },

  async getLocalidades(empresaId?: string): Promise<Localidad[]> {
    let list = getLocal<Localidad>(SK.LOCALIDADES);
    if (!list || list.length === 0) {
      list = INITIAL_LOCALIDADES.map(l => ({ ...l, id: l._id }));
      setLocal(SK.LOCALIDADES, list);
    }
    if (empresaId) {
      return list.filter(l => l.empresaId === empresaId);
    }
    return list;
  },

  async getEstablecimientos(localidadId?: string): Promise<Establecimiento[]> {
    let list = getLocal<Establecimiento>(SK.ESTABLECIMIENTOS);
    if (!list || list.length === 0) {
      list = INITIAL_ESTABLECIMIENTOS.map(e => ({ ...e, id: e._id }));
      setLocal(SK.ESTABLECIMIENTOS, list);
    }
    if (localidadId && localidadId !== 'ALL') {
      return list.filter(e => e.localidadId === localidadId);
    }
    return list;
  },

  async getTiposInspeccion(): Promise<TipoInspeccion[]> {
    let list = getLocal<TipoInspeccion>(SK.TIPOS_INSP);
    if (!list || list.length === 0) {
      // Usar seed detallado de inspections.ts con secciones e items completos
      list = TIPOS_INSPECCION_SEED.map((t, idx) => ({
        id: `ti_${t.codigo.toLowerCase()}`,
        _id: `ti_${t.codigo.toLowerCase()}`,
        ...t
      })) as TipoInspeccion[];
      setLocal(SK.TIPOS_INSP, list);
    }
    return list;
  },

  async getEmpleados(): Promise<Empleado[]> {
    let list = getLocal<Empleado>(SK.EMPLEADOS);
    if (!list || list.length === 0) {
      list = INITIAL_EMPLEADOS.map(e => ({ ...e, id: e._id }));
      setLocal(SK.EMPLEADOS, list);
    }
    return list;
  },

  async seedCatalogs(): Promise<void> {
    const empresas = INITIAL_EMPRESAS.map(e => ({ ...e, id: e._id }));
    const localidades = INITIAL_LOCALIDADES.map(l => ({ ...l, id: l._id }));
    const establecimientos = INITIAL_ESTABLECIMIENTOS.map(e => ({ ...e, id: e._id }));
    const tipos = TIPOS_INSPECCION_SEED.map(t => ({
      id: `ti_${t.codigo.toLowerCase()}`,
      _id: `ti_${t.codigo.toLowerCase()}`,
      ...t
    })) as TipoInspeccion[];
    const empleados = INITIAL_EMPLEADOS.map(e => ({ ...e, id: e._id }));

    setLocal(SK.EMPRESAS, empresas);
    setLocal(SK.LOCALIDADES, localidades);
    setLocal(SK.ESTABLECIMIENTOS, establecimientos);
    setLocal(SK.TIPOS_INSP, tipos);
    setLocal(SK.EMPLEADOS, empleados);

    await this.logAction('SEED', 'catalogs', undefined, 'Catálogos maestros inicializados con éxito');
  },

  // ============================================================
  // INSPECCIONES
  // ============================================================
  async generateReferenceNumber(tipoId: string, estId: string): Promise<string> {
    const tipos = await this.getTiposInspeccion();
    const ests = await this.getEstablecimientos();
    const tipo = tipos.find(t => t.id === tipoId || t._id === tipoId);
    const est = ests.find(e => e.id === estId || e._id === estId);

    const tipoCode = tipo?.codigo || 'INSP';
    const estInitials = est?.iniciales || est?.nombre?.substring(0, 3).toUpperCase() || 'SED';
    const inspections = await this.getInspecciones(1000);
    const count = inspections.length + 1;
    const year = new Date().getFullYear();

    return `${tipoCode}-${estInitials}-${year}-${String(count).padStart(4, '0')}`;
  },

  async getInspecciones(limit = 100): Promise<Inspeccion[]> {
    const list = getLocal<Inspeccion>(SK.INSPECCIONES);
    return list.slice(0, limit);
  },

  async createInspeccion(data: any): Promise<string> {
    const list = getLocal<any>(SK.INSPECCIONES);
    const id = genId('insp');
    const now = new Date().toISOString();
    const ref = data.referencia || await this.generateReferenceNumber(data.tipoInspeccionId, data.establecimientoId);

    const newInsp = {
      ...data,
      id,
      _id: id,
      referencia: ref,
      createdAt: now,
      updatedAt: now,
      fecha: data.fecha || now.split('T')[0],
      estado: data.estado || 'Completada'
    };

    list.unshift(newInsp);
    setLocal(SK.INSPECCIONES, list);

    // Enviar a Google Sheets
    postGAS('saveFormData', newInsp).catch(console.error);

    await this.logAction('CREATE', 'inspecciones', id, `Inspección creada: ${ref}`);
    return id;
  },

  async updateInspeccion(id: string, data: Partial<Inspeccion>): Promise<void> {
    const list = getLocal<any>(SK.INSPECCIONES);
    const idx = list.findIndex(i => i.id === id || i._id === id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        ...data,
        updatedAt: new Date().toISOString()
      };
      setLocal(SK.INSPECCIONES, list);
      postGAS('saveFormData', list[idx]).catch(console.error);
      await this.logAction('UPDATE', 'inspecciones', id, `Inspección ${id} actualizada`);
    }
  },

  // ============================================================
  // PLAN DE ACCIÓN
  // ============================================================
  async getPlanesAccion(inspeccionId?: string): Promise<PlanAccion[]> {
    const list = getLocal<PlanAccion>(SK.PLAN_ACCION);
    if (inspeccionId) {
      return list.filter(p => p.inspeccionId === inspeccionId);
    }
    return list;
  },

  async createPlanAccion(data: any): Promise<string> {
    const list = getLocal<any>(SK.PLAN_ACCION);
    const id = genId('plan');
    const now = new Date().toISOString();
    const newPlan = {
      ...data,
      id,
      _id: id,
      createdAt: now,
      estado: data.estado || 'Pendiente'
    };
    list.unshift(newPlan);
    setLocal(SK.PLAN_ACCION, list);
    postGAS('updatePlanAccion', newPlan).catch(console.error);
    await this.logAction('CREATE', 'planesAccion', id, `Plan de acción creado para inspección ${data.inspeccionId}`);
    return id;
  },

  async updatePlanAccion(id: string, data: Partial<PlanAccion>): Promise<void> {
    const list = getLocal<any>(SK.PLAN_ACCION);
    const idx = list.findIndex(p => p.id === id || p._id === id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        ...data,
        updatedAt: new Date().toISOString()
      };
      setLocal(SK.PLAN_ACCION, list);
      postGAS('updatePlanAccion', list[idx]).catch(console.error);
      await this.logAction('UPDATE', 'planesAccion', id, `Plan de acción ${id} actualizado a estado ${list[idx].estado}`);
    }
  },

  // ============================================================
  // DOTACIÓN EPP Y UNIFORMES
  // ============================================================
  async getInventario(): Promise<InventarioItem[]> {
    let list = getLocal<InventarioItem>(SK.INVENTARIO_EPP);
    if (!list || list.length === 0) {
      // Seed inicial EPP Duncan
      list = [
        {
          id: 'epp_01',
          codigo: 'EPP-BOT-01',
          nombre: 'Botas de Seguridad Dieléctricas con Puntera',
          categoria: 'Protección de Pies y Piernas',
          descripcion: 'Calzado certificado COVENIN 39:2003 resistente a impactos y ácido sulfúrico',
          normaCovenin: 'COVENIN 39:2003',
          vidaUtilEstimadaMeses: 6,
          stock: [{ talla: '39', cantidad: 12 }, { talla: '40', cantidad: 20 }, { talla: '41', cantidad: 25 }, { talla: '42', cantidad: 18 }, { talla: '43', cantidad: 8 }]
        },
        {
          id: 'epp_02',
          codigo: 'EPP-LENT-01',
          nombre: 'Lentes de Seguridad Anti-Impacto Anti-Empañante',
          categoria: 'Protección Ocular y Facial',
          descripcion: 'Lentes claros con protección lateral y filtro UV para manipulación de baterías',
          normaCovenin: 'COVENIN 955-76 / ANSI Z87.1',
          vidaUtilEstimadaMeses: 3,
          stock: [{ talla: 'Única', cantidad: 85 }]
        },
        {
          id: 'epp_03',
          codigo: 'EPP-GUAN-NIT',
          nombre: 'Guantes de Nitrilo Grueso Caña Larga para Ácido',
          categoria: 'Protección de Manos y Brazos',
          descripcion: 'Resistentes al ácido de batería e hidrocarburos según norma COVENIN 2165',
          normaCovenin: 'COVENIN 2165-84',
          vidaUtilEstimadaMeses: 2,
          stock: [{ talla: 'M', cantidad: 45 }, { talla: 'L', cantidad: 60 }, { talla: 'XL', cantidad: 30 }]
        },
        {
          id: 'epp_04',
          codigo: 'EPP-RESP-PL',
          nombre: 'Respirador Media Cara con Filtros para Vapores Ácidos y Plomo',
          categoria: 'Protección Respiratoria',
          descripcion: 'Protección respiratoria especializada para áreas de carga y fundición',
          normaCovenin: 'COVENIN 1056 / NIOSH P100',
          vidaUtilEstimadaMeses: 12,
          stock: [{ talla: 'M', cantidad: 24 }, { talla: 'L', cantidad: 18 }]
        },
        {
          id: 'epp_05',
          codigo: 'EPP-DEL-AC',
          nombre: 'Delantal de PVC Resistente a Ácido Sulfúrico',
          categoria: 'Protección Química / Ácido',
          descripcion: 'Delantal impermeable de alta resistencia química para servicentro y distribuidora',
          normaCovenin: 'COVENIN 2237',
          vidaUtilEstimadaMeses: 6,
          stock: [{ talla: 'Única', cantidad: 35 }]
        },
        {
          id: 'epp_06',
          codigo: 'EPP-CASCO-01',
          nombre: 'Casco de Seguridad Clase E con Barbiquejo',
          categoria: 'Protección de Cabeza',
          descripcion: 'Dieléctrico hasta 20.000 voltios con suspensión de 4 puntos',
          normaCovenin: 'COVENIN 815:1999',
          vidaUtilEstimadaMeses: 24,
          stock: [{ talla: 'Ajustable', cantidad: 50 }]
        }
      ];
      setLocal(SK.INVENTARIO_EPP, list);
    }
    return list;
  },

  async addInventarioItem(data: any): Promise<string> {
    const list = await this.getInventario();
    const id = genId('epp_item');
    const newItem = { ...data, id, createdAt: new Date().toISOString() };
    list.push(newItem);
    setLocal(SK.INVENTARIO_EPP, list);
    await this.logAction('CREATE', 'inventarioEPP', id, `Artículo EPP añadido: ${data.nombre}`);
    return id;
  },

  async updateInventarioItem(id: string, data: Partial<InventarioItem>): Promise<void> {
    const list = await this.getInventario();
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setLocal(SK.INVENTARIO_EPP, list);
      await this.logAction('UPDATE', 'inventarioEPP', id, `Artículo EPP ${list[idx].nombre} actualizado`);
    }
  },

  async deleteInventarioItem(id: string): Promise<void> {
    let list = await this.getInventario();
    list = list.filter(i => i.id !== id);
    setLocal(SK.INVENTARIO_EPP, list);
    await this.logAction('DELETE', 'inventarioEPP', id, 'Artículo EPP eliminado');
  },

  async getSolicitudesEPP(empleadoId?: string): Promise<SolicitudEPP[]> {
    const list = getLocal<SolicitudEPP>(SK.SOLICITUDES_EPP);
    if (empleadoId) {
      return list.filter(s => s.empleadoId === empleadoId);
    }
    return list;
  },

  async addSolicitudEPP(data: any): Promise<string> {
    const list = getLocal<any>(SK.SOLICITUDES_EPP);
    const id = genId('sol_epp');
    const newSol = {
      ...data,
      id,
      estado: data.estado || 'Pendiente',
      fechaSolicitud: data.fechaSolicitud || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    list.unshift(newSol);
    setLocal(SK.SOLICITUDES_EPP, list);
    await this.logAction('CREATE', 'solicitudesEPP', id, `Solicitud EPP creada para empleado ${data.empleadoId}`);
    return id;
  },

  async updateSolicitudEPP(id: string, data: Partial<SolicitudEPP>): Promise<void> {
    const list = getLocal<any>(SK.SOLICITUDES_EPP);
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setLocal(SK.SOLICITUDES_EPP, list);
      await this.logAction('UPDATE', 'solicitudesEPP', id, `Solicitud EPP ${id} actualizada a ${list[idx].estado}`);
    }
  },

  async getEntregasEPP(empleadoId?: string): Promise<EntregaEPP[]> {
    const list = getLocal<EntregaEPP>(SK.ENTREGAS_EPP);
    if (empleadoId) {
      return list.filter(e => e.empleadoId === empleadoId);
    }
    return list;
  },

  async addEntregaEPP(data: any, items: SolicitudEPPItem[]): Promise<string> {
    const entregas = getLocal<any>(SK.ENTREGAS_EPP);
    const inventario = await this.getInventario();
    const id = genId('ent_epp');

    // Descontar del inventario
    for (const item of items) {
      const invItem = inventario.find(i => i.id === item.itemId);
      if (invItem) {
        const tallaObj = invItem.stock.find(s => s.talla === item.talla);
        if (tallaObj) {
          tallaObj.cantidad = Math.max(0, tallaObj.cantidad - item.cantidad);
        }
      }
    }
    setLocal(SK.INVENTARIO_EPP, inventario);

    // Si provenía de una solicitud, marcarla como Entregada
    if (data.solicitudId) {
      await this.updateSolicitudEPP(data.solicitudId, { estado: 'Entregada' });
    }

    const nuevaEntrega = {
      ...data,
      id,
      items,
      fechaEntrega: data.fechaEntrega || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    entregas.unshift(nuevaEntrega);
    setLocal(SK.ENTREGAS_EPP, entregas);

    await this.logAction('CREATE', 'entregasEPP', id, `Entrega de EPP registrada con ${items.length} ítems`);
    return id;
  },

  async seedDotacion(): Promise<void> {
    await this.getInventario();
  },

  // ============================================================
  // LOTO (LOCKOUT / TAGOUT)
  // ============================================================
  async getLotoEquipos(): Promise<LotoEquipo[]> {
    let list = getLocal<LotoEquipo>(SK.LOTO_EQUIPOS);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'loto_eq_01',
          codigo: 'EQ-CARG-01',
          nombre: 'Banco de Carga de Baterías N° 1',
          empresaId: 'emp_ddca',
          localidadId: 'loc_caracas',
          establecimientoId: 'est_dist_ccs',
          estado: 'Operativo',
          procedimientoPasos: [
            '1. Notificar al personal del área de carga y supervisor SSA.',
            '2. Apagar interruptor principal en el tablero de control T-CARGA-01.',
            '3. Bajar disyuntor tripolar de 100A en breaker 14.',
            '4. Colocar pinza porta-candado y candado rojo con tarjeta de bloqueo.',
            '5. Desconectar bornes de alimentación y verificar tensión cero con multímetro.',
            '6. Realizar prueba de encendido (energía cero confirmada).'
          ],
          fuentesEnergia: [
            {
              tipo: 'Eléctrica',
              magnitud: '440V / 220V Trifásico',
              ubicacionDispositivo: 'Tablero Principal T-CARGA-01 Breaker #14',
              dispositivoBloqueo: 'Bloqueador de interruptor disyuntor tripolar + Candado rojo',
              metodoDisipacion: 'Descarga de condensadores en banco de rectificadores'
            },
            {
              tipo: 'Química',
              magnitud: 'Electrolito Ácido Sulfúrico H2SO4',
              ubicacionDispositivo: 'Válvula de llenado y retorno de ácido',
              dispositivoBloqueo: 'Bloqueador de válvula de bola 1 pulgada',
              metodoDisipacion: 'Cierre de válvula y purga de línea hacia tina neutralizadora'
            }
          ]
        },
        {
          id: 'loto_eq_02',
          codigo: 'EQ-MTC-02',
          nombre: 'Montacargas Eléctrico Yale 2.5 Ton',
          empresaId: 'emp_ddca',
          localidadId: 'loc_caracas',
          establecimientoId: 'est_dist_ccs',
          estado: 'Operativo',
          procedimientoPasos: [
            '1. Estacionar en zona de mantenimiento y bajar horquillas al piso.',
            '2. Colocar freno de estacionamiento y calzar neumáticos con cuñas.',
            '3. Desconectar conector Anderson de la batería principal de tracción.',
            '4. Instalar bloqueador de conector de batería Anderson con candado.',
            '5. Intentar arranque y accionar palancas hidráulicas para purgar presión residual.'
          ],
          fuentesEnergia: [
            {
              tipo: 'Eléctrica',
              magnitud: 'Batería de Tracción 48V DC',
              ubicacionDispositivo: 'Conector principal Anderson bajo el asiento',
              dispositivoBloqueo: 'Caja de bloqueo para conector Anderson + Candado',
              metodoDisipacion: 'Desconexión física del enchufe de potencia'
            },
            {
              tipo: 'Hidráulica',
              magnitud: 'Presión de circuito de elevación 2500 PSI',
              ubicacionDispositivo: 'Mástil y cilindros de levante',
              dispositivoBloqueo: 'Horquillas totalmente apoyadas en el suelo',
              metodoDisipacion: 'Mover palancas de mando con llave apagada para aliviar presión'
            }
          ]
        }
      ];
      setLocal(SK.LOTO_EQUIPOS, list);
    }
    return list;
  },

  async saveLotoEquipo(data: any): Promise<string> {
    const list = await this.getLotoEquipos();
    const id = data.id || genId('loto_eq');
    const idx = list.findIndex(e => e.id === id);
    const item = { ...data, id, createdAt: new Date().toISOString() };
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.push(item);
    }
    setLocal(SK.LOTO_EQUIPOS, list);
    await this.logAction('SAVE', 'lotoEquipos', id, `Equipo LOTO guardado: ${data.nombre}`);
    return id;
  },

  async deleteLotoEquipo(id: string): Promise<void> {
    let list = await this.getLotoEquipos();
    list = list.filter(e => e.id !== id);
    setLocal(SK.LOTO_EQUIPOS, list);
    await this.logAction('DELETE', 'lotoEquipos', id, 'Equipo LOTO eliminado');
  },

  async getLotoBloqueos(): Promise<LotoBloqueo[]> {
    return getLocal<LotoBloqueo>(SK.LOTO_BLOQUEOS);
  },

  async saveLotoBloqueo(data: any): Promise<string> {
    const list = getLocal<any>(SK.LOTO_BLOQUEOS);
    const id = data.id || genId('loto_blq');
    const idx = list.findIndex(b => b.id === id);
    const item = { ...data, id, createdAt: new Date().toISOString() };
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    setLocal(SK.LOTO_BLOQUEOS, list);

    // Actualizar estado del equipo
    const equipos = await this.getLotoEquipos();
    const eqIdx = equipos.findIndex(e => e.id === data.equipoId);
    if (eqIdx !== -1) {
      equipos[eqIdx].estado = data.estado === 'Activo' ? 'Bloqueado' : 'Operativo';
      setLocal(SK.LOTO_EQUIPOS, equipos);
    }

    await this.logAction('SAVE', 'lotoBloqueos', id, `Bloqueo LOTO ${data.estado} en equipo ${data.equipoId}`);
    return id;
  },

  async getLotoCapacitaciones(): Promise<LotoCapacitacion[]> {
    return getLocal<LotoCapacitacion>(SK.LOTO_CAPACITACIONES);
  },

  async saveLotoCapacitacion(data: any): Promise<string> {
    const list = getLocal<any>(SK.LOTO_CAPACITACIONES);
    const id = data.id || genId('loto_cap');
    list.unshift({ ...data, id });
    setLocal(SK.LOTO_CAPACITACIONES, list);
    return id;
  },

  async getLotoAuditorias(): Promise<LotoAuditoria[]> {
    return getLocal<LotoAuditoria>(SK.LOTO_AUDITORIAS);
  },

  async saveLotoAuditoria(data: any): Promise<string> {
    const list = getLocal<any>(SK.LOTO_AUDITORIAS);
    const id = data.id || genId('loto_aud');
    list.unshift({ ...data, id });
    setLocal(SK.LOTO_AUDITORIAS, list);
    return id;
  },

  async seedLotoData(): Promise<void> {
    await this.getLotoEquipos();
  },

  // ============================================================
  // PERMISOS DE TRABAJO DE ALTO RIESGO (PTAR)
  // ============================================================
  async getPermisosTrabajo(): Promise<PermisoTrabajo[]> {
    let list = getLocal<PermisoTrabajo>(SK.PERMISOS_TRABAJO);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'perm_01',
          codigoPermiso: 'PTAR-2026-001',
          fechaSolicitud: '2026-11-20',
          vigenciaInicio: '2026-11-20 08:00',
          vigenciaFin: '2026-11-20 17:00',
          tipoTrabajo: 'CALIENTE',
          tipoPermisoPrincipal: 'CALIENTE',
          certificadosAnexos: {
            confinados: false,
            altura: true,
            loto: true,
            excavacion: false,
            izamiento: false
          },
          descripcionTrabajo: 'Soldadura y refuerzo estructural de estanterías en Almacén Central de Baterías',
          ubicacionDato: 'Distribuidora Duncan Caracas - Almacén Nave 2',
          estado: 'APROBADO',
          checklistAltura: {
            arnesOk: true,
            anclajesOk: true,
            lineasVidaOk: true,
            barandasOk: true,
            capacitacionAlturaOk: true,
            aptoAlturaSalud: true
          },
          checklistLoto: {
            apagadoConfirmado: true,
            aislamientoConfirmado: true,
            candadosInstalados: true,
            alivioEnergiaConfirmado: true,
            pruebaCeroConfirmado: true
          },
          responsables: {
            ejecutorId: 'emp_01',
            emisorId: 'emp_02',
            supervisorId: 'emp_03'
          },
          historialEventos: [
            {
              estado: 'SOLICITUD',
              timestamp: '2026-11-20 07:30',
              usuarioId: 'emp_01',
              comentario: 'Solicitud inicial de trabajo en caliente y altura'
            },
            {
              estado: 'APROBADO',
              timestamp: '2026-11-20 07:55',
              usuarioId: 'emp_03',
              comentario: 'Inspección de campo aprobada. Extintores PQS y mantas ignífugas colocadas.'
            }
          ]
        }
      ];
      setLocal(SK.PERMISOS_TRABAJO, list);
    }
    return list;
  },

  async savePermisoTrabajo(data: any): Promise<string> {
    const list = getLocal<any>(SK.PERMISOS_TRABAJO);
    const id = data.id || genId('ptar');
    const now = new Date().toISOString();
    const count = list.length + 1;
    const codigo = data.codigoPermiso || `PTAR-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

    const newPermiso = {
      ...data,
      id,
      codigoPermiso: codigo,
      fechaSolicitud: data.fechaSolicitud || now.split('T')[0],
      estado: data.estado || 'SOLICITUD',
      historialEventos: data.historialEventos || [
        {
          estado: data.estado || 'SOLICITUD',
          timestamp: now,
          usuarioId: data.responsables?.ejecutorId || 'usuario',
          comentario: 'Permiso registrado en el sistema'
        }
      ]
    };

    list.unshift(newPermiso);
    setLocal(SK.PERMISOS_TRABAJO, list);
    await this.logAction('CREATE', 'permisosTrabajo', id, `Permiso de trabajo creado: ${codigo}`);
    return id;
  },

  async updatePermisoTrabajo(id: string, data: Partial<PermisoTrabajo>): Promise<void> {
    const list = getLocal<any>(SK.PERMISOS_TRABAJO);
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      const now = new Date().toISOString();
      const updated = { ...list[idx], ...data };
      if (data.estado && data.estado !== list[idx].estado) {
        updated.historialEventos = [
          ...(updated.historialEventos || []),
          {
            estado: data.estado,
            timestamp: now,
            usuarioId: 'supervisor',
            comentario: `Cambio de estado a ${data.estado}`
          }
        ];
      }
      list[idx] = updated;
      setLocal(SK.PERMISOS_TRABAJO, list);
      await this.logAction('UPDATE', 'permisosTrabajo', id, `Permiso de trabajo ${id} actualizado a ${data.estado || 'modificado'}`);
    }
  },

  // ============================================================
  // EVALUACIONES MÉDICAS & VACACIONES
  // ============================================================
  async getEvaluacionesMedicas(): Promise<EvaluacionMedica[]> {
    let list = getLocal<EvaluacionMedica>(SK.EVALUACIONES_MED);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'med_01',
          empleadoId: 'emp_01',
          empleadoNombre: 'Carlos Eduardo Mendoza',
          empleadoCedula: 'V-15892341',
          empleadoCargo: 'Técnico de Servicio y Carga',
          empleadoDepartamento: 'Servicio Técnico',
          empresaNombre: 'Inversiones 1286, C.A.',
          establecimientoNombre: 'Servicentro Los Ruices',
          tipoEvaluacion: 'ESPECIAL_PLOMBEMIA',
          estado: 'REALIZADA',
          fechaSolicitud: '2026-10-15',
          fechaRealizada: '2026-10-18',
          plombemiaPbB: 24.5, // µg/dL (Normal < 30 µg/dL según COVENIN)
          plombemiaALA: 4.2,
          audiometria: 'NORMAL',
          aptitud: 'APTO',
          solicitadoPor: 'usr_admin',
          solicitadoPorNombre: 'Servicio Médico Ocupacional Duncan',
          comentariosResultados: 'Niveles de plomo en sangre dentro del límite biológico permisible.'
        },
        {
          id: 'med_02',
          empleadoId: 'emp_02',
          empleadoNombre: 'José Ramón Hernández',
          empleadoCedula: 'V-12450891',
          empleadoCargo: 'Chofer de Carga Pesada',
          empleadoDepartamento: 'Distribución y Transporte',
          empresaNombre: 'Distribuidora Duncan, C.A.',
          establecimientoNombre: 'Distribuidora Duncan Caracas',
          tipoEvaluacion: 'PRE_VACACIONAL',
          estado: 'AGENDADA',
          fechaSolicitud: '2026-11-10',
          fechaAgendada: '2026-11-25',
          fechaInicioVacaciones: '2026-12-01',
          diasVacacionesPendientes: 30,
          alertaFatiga: true,
          solicitadoPor: 'usr_admin',
          solicitadoPorNombre: 'Recursos Humanos / SSA',
          comentariosResultados: 'Examen preventivo previo al disfrute de período vacacional reglamentario.'
        }
      ];
      setLocal(SK.EVALUACIONES_MED, list);
    }
    return list;
  },

  async saveEvaluacionMedica(data: any): Promise<string> {
    const list = getLocal<any>(SK.EVALUACIONES_MED);
    const id = data.id || genId('med');
    const item = {
      ...data,
      id,
      estado: data.estado || 'SOLICITADA',
      fechaSolicitud: data.fechaSolicitud || new Date().toISOString().split('T')[0]
    };
    list.unshift(item);
    setLocal(SK.EVALUACIONES_MED, list);
    await this.logAction('CREATE', 'evaluacionesMedicas', id, `Evaluación médica solicitada para ${data.empleadoNombre}`);
    return id;
  },

  async updateEvaluacionMedica(id: string, data: Partial<EvaluacionMedica>): Promise<void> {
    const list = getLocal<any>(SK.EVALUACIONES_MED);
    const idx = list.findIndex(m => m.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setLocal(SK.EVALUACIONES_MED, list);
      await this.logAction('UPDATE', 'evaluacionesMedicas', id, `Evaluación médica ${id} actualizada`);
    }
  },

  // ============================================================
  // V-EXPRESS: REGISTRO DIARIO DE CONSULTAS MÉDICAS (REG_DIARIO)
  // ============================================================
  async getConsultasMedicas(): Promise<ConsultaMedicaDiaria[]> {
    let list = getLocal<ConsultaMedicaDiaria>(SK.CONSULTAS_MEDICAS);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'cd_01',
          fecha: '2026-10-01',
          hora: '08:00',
          cedula: '27715315',
          codigoFicha: '591714',
          nombreApellido: 'CARRASQUEL GONZALEZ ALESKA CARIDAD',
          genero: 'FEMENINO',
          edad: 25,
          empresaNombre: 'INVERSIONES 1286 C.A.',
          departamento: 'TESORERIA',
          sucursal: 'CARACAS',
          cargo: 'ANALISTA DE CUENTAS POR PAGAR',
          tipoConsulta: 'Consulta 1',
          enfermeroNombre: 'GUERRERO DE REYES ALIX COROMOTO',
          medicoNombre: 'RAMOS MARTINEZ CARMEN ISMELDA',
          ciMedico: '6211215',
          numeroMSDS: '43739',
          numeroCMV: '17585',
          temperaturaC: 36.6,
          saturacionO2: 98,
          frecuenciaCardiacaPpm: 72,
          presionSistolica: 120,
          presionDiastolica: 70,
          condicionPresion: 'NORMAL',
          impresionDiagnostica: 'Esguince de tobillo grado I',
          diagnosticoDetallado: 'Traumatismo leve durante trayecto peatonal.',
          sistemaAfectado: 'Músculo-esquelético',
          esInfecciosoContagioso: false,
          clasificacionGeneral: 'Accidente de Trayecto',
          tratamientoSuministrado: 'Ibuprofeno 400mg + vendaje compresivo',
          medicamento: 'Analgésico / Antiinflamatorio',
          viaSuministro: 'Oral',
          cantidadSuministrada: '1 tableta',
          tieneReposo: false,
          fueReferido: false,
          observacionesEvolucion: 'Evolución favorable, se indican pautas de reposo articular relativo.'
        },
        {
          id: 'cd_02',
          fecha: '2026-10-05',
          hora: '10:15',
          cedula: '15892341',
          codigoFicha: '590412',
          nombreApellido: 'MENDOZA CARLOS EDUARDO',
          genero: 'MASCULINO',
          edad: 38,
          empresaNombre: 'ACUMULADORES DUNCAN, C.A.',
          departamento: 'PRODUCCION Y CARGA',
          sucursal: 'LOS RUICES',
          cargo: 'TECNICO DE CARGA Y FORMACION',
          tipoConsulta: 'Consulta 1',
          medicoNombre: 'RAMOS MARTINEZ CARMEN ISMELDA',
          ciMedico: '6211215',
          numeroMSDS: '43739',
          numeroCMV: '17585',
          temperaturaC: 36.8,
          saturacionO2: 97,
          frecuenciaCardiacaPpm: 78,
          presionSistolica: 130,
          presionDiastolica: 85,
          condicionPresion: 'NORMAL_ALTA',
          impresionDiagnostica: 'Dorsalgia / Lumbalgia mecánica ocupacional',
          diagnosticoDetallado: 'Sobreesfuerzo por manipulación manual de baterías 31MR.',
          sistemaAfectado: 'Músculo-esquelético',
          esInfecciosoContagioso: false,
          clasificacionGeneral: 'Enfermedad Ocupacional',
          tratamientoSuministrado: 'Ketoprofeno 100mg + Complejo B intramuscular',
          medicamento: 'Analgésico / Relajante muscular',
          viaSuministro: 'Intramuscular',
          cantidadSuministrada: '1 ampolla',
          tieneReposo: true,
          fechaInicioReposo: '2026-10-05',
          fechaReintegro: '2026-10-08',
          diasReposo: 3,
          fueReferido: true,
          especialidadReferida: 'Traumatología',
          motivoReferencia: 'Evaluación de columna lumbar y goniometría de control.',
          observacionesEvolucion: 'Reposo médico otorgado por 3 días. Notificado a SSA y supervisor de área.'
        }
      ];
      setLocal(SK.CONSULTAS_MEDICAS, list);
    }
    return list;
  },

  async saveConsultaMedica(data: any): Promise<string> {
    const list = await this.getConsultasMedicas();
    const id = data.id || genId('cmed');
    const item = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };
    list.unshift(item);
    setLocal(SK.CONSULTAS_MEDICAS, list);
    await this.logAction('CREATE', 'consultasMedicas', id, `Consulta diaria registrada para ${data.nombreApellido}`);
    return id;
  },

  // ============================================================
  // V-EXPRESS: PROGRAMA CONTROL PRESIÓN ARTERIAL (REG_CONTROL_PA)
  // ============================================================
  async getControlesPresion(): Promise<ControlPresionArterial[]> {
    let list = getLocal<ControlPresionArterial>(SK.CONTROLES_PRESION);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'pa_01',
          fecha: '2026-10-10',
          hora: '08:30',
          cedula: '11754040',
          codigoFicha: '154040',
          nombreApellido: 'SEGOVIA PADILLA JESUS ALFREDO',
          genero: 'MASCULINO',
          edad: 55,
          departamento: 'ALMACEN CENTRAL',
          sucursal: 'CARACAS',
          cargo: 'OPERADOR DE MONTACARGAS',
          diagnostico: 'Hipertensión Arterial Primaria (HTA Controlada)',
          presionSistolica: 125,
          presionDiastolica: 80,
          condicion: 'Normal (120-129/80-84)',
          medicamentoAntihipertensivo: 'Losartán Potásico 50mg',
          dosis: '1 tableta diaria VO',
          administradoEnServicio: true,
          observaciones: 'Presión arterial dentro de rango meta. Apto para operar montacargas sin restricciones.'
        },
        {
          id: 'pa_02',
          fecha: '2026-10-12',
          hora: '09:00',
          cedula: '12450891',
          codigoFicha: '590891',
          nombreApellido: 'HERNANDEZ JOSE RAMON',
          genero: 'MASCULINO',
          edad: 48,
          departamento: 'TRANSPORTE Y RUTAS',
          sucursal: 'CARACAS',
          cargo: 'CHOFER DE RUTA NACIONAL',
          diagnostico: 'Descarte de Hipertensión / Cifras tensionales elevadas',
          presionSistolica: 145,
          presionDiastolica: 95,
          condicion: 'HTA Grado 1 (140-159/90-99)',
          medicamentoAntihipertensivo: 'Enalapril 10mg',
          dosis: '1 tableta',
          administradoEnServicio: true,
          observaciones: 'Se sugiere monitoreo ambulatorio de presión arterial (MAPA) y reevaluación antes de salida de ruta.'
        }
      ];
      setLocal(SK.CONTROLES_PRESION, list);
    }
    return list;
  },

  async saveControlPresion(data: any): Promise<string> {
    const list = await this.getControlesPresion();
    const id = data.id || genId('cpa');
    const item = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };
    list.unshift(item);
    setLocal(SK.CONTROLES_PRESION, list);
    await this.logAction('CREATE', 'controlPresion', id, `Monitoreo PA registrado para ${data.nombreApellido}`);
    return id;
  },

  // ============================================================
  // V-EXPRESS: CERTIFICADO APTITUD PSICOFÍSICA (REG_APF)
  // ============================================================
  async getAptitudesPsicofisicas(): Promise<CertificadoAptitudPsicofisica[]> {
    let list = getLocal<CertificadoAptitudPsicofisica>(SK.APTITUD_PSICOFISICA);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'apf_01',
          fecha: '2026-10-02',
          hora: '09:00',
          lugar: 'CARACAS',
          tipoEvaluacion: 'Pre-Vacacional',
          cedula: '27222497',
          codigoFicha: '222497',
          nombreApellido: 'FLORES MORENO LUZ MARY',
          genero: 'FEMENINO',
          edad: 26,
          sucursal: 'CARACAS',
          empresaNombre: 'INVERSIONES 1286 C.A.',
          departamento: 'COMPRAS INTERNACIONALES',
          cargo: 'ANALISTA DE IMPORTACION',
          conceptoAptitud: 'NO_EXISTE_CONTRAINDICACION',
          restricciones: {
            noLevantarPesoMayor22Kg: false,
            noExposicionPolvoAcidoGasPlomo: false,
            noUbicarLugarRuidoso: false,
            evitarExcesivoCaminar: false,
            evitarPosicionSentadaExceso: true,
            evitarPosicionPieExceso: false,
            trabajarSoloHorasDiurnas: false,
            noPosicionCuclillas: false,
            usoBotasCorreccionOrtopedica: false,
            instruidoSeguridadHigiene: true,
            instruidoPrimerosAuxilios: true
          },
          observacionesComentarios: 'Sin contraindicación actual para disfrute vacacional. Se indican pausas activas e higiene postural.',
          medicoNombre: 'RAMOS MARTINEZ CARMEN ISMELDA',
          ciMedico: '6211215',
          numeroMSDS: '43739',
          numeroCMV: '17585'
        },
        {
          id: 'apf_02',
          fecha: '2026-11-06',
          hora: '08:20',
          lugar: 'CARACAS',
          tipoEvaluacion: 'Ocupacional / Periódico',
          cedula: '21130755',
          codigoFicha: '130755',
          nombreApellido: 'RODRIGUEZ COLON CESAR LUCIANO',
          genero: 'MASCULINO',
          edad: 34,
          sucursal: 'CARACAS',
          empresaNombre: 'DISTRIBUIDORA DUNCAN, C.A.',
          departamento: 'DISTRIBUCION Y RUTAS',
          cargo: 'CONDUCTOR / VENDEDOR DE RUTA',
          conceptoAptitud: 'APTO_CON_LIMITACIONES',
          restricciones: {
            noLevantarPesoMayor22Kg: true,
            noExposicionPolvoAcidoGasPlomo: true,
            noUbicarLugarRuidoso: false,
            evitarExcesivoCaminar: false,
            evitarPosicionSentadaExceso: false,
            evitarPosicionPieExceso: true,
            trabajarSoloHorasDiurnas: true,
            noPosicionCuclillas: false,
            usoBotasCorreccionOrtopedica: true,
            instruidoSeguridadHigiene: true,
            instruidoPrimerosAuxilios: true,
            otrasRestricciones: 'Debe usar faja ergonómica y solicitar apoyo mecánico para descargas de baterías de más de 22kg.'
          },
          observacionesComentarios: 'Apto condicionado a cumplimiento estricto de límites de carga y uso de EPP antiácido.',
          medicoNombre: 'RAMOS MARTINEZ CARMEN ISMELDA',
          ciMedico: '6211215',
          numeroMSDS: '43739',
          numeroCMV: '17585'
        }
      ];
      setLocal(SK.APTITUD_PSICOFISICA, list);
    }
    return list;
  },

  async saveAptitudPsicofisica(data: any): Promise<string> {
    const list = await this.getAptitudesPsicofisicas();
    const id = data.id || genId('apf');
    const item = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };
    list.unshift(item);
    setLocal(SK.APTITUD_PSICOFISICA, list);
    await this.logAction('CREATE', 'aptitudPsicofisica', id, `Certificado APF emitido para ${data.nombreApellido}`);
    return id;
  },

  // ============================================================
  // V-EXPRESS: EVALUACIÓN GONIOMÉTRICA (REG_GONIOMETRÍA)
  // ============================================================
  async getGoniometrias(): Promise<EvaluacionGoniometria[]> {
    let list = getLocal<EvaluacionGoniometria>(SK.GONIOMETRIAS);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'gon_01',
          fecha: '2026-10-18',
          hora: '11:00',
          cedula: '15892341',
          codigoFicha: '590412',
          nombreApellido: 'MENDOZA CARLOS EDUARDO',
          genero: 'MASCULINO',
          edad: 38,
          empresaNombre: 'ACUMULADORES DUNCAN, C.A.',
          departamento: 'PRODUCCION Y CARGA',
          sucursal: 'LOS RUICES',
          cargo: 'TECNICO DE CARGA Y FORMACION',
          medicoNombre: 'RAMOS MARTINEZ CARMEN ISMELDA',
          cervical: {
            flexion: 40,
            extension: 42,
            rotacionIzq: 58,
            rotacionDer: 60,
            inclinacionIzq: 42,
            inclinacionDer: 44
          },
          lumbar: {
            flexion: 65, // Limitado (normal 0-80)
            extension: 22, // Limitado (normal 0-30)
            rotacionIzq: 38,
            rotacionDer: 40,
            lateralizacionIzq: 30,
            lateralizacionDer: 32
          },
          hombroDerecho: {
            flexion: 175,
            extension: 55,
            abduccion: 170,
            rotacionInterna: 68,
            rotacionExterna: 85
          },
          hombroIzquierdo: {
            flexion: 178,
            extension: 58,
            abduccion: 175,
            rotacionInterna: 70,
            rotacionExterna: 88
          },
          diagnosticoBiomecanico: 'Limitación funcional leve en flexión y extensión de columna lumbar secundaria a sobreesfuerzo.',
          limitacionFuncionalDetectada: true,
          observaciones: 'Se recomienda programa de fisioterapia ocupacional y rotación temporal de puesto de carga.'
        }
      ];
      setLocal(SK.GONIOMETRIAS, list);
    }
    return list;
  },

  async saveGoniometria(data: any): Promise<string> {
    const list = await this.getGoniometrias();
    const id = data.id || genId('gon');
    const item = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };
    list.unshift(item);
    setLocal(SK.GONIOMETRIAS, list);
    await this.logAction('CREATE', 'goniometria', id, `Evaluación goniométrica registrada para ${data.nombreApellido}`);
    return id;
  },

  // ============================================================
  // TRANSPORTE Y CONTROL DE CARGA (INCLUSIONES V2)
  // ============================================================
  async getVehiculosFlota(): Promise<VehiculoFlota[]> {
    let list = getLocal<VehiculoFlota>(SK.TRANSPORTE_VEHICULOS);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'veh_01',
          placa: 'A34BC9D',
          marcaModelo: 'Mack Chuto R-600',
          tipoVehiculo: 'Gandola / Chuto',
          capacidadNominalKg: 28000,
          margenSeguridadKg: 25000,
          sedeAsignada: 'Distribuidora Duncan Caracas',
          choferHabitual: 'José Ramón Hernández',
          estatus: 'OPERATIVO',
          kilometrajeActual: 245000,
          vencimientoRACDA: '2027-04-15',
          vencimientoPermisoBomberos: '2027-02-28',
          vencimientoPoliza: '2027-06-30'
        },
        {
          id: 'veh_02',
          placa: 'A12XY8Z',
          marcaModelo: 'Ford F-750 Chasis Largo',
          tipoVehiculo: 'Camión Chasis Largo',
          capacidadNominalKg: 9500,
          margenSeguridadKg: 8500,
          sedeAsignada: 'Distribuidora Duncan Caracas',
          choferHabitual: 'Luis Alberto Gómez',
          estatus: 'OPERATIVO',
          kilometrajeActual: 182300,
          vencimientoRACDA: '2027-03-10',
          vencimientoPermisoBomberos: '2027-01-30',
          vencimientoPoliza: '2027-05-15'
        },
        {
          id: 'veh_03',
          placa: 'A99MM1K',
          marcaModelo: 'Chevrolet FVR Furgón',
          tipoVehiculo: 'Camión Chasis Largo',
          capacidadNominalKg: 11000,
          margenSeguridadKg: 10000,
          sedeAsignada: 'Distribuidora Duncan Valencia',
          choferHabitual: 'Ramón Antonio Castillo',
          estatus: 'OPERATIVO',
          kilometrajeActual: 135000,
          vencimientoRACDA: '2027-05-20',
          vencimientoPermisoBomberos: '2027-03-15',
          vencimientoPoliza: '2027-08-10'
        }
      ];
      setLocal(SK.TRANSPORTE_VEHICULOS, list);
    }
    return list;
  },

  async saveVehiculoFlota(data: any): Promise<string> {
    const list = await this.getVehiculosFlota();
    const id = data.id || genId('veh');
    const idx = list.findIndex(v => v.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
    } else {
      list.push({ ...data, id });
    }
    setLocal(SK.TRANSPORTE_VEHICULOS, list);
    return id;
  },

  async getTransporteChecklists(): Promise<ChecklistTransporte[]> {
    let list = getLocal<ChecklistTransporte>(SK.TRANSPORTE_CHECKLISTS);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'transp_01',
          correlativo: 'IDVTC-2026-001',
          fecha: '2026-11-20',
          hora: '06:45',
          tipoChecklist: 'DIARIA',
          vehiculoId: 'veh_02',
          placa: 'A12XY8Z',
          marcaModelo: 'Ford F-750 Chasis Largo',
          capacidadNominalKg: 9500,
          kilometraje: 182300,
          sedeOrigen: 'Distribuidora Duncan Caracas',
          sedeDestino: 'Ruta Servicentros Caracas Este',
          choferId: 'emp_chofer_01',
          choferNombre: 'Luis Alberto Gómez',
          choferCedula: 'V-16890451',
          tieneCarga: true,
          pesoManifiestoKg: 7850,
          pesoTotalKg: 7850,
          porcentajeCapacidad: 82.6,
          excedeCapacidad: false,
          respuestas: {
            luces_delanteras: 'BUENO',
            luces_freno: 'BUENO',
            frenos_servicio: 'BUENO',
            neumaticos: 'BUENO',
            niveles_aceite_agua: 'BUENO',
            extintor_pqs: 'BUENO'
          },
          fallasCriticas: [],
          fallasMenores: [],
          observaciones: 'Vehículo en óptimas condiciones operativas para despacho.',
          semaforoSalida: 'VERDE',
          firmaChofer: 'data:image/png;base64,sample'
        }
      ];
      setLocal(SK.TRANSPORTE_CHECKLISTS, list);
    }
    return list;
  },

  async saveTransporteChecklist(data: any): Promise<string> {
    const list = getLocal<any>(SK.TRANSPORTE_CHECKLISTS);
    const id = data.id || genId('chk_transp');
    const count = list.length + 1;
    const prefix = data.tipoChecklist === 'DIARIA' ? 'IDVTC' : data.tipoChecklist === 'SEMANAL' ? 'ISEM' : 'VTC';
    const correlativo = data.correlativo || `${prefix}-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

    const item = {
      ...data,
      id,
      correlativo,
      fecha: data.fecha || new Date().toISOString().split('T')[0],
      hora: data.hora || new Date().toTimeString().substring(0, 5)
    };

    list.unshift(item);
    setLocal(SK.TRANSPORTE_CHECKLISTS, list);
    await this.logAction('CREATE', 'transporteChecklists', id, `Checklist ${prefix} registrado: ${correlativo} - Semáforo: ${data.semaforoSalida}`);
    return id;
  },

  // ============================================================
  // ACCIDENTABILIDAD, MORBILIDAD Y ÁRBOL DE CAUSAS (INCLUSIONES V2)
  // ============================================================
  async getAccidentesF465(): Promise<AccidenteF465[]> {
    let list = getLocal<AccidenteF465>(SK.ACCIDENTES_F465);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'acc_01',
          correlativo: 'ACC-2026-001',
          fechaNotificacion: '2026-10-05',
          tipoSuceso: 'ACCIDENTE_TRABAJO',
          gravedad: 'LEVE',
          empleadoId: 'emp_03',
          nombreCompleto: 'Marcos Aurelio Pérez',
          cedula: 'V-19874123',
          edad: 32,
          genero: 'M',
          cargo: 'Operador de Carga y Almacén',
          antiguedadPuesto: '2 años',
          departamento: 'Almacén',
          sedeEmpresa: 'Distribuidora Duncan Caracas',
          fechaAccidente: '2026-10-04',
          horaAccidente: '10:15',
          jornadaHoras: 8,
          lugarExacto: 'Pasillo 3, Almacén de Baterías Inservibles',
          actividadHabitual: true,
          descripcionDetallada: 'Al manipular paleta de baterías usadas casco negro, una batería resbaló impactando sobre la bota de seguridad.',
          tipoLesion: 'Contusión leve en empeine derecho',
          parteCuerpoAfectada: 'Pie derecho',
          agenteMaterial: 'Batería Duncan 34MR Casco Usado',
          diasReposoMedico: 3,
          diasPerdidos: 3,
          diasCargados: 0,
          notificadoINPSASEL: true,
          fechaNotificacionINPSASEL: '2026-10-05',
          numeroRegistroINPSASEL: 'INPSASEL-DF-2026-4891',
          comiteCSSLNotificado: true,
          investigacionCompleta: true,
          investigadorId: 'usr_admin',
          investigadorNombre: 'Ing. Francisco Rojas (SSA)',
          arbolCausas: {
            accidenteId: 'acc_01',
            fechaInvestigacion: '2026-10-06',
            equipoInvestigador: ['Ing. Francisco Rojas', 'Delegado Prevención Pedro Ruiz'],
            hechoFinal: 'Caída de batería sobre el pie del trabajador provocando contusión',
            nodos: [
              { id: 'n1', tipo: 'HECHO', descripcion: 'Paleta cargada por encima del nivel de apilamiento recomendado', categoria: 'MATERIAL' },
              { id: 'n2', tipo: 'VARIACION', descripcion: 'Plástico de emplayado flojo en esquina superior derecha', categoria: 'TAREA' },
              { id: 'n3', tipo: 'CAUSA_INMEDIATA', descripcion: 'Manipulación manual sin asegurar previamente el bulto', categoria: 'INDIVIDUO' },
              { id: 'n4', tipo: 'CAUSA_BASICA', descripcion: 'Falta de procedimiento específico para baterías de chatarra no estándar', categoria: 'ORGANIZACION' }
            ],
            causasInmediatas: ['Apilamiento inestable de cascos usados', 'Movimiento sin reasegurar con fleje'],
            causasBasicas: ['Ausencia de estándar visual de altura de estibas para chatarra'],
            medidasCorrectivas: [
              {
                id: 'med_cor_01',
                accion: 'Establecer altura máxima de 3 capas para baterías usadas y flejado obligatorio',
                responsable: 'Supervisor de Almacén',
                fechaCompromiso: '2026-10-15',
                estado: 'CUMPLIDA',
                prioridad: 'ALTA'
              }
            ],
            conclusiones: 'El calzado con puntera de seguridad mitigó la severidad de la lesión, evitando fractura ósea.'
          }
        }
      ];
      setLocal(SK.ACCIDENTES_F465, list);
    }
    return list;
  },

  async saveAccidenteF465(data: any): Promise<string> {
    const list = getLocal<any>(SK.ACCIDENTES_F465);
    const id = data.id || genId('acc');
    const count = list.length + 1;
    const correlativo = data.correlativo || `ACC-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

    const item = {
      ...data,
      id,
      correlativo,
      fechaNotificacion: data.fechaNotificacion || new Date().toISOString().split('T')[0]
    };

    list.unshift(item);
    setLocal(SK.ACCIDENTES_F465, list);
    await this.logAction('CREATE', 'accidentesF465', id, `Accidente notificado: ${correlativo} - ${data.nombreCompleto}`);
    return id;
  },

  async updateAccidenteF465(id: string, data: Partial<AccidenteF465>): Promise<void> {
    const list = getLocal<any>(SK.ACCIDENTES_F465);
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setLocal(SK.ACCIDENTES_F465, list);
      await this.logAction('UPDATE', 'accidentesF465', id, `Accidente ${id} actualizado`);
    }
  },

  // ============================================================
  // COMITÉS CSSL Y DELEGADOS DE PREVENCIÓN (INCLUSIONES V2)
  // ============================================================
  async getComitesCSSL(): Promise<ComiteCSSL[]> {
    let list = getLocal<ComiteCSSL>(SK.COMITES_CSSL);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'cssl_01',
          sedeId: 'est_dist_ccs',
          sedeNombre: 'Distribuidora Duncan Caracas',
          numeroRegistroComiteINPSASEL: 'CSSL-MIR-2025-0142',
          fechaRegistroINPSASEL: '2025-03-15',
          fechaVencimientoVigencia: '2027-03-15', // 2 años de vigencia LOPCYMAT
          diasParaVencer: 480,
          estatusVigencia: 'VIGENTE',
          miembros: [
            {
              id: 'm1',
              nombreCompleto: 'Pedro José Ruiz',
              cedula: 'V-14562890',
              cargoEmpresa: 'Técnico de Despacho',
              departamento: 'Operaciones',
              rolComite: 'DELEGADO_PREVENCION',
              fechaEleccionDesignacion: '2025-02-20',
              numeroRegistroINPSASEL: 'DP-MIR-2025-0812',
              activo: true
            },
            {
              id: 'm2',
              nombreCompleto: 'Ing. Francisco Rojas',
              cedula: 'V-11854920',
              cargoEmpresa: 'Gerente Nacional SSA',
              departamento: 'Seguridad y Salud',
              rolComite: 'REPRESENTANTE_PATRONO',
              fechaEleccionDesignacion: '2025-02-25',
              activo: true
            }
          ]
        }
      ];
      setLocal(SK.COMITES_CSSL, list);
    }
    return list;
  },

  async saveComiteCSSL(data: any): Promise<string> {
    const list = await this.getComitesCSSL();
    const id = data.id || genId('comite_cssl');
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
    } else {
      list.push({ ...data, id });
    }
    setLocal(SK.COMITES_CSSL, list);
    return id;
  },

  async getMinutasCSSL(comiteId?: string): Promise<MinutaReunionCSSL[]> {
    const list = getLocal<MinutaReunionCSSL>(SK.MINUTAS_CSSL);
    if (comiteId) {
      return list.filter(m => m.comiteId === comiteId);
    }
    return list;
  },

  async saveMinutaCSSL(data: any): Promise<string> {
    const list = getLocal<any>(SK.MINUTAS_CSSL);
    const id = data.id || genId('min_cssl');
    const count = list.length + 1;
    const correlativo = data.correlativoMinuta || `MIN-CSSL-${new Date().getFullYear()}-${String(count).padStart(2, '0')}`;

    const item = {
      ...data,
      id,
      correlativoMinuta: correlativo,
      fechaReunion: data.fechaReunion || new Date().toISOString().split('T')[0]
    };

    list.unshift(item);
    setLocal(SK.MINUTAS_CSSL, list);
    await this.logAction('CREATE', 'minutasCSSL', id, `Minuta CSSL registrada: ${correlativo}`);
    return id;
  },

  // ============================================================
  // FORMACIÓN Y RACDA PARA CHOFERES (INCLUSIONES V2)
  // ============================================================
  async getCapacitaciones(): Promise<CapacitacionRegistro[]> {
    let list = getLocal<CapacitacionRegistro>(SK.CAPACITACIONES);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'cap_01',
          codigoCurso: 'RACDA-2026-06',
          tipo: 'RACDA_MATERIALES_PELIGROSOS',
          titulo: 'Manejo y Transporte Seguro de Baterías Ácido-Plomo (RACDA)',
          fechaEjecucion: '2026-10-15',
          duracionHoras: 8,
          instructorNombre: 'Ing. Francisco Rojas',
          enteCapacitador: 'INTERNO_SSA',
          sedeNombre: 'Distribuidora Duncan Caracas',
          participantes: [
            {
              empleadoId: 'emp_02',
              nombre: 'José Ramón Hernández',
              cedula: 'V-12450891',
              cargo: 'Chofer de Carga Pesada',
              esChofer: true,
              asistio: true,
              calificacion: 19,
              aprobado: true,
              fechaVencimiento: '2026-12-15' // Vigencia 60 días para choferes
            },
            {
              empleadoId: 'emp_chofer_01',
              nombre: 'Luis Alberto Gómez',
              cedula: 'V-16890451',
              cargo: 'Chofer de Camión',
              esChofer: true,
              asistio: true,
              calificacion: 18,
              aprobado: true,
              fechaVencimiento: '2026-12-15'
            }
          ]
        }
      ];
      setLocal(SK.CAPACITACIONES, list);
    }
    return list;
  },

  async saveCapacitacion(data: any): Promise<string> {
    const list = getLocal<any>(SK.CAPACITACIONES);
    const id = data.id || genId('cap');
    const count = list.length + 1;
    const prefix = data.tipo?.startsWith('RACDA') ? 'RACDA' : 'CURSO';
    const codigo = data.codigoCurso || `${prefix}-${new Date().getFullYear()}-${String(count).padStart(2, '0')}`;

    const item = {
      ...data,
      id,
      codigoCurso: codigo,
      fechaEjecucion: data.fechaEjecucion || new Date().toISOString().split('T')[0]
    };

    list.unshift(item);
    setLocal(SK.CAPACITACIONES, list);
    await this.logAction('CREATE', 'capacitaciones', id, `Capacitación registrada: ${codigo} - ${data.titulo}`);
    return id;
  },

  // ============================================================
  // CARGA DE FUEGO, INCENDIOS Y EXTINTORES (INCLUSIONES V2)
  // ============================================================
  async getCargasFuego(): Promise<CalculoCargaFuegoArea[]> {
    let list = getLocal<CalculoCargaFuegoArea>(SK.CARGAS_FUEGO);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'cf_01',
          sedeNombre: 'Distribuidora Duncan Caracas',
          areaNombre: 'Almacén Central de Baterías',
          superficieM2: 650,
          clasificacionRiesgo: 'EXTRA_ALTO',
          materiales: [
            {
              tipoMaterial: 'Plástico/Cajas Baterías',
              pesoTotalKg: 12000,
              poderCalorificoMcalKg: 9.5,
              caloriasSubtotalMcal: 114000
            },
            {
              tipoMaterial: 'Madera/Paletas',
              pesoTotalKg: 8500,
              poderCalorificoMcalKg: 4.5,
              caloriasSubtotalMcal: 38250
            },
            {
              tipoMaterial: 'Cartón/Embalaje',
              pesoTotalKg: 2000,
              poderCalorificoMcalKg: 4.0,
              caloriasSubtotalMcal: 8000
            }
          ],
          cargaTermicaTotalMcal: 160250,
          densidadCargaCalorificaMcalM2: 246.5,
          potencialExtintorRequerido: '4-A : 80-B:C',
          cantidadExtintoresRequerida: 8,
          cantidadExtintoresActuales: 8,
          deficitExtintores: 0,
          distanciaMaximaRecorridoMetros: 15,
          cumpleNorma: true,
          observaciones: 'Dotación completa según norma COVENIN 1040 y NFPA 10.'
        }
      ];
      setLocal(SK.CARGAS_FUEGO, list);
    }
    return list;
  },

  async saveCargaFuego(data: any): Promise<string> {
    const list = getLocal<any>(SK.CARGAS_FUEGO);
    const id = data.id || genId('cf');
    list.unshift({ ...data, id });
    setLocal(SK.CARGAS_FUEGO, list);
    return id;
  },

  async getInspeccionesCentralIncendio(): Promise<InspeccionCentralIncendio[]> {
    return getLocal<InspeccionCentralIncendio>(SK.CENTRALES_INCENDIO);
  },

  async saveInspeccionCentralIncendio(data: any): Promise<string> {
    const list = getLocal<any>(SK.CENTRALES_INCENDIO);
    const id = data.id || genId('ci');
    list.unshift({ ...data, id });
    setLocal(SK.CENTRALES_INCENDIO, list);
    return id;
  },

  async getExtintores(): Promise<ExtintorEquipo[]> {
    let list = getLocal<ExtintorEquipo>(SK.EXTINTORES);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'ext_01',
          sedeNombre: 'Distribuidora Duncan Caracas',
          codigoUbicacion: 'EXT-ALM-01',
          tipoAgente: 'PQS ABC',
          capacidadLbs: 20,
          fechaUltimaRecarga: '2026-03-10',
          fechaProximoVencimiento: '2027-03-10',
          diasParaVencer: 110,
          estatusSemaforo: 'VIGENTE',
          manometroPresionOk: true,
          precintoSeguridadOk: true,
          senalizacionVisible: true,
          alturaInstalacionMetros: 1.30
        },
        {
          id: 'ext_02',
          sedeNombre: 'Distribuidora Duncan Caracas',
          codigoUbicacion: 'EXT-CARG-02',
          tipoAgente: 'CO2',
          capacidadLbs: 15,
          fechaUltimaRecarga: '2026-01-15',
          fechaProximoVencimiento: '2027-01-15',
          diasParaVencer: 56,
          estatusSemaforo: 'PROXIMO_A_VENCER',
          manometroPresionOk: true,
          precintoSeguridadOk: true,
          senalizacionVisible: true,
          alturaInstalacionMetros: 1.25
        }
      ];
      setLocal(SK.EXTINTORES, list);
    }
    return list;
  },

  async saveExtintor(data: any): Promise<string> {
    const list = await this.getExtintores();
    const id = data.id || genId('ext');
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
    } else {
      list.push({ ...data, id });
    }
    setLocal(SK.EXTINTORES, list);
    return id;
  },

  async getPermisosBomberos(): Promise<PermisoBomberos[]> {
    let list = getLocal<PermisoBomberos>(SK.PERMISOS_BOMBEROS);
    if (!list || list.length === 0) {
      list = [
        {
          id: 'pb_01',
          empresaNombre: 'DISTRIBUIDORA DUNCAN, C.A.',
          localidadNombre: 'VALENCIA',
          establecimientoNombre: 'SERVICENTRO GUACARA',
          fechaEmision: '2025-10-10',
          fechaVencimiento: '2026-10-10',
          periodicidad: 'Anual',
          areaM2: 450,
          estado: 'Carabobo',
          municipio: 'Guacara',
          estatusVigencia: 'Vigente',
          diasRestantes: 320,
          numeroCertificado: 'CB-GUA-2025-089',
          cuerpoBomberos: 'Cuerpo de Bomberos del Municipio Guacara',
          contactoTelefono: '0245-5641234',
          contactoCorreo: 'bomberosguacara@gmail.com',
          observaciones: 'Inspección de prevención de incendios aprobada.',
          elaboradoPor: 'Ing. Carlos Mendoza (SSA)',
          revisadoPor: 'Gerencia General SSA Duncan'
        },
        {
          id: 'pb_02',
          empresaNombre: 'ACUMULADORES DUNCAN, C.A.',
          localidadNombre: 'DISTRIBUIDORA DUNCAN PORLAMAR',
          establecimientoNombre: 'SERVICENTRO DR. PORTILLO',
          fechaEmision: '2025-03-15',
          fechaVencimiento: '2026-03-15',
          periodicidad: 'Anual',
          areaM2: 520,
          estado: 'Zulia',
          municipio: 'Maracaibo',
          estatusVigencia: 'Próximo a Vencer',
          diasRestantes: 45,
          numeroCertificado: 'CBM-PREV-2025-144',
          cuerpoBomberos: 'Cuerpo de Bomberos de Maracaibo',
          contactoTelefono: '0261-7234567',
          contactoCorreo: 'prevencion@bomberosmaracaibo.gob.ve',
          observaciones: 'Renovación en trámite con pago de aranceles.',
          elaboradoPor: 'Ing. Elena Silva (SSA)',
          revisadoPor: 'Gerencia General SSA Duncan'
        }
      ];
      setLocal(SK.PERMISOS_BOMBEROS, list);
    }
    return list;
  },

  async savePermisoBomberos(data: any): Promise<string> {
    const list = await this.getPermisosBomberos();
    const id = data.id || genId('pb');
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
    } else {
      list.unshift({ ...data, id });
    }
    setLocal(SK.PERMISOS_BOMBEROS, list);
    return id;
  },

  // ============================================================
  // AUDITORÍA Y REGISTRO DE EVENTOS
  // ============================================================
  async logAction(action: string, resourceType: string, resourceId?: string, details = ''): Promise<void> {
    const logs = getLocal<any>(SK.AUDIT_LOGS);
    const user = gsApi.getCurrentUser()?.nombre || 'Usuario';
    const newLog = {
      id: genId('log'),
      _id: genId('log'),
      usuario: user,
      accion: `${action}_${resourceType.toUpperCase()}`,
      entidad: resourceType,
      entidadId: resourceId,
      detalles: details,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    setLocal(SK.AUDIT_LOGS, logs.slice(0, 300));
    gsApi.logAudit({ usuario: user, accion: newLog.accion, entidad: resourceType, entidadId: resourceId, detalles: details }).catch(console.error);
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return getLocal<AuditLog>(SK.AUDIT_LOGS);
  },

  async getReportesPDF(): Promise<ReportePDF[]> {
    return getLocal<ReportePDF>(SK.REPORTES_PDF);
  },

  async saveReportePDF(data: Omit<ReportePDF, 'id'>): Promise<string> {
    const list = getLocal<any>(SK.REPORTES_PDF);
    const id = genId('pdf');
    list.unshift({ ...data, id });
    setLocal(SK.REPORTES_PDF, list);
    return id;
  }
};
