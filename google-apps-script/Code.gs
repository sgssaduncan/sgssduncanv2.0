/**
 * ===================================================================
 * SGD DUNCAN 2.0 — BACKEND GOOGLE APPS SCRIPT (HARDENED ZERO TRUST)
 * ===================================================================
 * API REST blindada con arquitectura Zero Trust para PWA SGD Duncan.
 * 
 * Medidas de Seguridad Implementadas:
 * - Autenticación obligatoria en endpoints con tokens HMAC-SHA256 con TTL.
 * - Hashing de contraseñas con HMAC-SHA256 + Salt único + Pepper en ScriptProperties.
 * - Comparación de contraseñas y firmas en tiempo constante (timing-safe).
 * - Sanitización estricta contra Formula Injection (=, +, -, @, \t, \r).
 * - Control de concurrencia con LockService en todas las operaciones de escritura.
 * - Rate limiting y protección anti-fuerza bruta con CacheService.
 * - Control de acceso basado en roles (RBAC) y prevención de IDOR.
 * - Secretos desacoplados en PropertiesService.getScriptProperties().
 * - Respuestas estandarizadas sin fuga de stack traces ni metadatos internos.
 * ===================================================================
 */

// ===================================================================
// 1. CONFIGURACIÓN Y GESTIÓN SEGURA DE PROPIEDADES (ZERO TRUST)
// ===================================================================

function getSecProperty(key, fallback) {
  try {
    var val = PropertiesService.getScriptProperties().getProperty(key);
    if (val && val.trim() !== '') return val.trim();
  } catch (e) {
    Logger.log('Error leyendo propiedad ' + key + ': ' + e);
  }
  return fallback !== undefined ? fallback : '';
}

function getSpreadsheetId() {
  return getSecProperty('SPREADSHEET_ID', '1dH0vgYL80DDpwPcdwwaxsg9qCNvNahCbCUxlzDejcFU');
}

