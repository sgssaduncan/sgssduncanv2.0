/**
 * Catálogo Maestro de Tallas Normativas y Estandarizadas
 * SG-SST Duncan 2.0 (COVENIN / LOPCYMAT / NT-03-2016)
 * 
 * Soporta calzados, guantes de diversos tipos, pantalones de damas, pantalones de caballeros,
 * camisas, franelas, chemises, chalecos, chaquetas, bragas y protecciones específicas.
 */

import type { InventarioItem, Empleado } from '../types';

export type TipoImplemento =
  | 'CALZADO'
  | 'GUANTES'
  | 'PANTALON_DAMAS'
  | 'PANTALON_CABALLEROS'
  | 'CAMISAS'
  | 'FRANELAS'
  | 'CHEMISES'
  | 'CHALECOS'
  | 'CHAQUETAS'
  | 'BRAGAS'
  | 'RESPIRADORES'
  | 'FAJAS_LUMBARES'
  | 'PROTECCION_GENERAL'
  | 'UNICA';

export const CATALOGO_TALLAS: Record<TipoImplemento, string[]> = {
  CALZADO: [
    '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'
  ],
  GUANTES: [
    '7 (S - Pequeño)',
    '8 (M - Mediano)',
    '9 (L - Grande)',
    '10 (XL - Extra Grande)',
    '11 (XXL - Doble Grande)',
    'S',
    'M',
    'L',
    'XL'
  ],
  PANTALON_DAMAS: [
    '02 (Dama)',
    '04 (Dama)',
    '06 (Dama)',
    '08 (Dama)',
    '10 (Dama)',
    '12 (Dama)',
    '14 (Dama)',
    '16 (Dama)',
    '18 (Dama)',
    '20 (Dama)',
    '26', '28', '30', '32', '34', '36', '38'
  ],
  PANTALON_CABALLEROS: [
    '28 (Caballero)',
    '30 (Caballero)',
    '32 (Caballero)',
    '34 (Caballero)',
    '36 (Caballero)',
    '38 (Caballero)',
    '40 (Caballero)',
    '42 (Caballero)',
    '44 (Caballero)',
    '46 (Caballero)',
    '48 (Caballero)',
    '50 (Caballero)'
  ],
  CAMISAS: [
    'S (Small)',
    'M (Medium)',
    'L (Large)',
    'XL (Extra Large)',
    'XXL (2XL)',
    '3XL (3X Large)',
    '4XL (4X Large)',
    '14', '14½', '15', '15½', '16', '16½', '17', '17½', '18'
  ],
  FRANELAS: [
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '3XL'
  ],
  CHEMISES: [
    'S (Dama)',
    'M (Dama)',
    'L (Dama)',
    'XL (Dama)',
    'XXL (Dama)',
    'S (Caballero)',
    'M (Caballero)',
    'L (Caballero)',
    'XL (Caballero)',
    'XXL (Caballero)',
    '3XL',
    '4XL'
  ],
  CHALECOS: [
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '3XL',
    'ÚNICA / AJUSTABLE'
  ],
  CHAQUETAS: [
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '3XL',
    '4XL'
  ],
  BRAGAS: [
    '34',
    '36',
    '38',
    '40',
    '42',
    '44',
    '46',
    '48',
    '50'
  ],
  RESPIRADORES: [
    'S (Pequeño)',
    'M (Mediano)',
    'L (Grande)'
  ],
  FAJAS_LUMBARES: [
    'S (28-32)',
    'M (32-36)',
    'L (36-40)',
    'XL (40-44)',
    'XXL (44-48)'
  ],
  PROTECCION_GENERAL: [
    'S',
    'M',
    'L',
    'XL',
    'ÚNICA',
    'AJUSTABLE'
  ],
  UNICA: [
    'ÚNICA',
    'AJUSTABLE',
    'ESTÁNDAR'
  ]
};

