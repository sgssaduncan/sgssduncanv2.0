import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string, fmt = 'dd/MM/yyyy'): string {
  if (!dateStr) return '—';
  try {
    const d = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr + 'T00:00:00');
    return isValid(d) ? format(d, fmt, { locale: es }) : '—';
  } catch { return '—'; }
}

export function formatDateTime(dateStr?: string): string {
  return formatDate(dateStr, "dd/MM/yyyy HH:mm");
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function getResultadoBadgeClass(resultado?: string): string {
  switch (resultado) {
    case 'C':  return 'badge bg-emerald-100 text-emerald-800';
    case 'NC': return 'badge bg-red-100 text-red-800';
    case 'OM': return 'badge bg-amber-100 text-amber-800';
    case 'NA': return 'badge bg-slate-100 text-slate-600';
    default:   return 'badge bg-slate-100 text-slate-500';
  }
}

export function getEstadoBadgeClass(estado?: string): string {
  const norm = (estado || '').toLowerCase().trim();
  switch (norm) {
    case 'completada':
    case 'completado':   return 'badge bg-emerald-100 text-emerald-800';
    case 'en_progreso':
    case 'en progreso':  return 'badge bg-blue-100 text-blue-800';
    case 'borrador':     return 'badge bg-slate-100 text-slate-600';
    case 'pendiente':    return 'badge bg-amber-100 text-amber-800';
    case 'en_ejecucion':
    case 'en ejecución':
    case 'en ejecucion': return 'badge bg-blue-100 text-blue-800';
    case 'cerrada':
    case 'cerrado':      return 'badge bg-emerald-100 text-emerald-800';
    case 'vencida':
    case 'vencido':      return 'badge bg-red-100 text-red-800';
    default:             return 'badge bg-slate-100 text-slate-500';
  }
}

export function getPrioridadColor(prioridad?: string): string {
  const norm = (prioridad || '').toLowerCase().trim();
  switch (norm) {
    case 'critica':
    case 'crítica':
    case 'inmediato': return 'text-red-700 bg-red-100';
    case 'alta':
    case 'corto plazo': return 'text-orange-700 bg-orange-100';
    case 'media':
    case 'medio plazo': return 'text-amber-700 bg-amber-100';
    case 'baja':
    case 'largo plazo': return 'text-blue-700 bg-blue-100';
    default:        return 'text-slate-600 bg-slate-100';
  }
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

export function capitalize(str?: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Normaliza y estandariza el título oficial del encabezado de cualquier informe de inspección.
 * Criterio estándar SGD Duncan: "INFORME DE INSPECCIÓN <TIPO>"
 * Ejemplos:
 * - "SSA Distribuidoras" -> "INFORME DE INSPECCIÓN DISTRIBUIDORA"
 * - "SSA Servicentros"   -> "INFORME DE INSPECCIÓN SERVICENTRO"
 * - "Extintores"         -> "INFORME DE INSPECCIÓN EXTINTORES"
 * - "Montacargas"        -> "INFORME DE INSPECCIÓN MONTACARGAS"
 * - "Kit para Derrames"  -> "INFORME DE INSPECCIÓN KIT PARA DERRAMES"
 */
export function getReportHeaderTitle(tipoNombre?: string, tipoCodigo?: string): string {
  const code = (tipoCodigo || '').toUpperCase().trim();
  const raw = (tipoNombre || '').trim();
  const rawUpper = raw.toUpperCase();

  // Mapeos específicos canónicos directos por código o nombre
  if (code === 'DD' || rawUpper.includes('DISTRIBUIDOR')) {
    return 'INFORME DE INSPECCIÓN DISTRIBUIDORA';
  }
  if (code === 'SC' || rawUpper.includes('SERVICENTRO')) {
    return 'INFORME DE INSPECCIÓN SERVICENTRO';
  }
  if (code === 'EXT' || rawUpper.includes('EXTINTOR')) {
    return 'INFORME DE INSPECCIÓN EXTINTORES';
  }
  if (code === 'MTCG' || code === 'MTCG_SSA' || rawUpper.includes('MONTACARGA')) {
    return 'INFORME DE INSPECCIÓN MONTACARGAS';
  }
  if (code === 'KPD' || rawUpper.includes('DERRAME')) {
    return 'INFORME DE INSPECCIÓN KIT PARA DERRAMES';
  }
  if (code === 'LEM' || rawUpper.includes('LÁMPARA') || rawUpper.includes('LAMPARA')) {
    return 'INFORME DE INSPECCIÓN LÁMPARAS DE EMERGENCIA';
  }
  if (code === 'HEQ' || rawUpper.includes('HERRAMIENTA')) {
    return 'INFORME DE INSPECCIÓN HERRAMIENTAS Y EQUIPOS';
  }
  if (code === 'VHT' || code === 'VTC' || rawUpper.includes('VEHÍCULO') || rawUpper.includes('VEHICULO') || rawUpper.includes('TRANSPORTE')) {
    return 'INFORME DE INSPECCIÓN VEHÍCULO / TRANSPORTE';
  }
  if (code === 'PB' || rawUpper.includes('BOMBERO')) {
    return 'INFORME DE INSPECCIÓN PERMISOS DE BOMBEROS';
  }
  if (code === 'OL' || rawUpper.includes('ORDEN Y LIMPIEZA')) {
    return 'INFORME DE INSPECCIÓN ORDEN Y LIMPIEZA';
  }
  if (code === 'DP' || rawUpper.includes('DOTACIÓN') || rawUpper.includes('DOTACION')) {
    return 'INFORME DE INSPECCIÓN DOTACIÓN';
  }
  if (code === 'DI' || rawUpper.includes('DETECCIÓN') || rawUpper.includes('DETECCION') || rawUpper.includes('INCENDIO')) {
    return 'INFORME DE INSPECCIÓN DETECCIÓN DE INCENDIOS';
  }

  // Regla general para cualquier otra inspección presente o futura
  let cleaned = rawUpper
    .replace(/^INFORME\s+OFICIAL\s*:\s*/i, '')
    .replace(/^INFORME\s+DE\s+INSPECCI[OÓ]N\s*(DE\s+|PARA\s+)?/i, '')
    .replace(/^INFORME\s*(DE\s+|PARA\s+)?/i, '')
    .replace(/^INSPECCI[OÓ]N\s+SSA\s*(DE\s+|PARA\s+)?/i, '')
    .replace(/^INSPECCI[OÓ]N\s*(DE\s+|PARA\s+)?/i, '')
    .replace(/^SSA\s+/i, '')
    .trim();

  if (!cleaned || cleaned === 'GEN' || cleaned === 'TÉCNICA' || cleaned === 'TECNICA') {
    cleaned = 'GENERAL';
  }

  return `INFORME DE INSPECCIÓN ${cleaned}`;
}