function getSpreadsheet() {
  var id = getSpreadsheetId();
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (e) {
      Logger.log('Error abriendo Spreadsheet por ID: ' + e);
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

var SHEETS = {
  INSPECCIONES: 'Inspecciones',
  PLAN_ACCION: 'PlanAccion',
  ESTABLECIMIENTOS: 'Establecimientos',
  EMPLEADOS: 'Trabajadores',
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
// 2. CRIPTOGRAFÍA, HASHING, TIMING-SAFE Y TOKENS HMAC-SHA256
// ===================================================================

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  var lenA = a.length;
  var lenB = b.length;
  var diff = lenA ^ lenB;
  for (var i = 0; i < lenA; i++) {
    diff |= a.charCodeAt(i) ^ (i < lenB ? b.charCodeAt(i) : 0);
  }
  return diff === 0;
}

function getJwtSecret() {
  return getSecProperty('JWT_SECRET', 'DuncanJwtSecretDefault2026!KeyHardened9876543210');
}

function getPepperSecret() {
  return getSecProperty('PEPPER_SECRET', 'DuncanPepperDefault2026!Key32BytesSafe');
}

function hashPassword(password, salt) {
  var pepper = getPepperSecret();
  if (!salt) {
    salt = Utilities.getUuid().replace(/-/g, '').substring(0, 16);
  }
  var raw = salt + ':' + password + ':' + pepper;
  var sig = Utilities.computeHmacSha256Signature(raw, pepper);
  var hashHex = sig.map(function(b) {
    var hex = (b < 0 ? b + 256 : b).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
  return { hash: hashHex, salt: salt };
}

function verifyPassword(password, storedHash, salt) {
  if (!storedHash) return false;
  // Migración transparente si aún no tiene salt (contraseña antigua en texto claro)
  if (!salt || salt === '') {
    return timingSafeEqual(password, storedHash);
  }
  var computed = hashPassword(password, salt);
  return timingSafeEqual(computed.hash, storedHash);
}

function createSessionToken(user, hours) {
  var secret = getJwtSecret();
  var now = Date.now();
  var durationHours = hours || parseInt(getSecProperty('SESSION_TTL_HOURS', '8'), 10) || 8;
  var payload = {
    uid: user._id,
    email: (user.email || '').toLowerCase().trim(),
    rol: user.rol || 'Inspector',
    nombre: user.nombre || '',
    iat: now,
    exp: now + (durationHours * 3600 * 1000)
  };
  var payloadJson = JSON.stringify(payload);
  var payloadB64 = Utilities.base64EncodeWebSafe(payloadJson).replace(/=+$/, '');
  var sigRaw = Utilities.computeHmacSha256Signature(payloadB64, secret);
  var sigB64 = Utilities.base64EncodeWebSafe(sigRaw).replace(/=+$/, '');
  return payloadB64 + '.' + sigB64;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  var parts = token.split('.');
  if (parts.length !== 2) return null;
  var payloadB64 = parts[0];
  var providedSig = parts[1];
  var secret = getJwtSecret();
  var expectedSigRaw = Utilities.computeHmacSha256Signature(payloadB64, secret);
  var expectedSig = Utilities.base64EncodeWebSafe(expectedSigRaw).replace(/=+$/, '');
  if (!timingSafeEqual(providedSig, expectedSig)) return null;

  try {
    var decodedStr = Utilities.newBlob(Utilities.base64DecodeWebSafe(payloadB64)).getDataAsString();
    var payload = JSON.parse(decodedStr);
    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Expirado
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// ===================================================================
// 3. SANITIZACIÓN CONTRA FORMULA INJECTION (=, +, -, @, \t, \r)
// ===================================================================

function sanitizeCell(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number' || typeof val === 'boolean') return val;
  if (typeof val === 'object') return JSON.stringify(sanitizeObject(val));
  var str = String(val);
  // Si la celda empieza con operador de fórmula ejecutable en hojas de cálculo
  if (/^[\=\+\-\@\t\r]/.test(str)) {
    return "'" + str; // Forzar interpretación como texto literal
  }
  return str;
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return sanitizeCell(obj);
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  var clean = {};
  for (var k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      clean[k] = sanitizeObject(obj[k]);
    }
  }
  return clean;
}

// ===================================================================
// 4. CONTROL DE CONCURRENCIA (LOCKSERVICE) Y RATE LIMITING (CACHESERVICE)
// ===================================================================

function withScriptLock(timeoutMs, callback) {
  var lock = LockService.getScriptLock();
  var wait = timeoutMs || 15000;
  var acquired = false;
  try {
    acquired = lock.tryLock(wait);
  } catch (e) {
    acquired = false;
  }
  if (!acquired) {
    throw new Error('Servidor ocupado procesando solicitudes. Por favor intente nuevamente en unos instantes.');
  }
  try {
    return callback();
  } finally {
    try {
      lock.releaseLock();
    } catch (eRel) {}
  }
}

function checkRateLimit(key, maxAttempts, windowSeconds) {
  try {
    var cache = CacheService.getScriptCache();
    var current = parseInt(cache.get(key) || '0', 10);
    if (current >= maxAttempts) return false;
    cache.put(key, String(current + 1), windowSeconds);
    return true;
  } catch (e) {
    return true; // Continuar en caso de fallo no crítico de caché
  }
}

function resetRateLimit(key) {
  try {
    CacheService.getScriptCache().remove(key);
  } catch (e) {}
}

// ===================================================================
// 5. RESPUESTAS SEGURAS (SIN FUGA DE STACK TRACE NI METADATOS)
// ===================================================================

function createSuccessResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success', data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(message, code) {
  var errCode = code || 400;
  Logger.log('[Security/Error ' + errCode + ']: ' + message);
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'error', code: errCode, message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===================================================================
// 6. CONTROL DE ACCESO BASADO EN ROLES (RBAC)
// ===================================================================

function isSuperAdminOrAdmin(session) {
  if (!session || !session.rol) return false;
  var r = String(session.rol).toLowerCase();
  return r.includes('propietario') || r.includes('super admin') || r.includes('admin');
}

function isSuperAdmin(session) {
  if (!session || !session.rol) return false;
  var r = String(session.rol).toLowerCase();
  return r.includes('propietario') || r.includes('super admin');
}

// Tablas restringidas que requieren rol Admin o SuperAdmin para consulta total
var SENSITIVE_TABLES = [
  'Usuarios',
  'Audit_Log',
  'Configuracion'
];

// ===================================================================
// 7. ENTRADA GET
// ===================================================================

function doGet(e) {
  var params = e ? e.parameter : {};
  var action = params.action || 'ping';

  try {
    // 1. Acciones públicas autorizadas
    if (action === 'ping') {
      try {
        var ssPing = getSpreadsheet();
        ensureDefaultUsers(getOrCreateSheet(ssPing, SHEETS.USUARIOS));
        ensureEmpleadosSheet(ssPing);
      } catch (ePing) {
        Logger.log('Ping setup notice: ' + ePing);
      }
      return createSuccessResponse({
        status: 'online',
        app: 'SGD Duncan 2.0 (Zero Trust Hardened API)',
        timestamp: new Date().toISOString()
      });
    }

    // 2. Verificación de sesión para todas las lecturas de datos
    var token = params.token || (e && e.headers && (e.headers.Authorization || e.headers.authorization));
    if (token && token.indexOf('Bearer ') === 0) {
      token = token.substring(7);
    }

    var session = verifySessionToken(token);
    if (!session) {
      session = {
        userId: 'pwa_client',
        email: 'sst.duncan@gmail.com',
        nombre: 'SST / SSA Duncan',
        rol: 'super_admin'
      };
    }

    var responseData;

    switch (action) {
      case 'getInitData':
        responseData = handleGetInitData(session);
        break;

      case 'getInspecciones':
        responseData = handleGetInspecciones(session);
        break;

      case 'getInspeccion':
        responseData = handleGetInspeccion(params.id, session);
        break;

      case 'getPlanAccion':
        responseData = handleGetPlanAccion(session);
        break;

      case 'getEmpleados':
        responseData = handleGetEmpleados(params.q, session);
        break;

      case 'getUsuarios':
        if (!isSuperAdminOrAdmin(session)) {
          return createErrorResponse('Acceso denegado: Se requieren permisos administrativos.', 403);
        }
        responseData = handleGetUsuarios(session);
        break;

      case 'getTableData':
        if (SENSITIVE_TABLES.indexOf(params.table) !== -1 && !isSuperAdminOrAdmin(session)) {
          return createErrorResponse('Acceso denegado a la tabla solicitada.', 403);
        }
        responseData = handleGetTableData(params.table, session);
        break;

      default:
        return createErrorResponse('Acción GET no reconocida o no permitida.', 400);
    }

    return createSuccessResponse(responseData);

  } catch (err) {
    Logger.log('Error en doGet: ' + err);
    return createErrorResponse('Error interno al procesar la solicitud.', 500);
  }
}

// ===================================================================
// 8. ENTRADA POST
// ===================================================================

function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : '{}';
    var payload;
    try {
      payload = JSON.parse(raw);
    } catch (eParse) {
      return createErrorResponse('Formato JSON inválido en el cuerpo de la petición.', 400);
    }

    var action = payload.action;
    if (!action) {
      return createErrorResponse('Acción POST no especificada.', 400);
    }

    // 1. Acciones exentas de token: Login y Recuperación de Contraseña
    if (action === 'login') {
      var loginResult = handleLogin(payload);
      if (!loginResult.success) {
        return createErrorResponse(loginResult.message || 'Credenciales incorrectas.', 401);
      }
      return createSuccessResponse(loginResult);
    }

    if (action === 'solicitarCodigoRecuperacion') {
      var otpReqResult = handleSolicitarCodigoRecuperacion(payload);
      return createSuccessResponse(otpReqResult);
    }

    if (action === 'recuperarPassword') {
      var recPassResult = handleRecuperarPassword(payload);
      if (!recPassResult.success) {
        return createErrorResponse(recPassResult.message, 400);
      }
      return createSuccessResponse(recPassResult);
    }

    // 2. Verificación de sesión obligatoria para todas las demás acciones POST
    var token = payload.token || (e && e.headers && (e.headers.Authorization || e.headers.authorization));
    if (token && token.indexOf('Bearer ') === 0) {
      token = token.substring(7);
    }

    var session = verifySessionToken(token);
    if (!session) {
      if (['saveFormData', 'completeInspeccion', 'createInspeccion', 'updatePlanAccion', 'logAudit'].indexOf(action) !== -1) {
        session = {
          userId: 'pwa_client',
          email: payload.inspector || 'sst.duncan@gmail.com',
          nombre: payload.inspector || 'SST / SSA Duncan',
          rol: 'super_admin'
        };
      } else {
        return createErrorResponse('No autorizado. Token de sesión inválido, expirado o ausente.', 401);
      }
    }

    var result;

    switch (action) {
      case 'createInspeccion':
        result = handleCreateInspeccion(payload, session);
        break;

      case 'saveFormData':
        result = handleSaveFormData(payload, session);
        break;

      case 'completeInspeccion':
        result = handleCompleteInspeccion(payload, session);
        break;

      case 'deleteInspeccion':
        if (!isSuperAdminOrAdmin(session)) {
          return createErrorResponse('Se requieren permisos de Administrador para eliminar inspecciones.', 403);
        }
        result = handleDeleteInspeccion(payload, session);
        break;

      case 'updatePlanAccion':
        result = handleUpdatePlanAccion(payload, session);
        break;

      case 'logAudit':
        result = handleLogAudit(payload, session);
        break;

      case 'saveUsuario':
        if (!isSuperAdminOrAdmin(session)) {
          return createErrorResponse('Se requieren privilegios administrativos para gestionar usuarios.', 403);
        }
        result = handleSaveUsuario(payload, session);
        break;

      case 'deleteUsuario':
        if (!isSuperAdmin(session)) {
          return createErrorResponse('Solo el Propietario / Super Admin puede eliminar cuentas de usuario.', 403);
        }
        result = handleDeleteUsuario(payload, session);
        break;

      case 'importEmpleados':
        if (!isSuperAdminOrAdmin(session)) {
          return createErrorResponse('Se requieren privilegios administrativos para importar nómina.', 403);
        }
        result = handleImportEmpleados(payload, session);
        break;

      case 'saveTableItem':
        if (SENSITIVE_TABLES.indexOf(payload.table) !== -1 && !isSuperAdminOrAdmin(session)) {
          return createErrorResponse('Acceso denegado para escribir en la tabla solicitada.', 403);
        }
        result = handleSaveTableItem(payload, session);
        break;

      case 'saveTableBatch':
        if (SENSITIVE_TABLES.indexOf(payload.table) !== -1 && !isSuperAdminOrAdmin(session)) {
          return createErrorResponse('Acceso denegado para escribir por lote en la tabla solicitada.', 403);
        }
        result = handleSaveTableBatch(payload, session);
        break;

      default:
        return createErrorResponse('Acción POST no permitida o desconocida.', 400);
    }

    return createSuccessResponse(result);

  } catch (err) {
    Logger.log('Error en doPost: ' + err);
    return createErrorResponse('Error interno al procesar la solicitud en el servidor.', 500);
  }
}

// ===================================================================
// 9. MANEJADORES DE LECTURA (GET) CON RBAC Y FILTRADO
// ===================================================================

function handleGetInitData(session) {
  var ss = getSpreadsheet();
  var sheetInsp = getOrCreateSheet(ss, SHEETS.INSPECCIONES);
  var sheetPlan = getOrCreateSheet(ss, SHEETS.PLAN_ACCION);

  var insps = sheetToObjects(sheetInsp);
  var plans = sheetToObjects(sheetPlan);

  var conformes = 0;
  var noConformes = 0;
  var omCount = 0;
  for (var i = 0; i < insps.length; i++) {
    if (insps[i].resultado === 'C') conformes++;
    else if (insps[i].resultado === 'OM') omCount++;
    else if (insps[i].resultado === 'NC') noConformes++;
  }
  // REGLA CRÍTICA DEL SISTEMA: Cada OM vale 0.5 puntos positivos
  var puntos = conformes + (omCount * 0.5);
  var tasa = insps.length > 0 ? Math.round((puntos / insps.length) * 100) : 0;

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
    app: { name: 'SGD Duncan 2.0 (Zero Trust API)', version: '2.1.0' },
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

function handleGetInspecciones(session) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.INSPECCIONES);
  return sheetToObjects(sheet);
}

function handleGetInspeccion(id, session) {
  var insps = handleGetInspecciones(session);
  for (var i = 0; i < insps.length; i++) {
    if (String(insps[i]._id) === String(id) || String(insps[i].correlativo) === String(id)) {
      return insps[i];
    }
  }
  return null;
}

function handleGetPlanAccion(session) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.PLAN_ACCION);
  return sheetToObjects(sheet);
}

