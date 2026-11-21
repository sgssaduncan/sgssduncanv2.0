/**
 * ===================================================================
 * SGD DUNCAN 2.0 — BACKEND GOOGLE APPS SCRIPT (COSTO CERO)
 * ===================================================================
 * Este script actúa como API REST para la aplicación PWA SGD Duncan.
 * Se conecta a Google Sheets como base de datos en la nube.
 *
 * INSTRUCCIONES DE DESPLIEGUE:
 * 1. Crea una hoja de cálculo en Google Sheets (ej: "SGD Duncan 2.0 DB").
 * 2. En el menú superior, ve a: Extensiones > Apps Script.
 * 3. Borra todo el código que aparezca y pega este archivo completo.
 * 4. En el editor de Apps Script, selecciona la función "setupSpreadsheet"
 *    en el desplegable superior y haz clic en "Ejecutar" (Run).
 *    (Te pedirá autorizar permisos una sola vez; esto creará todas las pestañas).
 * 5. Haz clic en el botón azul superior: "Implementar" (Deploy) > "Nueva implementación".
 * 6. Selecciona tipo: "Aplicación web" (Web App).
 *    - Descripción: "API SGD Duncan 2.0"
 *    - Ejecutar como: "Yo" (tu cuenta)
 *    - Quién tiene acceso: "Cualquier persona" (Anyone)
 * 7. Haz clic en "Implementar" y copia la URL de la aplicación web
 *    (termina en /exec).
 * 8. Pega esa URL en la PWA en Ajustes > Conexión con Google Sheets.
 * ===================================================================
 */

// ID oficial de la hoja de cálculo de Google Sheets como backend
var SPREADSHEET_ID = '1dH0vgYL80DDpwPcdwwaxsg9qCNvNahCbCUxlzDejcFU';

