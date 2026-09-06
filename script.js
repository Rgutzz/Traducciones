const api = '/.netlify/functions/api';

const money = n =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(Number(n) || 0);

const norm = v =>
  String(v ?? '').trim().toLowerCase();

const num = v =>
  typeof v === 'number'
    ? v
    : Number(
        String(v ?? '')
          .replace(/[^\d,.-]/g, '')
          .replace(',', '.')
      ) || 0;

const esc = s =>
  String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[c]));

let state = {
  pendientes: [],
  docsMariella: [],
  historial: []
};


// ============================================================
// PERIODO
// ============================================================

function period(v) {
  return String(v ?? '').trim() || 'Sin periodo';
}


// ============================================================
// PORCENTAJE
// ============================================================

function pct(v) {
  let n = num(v);
  return n <= 1 ? Math.round(n * 100) : Math.round(n);
}


// ============================================================
// CONVERTIR "Agosto 2026" A FECHA PARA ORDENAR
// ============================================================

function periodToDate(value) {

  const months = {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11
  };

  const text = period(value).toLowerCase();

  const match = text.match(
    /([a-záéíóúñ]+)\s+(\d{4})/
  );

  if (match) {

    const monthName = match[1]
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const year = Number(match[2]);

    if (months[monthName] !== undefined) {
      return new Date(
        year,
        months[monthName],
        1
      );
    }
  }

  return new Date(0);
}


// ============================================================
// PENDIENTES
// ============================================================

function renderPending() {

  const q = norm(
    document.querySelector('#searchPayments').value
  );

  const rows = state.pendientes.filter(r =>
    !q ||
    norm(r.codigo).includes(q) ||
    norm(r.proyecto).includes(q)
  );

  document.querySelector('#paymentsBody').innerHTML =
    rows.length
      ? rows.map(r => `
        <tr>
          <td>
            <strong>${esc(r.codigo)}</strong>
          </td>

          <td class="muted">
            ${esc(period(r.mes))}
          </td>

          <td>
            ${money(r.traduccion)}
          </td>

          <td>
            ${money(r.adelantos)}
          </td>

          <td class="money">
            ${money(r.montoPendiente)}
          </td>

          <td>
            <span class="badge">
              Pendiente
            </span>
          </td>
        </tr>
      `).join('')
      : `
        <tr>
          <td colspan="6" class="empty">
            No hay pagos pendientes.
          </td>
        </tr>
      `;

  document.querySelector('#totalPendiente').textContent =
    money(
      state.pendientes.reduce(
        (s, r) => s + num(r.montoPendiente),
        0
      )
    );

  document.querySelector('#totalProyectos').textContent =
    state.pendientes.length;

  document.querySelector('#totalDocumentos').textContent =
    state.docsMariella.length;
}


// ============================================================
// DOCUMENTOS
// ============================================================

function renderDocs() {

  const q = norm(
    document.querySelector('#searchDocs').value
  );

  const docs = state.docsMariella.filter(r =>
    !q ||
    norm(r.proyecto).includes(q) ||
    norm(r.nombre).includes(q)
  );

  const groups = {};

  docs.forEach(r => {

    const project =
      r.proyecto || 'Sin proyecto';

    if (!groups[project]) {
      groups[project] = [];
    }

    groups[project].push(r);
  });

  document.querySelector('#docsList').innerHTML =
    Object.entries(groups)
      .map(([project, items]) => {

        const total = items.reduce(
          (s, r) => s + num(r.montoFinal),
          0
        );

        return `
          <div class="doc-group">

            <div class="group-head">

              <div class="group-title">
                ${esc(project)}
              </div>

              <div class="group-total">
                ${money(total)}
              </div>

            </div>

            ${items.map(r => `

              <div class="doc-item">

                <div>

                  <div class="doc-name">
                    ${esc(r.nombre)}
                  </div>

                  <div class="doc-meta">
                    ${r.paginas || 0} págs.
                    ·
                    ${Number(r.palabras || 0).toLocaleString('es-PE')}
                    palabras
                    ·
                    ${pct(r.porcentaje)}%
                  </div>

                </div>

                <div class="doc-amount">
                  ${money(r.montoFinal)}
                </div>

              </div>

            `).join('')}

          </div>
        `;
      })
      .join('') ||
    `
      <div class="empty">
        No hay documentos pendientes.
      </div>
    `;

  document.querySelector('#docsCount').textContent =
    docs.length;
}


// ============================================================
// HISTORIAL
// ============================================================

