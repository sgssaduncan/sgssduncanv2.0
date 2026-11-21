/**
 * SGD DUNCAN 2.0 — CLIENTE GOOGLE SHEETS / GOOGLE APPS SCRIPT
 * -------------------------------------------------------------------
 * Gestiona la comunicación con la Web App de Google Apps Script,
 * el almacenamiento local (cache offline) y la cola de sincronización.
 * 
 * ARQUITECTURA:
 *   PWA → localStorage (inmediato, optimistic) → GAS Web App → Google Sheets
 *   Si no hay conexión: → cola offline → sincroniza al reconectar
 */

import {
  INITIAL_EMPRESAS,
  INITIAL_LOCALIDADES,
  INITIAL_ESTABLECIMIENTOS,
  INITIAL_TIPOS_INSPECCION,
  INITIAL_USUARIOS,
} from '../data/seedData';
import type { Usuario } from '../types';

// ============================================================
// CLAVES DE ALMACENAMIENTO LOCAL
// ============================================================
const SK = {
  SHEETS_URL:        'sgd_sheets_url',
  INSPECCIONES:      'sgd_inspecciones',
  PLAN_ACCION:       'sgd_plan_accion',
  OFFLINE_QUEUE:     'sgd_offline_queue',
  AUDIT_LOG:         'sgd_audit_log',
  EMPLEADOS:         'sgd_empleados',
  ESTABLECIMIENTOS:  'sgd_establecimientos',
  USUARIOS:          'sgd_usuarios',
  CURRENT_USER:      'sgd_current_user',
  EVALUACIONES_MED:  'sgd_evaluaciones_med',
  INVENTARIO_EPP:    'sgd_inventario_epp',
  SOLICITUDES_EPP:   'sgd_solicitudes_epp',
  LOTO_EQUIPOS:      'sgd_loto_equipos',
  LOTO_BLOQUEOS:     'sgd_loto_bloqueos',
};

// ============================================================
// CONFIGURACIÓN DE URL
// ============================================================
export function getSheetsUrl(): string {
  return localStorage.getItem(SK.SHEETS_URL)
    || ((import.meta as any).env?.VITE_GOOGLE_SHEETS_URL as string)
    || '';
}

export function setSheetsUrl(url: string) {
  if (url?.trim()) {
    localStorage.setItem(SK.SHEETS_URL, url.trim());
  } else {
    localStorage.removeItem(SK.SHEETS_URL);
  }
}

export function isSheetsConfigured(): boolean {
  return Boolean(getSheetsUrl());
}

// ============================================================
// INICIALIZACIÓN LOCAL
// ============================================================
function initLocalStorage() {
  if (!localStorage.getItem(SK.INSPECCIONES))     localStorage.setItem(SK.INSPECCIONES, '[]');
  if (!localStorage.getItem(SK.PLAN_ACCION))      localStorage.setItem(SK.PLAN_ACCION, '[]');
  if (!localStorage.getItem(SK.OFFLINE_QUEUE))    localStorage.setItem(SK.OFFLINE_QUEUE, '[]');
  if (!localStorage.getItem(SK.AUDIT_LOG))        localStorage.setItem(SK.AUDIT_LOG, '[]');
  if (!localStorage.getItem(SK.EMPLEADOS))        localStorage.setItem(SK.EMPLEADOS, '[]');
  if (!localStorage.getItem(SK.EVALUACIONES_MED)) localStorage.setItem(SK.EVALUACIONES_MED, '[]');
  if (!localStorage.getItem(SK.INVENTARIO_EPP))   localStorage.setItem(SK.INVENTARIO_EPP, '[]');
  if (!localStorage.getItem(SK.SOLICITUDES_EPP))  localStorage.setItem(SK.SOLICITUDES_EPP, '[]');
  if (!localStorage.getItem(SK.LOTO_EQUIPOS))     localStorage.setItem(SK.LOTO_EQUIPOS, '[]');
  if (!localStorage.getItem(SK.LOTO_BLOQUEOS))    localStorage.setItem(SK.LOTO_BLOQUEOS, '[]');
  if (!localStorage.getItem(SK.ESTABLECIMIENTOS)) localStorage.setItem(SK.ESTABLECIMIENTOS, JSON.stringify(INITIAL_ESTABLECIMIENTOS));
  try {
    let existing: Usuario[] = JSON.parse(localStorage.getItem(SK.USUARIOS) || '[]');
    // Asegurar que Francisco y Sgssa estén presentes con credenciales y rol correcto
    INITIAL_USUARIOS.forEach(admin => {
      const idx = existing.findIndex(u => u.email.toLowerCase() === admin.email.toLowerCase());
      if (idx === -1) {
        existing.push(admin);
      } else {
        existing[idx] = { ...existing[idx], ...admin };
      }
    });
    localStorage.setItem(SK.USUARIOS, JSON.stringify(existing));
  } catch {
    localStorage.setItem(SK.USUARIOS, JSON.stringify(INITIAL_USUARIOS));
  }

  // Inicializar usuario activo por defecto
  if (!localStorage.getItem(SK.CURRENT_USER)) {
    localStorage.setItem(SK.CURRENT_USER, JSON.stringify(INITIAL_USUARIOS[0]));
  }
}
initLocalStorage();

