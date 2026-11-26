// Domu Prexada: lightbox pentru galeriile camerelor (fără dependențe)
const data = JSON.parse(document.getElementById('gal-data').textContent);
let box, imgEl, capEl, idx = 0, list = [], name = '';

function build() {
  box = document.createElement('div');
  box.className = 'lb';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML = `
    <button class="lb__close" type="button" aria-label="Chiudi">×</button>
    <button class="lb__nav lb__prev" type="button" aria-label="Precedente">‹</button>
    <figure class="lb__fig"><img class="lb__img" alt=""><figcaption class="lb__cap"></figcaption></figure>
    <button class="lb__nav lb__next" type="button" aria-label="Successiva">›</button>`;
  document.body.appendChild(box);
  imgEl = box.querySelector('.lb__img');
  capEl = box.querySelector('.lb__cap');
  box.querySelector('.lb__close').addEventListener('click', close);
  box.querySelector('.lb__prev').addEventListener('click', () => show(idx - 1));
  box.querySelector('.lb__next').addEventListener('click', () => show(idx + 1));
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
}

function show(i) {
  idx = (i + list.length) % list.length;
  imgEl.src = list[idx];
  imgEl.alt = `${name} — ${idx + 1}/${list.length}`;
  capEl.textContent = `${name} · ${idx + 1} / ${list.length}`;
}

function open(key, label) {
  if (!box) build();
  list = data[key] || [];
  if (!list.length) return;
  name = label || '';
  show(0);
  box.classList.add('is-open');
  document.body.classList.add('lb-lock');
  box.querySelector('.lb__close').focus();
}

function close() {
  box.classList.remove('is-open');
  document.body.classList.remove('lb-lock');
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-gallery]');
  if (!btn) return;
  e.preventDefault();
  open(btn.getAttribute('data-gallery'), btn.getAttribute('data-name'));
});