function renderHistory() {

  const q = norm(
    document.querySelector('#searchHistory').value
  );

  const rows = state.historial.filter(r =>
    !q ||
    norm(r.codigo).includes(q) ||
    norm(r.mes).includes(q)
  );

  const groups = {};

  rows.forEach(r => {

    const mes = period(r.mes);

    if (!groups[mes]) {
      groups[mes] = [];
    }

    groups[mes].push(r);
  });


  // ==========================================================
  // ORDENAR LOS PERIODOS DEL MÁS NUEVO AL MÁS ANTIGUO
  // ==========================================================

  const order = Object.entries(groups)
    .sort((a, b) => {

      const dateA = periodToDate(a[0]);
      const dateB = periodToDate(b[0]);

      return dateB - dateA;

    });


  document.querySelector('#historyList').innerHTML =
    order.length
      ? order.map(([mes, items]) => {

          const total = items.reduce(
            (s, r) => s + num(r.montoCobrado),
            0
          );

          return `
            <div class="history-group">

              <div class="group-head">

                <div class="group-title">

                  📅 ${esc(mes)}

                  <span class="month-total">
                    ${items.length}
                    ${items.length === 1 ? 'pago' : 'pagos'}
                  </span>

                </div>

                <div class="group-total">
                  ${money(total)}
                </div>

              </div>


              ${items.map(r => `

                <div class="history-row">

                  <div class="history-code">
                    ${esc(r.codigo)}
                  </div>

                  <div class="history-period">
                    ${esc(period(r.mes))}
                  </div>

                  <div class="history-amount">
                    ${money(r.montoCobrado)}
                  </div>

                </div>

              `).join('')}

            </div>
          `;

        }).join('')

      : `
        <div class="empty">
          No hay pagos registrados.
        </div>
      `;


  document.querySelector('#totalCobrado').textContent =
    money(
      state.historial.reduce(
        (s, r) => s + num(r.montoCobrado),
        0
      )
    );

  document.querySelector('#totalPagos').textContent =
    state.historial.length;

  document.querySelector('#totalPeriodos').textContent =
    order.length;
}


// ============================================================
// RENDER GENERAL
// ============================================================

function render() {

  renderPending();
  renderDocs();
  renderHistory();

}


// ============================================================
// CARGAR DATOS
// ============================================================

async function load() {

  document.querySelector('#lastUpdated').textContent =
    'Actualizando...';

  try {

    const res = await fetch(
      api,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      throw Error('HTTP ' + res.status);
    }

    state = await res.json();

    render();

    document.querySelector('#lastUpdated').textContent =
      'Actualizado ' +
      new Date().toLocaleTimeString(
        'es-PE',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );

  } catch (e) {

    document.querySelector('#paymentsBody').innerHTML =
      `
        <tr>
          <td colspan="6" class="empty">
            No se pudo cargar la información.
          </td>
        </tr>
      `;

    document.querySelector('#docsList').innerHTML =
      `
        <div class="empty">
          No se pudo cargar la información.
        </div>
      `;

    document.querySelector('#historyList').innerHTML =
      `
        <div class="empty">
          No se pudo cargar la información.
        </div>
      `;

    document.querySelector('#lastUpdated').textContent =
      'Error de conexión';

    console.error(e);
  }
}


// ============================================================
// NAVEGACIÓN
// ============================================================

document
  .querySelectorAll('.nav-btn')
  .forEach(btn => {

    btn.addEventListener('click', () => {

      document
        .querySelectorAll('.nav-btn')
        .forEach(b =>
          b.classList.remove('active')
        );

      btn.classList.add('active');

      document
        .querySelectorAll('.page')
        .forEach(p =>
          p.classList.remove('active')
        );

      document
        .querySelector(
          '#page-' + btn.dataset.page
        )
        .classList.add('active');

    });

  });


// ============================================================
// MODO OSCURO / CLARO
// ============================================================

document
  .querySelector('#themeBtn')
  .addEventListener('click', () => {

    document.body.classList.toggle('light');

  });


// ============================================================
// ACTUALIZAR
// ============================================================

document
  .querySelector('#refreshBtn')
  .addEventListener('click', load);


// ============================================================
// BUSCADORES
// ============================================================

document
  .querySelector('#searchPayments')
  .addEventListener('input', renderPending);

document
  .querySelector('#searchDocs')
  .addEventListener('input', renderDocs);

document
  .querySelector('#searchHistory')
  .addEventListener('input', renderHistory);


// ============================================================
// INICIAR
// ============================================================

load();