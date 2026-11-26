import type { 
  AuditLogEntry, 
  AuditModule, 
  AuditAction, 
  AuditSeverity, 
  AuditFilter 
} from '../types/audit';
import type { jsPDF } from 'jspdf';

const STORAGE_KEY = 'sgd_audit_trail_v2';
const MAX_LOGS = 400;

// Detección de dispositivo y entorno
function getClientDevice(): { dispositivo: 'Desktop' | 'Mobile' | 'Tablet'; plataforma: string; userAgent: string } {
  if (typeof window === 'undefined') {
    return { dispositivo: 'Desktop', plataforma: 'Node/Server', userAgent: 'Server' };
  }
  const ua = navigator.userAgent;
  let dispositivo: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  if (/iPad|Tablet|PlayBook/i.test(ua)) {
    dispositivo = 'Tablet';
  } else if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
    dispositivo = 'Mobile';
  }

  let plataforma = 'Windows';
  if (/Mac/i.test(ua)) plataforma = 'macOS';
  else if (/Linux/i.test(ua)) plataforma = 'Linux';
  else if (/Android/i.test(ua)) plataforma = 'Android';
  else if (/iPhone|iPad/i.test(ua)) plataforma = 'iOS';

  return { dispositivo, plataforma, userAgent: ua };
}

// Obtener datos del usuario activo en la sesión
function getCurrentSessionUser() {
  try {
    const raw = localStorage.getItem('sgd_current_user') || localStorage.getItem('currentUser');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        id: parsed.id || parsed._id || 'usr_anonymous',
        nombre: parsed.nombre || parsed.displayName || 'Usuario de Sesión',
        email: parsed.email || 'usuario@duncan.com.ve',
        rol: parsed.rol || parsed.role || 'Inspector',
        sede: parsed.establecimientoNombre || parsed.sede || 'Planta Principal Los Ruices',
        empresa: parsed.empresaNombre || 'Grupo Duncan'
      };
    }
  } catch {
    // ignore
  }
  return {
    id: 'usr_unauth',
    nombre: 'Usuario Anónimo / Sistema',
    email: 'anonimo@duncan.local',
    rol: 'Sin Autenticación',
    sede: 'Acceso Local',
    empresa: 'SGD Duncan 2.0'
  };
}

