import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  gsApi, getSheetsUrl, setSheetsUrl, isSheetsConfigured,
  getOfflineQueueCount, syncOfflineQueue,
} from '../lib/googleSheetsClient';
import { INITIAL_EMPRESAS, INITIAL_LOCALIDADES, INITIAL_TIPOS_INSPECCION } from '../data/seedData';
import type { Inspeccion, PlanAccion, Empresa, Localidad, Establecimiento, TipoInspeccion, Empleado, DashboardStats, PlanStats } from '../types';

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
  completeInspeccion: (id: string) => Promise<boolean>;
  deleteInspeccion: (id: string) => Promise<boolean>;
  updatePlanAccion: (payload: any) => Promise<boolean>;
  logAudit: (payload: any) => Promise<void>;
  getInspeccionById: (id: string) => Inspeccion | undefined;
}

const SGDContext = createContext<SGDContextType | null>(null);

export function SGDProvider({ children }: { children: React.ReactNode }) {
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [planAccion, setPlanAccion] = useState<PlanAccion[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalInspecciones: 0, conformes: 0, noConformes: 0, tasaCumplimiento: 0 });
  const [planStats, setPlanStats] = useState<PlanStats>({ total: 0, pendientes: 0, enEjecucion: 0, cerradas: 0, vencidas: 0 });
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>(gsApi.getCatalogos().establecimientos);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sheetsUrl, setSheetsUrlState] = useState(getSheetsUrl());
  const [pendingSyncCount, setPendingSyncCount] = useState(getOfflineQueueCount());
  const [isSyncing, setIsSyncing] = useState(false);
  const syncInProgress = useRef(false);

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
      const emps = await gsApi.listEmpleados();
      setEmpleados(emps);
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
    const ok = await gsApi.saveFormData(payload);
    await refreshData();
    return ok;
  };

  const completeInspeccion = async (id: string): Promise<boolean> => {
    const ok = await gsApi.completeInspeccion({ id });
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

  const getInspeccionById = (id: string) =>
    inspecciones.find(i => String(i._id) === String(id));

  return (
    <SGDContext.Provider value={{
      inspecciones, planAccion, stats, planStats,
      empresas: INITIAL_EMPRESAS,
      localidades: INITIAL_LOCALIDADES,
      establecimientos,
      tiposInspeccion: INITIAL_TIPOS_INSPECCION,
      empleados,
      isOnline, isConfigured: isSheetsConfigured(),
      sheetsUrl, pendingSyncCount, isSyncing,
      updateSheetsUrl, syncNow, refreshData,
      createInspeccion, saveFormData, completeInspeccion,
      deleteInspeccion, updatePlanAccion, logAudit, getInspeccionById,
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
