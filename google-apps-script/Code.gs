/**
 * ===================================================================
 * SGD DUNCAN 2.0 — BACKEND GOOGLE APPS SCRIPT (COSTO CERO)
 * ===================================================================
 * Este script actúa como API REST para la aplicación PWA SGD Duncan.
 * Se conecta a Google Sheets como base de datos en la nube.
 *
 * ID de Hoja Backend: 1dH0vgYL80DDpwPcdwwaxsg9qCNvNahCbCUxlzDejcFU
 * ===================================================================
 */

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
          ensureEmpleadosSheet(ssPing);
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

      case 'login':
        responseData = handleLogin(params);
        break;

      case 'getTableData':
        responseData = handleGetTableData(params.table);
        break;

      default:
        responseData = { status: 'error', message: 'Accion desconocida: ' + action };
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

      case 'importEmpleados':
        result = handleImportEmpleados(payload);
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
        result = { status: 'error', message: 'Accion POST desconocida: ' + action };
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
    ensureEmpleadosSheet(ss);
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

// -------------------------------------------------------------
// MANEJO DE NÓMINA Y TRABAJADORES (22 COLUMNAS ERP COMPLETO)
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
  } else {
    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    if (headers.indexOf('codigo_empleado') === -1 || headers.indexOf('sucursal') === -1 || headers.indexOf('nombre_nomina') === -1) {
      // Auto-migración a la estructura completa de 25 columnas
      var oldRows = sheetToObjects(sheet);
      sheet.clear();
      sheet.appendRow(EMPLEADOS_HEADERS);
      formatHeaderRow(sheet);

      if (oldRows.length > 0) {
        var rowsToAdd = [];
        for (var i = 0; i < oldRows.length; i++) {
          var o = oldRows[i];
          rowsToAdd.push([
            o._id || ('emp_' + (i + 1)),
            o.codigo_empleado || o.codigo || '',
            o.cedula || '',
            o.apellidos_y_nombres || o.nombre || '',
            o.cargo || '',
            o.departamento || '',
            o.nombre_empresa || o.empresaNombre || '',
            o.sucursal || o.sedeNombre || '',
            o.nombre_nomina || '',
            o.sexo || o.genero || '',
            o.fecha_de_nacimiento || o.fechaNacimiento || '',
            o.fecha_de_ingreso || o.fechaIngreso || '',
            o.antiguedad_anos || '',
            o.antiguedad_meses || '',
            o.antiguedad_dias || '',
            o.numero_centro_de_costos || '',
            o.centro_costos_descripcion || '',
            o.tipo_centro_de_costo || '',
            o.codigo_situacion || '',
            o.fecha_vencimiento_contrato || '',
            o.direccion_residencia || o.direccion || '',
            o.ciudad_residencia || '',
            o.estado_residencia || '',
            o.activo !== false && o.activo !== 'false',
            o.actualizadoEn || new Date().toISOString()
          ]);
        }
        sheet.getRange(2, 1, rowsToAdd.length, EMPLEADOS_HEADERS.length).setValues(rowsToAdd);
      }
    }
  }
  return sheet;
}

