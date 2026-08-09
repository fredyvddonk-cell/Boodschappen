let collapsedStockCategories = new Set();

window.toggleStockCategory = encodedName => {
  const name = decodeURIComponent(encodedName);
  if (collapsedStockCategories.has(name)) collapsedStockCategories.delete(name);
  else collapsedStockCategories.add(name);
  render();
};

window.collapseAllStock = () => {
  const query = search.value.trim().toLowerCase();
  const arr = products.filter(x => x.name.toLowerCase().includes(query) || x.memo.toLowerCase().includes(query));
  collapsedStockCategories = new Set(groups(arr, 'category').map(([name]) => name));
  render();
};

function renderStock(arr) {
  if (!arr.length) {
    content.innerHTML = '<div class="empty">Geen producten gevonden.</div>';
    return;
  }

  content.innerHTML = `<div class="stock-tools"><button class="clear" type="button" onclick="collapseAllStock()">Alles inklappen</button></div>` +
    groups(arr, 'category').map(([categoryName, items]) => {
      const collapsed = collapsedStockCategories.has(categoryName);
      return `<section class="stock-category ${collapsed ? 'collapsed' : ''}">
        <button class="shopping-group-head stock-category-head" type="button" onclick="toggleStockCategory('${encodeURIComponent(categoryName)}')">
          <span>${esc(categoryName)}</span><span class="chevron">⌄</span>
        </button>
        <div class="shopping-group-body">${items.map(x => `
          <div class="item stock-item">
            <div class="main" onclick="editProduct(${x.id})" role="button" tabindex="0">
              <div class="name">${esc(x.name)}</div>
              ${meta(x) ? `<div class="meta">${meta(x)}</div>` : ''}
              ${memoHtml(x)}
              <div class="stock-edit-hint">Tik op product om te wijzigen</div>
            </div>
            <button class="status ${x.status === 'Voldoende' ? 'good' : x.status === 'Aanvullen' ? 'low' : 'out'}" onclick="cycleStatus(${x.id})">${x.status}</button>
          </div>`).join('')}</div>
      </section>`;
    }).join('');
}

window.cycleStatus = id => {
  const x = products.find(x => x.id === id);
  if (!x) return;

  const statuses = ['Voldoende', 'Aanvullen', 'Op'];
  x.status = statuses[(statuses.indexOf(x.status) + 1) % statuses.length];

  if (x.status === 'Voldoende') {
    x.shopping = false;
    x.done = false;
  } else {
    x.shopping = true;
    x.done = false;
  }

  save();
  render();
};
