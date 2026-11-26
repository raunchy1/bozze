/* Bassa Prua — richiesta di prenotazione con blocco date per 24 ore.
   Parla con Supabase: disponibilità pubblica (solo date) e funzione bp_richiesta.
   La conferma definitiva la dà Marcello dal pannello, dopo la caparra. */
(function () {
'use strict';

var CFG = {
  url: 'https://ntcofaxoxjvzovkqgypy.supabase.co',
  key: 'sb_publishable_tCgLTY5zUUG2M1wsUi0iSw_ErBATyaM',
  wa: '393356241767',
  email: 'marcellserra@yahoo.it'
};

var box = document.getElementById('bp');
if (!box) return;

var LANG = (document.documentElement.lang || 'it').slice(0, 2) === 'en' ? 'en' : 'it';
var T = {
  it: {
    camera: 'La camera',
    date: 'Le date',
    dati: 'I tuoi dati',
    arrivo: 'Scegli il giorno di arrivo.',
    partenza: 'Arrivo il {a}. Scegli il giorno di partenza.',
    scelta: '{a} → {b} · {n} notti',
    unaNotte: '{a} → {b} · 1 notte',
    occupato: 'Quel giorno è occupato. Scegli un altro arrivo.',
    dentro: 'Nel periodo scelto c’è un giorno occupato. Scegli altre date.',
    lungo: 'Puoi chiedere al massimo 30 notti. Per soggiorni più lunghi scrivici su WhatsApp.',
    passato: 'Scegli una data da oggi in avanti.',
    legLibero: 'libero',
    legOccupato: 'occupato',
    legScelta: 'la tua scelta',
    legNota: 'Il giorno della partenza può essere occupato da un altro arrivo: si parte la mattina.',
    ospiti: 'Ospiti',
    persona: 'persona',
    persone: 'persone',
    nome: 'Nome e cognome',
    tel: 'Telefono / WhatsApp',
    email: 'Email (facoltativa)',
    invia: 'Richiedi le date',
    invio: 'Invio…',
    nota: 'Nessun pagamento online. Usiamo i tuoi dati solo per gestire la richiesta. La caparra la concordi direttamente con Marcello.',
    erroreNome: 'Scrivi nome e cognome.',
    erroreTel: 'Scrivi un numero di telefono valido.',
    erroreDate: 'Scegli arrivo e partenza nel calendario.',
    occupata: 'Quel periodo è appena stato richiesto da un altro ospite. Scegli altre date.',
    attendi: 'Hai già inviato più richieste. Aspetta qualche minuto o scrivi su WhatsApp.',
    rete: 'Connessione assente. Riprova, oppure scrivi a Marcello su WhatsApp.',
    generico: 'Qualcosa non ha funzionato. Riprova, oppure scrivi su WhatsApp.',
    caricamento: 'Carico il calendario…',
    guasto: 'Il calendario non si carica in questo momento. Puoi comunque scriverci: ti diciamo noi se le date sono libere.',
    inviata: 'Richiesta inviata',
    codice: 'Codice richiesta',
    tempo: 'Tempo per contattare Marcello',
    scadutaTra: 'La richiesta scade il {data}.',
    spiega: 'Scrivi a Marcello su WhatsApp e concordate la caparra. Appena la riceve, conferma la prenotazione e le date restano tue.',
    wa: 'Scrivi a Marcello su WhatsApp',
    chiama: 'Chiama',
    scadutaNota: 'Se non riesci a contattarlo entro 24 ore, le date si liberano da sole.',
    altra: 'Fai un’altra richiesta',
    confermata: 'Prenotazione confermata',
    confermataTesto: 'Marcello ha ricevuto la caparra. Le date sono tue: a presto!',
    scaduta: 'Richiesta scaduta',
    scadutaTesto: 'Sono passate 24 ore senza la caparra, quindi le date sono di nuovo libere. Puoi fare una nuova richiesta o scrivere a Marcello.',
    annullata: 'Richiesta annullata',
    annullataTesto: 'Questa richiesta non è più attiva. Puoi scegliere altre date o scrivere a Marcello.',
    nonTrovata: 'Non troviamo questa richiesta. Controlla il codice o scrivi a Marcello.',
    riepilogo: 'Camera',
    dal: 'Arrivo',
    al: 'Partenza',
    notti: 'Notti',
    titolo: 'Scegli la camera e le date',
    sottotitolo: 'Le date restano bloccate per 24 ore. Poi scrivi a Marcello su WhatsApp e versi la caparra: solo allora la prenotazione è confermata.',
    passo1: 'Scegli camera e date',
    passo2: 'Blocchiamo 24 ore',
    passo3: 'Caparra su WhatsApp'
  },
  en: {
    camera: 'The room',
    date: 'The dates',
    dati: 'Your details',
    arrivo: 'Choose your arrival day.',
    partenza: 'Arrival on {a}. Choose your departure day.',
    scelta: '{a} → {b} · {n} nights',
    unaNotte: '{a} → {b} · 1 night',
    occupato: 'That day is taken. Choose another arrival date.',
    dentro: 'One of the days you chose is taken. Please choose other dates.',
    lungo: 'You can request up to 30 nights. For longer stays, message us on WhatsApp.',
    passato: 'Choose a date from today onwards.',
    legLibero: 'available',
    legOccupato: 'taken',
    legScelta: 'your choice',
    legNota: 'Your departure day can be someone else’s arrival day: you leave in the morning.',
    ospiti: 'Guests',
    persona: 'guest',
    persone: 'guests',
    nome: 'Full name',
    tel: 'Phone / WhatsApp',
    email: 'Email (optional)',
    invia: 'Request these dates',
    invio: 'Sending…',
    nota: 'No online payment. We use your details only to manage this request. You agree the deposit directly with Marcello.',
    erroreNome: 'Please write your full name.',
    erroreTel: 'Please write a valid phone number.',
    erroreDate: 'Choose arrival and departure in the calendar.',
    occupata: 'Those dates have just been requested by another guest. Please choose other dates.',
    attendi: 'You have sent several requests. Wait a few minutes or message us on WhatsApp.',
    rete: 'No connection. Try again, or message Marcello on WhatsApp.',
    generico: 'Something went wrong. Try again, or message us on WhatsApp.',
    caricamento: 'Loading the calendar…',
    guasto: 'The calendar is not loading right now. You can still write to us and we will tell you if the dates are free.',
    inviata: 'Request sent',
    codice: 'Request code',
    tempo: 'Time to contact Marcello',
    scadutaTra: 'The request expires on {data}.',
    spiega: 'Message Marcello on WhatsApp and agree the deposit. As soon as he receives it, he confirms the booking and the dates are yours.',
    wa: 'Message Marcello on WhatsApp',
    chiama: 'Call',
    scadutaNota: 'If you cannot reach him within 24 hours, the dates are released automatically.',
    altra: 'Make another request',
    confermata: 'Booking confirmed',
    confermataTesto: 'Marcello has received the deposit. The dates are yours: see you soon!',
    scaduta: 'Request expired',
    scadutaTesto: '24 hours passed without the deposit, so the dates are free again. You can make a new request or write to Marcello.',
    annullata: 'Request cancelled',
    annullataTesto: 'This request is no longer active. You can choose other dates or write to Marcello.',
    nonTrovata: 'We cannot find this request. Check the code or write to Marcello.',
    riepilogo: 'Room',
    dal: 'Arrival',
    al: 'Departure',
    notti: 'Nights',
    titolo: 'Choose your room and dates',
    sottotitolo: 'The dates are held for 24 hours. Then you message Marcello on WhatsApp and pay the deposit: only then is the booking confirmed.',
    passo1: 'Choose room and dates',
    passo2: 'Held for 24 hours',
    passo3: 'Deposit on WhatsApp'
  }
}[LANG];

var ROOMS = LANG === 'en'
  ? [
      { id: 'terrazza', nome: 'Double room with terrace', cap: 2, extra: 'private bathroom · terrace' },
      { id: 'balcone', nome: 'Double room with balcony', cap: 2, extra: 'private bathroom · harbour balcony' },
      { id: 'familiare', nome: 'Family room with bunk bed', cap: 4, extra: 'private bathroom · terrace' }
    ]
  : [
      { id: 'terrazza', nome: 'Matrimoniale con terrazza', cap: 2, extra: 'bagno privato · terrazza' },
      { id: 'balcone', nome: 'Matrimoniale con balcone', cap: 2, extra: 'bagno privato · balcone sul porto' },
      { id: 'familiare', nome: 'Familiare con letto a castello', cap: 4, extra: 'bagno privato · terrazza' }
    ];

var state = {
  room: 'terrazza',
  dal: null,
  al: null,
  mese: new Date(),
  ranges: [],
  inviando: false,
  timer: null
};

var $ = function (s, r) { return (r || document).querySelector(s); };
var pad = function (n) { return String(n).padStart(2, '0'); };
var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
var daIso = function (s) { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
var oggiIso = function () { return iso(new Date()); };
var dataLunga = function (s) {
  if (!s) return '—';
  return new Intl.DateTimeFormat(LANG === 'en' ? 'en-GB' : 'it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(daIso(s));
};
var notti = function (a, b) { return Math.round((daIso(b) - daIso(a)) / 86400000); };
var dataRoma = function (d) {
  return new Intl.DateTimeFormat(LANG === 'en' ? 'en-GB' : 'it-IT', { timeZone: 'Europe/Rome', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
};

function esc(t) {
  return String(t).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function testo(s, dati) {
  return s.replace(/\{(\w+)\}/g, function (_, k) { return dati[k] == null ? '' : dati[k]; });
}
function camera(id) {
  for (var i = 0; i < ROOMS.length; i++) if (ROOMS[i].id === id) return ROOMS[i];
  return ROOMS[0];
}

/* ---------- Supabase ---------- */
var headers = {
  apikey: CFG.key,
  Authorization: 'Bearer ' + CFG.key,
  'Content-Type': 'application/json'
};
function rpc(nome, corpo) {
  return fetch(CFG.url + '/rest/v1/rpc/' + nome, {
    method: 'POST',
    headers: headers,
    cache: 'no-store',
    body: JSON.stringify(corpo || {})
  }).then(function (r) {
    return r.text().then(function (t) {
      var d = null;
      try { d = t ? JSON.parse(t) : null; } catch (e) {}
      if (!r.ok) {
        var e = new Error((d && (d.message || d.error_description)) || ('HTTP ' + r.status));
        e.stato = r.status;
        throw e;
      }
      return d;
    });
  });
}

function caricaDisponibilita() {
  return rpc('bp_disponibilita').then(function (d) {
    state.ranges = Array.isArray(d) ? d : [];
    disegna();
  });
}

function occupato(giorno) {
  for (var i = 0; i < state.ranges.length; i++) {
    var r = state.ranges[i];
    if (r.room_id === state.room && giorno >= r.dal && giorno < r.al) return true;
  }
  return false;
}

function liberoIntervallo(dal, al) {
  var d = daIso(dal);
  var fine = daIso(al);
  while (d < fine) {
    if (occupato(iso(d))) return false;
    d.setDate(d.getDate() + 1);
  }
  return true;
}

/* ---------- interfaccia ---------- */
function montaCamere() {
  var c = $('#bp-camere');
  c.innerHTML = '';
  ROOMS.forEach(function (r) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bp-camera' + (r.id === state.room ? ' is-attiva' : '');
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', r.id === state.room ? 'true' : 'false');
    b.setAttribute('data-camera', r.id);
    b.innerHTML = '<b>' + esc(r.nome) + '</b><span>' + esc(r.extra) + '</span><span class="bp-camera__cap">' +
      (r.cap === 1 ? '1 ' + T.persona : r.cap + ' ' + T.persone) + '</span>';
    b.addEventListener('click', function () {
      if (state.room === r.id) return;
      state.room = r.id;
      state.dal = null;
      state.al = null;
      montaCamere();
      ospiti();
      disegna();
    });
    c.appendChild(b);
  });
}

function ospiti() {
  var cap = camera(state.room).cap;
  var s = $('#bp-ospiti');
  var scelto = Math.min(Number(s.value) || Math.min(2, cap), cap);
  s.innerHTML = '';
  for (var i = 1; i <= cap; i++) {
    var o = document.createElement('option');
    o.value = i;
    o.textContent = i === 1 ? '1 ' + T.persona : i + ' ' + T.persone;
    if (i === scelto) o.selected = true;
    s.appendChild(o);
  }
}

function disegna() {
  var mese = state.mese;
  var etichetta = new Intl.DateTimeFormat(LANG === 'en' ? 'en-GB' : 'it-IT', { month: 'long', year: 'numeric' }).format(mese);
  $('#bp-mese').textContent = etichetta;

  var oggi = new Date();
  var inizioMese = new Date(mese.getFullYear(), mese.getMonth(), 1);
  var fineMese = new Date(mese.getFullYear(), mese.getMonth() + 1, 0);
  var colonna = (inizioMese.getDay() + 6) % 7;
  var celle = colonna;
  var griglia = $('#bp-griglia');
  griglia.innerHTML = '';

  $('#bp-prev').disabled = mese.getFullYear() === oggi.getFullYear() && mese.getMonth() === oggi.getMonth();

  for (var i = 0; i < colonna; i++) {
    var vuoto = document.createElement('span');
    vuoto.className = 'bp-vuoto';
    griglia.appendChild(vuoto);
  }

  for (var g = 1; g <= fineMese.getDate(); g++) {
    var d = new Date(mese.getFullYear(), mese.getMonth(), g);
    var giorno = iso(d);
    var passato = giorno < oggiIso();
    var preso = occupato(giorno);
    var selezionato = state.dal && state.al && giorno >= state.dal && giorno < state.al;
    var arrivo = state.dal === giorno;
    var partenza = state.al === giorno;

    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bp-giorno' +
      (passato ? ' is-passato' : '') +
      (preso ? ' is-occupato' : '') +
      (selezionato ? ' is-scelto' : '') +
      (arrivo ? ' is-arrivo' : '') +
      (partenza ? ' is-partenza' : '') +
      (giorno === oggiIso() ? ' is-oggi' : '');
    b.setAttribute('data-giorno', giorno);
    b.setAttribute('aria-label', dataLunga(giorno) + (preso ? ' — ' + T.legOccupato : ''));
    b.setAttribute('aria-pressed', selezionato || arrivo ? 'true' : 'false');
    if (passato) b.disabled = true;
    b.innerHTML = '<span>' + g + '</span>';
    b.addEventListener('click', function (ev) {
      scegli(ev.currentTarget.getAttribute('data-giorno'));
    });
    griglia.appendChild(b);
    celle++;
  }

  // righe complete: riempi la fine della settimana
  while (celle % 7 !== 0) {
    var v = document.createElement('span');
    v.className = 'bp-vuoto';
    griglia.appendChild(v);
    celle++;
  }

  var sel = $('#bp-sel');
  if (!state.dal) {
    sel.textContent = T.arrivo;
  } else if (!state.al) {
    sel.textContent = testo(T.partenza, { a: dataLunga(state.dal) });
  } else {
    var n = notti(state.dal, state.al);
    sel.textContent = testo(n === 1 ? T.unaNotte : T.scelta, { a: dataLunga(state.dal), b: dataLunga(state.al), n: n });
  }
  sel.classList.toggle('is-pronta', !!(state.dal && state.al));
  $('#bp-invia').disabled = !(state.dal && state.al) || state.inviando;
}

function scegli(giorno) {
  errore('');
  if (giorno < oggiIso()) {
    errore(T.passato);
    return;
  }
  if (!state.dal || state.al) {
    if (occupato(giorno)) {
      errore(T.occupato);
      return;
    }
    state.dal = giorno;
    state.al = null;
    disegna();
    return;
  }
  if (giorno <= state.dal) {
    if (occupato(giorno)) {
      errore(T.occupato);
      return;
    }
    state.dal = giorno;
    state.al = null;
    disegna();
    return;
  }
  if (notti(state.dal, giorno) > 30) {
    errore(T.lungo);
    return;
  }
  if (!liberoIntervallo(state.dal, giorno)) {
    errore(T.dentro);
    return;
  }
  state.al = giorno;
  disegna();
}

function errore(t) {
  var e = $('#bp-errore');
  e.textContent = t || '';
  e.classList.toggle('is-visibile', !!t);
}

function mesi() {
  var b = state.mese;
  state.mese = new Date(b.getFullYear(), b.getMonth() + 1, 1);
  disegna();
}

/* ---------- invio ---------- */
function invia(ev) {
  ev.preventDefault();
  if (state.inviando) return;
  errore('');
  if (!state.dal || !state.al) { errore(T.erroreDate); return; }
  var nome = $('#bp-nome').value.trim();
  var tel = $('#bp-tel').value.trim();
  var email = $('#bp-email').value.trim();
  if (nome.length < 2) { errore(T.erroreNome); $('#bp-nome').focus(); return; }
  if (tel.replace(/[^0-9]/g, '').length < 7) { errore(T.erroreTel); $('#bp-tel').focus(); return; }

  state.inviando = true;
  var b = $('#bp-invia');
  b.disabled = true;
  b.textContent = T.invio;

  rpc('bp_richiesta', {
    p_room: state.room,
    p_in: state.dal,
    p_out: state.al,
    p_ospiti: Number($('#bp-ospiti').value),
    p_nome: nome,
    p_tel: tel,
    p_email: email || null,
    p_lingua: LANG
  }).then(function (d) {
    if (!d || !d.ok) {
      var code = d && d.errore;
      var msg = T.generico;
      if (code === 'occupata') { msg = T.occupata; caricaDisponibilita(); }
      else if (code === 'attendi') msg = T.attendi;
      else if (code === 'ospiti') msg = T.generico;
      else if (code === 'date' || code === 'passato') msg = T.erroreDate;
      else if (code === 'lungo') msg = T.lungo;
      else if (code === 'nome') msg = T.erroreNome;
      else if (code === 'telefono') msg = T.erroreTel;
      throw new Error(msg);
    }
    mostraRichiesta(d);
    caricaDisponibilita();
  }).catch(function (e) {
    errore(e && /conness|fetch|network/i.test(e.message) ? T.rete : (e.message || T.generico));
  }).then(function () {
    state.inviando = false;
    b.disabled = false;
    b.textContent = T.invia;
    disegna();
  });
}

/* ---------- esito ---------- */
function linkWhatsApp(d) {
  var cam = camera(d.camera || state.room);
  var msg = LANG === 'en'
    ? 'Hello Marcello, I sent a booking request for Bassa Prua.\nCode: ' + d.codice +
      '\nRoom: ' + cam.nome + '\nArrival: ' + dataLunga(d.dal || state.dal) +
      '\nDeparture: ' + dataLunga(d.al || state.al) +
      '\nGuests: ' + (d.ospiti || $('#bp-ospiti').value) +
      '\nI would like to pay the deposit to block the dates.'
    : 'Buongiorno Marcello, ho inviato una richiesta di prenotazione per Bassa Prua.\nCodice: ' + d.codice +
      '\nCamera: ' + cam.nome + '\nArrivo: ' + dataLunga(d.dal || state.dal) +
      '\nPartenza: ' + dataLunga(d.al || state.al) +
      '\nOspiti: ' + (d.ospiti || $('#bp-ospiti').value) +
      '\nVorrei versare la caparra per bloccare le date.';
  return 'https://wa.me/' + CFG.wa + '?text=' + encodeURIComponent(msg);
}

function riepilogo(d) {
  var cam = camera(d.camera || state.room);
  var n = notti(d.dal || state.dal, d.al || state.al);
  return '<dl class="bp-riepilogo">' +
    '<div><dt>' + T.riepilogo + '</dt><dd>' + esc(cam.nome) + '</dd></div>' +
    '<div><dt>' + T.dal + '</dt><dd>' + dataLunga(d.dal || state.dal) + '</dd></div>' +
    '<div><dt>' + T.al + '</dt><dd>' + dataLunga(d.al || state.al) + '</dd></div>' +
    '<div><dt>' + T.notti + '</dt><dd>' + n + '</dd></div>' +
    '</dl>';
}

function mostraRichiesta(d) {
  var cam = camera(d.camera || state.room);
  var expiry = d.scadenza ? new Date(d.scadenza) : new Date(Date.now() + 24 * 3600 * 1000);
  state.room = cam.id;
  state.dal = d.dal;
  state.al = d.al;
  state.codice = d.codice;
  $('#bp-app').hidden = true;
  var e = $('#bp-esito');
  e.hidden = false;
  e.innerHTML =
    '<div class="bp-esito__testa"><span class="bp-ok">✓</span><div><h3>' + T.inviata + '</h3>' +
    '<p class="bp-codice">' + T.codice + ': <b>' + esc(d.codice) + '</b></p></div></div>' +
    riepilogo(d) +
    '<div class="bp-conto"><span>' + T.tempo + '</span><b data-conto>24:00:00</b></div>' +
    '<p>' + T.spiega + '</p>' +
    '<p class="bp-scadenza">' + testo(T.scadutaTra, { data: dataRoma(expiry) }) + '</p>' +
    '<div class="bp-azioni">' +
      '<a class="btn bp-wa" target="_blank" rel="noopener" href="' + esc(linkWhatsApp(d)) + '">' + T.wa + '</a>' +
      '<a class="btn btn--bordo" href="tel:+' + CFG.wa + '">' + T.chiama + '</a>' +
    '</div>' +
    '<p class="bp-nota">' + T.scadutaNota + '</p>' +
    '<button type="button" class="bp-link" id="bp-nuova">' + T.altra + '</button>';

  $('#bp-nuova').addEventListener('click', function () {
    if (state.timer) clearInterval(state.timer);
    try { history.replaceState({}, '', location.pathname + location.search.replace(/[?&]codice=[^&]+/, '').replace(/\?$/, '') + '#prenota'); } catch (err) {}
    e.hidden = true;
    $('#bp-app').hidden = false;
    state.dal = null;
    state.al = null;
    disegna();
    caricaDisponibilita();
  });

  conta(expiry);
  try {
    var u = new URL(location.href);
    u.searchParams.set('codice', d.codice);
    history.replaceState({}, '', u.pathname + u.search + '#prenota');
  } catch (err) {}
}

function conta(expiry) {
  if (state.timer) clearInterval(state.timer);
  var aggiorna = function () {
    var ms = expiry - new Date();
    if (ms < 0) ms = 0;
    var s = Math.floor(ms / 1000);
    var hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
    var el = $('[data-conto]');
    if (el) el.textContent = pad(hh) + ':' + pad(mm) + ':' + pad(ss);
    if (ms === 0) {
      clearInterval(state.timer);
      stato(state.codice || null);
    }
  };
  aggiorna();
  state.timer = setInterval(aggiorna, 1000);
}

function esitoStato(d) {
  var e = $('#bp-esito');
  $('#bp-app').hidden = true;
  e.hidden = false;
  var titolo = '', testo = '';
  if (d.stato === 'in_attesa') {
    d.lookupCodice = d.codice;
    state.room = d.camera;
    state.dal = d.dal;
    state.al = d.al;
    mostraRichiesta(d);
    return;
  }
  if (d.stato === 'confermata') { titolo = T.confermata; testo = T.confermataTesto; }
  else if (d.stato === 'annullata') { titolo = T.annullata; testo = T.annullataTesto; }
  else { titolo = T.scaduta; testo = T.scadutaTesto; }

  e.innerHTML =
    '<div class="bp-esito__testa"><span class="bp-ok' + (d.stato === 'confermata' ? '' : ' bp-ok--grigio') + '">' +
    (d.stato === 'confermata' ? '✓' : '·') + '</span><div><h3>' + titolo + '</h3>' +
    '<p class="bp-codice">' + T.codice + ': <b>' + esc(d.codice) + '</b></p></div></div>' +
    riepilogo(d) +
    '<p>' + testo + '</p>' +
    '<div class="bp-azioni">' +
      '<a class="btn bp-wa" target="_blank" rel="noopener" href="https://wa.me/' + CFG.wa + '">' + T.wa + '</a>' +
      '<a class="btn btn--bordo" href="tel:+' + CFG.wa + '">' + T.chiama + '</a>' +
    '</div>' +
    '<button type="button" class="bp-link" id="bp-nuova">' + T.altra + '</button>';
  $('#bp-nuova').addEventListener('click', function () {
    try { history.replaceState({}, '', location.pathname + '#prenota'); } catch (err) {}
    location.reload();
  });
}

function stato(codice) {
  if (!codice) { statoDaUrl(); return; }
  rpc('bp_stato', { p_codice: codice }).then(function (d) {
    if (d) esitoStato(d);
    else errore(T.nonTrovata);
  }).catch(function () { errore(T.rete); });
}

function statoDaUrl() {
  var codice = null;
  try { codice = new URL(location.href).searchParams.get('codice'); } catch (e) {}
  if (!codice) return false;
  rpc('bp_stato', { p_codice: codice }).then(function (d) {
    if (d) esitoStato(d);
    else {
      $('#bp-app').hidden = false;
      errore(T.nonTrovata);
    }
  }).catch(function () { $('#bp-app').hidden = false; });
  return true;
}

/* ---------- avvio ---------- */
function avvia() {
  montaCamere();
  ospiti();
  $('#bp-form').addEventListener('submit', invia);
  $('#bp-prev').addEventListener('click', function () {
    var b = state.mese;
    var oggi = new Date();
    if (b.getFullYear() === oggi.getFullYear() && b.getMonth() === oggi.getMonth()) return;
    state.mese = new Date(b.getFullYear(), b.getMonth() - 1, 1);
    disegna();
  });
  $('#bp-next').addEventListener('click', mesi);

  // I bottoni "Verifica le date" delle camere portano al calendario
  // con quella camera già scelta.
  Array.prototype.forEach.call(document.querySelectorAll('[data-camera]'), function (a) {
    a.addEventListener('click', function () {
      var id = a.getAttribute('data-camera');
      var esiste = false;
      for (var i = 0; i < ROOMS.length; i++) if (ROOMS[i].id === id) esiste = true;
      if (!esiste) return;
      state.room = id;
      state.dal = null;
      state.al = null;
      montaCamere();
      ospiti();
      disegna();
    });
  });

  if (statoDaUrl()) return;

  $('#bp-attesa').hidden = false;
  caricaDisponibilita().then(function () {
    $('#bp-attesa').hidden = true;
    $('#bp-app').hidden = false;
    disegna();
  }).catch(function () {
    $('#bp-attesa').hidden = true;
    $('#bp-guasto').hidden = false;
  });
}

avvia();
})();