function handleGetEmpleados(q) {
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

function handleImportEmpleados(payload) {
  var ss = getSpreadsheet();
  var sheet = ensureEmpleadosSheet(ss);
  var items = payload.items || [];
  if (!items || items.length === 0) {
    return { success: false, message: 'No se recibieron trabajadores para importar' };
  }

  var existingData = sheet.getDataRange().getValues();
  var header = existingData[0];
  var existingMap = {};

  for (var r = 1; r < existingData.length; r++) {
    var rawCed = String(existingData[r][2] || '').trim().toUpperCase();
    if (rawCed) existingMap[rawCed] = r + 1; // 1-based index
  }

  var rowsToInsert = [];
  var updatedCount = 0;
  var nowStr = new Date().toISOString();

  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var ced = String(it.cedula || '').trim().toUpperCase();
    if (!ced) continue;

    var rowArray = [
      it._id || it.id || ('emp_' + Date.now() + '_' + i),
      it.codigoEmpleado || it.codigo_empleado || it.codigo || '',
      ced,
      it.nombre || it.apellidos_y_nombres || '',
      it.cargo || '',
      it.departamento || '',
      it.empresaNombre || it.nombre_empresa || '',
      it.sucursal || it.sedeNombre || '',
      it.nombreNomina || it.nombre_nomina || '',
      it.genero || it.sexo || '',
      it.fechaNacimiento || it.fecha_de_nacimiento || '',
      it.fechaIngreso || it.fecha_de_ingreso || '',
      it.antiguedadAnos !== undefined ? it.antiguedadAnos : '',
      it.antiguedadMeses !== undefined ? it.antiguedadMeses : '',
      it.antiguedadDias !== undefined ? it.antiguedadDias : '',
      it.numeroCentroCostos || it.numero_centro_de_costos || '',
      it.centroCostosDescripcion || it.centro_costos_descripcion || '',
      it.tipoCentroCosto || it.tipo_centro_de_costo || '',
      it.codigoSituacion || it.codigo_situacion || '',
      it.fechaVencimientoContrato || it.fecha_vencimiento_contrato || '',
      it.direccionResidencia || it.direccion_residencia || it.direccion || '',
      it.ciudadResidencia || it.ciudad_residencia || '',
      it.estadoResidencia || it.estado_residencia || '',
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
}

// -------------------------------------------------------------
// MANEJO DE USUARIOS Y AUTENTICACIÓN
// -------------------------------------------------------------
function ensureDefaultUsers(sheet) {
  var targetHeaders = ['_id', 'email', 'cedula', 'nombre', 'cargo', 'localidad', 'rol', 'password', 'activo', 'actualizadoEn'];
  var data = sheet.getDataRange().getValues();

  if (data.length === 0 || !data[0][0]) {
    sheet.clear();
    sheet.appendRow(targetHeaders);
    formatHeaderRow(sheet);
    data = sheet.getDataRange().getValues();
  } else {
    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    if (headers.indexOf('cedula') === -1) {
      var oldUsers = sheetToObjects(sheet);
      sheet.clear();
      sheet.appendRow(targetHeaders);
      formatHeaderRow(sheet);

      for (var k = 0; k < oldUsers.length; k++) {
        var uOld = oldUsers[k];
        var uEmail = (uOld.email || '').trim().toLowerCase();
        var defaultCed = '';
        var defaultCargo = uOld.cargo || '';
        var defaultLoc = uOld.localidad || 'Planta Principal Los Ruices';

        if (uEmail === 'aabecerra852@gmail.com') {
          defaultCed = 'V-14567890';
          defaultCargo = 'Administrador del Sistema';
        } else if (uEmail === 'francisco.rojasp@gmail.com' || uEmail === 'francisco.rojasp@gmail') {
          defaultCed = 'V-12033632';
          defaultCargo = 'Propietario / Desarrollador Líder';
          defaultLoc = 'Sede Principal Los Ruices';
        } else if (uEmail === 'sgssaduncan@gmail.com') {
          defaultCed = 'V-18765432';
          defaultCargo = 'Propietario SST / Coordinador SSA';
        } else if (uEmail === 'admin@duncan.com.ve') {
          defaultCed = 'V-10000001';
          defaultCargo = 'Gerente General SST Duncan';
          defaultLoc = 'Oficinas Centrales Los Ruices';
        }

        var newRow = [
          uOld._id || ('usr_' + (k + 1)),
          uOld.email,
          uOld.cedula || defaultCed,
          uOld.nombre,
          defaultCargo,
          defaultLoc,
          uOld.rol || 'Inspector',
          uOld.password || 'Duncan2026*',
          uOld.activo !== false && uOld.activo !== 'false',
          uOld.actualizadoEn || new Date().toISOString()
        ];
        sheet.appendRow(newRow);
      }
      SpreadsheetApp.flush();
      data = sheet.getDataRange().getValues();
    }
  }

  // Verificar cuentas maestras obligatorias
  data = sheet.getDataRange().getValues();
  var existingEmails = {};
  for (var i = 1; i < data.length; i++) {
    var em = String(data[i][1] || '').trim().toLowerCase();
    if (em) existingEmails[em] = i + 1;
  }

  var masterAccounts = [
    {
      id: 'usr_admin_becerra',
      email: 'aabecerra852@gmail.com',
      cedula: 'V-14567890',
      nombre: 'A. Becerra (Administrador del Sistema)',
      cargo: 'Administrador del Sistema',
      localidad: 'Planta Principal Los Ruices',
      rol: 'Propietario / Super Admin',
      password: 'Panelas369*',
      activo: true
    },
    {
      id: 'usr_francisco',
      email: 'francisco.rojasp@gmail.com',
      cedula: 'V-12033632',
      nombre: 'Francisco Rojas',
      cargo: 'Propietario / Desarrollador Líder',
      localidad: 'Sede Principal Los Ruices',
      rol: 'Propietario / Super Admin',
      password: 'Leo150873#*$',
      activo: true
    },
    {
      id: 'usr_sgssa',
      email: 'sgssaduncan@gmail.com',
      cedula: 'V-18765432',
      nombre: 'SST / SSA Duncan',
      cargo: 'Propietario SST / Coordinador SSA',
      localidad: 'Planta Principal Los Ruices',
      rol: 'Propietario / Super Admin',
      password: 'Leo150873#*$',
      activo: true
    },
    {
      id: 'usr_admin',
      email: 'admin@duncan.com.ve',
      cedula: 'V-10000001',
      nombre: 'Administrador General Duncan',
      cargo: 'Gerente General SST',
      localidad: 'Oficinas Centrales Los Ruices',
      rol: 'Propietario / Super Admin',
      password: 'Duncan2026*',
      activo: true
    }
  ];

  var curHeaders = data[0];
  for (var m = 0; m < masterAccounts.length; m++) {
    var master = masterAccounts[m];
    var rowValues = [];
    for (var c = 0; c < curHeaders.length; c++) {
      var hKey = curHeaders[c];
      var mVal = master[hKey];
      if (hKey === '_id') mVal = master.id;
      if (mVal === undefined) mVal = '';
      rowValues.push(mVal);
    }

    if (!existingEmails[master.email]) {
      sheet.appendRow(rowValues);
    } else {
      var rIdx = existingEmails[master.email];
      sheet.getRange(rIdx, 1, 1, rowValues.length).setValues([rowValues]);
    }
  }

  SpreadsheetApp.flush();
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
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
  ensureDefaultUsers(sheet);
  var users = sheetToObjects(sheet);
  var email = (payload.email || '').trim().toLowerCase();
  var password = String(payload.password || '').trim();

  // 1. Verificación directa contra la tabla de Usuarios
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
          cedula: u.cedula || '',
          nombre: u.nombre,
          cargo: u.cargo || '',
          localidad: u.localidad || '',
          rol: u.rol,
          activo: true
        }
      };
    }
  }

  // 2. Fallbacks de Cuentas Maestras (Propietarios y Administradores - Acceso Total)
  if (email === 'aabecerra852@gmail.com' && (password === 'Panelas369*' || password === 'Duncan2026*')) {
    return {
      success: true,
      user: {
        _id: 'usr_admin_becerra',
        email: 'aabecerra852@gmail.com',
        cedula: 'V-14567890',
        nombre: 'A. Becerra (Administrador del Sistema)',
        cargo: 'Administrador del Sistema',
        localidad: 'Planta Principal Los Ruices',
        rol: 'Propietario / Super Admin',
        activo: true
      }
    };
  }
  if ((email === 'francisco.rojasp@gmail.com' || email === 'francisco.rojasp@gmail') && (password === 'Leo150873#*$' || password === 'Leo150873#*' || password === 'Leo150873' || password.indexOf('Leo150873') === 0 || password === 'Duncan2026*' || password === 'Panelas369*')) {
    return {
      success: true,
      user: {
        _id: 'usr_francisco',
        email: 'francisco.rojasp@gmail.com',
        cedula: 'V-12033632',
        nombre: 'Francisco Rojas',
        cargo: 'Propietario / Desarrollador Líder',
        localidad: 'Sede Principal Los Ruices',
        rol: 'Propietario / Super Admin',
        activo: true
      }
    };
  }
  if (email === 'sgssaduncan@gmail.com' && (password === 'Leo150873#*$' || password === 'Leo150873#*' || password === 'Leo150873' || password.indexOf('Leo150873') === 0 || password === 'Duncan2026*' || password === 'Panelas369*')) {
    return {
      success: true,
      user: {
        _id: 'usr_sgssa',
        email: 'sgssaduncan@gmail.com',
        cedula: 'V-18765432',
        nombre: 'SST / SSA Duncan',
        cargo: 'Propietario SST / Coordinador SSA',
        localidad: 'Planta Principal Los Ruices',
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
        cedula: 'V-10000001',
        nombre: 'Administrador General Duncan',
        cargo: 'Gerente General SST',
        localidad: 'Oficinas Centrales Los Ruices',
        rol: 'Propietario / Super Admin',
        activo: true
      }
    };
  }

  return { success: false, message: 'Correo electrónico o contraseña incorrectos' };
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

  var row = [];
  for (var c = 0; c < headers.length; c++) {
    var val = item[headers[c]];
    if (val === undefined) val = '';
    if (typeof val === 'object' && val !== null) {
      val = JSON.stringify(val);
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
}

function handleSaveTableBatch(payload) {
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
      if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
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
}

function handleCreateInspeccion(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.INSPECCIONES);

  var newId = payload._id || ('insp_' + Date.now());
  var correlativo = payload.correlativo || ('INS-' + Utilities.formatDate(new Date(), 'America/Caracas', 'yyyyMMdd-HHmmss'));

  var row = [
    newId,
    correlativo,
    payload.tipoId || '',
    payload.tipoNombre || '',
    payload.tipoCodigo || '',
    payload.empresaId || '',
    payload.empresaNombre || '',
    payload.localidadId || '',
    payload.localidadNombre || '',
    payload.establecimientoId || '',
    payload.establecimientoNombre || '',
    payload.area || '',
    payload.inspector || '',
    payload.inspectorCargo || '',
    payload.acompanante || '',
    payload.fecha || Utilities.formatDate(new Date(), 'America/Caracas', "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    payload.horaInicio || '',
    payload.horaFin || '',
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
}

function handleSaveFormData(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.INSPECCIONES);

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

  if (rowIndex === -1) {
    return handleCreateInspeccion(payload);
  }

  var colRespuestas = headers.indexOf('respuestas') + 1;
  var colFotos = headers.indexOf('fotos') + 1;
  var colPuntos = headers.indexOf('puntos') + 1;
  var colActualizado = headers.indexOf('actualizadoEn') + 1;

  if (colRespuestas > 0 && payload.respuestas) {
    sheet.getRange(rowIndex, colRespuestas).setValue(JSON.stringify(payload.respuestas));
  }
  if (colFotos > 0 && payload.fotos) {
    sheet.getRange(rowIndex, colFotos).setValue(JSON.stringify(payload.fotos));
  }
  if (colPuntos > 0 && payload.puntos) {
    sheet.getRange(rowIndex, colPuntos).setValue(JSON.stringify(payload.puntos));
  }
  if (colActualizado > 0) {
    sheet.getRange(rowIndex, colActualizado).setValue(Utilities.formatDate(new Date(), 'America/Caracas', "yyyy-MM-dd'T'HH:mm:ss'Z'"));
  }

  SpreadsheetApp.flush();
  return { success: true, _id: id };
}

function handleCompleteInspeccion(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.INSPECCIONES);

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

  if (rowIndex === -1) {
    return { success: false, message: 'Inspeccion no encontrada: ' + id };
  }

  var updates = {
    estado: 'completada',
    resultado: payload.resultado || '',
    observacionesGenerales: payload.observacionesGenerales || '',
    horaFin: payload.horaFin || Utilities.formatDate(new Date(), 'America/Caracas', 'HH:mm'),
    firmaInspector: payload.firmaInspector ? JSON.stringify(payload.firmaInspector) : '',
    firmaResponsable: payload.firmaResponsable ? JSON.stringify(payload.firmaResponsable) : '',
    actualizadoEn: Utilities.formatDate(new Date(), 'America/Caracas', "yyyy-MM-dd'T'HH:mm:ss'Z'")
  };

  if (payload.respuestas) updates.respuestas = JSON.stringify(payload.respuestas);
  if (payload.fotos) updates.fotos = JSON.stringify(payload.fotos);
  if (payload.puntos) updates.puntos = JSON.stringify(payload.puntos);

  for (var key in updates) {
    var col = headers.indexOf(key) + 1;
    if (col > 0) {
      sheet.getRange(rowIndex, col).setValue(updates[key]);
    }
  }

  SpreadsheetApp.flush();
  return { success: true, _id: id, estado: 'completada' };
}

