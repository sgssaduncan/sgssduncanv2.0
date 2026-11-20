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

// Nombres de las hojas (tablas)
var SHEETS = {
  INSPECCIONES: 'Inspecciones',
  PLAN_ACCION: 'PlanAccion',
  ESTABLECIMIENTOS: 'Establecimientos',
  EMPLEADOS: 'Empleados',
  AUDIT_LOG: 'Audit_Log',
  USUARIOS: 'Usuarios',
  CONFIGURACION: 'Configuracion'
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

// ===================================================================
// MANEJADORES DE LECTURA (GET)
// ===================================================================

function handleGetInitData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, SHEETS.PLAN_ACCION);
  return sheetToObjects(sheet);
}

function handleGetEmpleados(q) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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

// ===================================================================
// MANEJADORES DE ESCRITURA (POST)
// ===================================================================

function handleCreateInspeccion(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
      sheet.appendRow(['_id', 'email', 'nombre', 'rol', 'activo']);
      sheet.appendRow(['usr_admin', 'admin@duncan.com.ve', 'Administrador General', 'Super Admin', true]);
      formatHeaderRow(sheet);
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();

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
  if (sheetUsr.getLastRow() === 0) {
    sheetUsr.appendRow(['_id', 'email', 'nombre', 'rol', 'activo']);
    sheetUsr.appendRow(['usr_admin', 'admin@duncan.com.ve', 'Administrador General', 'Super Admin', true]);
    formatHeaderRow(sheetUsr);
  }

  SpreadsheetApp.flush();
  Logger.log('¡Base de datos SGD Duncan 2.0 configurada con éxito!');
}

function formatHeaderRow(sheet) {
  var range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground('#1e40af'); // Azul Duncan
  range.setFontColor('#ffffff');
  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
}