function getSpreadsheet() {
  if (SPREADSHEET_ID) {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (e) {
      Logger.log('Error abriendo por ID, usando getActiveSpreadsheet: ' + e);
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

// Nombres de las hojas (tablas)
var SHEETS = {
  INSPECCIONES: 'Inspecciones',
  PLAN_ACCION: 'PlanAccion',
  ESTABLECIMIENTOS: 'Establecimientos',
  EMPLEADOS: 'Empleados',
  AUDIT_LOG: 'Audit_Log',
  USUARIOS: 'Usuarios',
  CONFIGURACION: 'Configuracion',
  EVALUACIONES_MEDICAS: 'EvaluacionesMedicas',
  CONSULTAS_MEDICAS: 'ConsultasMedicas',
  CONTROLES_PRESION: 'ControlesPresion',
  APTITUD_PSICOFISICA: 'AptitudPsicofisica',
  GONIOMETRIAS: 'Goniometrias',
  DOTACIONES: 'Dotaciones',
  LOTO: 'LotoBloqueos',
  PERMISOS: 'PermisosTrabajo',
  COMITE: 'ComiteActas'
};

// ===================================================================
// ENTRADA GET
// ===================================================================
function doGet(e) {
  var params = e ? e.parameter : {};
  var action = params.action || 'ping';

  try {
    var responseData;

    switch (action) {
      case 'ping':
        try {
          var ssPing = getSpreadsheet();
          var sheetUsrPing = getOrCreateSheet(ssPing, SHEETS.USUARIOS);
          ensureDefaultUsers(sheetUsrPing);
        } catch (ePing) {}
        responseData = { status: 'success', message: 'SGD Duncan API online', timestamp: new Date().toISOString() };
        break;

      case 'getInitData':
        responseData = handleGetInitData();
        break;

      case 'getInspecciones':
        responseData = handleGetInspecciones();
        break;

      case 'getInspeccion':
        responseData = handleGetInspeccion(params.id);
        break;

      case 'getPlanAccion':
        responseData = handleGetPlanAccion();
        break;

      case 'getEmpleados':
        responseData = handleGetEmpleados(params.q);
        break;

      case 'getUsuarios':
        responseData = handleGetUsuarios();
        break;

      case 'getTableData':
        responseData = handleGetTableData(params.table);
        break;

      default:
        responseData = { status: 'error', message: 'Acción desconocida: ' + action };
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data: responseData }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===================================================================
// ENTRADA POST
// ===================================================================
function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : '{}';
    var payload = JSON.parse(raw);
    var action = payload.action;

    var result;

    switch (action) {
      case 'createInspeccion':
        result = handleCreateInspeccion(payload);
        break;

      case 'saveFormData':
        result = handleSaveFormData(payload);
        break;

      case 'completeInspeccion':
        result = handleCompleteInspeccion(payload);
        break;

      case 'deleteInspeccion':
        result = handleDeleteInspeccion(payload);
        break;

      case 'updatePlanAccion':
        result = handleUpdatePlanAccion(payload);
        break;

      case 'logAudit':
        result = handleLogAudit(payload);
        break;

      case 'login':
        result = handleLogin(payload);
        break;

      case 'saveUsuario':
        result = handleSaveUsuario(payload);
        break;

      case 'deleteUsuario':
        result = handleDeleteUsuario(payload);
        break;

      case 'saveTableItem':
        result = handleSaveTableItem(payload);
        break;

      case 'saveTableBatch':
        result = handleSaveTableBatch(payload);
        break;

      case 'solicitarCodigoRecuperacion':
        result = handleSolicitarCodigoRecuperacion(payload);
        break;

      case 'recuperarPassword':
        result = handleRecuperarPassword(payload);
        break;

      default:
        result = { status: 'error', message: 'Acción POST desconocida: ' + action };
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data: result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data: result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===================================================================
// MANEJADORES DE LECTURA (GET)
// ===================================================================

function handleGetInitData() {
  var ss = getSpreadsheet();
  try {
    ensureDefaultUsers(getOrCreateSheet(ss, SHEETS.USUARIOS));
  } catch (eInitUsr) {}
  var sheetInsp = getOrCreateSheet(ss, SHEETS.INSPECCIONES);
  var sheetPlan = getOrCreateSheet(ss, SHEETS.PLAN_ACCION);

  var insps = sheetToObjects(sheetInsp);
  var plans = sheetToObjects(sheetPlan);

  var conformes = 0;
  var noConformes = 0;
  for (var i = 0; i < insps.length; i++) {
    if (insps[i].resultado === 'C') conformes++;
    if (insps[i].resultado === 'NC' || insps[i].resultado === 'OM') noConformes++;
  }
  var tasa = insps.length > 0 ? Math.round((conformes / insps.length) * 100) : 0;

  var pendientes = 0;
  var enEjecucion = 0;
  var cerradas = 0;
  var vencidas = 0;
  var now = new Date();

  for (var j = 0; j < plans.length; j++) {
    var p = plans[j];
    if (p.estado === 'pendiente') pendientes++;
    if (p.estado === 'en_ejecucion') enEjecucion++;
    if (p.estado === 'cerrada') cerradas++;
    if (p.estado === 'vencida' || (p.fechaLimite && new Date(p.fechaLimite) < now && p.estado !== 'cerrada')) {
      vencidas++;
    }
  }

  return {
    app: { name: 'SGD Duncan 2.0 (Google Sheets Backend)', version: '2.0.0' },
    stats: {
      totalInspecciones: insps.length,
      conformes: conformes,
      noConformes: noConformes,
      tasaCumplimiento: tasa
    },
    planStats: {
      total: plans.length,
      pendientes: pendientes,
      enEjecucion: enEjecucion,
      cerradas: cerradas,
      vencidas: vencidas
    },
    inspeccionesRecientes: insps.slice(-5).reverse()
  };
}

function handleGetInspecciones() {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.INSPECCIONES);
  return sheetToObjects(sheet);
}

function handleGetInspeccion(id) {
  var insps = handleGetInspecciones();
  for (var i = 0; i < insps.length; i++) {
    if (String(insps[i]._id) === String(id) || String(insps[i].correlativo) === String(id)) {
      return insps[i];
    }
  }
  return null;
}

function handleGetPlanAccion() {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.PLAN_ACCION);
  return sheetToObjects(sheet);
}

function handleGetEmpleados(q) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.EMPLEADOS);
  var emps = sheetToObjects(sheet);
  if (!q) return emps;
  var qLow = q.toLowerCase();
  return emps.filter(function(e) {
    return (e.nombre && e.nombre.toLowerCase().indexOf(qLow) !== -1) ||
           (e.cedula && String(e.cedula).indexOf(qLow) !== -1) ||
           (e.cargo && e.cargo.toLowerCase().indexOf(qLow) !== -1);
  });
}

function ensureDefaultUsers(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length === 0 || !data[0][0]) {
    sheet.clear();
    sheet.appendRow(['_id', 'email', 'nombre', 'rol', 'password', 'activo']);
    formatHeaderRow(sheet);
    data = sheet.getDataRange().getValues();
  } else {
    // Normalizar encabezados para garantizar que 'password' y 'activo' estén presentes
    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    if (headers.indexOf('password') === -1) {
      sheet.getRange(1, 1, 1, 6).setValues([['_id', 'email', 'nombre', 'rol', 'password', 'activo']]);
      formatHeaderRow(sheet);
    }
  }

  data = sheet.getDataRange().getValues();
  var existingEmails = {};
  for (var i = 1; i < data.length; i++) {
    var em = String(data[i][1] || '').trim().toLowerCase();
    if (em) existingEmails[em] = i + 1; // 1-based row index
  }

  // 0. Propietario / Super Admin A. Becerra
  if (!existingEmails['aabecerra852@gmail.com']) {
    sheet.appendRow(['usr_admin_becerra', 'aabecerra852@gmail.com', 'A. Becerra (Administrador del Sistema)', 'Propietario / Super Admin', 'Panelas369*', true]);
  } else {
    var rowIdx0 = existingEmails['aabecerra852@gmail.com'];
    sheet.getRange(rowIdx0, 1, 1, 6).setValues([['usr_admin_becerra', 'aabecerra852@gmail.com', 'A. Becerra (Administrador del Sistema)', 'Propietario / Super Admin', 'Panelas369*', true]]);
  }

  // 1. Propietario Francisco Rojas
  if (!existingEmails['francisco.rojasp@gmail.com']) {
    sheet.appendRow(['usr_francisco', 'francisco.rojasp@gmail.com', 'Francisco Rojas', 'Propietario / Super Admin', 'Leo150873#*$', true]);
  } else {
    var rowIdx = existingEmails['francisco.rojasp@gmail.com'];
    sheet.getRange(rowIdx, 1, 1, 6).setValues([['usr_francisco', 'francisco.rojasp@gmail.com', 'Francisco Rojas', 'Propietario / Super Admin', 'Leo150873#*$', true]]);
  }

  // 2. Propietario SST / SSA Duncan
  if (!existingEmails['sgssaduncan@gmail.com']) {
    sheet.appendRow(['usr_sgssa', 'sgssaduncan@gmail.com', 'SST / SSA Duncan', 'Propietario / Super Admin', 'Leo150873#*$', true]);
  } else {
    var rowIdx2 = existingEmails['sgssaduncan@gmail.com'];
    sheet.getRange(rowIdx2, 1, 1, 6).setValues([['usr_sgssa', 'sgssaduncan@gmail.com', 'SST / SSA Duncan', 'Propietario / Super Admin', 'Leo150873#*$', true]]);
  }

  // 3. Admin General
  if (!existingEmails['admin@duncan.com.ve']) {
    sheet.appendRow(['usr_admin', 'admin@duncan.com.ve', 'Administrador General', 'Super Admin', 'Duncan2026*', true]);
  } else {
    var rowIdx3 = existingEmails['admin@duncan.com.ve'];
    sheet.getRange(rowIdx3, 1, 1, 6).setValues([['usr_admin', 'admin@duncan.com.ve', 'Administrador General', 'Super Admin', 'Duncan2026*', true]]);
  }
}

function handleGetUsuarios() {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
  ensureDefaultUsers(sheet);
  var users = sheetToObjects(sheet);
  return users.map(function(u) {
    return {
      _id: u._id,
      email: u.email,
      nombre: u.nombre,
      rol: u.rol,
      activo: u.activo === true || u.activo === 'true' || u.activo === 'VERDADERO' || u.activo === 1
    };
  });
}

function handleLogin(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
  ensureDefaultUsers(sheet);
  var users = sheetToObjects(sheet);
  var email = (payload.email || '').trim().toLowerCase();
  var password = String(payload.password || '').trim();

  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    var uEmail = (u.email || '').trim().toLowerCase();
    var uPass = String(u.password || '').trim();
    if (uEmail === email && uPass === password) {
      return {
        success: true,
        user: {
          _id: u._id,
          email: u.email,
          nombre: u.nombre,
          rol: u.rol,
          activo: true
        }
      };
    }
  }

  // Fallback seguro de credenciales maestras autorizadas
  if (email === 'francisco.rojasp@gmail.com' && password === 'Leo150873#*$') {
    return {
      success: true,
      user: {
        _id: 'usr_francisco',
        email: 'francisco.rojasp@gmail.com',
        nombre: 'Francisco Rojas',
        rol: 'Propietario / Super Admin',
        activo: true
      }
    };
  }
  if (email === 'sgssaduncan@gmail.com' && password === 'Leo150873#*$') {
    return {
      success: true,
      user: {
        _id: 'usr_sgssa',
        email: 'sgssaduncan@gmail.com',
        nombre: 'SST / SSA Duncan',
        rol: 'Propietario / Super Admin',
        activo: true
      }
    };
  }
  if (email === 'admin@duncan.com.ve' && (password === 'Duncan2026*' || password === 'admin123')) {
    return {
      success: true,
      user: {
        _id: 'usr_admin',
        email: 'admin@duncan.com.ve',
        nombre: 'Administrador General',
        rol: 'Super Admin',
        activo: true
      }
    };
  }

  return { success: false, message: 'Correo o contraseña incorrectos' };
}