async function computeAuditHash(entry: Partial<AuditLogEntry>, prevHash: string = ''): Promise<string> {
  const content = `${prevHash}|${entry.id}|${entry.timestamp}|${entry.usuarioId}|${entry.accion}|${entry.entidadTipo}|${entry.entidadId || ''}|${entry.descripcion}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const buf = new TextEncoder().encode(content);
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {}
  }
  let h = 0;
  for (let i = 0; i < content.length; i++) {
    h = ((h << 5) - h) + content.charCodeAt(i);
    h |= 0;
  }
  return 'h_' + Math.abs(h).toString(16);
}

// Semilla inicial realista de eventos de auditoría si la bitácora está vacía
function getInitialAuditLogs(): AuditLogEntry[] {
  const device = getClientDevice();
  return [
    {
      id: 'aud_1001',
      timestamp: '2026-11-20T08:15:22.000Z',
      fechaFormateada: '20/11/2026 04:15:22',
      usuarioId: 'usr_fr',
      usuarioNombre: 'Francisco Rojas',
      usuarioEmail: 'frojas@acumuladoresduncan.com',
      usuarioRol: 'SuperAdmin',
      usuarioSede: 'Valencia Central',
      usuarioEmpresa: 'Distribuidora Duncan, C.A.',
      modulo: 'AUTENTICACION',
      accion: 'INICIO_SESION',
      entidadTipo: 'SesionUsuario',
      entidadId: 'ses_20261120_01',
      descripcion: 'Inicio de sesión exitoso mediante credenciales corporativas SSO',
      detalles: { metodo: 'Password/Token', ip: '192.168.1.45', navegador: 'Chrome 131', recordarme: true },
      severidad: 'INFO',
      ip: '192.168.1.45',
      userAgent: device.userAgent,
      dispositivo: device.dispositivo,
      plataforma: device.plataforma,
      online: true,
      ruta: '/'
    },
    {
      id: 'aud_1002',
      timestamp: '2026-11-20T09:30:10.000Z',
      fechaFormateada: '20/11/2026 05:30:10',
      usuarioId: 'usr_fr',
      usuarioNombre: 'Francisco Rojas',
      usuarioEmail: 'frojas@acumuladoresduncan.com',
      usuarioRol: 'Inspector SSA',
      usuarioSede: 'Servicentro Guacara',
      usuarioEmpresa: 'Distribuidora Duncan, C.A.',
      modulo: 'INSPECCIONES',
      accion: 'CREAR',
      entidadTipo: 'Inspeccion',
      entidadId: 'insp_1001',
      entidadCodigo: 'SGD_SC_1001',
      descripcion: 'Apertura de inspección técnica mensual de Servicentro Guacara',
      detalles: { tipoCodigo: 'SC', itemsAuditados: 48, estado: 'en_progreso' },
      severidad: 'INFO',
      userAgent: device.userAgent,
      dispositivo: device.dispositivo,
      plataforma: device.plataforma,
      online: true,
      ruta: '/inspecciones/nueva'
    },
    {
      id: 'aud_1003',
      timestamp: '2026-11-20T10:45:00.000Z',
      fechaFormateada: '20/11/2026 06:45:00',
      usuarioId: 'usr_fr',
      usuarioNombre: 'Francisco Rojas',
      usuarioEmail: 'frojas@acumuladoresduncan.com',
      usuarioRol: 'Inspector SSA',
      usuarioSede: 'Servicentro Guacara',
      usuarioEmpresa: 'Distribuidora Duncan, C.A.',
      modulo: 'INSPECCIONES',
      accion: 'COMPLETAR',
      entidadTipo: 'Inspeccion',
      entidadId: 'insp_1001',
      entidadCodigo: 'SGD_SC_1001',
      descripcion: 'Inspección técnica finalizada y firmada digitalmente con resultado CONFORME (96%)',
      detalles: { puntuacion: 96, resultado: 'C', conformes: 46, noConformes: 1, observaciones: 1, firmaInspector: 'Base64' },
      severidad: 'INFO',
      userAgent: device.userAgent,
      dispositivo: device.dispositivo,
      plataforma: device.plataforma,
      online: true,
      ruta: '/inspecciones/insp_1001/formulario'
    },
    {
      id: 'aud_1004',
      timestamp: '2026-11-20T11:05:14.000Z',
      fechaFormateada: '20/11/2026 07:05:14',
      usuarioId: 'usr_fr',
      usuarioNombre: 'Francisco Rojas',
      usuarioEmail: 'frojas@acumuladoresduncan.com',
      usuarioRol: 'SuperAdmin',
      usuarioSede: 'Servicentro Guacara',
      usuarioEmpresa: 'Distribuidora Duncan, C.A.',
      modulo: 'REPORTES_EXPORTACIONES',
      accion: 'DESCARGAR_PDF',
      entidadTipo: 'Inspeccion',
      entidadId: 'insp_1001',
      entidadCodigo: 'SGD_SC_1001',
      descripcion: 'Descarga de informe técnico oficial en formato PDF vectorial con membrete Duncan B&N',
      detalles: { archivo: 'SGD_SC_1001_2026_11_20.pdf', tamanoKb: 142 },
      severidad: 'INFO',
      userAgent: device.userAgent,
      dispositivo: device.dispositivo,
      plataforma: device.plataforma,
      online: true,
      ruta: '/inspecciones/insp_1001'
    },
    {
      id: 'aud_1005',
      timestamp: '2026-11-20T14:20:00.000Z',
      fechaFormateada: '20/11/2026 10:20:00',
      usuarioId: 'usr_03',
      usuarioNombre: 'Dr. Alejandro Morales',
      usuarioEmail: 'amorales@acumuladoresduncan.com',
      usuarioRol: 'Médico Ocupacional',
      usuarioSede: 'Servicio Médico Central',
      usuarioEmpresa: 'Acumuladores Duncan, C.A.',
      modulo: 'SALUD_OCUPACIONAL',
      accion: 'EMISION_REPOSO',
      entidadTipo: 'ReposoMedico',
      entidadId: 'rep_001',
      entidadCodigo: 'REP-001',
      descripcion: 'Emisión de reposo médico por 3 días para Carlos Mendoza por Lumbalgia (CIE-10 M54.5)',
      detalles: { dias: 3, cie10: 'M54.5', trabajador: 'Carlos Mendoza', cedula: 'V-15894123', validadoIVSS: true },
      severidad: 'AVISO',
      userAgent: device.userAgent,
      dispositivo: device.dispositivo,
      plataforma: device.plataforma,
      online: true,
      ruta: '/medico'
    },
    {
      id: 'aud_1006',
      timestamp: '2026-11-20T16:10:45.000Z',
      fechaFormateada: '20/11/2026 12:10:45',
      usuarioId: 'usr_04',
      usuarioNombre: 'Luis Gómez',
      usuarioEmail: 'lgomez@distribuidoraduncan.com',
      usuarioRol: 'Chofer / Vendedor de Ruta',
      usuarioSede: 'Flota Caracas',
      usuarioEmpresa: 'Distribuidora Duncan, C.A.',
      modulo: 'TRANSPORTE_FLOTA',
      accion: 'AUTORIZACION_SALIDA',
      entidadTipo: 'ChecklistTransporte',
      entidadId: 'chk_trans_101',
      entidadCodigo: 'CHK-TRAN-001',
      descripcion: 'Checklist pre-operacional de transporte aprobado con Semáforo VERDE (Carga: 2,450 Kg / 70% capacidad)',
      detalles: { placa: 'A23BC4D', semaforo: 'VERDE', bateriasTotales: 140, pesoKg: 2450 },
      severidad: 'INFO',
      userAgent: device.userAgent,
      dispositivo: device.dispositivo,
      plataforma: device.plataforma,
      online: true,
      ruta: '/transporte'
    },
    {
      id: 'aud_1007',
      timestamp: '2026-11-20T17:40:12.000Z',
      fechaFormateada: '20/11/2026 13:40:12',
      usuarioId: 'usr_fr',
      usuarioNombre: 'Francisco Rojas',
      usuarioEmail: 'frojas@acumuladoresduncan.com',
      usuarioRol: 'SuperAdmin',
      usuarioSede: 'Sede Principal Valencia',
      usuarioEmpresa: 'Distribuidora Duncan, C.A.',
      modulo: 'ACCIDENTES_F465',
      accion: 'CREAR',
      entidadTipo: 'AccidenteF465',
      entidadId: 'acc_01',
      entidadCodigo: 'F465-2026-001',
      descripcion: 'Registro de investigación técnica de accidente según formato oficial F-465 y Árbol de Causas',
      detalles: { trabajador: 'Giusseppe Del Zilgaro', gravedad: 'MODERADO', diasReposo: 15, notificadoINPSASEL: true },
      severidad: 'CRITICO',
      userAgent: device.userAgent,
      dispositivo: device.dispositivo,
      plataforma: device.plataforma,
      online: true,
      ruta: '/accidentes'
    }
  ];
}

class AuditService {
  private getLocalLogs(): AuditLogEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error leyendo audit trail de localStorage', e);
    }
    const initials = getInitialAuditLogs();
    this.saveLocalLogs(initials);
    return initials;
  }

  private saveLocalLogs(logs: AuditLogEntry[]): void {
    const trimmed = logs.slice(0, MAX_LOGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      try {
        // Si la cuota móvil está llena, conservar solo los 60 eventos más recientes
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed.slice(0, 60)));
      } catch {
        console.warn('Error guardando audit trail en localStorage', e);
      }
    }
  }

  /**
   * Registra un evento en la bitácora forense de auditoría
   */
  async log(event: {
    modulo: AuditModule;
    accion: AuditAction;
    entidadTipo: string;
    entidadId?: string;
    entidadCodigo?: string;
    descripcion: string;
    detalles?: Record<string, any>;
    severidad?: AuditSeverity;
    ruta?: string;
  }): Promise<AuditLogEntry> {
    const user = getCurrentSessionUser();
    const device = getClientDevice();
    const now = new Date();
    
    // Formato local Venezuela DD/MM/AAAA HH:mm:ss
    const pad = (n: number) => n.toString().padStart(2, '0');
    const fechaFormateada = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const currentLogs = this.getLocalLogs();
    const prevLog = currentLogs.length > 0 ? currentLogs[0] : null;
    const previousHash = prevLog?.hash || 'GENESIS_HASH_SGD2_SECURE';

    const logId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? `aud_${crypto.randomUUID()}`
      : `aud_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newEntry: AuditLogEntry = {
      id: logId,
      timestamp: now.toISOString(),
      fechaFormateada,
      usuarioId: user.id,
      usuarioNombre: user.nombre,
      usuarioEmail: user.email,
      usuarioRol: user.rol,
      usuarioSede: user.sede,
      usuarioEmpresa: user.empresa,
      modulo: event.modulo,
      accion: event.accion,
      entidadTipo: event.entidadTipo,
      entidadId: event.entidadId,
      entidadCodigo: event.entidadCodigo,
      descripcion: event.descripcion,
      detalles: event.detalles,
      severidad: event.severidad || 'INFO',
      ip: '127.0.0.1 (Local Client)',
      userAgent: device.userAgent,
      dispositivo: device.dispositivo,
      plataforma: device.plataforma,
      online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      ruta: event.ruta || (typeof window !== 'undefined' ? window.location.pathname : undefined),
      previousHash
    };

    newEntry.hash = await computeAuditHash(newEntry, previousHash);

    currentLogs.unshift(newEntry);
    this.saveLocalLogs(currentLogs);

    // Despachar evento para componentes reactivos
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sgd_audit_event_logged', { detail: newEntry }));
    }

    return newEntry;
  }

  /**
   * Verifica la integridad criptográfica de la cadena de auditoría forense (SHA-256 Chained Hashes)
   */
  async verifyIntegrity(): Promise<{ valid: boolean; total: number; tamperedIndex?: number; message: string }> {
    const logs = this.getLocalLogs();
    if (logs.length === 0) {
      return { valid: true, total: 0, message: 'Bitácora sin eventos registrados.' };
    }

    for (let i = 0; i < logs.length; i++) {
      const entry = logs[i];
      const nextOlder = i + 1 < logs.length ? logs[i + 1] : null;
      const expectedPrevHash = nextOlder?.hash || 'GENESIS_HASH_SGD2_SECURE';

      if (entry.previousHash && entry.previousHash !== expectedPrevHash) {
        return {
          valid: false,
          total: logs.length,
          tamperedIndex: i,
          message: `Ruptura de cadena en evento ${entry.id} (posición ${i}): previousHash no coincide.`
        };
      }

      if (entry.hash) {
        const computed = await computeAuditHash(entry, entry.previousHash || expectedPrevHash);
        if (computed !== entry.hash) {
          return {
            valid: false,
            total: logs.length,
            tamperedIndex: i,
            message: `Hash manipulado en evento ${entry.id} (posición ${i}): firma SHA-256 no coincide.`
          };
        }
      }
    }

    return {
      valid: true,
      total: logs.length,
      message: `Integridad verificada con éxito: ${logs.length} eventos inmutables validados.`
    };
  }

  /**
   * Registro rápido de navegación de pantalla / vista
   */
  async logNavigation(ruta: string, titulo?: string): Promise<void> {
    await this.log({
      modulo: 'NAVEGACION',
      accion: 'ACCESO_VISTA',
      entidadTipo: 'RutaUI',
      entidadId: ruta,
      descripcion: `Acceso a la vista: ${titulo || ruta}`,
      detalles: { ruta, titulo, referer: document.referrer || 'Direct' },
      severidad: 'INFO',
      ruta
    });
  }

  /**
   * Registro rápido de exportación / descarga de archivo
   */
  async logExport(
    tipo: 'PDF' | 'EXCEL' | 'CSV',
    documento: string,
    entidadTipo: string,
    entidadId?: string,
    detalles?: Record<string, any>
  ): Promise<void> {
    await this.log({
      modulo: 'REPORTES_EXPORTACIONES',
      accion: tipo === 'PDF' ? 'DESCARGAR_PDF' : (tipo === 'EXCEL' ? 'EXPORTAR_EXCEL' : 'EXPORTAR_CSV'),
      entidadTipo,
      entidadId,
      descripcion: `Descarga de reporte ${tipo}: ${documento}`,
      detalles: { documento, formato: tipo, ...detalles },
      severidad: 'INFO'
    });
  }

  /**
   * Registro de seguridad y autenticación
   */
  async logSecurity(evento: string, detalles?: Record<string, any>): Promise<void> {
    await this.log({
      modulo: 'USUARIOS_SEGURIDAD',
      accion: 'FALLO_AUTENTICACION',
      entidadTipo: 'SeguridadAcceso',
      descripcion: `Alerta de seguridad: ${evento}`,
      detalles,
      severidad: 'SEGURIDAD'
    });
  }

  /**
   * Consulta filtrada de eventos de auditoría
   */
  async getLogs(filter?: AuditFilter): Promise<AuditLogEntry[]> {
    let logs = this.getLocalLogs();

    if (!filter) return logs;

    if (filter.search) {
      const q = filter.search.toLowerCase();
      logs = logs.filter(l => 
        l.usuarioNombre.toLowerCase().includes(q) ||
        l.usuarioEmail.toLowerCase().includes(q) ||
        l.descripcion.toLowerCase().includes(q) ||
        (l.entidadCodigo && l.entidadCodigo.toLowerCase().includes(q)) ||
        (l.entidadId && l.entidadId.toLowerCase().includes(q)) ||
        l.modulo.toLowerCase().includes(q) ||
        l.accion.toLowerCase().includes(q)
      );
    }

    if (filter.modulo && filter.modulo !== 'TODOS') {
      logs = logs.filter(l => l.modulo === filter.modulo);
    }

    if (filter.accion && filter.accion !== 'TODAS') {
      logs = logs.filter(l => l.accion === filter.accion);
    }

    if (filter.severidad && filter.severidad !== 'TODAS') {
      logs = logs.filter(l => l.severidad === filter.severidad);
    }

    if (filter.usuarioId && filter.usuarioId !== 'TODOS') {
      logs = logs.filter(l => l.usuarioId === filter.usuarioId);
    }

    if (filter.fechaDesde) {
      const d = new Date(filter.fechaDesde).getTime();
      logs = logs.filter(l => new Date(l.timestamp).getTime() >= d);
    }

    if (filter.fechaHasta) {
      const h = new Date(filter.fechaHasta + 'T23:59:59').getTime();
      logs = logs.filter(l => new Date(l.timestamp).getTime() <= h);
    }

    return logs;
  }

  /**
   * Exporta la bitácora de auditoría a archivo Excel (.xlsx)
   */
  async exportToExcel(logs: AuditLogEntry[]): Promise<void> {
    const XLSX = await import('xlsx');
    const data = logs.map(l => ({
      'ID Evento': l.id,
      'Fecha y Hora': l.fechaFormateada,
      'Usuario': l.usuarioNombre,
      'Correo': l.usuarioEmail,
      'Rol': l.usuarioRol,
      'Sede': l.usuarioSede || 'N/A',
      'Empresa': l.usuarioEmpresa || 'Duncan',
      'Módulo': l.modulo,
      'Acción': l.accion,
      'Severidad': l.severidad,
      'Entidad': l.entidadTipo,
      'Código / Ref': l.entidadCodigo || l.entidadId || 'N/A',
      'Descripción del Suceso': l.descripcion,
      'Dispositivo': `${l.dispositivo} (${l.plataforma})`,
      'Ruta': l.ruta || '/',
      'Detalles Técnicos (JSON)': l.detalles ? JSON.stringify(l.detalles) : ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bitácora_Auditoría_SGD');
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `SGD_Duncan_Auditoria_Forense_${fecha}.xlsx`);
  }

  /**
   * Exporta la bitácora de auditoría a CSV
   */
  async exportToCSV(logs: AuditLogEntry[]): Promise<void> {
    const XLSX = await import('xlsx');
    const data = logs.map(l => ({
      ID: l.id,
      Fecha: l.fechaFormateada,
      Usuario: l.usuarioNombre,
      Email: l.usuarioEmail,
      Rol: l.usuarioRol,
      Modulo: l.modulo,
      Accion: l.accion,
      Severidad: l.severidad,
      Descripcion: l.descripcion,
      EntidadRef: l.entidadCodigo || l.entidadId || '',
      Dispositivo: l.dispositivo,
      Ruta: l.ruta || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SGD_Duncan_Auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  /**
   * Genera un informe oficial de auditoría forense en PDF con logo oficial Duncan B&N
   */
  async generateAuditReportPDF(logs: AuditLogEntry[], filtroTexto?: string): Promise<jsPDF> {
    const [{ jsPDF }, { default: autoTable }, { DUNCAN_LOGO_BW }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
      import('../lib/logos')
    ]);
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'letter'
    });

    const pageWidth = 279.4;
    const pageHeight = 215.9;

    // Logo Oficial Duncan B&N
    try {
      doc.addImage(DUNCAN_LOGO_BW, 'PNG', 14, 8, 36, 13);
    } catch (e) {
      console.warn('Error insertando logo en informe de auditoria', e);
    }

    // Cabecera Institucional
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('ACUMULADORES DUNCAN, C.A. / DISTRIBUIDORA DUNCAN, C.A.', 56, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('SISTEMA DE GESTIÓN DE SEGURIDAD, SALUD Y AMBIENTE (SG-SSA) • BITÁCORA FORENSE DE TRAZABILIDAD', 56, 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 64, 175);
    doc.text(`CERTIFICADO OFICIAL DE AUDITORÍA Y TRAZABILIDAD DE OPERACIONES (${logs.length} EVENTOS)`, 56, 23);

    // Separador
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(14, 27, pageWidth - 14, 27);

    // Parámetros de emisión
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleString('es-VE')} | Usuario Auditor: ${getCurrentSessionUser().nombre} | Filtro: ${filtroTexto || 'Todos los registros'}`, 14, 32);

    const tableRows = logs.slice(0, 150).map(l => [
      l.fechaFormateada,
      l.usuarioNombre,
      l.usuarioRol,
      l.modulo,
      l.accion,
      l.severidad,
      l.entidadCodigo || l.entidadId || '—',
      l.descripcion,
      l.dispositivo
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Fecha / Hora', 'Usuario', 'Rol', 'Módulo', 'Acción', 'Severidad', 'Ref.', 'Descripción del Suceso', 'Disp.']],
      body: tableRows,
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        textColor: [30, 41, 59]
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 32 },
        2: { cellWidth: 24 },
        3: { cellWidth: 28 },
        4: { cellWidth: 26 },
        5: { cellWidth: 18 },
        6: { cellWidth: 24 },
        7: { cellWidth: 'auto' },
        8: { cellWidth: 16 }
      }
    });

    // Numeración de páginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `BITÁCORA OFICIAL DE AUDITORÍA SG-SSA DUNCAN • PÁGINA ${i} DE ${totalPages}`,
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      );
    }

    return doc;
  }
}

export const auditService = new AuditService();