/**
 * Detecta automáticamente el tipo de prenda o implemento basado en el nombre y categoría
 */
export function detectarTipoImplemento(nombre: string = '', categoria: string = '', genero?: 'M' | 'F'): TipoImplemento {
  const txt = `${nombre} ${categoria}`.toLowerCase();

  // Calzado
  if (
    txt.includes('bota') ||
    txt.includes('calzado') ||
    txt.includes('zapato') ||
    txt.includes('escarp') ||
    txt.includes('pies') ||
    txt.includes('piernas')
  ) {
    return 'CALZADO';
  }

  // Guantes
  if (
    txt.includes('guante') ||
    txt.includes('manopla') ||
    txt.includes('manos') ||
    txt.includes('brazos')
  ) {
    return 'GUANTES';
  }

  // Pantalones
  if (txt.includes('pantalon') || txt.includes('pantalón') || txt.includes('jean') || txt.includes('bermuda')) {
    if (txt.includes('dama') || txt.includes('mujer') || genero === 'F') {
      return 'PANTALON_DAMAS';
    }
    return 'PANTALON_CABALLEROS';
  }

  // Camisas
  if (txt.includes('camisa') || txt.includes('guayabera')) {
    return 'CAMISAS';
  }

  // Franelas
  if (txt.includes('franela') || txt.includes('remera') || txt.includes('t-shirt') || txt.includes('camiseta')) {
    return 'FRANELAS';
  }

  // Chemises
  if (txt.includes('chemise') || txt.includes('chemisse') || txt.includes('polo')) {
    return 'CHEMISES';
  }

  // Chalecos
  if (txt.includes('chaleco') || txt.includes('reflectivo')) {
    return 'CHALECOS';
  }

  // Chaquetas / Impermeables
  if (
    txt.includes('chaqueta') ||
    txt.includes('impermeable') ||
    txt.includes('abrigo') ||
    txt.includes('chubasquero')
  ) {
    return 'CHAQUETAS';
  }

  // Bragas / Overoles
  if (txt.includes('braga') || txt.includes('overol') || txt.includes('mono de trabajo')) {
    return 'BRAGAS';
  }

  // Fajas lumbares
  if (txt.includes('faja') || txt.includes('lumbar')) {
    return 'FAJAS_LUMBARES';
  }

  // Respiradores
  if (txt.includes('respirador') || txt.includes('semimascara') || txt.includes('semimáscara') || txt.includes('mascara')) {
    return 'RESPIRADORES';
  }

  // Cascos, Lentes, Auditivos, Filtros, Arneses, Delantales, Accesorios y Protecciones de Talla Única / Estándar
  if (
    txt.includes('casco') ||
    txt.includes('lente') ||
    txt.includes('careta') ||
    txt.includes('pantalla') ||
    txt.includes('auditivo') ||
    txt.includes('tapon') ||
    txt.includes('tapón') ||
    txt.includes('copa') ||
    txt.includes('delantal') ||
    txt.includes('mandil') ||
    txt.includes('filtro') ||
    txt.includes('cartucho') ||
    txt.includes('prefiltro') ||
    txt.includes('arnes') ||
    txt.includes('arnés') ||
    txt.includes('eslinga') ||
    txt.includes('linea de vida') ||
    txt.includes('línea de vida') ||
    txt.includes('barbiquejo') ||
    txt.includes('bloqueo') ||
    txt.includes('candado') ||
    txt.includes('loto') ||
    txt.includes('facial') ||
    txt.includes('monogafa') ||
    txt.includes('sobrelente')
  ) {
    return 'UNICA';
  }

  // Ropa de trabajo genérica
  if (txt.includes('uniforme') || txt.includes('ropa')) {
    return 'CAMISAS';
  }

  return 'PROTECCION_GENERAL';
}

export interface OpcionTalla {
  talla: string;
  cantidadStock: number;
  enStock: boolean;
  esRecomendada: boolean;
  label: string;
}

