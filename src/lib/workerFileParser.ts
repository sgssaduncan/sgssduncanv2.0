import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { Empleado } from '../types';

// En entornos cliente web, configurar worker si es necesario
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
}

export interface ParsedWorkerResult {
  success: boolean;
  totalRows: number;
  validRows: Partial<Empleado>[];
  invalidRows: { rowNumber: number; raw: any; reason: string }[];
  warnings: string[];
  fileName: string;
  fileType: 'excel' | 'word' | 'pdf' | 'csv' | 'desconocido';
}

/**
 * Normaliza y formatea cédulas venezolanas al estándar corporativo (V-12345678 / E-12345678)
 */
export function normalizeCedula(val: any): string | null {
  if (!val) return null;
  const str = String(val).trim().toUpperCase();
  const digits = str.replace(/[^0-9]/g, '');
  if (digits.length < 4 || digits.length > 9) return null;

  const prefix = str.startsWith('E') ? 'E-' : 'V-';
  return `${prefix}${digits}`;
}

/**
 * Identifica con precisión las columnas del archivo de nómina y trabajadores
 * Soporta las 22 columnas completas del ERP Duncan sin colisiones de subcadenas.
 */
export function identifyWorkerColumns(headerRow: any[]): Record<string, number> {
  const colMap: Record<string, number> = {};
  const cleanHeaders = (headerRow || []).map(c => String(c || '').toLowerCase().trim().replace(/[\s\-_]+/g, '_'));

  cleanHeaders.forEach((t, col) => {
    // 1. Cédula de Identidad (evitar coincidencias con residencia o provincia)
    if (
      t.includes('cedula') ||
      t.includes('cédula') ||
      t.includes('identidad') ||
      t.includes('identificacion') ||
      t === 'ci' ||
      t === 'c_i' ||
      t === 'c_i_' ||
      t.startsWith('ci_') ||
      t.endsWith('_ci')
    ) {
      if (!t.includes('residencia') && !t.includes('provincia') && !t.includes('domicilio')) {
        colMap['cedula'] = col;
      }
    }
    // 2. Nombre y Apellido del trabajador
    else if (
      t.includes('apellidos_y_nombres') ||
      t.includes('nombres_y_apellidos') ||
      t.includes('apellido_y_nombre') ||
      t.includes('nombre_y_apellido') ||
      t.includes('apellidos') ||
      t.includes('trabajador') ||
      t.includes('colaborador') ||
      t.includes('empleado_nombre')
    ) {
      colMap['nombre'] = col;
    }
    // 3. Empresa
    else if (t.includes('empresa') || t.includes('razon_social') || t.includes('compañia')) {
      colMap['empresaNombre'] = col;
    }
    // 4. Tipo de Nómina
    else if (t.includes('nomina') || t.includes('nómina')) {
      colMap['nombreNomina'] = col;
    }
    // 5. Situación (código de situación)
    else if (t.includes('situacion') || t.includes('situación')) {
      colMap['codigoSituacion'] = col;
    }
    // 6. Código de Empleado (Ficha)
    else if (t.includes('codigo_empleado') || t.includes('cod_empleado') || t === 'codigo' || t === 'cod' || t.includes('ficha')) {
      colMap['codigoEmpleado'] = col;
    }
    // 7. Cargo
    else if (t.includes('cargo') || t.includes('puesto') || t.includes('ocupacion') || t.includes('ocupación')) {
      colMap['cargo'] = col;
    }
    // 8. Departamento
    else if (t.includes('departamento') || t.includes('depto') || t.includes('gerencia') || t.includes('area') || t.includes('área')) {
      colMap['departamento'] = col;
    }
    // 9. Sucursal / Sede / Localidad
    else if (t.includes('sucursal') || t.includes('sede') || t.includes('planta') || t.includes('localidad')) {
      colMap['sucursal'] = col;
    }
    // 10. Sexo / Género
    else if (t === 'sexo' || t === 'genero' || t === 'género') {
      colMap['sexo'] = col;
    }
    // 11. Fecha Nacimiento
    else if (t.includes('nacimiento') || t.includes('fecha_nac')) {
      colMap['fechaNacimiento'] = col;
    }
    // 12. Fecha Ingreso
    else if (t.includes('fecha_de_ingreso') || t.includes('fecha_ingreso') || t === 'ingreso') {
      colMap['fechaIngreso'] = col;
    }
    // 13. Antigüedad
    else if (t.includes('antiguedad_anos') || t.includes('antiguedad_años') || t.includes('antiguedad_ano')) {
      colMap['antiguedadAnos'] = col;
    }
    else if (t.includes('antiguedad_meses') || t.includes('antiguedad_mes')) {
      colMap['antiguedadMeses'] = col;
    }
    else if (t.includes('antiguedad_dias') || t.includes('antiguedad_dia')) {
      colMap['antiguedadDias'] = col;
    }
    // 14. Centros de Costos
    else if (t.includes('numero_centro_de_costos') || t.includes('numero_centro_costo') || t.includes('num_centro_costo') || t.includes('centro_costo_num')) {
      colMap['numeroCentroCostos'] = col;
    }
    else if (t.includes('centro_costos_descripcion') || t.includes('centro_costo_desc') || t.includes('desc_centro_costo')) {
      colMap['centroCostosDescripcion'] = col;
    }
    else if (t.includes('tipo_centro_de_costo') || t.includes('tipo_centro_costo')) {
      colMap['tipoCentroCosto'] = col;
    }
    // 15. Vencimiento Contrato
    else if (t.includes('vencimiento_contrato') || t.includes('vencimiento')) {
      colMap['fechaVencimientoContrato'] = col;
    }
    // 16. Residencia
    else if (t.includes('direccion_residencia') || (t.includes('direccion') && t.includes('residencia'))) {
      colMap['direccionResidencia'] = col;
    }
    else if (t.includes('ciudad_residencia') || (t.includes('ciudad') && t.includes('residencia'))) {
      colMap['ciudadResidencia'] = col;
    }
    else if (t.includes('estado_residencia') || (t.includes('estado') && t.includes('residencia'))) {
      colMap['estadoResidencia'] = col;
    }
    // 17. Tallas si vienen en la nómina
    else if (t.includes('talla_calzado') || t.includes('calzado') || t.includes('botas')) {
      colMap['tallaCalzado'] = col;
    }
    else if (t.includes('talla_camisa') || t.includes('camisa') || t.includes('franela') || t.includes('chemise')) {
      colMap['tallaCamisa'] = col;
    }
    else if (t.includes('talla_pantalon') || t.includes('pantalon') || t.includes('pantalón')) {
      colMap['tallaPantalon'] = col;
    }
    // Fallback genéricos
    else if (t === 'nombre' && colMap['nombre'] === undefined) {
      colMap['nombre'] = col;
    }
    else if (t === 'direccion' && colMap['direccionResidencia'] === undefined) {
      colMap['direccionResidencia'] = col;
    }
    else if (t === 'ciudad' && colMap['ciudadResidencia'] === undefined) {
      colMap['ciudadResidencia'] = col;
    }
    else if (t === 'estado' && colMap['estadoResidencia'] === undefined) {
      colMap['estadoResidencia'] = col;
    }
    else if (t.includes('telefono') || t.includes('celular') || t.includes('movil')) {
      colMap['telefono'] = col;
    }
    else if (t.includes('correo') || t.includes('email')) {
      colMap['email'] = col;
    }
  });

  return colMap;
}

