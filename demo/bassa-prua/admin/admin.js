/* Pannello prenotazioni Bassa Prua — richieste, conferme caparra, calendario, blocchi. */
(function () {
'use strict';

var CFG = {
  url: 'https://ntcofaxoxjvzovkqgypy.supabase.co',
  key: 'sb_publishable_tCgLTY5zUUG2M1wsUi0iSw_ErBATyaM',
  site: 'bassa-prua'
};

var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var pad = function (n) { return String(n).padStart(2, '0'); };
var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
var daIso = function (s) { var p = String(s).slice(0, 10).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
var oggiIso = function () { return iso(new Date()); };
var esc = function (t) {
  return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};
var dataBreve = function (s) {
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }).format(daIso(s));
};
var dataLunga = function (s) {
  return new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).format(daIso(s));
};
var notti = function (a, b) { return Math.round((daIso(b) - daIso(a)) / 86400000); };
var ora = function (s) {
  return new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(s));
};
var telefonoWa = function (t) {
  var d = String(t || '').replace(/[^0-9]/g, '');
  if (d.charAt(0) === '0') d = '39' + d;
  return d;
};

var sb = window.supabase.createClient(CFG.url, CFG.key, {
  auth: { persistSession: true, storageKey: 'pannello-' + CFG.site }
});

var DATI = { rooms: [], bookings: [] };
var mese = new Date();
var scheda = 'richieste';
var timerConteggi = null;

var toast = function (t, err) {
  $$('.toast').forEach(function (x) { x.remove(); });
  var d = document.createElement('div');
  d.className = 'toast' + (err ? ' err' : '');
  d.setAttribute('role', 'status');
  d.textContent = t;
  document.body.appendChild(d);
  setTimeout(function () { d.remove(); }, err ? 6000 : 3000);
};

var messaggioErrore = function (e) {
  var m = (e && (e.message || e.error_description || e.msg)) || String(e || '');
  if (/Invalid login/i.test(m)) return 'Email o password non corretti.';
  if (/Failed to fetch|NetworkError/i.test(m)) return 'Connessione assente. Riprova tra poco.';
  if (/row-level security|permission|non autorizzato/i.test(m)) return 'Questo account non può gestire le prenotazioni.';
  if (/JWT|expired/i.test(m)) return 'La sessione è scaduta: esci e rientra.';
  if (/non trovata/i.test(m)) return 'Questa richiesta non è più disponibile. Ricarica la pagina.';
  return 'Qualcosa non ha funzionato: ' + m;
};

/* ---------- accesso ---------- */
var mostraPannello = function (si) {
  $('#v-accesso').hidden = si;
  $('#v-pannello').hidden = !si;
};

var avvia = function () {
  return sb.from('site_editors').select('site').eq('site', CFG.site).then(function (r) {
    if (r.error) throw r.error;
    if (!r.data || !r.data.length) {
      sb.auth.signOut();
      var e = new Error('Questo account non può gestire le prenotazioni di Bassa Prua.');
      e.nostro = true;
      throw e;
    }
    mostraPannello(true);
    return carica();
  });
};

$('#f-accesso').addEventListener('submit', function (ev) {
  ev.preventDefault();
  var b = $('#b-accedi');
  b.disabled = true; b.textContent = 'Accesso…';
  $('#err-accesso').textContent = '';
  var utente = $('#email').value.trim().toLowerCase();
  if (utente.indexOf('@') === -1) utente += '@websardegna.xyz';
  sb.auth.signInWithPassword({ email: utente, password: $('#password').value })
    .then(function (r) { if (r.error) throw r.error; return avvia(); })
    .catch(function (e) { $('#err-accesso').textContent = e && e.nostro ? e.message : messaggioErrore(e); })
    .then(function () { b.disabled = false; b.textContent = 'Entra'; });
});

$('#b-esci').addEventListener('click', function () {
  sb.auth.signOut().then(function () { location.reload(); });
});

sb.auth.getSession().then(function (r) {
  if (r.data && r.data.session) {
    avvia().catch(function (e) {
      mostraPannello(false);
      $('#err-accesso').textContent = messaggioErrore(e);
    });
  }
});