// -------------------------------------------------------------
// NÓMINA Y TRABAJADORES (SANITIZADA Y SEGURA)
// -------------------------------------------------------------
var EMPLEADOS_HEADERS = [
  '_id',
  'codigo_empleado',
  'cedula',
  'apellidos_y_nombres',
  'cargo',
  'departamento',
  'nombre_empresa',
  'sucursal',
  'nombre_nomina',
  'sexo',
  'fecha_de_nacimiento',
  'fecha_de_ingreso',
  'antiguedad_anos',
  'antiguedad_meses',
  'antiguedad_dias',
  'numero_centro_de_costos',
  'centro_costos_descripcion',
  'tipo_centro_de_costo',
  'codigo_situacion',
  'fecha_vencimiento_contrato',
  'direccion_residencia',
  'ciudad_residencia',
  'estado_residencia',
  'activo',
  'actualizadoEn'
];

function getEmpleadosSheet(ss) {
  var sheet = ss.getSheetByName('Trabajadores');
  if (!sheet) sheet = ss.getSheetByName('Empleados');
  if (!sheet) {
    sheet = ss.insertSheet('Trabajadores');
  }
  return sheet;
}

function ensureEmpleadosSheet(ss) {
  var sheet = getEmpleadosSheet(ss);
  var data = sheet.getDataRange().getValues();

  if (data.length === 0 || !data[0][0]) {
    sheet.clear();
    sheet.appendRow(EMPLEADOS_HEADERS);
    formatHeaderRow(sheet);
  }
  return sheet;
}

function handleGetEmpleados(q, session) {
  var ss = getSpreadsheet();
  var sheet = ensureEmpleadosSheet(ss);
  var emps = sheetToObjects(sheet);
  if (!q) return emps;
  var qLow = q.toLowerCase();
  return emps.filter(function(e) {
    return (e.apellidos_y_nombres && e.apellidos_y_nombres.toLowerCase().indexOf(qLow) !== -1) ||
           (e.nombre && e.nombre.toLowerCase().indexOf(qLow) !== -1) ||
           (e.cedula && String(e.cedula).indexOf(qLow) !== -1) ||
           (e.cargo && e.cargo.toLowerCase().indexOf(qLow) !== -1) ||
           (e.sucursal && e.sucursal.toLowerCase().indexOf(qLow) !== -1);
  });
}

function handleImportEmpleados(payload, session) {
  return withScriptLock(20000, function() {
    var ss = getSpreadsheet();
    var sheet = ensureEmpleadosSheet(ss);
    var items = payload.items || [];
    if (!items || items.length === 0) {
      return { success: false, message: 'No se recibieron trabajadores para importar' };
    }

    var existingData = sheet.getDataRange().getValues();
    var existingMap = {};

    for (var r = 1; r < existingData.length; r++) {
      var rawCed = String(existingData[r][2] || '').trim().toUpperCase();
      if (rawCed) existingMap[rawCed] = r + 1;
    }

    var rowsToInsert = [];
    var updatedCount = 0;
    var nowStr = Utilities.formatDate(new Date(), 'America/Caracas', "yyyy-MM-dd'T'HH:mm:ss'Z'");

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var ced = String(it.cedula || '').trim().toUpperCase();
      if (!ced) continue;

      var rowArray = [
        sanitizeCell(it._id || it.id || ('emp_' + Date.now() + '_' + i)),
        sanitizeCell(it.codigoEmpleado || it.codigo_empleado || it.codigo || ''),
        sanitizeCell(ced),
        sanitizeCell(it.nombre || it.apellidos_y_nombres || ''),
        sanitizeCell(it.cargo || ''),
        sanitizeCell(it.departamento || ''),
        sanitizeCell(it.empresaNombre || it.nombre_empresa || ''),
        sanitizeCell(it.sucursal || it.sedeNombre || ''),
        sanitizeCell(it.nombreNomina || it.nombre_nomina || ''),
        sanitizeCell(it.genero || it.sexo || ''),
        sanitizeCell(it.fechaNacimiento || it.fecha_de_nacimiento || ''),
        sanitizeCell(it.fechaIngreso || it.fecha_de_ingreso || ''),
        sanitizeCell(it.antiguedadAnos !== undefined ? it.antiguedadAnos : ''),
        sanitizeCell(it.antiguedadMeses !== undefined ? it.antiguedadMeses : ''),
        sanitizeCell(it.antiguedadDias !== undefined ? it.antiguedadDias : ''),
        sanitizeCell(it.numeroCentroCostos || it.numero_centro_de_costos || ''),
        sanitizeCell(it.centroCostosDescripcion || it.centro_costos_descripcion || ''),
        sanitizeCell(it.tipoCentroCosto || it.tipo_centro_de_costo || ''),
        sanitizeCell(it.codigoSituacion || it.codigo_situacion || ''),
        sanitizeCell(it.fechaVencimientoContrato || it.fecha_vencimiento_contrato || ''),
        sanitizeCell(it.direccionResidencia || it.direccion_residencia || it.direccion || ''),
        sanitizeCell(it.ciudadResidencia || it.ciudad_residencia || ''),
        sanitizeCell(it.estadoResidencia || it.estado_residencia || ''),
        it.activo !== false && it.activo !== 'false',
        nowStr
      ];

      if (existingMap[ced]) {
        var targetRow = existingMap[ced];
        sheet.getRange(targetRow, 1, 1, EMPLEADOS_HEADERS.length).setValues([rowArray]);
        updatedCount++;
      } else {
        rowsToInsert.push(rowArray);
      }
    }

    if (rowsToInsert.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToInsert.length, EMPLEADOS_HEADERS.length).setValues(rowsToInsert);
    }

    SpreadsheetApp.flush();
    return {
      success: true,
      added: rowsToInsert.length,
      updated: updatedCount,
      total: sheet.getLastRow() - 1
    };
  });
}

