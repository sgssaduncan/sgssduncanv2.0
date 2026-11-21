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
  switch (estado) {
    case 'completada':   return 'badge bg-emerald-100 text-emerald-800';
    case 'en_progreso':  return 'badge bg-blue-100 text-blue-800';
    case 'borrador':     return 'badge bg-slate-100 text-slate-600';
    case 'pendiente':    return 'badge bg-amber-100 text-amber-800';
    case 'en_ejecucion': return 'badge bg-blue-100 text-blue-800';
    case 'cerrada':      return 'badge bg-emerald-100 text-emerald-800';
    case 'vencida':      return 'badge bg-red-100 text-red-800';
    default:             return 'badge bg-slate-100 text-slate-500';
  }
}

export function getPrioridadColor(prioridad?: string): string {
  switch (prioridad) {
    case 'Critica': return 'text-red-700 bg-red-100';
    case 'Alta':    return 'text-orange-700 bg-orange-100';
    case 'Media':   return 'text-amber-700 bg-amber-100';
    case 'Baja':    return 'text-blue-700 bg-blue-100';
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
