/**
 * API para Seguimiento de Traducciones.
 * Lee únicamente la información necesaria de Pendientes y DocsMariella.
 * No expone la fila superior con información bancaria de Pendientes.
 */
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const pendientesSheet = ss.getSheetByName('Pendientes');
  const docsSheet = ss.getSheetByName('DocsMariella');

  if (!pendientesSheet || !docsSheet) {
    return json({ error: 'No se encontraron las pestañas Pendientes y/o DocsMariella.' });
  }

  // Pendientes: la fila 2 contiene los encabezados.
  const pValues = pendientesSheet.getDataRange().getValues();
  const pHeaders = pValues[1].map(h => String(h ?? '').trim());
  const pRows = pValues.slice(2);

  const pIndex = {};
  pHeaders.forEach((h, i) => pIndex[h.toLowerCase()] = i);

  const pendientes = pRows
    .filter(r => String(r[pIndex['a cargo']] ?? '').trim().toLowerCase() === 'mariella')
    .filter(r => Number(r[pIndex['monto pendiente']] || 0) > 0)
    .map(r => ({
      codigo: r[pIndex['codigo']] ?? '',
      traduccion: Number(r[pIndex['traduccion']] || 0),
      igv: Number(r[pIndex['-igv']] || 0),
      montoPendiente: Number(r[pIndex['monto pendiente']] || 0),
      estado: r[pIndex['estado']] ?? '',
      adelantos: Number(r[pIndex['adelantos']] || 0),
      fechaPago: r[pIndex['fecha pago']] || '',
      mes: r[pIndex['mes']] || ''
    }));

  // DocsMariella: fila 1 contiene los encabezados.
  const dValues = docsSheet.getDataRange().getValues();
  const dHeaders = dValues[0].map(h => String(h ?? '').trim());
  const dRows = dValues.slice(1);

  const dIndex = {};
  dHeaders.forEach((h, i) => dIndex[h.toLowerCase()] = i);

  const docsMariella = dRows
    .filter(r => String(r[dIndex['proyecto']] ?? '').trim() !== '')
    .filter(r => Number(r[dIndex['monto final']] || 0) > 0)
    .map(r => ({
      proyecto: r[dIndex['proyecto']] ?? '',
      nombre: r[dIndex['nombre']] ?? '',
      paginas: Number(r[dIndex['paginas']] || 0),
      palabras: Number(r[dIndex['palabras']] || 0),
      monto: Number(r[dIndex['monto']] || 0),
      porcentaje: Number(r[dIndex['porcentaje']] || 0),
      montoTotal: Number(r[dIndex['monto total']] || 0),
      montoFinal: Number(r[dIndex['monto final']] || 0)
    }));

  return json({
    pendientes,
    docsMariella
  });
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