/* ---------- dati ---------- */
var carica = function () {
  return Promise.all([
    sb.from('bp_rooms').select('*').order('ordine'),
    sb.from('bp_bookings').select('*').order('check_in', { ascending: true })
  ]).then(function (r) {
    if (r[0].error) throw r[0].error;
    if (r[1].error) throw r[1].error;
    DATI.rooms = r[0].data || [];
    DATI.bookings = r[1].data || [];
    disegna();
    if (scheda === 'calendario') disegnaCalendario();
    if (scheda === 'blocca') disegnaBlocchi();
  }).catch(function (e) {
    $('#lista-pendenti').innerHTML = '<div class="vuoto">' + esc(messaggioErrore(e)) + '</div>';
  });
};

var nomeCamera = function (id) {
  for (var i = 0; i < DATI.rooms.length; i++) if (DATI.rooms[i].id === id) return DATI.rooms[i].nome_it;
  return id;
};

var statoEff = function (b) {
  if (b.stato === 'in_attesa' && new Date(b.expires_at) <= new Date()) return 'scaduta';
  return b.stato;
};

var etichettaStato = {
  in_attesa: 'In attesa',
  confermata: 'Confermata',
  annullata: 'Annullata',
  scaduta: 'Scaduta',
  bloccata: 'Bloccata'
};

/* ---------- schede ---------- */
$$('[data-scheda]').forEach(function (b) {
  b.addEventListener('click', function () {
    scheda = b.getAttribute('data-scheda');
    $$('[data-scheda]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    ['richieste', 'calendario', 'blocca'].forEach(function (s) {
      $('#s-' + s).hidden = s !== scheda;
    });
    if (scheda === 'calendario') disegnaCalendario();
    if (scheda === 'blocca') disegnaBlocchi();
  });
});

/* ---------- richieste ---------- */
var disegna = function () {
  var pendenti = [], confermate = [], storico = [];
  DATI.bookings.forEach(function (b) {
    var s = statoEff(b);
    if (s === 'in_attesa') pendenti.push(b);
    else if (s === 'confermata' && b.check_out >= oggiIso()) confermate.push(b);
    else storico.push(b);
  });
  pendenti.sort(function (a, b) { return new Date(a.expires_at) - new Date(b.expires_at); });
  confermate.sort(function (a, b) { return a.check_in < b.check_in ? -1 : 1; });
  storico.sort(function (a, b) { return a.check_in < b.check_in ? 1 : -1; });

  $('#c-pendenti').textContent = pendenti.length;
  $('#c-confermate').textContent = confermate.length;
  $('#c-incasso').textContent = confermate.length ? dataBreve(confermate[0].check_in) : '—';
  $('#n-pendenti').textContent = pendenti.length;
  $('#n-confermate').textContent = confermate.length;

  var urgenti = pendenti.filter(function (b) {
    return new Date(b.expires_at) - new Date() < 4 * 3600 * 1000;
  }).length;
  var av = $('#avviso-scadenze');
  if (urgenti) {
    av.hidden = false;
    av.innerHTML = '<b>' + urgenti + (urgenti === 1 ? ' richiesta scade' : ' richieste scadono') +
      ' nelle prossime 4 ore.</b> Se non ricevi la caparra, le date si liberano da sole.';
  } else {
    av.hidden = true;
  }

  $('#lista-pendenti').innerHTML = pendenti.length
    ? pendenti.map(card).join('')
    : '<div class="vuoto">Nessuna richiesta da confermare. Quando un ospite prenota dal sito, la trovi qui.</div>';
  $('#lista-confermate').innerHTML = confermate.length
    ? confermate.map(card).join('')
    : '<div class="vuoto">Nessuna prenotazione confermata in arrivo.</div>';
  $('#lista-storico').innerHTML = storico.length
    ? storico.slice(0, 60).map(card).join('')
    : '<div class="vuoto">Ancora niente da mostrare.</div>';

  aggiornaConteggi();
};

