function renderStock(arr) {
  drawGrouped(arr, 'category', x => `
    <div class="item">
      <div class="main">
        <div class="name">${esc(x.name)}</div>
        ${meta(x) ? `<div class="meta">${meta(x)}</div>` : ''}
        ${memoHtml(x)}
      </div>
      <button
        class="status ${x.status === 'Voldoende' ? 'good' : x.status === 'Aanvullen' ? 'low' : 'out'}"
        onclick="cycleStatus(${x.id})"
      >${x.status}</button>
    </div>
  `);
}

window.cycleStatus = id => {
  const x = products.find(x => x.id === id);
  if (!x) return;

  const statuses = ['Voldoende', 'Aanvullen', 'Op'];
  x.status = statuses[(statuses.indexOf(x.status) + 1) % statuses.length];

  if (x.status !== 'Voldoende') {
    x.shopping = true;
    x.done = false;
  }

  save();
  render();
};
