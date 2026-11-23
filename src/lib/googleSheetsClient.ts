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
// CLAVES DE ALMACENAMIENTO LOCAL Y SESIÓN (ZERO TRUST)
// ============================================================
const SK = {
  SHEETS_URL:        'sgd_sheets_url',
  SESSION_TOKEN:     'sgd_session_token',
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

export function getSessionToken(): string | null {
  try {
    return sessionStorage.getItem(SK.SESSION_TOKEN) || localStorage.getItem(SK.SESSION_TOKEN);
  } catch {
    return null;
  }
}

export function setSessionToken(token: string | null) {
  try {
    if (token) {
      sessionStorage.setItem(SK.SESSION_TOKEN, token);
      localStorage.setItem(SK.SESSION_TOKEN, token);
    } else {
      sessionStorage.removeItem(SK.SESSION_TOKEN);
      localStorage.removeItem(SK.SESSION_TOKEN);
    }
  } catch {}
}

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
    INITIAL_USUARIOS.forEach(admin => {
      const idx = existing.findIndex(u => u.email.toLowerCase() === admin.email.toLowerCase());
      if (idx === -1) {
        existing.push({ ...admin, activo: true });
      } else {
        existing[idx] = {
          ...existing[idx],
          nombre: admin.nombre,
          rol: admin.rol || existing[idx].rol || 'Inspector',
          activo: true
        };
        delete (existing[idx] as any).password;
      }
    });
    localStorage.setItem(SK.USUARIOS, JSON.stringify(existing));
  } catch {
    localStorage.setItem(SK.USUARIOS, JSON.stringify(INITIAL_USUARIOS));
  }
}
initLocalStorage();

