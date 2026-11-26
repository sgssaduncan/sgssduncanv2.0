// =========================================================================
// SGD DUNCAN 2.0 — SERVICIO DE ADMINISTRACIÓN DE CRITERIOS Y FRECUENCIAS
// Permite a los administradores visualizar, adecuar, modificar y actualizar:
// 1. Criterios de Distribuidoras (173 ítems)
// 2. Criterios de Servicentros (117 ítems)
// 3. Frecuencias de Inspección y Actores Responsables (24 formularios)
// 4. Ponderaciones Regionales para Totalización (Ronda 1 2025-2026)
// 5. Flota Nacional de Vehículos (65 unidades)
// 6. Listas Maestras del Sistema
// =========================================================================

import {
  CRITERIOS_DISTRIBUIDORAS_OFICIALES,
  CRITERIOS_SERVICENTROS_OFICIALES,
  FRECUENCIAS_INSPECCIONES_OFICIALES,
  FLOTA_NACIONAL_DUNCAN,
  LISTAS_MAESTRAS_SGD,
  CriterioEvaluacion,
  FrecuenciaInspeccion,
  VehiculoFlotaOficial,
  ListasMaestras
} from '../data/criteriosOficialesData';
import { PONDERACIONES_TOTALIZACION_OFICIALES, PonderacionRegion } from '../data/ponderacionesData';
import { auditService } from './auditService';

function safeSetLocalItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`[CriteriosService] No se pudo persistir "${key}" en localStorage:`, e);
  }
}

const STORAGE_KEYS = {
  CRITERIOS_DIST: 'sgd_criterios_distribuidoras_v2',
  CRITERIOS_SERV: 'sgd_criterios_servicentros_v2',
  FRECUENCIAS: 'sgd_frecuencias_inspecciones_v2',
  PONDERACIONES: 'sgd_ponderaciones_totalizacion_v2',
  FLOTA: 'sgd_flota_nacional_v2',
  LISTAS: 'sgd_listas_maestras_v2'
};

function notifyUpdate(catalogName: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sgd_criterios_updated', { detail: { catalog: catalogName } }));
  }
}