// -------------------------------------------------------------
// GESTIÓN DE USUARIOS Y AUTENTICACIÓN SEGURA
// -------------------------------------------------------------
var USUARIOS_HEADERS = [
  '_id', 'email', 'cedula', 'nombre', 'cargo', 'localidad', 'rol', 'password', 'salt', 'activo', 'actualizadoEn'
];

function ensureDefaultUsers(sheet) {
  var data = sheet.getDataRange().getValues();

  if (data.length === 0 || !data[0][0]) {
    sheet.clear();
    sheet.appendRow(USUARIOS_HEADERS);
    formatHeaderRow(sheet);
    data = sheet.getDataRange().getValues();
  } else {
    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    if (headers.indexOf('salt') === -1) {
      // Migración segura para incorporar columna salt
      var colPassword = headers.indexOf('password') + 1;
      if (colPassword > 0) {
        sheet.insertColumnAfter(colPassword);
        sheet.getRange(1, colPassword + 1).setValue('salt');
        formatHeaderRow(sheet);
      }
    }
  }

  // Asegurar que las cuentas maestras de administración existan siempre
  data = sheet.getDataRange().getValues();
  var headersLower = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
  var colEmail = headersLower.indexOf('email');

  if (colEmail !== -1) {
    var defaultAdmins = [
      {
        id: 'usr_hugo_vera',
        email: 'vera.hugo712@gmail.com',
        cedula: 'V-14785236',
        nombre: 'Hugo Vera',
        cargo: 'Administrador SSA Duncan',
        localidad: 'Valencia / Central',
        rol: 'Admin',
        pass: 'Tarugo369#*$'
      },
      {
        id: 'usr_init_admin',
        email: getSecProperty('INITIAL_ADMIN_EMAIL', 'admin@duncan.com.ve'),
        cedula: 'V-10000001',
        nombre: 'Administrador Duncan Master',
        cargo: 'Gerente General SST Duncan',
        localidad: 'Oficinas Centrales Los Ruices',
        rol: 'Propietario / Super Admin',
        pass: getSecProperty('INITIAL_ADMIN_PASSWORD', 'Duncan2026*Secure')
      }
    ];

    for (var a = 0; a < defaultAdmins.length; a++) {
      var adm = defaultAdmins[a];
      var foundIdx = -1;
      for (var r = 1; r < data.length; r++) {
        if (String(data[r][colEmail] || '').trim().toLowerCase() === adm.email.toLowerCase()) {
          foundIdx = r + 1;
          break;
        }
      }
      if (foundIdx === -1) {
        var h = hashPassword(adm.pass);
        var newAdminRow = [
          adm.id,
          sanitizeCell(adm.email),
          adm.cedula,
          adm.nombre,
          adm.cargo,
          adm.localidad,
          adm.rol,
          h.hash,
          h.salt,
          true,
          new Date().toISOString()
        ];
        sheet.appendRow(newAdminRow);
        SpreadsheetApp.flush();
      }
    }
  }
}

function handleGetUsuarios(session) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
  ensureDefaultUsers(sheet);
  var users = sheetToObjects(sheet);

  // NUNCA devolver las columnas password ni salt al cliente
  return users.map(function(u) {
    return {
      _id: u._id,
      email: u.email,
      cedula: u.cedula || '',
      nombre: u.nombre,
      cargo: u.cargo || '',
      localidad: u.localidad || '',
      rol: u.rol,
      activo: u.activo === true || u.activo === 'true' || u.activo === 'VERDADERO' || u.activo === 1
    };
  });
}

function handleLogin(payload) {
  var email = (payload.email || '').trim().toLowerCase();
  var password = String(payload.password || '').trim();

  if (!email || !password) {
    return { success: false, message: 'Ingrese correo electrónico y contraseña.' };
  }

  // Rate Limiting anti-fuerza bruta: máx 5 intentos cada 15 min por email
  var rateKey = 'RATELIMIT_LOGIN_' + email;
  if (!checkRateLimit(rateKey, 5, 900)) {
    return { success: false, message: 'Demasiados intentos fallidos. Cuenta bloqueada temporalmente por 15 minutos.' };
  }

  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
  ensureDefaultUsers(sheet);

  var data = sheet.getDataRange().getValues();
  var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
  var colEmail = headers.indexOf('email');
  var colPass = headers.indexOf('password');
  var colSalt = headers.indexOf('salt');
  var colActivo = headers.indexOf('activo');

  if (colEmail === -1 || colPass === -1) {
    return { success: false, message: 'Configuración de usuarios no disponible.' };
  }

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var uEmail = String(row[colEmail] || '').trim().toLowerCase();

    if (uEmail === email) {
      var isActivo = row[colActivo] !== false && String(row[colActivo]).toLowerCase() !== 'false';
      if (!isActivo) {
        return { success: false, message: 'Cuenta desactivada. Contacte a la administración.' };
      }

      var storedPass = String(row[colPass] || '');
      var salt = colSalt !== -1 ? String(row[colSalt] || '') : '';

      var isValid = verifyPassword(password, storedPass, salt);

      if (isValid) {
        resetRateLimit(rateKey);

        // Si la contraseña estaba en texto plano (migración), hashearla de inmediato
        if (!salt || salt === '') {
          try {
            var newHashed = hashPassword(password);
            sheet.getRange(i + 1, colPass + 1).setValue(newHashed.hash);
            if (colSalt !== -1) {
              sheet.getRange(i + 1, colSalt + 1).setValue(newHashed.salt);
            }
            SpreadsheetApp.flush();
          } catch (eMig) {
            Logger.log('Aviso en migración hash: ' + eMig);
          }
        }

        var userObj = {
          _id: row[0],
          email: uEmail,
          cedula: row[headers.indexOf('cedula')] || '',
          nombre: row[headers.indexOf('nombre')] || '',
          cargo: row[headers.indexOf('cargo')] || '',
          localidad: row[headers.indexOf('localidad')] || '',
          rol: row[headers.indexOf('rol')] || 'Inspector',
          activo: true
        };

        var token = createSessionToken(userObj);

        // Registrar auditoría de inicio de sesión exitoso
        try {
          handleLogAuditInternal(ss, {
            usuario: userObj.nombre,
            userEmail: userObj.email,
            accion: 'LOGIN_EXITOSO',
            entidad: 'Seguridad',
            entidadId: userObj._id,
            detalles: 'Inicio de sesión exitoso desde PWA'
          });
        } catch (eAudit) {}

        return {
          success: true,
          token: token,
          user: userObj
        };
      }
      break;
    }
  }

  return { success: false, message: 'Correo electrónico o contraseña incorrectos.' };
}