/**
 * Obtiene todas las opciones de tallas para un artículo de inventario,
 * fusionando las tallas registradas en stock con las tallas estándar del catálogo,
 * y destacando la talla asignada al trabajador.
 */
export function obtenerOpcionesTalla(
  item?: InventarioItem,
  empleado?: Empleado
): OpcionTalla[] {
  if (!item) return [];

  const tipo = detectarTipoImplemento(item.nombre, item.categoria, empleado?.genero);
  const tallasEstandar = CATALOGO_TALLAS[tipo] || CATALOGO_TALLAS.PROTECCION_GENERAL;

  // Mapa de stock registrado en inventario
  const stockMap = new Map<string, number>();
  (item.stock || []).forEach(s => {
    if (s && s.talla !== undefined && s.talla !== null) {
      const normalizada = String(s.talla).trim();
      if (normalizada) {
        stockMap.set(normalizada.toUpperCase(), Number(s.cantidad) || 0);
      }
    }
  });

  // Talla asignada al trabajador para este tipo de implemento
  let tallaTrabajador = '';
  if (empleado) {
    if (tipo === 'CALZADO') {
      tallaTrabajador = String(empleado.tallaCalzado || '').trim().toUpperCase();
    } else if (tipo === 'PANTALON_DAMAS' || tipo === 'PANTALON_CABALLEROS' || tipo === 'BRAGAS') {
      tallaTrabajador = String(empleado.tallaPantalon || '').trim().toUpperCase();
    } else if (
      tipo === 'CAMISAS' ||
      tipo === 'FRANELAS' ||
      tipo === 'CHEMISES' ||
      tipo === 'CHALECOS' ||
      tipo === 'CHAQUETAS' ||
      tipo === 'PROTECCION_GENERAL'
    ) {
      tallaTrabajador = String(empleado.tallaCamisa || '').trim().toUpperCase();
    }
  }

  // Lista combinada única de tallas (primero las que tienen stock, luego el resto del catálogo)
  const todasLasTallasSet = new Set<string>();

  // Agregar tallas con stock real
  for (const [talla] of stockMap.entries()) {
    todasLasTallasSet.add(talla);
  }

  // Agregar tallas del catálogo estándar para este tipo
  tallasEstandar.forEach(t => todasLasTallasSet.add(t));

  // Si el trabajador tiene una talla registrada y no está en la lista, agregarla
  if (tallaTrabajador) {
    todasLasTallasSet.add(tallaTrabajador);
  }

  const opciones: OpcionTalla[] = [];

  todasLasTallasSet.forEach(talla => {
    const cantidad = stockMap.get(talla.toUpperCase()) ?? 0;
    const enStock = cantidad > 0;

    // Verificar si coincide con la talla del trabajador
    const esRecomendada =
      !!tallaTrabajador &&
      (talla.toUpperCase() === tallaTrabajador ||
        talla.toUpperCase().startsWith(tallaTrabajador) ||
        tallaTrabajador.startsWith(talla.toUpperCase()));

    let label = talla;
    if (enStock) {
      label += ` (Disp: ${cantidad} unds)`;
    } else {
      label += ` (Sin Stock / Pedido a Compras)`;
    }

    if (esRecomendada) {
      label += ' ⭐ Asignada a Trabajador';
    }

    opciones.push({
      talla,
      cantidadStock: cantidad,
      enStock,
      esRecomendada,
      label
    });
  });

  // Ordenar: primero la recomendada del trabajador, luego las que tienen stock, luego las demás
  return opciones.sort((a, b) => {
    if (a.esRecomendada && !b.esRecomendada) return -1;
    if (!a.esRecomendada && b.esRecomendada) return 1;
    if (a.enStock && !b.enStock) return -1;
    if (!a.enStock && b.enStock) return 1;
    return a.talla.localeCompare(b.talla, undefined, { numeric: true });
  });
}

