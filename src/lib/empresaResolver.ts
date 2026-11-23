import type { Empresa } from '../types';
import { INITIAL_EMPRESAS, INITIAL_ESTABLECIMIENTOS } from '../data/seedData';

export interface ResolvedEmpresa {
  id: string;
  _id: string;
  nombre: string;
  codigo: string;
  rif: string;
  direccion: string;
}

export const GRUPO_DUNCAN_DEFAULT: ResolvedEmpresa = {
  id: 'emp_grupo_duncan',
  _id: 'emp_grupo_duncan',
  nombre: 'Grupo Duncan',
  codigo: 'DUNCAN',
  rif: 'J-00000350-5 / J-00100047-0',
  direccion: 'Caracas / Cagua, Venezuela',
};

/**
 * Resuelve de forma inteligente la empresa del Grupo Duncan aplicable a cualquier reporte,
 * inspección, certificado, accidente o módulo del sistema.
 * 
 * Regla de negocio:
 * 1. El SGD no es de exclusiva aplicación para Acumuladores Duncan, C.A.; es para todo el Grupo Duncan.
 * 2. Cuando se define específicamente una empresa, ESA es la que debe aparecer en los datos,
 *    encabezados, tablas y firmas del reporte.
 * 3. Si no se especifica ninguna empresa ni sede reconocible, se presenta como Grupo Duncan (Consolidado Corporativo).
 */
export function resolveEmpresaInfo(input?: {
  empresaId?: string | null;
  empresaNombre?: string | null;
  establecimientoId?: string | null;
  establecimientoNombre?: string | null;
  sedeNombre?: string | null;
  preferGroupIfGeneric?: boolean;
}): ResolvedEmpresa {
  if (!input) return { ...GRUPO_DUNCAN_DEFAULT };

  const rawNombre = (input.empresaNombre || '').trim();
  const rawId = (input.empresaId || '').trim();
  const rawSede = (input.establecimientoNombre || input.sedeNombre || '').trim();
  const rawEstId = (input.establecimientoId || '').trim();

  // 1. Coincidencia directa por ID de empresa
  if (rawId) {
    const byId = INITIAL_EMPRESAS.find(e => e._id === rawId || e.id === rawId || e.codigo?.toLowerCase() === rawId.toLowerCase());
    if (byId) {
      return {
        id: byId.id || byId._id || rawId,
        _id: byId._id || byId.id || rawId,
        nombre: byId.nombre,
        codigo: byId.codigo,
        rif: byId.rif,
        direccion: byId.direccion || 'Venezuela',
      };
    }
  }

  // 2. Coincidencia directa o por palabras clave en empresaNombre
  if (rawNombre && !rawNombre.toLowerCase().includes('lámpara') && !rawNombre.toLowerCase().includes('lampara')) {
    const low = rawNombre.toLowerCase();
    
    if (low.includes('fundic')) {
      const e = INITIAL_EMPRESAS.find(x => x.codigo === 'FDC');
      if (e) return { id: e._id || 'emp_fdc', _id: e._id || 'emp_fdc', nombre: e.nombre, codigo: e.codigo, rif: e.rif, direccion: e.direccion || 'Zona Industrial Las Vegas, Cagua' };
    }
    if (low.includes('ayacucho') || low.includes('transporte')) {
      const e = INITIAL_EMPRESAS.find(x => x.codigo === 'TAY');
      if (e) return { id: e._id || 'emp_tay', _id: e._id || 'emp_tay', nombre: e.nombre, codigo: e.codigo, rif: e.rif, direccion: e.direccion || 'Cagua / Caracas' };
    }
    if (low.includes('1286')) {
      const e = INITIAL_EMPRESAS.find(x => x.codigo === 'INV1286');
      if (e) return { id: e._id || 'emp_inv', _id: e._id || 'emp_inv', nombre: e.nombre, codigo: e.codigo, rif: e.rif, direccion: e.direccion || 'Caracas, Distrito Capital' };
    }
    if (low.includes('distribuidora')) {
      const e = INITIAL_EMPRESAS.find(x => x.codigo === 'DDCA');
      if (e) return { id: e._id || 'emp_ddca', _id: e._id || 'emp_ddca', nombre: e.nombre, codigo: e.codigo, rif: e.rif, direccion: e.direccion || 'Av. Milán, Edificio Nageben, Los Ruices Sur, Caracas' };
    }
    if (low.includes('acumuladores')) {
      const e = INITIAL_EMPRESAS.find(x => x.codigo === 'ADCA');
      if (e) return { id: e._id || 'emp_adca', _id: e._id || 'emp_adca', nombre: e.nombre, codigo: e.codigo, rif: e.rif, direccion: e.direccion || 'Av. Milán, Edificio Nageben Piso 1, Los Ruices Sur, Caracas' };
    }

    // Coincidencia exacta con alguna empresa registrada
    const found = INITIAL_EMPRESAS.find(e => e.nombre.toLowerCase().trim() === low);
    if (found) {
      return {
        id: found.id || found._id || 'emp_custom',
        _id: found._id || found.id || 'emp_custom',
        nombre: found.nombre,
        codigo: found.codigo,
        rif: found.rif,
        direccion: found.direccion || 'Venezuela',
      };
    }
  }

  // 3. Inferencia a partir del Establecimiento / Sede
  if (rawEstId || rawSede) {
    const est = INITIAL_ESTABLECIMIENTOS.find(e => 
      (rawEstId && (e._id === rawEstId || e.id === rawEstId || e.codigo === rawEstId)) ||
      (rawSede && e.nombre.toLowerCase().trim() === rawSede.toLowerCase().trim())
    );

    if (est) {
      if (est.empresaNombre) {
        return resolveEmpresaInfo({ empresaNombre: est.empresaNombre });
      }
      if (est.empresaId) {
        return resolveEmpresaInfo({ empresaId: est.empresaId });
      }
    }

    const sedeLow = rawSede.toLowerCase();
    if (sedeLow.includes('fundic')) {
      return resolveEmpresaInfo({ empresaNombre: 'Fundición del Centro, C.A.' });
    }
    if (sedeLow.includes('ayacucho') || sedeLow.includes('taller transporte')) {
      return resolveEmpresaInfo({ empresaNombre: 'Transporte Ayacucho, C.A.' });
    }
    if (sedeLow.includes('1286')) {
      return resolveEmpresaInfo({ empresaNombre: 'Inversiones 1286, C.A.' });
    }
    if (sedeLow.includes('distribuidora') || sedeLow.includes('servicentro')) {
      return resolveEmpresaInfo({ empresaNombre: 'Distribuidora Duncan, C.A.' });
    }
    if (sedeLow.includes('planta') || sedeLow.includes('ruices') || sedeLow.includes('acumuladores')) {
      return resolveEmpresaInfo({ empresaNombre: 'Acumuladores Duncan, C.A.' });
    }
  }

  // 4. Default: Grupo Duncan (Consolidado Corporativo)
  return { ...GRUPO_DUNCAN_DEFAULT };
}