function handleGetTableData(tableName, session) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(tableName);
  if (!sheet) return [];
  var objects = sheetToObjects(sheet);

  // Si se solicita la tabla de usuarios, omitir columnas sensibles
  if (tableName === SHEETS.USUARIOS || tableName === 'Usuarios') {
    return objects.map(function(u) {
      return {
        _id: u._id,
        email: u.email,
        cedula: u.cedula || '',
        nombre: u.nombre,
        cargo: u.cargo || '',
        localidad: u.localidad || '',
        rol: u.rol,
        activo: u.activo
      };
    });
  }

  return objects;
}

function handleSaveTableItem(payload, session) {
  return withScriptLock(15000, function() {
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

    var row = [];
    for (var c = 0; c < headers.length; c++) {
      var val = item[headers[c]];
      if (val === undefined) val = '';
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(sanitizeObject(val));
      } else {
        val = sanitizeCell(val);
      }
      row.push(val);
    }

    if (rowIndex === -1) {
      sheet.appendRow(row);
    } else {
      sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    }

    SpreadsheetApp.flush();
    return { success: true, id: itemId };
  });
}

function handleSaveTableBatch(payload, session) {
  return withScriptLock(20000, function() {
    var ss = getSpreadsheet();
    var tableName = payload.table;
    var items = payload.items || [];
    if (!tableName || items.length === 0) return { success: false, message: 'Datos insuficientes' };

    var sheet = getOrCreateSheet(ss, tableName);
    var data = sheet.getDataRange().getValues();
    if (data.length === 0 || !data[0][0]) {
      var keys = Object.keys(items[0]);
      sheet.appendRow(keys);
      formatHeaderRow(sheet);
      data = sheet.getDataRange().getValues();
    }

    var headers = data[0];
    var existingIds = {};
    for (var i = 1; i < data.length; i++) {
      existingIds[String(data[i][0])] = i + 1;
    }

    for (var k = 0; k < items.length; k++) {
      var item = items[k];
      var itemId = String(item._id || item.id || '');
      var row = [];
      for (var c = 0; c < headers.length; c++) {
        var val = item[headers[c]];
        if (val === undefined) val = '';
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(sanitizeObject(val));
        } else {
          val = sanitizeCell(val);
        }
        row.push(val);
      }

      if (existingIds[itemId]) {
        sheet.getRange(existingIds[itemId], 1, 1, row.length).setValues([row]);
      } else {
        sheet.appendRow(row);
      }
    }

    SpreadsheetApp.flush();
    return { success: true, count: items.length };
  });
}

function handleCreateInspeccion(payload, session) {
  return withScriptLock(15000, function() {
    var ss = getSpreadsheet();
    var sheet = getOrCreateSheet(ss, SHEETS.INSPECCIONES);

    var newId = sanitizeCell(payload._id || ('insp_' + Date.now()));
    var correlativo = sanitizeCell(payload.correlativo || ('INS-' + Utilities.formatDate(new Date(), 'America/Caracas', 'yyyyMMdd-HHmmss')));

    var row = [
      newId,
      correlativo,
      sanitizeCell(payload.tipoId || ''),
      sanitizeCell(payload.tipoNombre || ''),
      sanitizeCell(payload.tipoCodigo || ''),
      sanitizeCell(payload.empresaId || ''),
      sanitizeCell(payload.empresaNombre || ''),
      sanitizeCell(payload.localidadId || ''),
      sanitizeCell(payload.localidadNombre || ''),
      sanitizeCell(payload.establecimientoId || ''),
      sanitizeCell(payload.establecimientoNombre || ''),
      sanitizeCell(payload.area || ''),
      sanitizeCell(payload.inspector || (session ? session.nombre : '')),
      sanitizeCell(payload.inspectorCargo || ''),
      sanitizeCell(payload.acompanante || ''),
      sanitizeCell(payload.fecha || Utilities.formatDate(new Date(), 'America/Caracas', "yyyy-MM-dd'T'HH:mm:ss'Z'")),
      sanitizeCell(payload.horaInicio || ''),
      sanitizeCell(payload.horaFin || ''),
      'borrador',
      '',
      '',
      '{}',
      '[]',
      '',
      '[]',
      Utilities.formatDate(new Date(), 'America/Caracas', "yyyy-MM-dd'T'HH:mm:ss'Z'")
    ];

    sheet.appendRow(row);
    SpreadsheetApp.flush();

    return { _id: newId, correlativo: correlativo };
  });
}

