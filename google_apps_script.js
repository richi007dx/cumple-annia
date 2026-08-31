/* ============================================================
   Cumple de Annia Gissel — receptor de confirmaciones
   ------------------------------------------------------------
   Cómo instalarlo:
     1. Crea una hoja de cálculo nueva en Google Sheets.
     2. Extensiones → Apps Script. Borra lo que haya y pega esto.
     3. Implementar → Nueva implementación → tipo "Aplicación web".
          · Ejecutar como: Yo
          · Quién tiene acceso: Cualquier persona
     4. Copia la URL que termina en /exec y pégala en app.js,
        en la constante GOOGLE_SHEET_WEBHOOK_URL.

   Nota: la página envía con mode:'no-cors', así que nunca lee la
   respuesta. Por eso acá no hace falta manipular cabeceras CORS
   (y de hecho ContentService no lo permite: TextOutput no tiene
   setHeaders, llamarlo revienta la ejecución).
   ============================================================ */

var ENCABEZADOS = [
  'Fecha',
  'Confirma',
  'Teléfono',
  'Asiste',
  'Confirmado con',
  'Cantidad de niños',
  'Nombres de los niños',
  'Link usado'
];

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  // Útil para probar desde el navegador con parámetros en la URL.
  return handleRequest(e);
}

function handleRequest(e) {
  // Un candado evita que dos confirmaciones simultáneas se pisen la fila.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json({ result: 'error', error: 'La hoja está ocupada, intenta de nuevo.' });
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(ENCABEZADOS);
      sheet.getRange(1, 1, 1, ENCABEZADOS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var fecha = Utilities.formatDate(new Date(), 'America/La_Paz', 'dd/MM/yyyy HH:mm:ss');

    sheet.appendRow([
      fecha,
      data.confirma || 'Sin nombre',
      // El apóstrofo fuerza a Sheets a tratarlo como texto y no comerse el cero inicial.
      data.telefono ? "'" + data.telefono : '',
      data.asiste || '',
      data.confirmadoCon || '',
      data.cantidadNinos || 0,
      data.nombresNinos || '',
      data.linkUsado || ''
    ]);

    return json({ result: 'success' });

  } catch (error) {
    return json({ result: 'error', error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
