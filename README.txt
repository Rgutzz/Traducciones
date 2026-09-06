SEGUIMIENTO DE TRADUCCIONES
=============================

Esta primera versión muestra únicamente:
1. Pendientes de pago de Mariella, tomados de la pestaña "Pendientes".
2. Documentos pendientes de "DocsMariella".

ESTRUCTURA
----------
index.html
style.css
script.js
netlify.toml
netlify/functions/api.js
google-apps-script/Code.gs

PASOS
-----
1. En Google Apps Script, reemplaza el código actual por:
   google-apps-script/Code.gs

2. Guarda y crea una NUEVA implementación de tipo "Aplicación web".
   Ejecutar como: tú.
   Acceso: cualquier usuario que deba acceder a la web (para la prueba, "Cualquier usuario").

3. En Netlify/GitHub, sube:
   index.html
   style.css
   script.js
   netlify.toml
   netlify/functions/api.js

4. Netlify debe detectar automáticamente la función.

NOTA
----
La función de Netlify usa la URL de Apps Script incluida en api.js.
Si posteriormente cambia la URL de Apps Script, actualízala allí o configura
la variable de entorno GOOGLE_SHEETS_API_URL en Netlify.

SEGURIDAD
---------
La versión de Apps Script incluida aquí NO devuelve la fila superior de
"Pendientes", donde aparece información bancaria. Solo devuelve los campos
necesarios para la pantalla.
