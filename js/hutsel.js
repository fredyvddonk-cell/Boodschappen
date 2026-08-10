let hutselItems = JSON.parse(localStorage.getItem('household-hutsel-v1') || '[]');

function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function tomorrowKey() {
  const d = new Date(); d.setDate(d.getDate()+1); return localDateKey(d);
}
function saveHutsel() {
  localStorage.setItem('household-hutsel-v1', JSON.stringify(hutselItems));
}
function normalizeHutselDates() {
  const today = localDateKey();
  let changed = false;
  hutselItems.forEach(x => {
    // Alles waarvan de geplande dag verstreken is, hoort nu bij Vandaag.
    if (!x.useDate || x.useDate < today) { x.useDate = today; changed = true; }
  });
  if (changed) saveHutsel();
}
function openHutselModal(item=null) {
  $('#hutselEditId').value = item?.id || '';
  $('#hutselName').value = item?.name || '';
  $('#hutselNote').value = item?.note || '';
  const day = item?.useDate === tomorrowKey() ? 'tomorrow' : 'today';
  document.querySelector(`input[name="hutselDay"][value="${day}"]`).checked = true;
  $('#hutselModal').classList.add('open');
  setTimeout(()=>$('#hutselName').focus(),50);
}
function closeHutselModal(){ $('#hutselModal').classList.remove('open'); }

function renderHutsel() {
  normalizeHutselDates();
  const q = search.value.trim().toLowerCase();
  const arr = hutselItems.filter(x => x.name.toLowerCase().includes(q) || (x.note||'').toLowerCase().includes(q));
  const today=localDateKey(), tomorrow=tomorrowKey();
  const section=(title,items,cls)=>`
    <section class="hutsel-section ${cls}">
      <h2 class="section">${title} <span class="hutsel-count">${items.length}</span></h2>
      ${items.length ? items.map(x=>`
        <div class="item hutsel-item">
          <button class="hutsel-done" type="button" onclick="finishHutsel(${x.id})" aria-label="${esc(x.name)} opgebruikt">✓</button>
          <div class="main" onclick="editHutsel(${x.id})" role="button">
            <div class="name">${esc(x.name)}</div>
            ${x.note ? `<div class="meta">${esc(x.note)}</div>`:''}
          </div>
          <button class="small" type="button" onclick="editHutsel(${x.id})">Wijzig</button>
        </div>`).join('') : `<div class="hutsel-empty">Niets voor ${title.toLowerCase()}.</div>`}
    </section>`;
  const t=arr.filter(x=>x.useDate===today);
  const tm=arr.filter(x=>x.useDate===tomorrow);
  content.innerHTML=`<div class="hutsel-intro"><strong>Wat moet eerst op?</strong><span>Restjes blijven los van je boodschappenlijst.</span></div>${section('Vandaag',t,'today')}${section('Morgen',tm,'tomorrow')}`;
}
window.finishHutsel=id=>{
  hutselItems=hutselItems.filter(x=>x.id!==id);
  saveHutsel(); render();
};
window.editHutsel=id=>openHutselModal(hutselItems.find(x=>x.id===id));

function bindHutselEvents(){
  $('#hutselForm').onsubmit=e=>{
    e.preventDefault();
    const name=$('#hutselName').value.trim();
    if(!name)return;
    const id=Number($('#hutselEditId').value);
    const day=document.querySelector('input[name="hutselDay"]:checked').value;
    const data={name,note:$('#hutselNote').value.trim(),useDate:day==='tomorrow'?tomorrowKey():localDateKey()};
    if(id) Object.assign(hutselItems.find(x=>x.id===id),data);
    else hutselItems.push({id:Date.now(),...data});
    saveHutsel(); closeHutselModal(); render();
  };
  $('#hutselCancel').onclick=closeHutselModal;
  $('#hutselModal').onclick=e=>{if(e.target.id==='hutselModal')closeHutselModal();};
}