var card = function (b) {
  var s = statoEff(b);
  var n = notti(b.check_in, b.check_out);
  var wa = telefonoWa(b.telefono);
  var msg = 'Buongiorno, sono Marcello di Bassa Prua. Ho ricevuto la richiesta ' + b.codice +
    ' per ' + nomeCamera(b.room_id) + ', dal ' + dataBreve(b.check_in) + ' al ' + dataBreve(b.check_out) +
    ' (' + b.ospiti + (b.ospiti === 1 ? ' ospite' : ' ospiti') + '). Per bloccare le date serve la caparra: possiamo parlarne qui?';
  var azioni = '';
  if (s === 'in_attesa') {
    azioni = '<button class="btn piccolo" type="button" data-azione="conferma" data-id="' + b.id + '">Caparra ricevuta</button>' +
      '<button class="btn piccolo pericolo" type="button" data-azione="annulla" data-id="' + b.id + '">Annulla</button>';
  } else if (s === 'confermata') {
    azioni = '<button class="btn piccolo pericolo" type="button" data-azione="annulla" data-id="' + b.id + '">Annulla prenotazione</button>';
  } else if (s === 'bloccata') {
    azioni = '<button class="btn piccolo sec" type="button" data-azione="annulla" data-id="' + b.id + '">Sblocca</button>';
  }

  return '<article class="richiesta ' + s + '">' +
    '<div class="richiesta__testa"><div>' +
      '<h3 class="richiesta__titolo">' + esc(nomeCamera(b.room_id)) + ' · ' + dataBreve(b.check_in) + ' → ' + dataBreve(b.check_out) + '</h3>' +
      '<div class="richiesta__codice">' + esc(b.codice) + ' · richiesta del ' + ora(b.created_at) + '</div>' +
    '</div><span class="bollo ' + s + '">' + (etichettaStato[s] || s) + '</span></div>' +
    '<dl class="richiesta__dati">' +
      '<div><dt>Arrivo</dt><dd>' + dataLunga(b.check_in) + '</dd></div>' +
      '<div><dt>Partenza</dt><dd>' + dataLunga(b.check_out) + '</dd></div>' +
      '<div><dt>Notti</dt><dd>' + n + '</dd></div>' +
      '<div><dt>Ospiti</dt><dd>' + b.ospiti + '</dd></div>' +
    '</dl>' +
    (s === 'bloccata'
      ? '<p class="richiesta__note">' + esc(b.note || 'Periodo bloccato a mano') + '</p>'
      : '<p class="richiesta__ospite"><b>' + esc(b.nome) + '</b>' +
        (b.telefono ? '<a href="tel:' + esc(b.telefono) + '">' + esc(b.telefono) + '</a>' +
          '<a href="https://wa.me/' + wa + '?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener">WhatsApp</a>' : '') +
        (b.email ? '<a href="mailto:' + esc(b.email) + '?subject=' + encodeURIComponent('Bassa Prua · richiesta ' + b.codice) + '">' + esc(b.email) + '</a>' : '') +
        '</p>') +
    (b.note && s !== 'bloccata' ? '<p class="richiesta__note">Nota: ' + esc(b.note) + '</p>' : '') +
    (s === 'in_attesa'
      ? '<div class="richiesta__tempo" data-scadenza="' + esc(b.expires_at) + '"><span>Tempo per la caparra</span><b>—</b></div>'
      : '') +
    (azioni ? '<div class="richiesta__azioni">' + azioni + '</div>' : '') +
    '</article>';
};

function aggiornaConteggi() {
  if (timerConteggi) clearInterval(timerConteggi);
  var tick = function () {
    $$('[data-scadenza]').forEach(function (el) {
      var ms = new Date(el.getAttribute('data-scadenza')) - new Date();
      if (ms <= 0) {
        el.classList.add('urgente');
        el.querySelector('b').textContent = 'Scaduta';
        return;
      }
      var s = Math.floor(ms / 1000);
      var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
      el.querySelector('b').textContent = (h > 0 ? h + 'h ' : '') + pad(m) + 'm ' + pad(ss) + 's';
      el.classList.toggle('urgente', ms < 4 * 3600 * 1000);
    });
  };
  tick();
  timerConteggi = setInterval(tick, 1000);
}