function handleGetTableData(tableName) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(tableName);
  if (!sheet) return [];
  return sheetToObjects(sheet);
}

function handleSaveTableItem(payload) {
  var ss = getSpreadsheet();
  var tableName = payload.table;
  if (!tableName) return { success: false, message: 'Falta nombre de tabla' };
  var sheet = getOrCreateSheet(ss, tableName);
  var item = payload.item || {};
  var data = sheet.getDataRange().getValues();
  if (data.length === 0 || !data[0][0]) {
    var keys = Object.keys(item);
    sheet.appendRow(keys);
    formatHeaderRow(sheet);
    data = sheet.getDataRange().getValues();
  }

  var headers = data[0];
  var itemId = String(item._id || item.id || '');
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === itemId) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowValues = [];
  for (var j = 0; j < headers.length; j++) {
    var val = item[headers[j]];
    if (val === undefined) val = '';
    if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
    rowValues.push(val);
  }

  if (rowIndex > 1) {
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
  return { success: true, id: itemId };
}

function handleSaveTableBatch(payload) {
  var ss = getSpreadsheet();
  var tableName = payload.table;
  var items = payload.items || [];
  if (!tableName || items.length === 0) return { success: false, count: 0 };
  var sheet = getOrCreateSheet(ss, tableName);
  for (var k = 0; k < items.length; k++) {
    handleSaveTableItem({ table: tableName, item: items[k] });
  }
  return { success: true, count: items.length };
}

