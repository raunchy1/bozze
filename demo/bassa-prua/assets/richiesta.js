/* Bassa Prua — richiesta date su WhatsApp (senza calendario e senza blocco date) */
(function () {
  'use strict';
  var bp = document.getElementById('bp');
  if (!bp) return;
  var en = bp.getAttribute('data-lingua') === 'en';
  var T = en ? {
    errDate: 'Choose your arrival and departure dates.',
    errOrder: 'The departure must be after the arrival.',
    errName: 'Write your name.',
    intro: 'Hello Marcello, I would like to ask about availability at Bassa Prua.',
    room: 'Room', from: 'From', to: 'To', guests: 'Guests', name: 'Name', any: 'Not sure'
  } : {
    errDate: 'Scegli la data di arrivo e di partenza.',
    errOrder: 'La partenza deve essere dopo l’arrivo.',
    errName: 'Scrivi il tuo nome.',
    intro: 'Buongiorno Marcello, vorrei chiedere la disponibilità a Bassa Prua.',
    room: 'Camera', from: 'Dal', to: 'Al', guests: 'Ospiti', name: 'Nome', any: 'Non lo so'
  };
  var form = document.getElementById('bp-form');
  var dal = document.getElementById('bp-dal');
  var al = document.getElementById('bp-al');
  var nome = document.getElementById('bp-nome');
  var ospiti = document.getElementById('bp-ospiti');
  var camera = document.getElementById('bp-camera');
  var err = document.getElementById('bp-errore');
  if (!form || !dal || !al) return;

  var oggi = new Date();
  var iso = function (d) { return d.toISOString().slice(0, 10); };
  dal.min = iso(oggi);
  al.min = iso(oggi);

  var mostra = function (msg) {
    err.textContent = msg;
    err.classList.add('is-visibile');
  };
  var pulisci = function () { err.textContent = ''; err.classList.remove('is-visibile'); };

  dal.addEventListener('change', function () {
    pulisci();
    if (!dal.value) return;
    var d = new Date(dal.value + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    al.min = iso(d);
    if (al.value && al.value <= dal.value) al.value = '';
    else if (!al.value) al.value = iso(d);
  });
  al.addEventListener('change', pulisci);
  nome.addEventListener('input', pulisci);

  var dataIt = function (s) {
    var p = s.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    pulisci();
    if (!dal.value || !al.value) { mostra(T.errDate); return; }
    if (al.value <= dal.value) { mostra(T.errOrder); return; }
    if (!nome.value.trim()) { mostra(T.errName); nome.focus(); return; }

    var stanza = camera.value ? camera.options[camera.selectedIndex].text : T.any;
    var righe = [
      T.intro,
      T.room + ': ' + stanza,
      T.from + ': ' + dataIt(dal.value),
      T.to + ': ' + dataIt(al.value),
      T.guests + ': ' + ospiti.value,
      T.name + ': ' + nome.value.trim()
    ];
    var url = 'https://wa.me/393356241767?text=' + encodeURIComponent(righe.join('\n'));
    window.open(url, '_blank', 'noopener');
  });
})();
