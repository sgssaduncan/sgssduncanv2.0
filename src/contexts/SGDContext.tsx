import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  gsApi, getSheetsUrl, setSheetsUrl, isSheetsConfigured,
  getOfflineQueueCount, syncOfflineQueue,
} from '../lib/googleSheetsClient';
import { INITIAL_EMPRESAS, INITIAL_LOCALIDADES, INITIAL_TIPOS_INSPECCION } from '../data/seedData';
import { auditService } from '../services/auditService';
import type { Inspeccion, PlanAccion, Empresa, Localidad, Establecimiento, TipoInspeccion, Empleado, Usuario, DashboardStats, PlanStats, Role, Rol } from '../types';

interface SGDContextType {
  // Datos
  inspecciones: Inspeccion[];
  planAccion: PlanAccion[];
  stats: DashboardStats;
  planStats: PlanStats;
  empresas: Empresa[];
  localidades: Localidad[];
  establecimientos: Establecimiento[];
  tiposInspeccion: TipoInspeccion[];
  empleados: Empleado[];
  usuarios: Usuario[];
  currentUser: Usuario | null;
  // Conexión
  isOnline: boolean;
  isConfigured: boolean;
  sheetsUrl: string;
  pendingSyncCount: number;
  isSyncing: boolean;
  // Acciones
  updateSheetsUrl: (url: string) => void;
  syncNow: () => Promise<void>;
  refreshData: () => Promise<void>;
  createInspeccion: (payload: any) => Promise<string>;
  saveFormData: (payload: any) => Promise<boolean>;
  completeInspeccion: (id: string, extraData?: any) => Promise<boolean>;
  deleteInspeccion: (id: string) => Promise<boolean>;
  updatePlanAccion: (payload: any) => Promise<boolean>;
  logAudit: (payload: any) => Promise<void>;
  getInspeccionById: (id: string) => Inspeccion | undefined;
  // Usuarios y Sesión
  login: (email: string, pass: string) => Promise<{ success: boolean; user?: Usuario; message?: string }>;
  register: (userData: {
    nombre: string;
    email: string;
    password: string;
    rol?: Rol;
    cargo?: string;
    cedula?: string;
    localidad?: string;
  }) => Promise<{ success: boolean; user?: Usuario; message?: string }>;
  logout: () => void;
  switchUser: (u: Usuario) => void;
  saveUsuario: (u: Partial<Usuario>) => Promise<{ success: boolean; id?: string; message?: string }>;
  deleteUsuario: (id: string) => Promise<{ success: boolean; message?: string }>;
  // Recuperación Costo Cero
  findUserAccount: (query: string) => { found: boolean; user?: Usuario; empleado?: Empleado; message?: string };
  findUserByCedula: (cedula: string) => { found: boolean; user?: Usuario; empleado?: Empleado; message?: string };
  findUserByEmail: (email: string) => Usuario | null;
  resetPasswordWithIdentity: (params: { email: string; code?: string; cedula?: string; newPassword: string }) => Promise<{ success: boolean; user?: Usuario; message: string }>;
  requestRecoveryCode: (email: string) => Promise<{ success: boolean; code?: string; message: string; sentViaEmail: boolean }>;
  verifyRecoveryCode: (email: string, code: string) => boolean;
}

const SGDContext = createContext<SGDContextType | null>(null);