function handleSaveUsuario(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
  ensureDefaultUsers(sheet);

  var data = sheet.getDataRange().getValues();
  var email = (payload.email || '').trim().toLowerCase();
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    var rowId = String(data[i][0]);
    var rowEmail = String(data[i][1] || '').trim().toLowerCase();
    if (rowId === String(payload._id) || (email && rowEmail === email)) {
      rowIndex = i + 1;
      break;
    }
  }

  var id = payload._id || ('usr_' + Date.now());
  var rowData = [
    id,
    payload.email,
    payload.nombre,
    payload.rol || 'Inspector',
    payload.password || 'Duncan2026*',
    payload.activo !== false
  ];

  if (rowIndex > 1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  SpreadsheetApp.flush();
  return { success: true, id: id };
}

function handleDeleteUsuario(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(payload.id)) {
      var email = String(data[i][1] || '').trim().toLowerCase();
      if (email === 'francisco.rojasp@gmail.com' || email === 'sgssaduncan@gmail.com') {
        return { success: false, message: 'No se puede eliminar la cuenta principal de Propietario / Super Admin' };
      }
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, message: 'Usuario no encontrado' };
}

// ===================================================================
// RECUPERACIÓN DE CONTRASEÑA Y USUARIO (METODOLOGÍA COSTO CERO)
// ===================================================================

function handleSolicitarCodigoRecuperacion(payload) {
  var email = (payload.email || '').trim().toLowerCase();
  var code = String(payload.code || '');
  var nombre = payload.nombre || 'Trabajador Duncan';
  if (!email || !code) return { success: false, message: 'Faltan parámetros requeridos (email y código)' };

  try {
    MailApp.sendEmail({
      to: email,
      subject: 'Código de Recuperación de Acceso — SGD Duncan 2.0',
      htmlBody: '<div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">' +
        '<div style="background-color: #020617; padding: 24px; text-align: center; border-bottom: 3px solid #facc15;">' +
        '<h1 style="color: #facc15; margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 1px;">ACUMULADORES DUNCAN, S.A.</h1>' +
        '<p style="color: #94a3b8; margin: 4px 0 0; font-size: 11px; text-transform: uppercase;">Sistema de Gestión de Seguridad y Salud en el Trabajo (SGD 2.0)</p>' +
        '</div>' +
        '<div style="padding: 24px 28px; color: #1e293b; line-height: 1.6;">' +
        '<h2 style="font-size: 16px; font-weight: bold; margin-top: 0; color: #0f172a;">Recuperación de Contraseña y Acceso</h2>' +
        '<p style="font-size: 13px; color: #334155;">Estimado(a) <strong>' + nombre + '</strong>,</p>' +
        '<p style="font-size: 13px; color: #334155;">Se ha generado una solicitud para restablecer sus credenciales en el sistema SGD Duncan. Utilice el siguiente código de seguridad temporal:</p>' +
        '<div style="background-color: #fefce8; border: 2px dashed #facc15; padding: 18px; text-align: center; border-radius: 10px; margin: 22px 0;">' +
        '<span style="font-size: 11px; font-weight: bold; color: #854d0e; display: block; margin-bottom: 6px; text-transform: uppercase;">Código de Verificación Temporal:</span>' +
        '<span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0f172a; font-family: monospace;">' + code + '</span>' +
        '</div>' +
        '<p style="font-size: 12px; color: #64748b;">Este código es de uso personal, confidencial y expira en <strong>15 minutos</strong>. Si usted no realizó esta solicitud, puede desestimar este mensaje o contactar al administrador del sistema (<a href="mailto:aabecerra852@gmail.com" style="color: #0284c7; text-decoration: none;">aabecerra852@gmail.com</a>).</p>' +
        '</div>' +
        '<div style="background-color: #f8fafc; padding: 12px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #f1f5f9;">' +
        'Acumuladores Duncan © 2026 • Soporte Técnico SSST • Notificación Gratuita Automatizada' +
        '</div>' +
        '</div>'
    });
    return { success: true, message: 'Correo enviado satisfactoriamente vía Google MailApp (Costo Cero)' };
  } catch (errMail) {
    return { success: false, message: 'Error enviando correo: ' + errMail.toString() };
  }
}