function handleDeleteInspeccion(payload) {
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

  return { success: false, message: 'Inspeccion no encontrada' };
}

function handleUpdatePlanAccion(payload) {
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
    var newId = id || ('plan_' + Date.now());
    var newRow = [
      newId,
      payload.inspeccionId || '',
      payload.inspeccionCorrelativo || '',
      payload.puntoId || '',
      payload.puntoTexto || '',
      payload.hallazgo || '',
      payload.accion || '',
      payload.prioridad || 'media',
      payload.responsableId || '',
      payload.responsableNombre || '',
      payload.fechaLimite || '',
      payload.estado || 'pendiente',
      nowStr,
      nowStr
    ];
    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    return { success: true, _id: newId, created: true };
  } else {
    for (var key in payload) {
      if (key === 'action' || key === '_id' || key === 'id') continue;
      var col = headers.indexOf(key) + 1;
      if (col > 0) {
        sheet.getRange(rowIndex, col).setValue(payload[key]);
      }
    }
    var colActualizado = headers.indexOf('actualizadoEn') + 1;
    if (colActualizado > 0) {
      sheet.getRange(rowIndex, colActualizado).setValue(nowStr);
    }
    SpreadsheetApp.flush();
    return { success: true, _id: id, updated: true };
  }
}

function handleLogAudit(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.AUDIT_LOG);

  var row = [
    'audit_' + Date.now(),
    payload.usuario || 'Sistema',
    payload.userEmail || '',
    payload.accion || '',
    payload.entidad || '',
    payload.entidadId || '',
    typeof payload.detalles === 'object' ? JSON.stringify(payload.detalles) : (payload.detalles || ''),
    payload.timestamp || Utilities.formatDate(new Date(), 'America/Caracas', "yyyy-MM-dd'T'HH:mm:ss'Z'")
  ];

  sheet.appendRow(row);
  SpreadsheetApp.flush();
  return { success: true };
}

