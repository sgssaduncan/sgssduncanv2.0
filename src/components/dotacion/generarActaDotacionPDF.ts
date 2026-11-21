import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DUNCAN_LOGO_BW } from '../../lib/logos';
import type { SolicitudEPP, EntregaEPP, Empleado, InventarioItem } from '../../types';

export const formatDateString = (dateObj: any): string => {
  if (!dateObj) return 'N/A';
  if (dateObj.toDate) {
    return dateObj.toDate().toLocaleDateString('es-VE');
  }
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('es-VE');
};

export interface GenerarActaParams {
  solicitud: SolicitudEPP;
  empleado?: Empleado;
  inventario: InventarioItem[];
  entrega?: EntregaEPP;
}

export function generarActaDotacionPDF({
  solicitud,
  empleado,
  inventario,
  entrega
}: GenerarActaParams): { doc: jsPDF; fileName: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 187.9 mm
  let currentY = 13;

  // ==========================================
  // PÁGINA 1
  // ==========================================

  // 1. HEADER CORPORATIVO OFICIAL DUNCAN (BLANCO Y NEGRO OBLIGATORIO)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(marginX, currentY, contentWidth, 23);

  const col1W = 42;
  const col3W = 54;
  const col2W = contentWidth - col1W - col3W; // 91.9 mm

  doc.line(marginX + col1W, currentY, marginX + col1W, currentY + 23);
  doc.line(marginX + col1W + col2W, currentY, marginX + col1W + col2W, currentY + 23);

  // Logo Oficial Duncan B&W
  try {
    const logoW = 34;
    const logoH = 11;
    doc.addImage(DUNCAN_LOGO_BW, 'PNG', marginX + (col1W - logoW) / 2, currentY + 2.5, logoW, logoH);
  } catch (e) {
    console.warn('Error insertando logo en Dotacion', e);
  }

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('GESTIÓN INTEGRAL SSA', marginX + col1W / 2, currentY + 17, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text('SEGURIDAD Y SALUD LABORAL', marginX + col1W / 2, currentY + 20.5, { align: 'center' });

  // Columna 2: Título Central Normativo
  const centerColX = marginX + col1W + col2W / 2;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO', centerColX, currentY + 6.5, { align: 'center' });

  doc.setFontSize(10.5);
  doc.text('ACTA OFICIAL DE ENTREGA DE DOTACIÓN Y E.P.P.', centerColX, currentY + 12.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  doc.text('CUMPLIMIENTO ESTRICTO LOPCYMAT ART. 53, 54, 59-62 / NT-03-2016', centerColX, currentY + 17.5, { align: 'center' });
  doc.text('ESPECIFICACIONES TÉCNICAS Y LIMITACIONES DE PROTECCIÓN', centerColX, currentY + 21, { align: 'center' });

  // Columna 3: Metadatos de Control Documental ISO
  const col3X = marginX + col1W + col2W;
  doc.setLineWidth(0.2);
  doc.line(col3X, currentY + 5.75, col3X + col3W, currentY + 5.75);
  doc.line(col3X, currentY + 11.5, col3X + col3W, currentY + 11.5);
  doc.line(col3X, currentY + 17.25, col3X + col3W, currentY + 17.25);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('CÓDIGO DOC:', col3X + 2, currentY + 4.2);
  doc.text('N° SOLICITUD:', col3X + 2, currentY + 9.8);
  doc.text('FECHA EMISIÓN:', col3X + 2, currentY + 15.6);
  doc.text('ESTATUS:', col3X + 2, currentY + 21.2);

  doc.setFont('helvetica', 'normal');
  doc.text('SST-F-DOT-ACTA-V2', col3X + 21, currentY + 4.2);
  doc.text((solicitud.id || 'DOT-001').substring(0, 16).toUpperCase(), col3X + 21, currentY + 9.8);
  doc.text(formatDateString(solicitud.createdAt || solicitud.fechaSolicitud), col3X + 21, currentY + 15.6);
  doc.setFont('helvetica', 'bold');
  doc.text((solicitud.estado || 'REGISTRADA').toUpperCase(), col3X + 21, currentY + 21.2);

  currentY += 26;

  // 2. SECCIÓN 1.0: DATOS DE IDENTIFICACIÓN
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(marginX, currentY, contentWidth, 5.5, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('1.0 DATOS DE IDENTIFICACIÓN DEL TRABAJADOR Y ENTIDAD DE TRABAJO', marginX + 3, currentY + 4);
  currentY += 5.5;

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.2,
      cellPadding: 1.8,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2
    },
    body: [
      [
        { content: 'TRABAJADOR:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 28 } },
        { content: (empleado?.nombre || 'N/A').toUpperCase(), styles: { fontStyle: 'bold', cellWidth: 66 } },
        { content: 'CÉDULA / ID:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 26 } },
        { content: empleado?.cedula || 'N/A', styles: { fontStyle: 'bold', cellWidth: contentWidth - 120 } }
      ],
      [
        { content: 'CARGO ACTUAL:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
        { content: (empleado?.cargo || 'N/A').toUpperCase() },
        { content: 'DEPARTAMENTO:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
        { content: (empleado?.departamento || 'OPERACIONES / SST').toUpperCase() }
      ],
      [
        { content: 'EMPLEADOR:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
        { content: 'ACUMULADORES DUNCAN, S.A. (RIF J-00045090-0)' },
        { content: 'SEDE / PLANTA:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
        { content: ((empleado as any)?.sede || (empleado as any)?.localidad || 'PLANTA PRINCIPAL LOS RUICES').toUpperCase() }
      ],
      [
        { content: 'MOTIVO ASIGNACIÓN:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
        { content: (solicitud.motivo || 'DOTACIÓN ORDINARIA DE LEY').toUpperCase() },
        { content: 'FECHA ENTREGA:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
        { content: entrega?.fechaEntrega ? formatDateString(entrega.fechaEntrega) : formatDateString(new Date()) }
      ]
    ]
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 3. SECCIÓN 2.0: DETALLE DE IMPLEMENTOS SUMINISTRADOS
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(marginX, currentY, contentWidth, 5.5, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('2.0 DETALLE EXHAUSTIVO DE IMPLEMENTOS, PROTECCIONES PERSONALES Y UNIFORMES', marginX + 3, currentY + 4);
  currentY += 5.5;

  const itemsRows = (solicitud.items || []).map((it, idx) => {
    const inv = (inventario || []).find(i => i.id === it.itemId);
    return [
      `0${idx + 1}`,
      inv?.codigo || 'S/C',
      (inv?.nombre || `EQUIPO (${it.itemId})`).toUpperCase(),
      (inv?.categoria || 'EPP').toUpperCase(),
      (inv?.documentoEficacia || 'COVENIN / ANSI').toUpperCase(),
      it.talla || 'ÚNICA',
      String(it.cantidad || 1),
      (inv as any)?.vidaUtilMeses ? `${(inv as any).vidaUtilMeses} MESES` : '6 MESES'
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
    theme: 'grid',
    headStyles: {
      fillColor: [226, 232, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 6.8,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      halign: 'center'
    },
    styles: {
      font: 'helvetica',
      fontSize: 7,
      cellPadding: 1.8,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 20, fontStyle: 'bold' },
      2: { halign: 'left' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 34, halign: 'left', fontSize: 6.5 },
      5: { cellWidth: 14, halign: 'center' },
      6: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 18, halign: 'center', fontSize: 6.5 }
    },
    head: [['POS', 'CÓDIGO', 'DESCRIPCIÓN DEL IMPLEMENTO / UNIFORME', 'TIPO', 'NORMA TÉCNICA', 'TALLA', 'CANT', 'VIDA ÚTIL']],
    body: itemsRows.length > 0 ? itemsRows : [['01', 'N/A', 'SIN ARTÍCULOS REGISTRADOS', '-', '-', '-', '0', '-']]
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 4. SECCIÓN 3.0: ESPECIFICACIONES TÉCNICAS Y LIMITACIONES DE PROTECCIÓN
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(marginX, currentY, contentWidth, 5.5, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('3.0 ESPECIFICACIONES TÉCNICAS Y LIMITACIONES DE LAS PROTECCIONES Y UNIFORMES', marginX + 3, currentY + 4);
  currentY += 5.5;

  // Dynamic analysis of items to display specific technical specifications & limitations
  const itemsCategorias = (solicitud.items || []).map(it => {
    const inv = (inventario || []).find(i => i.id === it.itemId);
    const text = `${inv?.nombre || ''} ${inv?.categoria || ''}`.toLowerCase();
    return { it, inv, text };
  });

  const specsList: { item: string; norma: string; specs: string; limitaciones: string }[] = [
    {
      item: 'CALZADO DE SEGURIDAD INDUSTRIAL',
      norma: 'COVENIN 39:2003 / ASTM F2413 / ISO 20345',
      specs: 'Puntera de acero/policarbonato resistente a impacto (100J) y compresión (11kN). Suela de poliuretano doble densidad antideslizante con aislamiento dieléctrico hasta 600V en seco.',
      limitaciones: 'No apto para inmersión continua en disolventes orgánicos concentrados ni contacto prolongado con superficies >130°C. No protege si la suela presenta perforaciones o desgaste severo del labrado.'
    },
    {
      item: 'PROTECCIÓN RESPIRATORIA CON FILTROS P100 / OV',
      norma: 'COVENIN 1056:2002 / NIOSH 42 CFR 84',
      specs: 'Semimáscara elastomérica de ajuste facial con cartuchos combinados para retención del 99.97% de partículas/humos de plomo y nieblas de ácido sulfúrico (H2SO4).',
      limitaciones: 'NO SUMINISTRA OXÍGENO. Prohibido su uso en atmósferas deficientes de oxígeno (<19.5% O2) o en concentraciones inmediatamente peligrosas para la vida o la salud (IDLH).'
    },
    {
      item: 'PROTECCIÓN OCULAR Y FACIAL (LENTES / CARETAS)',
      norma: 'COVENIN 955:1976 / ANSI Z87.1+',
      specs: 'Policarbonato de alto impacto con tratamiento antirrayadura, ventilación indirecta contra salpicaduras químicas y protección UV 99.9%.',
      limitaciones: 'No protege contra radiación proveniente de soldadura de arco sin filtro tonal DIN específico, ni contra radiación láser o impactos balísticos de alta energía.'
    },
    {
      item: 'PROTECCIÓN MANUAL (GUANTES QUÍMICOS / VAQUETA)',
      norma: 'COVENIN 2165:1984 / EN 388 / EN 374-1:Tipo A',
      specs: 'Nitrilo pesado / Neopreno para barrera impermeable contra electrolito de baterías (ácido sulfúrico) y agentes mecánicos (abrasión, corte superficial y desgarre).',
      limitaciones: 'Descartar de inmediato si presenta microporos, hinchazón o decoloración por ataque químico. No manipular maquinaria giratoria sin resguardo que pueda atrapar el guante.'
    },
    {
      item: 'UNIFORMES DE TRABAJO Y ROPA CORPORATIVA',
      norma: 'COVENIN 2239:1991 / 100% DRIL ALGODÓN',
      specs: 'Tejido de algodón de alto gramaje resistente a roce con cinta reflectiva día/noche de alta visibilidad para tránsito seguro en áreas operativas y patios de carga.',
      limitaciones: 'No es traje ignífugo para combate de incendios ni impermeable estanco para químicos a presión. Debe lavarse por separado de la ropa doméstica para evitar contaminación familiar por plomo.'
    }
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
    theme: 'grid',
    headStyles: {
      fillColor: [226, 232, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 6.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      halign: 'center'
    },
    styles: {
      font: 'helvetica',
      fontSize: 6.3,
      cellPadding: 1.5,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 26, fontStyle: 'bold', fontSize: 5.8 },
      2: { cellWidth: 64 },
      3: { cellWidth: contentWidth - 122 }
    },
    head: [['IMPLEMENTO', 'NORMATIVA', 'ESPECIFICACIONES TÉCNICAS', 'LIMITACIONES DE PROTECCIÓN']],
    body: specsList.map(s => [s.item, s.norma, s.specs, s.limitaciones])
  });

  // Footer Página 1
  const footerY1 = pageHeight - 8;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(marginX, footerY1 - 2.5, pageWidth - marginX, footerY1 - 2.5);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text('SGD-DUNCAN 2.0 | GESTIÓN INTEGRAL DE SEGURIDAD INDUSTRIAL Y SALUD LABORAL', marginX, footerY1);
  doc.text('PÁGINA 1 DE 2', pageWidth / 2, footerY1, { align: 'center' });
  doc.text('ACUMULADORES DUNCAN, S.A.', pageWidth - marginX, footerY1, { align: 'right' });

  // ==========================================
  // PÁGINA 2
  // ==========================================
  doc.addPage();
  currentY = 13;

  // Header Página 2
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.rect(marginX, currentY, contentWidth, 12);
  doc.line(marginX + 36, currentY, marginX + 36, currentY + 12);
  doc.line(marginX + contentWidth - 48, currentY, marginX + contentWidth - 48, currentY + 12);

  try {
    doc.addImage(DUNCAN_LOGO_BW, 'PNG', marginX + 2, currentY + 2, 32, 8);
  } catch (e) {}

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ACTA OFICIAL DE ENTREGA DE DOTACIÓN, E.P.P. Y UNIFORMES', marginX + 36 + (contentWidth - 36 - 48) / 2, currentY + 5.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  doc.text('PAUTAS OPERATIVAS, INDUCCIÓN LEGAL Y CONSTANCIA DE FIRMAS DIGITALES', marginX + 36 + (contentWidth - 36 - 48) / 2, currentY + 9.5, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(`ID: ${(solicitud.id || 'DOT-001').substring(0, 14)}`, marginX + contentWidth - 46, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(`FECHA: ${formatDateString(solicitud.createdAt || new Date())}`, marginX + contentWidth - 46, currentY + 9.5);

  currentY += 15;

  // 5. SECCIÓN 4.0: PAUTAS OPERATIVAS OBLIGATORIAS
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(marginX, currentY, contentWidth, 5.5, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('4.0 PAUTAS OPERATIVAS OBLIGATORIAS: USO, ALMACENAMIENTO, MANTENIMIENTO Y PROTOCOLOS', marginX + 3, currentY + 4);
  currentY += 5.5;

  const pautas = [
    [
      { content: '4.1 USO ADECUADO Y OPORTUNO\n(Art. 54 LOPCYMAT):', styles: { fontStyle: 'bold' as const, fillColor: [248, 250, 252] as [number, number, number], cellWidth: 46 } },
      { content: 'El trabajador debe portar obligatoriamente la totalidad de sus implementos y uniforme durante su jornada de trabajo en las áreas de riesgo. Queda terminantemente prohibido alterar, mutilar, pintar o modificar cualquier parte estructural de los E.P.P. o retirar las cintas reflectivas del uniforme.', styles: { cellWidth: contentWidth - 46 } }
    ],
    [
      { content: '4.2 ALMACENAMIENTO\nADECUADO:', styles: { fontStyle: 'bold' as const, fillColor: [248, 250, 252] as [number, number, number] } },
      { content: 'Al concluir la jornada laboral, los implementos deben guardarse limpios en el casillero individual asignado, resguardados de humedad, calor excesivo, luz solar directa y vapores corrosivos. Los respiradores y cartuchos deben almacenarse herméticamente sellados en bolsas plásticas limpias.' }
    ],
    [
      { content: '4.3 MANTENIMIENTO E\nHIGIENE INDUSTRIAL:', styles: { fontStyle: 'bold' as const, fillColor: [248, 250, 252] as [number, number, number] } },
      { content: 'Limpieza periódica exclusivamente con agua tibia y jabón neutro. Queda ESTRICTAMENTE PROHIBIDO el uso de gasolina, solventes orgánicos, thinner o desengrasantes abrasivos. Los uniformes expuestos a plomo deben enviarse a la lavandería industrial autorizada por la empresa (Art. 59 LOPCYMAT).' }
    ],
    [
      { content: '4.4 PROTOCOLO ANTE DETERIORO,\nPÉRDIDA, EXTRAVÍO O ROBO\n(Art. 62 LOPCYMAT):', styles: { fontStyle: 'bold' as const, fillColor: [254, 242, 242] as [number, number, number] } },
      { content: '• DETERIORO / DESGASTE NORMAL: La empresa sustituirá gratuitamente e inmediatamente el implemento al presentar la pieza deteriorada ante el Almacén / SST para su inspección técnica y disposición final.\n• ROBO O HURTO: Notificación inmediata a supervisión y presentación obligatoria de denuncia policial (CICPC/PNB) para la reposición formal.\n• PÉRDIDA O EXTRAVÍO: Notificación inmediata por escrito a la jefatura y Comité de SST para tramitar la dotación de reemplazo garantizando la continuidad de la protección física.' }
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 6.8,
      cellPadding: 2,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2
    },
    body: pautas
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 6. SECCIÓN 5.0: CONSTANCIA LEGAL DE INDUCCIÓN Y DECLARACIÓN JURADA
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(marginX, currentY, contentWidth, 5.5, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('5.0 CONSTANCIA LEGAL DE INDUCCIÓN (ART. 53-54 LOPCYMAT) Y DECLARACIÓN JURADA DE RECIBO', marginX + 3, currentY + 4);
  currentY += 5.5;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.rect(marginX, currentY, contentWidth, 23);

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.7);
  const textoDeclaracion = 
    '1) Declaro haber recibido por parte de ACUMULADORES DUNCAN, S.A., de forma totalmente GRATUITA, los implementos de protección personal y uniformes detallados en esta acta, nuevos y en óptimas condiciones de uso.\n' +
    '2) Constato haber recibido la INDUCCIÓN TEÓRICA Y PRÁCTICA (por escrito y demostrativa) referente a la correcta colocación, ajuste, limitaciones y mantenimiento higiénico de cada protección asignada (Art. 53 LOPCYMAT).\n' +
    '3) He sido formalmente notificado de los procesos peligrosos y riesgos ocupacionales que previene el uso oportuno de esta dotación (Art. 54 LOPCYMAT).\n' +
    '4) Me comprometo a cuidar y preservar los implementos suministrados, reportando a la brevedad cualquier daño o insuficiencia.';
  const splitText = doc.splitTextToSize(textoDeclaracion, contentWidth - 4);
  doc.text(splitText, marginX + 2, currentY + 4);

  currentY += 26;

  // 7. SECCIÓN 6.0: PROTOCOLO DE VALIDACIÓN Y 4 FIRMAS DIGITALES
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(marginX, currentY, contentWidth, 5.5, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('6.0 PROTOCOLO DE APROBACIÓN Y FIRMAS DIGITALES DE LOS ACTORES DEL PROCESO', marginX + 3, currentY + 4);
  currentY += 5.5;

  const boxW = contentWidth / 2; // 93.95 mm
  const boxH = 43; // mm

  // Cuadrante 1: Solicitante / Supervisor Inmediato (Top Left)
  renderFirmaBox(
    doc,
    marginX,
    currentY,
    boxW,
    boxH,
    '1. SOLICITANTE / SUPERVISOR INMEDIATO',
    'Aprobación de Requerimiento Operativo',
    solicitud.firmaSupervisor || solicitud.firmaSolicitante,
    'SUPERVISOR DE ÁREA'
  );

  // Cuadrante 2: Validación Técnica SSA / SST (Top Right)
  renderFirmaBox(
    doc,
    marginX + boxW,
    currentY,
    boxW,
    boxH,
    '2. ESPECIALISTA TÉCNICO SSA / SST',
    'Validación Normativa LOPCYMAT / COVENIN',
    solicitud.firmaSST,
    'ESPECIALISTA SST'
  );

  // Cuadrante 3: Control de Almacén y Despacho (Bottom Left)
  renderFirmaBox(
    doc,
    marginX,
    currentY + boxH,
    boxW,
    boxH,
    '3. CONTROL DE ALMACÉN / DESPACHO',
    'Preparación y Despacho de Stock Físico',
    solicitud.firmaDespacho,
    'ANALISTA DE ALMACÉN'
  );

  // Cuadrante 4: Trabajador Beneficiario Receptor (Bottom Right)
  const firmaReceptor = solicitud.firmaReceptor || (entrega?.firmaUrl ? {
    nombre: empleado?.nombre || 'TRABAJADOR RECEPTOR',
    cedula: empleado?.cedula || 'N/A',
    cargo: empleado?.cargo || 'COLABORADOR',
    fecha: entrega?.fechaEntrega || new Date().toISOString(),
    firmaUrl: entrega.firmaUrl
  } : undefined);

  renderFirmaBox(
    doc,
    marginX + boxW,
    currentY + boxH,
    boxW,
    boxH,
    '4. TRABAJADOR BENEFICIARIO (RECEPTOR)',
    'Recepción Conforme e Inducción Recibida',
    firmaReceptor,
    (empleado?.nombre || 'TRABAJADOR').toUpperCase()
  );

  currentY += boxH * 2 + 3;

  // Observaciones si existen
  const observaciones = entrega?.comentarios || solicitud.motivoRechazo || '';
  if (observaciones) {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.rect(marginX, currentY, contentWidth, 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('OBSERVACIONES / NOVEDADES:', marginX + 2, currentY + 3.5);
    doc.setFont('helvetica', 'normal');
    doc.text(String(observaciones).substring(0, 140), marginX + 38, currentY + 3.5);
    currentY += 10;
  }

  // Footer Página 2
  const footerY2 = pageHeight - 8;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(marginX, footerY2 - 2.5, pageWidth - marginX, footerY2 - 2.5);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text('SGD-DUNCAN 2.0 | GESTIÓN INTEGRAL DE SEGURIDAD INDUSTRIAL Y SALUD LABORAL', marginX, footerY2);
  doc.text('PÁGINA 2 DE 2', pageWidth / 2, footerY2, { align: 'center' });
  doc.text('ACUMULADORES DUNCAN, S.A.', pageWidth - marginX, footerY2, { align: 'right' });

  // Nombre estandarizado de archivo
  const itemsList = solicitud.items || [];
  const primerItem = itemsList.length > 0 ? ((inventario || []).find(i => i.id === itemsList[0]?.itemId)?.nombre || 'Dotacion') : 'Dotacion';
  const fileName = `Acta_EPP_${primerItem}_${empleado?.nombre || 'Trabajador'}_${formatDateString(solicitud.createdAt || new Date()).replace(/\//g, '-')}.pdf`
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_');

  return { doc, fileName };
}

function renderFirmaBox(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  titulo: string,
  subtitulo: string,
  firma?: import('../../types').FirmaActor,
  fallbackCargo?: string
) {
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.rect(x, y, width, height);

  // Subcabecera de rol
  doc.setFillColor(248, 250, 252);
  doc.rect(x, y, width, 5.5, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(titulo, x + 2, y + 3.8);

  // Estado de la firma
  const isFirmado = !!(firma && firma.firmaUrl);
  if (isFirmado) {
    doc.setTextColor(22, 101, 52);
    doc.text('[FIRMADO]', x + width - 15, y + 3.8);
  } else {
    doc.setTextColor(185, 28, 28);
    doc.text('[PENDIENTE]', x + width - 18, y + 3.8);
  }

  // Incrustar rúbrica digital si existe (solo PNG o JPEG para compatibilidad nativa con jsPDF)
  if (isFirmado && firma.firmaUrl) {
    const url = firma.firmaUrl;
    const isPng = url.startsWith('data:image/png');
    const isJpeg = url.startsWith('data:image/jpeg') || url.startsWith('data:image/jpg');
    if (isPng || isJpeg) {
      try {
        doc.addImage(url, isJpeg ? 'JPEG' : 'PNG', x + (width - 36) / 2, y + 6.5, 36, 17);
      } catch (e) {
        console.warn('Error incrustando firma en PDF:', e);
      }
    }
  }

  // Línea de firma
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(x + 10, y + 27, x + width - 10, y + 27);

  // Metadatos del firmante
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  const nombreTexto = (firma?.nombre || fallbackCargo || 'FIRMA AUTORIZADA').toUpperCase();
  doc.text(nombreTexto, x + width / 2, y + 31, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(51, 65, 85);
  const cargoTexto = (firma?.cargo || subtitulo).toUpperCase();
  const idTexto = firma?.cedula ? `C.I: ${firma.cedula}` : '';
  const regTexto = firma?.registroProfesional ? ` | REG: ${firma.registroProfesional}` : '';
  const fechaTexto = firma?.fecha ? ` | ${formatDateString(firma.fecha)}` : '';

  doc.text(cargoTexto, x + width / 2, y + 35, { align: 'center' });
  doc.text(`${idTexto}${regTexto}${fechaTexto}`, x + width / 2, y + 39, { align: 'center' });
}
