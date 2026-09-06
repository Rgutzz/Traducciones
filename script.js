const money = n => new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN',minimumFractionDigits:2}).format(Number(n)||0);
const api = '/.netlify/functions/api';

let state = {pendientes: [], docsMariella: []};

function norm(v){return String(v ?? '').trim().toLowerCase();}
function num(v){if(typeof v==='number') return v; return Number(String(v??'').replace(/[^\d,.-]/g,'').replace(',','.'))||0;}
function formatMonth(v){
  if(!v) return '—';
  const d = new Date(v);
  if(Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('es-PE',{month:'short',year:'numeric'}).replace('.','');
}

function render(){
  const qPay = norm(document.querySelector('#searchPayments').value);
  const payments = state.pendientes.filter(r => !qPay || norm(r.codigo).includes(qPay));
  const body = document.querySelector('#paymentsBody');

  if(!payments.length){
    body.innerHTML='<tr><td colspan="6" class="empty">No hay pagos pendientes.</td></tr>';
  }else{
    body.innerHTML=payments.map(r=>`
      <tr>
        <td><strong>${escapeHtml(r.codigo)}</strong></td>
        <td class="muted">${escapeHtml(formatMonth(r.mes))}</td>
        <td>${money(r.traduccion)}</td>
        <td>${money(r.adelantos)}</td>
        <td class="money">${money(r.montoPendiente)}</td>
        <td><span class="badge">${escapeHtml(r.estado || 'Pendiente')}</span></td>
      </tr>`).join('');
  }

  const qDoc=norm(document.querySelector('#searchDocs').value);
  const docs=state.docsMariella.filter(r=>!qDoc || norm(r.proyecto).includes(qDoc)||norm(r.nombre).includes(qDoc));
  const groups={};
  docs.forEach(r=>(groups[r.proyecto||'Sin proyecto']??=[]).push(r));

  document.querySelector('#docsList').innerHTML=Object.keys(groups).length
    ? Object.entries(groups).map(([project,items])=>{
        const total=items.reduce((s,r)=>s+num(r.montoFinal),0);
        return `<div class="doc-group">
          <div class="group-head"><div class="group-title">${escapeHtml(project)}</div><div class="group-total">${money(total)}</div></div>
          ${items.map(r=>`<div class="doc-item">
            <div><div class="doc-name">${escapeHtml(r.nombre)}</div>
            <div class="doc-meta">${r.paginas || 0} págs. · ${Number(r.palabras||0).toLocaleString('es-PE')} palabras · ${Math.round(num(r.porcentaje)*100)}%</div></div>
            <div class="doc-amount">${money(r.montoFinal)}</div>
          </div>`).join('')}
        </div>`;
      }).join('')
    : '<div class="empty">No hay documentos pendientes.</div>';

  document.querySelector('#totalPendiente').textContent=money(state.pendientes.reduce((s,r)=>s+num(r.montoPendiente),0));
  document.querySelector('#totalProyectos').textContent=state.pendientes.length;
  document.querySelector('#totalDocumentos').textContent=state.docsMariella.length;
}

function escapeHtml(s){
  return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

async function load(){
  document.querySelector('#lastUpdated').textContent='Actualizando...';
  try{
    const res=await fetch(api,{cache:'no-store'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    state=await res.json();
    render();
    document.querySelector('#lastUpdated').textContent='Actualizado '+new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'});
  }catch(e){
    document.querySelector('#paymentsBody').innerHTML='<tr><td colspan="6" class="empty">No se pudo cargar la información. Revisa la configuración de Apps Script/Netlify.</td></tr>';
    document.querySelector('#docsList').innerHTML='<div class="empty">No se pudo cargar la información.</div>';
    document.querySelector('#lastUpdated').textContent='Error de conexión';
    console.error(e);
  }
}
document.querySelector('#searchPayments').addEventListener('input',render);
document.querySelector('#searchDocs').addEventListener('input',render);
document.querySelector('#refreshBtn').addEventListener('click',load);
load();