/**
 * Obtiene la talla recomendada sugerida para un implemento y trabajador
 */
export function obtenerTallaSugerida(item?: InventarioItem, empleado?: Empleado): string {
  if (!item || !empleado) return '';
  const tipo = detectarTipoImplemento(item.nombre, item.categoria, empleado.genero);

  if (tipo === 'CALZADO' && empleado.tallaCalzado) {
    return String(empleado.tallaCalzado).trim();
  }
  if ((tipo === 'PANTALON_DAMAS' || tipo === 'PANTALON_CABALLEROS' || tipo === 'BRAGAS') && empleado.tallaPantalon) {
    return String(empleado.tallaPantalon).trim();
  }
  if (
    (tipo === 'CAMISAS' ||
      tipo === 'FRANELAS' ||
      tipo === 'CHEMISES' ||
      tipo === 'CHALECOS' ||
      tipo === 'CHAQUETAS') &&
    empleado.tallaCamisa
  ) {
    return String(empleado.tallaCamisa).trim();
  }

  // Si el item tiene stock disponible, tomar la primera con stock > 0
  const stockConDisponibilidad = (item.stock || []).find(s => s && Number(s.cantidad) > 0);
  if (stockConDisponibilidad && stockConDisponibilidad.talla !== undefined) {
    return String(stockConDisponibilidad.talla).trim();
  }

  return '';
}

/**
 * Determina con precisión si un implemento o equipo de seguridad requiere selección de talla
 * por parte del solicitante (e.g. Calzados, Pantalones, Camisas, Franelas, Chemises, Chaquetas).
 * Equipos como Cascos, Lentes, Caretas, Protectores Auditivos, Filtros, Cartuchos, Delantales,
 * Candados LOTO, etc., NO requieren talla obligatoria y aplican como Única / Estándar / N/A.
 */
export function requiereTalla(item?: InventarioItem): boolean {
  if (!item) return false;
  if ((item as any).tieneTalla === false) return false;
  if ((item as any).tieneTalla === true) return true;

  // Si en el stock registrado sólo existe 'UNICA', 'AJUSTABLE', 'ESTÁNDAR' o 'N/A', no requiere selección de talla
  if (Array.isArray(item.stock) && item.stock.length > 0) {
    const tallasValidas = item.stock.filter(s => s && s.talla !== undefined && s.talla !== null && String(s.talla).trim() !== '');
    if (tallasValidas.length > 0) {
      const soloTallasUnicas = tallasValidas.every(s =>
        ['UNICA', 'ÚNICA', 'AJUSTABLE', 'ESTÁNDAR', 'ESTANDAR', 'N/A'].includes(String(s.talla).trim().toUpperCase())
      );
      if (soloTallasUnicas) return false;
    }
  }

  const tipo = detectarTipoImplemento(item.nombre, item.categoria);
  switch (tipo) {
    case 'CALZADO':
    case 'PANTALON_DAMAS':
    case 'PANTALON_CABALLEROS':
    case 'CAMISAS':
    case 'FRANELAS':
    case 'CHEMISES':
    case 'BRAGAS':
    case 'CHAQUETAS':
      return true;
    case 'GUANTES':
    case 'CHALECOS':
    case 'FAJAS_LUMBARES':
    case 'RESPIRADORES': {
      // Si el item tiene tallas específicas en stock distintas de Única/Ajustable, puede requerir talla
      const hasSpecificSizes = (item.stock || []).some(
        s => s && s.talla !== undefined && s.talla !== null && !['UNICA', 'ÚNICA', 'AJUSTABLE', 'ESTÁNDAR', 'ESTANDAR', 'N/A', ''].includes(String(s.talla).trim().toUpperCase())
      );
      return hasSpecificSizes;
    }
    case 'UNICA':
    case 'PROTECCION_GENERAL':
    default:
      return false;
  }
}