/**
 * Parser Inteligente de Archivos de Nómina (Excel, Word, PDF)
 */
export async function parseWorkerFile(file: File): Promise<ParsedWorkerResult> {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase();

  const arrayBuffer = await file.arrayBuffer();

  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
    return parseExcelFile(arrayBuffer, fileName);
  } else if (ext === 'docx') {
    return parseWordFile(arrayBuffer, fileName);
  } else if (ext === 'pdf') {
    return parsePdfFile(arrayBuffer, fileName);
  }

  return {
    success: false,
    totalRows: 0,
    validRows: [],
    invalidRows: [],
    warnings: [`Formato de archivo no soportado (.${ext}). Por favor carga archivos Excel (.xlsx/.xls/.csv), Word (.docx) o PDF (.pdf).`],
    fileName,
    fileType: 'desconocido'
  };
}

// -------------------------------------------------------------
// 1. PARSER EXCEL / CSV
// -------------------------------------------------------------
function parseExcelFile(buffer: ArrayBuffer, fileName: string): ParsedWorkerResult {
  try {
    const wb = XLSX.read(buffer, { type: 'array' });
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const rawMatrix: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (!rawMatrix || rawMatrix.length === 0) {
      return {
        success: false,
        totalRows: 0,
        validRows: [],
        invalidRows: [],
        warnings: ['El archivo Excel está vacío.'],
        fileName,
        fileType: fileName.endsWith('.csv') ? 'csv' : 'excel'
      };
    }

    // Identificar fila de encabezados con el mapeador avanzado de 22 columnas
    let headerIdx = -1;
    let colMap: Record<string, number> = {};

    for (let r = 0; r < Math.min(10, rawMatrix.length); r++) {
      const row = rawMatrix[r] || [];
      const testMap = identifyWorkerColumns(row);
      if (testMap['cedula'] !== undefined && testMap['nombre'] !== undefined) {
        headerIdx = r;
        colMap = testMap;
        break;
      }
    }

    // Fallback si no encontró ambas columnas explícitas en una sola fila
    if (headerIdx === -1) {
      for (let r = 0; r < Math.min(10, rawMatrix.length); r++) {
        const row = rawMatrix[r] || [];
        const testMap = identifyWorkerColumns(row);
        if (testMap['cedula'] !== undefined || testMap['nombre'] !== undefined) {
          headerIdx = r;
          colMap = testMap;
          break;
        }
      }
    }

    if (headerIdx === -1) {
      headerIdx = 0; // Default a primera fila
      colMap = { empresaNombre: 0, nombreNomina: 1, codigoEmpleado: 2, cedula: 3, nombre: 6, cargo: 7, departamento: 14, sucursal: 17 };
    }

    const validRows: Partial<Empleado>[] = [];
    const invalidRows: { rowNumber: number; raw: any; reason: string }[] = [];

    for (let r = headerIdx + 1; r < rawMatrix.length; r++) {
      const row = rawMatrix[r] || [];
      if (row.length === 0 || row.every(c => c === undefined || c === null || String(c).trim() === '')) {
        continue;
      }

      const rawCedula = colMap['cedula'] !== undefined ? row[colMap['cedula']] : row[3];
      const cedula = normalizeCedula(rawCedula);

      const rawNombre = colMap['nombre'] !== undefined ? row[colMap['nombre']] : row[6] || row[1];
      const nombre = String(rawNombre || '').trim();

      if (!cedula) {
        invalidRows.push({ rowNumber: r + 1, raw: row, reason: `Cédula inválida o vacía (${rawCedula})` });
        continue;
      }

      if (!nombre || nombre.length < 3) {
        invalidRows.push({ rowNumber: r + 1, raw: row, reason: `Nombre inválido o vacío (${rawNombre})` });
        continue;
      }

      const cargo = (colMap['cargo'] !== undefined ? String(row[colMap['cargo']] || '') : 'Operador').trim() || 'Operador';
      const departamento = (colMap['departamento'] !== undefined ? String(row[colMap['departamento']] || '') : 'Operaciones').trim() || 'Operaciones';
      const empresaNombre = (colMap['empresaNombre'] !== undefined ? String(row[colMap['empresaNombre']] || '') : 'Acumuladores Duncan, C.A.').trim() || 'Acumuladores Duncan, C.A.';
      const sucursal = colMap['sucursal'] !== undefined ? String(row[colMap['sucursal']] || '').trim() : undefined;
      const nombreNomina = colMap['nombreNomina'] !== undefined ? String(row[colMap['nombreNomina']] || '').trim() : undefined;
      const codigoEmpleado = colMap['codigoEmpleado'] !== undefined ? String(row[colMap['codigoEmpleado']] || '').trim() : undefined;
      const tipoCentroCosto = colMap['tipoCentroCosto'] !== undefined ? String(row[colMap['tipoCentroCosto']] || '').trim() : undefined;
      const codigoSituacion = colMap['codigoSituacion'] !== undefined ? String(row[colMap['codigoSituacion']] || '').trim() : undefined;
      const numeroCentroCostos = colMap['numeroCentroCostos'] !== undefined ? String(row[colMap['numeroCentroCostos']] || '').trim() : undefined;
      const centroCostosDescripcion = colMap['centroCostosDescripcion'] !== undefined ? String(row[colMap['centroCostosDescripcion']] || '').trim() : undefined;
      const fechaVencimientoContrato = colMap['fechaVencimientoContrato'] !== undefined ? formatRawDate(row[colMap['fechaVencimientoContrato']]) : undefined;
      const direccionResidencia = colMap['direccionResidencia'] !== undefined ? String(row[colMap['direccionResidencia']] || '').trim() : undefined;
      const ciudadResidencia = colMap['ciudadResidencia'] !== undefined ? String(row[colMap['ciudadResidencia']] || '').trim() : undefined;
      const estadoResidencia = colMap['estadoResidencia'] !== undefined ? String(row[colMap['estadoResidencia']] || '').trim() : undefined;

      const rawSexo = colMap['sexo'] !== undefined ? String(row[colMap['sexo']] || '').trim().toUpperCase() : '';
      const genero = rawSexo.startsWith('F') ? 'F' : rawSexo.startsWith('M') ? 'M' : undefined;

      const fechaNacimiento = colMap['fechaNacimiento'] !== undefined ? formatRawDate(row[colMap['fechaNacimiento']]) : undefined;
      const fechaIngreso = colMap['fechaIngreso'] !== undefined ? formatRawDate(row[colMap['fechaIngreso']]) : undefined;

      const antiguedadAnos = colMap['antiguedadAnos'] !== undefined && row[colMap['antiguedadAnos']] !== undefined ? Number(row[colMap['antiguedadAnos']]) || 0 : undefined;
      const antiguedadMeses = colMap['antiguedadMeses'] !== undefined && row[colMap['antiguedadMeses']] !== undefined ? Number(row[colMap['antiguedadMeses']]) || 0 : undefined;
      const antiguedadDias = colMap['antiguedadDias'] !== undefined && row[colMap['antiguedadDias']] !== undefined ? Number(row[colMap['antiguedadDias']]) || 0 : undefined;

      const telefono = colMap['telefono'] !== undefined ? String(row[colMap['telefono']] || '').trim() : undefined;
      const email = colMap['email'] !== undefined ? String(row[colMap['email']] || '').trim() : undefined;
      const tallaCalzado = colMap['tallaCalzado'] !== undefined ? String(row[colMap['tallaCalzado']] || '').trim() : undefined;
      const tallaCamisa = colMap['tallaCamisa'] !== undefined ? String(row[colMap['tallaCamisa']] || '').trim() : undefined;
      const tallaPantalon = colMap['tallaPantalon'] !== undefined ? String(row[colMap['tallaPantalon']] || '').trim() : undefined;

      validRows.push({
        cedula,
        nombre,
        cargo,
        departamento,
        empresaNombre,
        sucursal,
        sedeNombre: sucursal,
        nombreNomina,
        codigoEmpleado,
        codigo: codigoEmpleado,
        tipoCentroCosto,
        codigoSituacion,
        numeroCentroCostos,
        centroCostosDescripcion,
        fechaVencimientoContrato,
        direccionResidencia,
        direccion: direccionResidencia,
        ciudadResidencia,
        estadoResidencia,
        genero,
        fechaNacimiento,
        fechaIngreso,
        antiguedadAnos,
        antiguedadMeses,
        antiguedadDias,
        telefono,
        email,
        tallaCalzado,
        tallaCamisa,
        tallaPantalon,
        activo: true
      });
    }

    return {
      success: validRows.length > 0,
      totalRows: validRows.length + invalidRows.length,
      validRows,
      invalidRows,
      warnings: invalidRows.length > 0 ? [`Se omitieron ${invalidRows.length} fila(s) por no contener cédula o nombre válido.`] : [],
      fileName,
      fileType: fileName.endsWith('.csv') ? 'csv' : 'excel'
    };
  } catch (err: any) {
    return {
      success: false,
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      warnings: [`Error procesando archivo Excel: ${err?.message || 'Formato corrupto'}`],
      fileName,
      fileType: 'excel'
    };
  }
}