function handleSaveUsuario(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
  ensureDefaultUsers(sheet);

  var u = payload.usuario || payload;
  var email = (u.email || '').trim().toLowerCase();
  if (!email) return { success: false, message: 'Email requerido' };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).toLowerCase() === email) {
      rowIndex = i + 1;
      break;
    }
  }

  var nowStr = Utilities.formatDate(new Date(), 'America/Caracas', "yyyy-MM-dd'T'HH:mm:ss'Z'");
  var row = [
    u._id || u.id || ('usr_' + Date.now()),
    email,
    u.cedula || '',
    u.nombre || '',
    u.cargo || '',
    u.localidad || 'Planta Principal Los Ruices',
    u.rol || 'Inspector',
    u.password || 'Duncan2026*',
    u.activo !== false && u.activo !== 'false',
    nowStr
  ];

  if (rowIndex === -1) {
    sheet.appendRow(row);
  } else {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  }

  SpreadsheetApp.flush();
  return { success: true, email: email };
}

function handleDeleteUsuario(payload) {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
  var id = payload._id || payload.id;
  var email = (payload.email || '').toLowerCase();

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id) || String(data[i][1]).toLowerCase() === email) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true, deleted: id || email };
    }
  }

  return { success: false, message: 'Usuario no encontrado' };
}