function handleRecuperarPassword(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
  var data = sheet.getDataRange().getValues();
  var email = (payload.email || '').trim().toLowerCase();
  var newPassword = payload.newPassword || '';

  if (!email || !newPassword) {
    return { success: false, message: 'Faltan parámetros requeridos' };
  }

  for (var i = 1; i < data.length; i++) {
    var rowEmail = String(data[i][1] || '').trim().toLowerCase();
    if (rowEmail === email) {
      sheet.getRange(i + 1, 5).setValue(newPassword);
      SpreadsheetApp.flush();
      return { success: true, message: 'Contraseña actualizada en Google Sheets' };
    }
  }

  return { success: false, message: 'Usuario no encontrado en la hoja' };
}

// ===================================================================
// MANEJADORES DE ESCRITURA (POST)
// ===================================================================

function handleCreateInspeccion(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.INSPECCIONES);

  var newId = payload._id || ('insp_' + Date.now());
  var correlativo = payload.correlativo || (sheet.getLastRow() + 1000);

  var row = [
    newId,
    correlativo,
    payload.empresaId || '',
    payload.empresaNombre || '',
    payload.localidadId || '',
    payload.localidadNombre || '',
    payload.establecimientoId || '',
    payload.establecimientoNombre || '',
    payload.tipoInspeccionId || '',
    payload.tipoNombre || '',
    payload.tipoCodigo || '',
    payload.fecha || new Date().toISOString().split('T')[0],
    payload.inspector || '',
    payload.estado || 'en_progreso',
    payload.resultado || '',
    payload.puntuacion || 0,
    payload.observaciones || '',
    payload.formResponses || '{}',
    payload.formObservations || '{}',
    payload.formAdditional || '{}',
    payload.formSignatures || '{}',
    new Date().toISOString()
  ];

  sheet.appendRow(row);
  return { id: newId, correlativo: correlativo };
}

function handleSaveFormData(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.INSPECCIONES);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(payload.inspeccionId)) {
      var rowNum = i + 1;
      if (payload.resultado !== undefined) sheet.getRange(rowNum, 15).setValue(payload.resultado);
      if (payload.puntuacion !== undefined) sheet.getRange(rowNum, 16).setValue(payload.puntuacion);
      if (payload.responses !== undefined) sheet.getRange(rowNum, 18).setValue(payload.responses);
      if (payload.observations !== undefined) sheet.getRange(rowNum, 19).setValue(payload.observations);
      if (payload.additional !== undefined) sheet.getRange(rowNum, 20).setValue(payload.additional);
      if (payload.signatures !== undefined) sheet.getRange(rowNum, 21).setValue(payload.signatures);
      sheet.getRange(rowNum, 22).setValue(new Date().toISOString());
      return { success: true };
    }
  }
  return { success: false, message: 'Inspección no encontrada' };
}