// ============================================================
// HELPERS HTTP
// ============================================================
async function fetchGAS(action: string, params: Record<string, any> = {}) {
  const url = getSheetsUrl();
  if (!url) return null;
  try {
    const qs = new URLSearchParams({ action, ...params }).toString();
    const res = await fetch(`${url}?${qs}`, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.status === 'success' ? json.data : null;
  } catch (err) {
    console.warn(`[GAS] GET ${action} falló. Usando local.`, err);
    return null;
  }
}

async function postGAS(action: string, payload: Record<string, any> = {}) {
  const url = getSheetsUrl();
  if (!url) {
    enqueueOffline(action, payload);
    return { status: 'local_only' };
  }
  try {
    // GAS requiere text/plain para evitar preflight CORS
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn(`[GAS] POST ${action} falló. Encolando offline.`, err);
    enqueueOffline(action, payload);
    return { status: 'queued_offline' };
  }
}

// ============================================================
// COLA OFFLINE
// ============================================================
function enqueueOffline(action: string, payload: Record<string, any>) {
  try {
    const q = JSON.parse(localStorage.getItem(SK.OFFLINE_QUEUE) || '[]');
    q.push({ id: `q_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, action, payload, timestamp: new Date().toISOString() });
    localStorage.setItem(SK.OFFLINE_QUEUE, JSON.stringify(q));
  } catch (e) {
    console.error('Error encolando offline:', e);
  }
}

export function getOfflineQueueCount(): number {
  try { return JSON.parse(localStorage.getItem(SK.OFFLINE_QUEUE) || '[]').length; }
  catch { return 0; }
}

export async function syncOfflineQueue(): Promise<{ synced: number; remaining: number }> {
  const url = getSheetsUrl();
  if (!url || !navigator.onLine) return { synced: 0, remaining: getOfflineQueueCount() };
  let queue = JSON.parse(localStorage.getItem(SK.OFFLINE_QUEUE) || '[]');
  if (!queue.length) return { synced: 0, remaining: 0 };
  let synced = 0;
  const remaining: any[] = [];
  for (const item of queue) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: item.action, ...item.payload }),
      });
      if (res.ok) synced++; else remaining.push(item);
    } catch { remaining.push(item); }
  }
  localStorage.setItem(SK.OFFLINE_QUEUE, JSON.stringify(remaining));
  return { synced, remaining: remaining.length };
}

// ============================================================
// UTILIDADES LOCALES
// ============================================================
function getLocal<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}
function setLocal(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}
function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
}

// ============================================================
// API PÚBLICA
// ============================================================
export const gsApi = {

  // ── CATÁLOGOS ─────────────────────────────────────────────
  getCatalogos() {
    return {
      empresas: INITIAL_EMPRESAS,
      localidades: INITIAL_LOCALIDADES,
      establecimientos: getLocal<any>(SK.ESTABLECIMIENTOS),
      tiposInspeccion: INITIAL_TIPOS_INSPECCION,
    };
  },

  // ── DASHBOARD ─────────────────────────────────────────────
  async getInitData() {
    const remote = await fetchGAS('getInitData');
    if (remote) {
      if (remote.catalogos?.establecimientos) setLocal(SK.ESTABLECIMIENTOS, remote.catalogos.establecimientos);
      if (remote.inspeccionesRecientes) setLocal(SK.INSPECCIONES, remote.inspeccionesRecientes);
      return remote;
    }
    const insps = getLocal<any>(SK.INSPECCIONES);
    const plans = getLocal<any>(SK.PLAN_ACCION);
    const conformes   = insps.filter((i: any) => i.resultado === 'C').length;
    const noConformes = insps.filter((i: any) => i.resultado === 'NC' || i.resultado === 'OM').length;
    const tasa = insps.length > 0 ? Math.round((conformes / insps.length) * 100) : 0;
    return {
      app: { name: 'SGD Duncan 2.0 (Offline)', version: '2.0.0' },
      catalogos: { empresas: INITIAL_EMPRESAS, localidades: INITIAL_LOCALIDADES, establecimientos: getLocal<any>(SK.ESTABLECIMIENTOS), tiposInspeccion: INITIAL_TIPOS_INSPECCION },
      usuarios: INITIAL_USUARIOS,
      stats: { totalInspecciones: insps.length, conformes, noConformes, tasaCumplimiento: tasa },
      planStats: {
        total: plans.length,
        pendientes:   plans.filter((p: any) => p.estado === 'pendiente').length,
        enEjecucion:  plans.filter((p: any) => p.estado === 'en_ejecucion').length,
        cerradas:     plans.filter((p: any) => p.estado === 'cerrada').length,
        vencidas:     plans.filter((p: any) => p.estado === 'vencida' || (p.fechaLimite && new Date(p.fechaLimite) < new Date() && p.estado !== 'cerrada')).length,
      },
      inspeccionesRecientes: insps.slice(-5).reverse(),
    };
  },

  // ── INSPECCIONES ──────────────────────────────────────────
  async listInspecciones() {
    const remote = await fetchGAS('getInspecciones');
    if (remote && Array.isArray(remote)) { setLocal(SK.INSPECCIONES, remote); return remote; }
    return getLocal<any>(SK.INSPECCIONES);
  },

  async getInspeccion(id: string) {
    if (!id) return null;
    const remote = await fetchGAS('getInspeccion', { id });
    if (remote) return remote;
    return getLocal<any>(SK.INSPECCIONES).find((i: any) => String(i._id) === String(id)) || null;
  },

  async createInspeccion(payload: { empresaId: string; localidadId: string; establecimientoId: string; tipoInspeccionId: string; fecha: string; inspector: string; observaciones?: string; }) {
    const ests    = getLocal<any>(SK.ESTABLECIMIENTOS);
    const est     = ests.find((e: any) => e._id === payload.establecimientoId) || {};
    const tipo    = INITIAL_TIPOS_INSPECCION.find(t => t._id === payload.tipoInspeccionId) || {} as any;
    const loc     = INITIAL_LOCALIDADES.find(l => l._id === payload.localidadId) || {} as any;
    const emp     = INITIAL_EMPRESAS.find(e => e._id === payload.empresaId) || INITIAL_EMPRESAS[0];
    const list    = getLocal<any>(SK.INSPECCIONES);
    const newId   = genId('insp');
    const correl  = 1000 + list.length + 1;
    const newInsp = {
      _id: newId, correlativo: correl,
      empresaId: emp._id, empresaNombre: emp.nombre,
      localidadId: loc._id || payload.localidadId, localidadNombre: loc.nombre || est.localidadNombre || 'General',
      establecimientoId: payload.establecimientoId, establecimientoNombre: est.nombre || 'Establecimiento',
      tipoInspeccionId: payload.tipoInspeccionId, tipoNombre: tipo.nombre || 'Inspección', tipoCodigo: tipo.codigo || 'GEN',
      fecha: payload.fecha, inspector: payload.inspector,
      estado: 'en_progreso', resultado: undefined, puntuacion: undefined,
      observaciones: payload.observaciones || '',
      formResponses: '{}', creadoPor: payload.inspector, actualizadoEn: new Date().toISOString(),
    };
    list.push(newInsp);
    setLocal(SK.INSPECCIONES, list);
    await postGAS('createInspeccion', { ...payload, ...newInsp });
    return newId;
  },

  async saveFormData(payload: { inspeccionId: string; responses: string; observations: string; additional: string; signatures: string; puntuacion: number; resultado: string; }) {
    const list = getLocal<any>(SK.INSPECCIONES);
    const idx = list.findIndex((i: any) => String(i._id) === String(payload.inspeccionId));
    if (idx !== -1) {
      list[idx] = { ...list[idx], formResponses: payload.responses, formObservations: payload.observations, formAdditional: payload.additional, formSignatures: payload.signatures, puntuacion: payload.puntuacion, resultado: payload.resultado, actualizadoEn: new Date().toISOString() };
      setLocal(SK.INSPECCIONES, list);
    }
    await postGAS('saveFormData', payload);
    return true;
  },

  async completeInspeccion(payload: { id: string }) {
    const list = getLocal<any>(SK.INSPECCIONES);
    const idx  = list.findIndex((i: any) => String(i._id) === String(payload.id));
    if (idx !== -1) {
      list[idx].estado = 'completada';
      list[idx].actualizadoEn = new Date().toISOString();
      setLocal(SK.INSPECCIONES, list);
      // Auto-generar plan de acción por NC/OM
      try {
        const responses = JSON.parse(list[idx].formResponses || '{}');
        const plans = getLocal<any>(SK.PLAN_ACCION);
        const hoy = new Date().toISOString().split('T')[0];
        const limite = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
        for (const [key, val] of Object.entries(responses)) {
          if (val === 'NC' || val === 'OM') {
            plans.push({
              _id: genId('plan'), inspeccionId: payload.id,
              empresaNombre: list[idx].empresaNombre, establecimientoNombre: list[idx].establecimientoNombre,
              tipoInspeccionCodigo: list[idx].tipoCodigo, tipoInspeccionNombre: list[idx].tipoNombre,
              item: key, seccion: 'Hallazgo en campo',
              hallazgo: `${val} en ítem: ${key}`,
              descripcion: `Subsanar no conformidad en inspección ${list[idx].tipoNombre}.`,
              responsable: 'Supervisor de Sede', departamento: 'Operaciones',
              fechaDeteccion: hoy, fechaLimite: limite,
              prioridad: val === 'OM' ? 'Critica' : 'Media', estado: 'pendiente',
              notas: `Auto-generado desde ${list[idx].establecimientoNombre}`,
            });
          }
        }
        setLocal(SK.PLAN_ACCION, plans);
      } catch (e) { console.error('Error generando plan local:', e); }
    }
    await postGAS('completeInspeccion', payload);
    return true;
  },

  async deleteInspeccion(payload: { id: string }) {
    let list = getLocal<any>(SK.INSPECCIONES);
    list = list.filter((i: any) => String(i._id) !== String(payload.id));
    setLocal(SK.INSPECCIONES, list);
    await postGAS('deleteInspeccion', payload);
    return true;
  },

  // ── PLAN DE ACCIÓN ────────────────────────────────────────
  async listPlanAccion() {
    const remote = await fetchGAS('getPlanAccion');
    if (remote && Array.isArray(remote)) { setLocal(SK.PLAN_ACCION, remote); return remote; }
    return getLocal<any>(SK.PLAN_ACCION);
  },

  async updatePlanAccion(payload: { id: string; estado: string; notas?: string }) {
    const list = getLocal<any>(SK.PLAN_ACCION);
    const idx  = list.findIndex((p: any) => String(p._id) === String(payload.id));
    if (idx !== -1) { list[idx].estado = payload.estado; if (payload.notas) list[idx].notas = payload.notas; setLocal(SK.PLAN_ACCION, list); }
    await postGAS('updatePlanAccion', payload);
    return true;
  },

  // ── EMPLEADOS ─────────────────────────────────────────────
  async listEmpleados(q?: string) {
    if (q) {
      const remote = await fetchGAS('getEmpleados', { q });
      if (remote) return remote;
    }
    const all = getLocal<any>(SK.EMPLEADOS);
    if (!q) return all;
    const qLow = q.toLowerCase();
    return all.filter((e: any) => e.nombre?.toLowerCase().includes(qLow) || String(e.cedula).includes(qLow) || e.cargo?.toLowerCase().includes(qLow));
  },

  // ── AUDITORÍA ─────────────────────────────────────────────
  async logAudit(payload: { usuario: string; accion: string; entidad?: string; entidadId?: string; detalles?: string }) {
    const logs = getLocal<any>(SK.AUDIT_LOG);
    logs.push({ ...payload, _id: genId('aud'), timestamp: new Date().toISOString() });
    setLocal(SK.AUDIT_LOG, logs.slice(-200));
    await postGAS('logAudit', payload);
  },

  getAuditLogs() {
    return getLocal<any>(SK.AUDIT_LOG).reverse();
  },

  // ── USUARIOS Y AUTENTICACIÓN ──────────────────────────────
  getUsuarios(): Usuario[] {
    return getLocal<Usuario>(SK.USUARIOS);
  },

  async listUsuarios(): Promise<Usuario[]> {
    const remote = await fetchGAS('getUsuarios');
    if (remote && Array.isArray(remote) && remote.length > 0) {
      const merged: Usuario[] = [...remote];
      // Garantizar que los dos propietarios siempre figuren con sus credenciales maestras
      INITIAL_USUARIOS.forEach(admin => {
        const idx = merged.findIndex(u => u.email.toLowerCase() === admin.email.toLowerCase());
        if (idx === -1) {
          merged.unshift(admin);
        } else {
          merged[idx] = { ...merged[idx], rol: 'Propietario / Super Admin', activo: true };
        }
      });
      setLocal(SK.USUARIOS, merged);
      return merged;
    }
    return getLocal<Usuario>(SK.USUARIOS);
  },

  async saveUsuario(usuario: Partial<Usuario>): Promise<{ success: boolean; id: string }> {
    const list = getLocal<Usuario>(SK.USUARIOS);
    const email = (usuario.email || '').trim().toLowerCase();
    const id = usuario._id || `usr_${Date.now()}`;
    const idx = list.findIndex(u => u._id === id || (email && u.email.toLowerCase() === email));

    const finalUser: Usuario = {
      _id: id,
      email: usuario.email || '',
      nombre: usuario.nombre || '',
      rol: usuario.rol || 'Inspector',
      password: usuario.password || 'Duncan2026*',
      activo: usuario.activo !== false,
      empresaId: usuario.empresaId,
    };

    if (idx !== -1) {
      list[idx] = { ...list[idx], ...finalUser };
    } else {
      list.push(finalUser);
    }
    setLocal(SK.USUARIOS, list);

    // Si se modificó el usuario actualmente logueado, actualizar sesión
    const cur = gsApi.getCurrentUser();
    if (cur && (cur._id === id || cur.email.toLowerCase() === email)) {
      gsApi.setCurrentUser({ ...cur, ...finalUser });
    }

    await postGAS('saveUsuario', finalUser);
    await gsApi.logAudit({
      usuario: gsApi.getCurrentUser()?.nombre || 'Sistema',
      accion: idx !== -1 ? 'EDITAR_USUARIO' : 'CREAR_USUARIO',
      entidad: 'Usuarios',
      entidadId: id,
      detalles: `Usuario: ${finalUser.nombre} (${finalUser.email}), Rol: ${finalUser.rol}`,
    });

    return { success: true, id };
  },

  async deleteUsuario(id: string): Promise<{ success: boolean; message?: string }> {
    const list = getLocal<Usuario>(SK.USUARIOS);
    const target = list.find(u => u._id === id);
    if (!target) return { success: false, message: 'Usuario no encontrado' };

    const emailLow = target.email.toLowerCase();
    if (emailLow === 'francisco.rojasp@gmail.com' || emailLow === 'sgssaduncan@gmail.com') {
      return { success: false, message: 'No se puede eliminar una cuenta principal de Propietario / Super Admin' };
    }

    const filtered = list.filter(u => u._id !== id);
    setLocal(SK.USUARIOS, filtered);

    await postGAS('deleteUsuario', { id });
    await gsApi.logAudit({
      usuario: gsApi.getCurrentUser()?.nombre || 'Sistema',
      accion: 'ELIMINAR_USUARIO',
      entidad: 'Usuarios',
      entidadId: id,
      detalles: `Usuario eliminado: ${target.nombre} (${target.email})`,
    });

    return { success: true };
  },

  async login(email: string, pass: string): Promise<{ success: boolean; user?: Usuario; message?: string }> {
    const emailLow = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 1. Verificación local inmediata (funciona 100% offline y con cero latencia)
    const list = getLocal<Usuario>(SK.USUARIOS);
    const localUser = list.find(u => u.email.toLowerCase() === emailLow && (u.password || '') === cleanPass);

    if (localUser) {
      if (localUser.activo === false) {
        return { success: false, message: 'Esta cuenta se encuentra inactiva. Contacte al administrador.' };
      }
      gsApi.setCurrentUser(localUser);
      // Intento en segundo plano de sincronizar con GAS
      postGAS('login', { email: emailLow, password: cleanPass }).catch(() => {});
      return { success: true, user: localUser };
    }

    // 2. Si no coincide localmente, intentar con el backend remoto si hay red
    try {
      const res = await postGAS('login', { email: emailLow, password: cleanPass });
      if (res && res.data && res.data.success && res.data.user) {
        const u = res.data.user;
        gsApi.setCurrentUser(u);
        return { success: true, user: u };
      }
    } catch {}

    return { success: false, message: 'Correo o contraseña incorrectos' };
  },

  getCurrentUser(): Usuario | null {
    try {
      const stored = localStorage.getItem(SK.CURRENT_USER);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_USUARIOS[0];
  },

  setCurrentUser(user: Usuario | null) {
    if (user) {
      localStorage.setItem(SK.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(SK.CURRENT_USER);
    }
  },

  logout() {
    localStorage.removeItem(SK.CURRENT_USER);
  },

  // ── EPP / DOTACIÓN ────────────────────────────────────────
  getInventarioEPP() { return getLocal<any>(SK.INVENTARIO_EPP); },
  getSolicitudesEPP() { return getLocal<any>(SK.SOLICITUDES_EPP); },

  // ── LOTO ──────────────────────────────────────────────────
  getLotoEquipos() { return getLocal<any>(SK.LOTO_EQUIPOS); },
  getLotoBloqueos() { return getLocal<any>(SK.LOTO_BLOQUEOS); },

  // ── EVALUACIONES MÉDICAS ──────────────────────────────────
  getEvaluacionesMedicas() { return getLocal<any>(SK.EVALUACIONES_MED); },
};