// -------------------------------------------------------------
// RECUPERACIÓN DE CONTRASEÑA A COSTO CERO (OTP / CÉDULA)
// -------------------------------------------------------------
function handleSolicitarCodigoRecuperacion(payload) {
  var email = (payload.email || '').trim().toLowerCase();
  if (!email) return { success: false, message: 'Indique su correo electronico.' };

  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
  ensureDefaultUsers(sheet);
  var users = sheetToObjects(sheet);

  var found = false;
  for (var i = 0; i < users.length; i++) {
    if ((users[i].email || '').trim().toLowerCase() === email) {
      found = true;
      break;
    }
  }

  if (!found) {
    return { success: false, message: 'No existe usuario registrado con el correo: ' + email };
  }

  var code = Math.floor(100000 + Math.random() * 900000).toString();
  var expira = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  var sheetConf = getOrCreateSheet(ss, SHEETS.CONFIGURACION);
  sheetConf.appendRow(['RECOVERY_OTP_' + email, code, expira, new Date().toISOString()]);

  try {
    MailApp.sendEmail({
      to: email,
      subject: 'Codigo de Recuperacion de Acceso - SGD Duncan 2.0',
      body: 'Estimado colaborador,\n\nHa solicitado restablecer su acceso al Sistema de Gestion Duncan 2.0.\n\n' +
            'Su codigo de verificacion es: ' + code + '\n\n' +
            'Este codigo tiene una validez de 15 minutos.\n\n' +
            'Si usted no solicito este cambio, comuniquese de inmediato con SST / Seguridad y Salud en el Trabajo Duncan.\n\n' +
            'Atentamente,\nSST Duncan'
    });
    return { success: true, message: 'Codigo de 6 digitos enviado a su correo Gmail.', sentViaEmail: true };
  } catch (eMail) {
    return {
      success: true,
      message: 'Codigo generado exitosamente. Ingrese el codigo generado para continuar.',
      sentViaEmail: false,
      debugCode: code
    };
  }
}

