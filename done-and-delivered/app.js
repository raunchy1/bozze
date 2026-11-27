(function () {
  var btn = document.querySelector('.b-menu'), menu = document.getElementById('tendina');
  if (btn && menu) {
    var set = function (open) {
      menu.classList.toggle('aperta', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Chiudi' : 'Menu';
      document.body.style.overflow = open ? 'hidden' : '';
    };
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('aperta')) { set(false); btn.focus(); } });
  }
  var els = document.querySelectorAll('.appare');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }
  window.addEventListener('beforeprint', function () { els.forEach(function (el) { el.classList.add('in'); }); });
  var barra = document.querySelector('.barra'), ord = document.getElementById('ordina');
  if (barra && ord && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { barra.style.visibility = en[0].isIntersecting ? 'hidden' : ''; }).observe(ord);
  }
  document.querySelectorAll('[data-anno]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
