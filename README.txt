SEGUIMIENTO DE TRADUCCIONES - V2

Incluye:
- Modo oscuro por defecto.
- Navegación Pendientes / Documentos / Historial.
- Pendientes: filas con Estado vacío y Monto pendiente > 0.
- Historial: filas con Estado = ok.
- Fecha pago se trata como periodo mensual (ej. Agosto 2026).
- DocsMariella como detalle de documentos pendientes.

INSTALACIÓN:
1. En Google Apps Script reemplaza el Code.gs actual por google-apps-script/Code.gs.
2. Guarda y actualiza/republica la implementación de Aplicación web.
3. En GitHub reemplaza/sube index.html, style.css, script.js, netlify.toml y la carpeta netlify/functions/api.js.
4. Netlify desplegará automáticamente.

La API no devuelve la fila superior de Pendientes que contiene información bancaria.