function handleRecuperarPassword(payload) {
  var email = (payload.email || '').trim().toLowerCase();
  var newPassword = String(payload.newPassword || '').trim();
  var cedula = String(payload.cedula || '').trim();

  if (!email || !newPassword) {
    return { success: false, message: 'Parametros incompletos.' };
  }

  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.USUARIOS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var colEmail = headers.indexOf('email') + 1;
  var colCedula = headers.indexOf('cedula') + 1;
  var colPassword = headers.indexOf('password') + 1;

  for (var i = 1; i < data.length; i++) {
    var rowEmail = String(data[i][colEmail - 1]).toLowerCase().trim();
    if (rowEmail === email) {
      if (cedula && colCedula > 0) {
        var rowCed = String(data[i][colCedula - 1]).replace(/[^0-9]/g, '');
        var inCed = cedula.replace(/[^0-9]/g, '');
        if (rowCed && rowCed !== inCed) {
          return { success: false, message: 'La cedula no coincide con el titular de la cuenta.' };
        }
      }

      sheet.getRange(i + 1, colPassword).setValue(newPassword);
      SpreadsheetApp.flush();
      return { success: true, message: 'Contrasena restablecida con exito. Ya puede iniciar sesion.' };
    }
  }

  return { success: false, message: 'Usuario no encontrado en la base de datos.' };
}

// ===================================================================
// UTILIDADES GENERALES
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
  range.setBackground('#1e40af'); // Azul Duncan
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

  SpreadsheetApp.flush();
  Logger.log('Base de datos configurada exitosamente.');
}