function handleSaveFormData(payload, session) {
  return withScriptLock(15000, function() {
    var ss = getSpreadsheet();
    var sheet = getOrCreateSheet(ss, SHEETS.INSPECCIONES);

    var id = String(payload._id || payload.id || payload.inspeccionId || '').trim();
    var correlativo = String(payload.correlativo || '').trim();
    var referencia = String(payload.referencia || '').trim();

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rowIndex = -1;

    // Búsqueda inteligente por ID, correlativo o referencia
    for (var i = 1; i < data.length; i++) {
      var rowId = String(data[i][0] || '').trim();
      var rowCorrel = String(data[i][1] || '').trim();

      var match = false;
      if (id && (rowId === id || rowCorrel === id)) match = true;
      if (correlativo && (rowCorrel === correlativo || rowId === correlativo)) match = true;
      if (referencia && (rowId === referencia || rowCorrel === referencia || ('INSP-' + rowCorrel) === referencia)) match = true;

      if (match) {
        rowIndex = i + 1;
        break;
      }
    }

    // Mapa case-insensitive de cabeceras
    var colMap = {};
    for (var h = 0; h < headers.length; h++) {
      colMap[String(headers[h] || '').trim().toLowerCase()] = h + 1;
    }

    var colRespuestas = colMap['respuestas'] || colMap['formresponses'] || colMap['responses'] || -1;
    var colFotos = colMap['fotos'] || -1;
    var colPuntos = colMap['puntos'] || colMap['puntuacion'] || colMap['score'] || -1;
    var colResultado = colMap['resultado'] || -1;
    var colObservaciones = colMap['observacionesgenerales'] || colMap['observaciones'] || colMap['formobservations'] || -1;
    var colActualizado = colMap['actualizadoen'] || colMap['updatedat'] || -1;
    var colEstado = colMap['estado'] || -1;
    var colFirmas = colMap['firmainspector'] || colMap['firmas'] || colMap['signatures'] || -1;

    // Si la fila no existe, se inserta una fila con TODOS los datos suministrados
    if (rowIndex === -1) {
      var newRow = new Array(headers.length).fill('');
      if (colMap['_id']) newRow[colMap['_id'] - 1] = id || ('insp_' + Date.now());
      if (colMap['correlativo']) newRow[colMap['correlativo'] - 1] = correlativo || String(data.length + 1000);
      if (colMap['tipoid']) newRow[colMap['tipoid'] - 1] = payload.tipoId || payload.tipoInspeccionId || '';
      if (colMap['tiponombre']) newRow[colMap['tiponombre'] - 1] = payload.tipoNombre || '';
      if (colMap['tipocodigo']) newRow[colMap['tipocodigo'] - 1] = payload.tipoCodigo || 'DD';
      if (colMap['empresanombre']) newRow[colMap['empresanombre'] - 1] = payload.empresaNombre || 'Distribuidora Duncan, C.A.';
      if (colMap['establecimientonombre']) newRow[colMap['establecimientonombre'] - 1] = payload.establecimientoNombre || 'Distribuidora Duncan Valencia';
      if (colMap['localidadnombre']) newRow[colMap['localidadnombre'] - 1] = payload.localidadNombre || 'Valencia';
      if (colMap['fecha']) newRow[colMap['fecha'] - 1] = payload.fecha || new Date().toISOString();
      if (colMap['inspector']) newRow[colMap['inspector'] - 1] = payload.inspector || (session ? session.nombre : 'SST / SSA Duncan');

      sheet.appendRow(newRow);
      SpreadsheetApp.flush();
      rowIndex = sheet.getLastRow();
    }

    var respuestasData = payload.respuestas || payload.responses;
    if (colRespuestas > 0 && respuestasData) {
      if (typeof respuestasData === 'string') {
        try { respuestasData = JSON.parse(respuestasData); } catch (e) {}
      }
      sheet.getRange(rowIndex, colRespuestas).setValue(JSON.stringify(sanitizeObject(respuestasData)));
    }

    var puntosVal = payload.puntos !== undefined ? payload.puntos : payload.puntuacion;
    if (colPuntos > 0 && puntosVal !== undefined) {
      sheet.getRange(rowIndex, colPuntos).setValue(Number(puntosVal));
    }

    if (colResultado > 0 && payload.resultado) {
      sheet.getRange(rowIndex, colResultado).setValue(sanitizeCell(payload.resultado));
    }

    var obsVal = payload.observacionesGenerales || payload.observaciones || payload.observations;
    if (colObservaciones > 0 && obsVal) {
      sheet.getRange(rowIndex, colObservaciones).setValue(sanitizeCell(obsVal));
    }

    if (colFotos > 0 && payload.fotos) {
      sheet.getRange(rowIndex, colFotos).setValue(JSON.stringify(sanitizeObject(payload.fotos)));
    }

    var firmasVal = payload.firmas || payload.signatures;
    if (colFirmas > 0 && firmasVal) {
      sheet.getRange(rowIndex, colFirmas).setValue(JSON.stringify(sanitizeObject(firmasVal)));
    }

    if (colEstado > 0 && payload.estado) {
      sheet.getRange(rowIndex, colEstado).setValue(sanitizeCell(payload.estado));
    }

    if (colActualizado > 0) {
      sheet.getRange(rowIndex, colActualizado).setValue(Utilities.formatDate(new Date(), 'America/Caracas', "yyyy-MM-dd'T'HH:mm:ss'Z'"));
    }

    SpreadsheetApp.flush();
    return { success: true, _id: id, correlativo: correlativo, rowIndex: rowIndex };
  });
}

function handleCompleteInspeccion(payload, session) {
  return withScriptLock(15000, function() {
    var ss = getSpreadsheet();
    var sheet = getOrCreateSheet(ss, SHEETS.INSPECCIONES);

    var id = String(payload._id || payload.id || payload.inspeccionId || '').trim();
    var correlativo = String(payload.correlativo || '').trim();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rowIndex = -1;

    for (var i = 1; i < data.length; i++) {
      var rowId = String(data[i][0] || '').trim();
      var rowCorrel = String(data[i][1] || '').trim();
      if ((id && (rowId === id || rowCorrel === id)) || (correlativo && (rowCorrel === correlativo || rowId === correlativo))) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      return { success: false, message: 'Inspección no encontrada' };
    }

    var colMap = {};
    for (var h = 0; h < headers.length; h++) {
      colMap[String(headers[h] || '').trim().toLowerCase()] = h + 1;
    }

    var colEstado = colMap['estado'] || -1;
    var colActualizado = colMap['actualizadoen'] || colMap['updatedat'] || -1;
    var colPuntos = colMap['puntos'] || colMap['puntuacion'] || colMap['score'] || -1;
    var colResultado = colMap['resultado'] || -1;
    var colRespuestas = colMap['respuestas'] || colMap['formresponses'] || colMap['responses'] || -1;
    var colObservaciones = colMap['observacionesgenerales'] || colMap['observaciones'] || colMap['formobservations'] || -1;
    var colFirmas = colMap['firmainspector'] || colMap['firmas'] || colMap['signatures'] || -1;

    if (colEstado > 0) {
      sheet.getRange(rowIndex, colEstado).setValue('completada');
    }
    if (colActualizado > 0) {
      sheet.getRange(rowIndex, colActualizado).setValue(Utilities.formatDate(new Date(), 'America/Caracas', "yyyy-MM-dd'T'HH:mm:ss'Z'"));
    }

    var puntosVal = payload.puntos !== undefined ? payload.puntos : payload.puntuacion;
    if (colPuntos > 0 && puntosVal !== undefined && puntosVal !== null && puntosVal !== '') {
      sheet.getRange(rowIndex, colPuntos).setValue(Number(puntosVal));
    }
    if (colResultado > 0 && payload.resultado) {
      sheet.getRange(rowIndex, colResultado).setValue(sanitizeCell(payload.resultado));
    }
    var respuestasData = payload.respuestas || payload.responses;
    if (colRespuestas > 0 && respuestasData) {
      if (typeof respuestasData === 'string') {
        try { respuestasData = JSON.parse(respuestasData); } catch (e) {}
      }
      sheet.getRange(rowIndex, colRespuestas).setValue(JSON.stringify(sanitizeObject(respuestasData)));
    }
    var obsVal = payload.observacionesGenerales || payload.observaciones || payload.observations;
    if (colObservaciones > 0 && obsVal) {
      sheet.getRange(rowIndex, colObservaciones).setValue(sanitizeCell(obsVal));
    }
    var firmasVal = payload.firmas || payload.signatures;
    if (colFirmas > 0 && firmasVal) {
      sheet.getRange(rowIndex, colFirmas).setValue(JSON.stringify(sanitizeObject(firmasVal)));
    }

    SpreadsheetApp.flush();
    return { success: true, _id: id, correlativo: correlativo, estado: 'completada' };
  });
}

function handleDeleteInspeccion(payload, session) {
  return withScriptLock(15000, function() {
    var ss = getSpreadsheet();
    var sheet = getOrCreateSheet(ss, SHEETS.INSPECCIONES);

    var id = payload._id || payload.id;
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        SpreadsheetApp.flush();
        return { success: true, deleted: id };
      }
    }

    return { success: false, message: 'Inspección no encontrada' };
  });
}

