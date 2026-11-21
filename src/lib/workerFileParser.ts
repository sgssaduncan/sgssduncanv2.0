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
  if (digits.length < 5 || digits.length > 9) return null;

  const prefix = str.startsWith('E') ? 'E-' : 'V-';
  return `${prefix}${digits}`;
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

    // Identificar fila de encabezados
    let headerIdx = -1;
    let colMap: Record<string, number> = {};

    for (let r = 0; r < Math.min(10, rawMatrix.length); r++) {
      const row = rawMatrix[r] || [];
      const rowText = row.map(c => String(c || '').toLowerCase().trim());
      
      const hasCedula = rowText.some(t => t.includes('cedula') || t.includes('cédula') || t.includes('ci') || t.includes('identificacion') || t.includes('documento'));
      const hasNombre = rowText.some(t => t.includes('nombre') || t.includes('trabajador') || t.includes('empleado') || t.includes('colaborador') || t.includes('apellido'));

      if (hasCedula || hasNombre) {
        headerIdx = r;
        rowText.forEach((t, col) => {
          if (t.includes('cedula') || t.includes('cédula') || t.includes('ci') || t.includes('identificacion')) colMap['cedula'] = col;
          else if (t.includes('nombre') || t.includes('trabajador') || t.includes('colaborador') || t.includes('empleado')) colMap['nombre'] = col;
          else if (t.includes('cargo') || t.includes('puesto') || t.includes('ocupacion')) colMap['cargo'] = col;
          else if (t.includes('departamento') || t.includes('area') || t.includes('área') || t.includes('gerencia')) colMap['departamento'] = col;
          else if (t.includes('empresa') || t.includes('razon') || t.includes('compañia')) colMap['empresaNombre'] = col;
          else if (t.includes('sede') || t.includes('establecimiento') || t.includes('localidad') || t.includes('sucursal')) colMap['sedeNombre'] = col;
          else if (t.includes('ingreso') || t.includes('fecha ingreso')) colMap['fechaIngreso'] = col;
          else if (t.includes('vacaciones') || t.includes('disfrute') || t.includes('descanso')) colMap['ultimoDisfruteVacacional'] = col;
          else if (t.includes('telefono') || t.includes('celular') || t.includes('movil')) colMap['telefono'] = col;
          else if (t.includes('correo') || t.includes('email')) colMap['email'] = col;
          else if (t.includes('genero') || t.includes('sexo')) colMap['genero'] = col;
        });
        break;
      }
    }

    if (headerIdx === -1) {
      headerIdx = 0; // Default a primera fila
      colMap = { cedula: 0, nombre: 1, cargo: 2, departamento: 3, empresaNombre: 4, sedeNombre: 5 };
    }

    const validRows: Partial<Empleado>[] = [];
    const invalidRows: { rowNumber: number; raw: any; reason: string }[] = [];

    for (let r = headerIdx + 1; r < rawMatrix.length; r++) {
      const row = rawMatrix[r] || [];
      if (row.length === 0 || row.every(c => c === undefined || c === null || String(c).trim() === '')) {
        continue;
      }

      const rawCedula = colMap['cedula'] !== undefined ? row[colMap['cedula']] : row[0];
      const cedula = normalizeCedula(rawCedula);

      const rawNombre = colMap['nombre'] !== undefined ? row[colMap['nombre']] : row[1];
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
      const empresaNombre = (colMap['empresaNombre'] !== undefined ? String(row[colMap['empresaNombre']] || '') : 'Distribuidora Duncan, C.A.').trim() || 'Distribuidora Duncan, C.A.';
      const sedeNombre = colMap['sedeNombre'] !== undefined ? String(row[colMap['sedeNombre']] || '').trim() : undefined;
      const telefono = colMap['telefono'] !== undefined ? String(row[colMap['telefono']] || '').trim() : undefined;
      const email = colMap['email'] !== undefined ? String(row[colMap['email']] || '').trim() : undefined;
      const fechaIngreso = colMap['fechaIngreso'] !== undefined ? formatRawDate(row[colMap['fechaIngreso']]) : undefined;
      const ultimoDisfruteVacacional = colMap['ultimoDisfruteVacacional'] !== undefined ? formatRawDate(row[colMap['ultimoDisfruteVacacional']]) : undefined;

      validRows.push({
        cedula,
        nombre,
        cargo,
        departamento,
        empresaNombre,
        sedeNombre,
        telefono,
        email,
        fechaIngreso,
        ultimoDisfruteVacacional,
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
