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
  INITIAL_EMPLEADOS,
  INITIAL_EPP_INVENTARIO,
  INITIAL_LOTO_EQUIPOS,
  INITIAL_EVALUACIONES_MEDICAS,
} from '../data/seedData';
import type { Usuario, Role, Rol, Empleado } from '../types';

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
    || 'https://script.google.com/macros/s/AKfycbxRGmBAY7Msgz3eRGz2nGGaZs_wp0inmNPanRXANtVDGr2tjRJFpsQVud6NfFXmCI4AIQ/exec';
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
  const currentStoredUrl = localStorage.getItem(SK.SHEETS_URL);
  if (!currentStoredUrl || currentStoredUrl.includes('AKfycbwwhNM5')) {
    localStorage.setItem(SK.SHEETS_URL, 'https://script.google.com/macros/s/AKfycbxRGmBAY7Msgz3eRGz2nGGaZs_wp0inmNPanRXANtVDGr2tjRJFpsQVud6NfFXmCI4AIQ/exec');
  }
  if (!localStorage.getItem(SK.INSPECCIONES))     localStorage.setItem(SK.INSPECCIONES, '[]');
  if (!localStorage.getItem(SK.PLAN_ACCION))      localStorage.setItem(SK.PLAN_ACCION, '[]');
  if (!localStorage.getItem(SK.OFFLINE_QUEUE))    localStorage.setItem(SK.OFFLINE_QUEUE, '[]');
  if (!localStorage.getItem(SK.AUDIT_LOG))        localStorage.setItem(SK.AUDIT_LOG, '[]');
  if (!localStorage.getItem(SK.EMPLEADOS) || localStorage.getItem(SK.EMPLEADOS) === '[]') {
    localStorage.setItem(SK.EMPLEADOS, JSON.stringify(INITIAL_EMPLEADOS));
  }
  if (!localStorage.getItem(SK.EVALUACIONES_MED) || localStorage.getItem(SK.EVALUACIONES_MED) === '[]') {
    localStorage.setItem(SK.EVALUACIONES_MED, JSON.stringify(INITIAL_EVALUACIONES_MEDICAS));
  }
  if (!localStorage.getItem(SK.INVENTARIO_EPP) || localStorage.getItem(SK.INVENTARIO_EPP) === '[]') {
    localStorage.setItem(SK.INVENTARIO_EPP, JSON.stringify(INITIAL_EPP_INVENTARIO));
  }
  if (!localStorage.getItem(SK.SOLICITUDES_EPP))  localStorage.setItem(SK.SOLICITUDES_EPP, '[]');
  if (!localStorage.getItem(SK.LOTO_EQUIPOS) || localStorage.getItem(SK.LOTO_EQUIPOS) === '[]') {
    localStorage.setItem(SK.LOTO_EQUIPOS, JSON.stringify(INITIAL_LOTO_EQUIPOS));
  }
  if (!localStorage.getItem(SK.LOTO_BLOQUEOS))    localStorage.setItem(SK.LOTO_BLOQUEOS, '[]');
  if (!localStorage.getItem(SK.ESTABLECIMIENTOS)) localStorage.setItem(SK.ESTABLECIMIENTOS, JSON.stringify(INITIAL_ESTABLECIMIENTOS));
  try {
    let existing: Usuario[] = JSON.parse(localStorage.getItem(SK.USUARIOS) || '[]');
    // Asegurar que las cuentas administradoras maestras estén presentes con credenciales y rol correcto
    INITIAL_USUARIOS.forEach(admin => {
      const idx = existing.findIndex(u => u.email.toLowerCase() === admin.email.toLowerCase());
      if (idx === -1) {
        existing.push({ ...admin, activo: true });
      } else {
        existing[idx] = {
          ...existing[idx],
          ...admin,
          password: admin.password || existing[idx].password,
          rol: admin.rol || 'Propietario / Super Admin',
          activo: true
        };
      }
    });
    localStorage.setItem(SK.USUARIOS, JSON.stringify(existing));
  } catch {
    localStorage.setItem(SK.USUARIOS, JSON.stringify(INITIAL_USUARIOS));
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

export async function postGAS(action: string, payload: Record<string, any> = {}) {
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
    const currentLocal = getLocal<Usuario>(SK.USUARIOS);
    const localPassMap = new Map(currentLocal.map(u => [(u.email || '').trim().toLowerCase(), u.password]));

    if (remote && Array.isArray(remote) && remote.length > 0) {
      const merged: Usuario[] = remote.map((r: any) => ({
        ...r,
        password: r.password || localPassMap.get((r.email || '').trim().toLowerCase()) || ''
      }));

      // Garantizar que las cuentas maestras siempre figuren con sus credenciales maestras y rol
      INITIAL_USUARIOS.forEach(admin => {
        const adminEmail = admin.email.toLowerCase();
        const idx = merged.findIndex(u => (u.email || '').toLowerCase() === adminEmail);
        const preservedPass = localPassMap.get(adminEmail) || admin.password;
        const masterObj: Usuario = {
          ...admin,
          password: preservedPass,
          rol: admin.rol || 'Propietario / Super Admin',
          activo: true
        };
        if (idx === -1) {
          merged.unshift(masterObj);
        } else {
          merged[idx] = { ...merged[idx], ...masterObj };
        }
      });
      setLocal(SK.USUARIOS, merged);
      return merged;
    }
    return currentLocal;
  },

  async saveUsuario(usuario: Partial<Usuario>): Promise<{ success: boolean; id: string }> {
    const list = getLocal<Usuario>(SK.USUARIOS);
    const email = (usuario.email || '').trim().toLowerCase();
    const id = usuario._id || `usr_${Date.now()}`;
    const idx = list.findIndex(u => u._id === id || (email && u.email.toLowerCase() === email));

    const finalUser: Usuario = {
      _id: id,
      email: usuario.email || '',
      cedula: usuario.cedula || '',
      nombre: usuario.nombre || '',
      cargo: usuario.cargo || '',
      localidad: usuario.localidad || '',
      rol: usuario.rol || 'Inspector',
      password: usuario.password || 'Duncan2026*',
      activo: usuario.activo !== false,
      empresaId: usuario.empresaId,
      createdAt: (usuario as any).createdAt || new Date().toISOString()
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
    const emailLow = (email || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    if (!emailLow || !cleanPass) {
      return { success: false, message: 'Ingrese correo electrónico y contraseña.' };
    }

    // 1. Verificación directa contra cuentas maestras autorizadas (Cero latencia, nunca bloquea a dueños/devs)
    const masterAccount = INITIAL_USUARIOS.find(m => {
      if (m.email.toLowerCase() !== emailLow) return false;
      const passCleanLow = cleanPass.toLowerCase();
      if (emailLow === 'francisco.rojasp@gmail.com' || emailLow === 'sgssaduncan@gmail.com') {
        return (
          cleanPass === (m.password || '').trim() ||
          cleanPass === 'Leo150873#*$' ||
          cleanPass === 'Leo150873#*' ||
          cleanPass === 'Leo150873' ||
          cleanPass.startsWith('Leo150873') ||
          passCleanLow === 'duncan2026*' ||
          passCleanLow === 'panelas369*'
        );
      }
      if (emailLow === 'aabecerra852@gmail.com') {
        return (
          cleanPass === (m.password || '').trim() ||
          passCleanLow === 'panelas369*' ||
          passCleanLow === 'duncan2026*'
        );
      }
      if (emailLow === 'admin@duncan.com.ve') {
        return (
          cleanPass === (m.password || '').trim() ||
          passCleanLow === 'duncan2026*' ||
          passCleanLow === 'duncan2026'
        );
      }
      return (m.password || '').trim() === cleanPass;
    });
    if (masterAccount) {
      const fullMaster: Usuario = {
        ...masterAccount,
        rol: masterAccount.rol || 'Propietario / Super Admin',
        activo: true
      };
      // Actualizar/insertar en el almacenamiento local con su clave correcta
      const list = getLocal<Usuario>(SK.USUARIOS);
      const idx = list.findIndex(u => u.email.toLowerCase() === emailLow);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...fullMaster };
      } else {
        list.unshift(fullMaster);
      }
      setLocal(SK.USUARIOS, list);
      gsApi.setCurrentUser(fullMaster);
      return { success: true, user: fullMaster };
    }

    // 2. Verificación en caché local
    const list = getLocal<Usuario>(SK.USUARIOS);
    const localUser = list.find(u => u.email.toLowerCase() === emailLow && (u.password || '').trim() === cleanPass);
    if (localUser) {
      if (localUser.activo === false) {
        return { success: false, message: 'Esta cuenta se encuentra inactiva. Contacte al administrador del sistema.' };
      }
      gsApi.setCurrentUser(localUser);
      postGAS('login', { email: emailLow, password: cleanPass }).catch(() => {});
      return { success: true, user: localUser };
    }

    // 3. Verificación en vivo contra el backend de Google Sheets (GET y POST)
    try {
      // Intento A: GET login (inmune a CORS y redirecciones de Google Apps Script)
      const resGet: any = await fetchGAS('login', { email: emailLow, password: cleanPass });
      if (resGet && (resGet.success || resGet.status === 'success') && resGet.user) {
        const userData = resGet.user;
        const u: Usuario = {
          _id: userData._id || userData.id || `usr_${Date.now()}`,
          email: userData.email || emailLow,
          nombre: userData.nombre || emailLow.split('@')[0],
          rol: userData.rol || 'Inspector',
          password: cleanPass,
          activo: true
        };
        const updatedList = list.filter(x => x.email.toLowerCase() !== emailLow);
        updatedList.push(u);
        setLocal(SK.USUARIOS, updatedList);
        gsApi.setCurrentUser(u);
        return { success: true, user: u };
      }

      // Intento B: POST login
      const resPost = await postGAS('login', { email: emailLow, password: cleanPass });
      if (resPost && resPost.data && resPost.data.success && resPost.data.user) {
        const u: Usuario = {
          _id: resPost.data.user._id || resPost.data.user.id || `usr_${Date.now()}`,
          email: resPost.data.user.email || emailLow,
          nombre: resPost.data.user.nombre || emailLow.split('@')[0],
          rol: resPost.data.user.rol || 'Inspector',
          password: cleanPass,
          activo: true
        };
        const updatedList = list.filter(x => x.email.toLowerCase() !== emailLow);
        updatedList.push(u);
        setLocal(SK.USUARIOS, updatedList);
        gsApi.setCurrentUser(u);
        return { success: true, user: u };
      }

      // Intento C: Consulta directa de la tabla Usuarios de Google Sheets
      const tableRes = await fetchGAS('getTableData', { table: 'Usuarios' });
      if (tableRes && Array.isArray(tableRes)) {
        const matchedInSheet = tableRes.find(
          (row: any) => (row.email || '').trim().toLowerCase() === emailLow && String(row.password || '').trim() === cleanPass
        );
        if (matchedInSheet) {
          const u: Usuario = {
            _id: matchedInSheet._id || `usr_${Date.now()}`,
            email: matchedInSheet.email || emailLow,
            nombre: matchedInSheet.nombre || emailLow.split('@')[0],
            rol: matchedInSheet.rol || 'Inspector',
            password: cleanPass,
            activo: matchedInSheet.activo !== false && matchedInSheet.activo !== 'false'
          };
          const updatedList = list.filter(x => x.email.toLowerCase() !== emailLow);
          updatedList.push(u);
          setLocal(SK.USUARIOS, updatedList);
          gsApi.setCurrentUser(u);
          return { success: true, user: u };
        }
      }
    } catch (err) {
      console.warn('[AUTH] Error verificando contra backend Google Sheets:', err);
    }

    return { success: false, message: 'Credenciales inválidas. Verifique su correo electrónico y contraseña.' };
  },

  async registerUser(userData: {
    nombre: string;
    email: string;
    password: string;
    rol?: Rol;
    cargo?: string;
    cedula?: string;
    localidad?: string;
  }): Promise<{ success: boolean; user?: Usuario; message?: string }> {
    const emailClean = (userData.email || '').trim().toLowerCase();
    const cleanPass = (userData.password || '').trim();

    if (!userData.nombre || !userData.nombre.trim()) {
      return { success: false, message: 'El nombre completo es requerido.' };
    }

    if (!emailClean || !emailClean.includes('@')) {
      return { success: false, message: 'Ingrese una dirección de correo electrónico válida.' };
    }

    if (!emailClean.endsWith('@gmail.com')) {
      return { success: false, message: 'El registro en el sistema requiere una cuenta de correo Gmail (@gmail.com).' };
    }

    if (!cleanPass || cleanPass.length < 6) {
      return { success: false, message: 'La contraseña debe contener al menos 6 caracteres.' };
    }

    const list = getLocal<Usuario>(SK.USUARIOS);
    const existingIdx = list.findIndex(u => u.email.toLowerCase() === emailClean);

    if (existingIdx !== -1) {
      return { success: false, message: 'Este correo Gmail ya se encuentra registrado. Inicie sesión con su contraseña.' };
    }

    // Determinación de rol: cuentas clave son Super Admin
    const esAdmin = emailClean === 'aabecerra852@gmail.com' ||
                    emailClean === 'francisco.rojasp@gmail.com' ||
                    emailClean === 'sgssaduncan@gmail.com';
    const rolFinal: Rol = esAdmin ? 'Propietario / Super Admin' : (userData.rol || 'Inspector');

    const nuevoUsuario: Usuario = {
      _id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      email: emailClean,
      nombre: userData.nombre.trim(),
      rol: rolFinal,
      password: cleanPass,
      activo: true,
      cedula: userData.cedula?.trim(),
      cargo: userData.cargo?.trim() || (rolFinal === 'Propietario / Super Admin' ? 'Administrador del Sistema' : 'Inspector SSA'),
      localidad: userData.localidad?.trim() || 'Planta Principal Los Ruices',
      createdAt: new Date().toISOString()
    };

    list.push(nuevoUsuario);
    setLocal(SK.USUARIOS, list);
    this.setCurrentUser(nuevoUsuario);

    // Intento de sincronización con backend GAS
    postGAS('saveUsuario', nuevoUsuario).catch(() => {});
    await this.logAudit({
      usuario: nuevoUsuario.nombre,
      accion: 'REGISTRO_USUARIO',
      entidad: 'Usuarios',
      entidadId: nuevoUsuario._id,
      detalles: `Registro de nuevo usuario con cuenta Gmail: ${nuevoUsuario.nombre} (${nuevoUsuario.email}) - Rol: ${nuevoUsuario.rol}`,
    });

    return { success: true, user: nuevoUsuario };
  },

  getCurrentUser(): Usuario | null {
    try {
      const stored = localStorage.getItem(SK.CURRENT_USER);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  },

  setCurrentUser(user: Usuario | null) {
    if (user) {
      localStorage.setItem(SK.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(SK.CURRENT_USER);
    }
    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));
    } catch {}
  },

  logout() {
    this.setCurrentUser(null);
  },

  // ── RECUPERACIÓN DE USUARIO Y CONTRASEÑA (METODOLOGÍA COSTO CERO) ──

  findUserByCedula(cedulaQuery: string): {
    found: boolean;
    user?: Usuario;
    empleado?: Empleado;
    message?: string;
  } {
    const raw = (cedulaQuery || '').trim();
    if (!raw) {
      return { found: false, message: 'Por favor, ingrese un número de cédula de identidad.' };
    }

    const cleanNumbers = raw.replace(/[^0-9]/g, '');
    if (!cleanNumbers) {
      return { found: false, message: 'Formato de cédula inválido. Ingrese solo dígitos numéricos.' };
    }

    const usuarios = getLocal<Usuario>(SK.USUARIOS);
    const empleados = getLocal<Empleado>(SK.EMPLEADOS);

    // 1. Buscar en usuarios registrados por campo cedula
    let user = usuarios.find(u => {
      if (u.cedula) {
        return u.cedula.replace(/[^0-9]/g, '') === cleanNumbers;
      }
      return false;
    });

    // 2. Buscar en base de datos de trabajadores activos
    const empleado = empleados.find(e => {
      if (e.cedula) {
        return e.cedula.replace(/[^0-9]/g, '') === cleanNumbers;
      }
      return false;
    });

    // Si no se encontró usuario directo con cédula, pero sí en empleados, buscar usuario por nombre
    if (!user && empleado) {
      const empNombreWords = empleado.nombre.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      user = usuarios.find(u => {
        const uNom = u.nombre.toLowerCase();
        return empNombreWords.some(w => uNom.includes(w));
      });
      // Si se vinculó, actualizar la cédula del usuario en local
      if (user && !user.cedula) {
        user.cedula = empleado.cedula;
        const idx = usuarios.findIndex(x => x._id === user?._id);
        if (idx !== -1) {
          usuarios[idx] = user;
          setLocal(SK.USUARIOS, usuarios);
        }
      }
    }

    if (user) {
      return {
        found: true,
        user,
        empleado,
        message: `Cuenta de usuario localizada para ${user.nombre}.`
      };
    }

    if (empleado) {
      return {
        found: false,
        empleado,
        message: `El trabajador ${empleado.nombre} (C.I. ${empleado.cedula}) está en nómina activa de Duncan pero aún no ha registrado su cuenta de acceso.`
      };
    }

    return {
      found: false,
      message: 'No se localizó ningún registro de usuario o trabajador con la cédula ingresada.'
    };
  },

  findUserByEmail(emailQuery: string): Usuario | null {
    const clean = (emailQuery || '').trim().toLowerCase();
    if (!clean) return null;
    const usuarios = getLocal<Usuario>(SK.USUARIOS);
    return usuarios.find(u => u.email.toLowerCase() === clean) || null;
  },

  async resetPasswordWithIdentity(params: {
    email: string;
    cedula?: string;
    newPassword: string;
  }): Promise<{ success: boolean; user?: Usuario; message: string }> {
    const cleanEmail = (params.email || '').trim().toLowerCase();
    const cleanPass = (params.newPassword || '').trim();
    const cleanCedula = (params.cedula || '').replace(/[^0-9]/g, '');

    if (!cleanEmail) {
      return { success: false, message: 'El correo electrónico es requerido.' };
    }
    if (!cleanPass || cleanPass.length < 6) {
      return { success: false, message: 'La nueva contraseña debe contener al menos 6 caracteres.' };
    }

    const list = getLocal<Usuario>(SK.USUARIOS);
    const userIdx = list.findIndex(u => u.email.toLowerCase() === cleanEmail);

    if (userIdx === -1) {
      return { success: false, message: 'No existe ninguna cuenta registrada con este correo electrónico.' };
    }

    const user = list[userIdx];

    // Validación de identidad por cédula si la cuenta tiene cédula registrada
    if (user.cedula && cleanCedula) {
      const userCedClean = user.cedula.replace(/[^0-9]/g, '');
      if (userCedClean !== cleanCedula) {
        return { success: false, message: 'La cédula de identidad no coincide con los datos registrados para esta cuenta.' };
      }
    } else if (cleanCedula && !user.cedula) {
      user.cedula = `V-${cleanCedula}`;
    }

    user.password = cleanPass;
    list[userIdx] = user;
    setLocal(SK.USUARIOS, list);

    // Si coincide con usuario en sesión
    const current = this.getCurrentUser();
    if (current && current.email.toLowerCase() === cleanEmail) {
      this.setCurrentUser(user);
    }

    // Sincronización en segundo plano con Google Sheets (Costo Cero)
    postGAS('saveUsuario', user).catch(() => {});
    postGAS('recuperarPassword', {
      email: user.email,
      newPassword: cleanPass,
      cedula: user.cedula
    }).catch(() => {});

    // Registro de Auditoría Forense
    await this.logAudit({
      usuario: user.nombre,
      accion: 'RESTABLECER_CONTRASENA',
      entidad: 'Usuarios',
      entidadId: user._id,
      detalles: `Restablecimiento de contraseña por autogestión de usuario (Costo Cero): ${user.nombre} (${user.email})`,
    });

    return {
      success: true,
      user,
      message: '¡Contraseña restablecida exitosamente! Ya puede iniciar sesión con su nueva clave.'
    };
  },

  async requestRecoveryCode(emailQuery: string): Promise<{
    success: boolean;
    code?: string;
    message: string;
    sentViaEmail: boolean;
  }> {
    const cleanEmail = (emailQuery || '').trim().toLowerCase();
    const user = this.findUserByEmail(cleanEmail);
    if (!user) {
      return {
        success: false,
        sentViaEmail: false,
        message: 'No se encontró ninguna cuenta registrada con este correo electrónico.'
      };
    }

    // Generar código OTP de 6 dígitos aleatorio
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      sessionStorage.setItem('sgd_recovery_otp', JSON.stringify({
        email: cleanEmail,
        code,
        expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutos
      }));
    } catch {}

    let sentViaEmail = false;
    // Si hay conexión con backend Google Sheets / Apps Script, enviar correo GRATIS vía MailApp
    try {
      if (navigator.onLine && isSheetsConfigured()) {
        const gasRes = await postGAS('solicitarCodigoRecuperacion', {
          email: cleanEmail,
          code,
          nombre: user.nombre
        });
        if (gasRes && (gasRes.status === 'success' || gasRes.data?.status === 'success')) {
          sentViaEmail = true;
        }
      }
    } catch (e) {
      console.warn('Envío de correo GAS no completado (modo local/offline activo):', e);
    }

    return {
      success: true,
      code,
      sentViaEmail,
      message: sentViaEmail
        ? `Código enviado con éxito a su correo Gmail (${cleanEmail}). Revise su bandeja de entrada.`
        : `Código de seguridad generado para ${cleanEmail}. Puede usarlo de inmediato.`
    };
  },

  verifyRecoveryCode(emailQuery: string, inputCode: string): boolean {
    try {
      const stored = sessionStorage.getItem('sgd_recovery_otp');
      if (!stored) return false;
      const data = JSON.parse(stored);
      if (data.email === emailQuery.trim().toLowerCase() && data.code === inputCode.trim()) {
        if (Date.now() <= data.expiresAt) {
          return true;
        }
      }
    } catch {}
    return false;
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