/* ---------- azioni ---------- */
document.addEventListener('click', function (ev) {
  var b = ev.target.closest('[data-azione]');
  if (!b) return;
  var id = b.getAttribute('data-id');
  var azione = b.getAttribute('data-azione');
  var riga = null;
  for (var i = 0; i < DATI.bookings.length; i++) if (DATI.bookings[i].id === id) riga = DATI.bookings[i];
  if (!riga) return;

  if (azione === 'conferma') {
    if (!confirm('Hai ricevuto la caparra da ' + riga.nome + '?\n\nLe date resteranno bloccate in modo definitivo.\nControlla che siano libere anche su Booking.com: questa conferma blocca solo il calendario del sito.')) return;
    b.disabled = true;
    sb.rpc('bp_admin_conferma', { p_id: id }).then(function (r) {
      if (r.error) throw r.error;
      if (!r.data || !r.data.ok) throw new Error('La richiesta è scaduta: le date sono già tornate libere.');
      toast('Caparra registrata: prenotazione confermata.');
      return carica();
    }).catch(function (e) { toast(messaggioErrore(e), true); b.disabled = false; });
  }

  if (azione === 'annulla') {
    var testo = riga.stato === 'bloccata'
      ? 'Sbloccare questo periodo? Le date torneranno prenotabili dal sito.'
      : 'Annullare la richiesta di ' + riga.nome + '? Le date torneranno libere.';
    if (!confirm(testo)) return;
    b.disabled = true;
    sb.rpc('bp_admin_annulla', { p_id: id }).then(function (r) {
      if (r.error) throw r.error;
      if (!r.data || !r.data.ok) throw new Error('Questa richiesta non è più attiva.');
      toast(riga.stato === 'bloccata' ? 'Periodo sbloccato.' : 'Richiesta annullata: date di nuovo libere.');
      return carica();
    }).catch(function (e) { toast(messaggioErrore(e), true); b.disabled = false; });
  }
});

/* ---------- calendario ---------- */
var disegnaCalendario = function () {
  var etichetta = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(mese);
  $('#cal-mese').textContent = etichetta;
  var oggi = new Date();
  $('#cal-prev').disabled = mese.getFullYear() === oggi.getFullYear() && mese.getMonth() === oggi.getMonth();

  var html = '';
  DATI.rooms.forEach(function (r) {
    if (!r.attivo) return;
    var primo = new Date(mese.getFullYear(), mese.getMonth(), 1);
    var fine = new Date(mese.getFullYear(), mese.getMonth() + 1, 0);
    var col = (primo.getDay() + 6) % 7;
    var celle = '';
    for (var i = 0; i < col; i++) celle += '<span class="cal-giorno cal-vuoto"></span>';
    for (var g = 1; g <= fine.getDate(); g++) {
      var d = new Date(mese.getFullYear(), mese.getMonth(), g);
      var giorno = iso(d);
      var s = statoGiorno(r.id, giorno);
      celle += '<span class="cal-giorno ' + s + (giorno === oggiIso() ? ' oggi' : '') + '" title="' + giorno + '">' + g + '</span>';
    }
    html += '<div class="stanza"><h3>' + esc(r.nome_it) + ' · ' + r.capacita + ' posti</h3>' +
      '<div class="cal-sett"><span>L</span><span>M</span><span>M</span><span>G</span><span>V</span><span>S</span><span>D</span></div>' +
      '<div class="cal-griglia">' + celle + '</div></div>';
  });
  $('#calendario').innerHTML = html || '<div class="vuoto">Nessuna camera configurata.</div>';
};

var statoGiorno = function (room, giorno) {
  for (var i = 0; i < DATI.bookings.length; i++) {
    var b = DATI.bookings[i];
    if (b.room_id !== room) continue;
    var s = statoEff(b);
    if (s !== 'confermata' && s !== 'in_attesa' && s !== 'bloccata') continue;
    if (giorno >= b.check_in && giorno < b.check_out) {
      return s === 'confermata' ? 'pieno' : (s === 'in_attesa' ? 'attesa' : 'blocco');
    }
  }
  return '';
};

