// notice-board.js

async function renderNoticeBoardList(opts) {
console.log(opts);
  const box = document.getElementById('loading');
  const main = document.getElementById('main');
  
  console.log(box);
  if (!box) return;
  box.innerHTML = '<div class="board-loading">공지 불러오는 중…</div>';
  

  const dirURL = (opts && opts.dir) || './notice/';
  const allowFallbackList = (opts && opts.allowFallbackList !== undefined) ? !!opts.allowFallbackList : true;

  let names = [];
  try {
    const res = await fetch(dirURL, { cache: 'no-store' });
    if (res.ok) {
      const html = await res.text();
      names = Array.from(html.matchAll(/href="([^"?>#]+\.json)"/gi)).map(m => decodeURIComponent(m[1]));
    }
  } catch {console.log("1");}

  if (!names.length && allowFallbackList) {
    try {
      const res = await fetch(dirURL + 'list.json', { cache: 'no-store' });
      if (res.ok) names = await res.json();
    } catch {console.log("2");}
  }
console.log(names);
  const items = names.map(name => {
    const base = name.split('/').pop();
    const dec = decodeURIComponent(base || '');
    const m = dec.match(/^(\d+);(.+);(\d{4}-\d{2}-\d{2})\.json$/);
    if (!m) return null;
    return {
      order: parseInt(m[1], 10),
      title: m[2].trim(),
      date: m[3],
      name: base
    };
  }).filter(Boolean);

  if (!items.length) {
	  console.log("3");
    box.innerHTML = '<div class="board-empty">공지 없음</div>';
    return;
  }

  items.sort((a, b) => b.order - a.order);

  const table = document.createElement('table');
  table.className = 'notice-board';
  table.innerHTML = `
    <thead>
      <tr>
        <th class="col-no">No</th>
        <th class="col-title">제목</th>
        <th class="col-date">등록일</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');
  const cache = new Map();

  items.forEach((n, idx) => {
    const rid = `nb_row_${n.order}_${idx}`;
    const tr = document.createElement('tr');
    tr.className = 'nb-row';
    tr.dataset.target = rid;
    tr.dataset.name = n.name;
    tr.innerHTML = `
      <td class="col-no">${n.order}</td>
      <td class="col-title">${escapeHtml(n.title)}</td>
      <td class="col-date">${escapeHtml(n.date)}</td>
    `;

    const trc = document.createElement('tr');
    trc.className = 'nb-content';
    trc.id = rid;
    const td = document.createElement('td');
    td.colSpan = 3;
    td.innerHTML = `<div class="nb-content-inner" data-state="empty"></div>`;
    trc.appendChild(td);

    tbody.appendChild(tr);
    tbody.appendChild(trc);
  });

  table.addEventListener('click', async (e) => {
    const row = e.target.closest('tr.nb-row');
    if (!row) return;
    const targetId = row.dataset.target;
    const fileName = row.dataset.name;
    const contentRow = document.getElementById(targetId);
    if (!contentRow) return;
    const inner = contentRow.querySelector('.nb-content-inner');
    const cached = cache.get(fileName);

    if (!cached || !cached.loaded) {
      inner.setAttribute('data-state', 'loading');
      inner.textContent = '불러오는 중…';
      try {
        const res = await fetch(dirURL + fileName, { cache: 'no-store' });
        if (!res.ok) throw new Error(res.statusText);
        const json = await res.json();
        const html = String(json.content || '');
        cache.set(fileName, { loaded: true, html });
        inner.innerHTML = html;
      } catch {
        inner.textContent = '내용을 불러오지 못했습니다.';
      }
    }
    contentRow.classList.toggle('open');
  });

  box.innerHTML = '';
  box.appendChild(table);
  injectNoticeBoardStyle();
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function injectNoticeBoardStyle() {
  if (document.getElementById('nb-style')) return;
  const css = `
  .notice-board{width:100%;border-collapse:collapse;margin:8px 0;font-size:13px}
  .notice-board th,.notice-board td{border-bottom:1px solid #e5e5e5;padding:10px 8px;vertical-align:top}
  .notice-board thead th{border-top:1px solid #e5e5e5;background:#fafafa;text-align:left}
  .notice-board .col-no{width:80px;text-align:center}
  .notice-board .col-date{width:120px;text-align:center;white-space:nowrap}
  .notice-board .nb-row{cursor:pointer}
  .notice-board .nb-content{display:none}
  .notice-board .nb-content.open{display:table-row}
  .notice-board .nb-content-inner[data-state="loading"]{color:#666}
  `;
  const s = document.createElement('style');
  s.id = 'nb-style';
  s.textContent = css;
  document.head.appendChild(s);
}


