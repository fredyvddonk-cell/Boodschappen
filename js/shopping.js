let collapsedShoppingGroups = new Set();

function shoppingGroupKey(level, parent, name) {
  return `${group}:${level}:${parent || ''}:${name}`;
}


function shoppingPrioritySort(a, b) {
  const priority = status => status === 'Op' ? 0 : status === 'Aanvullen' ? 1 : 2;
  return priority(a.status) - priority(b.status) || sortProducts(a, b);
}

function renderShoppingGroup(title, items, level, parent, row) {
  const key = shoppingGroupKey(level, parent, title);
  const collapsed = collapsedShoppingGroups.has(key);
  const secondaryKey = group === 'store' ? 'category' : 'store';
  const inner = level === 1
    ? groups(items, secondaryKey).map(([subName, subItems]) => renderShoppingGroup(subName, subItems, 2, title, row)).join('')
    : [...items].sort(shoppingPrioritySort).map(row).join('');
  return `<section class="shopping-group shopping-level-${level} ${collapsed ? 'collapsed' : ''}">
    <button class="shopping-group-head" type="button" onclick="toggleShoppingGroup('${encodeURIComponent(key)}')">
      <span>${esc(title)}</span><span class="chevron">⌄</span>
    </button>
    <div class="shopping-group-body">${inner}</div>
  </section>`;
}

window.toggleShoppingGroup = encodedKey => {
  const key = decodeURIComponent(encodedKey);
  if (collapsedShoppingGroups.has(key)) collapsedShoppingGroups.delete(key);
  else collapsedShoppingGroups.add(key);
  render();
};

window.collapseAllShopping = () => {
  collapsedShoppingGroups = new Set();
  const arr = products.filter(x => x.shopping && !(x.status === 'Op' && x.buyDirectWhenOut));
  const secondaryKey = group === 'store' ? 'category' : 'store';
  groups(arr, group).forEach(([mainName, items]) => {
    collapsedShoppingGroups.add(shoppingGroupKey(1, '', mainName));
    groups(items, secondaryKey).forEach(([subName]) => collapsedShoppingGroups.add(shoppingGroupKey(2, mainName, subName)));
  });
  render();
};

function renderShopping(allProducts) {
  const arr = allProducts.filter(x => x.shopping);
  const done = arr.filter(x => x.done).length;

  $('#count').textContent = `${arr.length} boodschappen · ${done} afgevinkt`;
  $('#clearDone').style.display = done ? 'inline-block' : 'none';

  document.querySelectorAll('[data-group]').forEach(button => {
    button.classList.toggle('active', button.dataset.group === group);
  });

  if (!arr.length) {
    content.innerHTML = '<div class="empty">Geen producten gevonden.</div>';
    return;
  }

  const urgent = arr.filter(x => x.status === 'Op' && x.buyDirectWhenOut);
  const normal = arr.filter(x => !(x.status === 'Op' && x.buyDirectWhenOut));
  const row = x => `
    <div class="item ${x.done ? 'done' : ''}">
      <input class="check" type="checkbox" ${x.done ? 'checked' : ''} onchange="toggleDone(${x.id})">
      <div class="main">
        <div class="name">${esc(x.name)}</div>
        ${meta(x) ? `<div class="meta">${meta(x)}</div>` : ''}
        ${memoHtml(x)}
      </div>
    </div>`;

  let html = '';
  if (urgent.length) {
    html += `<div class="urgent-block"><h2 class="section urgent-title">Direct nodig</h2>${urgent.sort(sortProducts).map(row).join('')}</div>`;
  }
  if (normal.length) {
    html += groups(normal, group).map(([groupName, items]) => renderShoppingGroup(groupName, items, 1, '', row)).join('');
  }
  content.innerHTML = html;
}

window.toggleDone = id => {
  const x = products.find(x => x.id === id);
  if (!x) return;
  x.done = !x.done;
  save();
  render();
};

function bindShoppingEvents() {
  document.querySelectorAll('[data-group]').forEach(button => {
    button.onclick = () => {
      group = button.dataset.group;
      collapsedShoppingGroups.clear();
      render();
    };
  });

  $('#collapseShoppingBtn').onclick = collapseAllShopping;
  $('#printList').onclick = () => window.print();

  $('#clearDone').onclick = () => {
    products.forEach(x => {
      if (x.shopping && x.done) {
        x.shopping = false;
        x.done = false;
      }
    });
    save();
    render();
  };
}