// -------------------------------------------------------------
// 2. PARSER WORD (.docx)
// -------------------------------------------------------------
async function parseWordFile(buffer: ArrayBuffer, fileName: string): Promise<ParsedWorkerResult> {
  try {
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer: buffer });
    const html = htmlResult.value;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tables = doc.querySelectorAll('table');

    const validRows: Partial<Empleado>[] = [];
    const invalidRows: { rowNumber: number; raw: any; reason: string }[] = [];

    if (tables.length > 0) {
      // Extraer desde tablas HTML del documento Word
      tables.forEach(table => {
        const rows = Array.from(table.querySelectorAll('tr'));
        rows.forEach((tr, rIdx) => {
          const cells = Array.from(tr.querySelectorAll('td, th')).map(c => c.textContent?.trim() || '');
          if (cells.length < 2) return;

          // Buscar celda que contenga cédula
          let cedulaFound: string | null = null;
          let cedulaCol = -1;
          for (let i = 0; i < cells.length; i++) {
            const norm = normalizeCedula(cells[i]);
            if (norm) {
              cedulaFound = norm;
              cedulaCol = i;
              break;
            }
          }

          if (cedulaFound) {
            // Asumir nombre en la siguiente celda o la primera
            const nombre = cells[cedulaCol === 0 ? 1 : 0] || 'Trabajador Duncan';
            const cargo = cells[2] || 'Operador';
            const departamento = cells[3] || 'Operaciones';
            const empresaNombre = cells[4] || 'Distribuidora Duncan, C.A.';

            validRows.push({
              cedula: cedulaFound,
              nombre,
              cargo,
              departamento,
              empresaNombre,
              activo: true
            });
          }
        });
      });
    }

    // Si no hubo tablas, parsear párrafos con regex de cédula
    if (validRows.length === 0) {
      const paragraphs = Array.from(doc.querySelectorAll('p, li')).map(p => p.textContent?.trim() || '');
      paragraphs.forEach((pText, pIdx) => {
        if (!pText) return;
        const cedulaMatch = pText.match(/(?:V|E|V-|E-)?\s*(\d{6,9})/i);
        if (cedulaMatch) {
          const cedula = normalizeCedula(cedulaMatch[1]);
          if (cedula) {
            // Limpiar la cédula del texto para obtener nombre y posible cargo
            const resto = pText.replace(cedulaMatch[0], '').replace(/[-–,;:|]/g, ' ').replace(/\s+/g, ' ').trim();
            const partes = resto.split(/\s{2,}|\t|\s+-\s+/);
            const nombre = partes[0] || 'Trabajador Duncan';
            const cargo = partes[1] || 'Operador';

            validRows.push({
              cedula,
              nombre,
              cargo,
              departamento: 'Operaciones',
              empresaNombre: 'Distribuidora Duncan, C.A.',
              activo: true
            });
          }
        }
      });
    }

    return {
      success: validRows.length > 0,
      totalRows: validRows.length,
      validRows,
      invalidRows,
      warnings: validRows.length === 0 ? ['No se encontraron tablas o registros con cédulas reconocibles en el documento Word.'] : [],
      fileName,
      fileType: 'word'
    };
  } catch (err: any) {
    return {
      success: false,
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      warnings: [`Error leyendo documento Word: ${err?.message || 'Error de parseo'}`],
      fileName,
      fileType: 'word'
    };
  }
}