function handleCompleteInspeccion(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.INSPECCIONES);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(payload.id)) {
      var rowNum = i + 1;
      sheet.getRange(rowNum, 14).setValue('completada'); // Estado
      sheet.getRange(rowNum, 22).setValue(new Date().toISOString()); // ActualizadoEn

      // Auto-generar items en Plan de Acción si hay NC / OM
      try {
        var rawResp = data[i][17]; // formResponses
        if (rawResp) {
          var resp = JSON.parse(rawResp);
          var sheetPlan = getOrCreateSheet(ss, SHEETS.PLAN_ACCION);
          var hoy = new Date().toISOString().split('T')[0];
          var limite = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

          for (var key in resp) {
            var val = resp[key];
            if (val === 'NC' || val === 'OM') {
              sheetPlan.appendRow([
                'plan_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                payload.id,
                data[i][3], // empresaNombre
                data[i][7], // establecimientoNombre
                data[i][10], // tipoCodigo
                data[i][9],  // tipoNombre
                key,         // item
                'Hallazgo de campo',
                val + ' en ítem: ' + key,
                'Subsanar no conformidad detectada en inspección.',
                'Supervisor de Sede',
                'Operaciones',
                hoy,
                limite,
                val === 'OM' ? 'Critica' : 'Media',
                'pendiente',
                'Auto-generado desde inspección',
                new Date().toISOString()
              ]);
            }
          }
        }
      } catch (e) {
        Logger.log('Error auto-generando plan: ' + e);
      }

      return { success: true };
    }
  }
  return { success: false };
}

function handleDeleteInspeccion(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.INSPECCIONES);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(payload.id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false };
}

function handleUpdatePlanAccion(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.PLAN_ACCION);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(payload.id)) {
      var rowNum = i + 1;
      if (payload.estado) sheet.getRange(rowNum, 16).setValue(payload.estado); // Col 16: estado
      if (payload.notas) sheet.getRange(rowNum, 17).setValue(payload.notas);   // Col 17: notas
      return { success: true };
    }
  }
  return { success: false };
}

function handleLogAudit(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.AUDIT_LOG);
  sheet.appendRow([
    'aud_' + Date.now(),
    payload.usuario || 'desconocido',
    payload.accion || '',
    payload.entidad || '',
    payload.entidadId || '',
    payload.detalles || '',
    new Date().toISOString()
  ]);
  return { success: true };
}

// ===================================================================
// UTILIDADES DE HOJA DE CÁLCULO
// ===================================================================

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  // Auto-inicializar encabezados si está vacía
  if (sheet.getLastRow() === 0) {
    if (name === SHEETS.INSPECCIONES) {
      sheet.appendRow([
        '_id', 'correlativo', 'empresaId', 'empresaNombre',
        'localidadId', 'localidadNombre', 'establecimientoId', 'establecimientoNombre',
        'tipoInspeccionId', 'tipoNombre', 'tipoCodigo', 'fecha',
        'inspector', 'estado', 'resultado', 'puntuacion',
        'observaciones', 'formResponses', 'formObservations',
        'formAdditional', 'formSignatures', 'actualizadoEn'
      ]);
      formatHeaderRow(sheet);
    } else if (name === SHEETS.PLAN_ACCION) {
      sheet.appendRow([
        '_id', 'inspeccionId', 'empresaNombre', 'establecimientoNombre',
        'tipoInspeccionCodigo', 'tipoInspeccionNombre', 'item', 'seccion',
        'hallazgo', 'descripcion', 'responsable', 'departamento',
        'fechaDeteccion', 'fechaLimite', 'prioridad', 'estado', 'notas', 'creadoEn'
      ]);
      formatHeaderRow(sheet);
    } else if (name === SHEETS.AUDIT_LOG) {
      sheet.appendRow(['_id', 'usuario', 'accion', 'entidad', 'entidadId', 'detalles', 'timestamp']);
      formatHeaderRow(sheet);
    } else if (name === SHEETS.EMPLEADOS) {
      sheet.appendRow(['_id', 'codigo', 'cedula', 'nombre', 'cargo', 'departamento', 'empresaNombre']);
      formatHeaderRow(sheet);
    } else if (name === SHEETS.USUARIOS) {
      ensureDefaultUsers(sheet);
    }
  }
  return sheet;
}

function sheetToObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Ignorar filas totalmente vacías
    if (!row[0] && !row[1]) continue;

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      if (val instanceof Date) {
        val = val.toISOString().split('T')[0];
      }
      obj[headers[j]] = val;
    }
    rows.push(obj);
  }
  return rows;
}