export const criteriosService = {
  // -------------------------------------------------------------
  // 1. CRITERIOS DISTRIBUIDORAS
  // -------------------------------------------------------------
  getCriteriosDistribuidoras(): CriterioEvaluacion[] {
    if (typeof window === 'undefined') return CRITERIOS_DISTRIBUIDORAS_OFICIALES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CRITERIOS_DIST);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored criterios distribuidoras:', e);
    }
    return CRITERIOS_DISTRIBUIDORAS_OFICIALES;
  },

  saveCriteriosDistribuidoras(data: CriterioEvaluacion[], userEmail = 'admin@duncan.com.ve') {
    if (typeof window === 'undefined') return;
    safeSetLocalItem(STORAGE_KEYS.CRITERIOS_DIST, JSON.stringify(data));
    auditService.log({
      modulo: 'CONFIGURACION_SISTEMA',
      accion: 'ACTUALIZAR',
      entidadTipo: 'CriteriosDistribuidoras',
      descripcion: 'Actualización de Criterios de Distribuidoras',
      detalles: { totalItems: data.length }
    });
    notifyUpdate('distribuidoras');
  },

  updateCriterioDistribuidora(itemIndex: number, updated: Partial<CriterioEvaluacion>, userEmail = 'admin@duncan.com.ve') {
    const list = this.getCriteriosDistribuidoras();
    const idx = list.findIndex(c => c.item === itemIndex);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updated };
      this.saveCriteriosDistribuidoras(list, userEmail);
      return list[idx];
    }
    return null;
  },

  addCriterioDistribuidora(nuevo: Omit<CriterioEvaluacion, 'item'>, userEmail = 'admin@duncan.com.ve') {
    const list = this.getCriteriosDistribuidoras();
    const maxItem = list.reduce((max, c) => Math.max(max, c.item), 0);
    const itemToAdd: CriterioEvaluacion = {
      ...nuevo,
      item: maxItem + 1
    };
    list.push(itemToAdd);
    this.saveCriteriosDistribuidoras(list, userEmail);
    return itemToAdd;
  },

  deleteCriterioDistribuidora(itemIndex: number, userEmail = 'admin@duncan.com.ve') {
    const list = this.getCriteriosDistribuidoras().filter(c => c.item !== itemIndex);
    this.saveCriteriosDistribuidoras(list, userEmail);
  },

  // -------------------------------------------------------------
  // 2. CRITERIOS SERVICENTROS
  // -------------------------------------------------------------
  getCriteriosServicentros(): CriterioEvaluacion[] {
    if (typeof window === 'undefined') return CRITERIOS_SERVICENTROS_OFICIALES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CRITERIOS_SERV);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored criterios servicentros:', e);
    }
    return CRITERIOS_SERVICENTROS_OFICIALES;
  },

  saveCriteriosServicentros(data: CriterioEvaluacion[], userEmail = 'admin@duncan.com.ve') {
    if (typeof window === 'undefined') return;
    safeSetLocalItem(STORAGE_KEYS.CRITERIOS_SERV, JSON.stringify(data));
    auditService.log({
      modulo: 'CONFIGURACION_SISTEMA',
      accion: 'ACTUALIZAR',
      entidadTipo: 'CriteriosServicentros',
      descripcion: 'Actualización de Criterios de Servicentros',
      detalles: { totalItems: data.length }
    });
    notifyUpdate('servicentros');
  },

  updateCriterioServicentro(itemIndex: number, updated: Partial<CriterioEvaluacion>, userEmail = 'admin@duncan.com.ve') {
    const list = this.getCriteriosServicentros();
    const idx = list.findIndex(c => c.item === itemIndex);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updated };
      this.saveCriteriosServicentros(list, userEmail);
      return list[idx];
    }
    return null;
  },

  addCriterioServicentro(nuevo: Omit<CriterioEvaluacion, 'item'>, userEmail = 'admin@duncan.com.ve') {
    const list = this.getCriteriosServicentros();
    const maxItem = list.reduce((max, c) => Math.max(max, c.item), 0);
    const itemToAdd: CriterioEvaluacion = {
      ...nuevo,
      item: maxItem + 1
    };
    list.push(itemToAdd);
    this.saveCriteriosServicentros(list, userEmail);
    return itemToAdd;
  },

  deleteCriterioServicentro(itemIndex: number, userEmail = 'admin@duncan.com.ve') {
    const list = this.getCriteriosServicentros().filter(c => c.item !== itemIndex);
    this.saveCriteriosServicentros(list, userEmail);
  },

  // -------------------------------------------------------------
  // 3. FRECUENCIAS DE INSPECCIÓN Y ACTORES RESPONSABLES
  // -------------------------------------------------------------
  getFrecuencias(): FrecuenciaInspeccion[] {
    if (typeof window === 'undefined') return FRECUENCIAS_INSPECCIONES_OFICIALES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FRECUENCIAS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored frecuencias:', e);
    }
    return FRECUENCIAS_INSPECCIONES_OFICIALES;
  },

  saveFrecuencias(data: FrecuenciaInspeccion[], userEmail = 'admin@duncan.com.ve') {
    if (typeof window === 'undefined') return;
    safeSetLocalItem(STORAGE_KEYS.FRECUENCIAS, JSON.stringify(data));
    auditService.log({
      modulo: 'CONFIGURACION_SISTEMA',
      accion: 'ACTUALIZAR',
      entidadTipo: 'FrecuenciasInspeccion',
      descripcion: 'Actualización de Frecuencias de Inspección',
      detalles: { totalItems: data.length }
    });
    notifyUpdate('frecuencias');
  },

  updateFrecuencia(itemIndex: number, updated: Partial<FrecuenciaInspeccion>, userEmail = 'admin@duncan.com.ve') {
    const list = this.getFrecuencias();
    const idx = list.findIndex(f => f.item === itemIndex);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updated };
      this.saveFrecuencias(list, userEmail);
      return list[idx];
    }
    return null;
  },

  addFrecuencia(nuevo: Omit<FrecuenciaInspeccion, 'item'>, userEmail = 'admin@duncan.com.ve') {
    const list = this.getFrecuencias();
    const maxItem = list.reduce((max, f) => Math.max(max, f.item), 0);
    const itemToAdd: FrecuenciaInspeccion = {
      ...nuevo,
      item: maxItem + 1
    };
    list.push(itemToAdd);
    this.saveFrecuencias(list, userEmail);
    return itemToAdd;
  },

  deleteFrecuencia(itemIndex: number, userEmail = 'admin@duncan.com.ve') {
    const list = this.getFrecuencias().filter(f => f.item !== itemIndex);
    this.saveFrecuencias(list, userEmail);
  },

  // -------------------------------------------------------------
  // 4. PONDERACIONES REGIONALES PARA TOTALIZACIÓN
  // -------------------------------------------------------------
  getPonderaciones(): PonderacionRegion[] {
    if (typeof window === 'undefined') return PONDERACIONES_TOTALIZACION_OFICIALES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PONDERACIONES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored ponderaciones:', e);
    }
    return PONDERACIONES_TOTALIZACION_OFICIALES;
  },

  savePonderaciones(data: PonderacionRegion[], userEmail = 'admin@duncan.com.ve') {
    if (typeof window === 'undefined') return;
    safeSetLocalItem(STORAGE_KEYS.PONDERACIONES, JSON.stringify(data));
    auditService.log({
      modulo: 'CONFIGURACION_SISTEMA',
      accion: 'ACTUALIZAR',
      entidadTipo: 'PonderacionesRegionales',
      descripcion: 'Actualización de Ponderaciones Regionales',
      detalles: { totalRegiones: data.length }
    });
    notifyUpdate('ponderaciones');
  },

  updatePonderacionItem(regionName: string, itemIdx: number, updated: { eficiencia?: number; ponderacion?: number }, userEmail = 'admin@duncan.com.ve') {
    const list = this.getPonderaciones();
    const reg = list.find(r => r.region === regionName);
    if (reg && reg.items[itemIdx]) {
      const item = reg.items[itemIdx];
      const ef = updated.eficiencia !== undefined ? updated.eficiencia : item.eficiencia;
      const pond = updated.ponderacion !== undefined ? updated.ponderacion : item.ponderacion;
      item.eficiencia = ef;
      item.ponderacion = pond;
      item.ponderado = Number((ef * pond).toFixed(3));
      
      // Recalcular promedio de la región
      const totalPonderado = reg.items.reduce((acc, it) => acc + (it.ponderado || 0), 0);
      reg.promedioRegion = Number(totalPonderado.toFixed(2));
      
      this.savePonderaciones(list, userEmail);
      return reg;
    }
    return null;
  },

  // -------------------------------------------------------------
  // 5. FLOTA NACIONAL DE VEHÍCULOS
  // -------------------------------------------------------------
  getFlota(): VehiculoFlotaOficial[] {
    if (typeof window === 'undefined') return FLOTA_NACIONAL_DUNCAN;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FLOTA);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored flota:', e);
    }
    return FLOTA_NACIONAL_DUNCAN;
  },

  saveFlota(data: VehiculoFlotaOficial[], userEmail = 'admin@duncan.com.ve') {
    if (typeof window === 'undefined') return;
    safeSetLocalItem(STORAGE_KEYS.FLOTA, JSON.stringify(data));
    auditService.log({
      modulo: 'TRANSPORTE_FLOTA',
      accion: 'ACTUALIZAR',
      entidadTipo: 'FlotaNacional',
      descripcion: 'Actualización de Flota Nacional de Vehículos',
      detalles: { totalVehiculos: data.length }
    });
    notifyUpdate('flota');
  },

  updateVehiculoFlota(itemIndex: number, updated: Partial<VehiculoFlotaOficial>, userEmail = 'admin@duncan.com.ve') {
    const list = this.getFlota();
    const idx = list.findIndex(v => v.item === itemIndex);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updated };
      this.saveFlota(list, userEmail);
      return list[idx];
    }
    return null;
  },

  addVehiculoFlota(nuevo: Omit<VehiculoFlotaOficial, 'item'>, userEmail = 'admin@duncan.com.ve') {
    const list = this.getFlota();
    const maxItem = list.reduce((max, v) => Math.max(max, v.item), 0);
    const itemToAdd: VehiculoFlotaOficial = {
      ...nuevo,
      item: maxItem + 1
    };
    list.push(itemToAdd);
    this.saveFlota(list, userEmail);
    return itemToAdd;
  },

  deleteVehiculoFlota(itemIndex: number, userEmail = 'admin@duncan.com.ve') {
    const list = this.getFlota().filter(v => v.item !== itemIndex);
    this.saveFlota(list, userEmail);
  },

  // -------------------------------------------------------------
  // 6. LISTAS MAESTRAS
  // -------------------------------------------------------------
  getListas(): ListasMaestras {
    if (typeof window === 'undefined') return LISTAS_MAESTRAS_SGD;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LISTAS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored listas maestras:', e);
    }
    return LISTAS_MAESTRAS_SGD;
  },

  saveListas(data: ListasMaestras, userEmail = 'admin@duncan.com.ve') {
    if (typeof window === 'undefined') return;
    safeSetLocalItem(STORAGE_KEYS.LISTAS, JSON.stringify(data));
    auditService.log({
      modulo: 'CONFIGURACION_SISTEMA',
      accion: 'ACTUALIZAR',
      entidadTipo: 'ListasMaestras',
      descripcion: 'Actualización de Listas Maestras',
      detalles: {}
    });
    notifyUpdate('listas');
  },

  // -------------------------------------------------------------
  // RESTABLECIMIENTO A VALORES OFICIALES
  // -------------------------------------------------------------
  resetCatalog(catalog: 'distribuidoras' | 'servicentros' | 'frecuencias' | 'ponderaciones' | 'flota' | 'listas' | 'todo', userEmail = 'admin@duncan.com.ve') {
    if (typeof window === 'undefined') return;

    if (catalog === 'distribuidoras' || catalog === 'todo') {
      localStorage.removeItem(STORAGE_KEYS.CRITERIOS_DIST);
      notifyUpdate('distribuidoras');
    }
    if (catalog === 'servicentros' || catalog === 'todo') {
      localStorage.removeItem(STORAGE_KEYS.CRITERIOS_SERV);
      notifyUpdate('servicentros');
    }
    if (catalog === 'frecuencias' || catalog === 'todo') {
      localStorage.removeItem(STORAGE_KEYS.FRECUENCIAS);
      notifyUpdate('frecuencias');
    }
    if (catalog === 'ponderaciones' || catalog === 'todo') {
      localStorage.removeItem(STORAGE_KEYS.PONDERACIONES);
      notifyUpdate('ponderaciones');
    }
    if (catalog === 'flota' || catalog === 'todo') {
      localStorage.removeItem(STORAGE_KEYS.FLOTA);
      notifyUpdate('flota');
    }
    if (catalog === 'listas' || catalog === 'todo') {
      localStorage.removeItem(STORAGE_KEYS.LISTAS);
      notifyUpdate('listas');
    }

    auditService.log({
      modulo: 'CONFIGURACION_SISTEMA',
      accion: 'ACTUALIZAR',
      entidadTipo: 'CatalogoCriterios',
      descripcion: `Restablecimiento de catálogo: ${catalog}`,
      detalles: { catalog }
    });
  },

  // -------------------------------------------------------------
  // EXPORTACIÓN A EXCEL COMPLETO
  // -------------------------------------------------------------
  async exportAllCatalogsToExcel() {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    // 1. Distribuidoras
    const distData = this.getCriteriosDistribuidoras().map(c => ({
      "Ítem": c.item,
      "Conjunto": c.conjunto,
      "N°": c.num,
      "Aspecto Evaluado": c.aspecto,
      "Pregunta Original": c.pregunta,
      "Pregunta Resumida": c.preguntaResumida,
      "Aspecto Legal - Técnico": c.aspectoLegal,
      "Grupo o Familia": c.grupoPilar,
      "Área Responsable": c.areaResponsable
    }));
    const wsDist = XLSX.utils.json_to_sheet(distData);
    XLSX.utils.book_append_sheet(wb, wsDist, "Distribuidoras (173)");

    // 2. Servicentros
    const servData = this.getCriteriosServicentros().map(c => ({
      "Ítem": c.item,
      "Conjunto": c.conjunto,
      "N°": c.num,
      "Aspecto Evaluado": c.aspecto,
      "Pregunta Original": c.pregunta,
      "Pregunta Resumida": c.preguntaResumida,
      "Aspecto Legal - Técnico": c.aspectoLegal,
      "Grupo o Familia": c.grupoPilar,
      "Área Responsable": c.areaResponsable
    }));
    const wsServ = XLSX.utils.json_to_sheet(servData);
    XLSX.utils.book_append_sheet(wb, wsServ, "Servicentros (117)");

    // 3. Frecuencias
    const frecData = this.getFrecuencias().map(f => ({
      "Ítem": f.item,
      "Ubicación": f.ubicacion,
      "Inspección": f.inspeccion,
      "Área": f.area,
      "Frecuencia": f.frecuencia,
      "Formulario Link": f.formularioLink,
      "Actores Responsables": f.responsables
    }));
    const wsFrec = XLSX.utils.json_to_sheet(frecData);
    XLSX.utils.book_append_sheet(wb, wsFrec, "Frecuencias y Actores (24)");

    // 4. Ponderaciones
    const pondData: any[] = [];
    this.getPonderaciones().forEach(reg => {
      reg.items.forEach(it => {
        pondData.push({
          "Región": reg.region,
          "Promedio Región": reg.promedioRegion,
          "Establecimiento / Equipo": it.nombre,
          "% Eficiencia": it.eficiencia,
          "Ponderación": it.ponderacion,
          "% Ponderado": it.ponderado
        });
      });
    });
    const wsPond = XLSX.utils.json_to_sheet(pondData);
    XLSX.utils.book_append_sheet(wb, wsPond, "Ponderaciones Ronda 1");

    // 5. Flota
    const flotaData = this.getFlota().map(v => ({
      "Ítem": v.item,
      "Placas": v.placas,
      "Marca": v.marca,
      "Modelo": v.modelo,
      "Año": v.ano,
      "Capacidad (Kg)": v.capacidadCargaKg,
      "Distribuidora": v.distribuidora,
      "Observaciones": v.observaciones
    }));
    const wsFlota = XLSX.utils.json_to_sheet(flotaData);
    XLSX.utils.book_append_sheet(wb, wsFlota, "Flota Nacional");

    const fileName = `SGD_DUNCAN_CRITERIOS_Y_FRECUENCIAS_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
};