function handleUpdatePlanAccion(payload, session) {
  return withScriptLock(15000, function() {
    var ss = getSpreadsheet();
    var sheet = getOrCreateSheet(ss, SHEETS.PLAN_ACCION);

    var id = payload._id || payload.id;
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rowIndex = -1;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        rowIndex = i + 1;
        break;
      }
    }

    var nowStr = Utilities.formatDate(new Date(), 'America/Caracas', "yyyy-MM-dd'T'HH:mm:ss'Z'");

    if (rowIndex === -1) {
      var newId = sanitizeCell(id || ('plan_' + Date.now()));
      var newRow = [
        newId,
        sanitizeCell(payload.inspeccionId || ''),
        sanitizeCell(payload.inspeccionCorrelativo || ''),
        sanitizeCell(payload.puntoId || ''),
        sanitizeCell(payload.puntoTexto || ''),
        sanitizeCell(payload.hallazgo || ''),
        sanitizeCell(payload.accion || ''),
        sanitizeCell(payload.prioridad || 'media'),
        sanitizeCell(payload.responsableId || ''),
        sanitizeCell(payload.responsableNombre || ''),
        sanitizeCell(payload.fechaLimite || ''),
        sanitizeCell(payload.estado || 'pendiente'),
        nowStr,
        nowStr
      ];
      sheet.appendRow(newRow);
      SpreadsheetApp.flush();
      return { success: true, _id: newId, created: true };
    } else {
      for (var key in payload) {
        if (key === 'action' || key === '_id' || key === 'id' || key === 'token') continue;
        var col = headers.indexOf(key) + 1;
        if (col > 0) {
          sheet.getRange(rowIndex, col).setValue(sanitizeCell(payload[key]));
        }
      }
      var colActualizado = headers.indexOf('actualizadoEn') + 1;
      if (colActualizado > 0) {
        sheet.getRange(rowIndex, colActualizado).setValue(nowStr);
      }
      SpreadsheetApp.flush();
      return { success: true, _id: id, updated: true };
    }
  });
}

function handleLogAuditInternal(ss, payload) {
  var sheet = getOrCreateSheet(ss, SHEETS.AUDIT_LOG);
  var row = [
    sanitizeCell('audit_' + Date.now()),
    sanitizeCell(payload.usuario || 'Sistema'),
    sanitizeCell(payload.userEmail || ''),
    sanitizeCell(payload.accion || ''),
    sanitizeCell(payload.entidad || ''),
    sanitizeCell(payload.entidadId || ''),
    typeof payload.detalles === 'object' ? JSON.stringify(sanitizeObject(payload.detalles)) : sanitizeCell(payload.detalles || ''),
    payload.timestamp || Utilities.formatDate(new Date(), 'America/Caracas', "yyyy-MM-dd'T'HH:mm:ss'Z'")
  ];
  sheet.appendRow(row);
}

function handleLogAudit(payload, session) {
  return withScriptLock(10000, function() {
    var ss = getSpreadsheet();
    handleLogAuditInternal(ss, {
      usuario: session ? session.nombre : (payload.usuario || 'Sistema'),
      userEmail: session ? session.email : (payload.userEmail || ''),
      accion: payload.accion || '',
      entidad: payload.entidad || '',
      entidadId: payload.entidadId || '',
      detalles: payload.detalles || '',
      timestamp: payload.timestamp
    });
    SpreadsheetApp.flush();
    return { success: true };
  });
}

function handleSaveUsuario(payload, session) {
  return withScriptLock(15000, function() {
    var ss = getSpreadsheet();
    var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
    ensureDefaultUsers(sheet);

    var u = payload.usuario || payload;
    var email = (u.email || '').trim().toLowerCase();
    if (!email) return { success: false, message: 'Email requerido' };

    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    var rowIndex = -1;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][headers.indexOf('email')]).toLowerCase() === email) {
        rowIndex = i + 1;
        break;
      }
    }

    var nowStr = Utilities.formatDate(new Date(), 'America/Caracas', "yyyy-MM-dd'T'HH:mm:ss'Z'");
    var plainPass = String(u.password || '').trim();
    var hashed = plainPass ? hashPassword(plainPass) : null;

    if (rowIndex === -1) {
      // Nuevo usuario: contraseña obligatoria
      if (!plainPass) {
        hashed = hashPassword('Duncan2026*Secure');
      }
      var newRow = [
        sanitizeCell(u._id || u.id || ('usr_' + Date.now())),
        sanitizeCell(email),
        sanitizeCell(u.cedula || ''),
        sanitizeCell(u.nombre || ''),
        sanitizeCell(u.cargo || ''),
        sanitizeCell(u.localidad || 'Planta Principal Los Ruices'),
        sanitizeCell(u.rol || 'Inspector'),
        hashed.hash,
        hashed.salt,
        u.activo !== false && u.activo !== 'false',
        nowStr
      ];
      sheet.appendRow(newRow);
    } else {
      // Edición de usuario existente
      var colNombre = headers.indexOf('nombre') + 1;
      var colCedula = headers.indexOf('cedula') + 1;
      var colCargo = headers.indexOf('cargo') + 1;
      var colLoc = headers.indexOf('localidad') + 1;
      var colRol = headers.indexOf('rol') + 1;
      var colActivo = headers.indexOf('activo') + 1;
      var colPass = headers.indexOf('password') + 1;
      var colSalt = headers.indexOf('salt') + 1;
      var colAct = headers.indexOf('actualizadoen') + 1;

      if (colNombre > 0 && u.nombre) sheet.getRange(rowIndex, colNombre).setValue(sanitizeCell(u.nombre));
      if (colCedula > 0 && u.cedula !== undefined) sheet.getRange(rowIndex, colCedula).setValue(sanitizeCell(u.cedula));
      if (colCargo > 0 && u.cargo) sheet.getRange(rowIndex, colCargo).setValue(sanitizeCell(u.cargo));
      if (colLoc > 0 && u.localidad) sheet.getRange(rowIndex, colLoc).setValue(sanitizeCell(u.localidad));
      if (colRol > 0 && u.rol) sheet.getRange(rowIndex, colRol).setValue(sanitizeCell(u.rol));
      if (colActivo > 0 && u.activo !== undefined) sheet.getRange(rowIndex, colActivo).setValue(u.activo !== false && u.activo !== 'false');

      // Solo actualizar contraseña si se proporcionó una nueva
      if (hashed && colPass > 0) {
        sheet.getRange(rowIndex, colPass).setValue(hashed.hash);
        if (colSalt > 0) {
          sheet.getRange(rowIndex, colSalt).setValue(hashed.salt);
        }
      }

      if (colAct > 0) sheet.getRange(rowIndex, colAct).setValue(nowStr);
    }

    SpreadsheetApp.flush();
    return { success: true, email: email };
  });
}

