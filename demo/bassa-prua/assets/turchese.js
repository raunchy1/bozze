// Bassa Prua · Turchese: menu su telefono, comparsa allo scorrere, anno nel piede
(function () {
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  if (btn && menu) {
    var set = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? btn.getAttribute('data-chiudi') : btn.getAttribute('data-apri'));
      menu.classList.toggle('aperto', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('aperto')) { set(false); btn.focus(); } });
  }
  var els = document.querySelectorAll('.appare');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, {rootMargin: '0px 0px -8% 0px'});
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }
  // in stampa mostra tutto
  window.addEventListener('beforeprint', function () { els.forEach(function (el) { el.classList.add('in'); }); });
  // la barra fissa sparisce quando il modulo di prenotazione è sullo schermo
  var barra = document.querySelector('.barra'), pren = document.getElementById('prenota');
  if (barra && pren && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { barra.style.display = en[0].isIntersecting ? 'none' : ''; }).observe(pren);
  }
  document.querySelectorAll('[data-anno]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