$('#cal-prev').addEventListener('click', function () {
  var oggi = new Date();
  if (mese.getFullYear() === oggi.getFullYear() && mese.getMonth() === oggi.getMonth()) return;
  mese = new Date(mese.getFullYear(), mese.getMonth() - 1, 1);
  disegnaCalendario();
});
$('#cal-next').addEventListener('click', function () {
  mese = new Date(mese.getFullYear(), mese.getMonth() + 1, 1);
  disegnaCalendario();
});

/* ---------- blocchi ---------- */
var disegnaBlocchi = function () {
  var sel = $('#bl-room');
  var scelto = sel.value;
  sel.innerHTML = DATI.rooms.filter(function (r) { return r.attivo; }).map(function (r) {
    return '<option value="' + esc(r.id) + '">' + esc(r.nome_it) + '</option>';
  }).join('');
  if (scelto) sel.value = scelto;

  var oggi = oggiIso();
  var blocchi = DATI.bookings.filter(function (b) {
    return statoEff(b) === 'bloccata' && b.check_out >= oggi;
  }).sort(function (a, b) { return a.check_in < b.check_in ? -1 : 1; });

  $('#lista-blocchi').innerHTML = blocchi.length
    ? blocchi.map(function (b) {
        return '<div class="blocco-riga"><span><b>' + esc(nomeCamera(b.room_id)) + '</b><br>' +
          dataBreve(b.check_in) + ' → ' + dataBreve(b.check_out) +
          (b.note ? ' · ' + esc(b.note) : '') + '</span>' +
          '<button class="btn piccolo sec" type="button" data-azione="annulla" data-id="' + b.id + '">Sblocca</button></div>';
      }).join('')
    : '<div class="vuoto">Nessun periodo bloccato a mano.</div>';
};

$('#f-blocca').addEventListener('submit', function (ev) {
  ev.preventDefault();
  $('#bl-err').textContent = '';
  var room = $('#bl-room').value;
  var dal = $('#bl-in').value;
  var al = $('#bl-out').value;
  var note = $('#bl-note').value.trim();
  if (!room || !dal || !al) { $('#bl-err').textContent = 'Scegli camera e date.'; return; }
  if (al <= dal) { $('#bl-err').textContent = 'La data finale deve venire dopo quella iniziale.'; return; }
  if (dal < oggiIso()) { $('#bl-err').textContent = 'Scegli una data da oggi in avanti.'; return; }

  var b = $('#bl-invia');
  b.disabled = true; b.textContent = 'Blocco…';
  sb.rpc('bp_admin_blocca', { p_room: room, p_in: dal, p_out: al, p_note: note || null }).then(function (r) {
    if (r.error) throw r.error;
    if (!r.data || !r.data.ok) {
      if (r.data && r.data.errore === 'occupata') throw new Error('In quel periodo c’è già una richiesta o una prenotazione.');
      throw new Error('Date non valide.');
    }
    $('#bl-in').value = ''; $('#bl-out').value = ''; $('#bl-note').value = '';
    toast('Periodo bloccato.');
    return carica();
  }).catch(function (e) { $('#bl-err').textContent = messaggioErrore(e); })
    .then(function () { b.disabled = false; b.textContent = 'Blocca le date'; });
});

/* ---------- avvio ---------- */
var inizio = new Date();
$('#bl-in').min = iso(inizio);
$('#bl-out').min = iso(new Date(inizio.getFullYear(), inizio.getMonth(), inizio.getDate() + 1));
$('#bl-in').max = iso(new Date(inizio.getFullYear() + 2, inizio.getMonth(), inizio.getDate()));
$('#bl-out').max = iso(new Date(inizio.getFullYear() + 2, inizio.getMonth(), inizio.getDate()));
$('#bl-in').addEventListener('change', function () {
  var d = $('#bl-in').value;
  if (!d) return;
  var p = daIso(d);
  var dopo = new Date(p.getFullYear(), p.getMonth(), p.getDate() + 1);
  $('#bl-out').min = iso(dopo);
  if ($('#bl-out').value && $('#bl-out').value <= d) $('#bl-out').value = '';
});

setInterval(function () {
  if (!$('#v-pannello').hidden && !document.hidden) carica();
}, 60000);

})();