// -------------------------------------------------------------
// 3. PARSER PDF (.pdf)
// -------------------------------------------------------------
async function parsePdfFile(buffer: ArrayBuffer, fileName: string): Promise<ParsedWorkerResult> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    const validRows: Partial<Empleado>[] = [];
    const invalidRows: { rowNumber: number; raw: any; reason: string }[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Agrupar items de texto por coordenada vertical Y
      const lineMap: Record<number, { text: string; x: number }[]> = {};
      textContent.items.forEach((item: any) => {
        if (!item.str || !item.str.trim()) return;
        const y = Math.round(item.transform[5]);
        const x = Math.round(item.transform[4]);
        if (!lineMap[y]) lineMap[y] = [];
        lineMap[y].push({ text: item.str.trim(), x });
      });

      // Ordenar líneas de arriba a abajo
      const sortedYs = Object.keys(lineMap).map(Number).sort((a, b) => b - a);

      sortedYs.forEach(y => {
        const lineItems = lineMap[y].sort((a, b) => a.x - b.x);
        const fullLine = lineItems.map(i => i.text).join(' ');

        // Buscar cédula en la línea
        const cedulaMatch = fullLine.match(/\b([VE]-?\d{6,9})\b|\b(\d{7,8})\b/i);
        if (cedulaMatch) {
          const rawCed = cedulaMatch[1] || cedulaMatch[2];
          const cedula = normalizeCedula(rawCed);

          if (cedula) {
            // Dividir por columnas o separar por espacios
            const parts = fullLine.replace(rawCed, '').split(/\s{2,}|\t|\|/).map(s => s.trim()).filter(Boolean);
            const nombre = parts[0] || (lineItems[0]?.text !== rawCed ? lineItems[0]?.text : lineItems[1]?.text) || 'Colaborador Duncan';
            const cargo = parts[1] || 'Operador de Planta';
            const departamento = parts[2] || 'Producción';

            validRows.push({
              cedula,
              nombre,
              cargo,
              departamento,
              empresaNombre: 'Acumuladores Duncan, C.A.',
              activo: true
            });
          }
        }
      });
    }

    return {
      success: validRows.length > 0,
      totalRows: validRows.length,
      validRows,
      invalidRows,
      warnings: validRows.length === 0 ? ['No se lograron extraer registros de nómina con cédula en el PDF. Verifique que no sea un documento escaneado como imagen.'] : [],
      fileName,
      fileType: 'pdf'
    };
  } catch (err: any) {
    return {
      success: false,
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      warnings: [`Error procesando PDF: ${err?.message || 'Archivo corrupto o protegido'}`],
      fileName,
      fileType: 'pdf'
    };
  }
}

function formatRawDate(rawVal: any): string | undefined {
  if (!rawVal) return undefined;
  if (typeof rawVal === 'number') {
    // Fecha serial de Excel
    const date = new Date(Math.round((rawVal - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  const str = String(rawVal).trim();
  if (str.includes('/') || str.includes('-')) {
    const parts = str.split(/[\/\-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return str;
}