// ============================================================
// HELPERS HTTP CON TOKEN DE SESIÓN HMAC-SHA256
// ============================================================
async function fetchGAS(action: string, params: Record<string, any> = {}) {
  const url = getSheetsUrl();
  if (!url) return null;
  try {
    const token = getSessionToken();
    const queryParams: Record<string, any> = { action, ...params };
    if (token) {
      queryParams.token = token;
    }
    const qs = new URLSearchParams(queryParams).toString();
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
  const token = getSessionToken();
  const bodyData = { action, ...(token ? { token } : {}), ...payload };

  if (!url) {
    enqueueOffline(action, bodyData);
    return { status: 'local_only' };
  }
  try {
    // GAS requiere text/plain para evitar preflight CORS
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(bodyData),
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn(`[GAS] POST ${action} falló. Encolando offline.`, err);
    enqueueOffline(action, bodyData);
    return { status: 'queued_offline' };
  }
}

// ============================================================
// COLA OFFLINE CON IDEMPOTENCIA
// ============================================================
function enqueueOffline(action: string, payload: Record<string, any>) {
  try {
    const q = JSON.parse(localStorage.getItem(SK.OFFLINE_QUEUE) || '[]');
    const transactionId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    q.push({
      id: transactionId,
      idempotencyKey: transactionId,
      action,
      payload,
      timestamp: new Date().toISOString()
    });
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
    const insps = getLocal<any>(SK.INSPECCIONES) || [];
    const plans = getLocal<any>(SK.PLAN_ACCION) || [];
    const conformes   = insps.filter((i: any) => i.resultado === 'C').length;
    const omCount     = insps.filter((i: any) => i.resultado === 'OM').length;
    const noConformes = insps.filter((i: any) => i.resultado === 'NC').length;
    // REGLA CRÍTICA: Cada OM vale 0.5 puntos positivos en la tasa de cumplimiento
    const puntosTotales = conformes + (omCount * 0.5);
    const tasa = insps.length > 0 ? Math.round((puntosTotales / insps.length) * 100) : 0;
    return {
      app: { name: 'SGD Duncan 2.0 (Offline)', version: '2.0.0' },
      catalogos: { empresas: INITIAL_EMPRESAS, localidades: INITIAL_LOCALIDADES, establecimientos: getLocal<any>(SK.ESTABLECIMIENTOS), tiposInspeccion: INITIAL_TIPOS_INSPECCION },
      usuarios: INITIAL_USUARIOS,
      stats: { totalInspecciones: insps.length, conformes, noConformes, observaciones: omCount, tasaCumplimiento: tasa },
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
    const sanitizeInsp = (i: any) => {
      if (!i) return i;
      // Si la puntuación es un timestamp ISO por desplazamiento de columna en hojas antiguas
      let rawPunt = i.puntuacion ?? i.puntos;
      let rawFecha = i.fecha;
      if (typeof rawPunt === 'string' && (rawPunt.includes('T') || rawPunt.includes('Z') || isNaN(Number(rawPunt)))) {
        if (!rawFecha) rawFecha = rawPunt;
        rawPunt = undefined;
      }

      // Normalizar nombre de empresa si contiene ID o nombre de formulario
      let empName = (i.empresaNombre || '').trim();
      if (!empName || empName === 'emp_ddca' || empName.toLowerCase().includes('lámpara') || empName.toLowerCase().includes('lampara')) {
        empName = 'Distribuidora Duncan, C.A.';
      }

      // Normalizar nombre de establecimiento si contiene ID
      let estName = (i.establecimientoNombre || '').trim();
      if (!estName || estName.startsWith('est_') || estName.startsWith('loc_')) {
        const targetId = i.establecimientoId || estName;
        const found = INITIAL_ESTABLECIMIENTOS.find(e => e._id === targetId || e.codigo === targetId || e._id?.toLowerCase() === String(targetId).toLowerCase());
        estName = found?.nombre || 'Distribuidora Duncan Valencia';
      }

      // Normalizar nombre de localidad si contiene ID
      let locName = (i.localidadNombre || '').trim();
      if (!locName || locName.startsWith('loc_') || locName === 'emp_ddca') {
        const found = INITIAL_LOCALIDADES.find(l => l._id === (i.localidadId || locName));
        locName = found?.nombre || 'Valencia';
      }

      // Normalizar tipo de inspección si contiene código de sede
      let tipoName = (i.tipoNombre || '').trim();
      let tipoCode = i.tipoCodigo;
      if (!tipoName || tipoName.startsWith('est_') || tipoName.startsWith('ti_') || tipoName === 'EST_DIST_VAL' || tipoName === 'GEN') {
        tipoCode = estName.toLowerCase().includes('distribuidora') ? 'DD' : 'SC';
        tipoName = tipoCode === 'DD' ? 'SSA Distribuidoras' : 'SSA Servicentros';
      }

      // Parsear respuestas en formato JSON seguro
      let respuestasObj: Record<string, any> = {};
      if (i.respuestas && typeof i.respuestas === 'object' && !Array.isArray(i.respuestas)) {
        respuestasObj = { ...i.respuestas };
      } else if (typeof i.respuestas === 'string') {
        try { const p = JSON.parse(i.respuestas); if (p && typeof p === 'object') respuestasObj = { ...p }; } catch {}
      }
      if (Object.keys(respuestasObj).length === 0 && i.formResponses) {
        if (typeof i.formResponses === 'object') respuestasObj = { ...i.formResponses };
        else if (typeof i.formResponses === 'string') {
          try { const p = JSON.parse(i.formResponses); if (p && typeof p === 'object') respuestasObj = { ...p }; } catch {}
        }
      }

      return {
        ...i,
        empresaNombre: empName,
        establecimientoNombre: estName,
        localidadNombre: locName,
        tipoNombre: tipoName,
        tipoCodigo: tipoCode,
        fecha: rawFecha || i.fecha,
        puntuacion: typeof rawPunt === 'number' ? rawPunt : (typeof i.puntuacion === 'number' ? i.puntuacion : undefined),
        respuestas: respuestasObj,
        formResponses: typeof i.formResponses === 'string' ? i.formResponses : JSON.stringify(respuestasObj)
      };
    };

    const remote = await fetchGAS('getInspecciones');
    if (remote && Array.isArray(remote)) {
      const sanitized = remote.map(sanitizeInsp);
      setLocal(SK.INSPECCIONES, sanitized);
      return sanitized;
    }
    const local = getLocal<any>(SK.INSPECCIONES) || [];
    return local.map(sanitizeInsp);
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
      formResponses: '{}', respuestas: {}, creadoPor: payload.inspector, actualizadoEn: new Date().toISOString(),
    };
    list.push(newInsp);
    setLocal(SK.INSPECCIONES, list);
    await postGAS('createInspeccion', { ...payload, ...newInsp });
    return newId;
  },

  async saveFormData(payload: { inspeccionId: string; responses: string; observations: string; additional: string; signatures: string; puntuacion: number; resultado: string; }) {
    const list = getLocal<any>(SK.INSPECCIONES);
    const idx = list.findIndex((i: any) => String(i._id) === String(payload.inspeccionId));
    
    let parsedResp: Record<string, any> = {};
    try { parsedResp = JSON.parse(payload.responses || '{}'); } catch {}

    if (idx !== -1) {
      list[idx] = { 
        ...list[idx], 
        formResponses: payload.responses,
        respuestas: parsedResp, 
        formObservations: payload.observations, 
        formAdditional: payload.additional, 
        formSignatures: payload.signatures, 
        puntuacion: payload.puntuacion, 
        resultado: payload.resultado, 
        actualizadoEn: new Date().toISOString() 
      };
      setLocal(SK.INSPECCIONES, list);
    }

    // Enviar con compatibilidad dual para Google Apps Script
    const gasPayload = {
      _id: payload.inspeccionId,
      id: payload.inspeccionId,
      inspeccionId: payload.inspeccionId,
      respuestas: parsedResp,
      responses: payload.responses,
      observaciones: payload.observations,
      observacionesGenerales: payload.observations,
      puntos: payload.puntuacion,
      puntuacion: payload.puntuacion,
      resultado: payload.resultado,
      firmas: payload.signatures ? JSON.parse(payload.signatures) : {},
      actualizadoEn: new Date().toISOString()
    };
    await postGAS('saveFormData', gasPayload);
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

    // 1. Verificación en el backend Google Apps Script mediante Zero Trust API
    try {
      const resPost = await postGAS('login', { email: emailLow, password: cleanPass });
      if (resPost && resPost.status === 'success' && resPost.data && resPost.data.token) {
        setSessionToken(resPost.data.token);
        const userData = resPost.data.user;
        const u: Usuario = {
          _id: userData._id || userData.id || `usr_${Date.now()}`,
          email: userData.email || emailLow,
          nombre: userData.nombre || emailLow.split('@')[0],
          cedula: userData.cedula || '',
          cargo: userData.cargo || '',
          localidad: userData.localidad || '',
          rol: userData.rol || 'Inspector',
          activo: true
        };

        const list = getLocal<Usuario>(SK.USUARIOS);
        const updatedList = list.filter(x => x.email.toLowerCase() !== emailLow);
        updatedList.push(u);
        setLocal(SK.USUARIOS, updatedList);
        gsApi.setCurrentUser(u);

        return { success: true, user: u };
      }

      if (resPost && resPost.status === 'error') {
        return { success: false, message: resPost.message || 'Credenciales inválidas.' };
      }
    } catch (err) {
      console.warn('[AUTH] Error validando con backend:', err);
    }

    // 2. Modo Resiliente Offline: solo si la sesión previa coincide exactamente con el usuario local
    const cur = gsApi.getCurrentUser();
    if (cur && cur.email.toLowerCase() === emailLow && getSessionToken()) {
      return { success: true, user: cur };
    }

    return { success: false, message: 'Credenciales inválidas o no se pudo validar la sesión con el servidor.' };
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

    if (!cleanPass || cleanPass.length < 8) {
      return { success: false, message: 'La contraseña debe contener al menos 8 caracteres.' };
    }

    const list = getLocal<Usuario>(SK.USUARIOS);
    const existingIdx = list.findIndex(u => u.email.toLowerCase() === emailClean);

    if (existingIdx !== -1) {
      return { success: false, message: 'Este correo ya se encuentra registrado. Inicie sesión con su contraseña.' };
    }

    const rolFinal: Rol = userData.rol || 'Inspector';

    const nuevoUsuario: Usuario = {
      _id: (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? `usr_${crypto.randomUUID()}`
        : 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      email: emailClean,
      nombre: userData.nombre.trim(),
      rol: rolFinal,
      activo: true,
      cedula: userData.cedula?.trim(),
      cargo: userData.cargo?.trim() || 'Inspector SSA',
      localidad: userData.localidad?.trim() || 'Planta Principal Los Ruices',
      createdAt: new Date().toISOString()
    };

    // Sincronización segura con backend GAS (con hash en servidor)
    const resPost = await postGAS('saveUsuario', {
      usuario: {
        ...nuevoUsuario,
        password: cleanPass
      }
    });

    if (resPost && resPost.status === 'success') {
      list.push(nuevoUsuario);
      setLocal(SK.USUARIOS, list);
      return { success: true, user: nuevoUsuario };
    }

    return { 
      success: false, 
      message: resPost?.message || 'No fue posible registrar el usuario en el servidor.' 
    };
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

  async logout() {
    setSessionToken(null);
    this.setCurrentUser(null);
    try {
      localStorage.removeItem(SK.CURRENT_USER);
      localStorage.removeItem(SK.USUARIOS);
      localStorage.removeItem(SK.EMPLEADOS);
      localStorage.removeItem(SK.EVALUACIONES_MED);
      sessionStorage.clear();
      if (typeof caches !== 'undefined') {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.filter(name => name.includes('google-sheets')).map(name => caches.delete(name))
        );
      }
    } catch (e) {
      console.warn('Aviso durante purga de logout:', e);
    }
  },

  // ── RECUPERACIÓN SEGURA DE ACCESO (ZERO-TRUST OTP) ──

  findUserAccount(query: string): {
    found: boolean;
    user?: Usuario;
    empleado?: Empleado;
    message?: string;
  } {
    // Protección contra enumeración pública de cuentas
    const cur = this.getCurrentUser();
    if (!cur) {
      return { found: false, message: 'La consulta directa de usuarios requiere una sesión activa con permisos de administración.' };
    }

    const raw = (query || '').trim();
    if (!raw) {
      return { found: false, message: 'Por favor, ingrese un criterio de búsqueda.' };
    }

    const rawLower = raw.toLowerCase();
    const cleanNumbers = raw.replace(/[^0-9]/g, '');
    const usuarios = getLocal<Usuario>(SK.USUARIOS);
    const empleados = getLocal<Empleado>(SK.EMPLEADOS);

    if (rawLower.includes('@')) {
      const u = usuarios.find(x => x.email.toLowerCase() === rawLower);
      if (u) {
        return {
          found: true,
          user: u,
          message: `Cuenta de usuario localizada para ${u.nombre}.`
        };
      }
    }

    const userByName = usuarios.find(u => (u.nombre || '').toLowerCase().includes(rawLower));
    if (userByName) {
      return {
        found: true,
        user: userByName,
        message: `Cuenta de usuario localizada para ${userByName.nombre}.`
      };
    }

    if (cleanNumbers.length >= 4) {
      const userByCed = usuarios.find(u => (u.cedula || '').replace(/[^0-9]/g, '') === cleanNumbers);
      if (userByCed) {
        return {
          found: true,
          user: userByCed,
          message: `Cuenta de usuario localizada para ${userByCed.nombre}.`
        };
      }

      const emp = empleados.find(e => (e.cedula || '').replace(/[^0-9]/g, '') === cleanNumbers);
      if (emp) {
        return {
          found: true,
          empleado: emp,
          message: `Trabajador localizado en nómina activa: ${emp.nombre}.`
        };
      }
    }

    return {
      found: false,
      message: 'No se localizó ninguna cuenta de usuario ni trabajador con los datos ingresados.'
    };
  },

  findUserByCedula(cedulaQuery: string) {
    return this.findUserAccount(cedulaQuery);
  },

  findUserByEmail(emailQuery: string): Usuario | null {
    const clean = (emailQuery || '').trim().toLowerCase();
    if (!clean) return null;
    const usuarios = getLocal<Usuario>(SK.USUARIOS);
    return usuarios.find(u => u.email.toLowerCase() === clean) || null;
  },

  async resetPasswordWithIdentity(params: {
    email: string;
    code?: string;
    cedula?: string;
    newPassword: string;
  }): Promise<{ success: boolean; user?: Usuario; message: string }> {
    const cleanEmail = (params.email || '').trim().toLowerCase();
    const cleanPass = (params.newPassword || '').trim();
    const otpCode = (params.code || '').trim();

    if (!cleanEmail) {
      return { success: false, message: 'El correo electrónico es requerido.' };
    }
    if (!cleanPass || cleanPass.length < 8) {
      return { success: false, message: 'La nueva contraseña debe contener al menos 8 caracteres.' };
    }
    if (!otpCode) {
      return { success: false, message: 'Se requiere el código de verificación OTP enviado a su correo.' };
    }

    // 1. Verificación y restablecimiento mediante backend seguro Apps Script
    try {
      const resPost = await postGAS('recuperarPassword', {
        email: cleanEmail,
        code: otpCode,
        newPassword: cleanPass
      });

      if (resPost && (resPost.status === 'success' || resPost.data?.status === 'success')) {
        const list = getLocal<Usuario>(SK.USUARIOS);
        const userIdx = list.findIndex(u => u.email.toLowerCase() === cleanEmail);
        let user: Usuario | undefined;
        if (userIdx !== -1) {
          user = list[userIdx];
          // Nunca almacenar contraseñas en texto plano
          delete user.password;
          list[userIdx] = user;
          setLocal(SK.USUARIOS, list);
        }

        await this.logAudit({
          usuario: user ? user.nombre : cleanEmail,
          accion: 'RESTABLECER_CONTRASENA',
          entidad: 'Usuarios',
          entidadId: user?._id || 'auth_reset',
          detalles: `Contraseña restablecida de forma segura vía OTP para ${cleanEmail}`,
        });

        return {
          success: true,
          user,
          message: '¡Contraseña restablecida exitosamente! Ya puede iniciar sesión con su nueva clave.'
        };
      }

      return {
        success: false,
        message: resPost?.message || 'Código OTP inválido o expirado. Solicite un nuevo código.'
      };
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || 'Error al comunicarse con el servidor de autenticación.'
      };
    }
  },

  async requestRecoveryCode(emailQuery: string): Promise<{
    success: boolean;
    code?: string;
    message: string;
    sentViaEmail: boolean;
  }> {
    const cleanEmail = (emailQuery || '').trim().toLowerCase();
    if (!cleanEmail) {
      return {
        success: false,
        sentViaEmail: false,
        message: 'Ingrese su dirección de correo electrónico.'
      };
    }

    try {
      const gasRes = await postGAS('solicitarCodigoRecuperacion', {
        email: cleanEmail
      });

      if (gasRes && (gasRes.status === 'success' || gasRes.data?.status === 'success')) {
        return {
          success: true,
          sentViaEmail: true,
          message: `Código de seguridad enviado a ${cleanEmail}. Revise su bandeja de entrada (y carpeta de spam).`
        };
      }

      return {
        success: false,
        sentViaEmail: false,
        message: gasRes?.message || 'No se pudo enviar el código de recuperación. Verifique su correo o intente más tarde.'
      };
    } catch (e) {
      return {
        success: false,
        sentViaEmail: false,
        message: 'No hay conexión con el servidor para emitir el código de recuperación.'
      };
    }
  },

  verifyRecoveryCode(emailQuery: string, inputCode: string): boolean {
    // La verificación real se ejecuta de forma segura y timing-safe en el backend
    return Boolean(emailQuery && inputCode && inputCode.trim().length === 6);
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
