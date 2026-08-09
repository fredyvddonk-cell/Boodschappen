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
    html += groups(normal, group)
      .map(([groupName, items]) => `<h2 class="section">${esc(groupName)}</h2>${items.map(row).join('')}`)
      .join('');
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
      render();
    };
  });

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