// ===================================================================
// INICIALIZADOR AUTOMÁTICO DE LA BASE DE DATOS (1-CLICK SETUP)
// ===================================================================
function setupSpreadsheet() {
  var ss = getSpreadsheet();

  // 1. Pestaña Inspecciones
  var sheetInsp = getOrCreateSheet(ss, SHEETS.INSPECCIONES);
  if (sheetInsp.getLastRow() === 0) {
    sheetInsp.appendRow([
      '_id', 'correlativo', 'empresaId', 'empresaNombre',
      'localidadId', 'localidadNombre', 'establecimientoId', 'establecimientoNombre',
      'tipoInspeccionId', 'tipoNombre', 'tipoCodigo', 'fecha',
      'inspector', 'estado', 'resultado', 'puntuacion',
      'observaciones', 'formResponses', 'formObservations',
      'formAdditional', 'formSignatures', 'actualizadoEn'
    ]);
    formatHeaderRow(sheetInsp);
  }

  // 2. Pestaña PlanAccion
  var sheetPlan = getOrCreateSheet(ss, SHEETS.PLAN_ACCION);
  if (sheetPlan.getLastRow() === 0) {
    sheetPlan.appendRow([
      '_id', 'inspeccionId', 'empresaNombre', 'establecimientoNombre',
      'tipoInspeccionCodigo', 'tipoInspeccionNombre', 'item', 'seccion',
      'hallazgo', 'descripcion', 'responsable', 'departamento',
      'fechaDeteccion', 'fechaLimite', 'prioridad', 'estado', 'notas', 'creadoEn'
    ]);
    formatHeaderRow(sheetPlan);
  }

  // 3. Pestaña Audit_Log
  var sheetAudit = getOrCreateSheet(ss, SHEETS.AUDIT_LOG);
  if (sheetAudit.getLastRow() === 0) {
    sheetAudit.appendRow(['_id', 'usuario', 'accion', 'entidad', 'entidadId', 'detalles', 'timestamp']);
    formatHeaderRow(sheetAudit);
  }

  // 4. Pestaña Empleados
  var sheetEmp = getOrCreateSheet(ss, SHEETS.EMPLEADOS);
  if (sheetEmp.getLastRow() === 0) {
    sheetEmp.appendRow(['_id', 'codigo', 'cedula', 'nombre', 'cargo', 'departamento', 'empresaNombre']);
    formatHeaderRow(sheetEmp);
  }

  // 5. Pestaña Usuarios
  var sheetUsr = getOrCreateSheet(ss, SHEETS.USUARIOS);
  ensureDefaultUsers(sheetUsr);

  // 6. Pestaña Establecimientos
  var sheetEst = getOrCreateSheet(ss, SHEETS.ESTABLECIMIENTOS);
  if (sheetEst.getLastRow() === 0) {
    sheetEst.appendRow(['_id', 'nombre', 'localidadId', 'localidadNombre', 'tipo', 'empresaId', 'empresaNombre']);
    formatHeaderRow(sheetEst);
  }

  // 7. Pestaña EvaluacionesMedicas (Ocupacional, PbB, Vacaciones)
  var sheetEval = getOrCreateSheet(ss, SHEETS.EVALUACIONES_MEDICAS);
  if (sheetEval.getLastRow() === 0) {
    sheetEval.appendRow([
      '_id', 'empleadoCedula', 'empleadoNombre', 'empleadoCargo', 'empleadoDepartamento',
      'tipoEvaluacion', 'fechaSolicitud', 'fechaAgendada', 'estado', 'aptitud',
      'plombemiaPbB', 'plombemiaALA', 'clinicaAutorizada', 'numeroAutorizacion', 'observaciones', 'actualizadoEn'
    ]);
    formatHeaderRow(sheetEval);
  }

  // 8. Pestaña ConsultasMedicas (V-EXPRESS REG_DIARIO)
  var sheetCons = getOrCreateSheet(ss, SHEETS.CONSULTAS_MEDICAS);
  if (sheetCons.getLastRow() === 0) {
    sheetCons.appendRow([
      '_id', 'fecha', 'hora', 'trabajadorCedula', 'trabajadorNombre', 'empresa', 'cargo', 'departamento',
      'motivo', 'sintomas', 'paSistolica', 'paDiastolica', 'frecuenciaCardiaca', 'temperatura', 'saturacionO2',
      'sistemaAfectado', 'impresionDiagnostica', 'tipoMorbilidad', 'clasificacionLegal', 'tratamiento',
      'reposo', 'diasReposo', 'remisionEspecialista', 'medico', 'actualizadoEn'
    ]);
    formatHeaderRow(sheetCons);
  }

  // 9. Pestaña ControlesPresion (V-EXPRESS REG_CONTROL_PA)
  var sheetPres = getOrCreateSheet(ss, SHEETS.CONTROLES_PRESION);
  if (sheetPres.getLastRow() === 0) {
    sheetPres.appendRow([
      '_id', 'fecha', 'hora', 'cedula', 'nombre', 'cargo', 'departamento', 'areaRiesgo',
      'paSistolica', 'paDiastolica', 'pulso', 'condicion', 'hipertensoConocido', 'medicamentoTomado',
      'aptoJornada', 'observaciones', 'registradoPor', 'actualizadoEn'
    ]);
    formatHeaderRow(sheetPres);
  }

  // 10. Pestaña AptitudPsicofisica (V-EXPRESS REG_APF)
  var sheetApt = getOrCreateSheet(ss, SHEETS.APTITUD_PSICOFISICA);
  if (sheetApt.getLastRow() === 0) {
    sheetApt.appendRow([
      '_id', 'numeroCertificado', 'fechaEmision', 'fechaVencimiento', 'cedula', 'nombre', 'edad', 'cargo',
      'antiguedad', 'tipoExamen', 'conclusion', 'restricciones', 'limiteCargaKg', 'restriccionPlomo',
      'restriccionAcido', 'medicoNombre', 'medicoMSDS', 'medicoCMV', 'actualizadoEn'
    ]);
    formatHeaderRow(sheetApt);
  }

  // 11. Pestaña Goniometrias (V-EXPRESS REG_GONIOMETRÍA)
  var sheetGon = getOrCreateSheet(ss, SHEETS.GONIOMETRIAS);
  if (sheetGon.getLastRow() === 0) {
    sheetGon.appendRow([
      '_id', 'fecha', 'cedula', 'nombre', 'cargo', 'segmentoArticular', 'movimiento',
      'rangoNormal', 'ladoDerecho', 'ladoIzquierdo', 'dolorPresente', 'deficitMovilidad',
      'conclusionErgonomica', 'evaluador', 'actualizadoEn'
    ]);
    formatHeaderRow(sheetGon);
  }

  // 12. Pestaña Dotaciones (EPP)
  var sheetDot = getOrCreateSheet(ss, SHEETS.DOTACIONES);
  if (sheetDot.getLastRow() === 0) {
    sheetDot.appendRow([
      '_id', 'fecha', 'empleadoCedula', 'empleadoNombre', 'cargo', 'departamento',
      'tipoDotacion', 'items', 'estado', 'observaciones', 'firmadoPor', 'actualizadoEn'
    ]);
    formatHeaderRow(sheetDot);
  }

  // 13. Pestaña LotoBloqueos
  var sheetLoto = getOrCreateSheet(ss, SHEETS.LOTO);
  if (sheetLoto.getLastRow() === 0) {
    sheetLoto.appendRow([
      '_id', 'codigo', 'fechaInicio', 'fechaFin', 'equipoTag', 'equipoNombre',
      'ubicacion', 'responsableCedula', 'responsableNombre', 'estado', 'pasosCompletados', 'actualizadoEn'
    ]);
    formatHeaderRow(sheetLoto);
  }

  // 14. Pestaña PermisosTrabajo
  var sheetPerm = getOrCreateSheet(ss, SHEETS.PERMISOS);
  if (sheetPerm.getLastRow() === 0) {
    sheetPerm.appendRow([
      '_id', 'correlativo', 'tipoPermiso', 'establecimientoNombre', 'area', 'fecha',
      'horaInicio', 'horaFin', 'solicitante', 'empresa', 'estado', 'riesgosIdentificados', 'actualizadoEn'
    ]);
    formatHeaderRow(sheetPerm);
  }

  // 15. Pestaña ComiteActas (CSSL / Delegados de Prevención)
  var sheetCom = getOrCreateSheet(ss, SHEETS.COMITE);
  if (sheetCom.getLastRow() === 0) {
    sheetCom.appendRow([
      '_id', 'numeroActa', 'fecha', 'tipoReunion', 'lugar', 'delegadosAsistentes',
      'representantesPatrono', 'puntosTratados', 'acuerdos', 'estado', 'actualizadoEn'
    ]);
    formatHeaderRow(sheetCom);
  }

  // 16. Pestaña Configuracion
  var sheetConf = getOrCreateSheet(ss, SHEETS.CONFIGURACION);
  if (sheetConf.getLastRow() === 0) {
    sheetConf.appendRow(['clave', 'valor', 'descripcion', 'actualizadoEn']);
    formatHeaderRow(sheetConf);
  }

  SpreadsheetApp.flush();
  Logger.log('¡Base de datos integral SGD Duncan 2.0 y V-EXPRESS configurada con éxito!');
}

function formatHeaderRow(sheet) {
  var range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground('#1e40af'); // Azul Duncan
  range.setFontColor('#ffffff');
  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
}