export function SGDProvider({ children }: { children: React.ReactNode }) {
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [planAccion, setPlanAccion] = useState<PlanAccion[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalInspecciones: 0, conformes: 0, noConformes: 0, tasaCumplimiento: 0 });
  const [planStats, setPlanStats] = useState<PlanStats>({ total: 0, pendientes: 0, enEjecucion: 0, cerradas: 0, vencidas: 0 });
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>(gsApi.getCatalogos().establecimientos);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => gsApi.getUsuarios());
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => gsApi.getCurrentUser());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sheetsUrl, setSheetsUrlState] = useState(getSheetsUrl());
  const [pendingSyncCount, setPendingSyncCount] = useState(getOfflineQueueCount());
  const [isSyncing, setIsSyncing] = useState(false);
  const syncInProgress = useRef(false);

  useEffect(() => {
    const handleAuthChanged = () => {
      const u = gsApi.getCurrentUser();
      setCurrentUser(u);
    };
    window.addEventListener('auth-changed', handleAuthChanged);
    window.addEventListener('storage', handleAuthChanged);
    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged);
      window.removeEventListener('storage', handleAuthChanged);
    };
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const init = await gsApi.getInitData();
      if (init) {
        if (init.stats) setStats(init.stats);
        if (init.planStats) setPlanStats(init.planStats);
        if (init.catalogos?.establecimientos) setEstablecimientos(init.catalogos.establecimientos);
      }
      const insps = await gsApi.listInspecciones();
      setInspecciones(insps);
      const plans = await gsApi.listPlanAccion();
      setPlanAccion(plans);

      // Calcular estadísticas canónicas de planes de acción
      let pPendientes = 0;
      let pEjecucion = 0;
      let pCerradas = 0;
      let pVencidas = 0;
      plans.forEach(p => {
        const s = (p.estado || '').toLowerCase().trim();
        const isOverdue = s !== 'cerrado' && s !== 'cerrada' && p.fechaLimite && new Date(p.fechaLimite) < new Date();
        if (s === 'pendiente') pPendientes++;
        else if (s === 'en ejecución' || s === 'en_ejecucion' || s === 'en ejecucion') pEjecucion++;
        else if (s === 'cerrado' || s === 'cerrada') pCerradas++;

        if (s === 'vencido' || s === 'vencida' || isOverdue) pVencidas++;
      });
      setPlanStats({
        total: plans.length,
        pendientes: pPendientes,
        enEjecucion: pEjecucion,
        cerradas: pCerradas,
        vencidas: pVencidas
      });
      const emps = await gsApi.listEmpleados();
      setEmpleados(emps);
      const usrs = await gsApi.listUsuarios();
      setUsuarios(usrs);
      const active = gsApi.getCurrentUser();
      if (active) setCurrentUser(active);
      setPendingSyncCount(getOfflineQueueCount());
    } catch (err) {
      console.error('Error recargando datos:', err);
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (syncInProgress.current) return;
    syncInProgress.current = true;
    setIsSyncing(true);
    try {
      const res = await syncOfflineQueue();
      setPendingSyncCount(res.remaining);
      if (res.synced > 0) await refreshData();
    } catch (e) {
      console.error('Error sincronizando:', e);
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
    }
  }, [refreshData]);

  useEffect(() => {
    refreshData();
    const handleOnline  = () => { setIsOnline(true); syncNow(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshData, syncNow]);

  const updateSheetsUrl = (url: string) => {
    setSheetsUrl(url);
    setSheetsUrlState(url);
    refreshData();
  };

  const createInspeccion = async (payload: any): Promise<string> => {
    const id = await gsApi.createInspeccion(payload);
    await refreshData();
    return id;
  };

  const saveFormData = async (payload: any): Promise<boolean> => {
    const targetId = String(payload.inspeccionId || payload._id || payload.id || payload.correlativo || '').trim();
    let parsedResp = payload.respuestas;
    if (!parsedResp && payload.responses) {
      try { parsedResp = JSON.parse(payload.responses); } catch {}
    }

    // Actualizar de inmediato el estado en memoria de React para reactividad instantánea
    setInspecciones(prev => prev.map(item => {
      const match =
        String(item._id) === targetId ||
        String(item.id) === targetId ||
        String(item.correlativo) === targetId ||
        (payload.correlativo && String(item.correlativo) === String(payload.correlativo)) ||
        (payload._id && String(item._id) === String(payload._id));
      if (match) {
        return {
          ...item,
          respuestas: parsedResp || item.respuestas,
          formResponses: payload.responses || item.formResponses,
          puntuacion: payload.puntuacion !== undefined ? payload.puntuacion : item.puntuacion,
          resultado: payload.resultado || item.resultado,
          formObservations: payload.observations || item.formObservations,
          formAdditional: payload.additional || item.formAdditional,
          formSignatures: payload.signatures || item.formSignatures,
          actualizadoEn: new Date().toISOString()
        };
      }
      return item;
    }));

    const ok = await gsApi.saveFormData(payload);
    try {
      await refreshData();
    } catch (e) {
      console.warn('refreshData error after saveFormData:', e);
    }
    return ok;
  };

  const completeInspeccion = async (id: string, extraData?: any): Promise<boolean> => {
    const target = inspecciones.find(i => String(i._id) === String(id) || String(i.id) === String(id) || String(i.correlativo) === String(id));
    setInspecciones(prev => prev.map(item => {
      if (String(item._id) === String(id) || String(item.id) === String(id) || String(item.correlativo) === String(id)) {
        return {
          ...item,
          estado: 'completada' as any,
          actualizadoEn: new Date().toISOString(),
          puntuacion: extraData?.puntuacion !== undefined ? extraData.puntuacion : item.puntuacion,
          resultado: extraData?.resultado || item.resultado,
          respuestas: extraData?.respuestas || item.respuestas,
          formResponses: extraData?.responses || item.formResponses
        };
      }
      return item;
    }));
    const ok = await gsApi.completeInspeccion({
      id,
      _id: target?._id || id,
      correlativo: target?.correlativo,
      puntuacion: extraData?.puntuacion ?? target?.puntuacion,
      resultado: extraData?.resultado || target?.resultado,
      respuestas: extraData?.respuestas || target?.respuestas,
      responses: extraData?.responses || target?.formResponses,
      observaciones: extraData?.observaciones || target?.formObservations,
      firmas: extraData?.firmas || target?.formSignatures
    });
    await refreshData();
    return ok;
  };

  const deleteInspeccion = async (id: string): Promise<boolean> => {
    const ok = await gsApi.deleteInspeccion({ id });
    await refreshData();
    return ok;
  };

  const updatePlanAccion = async (payload: any): Promise<boolean> => {
    const ok = await gsApi.updatePlanAccion(payload);
    await refreshData();
    return ok;
  };

  const logAudit = async (payload: any) => gsApi.logAudit(payload);

  const getInspeccionById = (id: string): Inspeccion | undefined => {
    if (!id) return undefined;
    const strId = String(id).trim();

    // 1. Buscar en estado React
    let found = inspecciones.find(i =>
      String(i._id) === strId ||
      String(i.id) === strId ||
      String(i.correlativo) === strId ||
      String(i.referencia) === strId ||
      String(i.referencia) === `INSP-${strId}` ||
      (i._id && String(i._id).toLowerCase() === strId.toLowerCase())
    );

    // 2. Si no está en estado, buscar en localStorage
    if (!found) {
      try {
        const rawLocal = typeof window !== 'undefined' ? localStorage.getItem('sgd_inspecciones') : null;
        const localList = rawLocal ? JSON.parse(rawLocal) : [];
        found = localList.find((i: any) =>
          String(i._id) === strId ||
          String(i.id) === strId ||
          String(i.correlativo) === strId ||
          String(i.referencia) === strId ||
          String(i.referencia) === `INSP-${strId}` ||
          (i._id && String(i._id).toLowerCase() === strId.toLowerCase())
        );
      } catch (e) {
        console.warn('Error en getInspeccionById desde localStorage:', e);
      }
    }

    if (!found) return undefined;

    // 3. Hidratación de respuestas desde respaldos si vienen vacías
    const hasAnswers = (found.respuestas && typeof found.respuestas === 'object' && Object.keys(found.respuestas).length > 0) ||
                       (found.formResponses && found.formResponses !== '{}');

    if (!hasAnswers) {
      const keys = [strId, found._id, found.id, found.correlativo ? String(found.correlativo) : null].filter(Boolean) as string[];
      for (const k of keys) {
        try {
          const raw = localStorage.getItem(`sgd_inspection_responses_${k}`) || localStorage.getItem(`sgd_draft_resp_${k}`);
          if (raw) {
            const p = JSON.parse(raw);
            if (p && typeof p === 'object' && Object.keys(p).length > 0) {
              found = {
                ...found,
                respuestas: p,
                formResponses: raw
              };
              break;
            }
          }
        } catch {}
      }
    }

    return found;
  };

  const login = async (email: string, pass: string) => {
    const res = await gsApi.login(email, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      auditService.log({
        modulo: 'AUTENTICACION',
        accion: 'INICIO_SESION',
        entidadTipo: 'Usuario',
        entidadId: res.user.id || res.user._id,
        descripcion: `Inicio de sesión exitoso de ${res.user.nombre} (${res.user.rol})`,
        detalles: { email, rol: res.user.rol }
      }).catch(console.warn);
    } else {
      auditService.logSecurity(`Fallo en autenticación para ${email}`, { email }).catch(console.warn);
    }
    await refreshData();
    return res;
  };

  const register = async (userData: {
    nombre: string;
    email: string;
    password: string;
    rol?: Rol;
    cargo?: string;
    cedula?: string;
    localidad?: string;
  }) => {
    const res = await gsApi.registerUser(userData);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      auditService.log({
        modulo: 'AUTENTICACION',
        accion: 'REGISTRO_USUARIO',
        entidadTipo: 'Usuario',
        entidadId: res.user.id || res.user._id,
        descripcion: `Nuevo usuario registrado e iniciado sesión: ${res.user.nombre} (${res.user.email}) - Rol: ${res.user.rol}`,
        detalles: { email: res.user.email, rol: res.user.rol }
      }).catch(console.warn);
    }
    await refreshData();
    return res;
  };

  const logout = () => {
    if (currentUser) {
      auditService.log({
        modulo: 'AUTENTICACION',
        accion: 'CIERRE_SESION',
        entidadTipo: 'Usuario',
        entidadId: currentUser.id || currentUser._id,
        descripcion: `Cierre de sesión de ${currentUser.nombre}`
      }).catch(console.warn);
    }
    gsApi.logout();
    setCurrentUser(null);
  };

  const switchUser = (u: Usuario) => {
    gsApi.setCurrentUser(u);
    setCurrentUser(u);
    auditService.log({
      modulo: 'AUTENTICACION',
      accion: 'INICIO_SESION',
      entidadTipo: 'Usuario',
      entidadId: u.id || u._id,
      descripcion: `Cambio de usuario activo a: ${u.nombre} (${u.rol})`
    }).catch(console.warn);
  };

  const saveUsuario = async (u: Partial<Usuario>) => {
    const res = await gsApi.saveUsuario(u);
    auditService.log({
      modulo: 'USUARIOS_SEGURIDAD',
      accion: u.id || u._id ? 'ACTUALIZAR' : 'CREAR',
      entidadTipo: 'Usuario',
      entidadId: u.id || u._id,
      descripcion: `Perfil de usuario ${u.nombre || u.email} ${u.id || u._id ? 'actualizado' : 'creado'}`,
      detalles: { email: u.email, rol: u.rol, activo: u.activo }
    }).catch(console.warn);
    await refreshData();
    return res;
  };

  const deleteUsuario = async (id: string) => {
    const res = await gsApi.deleteUsuario(id);
    auditService.log({
      modulo: 'USUARIOS_SEGURIDAD',
      accion: 'ELIMINAR',
      entidadTipo: 'Usuario',
      entidadId: id,
      descripcion: `Eliminación de cuenta de usuario ID: ${id}`,
      severidad: 'CRITICO'
    }).catch(console.warn);
    await refreshData();
    return res;
  };

  const findUserAccount = (query: string) => gsApi.findUserAccount(query);
  const findUserByCedula = (cedula: string) => gsApi.findUserAccount(cedula);
  const findUserByEmail = (email: string) => gsApi.findUserByEmail(email);
  const resetPasswordWithIdentity = async (params: { email: string; code?: string; cedula?: string; newPassword: string }) => {
    const res = await gsApi.resetPasswordWithIdentity(params);
    if (res.success) {
      await refreshData();
    }
    return res;
  };
  const requestRecoveryCode = (email: string) => gsApi.requestRecoveryCode(email);
  const verifyRecoveryCode = (email: string, code: string) => gsApi.verifyRecoveryCode(email, code);

  return (
    <SGDContext.Provider value={{
      inspecciones, planAccion, stats, planStats,
      empresas: INITIAL_EMPRESAS,
      localidades: INITIAL_LOCALIDADES,
      establecimientos,
      tiposInspeccion: INITIAL_TIPOS_INSPECCION,
      empleados,
      usuarios,
      currentUser,
      isOnline, isConfigured: isSheetsConfigured(),
      sheetsUrl, pendingSyncCount, isSyncing,
      updateSheetsUrl, syncNow, refreshData,
      createInspeccion, saveFormData, completeInspeccion,
      deleteInspeccion, updatePlanAccion, logAudit, getInspeccionById,
      login, register, logout, switchUser, saveUsuario, deleteUsuario,
      findUserAccount, findUserByCedula, findUserByEmail, resetPasswordWithIdentity, requestRecoveryCode, verifyRecoveryCode,
    }}>
      {children}
    </SGDContext.Provider>
  );
}

export function useSGD(): SGDContextType {
  const ctx = useContext(SGDContext);
  if (!ctx) throw new Error('useSGD debe usarse dentro de SGDProvider');
  return ctx;
}