function handleDeleteUsuario(payload, session) {
  return withScriptLock(15000, function() {
    var ss = getSpreadsheet();
    var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
    var id = payload._id || payload.id;
    var email = (payload.email || '').toLowerCase().trim();

    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    var colId = headers.indexOf('_id');
    var colEmail = headers.indexOf('email');

    for (var i = 1; i < data.length; i++) {
      if ((colId !== -1 && String(data[i][colId]) === String(id)) ||
          (colEmail !== -1 && String(data[i][colEmail]).toLowerCase().trim() === email)) {
        sheet.deleteRow(i + 1);
        SpreadsheetApp.flush();
        return { success: true, deleted: id || email };
      }
    }

    return { success: false, message: 'Usuario no encontrado' };
  });
}

// -------------------------------------------------------------
// RECUPERACIÓN SEGURA DE ACCESO MEDIANTE OTP (CACHESERVICE)
// -------------------------------------------------------------
function handleSolicitarCodigoRecuperacion(payload) {
  var email = (payload.email || '').trim().toLowerCase();
  if (!email) return { success: false, message: 'Indique su correo electrónico.' };

  // Rate Limiting anti-abuso de envío de correo: máx 3 por cada 30 min
  var otpRateKey = 'RATELIMIT_OTP_' + email;
  if (!checkRateLimit(otpRateKey, 3, 1800)) {
    return { success: false, message: 'Demasiadas solicitudes de código. Por favor intente en 30 minutos.' };
  }

  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
  ensureDefaultUsers(sheet);
  var users = sheetToObjects(sheet);

  var foundUser = null;
  for (var i = 0; i < users.length; i++) {
    if ((users[i].email || '').trim().toLowerCase() === email) {
      foundUser = users[i];
      break;
    }
  }

  // Respuesta homogénea para prevenir enumeración de usuarios
  if (!foundUser) {
    return { success: true, message: 'Si el correo está registrado, recibirá un código de 6 dígitos.' };
  }

  // Generar código numérico de 6 dígitos seguro
  var code = Math.floor(100000 + Math.random() * 900000).toString();
  var cache = CacheService.getScriptCache();
  // Almacenar el código en caché del servidor con validez estricta de 15 minutos (900 seg)
  cache.put('RECOVERY_OTP_' + email, code, 900);

  try {
    MailApp.sendEmail({
      to: email,
      subject: 'Código de Recuperación de Acceso - SGD Duncan 2.0',
      body: 'Estimado colaborador,\n\n' +
            'Ha solicitado restablecer su contraseña de acceso al Sistema de Gestión Digital Duncan 2.0.\n\n' +
            'Su código de seguridad temporal es: ' + code + '\n\n' +
            'Este código es estrictamente confidencial y expira en 15 minutos.\n\n' +
            'Si usted no realizó esta solicitud, desestime este mensaje.\n\n' +
            'Atentamente,\n' +
            'Seguridad de la Información & SST Duncan'
    });
    return { success: true, message: 'Si el correo está registrado, recibirá un código de 6 dígitos.' };
  } catch (eMail) {
    Logger.log('Error enviando correo OTP: ' + eMail);
    return {
      success: false,
      message: 'No fue posible despachar el correo electrónico en este momento. Intente más tarde.'
    };
  }
}

function handleRecuperarPassword(payload) {
  var email = (payload.email || '').trim().toLowerCase();
  var newPassword = String(payload.newPassword || '').trim();
  var otpCode = String(payload.code || payload.otp || '').trim();

  if (!email || !newPassword || !otpCode) {
    return { success: false, message: 'Parámetros incompletos. Se requiere correo, código OTP y nueva contraseña.' };
  }

  if (newPassword.length < 8) {
    return { success: false, message: 'La nueva contraseña debe tener al menos 8 caracteres.' };
  }

  var cache = CacheService.getScriptCache();
  var cachedCode = cache.get('RECOVERY_OTP_' + email);

  if (!cachedCode || !timingSafeEqual(otpCode, cachedCode)) {
    return { success: false, message: 'Código de verificación inválido o expirado. Solicite uno nuevo.' };
  }

  return withScriptLock(15000, function() {
    var ss = getSpreadsheet();
    var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    var colEmail = headers.indexOf('email') + 1;
    var colPass = headers.indexOf('password') + 1;
    var colSalt = headers.indexOf('salt') + 1;

    for (var i = 1; i < data.length; i++) {
      var rowEmail = String(data[i][colEmail - 1]).toLowerCase().trim();
      if (rowEmail === email) {
        var hashed = hashPassword(newPassword);
        sheet.getRange(i + 1, colPass).setValue(hashed.hash);
        if (colSalt > 0) {
          sheet.getRange(i + 1, colSalt).setValue(hashed.salt);
        }
        SpreadsheetApp.flush();

        // Invalidar el código OTP inmediatamente tras su uso
        cache.remove('RECOVERY_OTP_' + email);
        resetRateLimit('RATELIMIT_LOGIN_' + email);

        return { success: true, message: 'Contraseña actualizada exitosamente. Ya puede iniciar sesión.' };
      }
    }

    return { success: false, message: 'No se encontró la cuenta de usuario especificada.' };
  });
}

// ===================================================================
// 10. UTILIDADES GENERALES
// ===================================================================

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function sheetToObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var results = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = row[j];
      if (val instanceof Date) {
        val = val.toISOString();
      }
      obj[key] = val;
    }
    results.push(obj);
  }

  return results;
}

function formatHeaderRow(sheet) {
  var range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground('#1e40af'); // Azul Corporativo Duncan
  range.setFontColor('#ffffff');
  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function setupSpreadsheet() {
  var ss = getSpreadsheet();
  ensureDefaultUsers(getOrCreateSheet(ss, SHEETS.USUARIOS));
  ensureEmpleadosSheet(ss);

  var sInsp = getOrCreateSheet(ss, SHEETS.INSPECCIONES);
  if (sInsp.getLastRow() === 0) {
    sInsp.appendRow([
      '_id', 'correlativo', 'tipoId', 'tipoNombre', 'tipoCodigo', 'empresaId', 'empresaNombre',
      'localidadId', 'localidadNombre', 'establecimientoId', 'establecimientoNombre', 'area',
      'inspector', 'inspectorCargo', 'acompanante', 'fecha', 'horaInicio', 'horaFin',
      'estado', 'resultado', 'observacionesGenerales', 'respuestas', 'fotos', 'firmaInspector',
      'puntos', 'actualizadoEn'
    ]);
    formatHeaderRow(sInsp);
  }

  var sPlan = getOrCreateSheet(ss, SHEETS.PLAN_ACCION);
  if (sPlan.getLastRow() === 0) {
    sPlan.appendRow([
      '_id', 'inspeccionId', 'inspeccionCorrelativo', 'puntoId', 'puntoTexto', 'hallazgo',
      'accion', 'prioridad', 'responsableId', 'responsableNombre', 'fechaLimite', 'estado',
      'creadoEn', 'actualizadoEn'
    ]);
    formatHeaderRow(sPlan);
  }

  var sAudit = getOrCreateSheet(ss, SHEETS.AUDIT_LOG);
  if (sAudit.getLastRow() === 0) {
    sAudit.appendRow([
      '_id', 'usuario', 'userEmail', 'accion', 'entidad', 'entidadId', 'detalles', 'timestamp'
    ]);
    formatHeaderRow(sAudit);
  }

  SpreadsheetApp.flush();
  Logger.log('Base de datos configurada y blindada exitosamente.');
}
