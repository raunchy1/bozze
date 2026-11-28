/* Pannello Negozio del Usato DEB — ordini, articoli, categorie, spedizione. */
(function () {
'use strict';
var CFG = {
  url: 'https://ntcofaxoxjvzovkqgypy.supabase.co',
  key: 'sb_publishable_tCgLTY5zUUG2M1wsUi0iSw_ErBATyaM',
  site: 'deb',
  bucket: 'site-media'
};
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
if (!window.supabase) { $('#err-accesso').textContent = 'Il pannello non riesce a collegarsi. Controllate la connessione e ricaricate la pagina.'; return; }
var sb = window.supabase.createClient(CFG.url, CFG.key, {auth: {persistSession: true, storageKey: 'pannello-' + CFG.site}});
var NB = ' ';
var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); };
var euro = function (v) { v = Number(v || 0); return (v % 1 ? v.toFixed(2).replace('.', ',') : String(v)) + NB + '€'; };
var urlFoto = function (u) { u = String(u || ''); return /^https?:/.test(u) ? u : location.origin + u; };
var toast = function (t, err) {
  $$('.toast').forEach(function (x) { x.remove(); });
  var d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = t;
  if (err) d.style.background = 'var(--err)';
  document.body.appendChild(d); setTimeout(function () { d.remove(); }, err ? 6000 : 2800);
};
var errore = function (e) {
  var m = (e && (e.message || e.error_description)) || String(e || '');
  if (/Invalid login/i.test(m)) return 'Utente o password non corretti.';
  if (/Failed to fetch|NetworkError/i.test(m)) return 'Connessione assente. Riprovate tra poco.';
  if (/row-level security|permission|non autorizzato/i.test(m)) return 'Questo account non può modificare il negozio.';
  if (/JWT|expired/i.test(m)) return 'La sessione è scaduta: uscite e rientrate.';
  if (/too large|exceeded/i.test(m)) return 'La foto è troppo grande: provate con un’altra.';
  if (e && e.nostro) return m;
  return 'Qualcosa non ha funzionato: ' + m;
};
var ok = function (r) { if (r.error) throw r.error; return r.data; };

/* ---------- accesso ---------- */
var entra = function () {
  $('#v-accesso').classList.add('nascosto'); $('#v-pannello').classList.remove('nascosto'); $('#b-esci').classList.remove('nascosto');
  apri('ordini');
};
$('#f-accesso').addEventListener('submit', function (e) {
  e.preventDefault();
  var b = $('#b-accedi'); b.disabled = true; b.textContent = 'Accesso…'; $('#err-accesso').textContent = '';
  var u = $('#email').value.trim().toLowerCase(); if (u.indexOf('@') === -1) u += '@websardegna.xyz';
  sb.auth.signInWithPassword({email: u, password: $('#password').value}).then(function (r) {
    if (r.error) throw r.error;
    return sb.from('site_editors').select('site').eq('site', CFG.site).then(ok);
  }).then(function (s) {
    if (!s || !s.length) { sb.auth.signOut(); var x = new Error('Questo account non gestisce il negozio DEB.'); x.nostro = true; throw x; }
    entra();
  }).catch(function (err) { $('#err-accesso').textContent = errore(err); })
    .then(function () { b.disabled = false; b.textContent = 'Accedi'; });
});
$('#b-esci').addEventListener('click', function () { sb.auth.signOut().then(function () { location.reload(); }); });
sb.auth.getSession().then(function (r) { if (r.data && r.data.session) entra(); });

/* ---------- schede ---------- */
var CATS = [];
var caricaCat = function () { return sb.from('deb_categories').select('*').order('ordine').then(ok).then(function (c) { CATS = c; return c; }); };
var apri = function (s) {
  $$('.schede button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-scheda') === s); });
  $('#contenuto').innerHTML = '<p class="caricamento">Caricamento…</p>';
  ({ordini: ordini, articoli: articoliLista, categorie: categorie, impostazioni: impostazioni})[s]();
};
$$('.schede button').forEach(function (b) { b.addEventListener('click', function () { apri(b.getAttribute('data-scheda')); }); });
var contaNuovi = function () {
  sb.from('deb_orders').select('id', {count: 'exact', head: true}).eq('stato', 'nuovo').then(function (r) { $('#n-nuovi').textContent = r.count || ''; });
};

/* ---------- ordini ---------- */
var STATI = {nuovo: 'Nuovo', pagato: 'Pagato', spedito: 'Spedito', completato: 'Completato', annullato: 'Annullato'};
var PAG = {carta: 'Carta / Postepay', paypal: 'PayPal', whatsapp: 'Da concordare su WhatsApp'};
var filtroOrd = 'aperti';
var ordini = function () {
  contaNuovi();
  var q = sb.from('deb_orders').select('*').order('created_at', {ascending: false}).limit(100);
  if (filtroOrd === 'aperti') q = q.in('stato', ['nuovo', 'pagato', 'spedito']);
  q.then(ok).then(function (lista) {
    var c = $('#contenuto');
    c.innerHTML = '<div class="testa-pan"><h1>Ordini</h1></div><div class="filtro-ord">' +
      ['aperti', 'tutti'].map(function (f) { return '<button type="button" data-f="' + f + '" aria-pressed="' + (filtroOrd === f) + '">' + (f === 'aperti' ? 'Da gestire' : 'Tutti') + '</button>'; }).join('') + '</div>' +
      (lista.length ? lista.map(schedaOrdine).join('') : '<p class="vuoto">Nessun ordine ' + (filtroOrd === 'aperti' ? 'da gestire' : '') + '. Quando qualcuno compra, lo trovate qui.</p>');
    $$('[data-f]', c).forEach(function (b) { b.addEventListener('click', function () { filtroOrd = b.getAttribute('data-f'); ordini(); }); });
    $$('select[data-stato]', c).forEach(function (s) {
      s.addEventListener('change', function () {
        sb.from('deb_orders').update({stato: s.value, updated_at: new Date().toISOString()}).eq('id', s.getAttribute('data-stato')).then(ok)
          .then(function () { toast('Ordine aggiornato: ' + STATI[s.value]); ordini(); }).catch(function (e) { toast(errore(e), true); });
      });
    });
    $$('[data-annulla]', c).forEach(function (b) {
      b.addEventListener('click', function () {
        if (!confirm('Annullare l’ordine? Gli articoli tornano in vendita sul sito.')) return;
        sb.rpc('deb_annulla_ordine', {oid: b.getAttribute('data-annulla')}).then(ok)
          .then(function () { toast('Ordine annullato, articoli di nuovo in vendita'); ordini(); }).catch(function (e) { toast(errore(e), true); });
      });
    });
  }).catch(function (e) { $('#contenuto').innerHTML = '<p class="avviso err">' + esc(errore(e)) + '</p>'; });
};
var schedaOrdine = function (o) {
  var d = new Date(o.created_at);
  var tel = o.telefono.replace(/[^\d+]/g, ''), wa = tel.replace(/^\+/, ''); if (/^3\d{8,9}$/.test(wa)) wa = '39' + wa;
  var ind = o.consegna === 'spedizione' ? esc(o.indirizzo) + ', ' + esc(o.cap) + ' ' + esc(o.citta) + (o.provincia ? ' (' + esc(o.provincia) + ')' : '') : 'Ritiro in negozio ad Anela';
  return '<article class="ord ' + o.stato + '"><div class="top"><div><span class="cod">' + esc(o.codice) + '</span> <span class="stato ' + o.stato + '">' + STATI[o.stato] + '</span></div>' +
    '<span class="data">' + d.toLocaleDateString('it-IT', {day: 'numeric', month: 'short'}) + ', ' + d.toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'}) + '</span></div>' +
    '<div class="righe-o">' + o.articoli.map(function (a) { return '<div><span>' + esc(a.titolo) + (a.qty > 1 ? ' ×' + a.qty : '') + '</span><span class="num">' + euro(a.prezzo * a.qty) + '</span></div>'; }).join('') +
    '<div><span class="mut">Spedizione</span><span class="num">' + (Number(o.spedizione) ? euro(o.spedizione) : (o.consegna === 'ritiro' ? 'Ritiro' : 'Gratis')) + '</span></div>' +
    '<div style="font-weight:700"><span>Totale</span><span class="num">' + euro(o.totale) + '</span></div></div>' +
    '<div class="cli"><b>' + esc(o.nome) + '</b> · ' + esc(o.telefono) + (o.email ? ' · ' + esc(o.email) : '') + '<br>' + ind + '<br><span class="mut">Pagamento: ' + PAG[o.pagamento] + '</span>' +
    (o.note ? '<br><span class="mut">Note: ' + esc(o.note) + '</span>' : '') + '</div>' +
    '<div class="azioni-o"><a class="btn-pic" target="_blank" rel="noopener" href="https://wa.me/' + wa + '?text=' + encodeURIComponent('Ciao ' + o.nome.split(' ')[0] + ', grazie per l’ordine ' + o.codice + ' su DEB!') + '">WhatsApp</a>' +
    '<a class="btn-pic" href="tel:' + esc(tel) + '">Chiama</a>' +
    (o.stato !== 'annullato' ? '<label class="sr-only" for="st-' + o.id + '">Stato</label><select id="st-' + o.id + '" data-stato="' + o.id + '">' + ['nuovo', 'pagato', 'spedito', 'completato'].map(function (s) { return '<option value="' + s + '"' + (s === o.stato ? ' selected' : '') + '>' + STATI[s] + '</option>'; }).join('') + '</select>' +
      '<button type="button" class="btn-pic pericolo" data-annulla="' + o.id + '">Annulla ordine</button>' : '') + '</div></article>';
};

/* ---------- articoli ---------- */
var ARTS = [], cerca = '';
var articoliLista = function () {
  Promise.all([caricaCat(), sb.from('deb_products').select('*').order('created_at', {ascending: false}).order('ordine').then(ok)]).then(function (r) {
    ARTS = r[1]; disegnaArticoli();
  }).catch(function (e) { $('#contenuto').innerHTML = '<p class="avviso err">' + esc(errore(e)) + '</p>'; });
};
var nomeCat = function (id) { var c = CATS.filter(function (x) { return x.id === id; })[0]; return c ? c.nome : 'Senza categoria'; };
var STATO_ART = {in_attesa: 'In attesa (bloccato)', disponibile: 'In vendita', venduto: 'Venduto', nascosto: 'Nascosto'};
var nomeCatLungo = function (id) {
  var c = CATS.filter(function (x) { return x.id === id; })[0]; if (!c) return 'Senza categoria';
  var p = c.parent_id ? CATS.filter(function (x) { return x.id === c.parent_id; })[0] : null;
  return (p ? p.nome + ' › ' : '') + c.nome;
};
var catOrdinati = function () {
  var out = [];
  var giro = function (pid, liv) {
    CATS.filter(function (c) { return (c.parent_id || null) === pid; }).forEach(function (c) {
      out.push({c: c, liv: liv});
      if (liv < 3) giro(c.id, liv + 1);
    });
  };
  giro(null, 0);
  return out;
};
var disegnaArticoli = function () {
  var c = $('#contenuto');
  var lista = ARTS.filter(function (a) { return !cerca || (a.titolo + ' ' + nomeCatLungo(a.categoria_id)).toLowerCase().indexOf(cerca) !== -1; });
  var bloccati = ARTS.filter(function (a) { return a.stato === 'in_attesa'; }).length;
  c.innerHTML = '<div class="testa-pan"><h1>Articoli <span class="mut num" style="font-size:18px">' + ARTS.filter(function (a) { return a.stato === 'disponibile'; }).length + ' in vendita' + (bloccati ? ' · ' + bloccati + ' da sbloccare' : '') + '</span></h1><button class="b1" type="button" id="b-nuovo">+ Nuovo articolo</button></div>' +
    '<label class="sr-only" for="cerca">Cerca</label><input class="cerca" id="cerca" type="search" placeholder="Cerca un articolo" value="' + esc(cerca) + '">' +
    '<div class="lista-art">' + lista.map(function (a) {
      return '<div class="riga-wrap"><button type="button" class="riga-art" data-id="' + a.id + '"><span class="ph">' + (a.foto[0] ? '<img src="' + esc(urlFoto(a.foto[0])) + '" alt="" loading="lazy">' : '') + '</span>' +
        '<span><span class="t">' + esc(a.titolo || '(senza titolo)') + '</span><br><span class="s">' + esc(nomeCatLungo(a.categoria_id)) + ' · ' + STATO_ART[a.stato] + (a.quantita > 1 ? ' · ' + a.quantita + ' pezzi' : '') + '</span></span>' +
        '<span class="num" style="font-weight:700">' + euro(a.prezzo) + '</span></button>' +
        '<button type="button" class="btn-pic' + (a.stato === 'in_attesa' ? ' pubblica' : '') + '" data-pub="' + a.id + '">' + (a.stato === 'in_attesa' ? 'Sblocca' : (a.stato === 'disponibile' ? 'Blocca' : 'Sblocca')) + '</button></div>';
    }).join('') + '</div>';
  $('#b-nuovo').addEventListener('click', function () { modulo(null); });
  var ci = $('#cerca'); ci.addEventListener('input', function () { cerca = ci.value.trim().toLowerCase(); var p = ci.selectionStart; disegnaArticoli(); var n = $('#cerca'); n.focus(); n.setSelectionRange(p, p); });
  $$('.riga-art', c).forEach(function (b) { b.addEventListener('click', function () { modulo(ARTS.filter(function (a) { return a.id === Number(b.getAttribute('data-id')); })[0]); }); });
  $$('[data-pub]', c).forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var id = Number(b.getAttribute('data-pub'));
      var a = ARTS.filter(function (x) { return x.id === id; })[0];
      var nuovoStato = a.stato === 'disponibile' ? 'in_attesa' : 'disponibile';
      b.disabled = true;
      sb.from('deb_products').update({stato: nuovoStato, updated_at: new Date().toISOString()}).eq('id', id).then(ok)
        .then(function () { toast(nuovoStato === 'disponibile' ? 'Articolo sbloccato: ora si vede sul sito' : 'Articolo bloccato: non si vede più sul sito'); articoliLista(); })
        .catch(function (err) { b.disabled = false; toast(errore(err), true); });
    });
  });
};
var CONDIZIONI = ['Nuovo', 'Nuovo con etichetta', 'Come nuovo', 'Ottime condizioni', 'Buone condizioni', 'Usato, con segni di usura', 'Da collezione, non testato'];
var modulo = function (a) {
  var nuovo = !a;
  a = a || {titolo: '', descrizione: '', prezzo: '', condizione: 'Buone condizioni', dettaglio: '', foto: [], quantita: 1, stato: 'in_attesa', categoria_id: ((CATS.filter(function (x) { return !x.parent_id; })[0] || CATS[0] || {}).id)};
  var fotos = (a.foto || []).slice();
  var c = $('#contenuto');
  c.innerHTML = '<div class="testa-pan"><button type="button" class="link-btn" id="b-indietro">← Tutti gli articoli</button></div>' +
    '<form class="modulo" id="f-art" novalidate><h1 style="font-size:26px">' + (nuovo ? 'Nuovo articolo' : 'Modifica articolo') + '</h1>' +
    '<div class="campo"><label>Foto <span class="mut" style="font-weight:400">(la prima è quella che si vede nel negozio)</span></label><div class="foto-ed" id="foto-ed"></div></div>' +
    '<div class="campo"><label for="a-titolo">Nome dell’articolo</label><input id="a-titolo" required maxlength="120" value="' + esc(a.titolo) + '" placeholder="Es. Lampada da tavolo in ottone"></div>' +
    '<div class="due"><div class="campo"><label for="a-prezzo">Prezzo (€)</label><input id="a-prezzo" required inputmode="decimal" value="' + esc(a.prezzo) + '" placeholder="15"></div>' +
    '<div class="campo"><label for="a-q">Pezzi disponibili</label><input id="a-q" type="number" min="0" max="999" value="' + esc(a.quantita) + '"></div></div>' +
    '<div class="campo"><label for="a-cat">Categoria</label><select id="a-cat">' + catOrdinati().map(function (x) { return '<option value="' + x.c.id + '"' + (x.c.id === a.categoria_id ? ' selected' : '') + '>' + esc((x.liv ? '— ' : '') + x.c.nome) + '</option>'; }).join('') + '</select></div>' +
    '<div class="campo"><label for="a-cond">Condizione</label><input id="a-cond" list="l-cond" value="' + esc(a.condizione) + '"><datalist id="l-cond">' + CONDIZIONI.map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist></div>' +
    '<div class="campo"><label for="a-det">Taglia o dettaglio <span class="mut" style="font-weight:400">(facoltativo)</span></label><input id="a-det" maxlength="80" value="' + esc(a.dettaglio) + '" placeholder="Es. Taglia M, 30×20 cm"></div>' +
    '<div class="campo"><label for="a-desc">Descrizione</label><textarea id="a-desc" maxlength="1500" style="min-height:130px">' + esc(a.descrizione) + '</textarea><p class="consiglio">Scrivete com’è davvero: condizioni, misure, difetti. Aiuta a vendere e a evitare resi.</p></div>' +
    '<div class="campo"><label for="a-stato">Sul sito</label><select id="a-stato">' + Object.keys(STATO_ART).map(function (s) { return '<option value="' + s + '"' + (s === a.stato ? ' selected' : '') + '>' + STATO_ART[s] + '</option>'; }).join('') + '</select><p class="consiglio">Lasciatelo su “In attesa” e l’articolo resta bloccato: dall’elenco potete sbloccarlo con un tocco quando è pronto.</p></div>' +
    '<div class="salva-barra"><button class="b1" type="submit" id="b-salva">' + (nuovo ? 'Salva articolo' : 'Salva modifiche') + '</button>' +
    (nuovo ? '' : '<button class="btn-pic pericolo" type="button" id="b-elimina">Elimina</button>') + '</div></form>';
  var disegnaFoto = function () {
    $('#foto-ed').innerHTML = fotos.map(function (f, i) {
      return '<figure><img src="' + esc(urlFoto(f)) + '" alt="">' + (i === 0 ? '<span class="prima">Copertina</span>' : '') +
        '<div class="ctr">' + (i > 0 ? '<button type="button" data-prima="' + i + '" aria-label="Usa come copertina">★</button>' : '') + '<button type="button" data-togli="' + i + '" aria-label="Togli foto">✕</button></div></figure>';
    }).join('') + (fotos.length < 8 ? '<label class="aggiungi-foto">+ Aggiungi foto<input type="file" accept="image/*" multiple id="in-foto"></label>' : '');
    $$('[data-togli]').forEach(function (b) { b.addEventListener('click', function () { fotos.splice(Number(b.getAttribute('data-togli')), 1); disegnaFoto(); }); });
    $$('[data-prima]').forEach(function (b) { b.addEventListener('click', function () { var i = Number(b.getAttribute('data-prima')); fotos.unshift(fotos.splice(i, 1)[0]); disegnaFoto(); }); });
    var inp = $('#in-foto');
    if (inp) inp.addEventListener('change', function () {
      var files = Array.prototype.slice.call(inp.files).slice(0, 8 - fotos.length);
      if (!files.length) return;
      toast('Caricamento di ' + files.length + ' foto…');
      files.reduce(function (p, f) { return p.then(function () { return carica(f).then(function (u) { fotos.push(u); disegnaFoto(); }); }); }, Promise.resolve())
        .then(function () { toast('Foto caricate'); }).catch(function (e) { toast(errore(e), true); });
    });
  };
  disegnaFoto();
  $('#b-indietro').addEventListener('click', articoliLista);
  $('#f-art').addEventListener('submit', function (e) {
    e.preventDefault();
    var prezzo = Number(String($('#a-prezzo').value).replace(',', '.'));
    if (!$('#a-titolo').value.trim()) { toast('Scrivete il nome dell’articolo.', true); $('#a-titolo').focus(); return; }
    if (!(prezzo >= 0) || $('#a-prezzo').value === '') { toast('Scrivete un prezzo valido, es. 15 o 12,50.', true); $('#a-prezzo').focus(); return; }
    if (!fotos.length && !confirm('L’articolo non ha foto. Pubblicarlo lo stesso?')) return;
    var q = Math.max(0, parseInt($('#a-q').value, 10) || 0);
    var stato = $('#a-stato').value;
    if (stato === 'disponibile' && q === 0) q = 1;
    var dati = {titolo: $('#a-titolo').value.trim(), prezzo: prezzo, quantita: q, categoria_id: Number($('#a-cat').value), condizione: $('#a-cond').value.trim(),
      dettaglio: $('#a-det').value.trim(), descrizione: $('#a-desc').value.trim(), stato: stato, foto: fotos, updated_at: new Date().toISOString()};
    var b = $('#b-salva'); b.disabled = true;
    (nuovo ? sb.from('deb_products').insert(dati) : sb.from('deb_products').update(dati).eq('id', a.id)).then(ok)
      .then(function () { toast(nuovo ? (dati.stato === 'disponibile' ? 'Articolo pubblicato' : 'Articolo salvato e bloccato') : 'Modifiche salvate'); articoliLista(); })
      .catch(function (err) { b.disabled = false; toast(errore(err), true); });
  });
  var bel = $('#b-elimina');
  if (bel) bel.addEventListener('click', function () {
    if (!confirm('Eliminare “' + a.titolo + '”? Se è solo venduto, meglio impostarlo come “Venduto”.')) return;
    sb.from('deb_products').delete().eq('id', a.id).then(ok).then(function () { toast('Articolo eliminato'); articoliLista(); }).catch(function (err) { toast(errore(err), true); });
  });
};
var carica = function (file) {
  return new Promise(function (res, rej) {
    var img = new Image(), u = URL.createObjectURL(file);
    img.onload = function () {
      var max = 1600, s = Math.min(1, max / Math.max(img.width, img.height));
      var c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      c.toBlob(function (b) { if (b) res(b); else { var e = new Error('Questa foto non si riesce a leggere: provate con un’altra.'); e.nostro = true; rej(e); } }, 'image/jpeg', 0.84);
    };
    img.onerror = function () { var e = new Error('Questa foto non si riesce a leggere: provate con un’altra.'); e.nostro = true; rej(e); };
    img.src = u;
  }).then(function (blob) {
    var path = CFG.site + '/articoli/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
    return sb.storage.from(CFG.bucket).upload(path, blob, {contentType: 'image/jpeg', cacheControl: '31536000', upsert: false}).then(function (r) {
      if (r.error) throw r.error;
      return CFG.url + '/storage/v1/object/public/' + CFG.bucket + '/' + path;
    });
  });
};

/* ---------- categorie ---------- */
var categorie = function () {
  Promise.all([caricaCat(), sb.from('deb_products').select('categoria_id').then(ok)]).then(function (r) {
    var uso = {}; r[1].forEach(function (p) { uso[p.categoria_id] = (uso[p.categoria_id] || 0) + 1; });
    var c = $('#contenuto');
    var ord = catOrdinati();
    var sib = function (x) { return CATS.filter(function (y) { return (y.parent_id || null) === (x.parent_id || null); }).sort(function (a, b) { return a.ordine - b.ordine; }); };
    c.innerHTML = '<div class="testa-pan"><h1>Categorie</h1></div><p class="mut" style="margin-bottom:10px">Sul sito si vedono solo le categorie con almeno un articolo in vendita. Le sottocategorie stanno sotto il reparto scelto.</p>' +
      ord.map(function (x) {
        var cat = x.c, fratelli = sib(cat), pos = fratelli.indexOf(cat);
        var padre = cat.parent_id ? CATS.filter(function (y) { return y.id === cat.parent_id; })[0] : null;
        return '<div class="riga-cat"><div><label class="sr-only" for="cat-' + cat.id + '">Nome</label><input type="text" id="cat-' + cat.id + '" data-nome="' + cat.id + '" value="' + esc(cat.nome) + '"' + (x.liv ? ' style="margin-left:' + (x.liv * 18) + 'px;max-width:calc(100% - ' + (x.liv * 18) + 'px)"' : '') + '><div class="consiglio"' + (x.liv ? ' style="margin-left:' + (x.liv * 18) + 'px"' : '') + '>' + (padre ? 'Sottocategoria di ' + esc(padre.nome) + ' · ' : '') + (uso[cat.id] || 0) + ' articoli</div></div>' +
          '<div class="ctr"><button type="button" data-muovi="' + cat.id + '|-1" aria-label="Sposta su"' + (pos === 0 ? ' disabled' : '') + '>↑</button><button type="button" data-muovi="' + cat.id + '|1" aria-label="Sposta giù"' + (pos === fratelli.length - 1 ? ' disabled' : '') + '>↓</button>' +
          (uso[cat.id] || CATS.some(function (y) { return y.parent_id === cat.id; }) ? '' : '<button type="button" data-del="' + cat.id + '" aria-label="Elimina categoria">✕</button>') + '</div></div>';
      }).join('') +
      '<form id="f-cat" class="riga-cat" style="border:0;margin-top:10px"><div><label class="sr-only" for="cat-nuova">Nuova categoria</label><input type="text" id="cat-nuova" placeholder="Nuova categoria, es. Arredamento" maxlength="60"><label for="cat-padre" class="consiglio" style="display:block;margin-top:8px">Dentro quale reparto?</label><select id="cat-padre" style="min-height:46px;border:1.5px solid var(--line);border-radius:var(--r);padding:0 10px;background:#fff;font:inherit"><option value="">Nessuno (reparto principale)</option>' + radiciCat().map(function (x) { return '<option value="' + x.id + '">' + esc(x.nome) + '</option>'; }).join('') + '</select></div><button class="b1" type="submit">Aggiungi</button></form>';
    $$('[data-nome]', c).forEach(function (inp) {
      inp.addEventListener('change', function () {
        var v = inp.value.trim(); if (!v) return;
        sb.from('deb_categories').update({nome: v}).eq('id', Number(inp.getAttribute('data-nome'))).then(ok).then(function () { toast('Nome salvato'); }).catch(function (e) { toast(errore(e), true); });
      });
    });
    var muovi = function (id, dir) {
      var cat = CATS.filter(function (x) { return x.id === id; })[0]; if (!cat) return;
      var fratelli = sib(cat), k = fratelli.indexOf(cat), j = k + dir;
      if (j < 0 || j >= fratelli.length) return;
      var a = fratelli[k], b = fratelli[j];
      Promise.all([sb.from('deb_categories').update({ordine: j}).eq('id', a.id), sb.from('deb_categories').update({ordine: k}).eq('id', b.id)])
        .then(function (rr) { rr.forEach(ok); categorie(); })
        .catch(function (e) { toast(errore(e), true); });
    };
    $$('[data-muovi]', c).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-muovi').split('|');
        muovi(Number(v[0]), Number(v[1]));
      });
    });
    $$('[data-del]', c).forEach(function (b) {
      b.addEventListener('click', function () {
        if (!confirm('Eliminare questa categoria vuota?')) return;
        sb.from('deb_categories').delete().eq('id', Number(b.getAttribute('data-del'))).then(ok).then(categorie).catch(function (e) { toast(errore(e), true); });
      });
    });
    $('#f-cat').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#cat-nuova').value.trim(); if (!v) return;
      var padre = $('#cat-padre').value;
      var slug = v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36).slice(-3);
      var ordine = CATS.filter(function (x) { return (x.parent_id || null) === (padre ? Number(padre) : null); }).length;
      sb.from('deb_categories').insert({nome: v, slug: slug, ordine: ordine, parent_id: padre ? Number(padre) : null}).then(ok).then(function () { toast('Categoria aggiunta'); categorie(); }).catch(function (e2) { toast(errore(e2), true); });
    });
  }).catch(function (e) { $('#contenuto').innerHTML = '<p class="avviso err">' + esc(errore(e)) + '</p>'; });
};
var radiciCat = function () { return CATS.filter(function (x) { return !x.parent_id; }).sort(function (a, b) { return a.ordine - b.ordine; }); };

/* ---------- spedizione ---------- */
var impostazioni = function () {
  sb.from('deb_settings').select('*').then(ok).then(function (r) {
    var v = {}; r.forEach(function (x) { v[x.key] = x.value; });
    var c = $('#contenuto');
    c.innerHTML = '<div class="testa-pan"><h1>Spedizione e contatti</h1></div><form class="modulo" id="f-imp">' +
      '<div class="due"><div class="campo"><label for="i-costo">Costo spedizione (€)</label><input id="i-costo" inputmode="decimal" value="' + esc(v.spedizione_costo) + '"></div>' +
      '<div class="campo"><label for="i-soglia">Gratis da (€)</label><input id="i-soglia" inputmode="decimal" value="' + esc(v.soglia_gratis) + '"></div></div>' +
      '<p class="consiglio">Il costo vale per ordine. Il ritiro ad Anela è sempre gratis.</p>' +
      '<div class="campo"><label for="i-wa">Numero WhatsApp per gli ordini</label><input id="i-wa" inputmode="tel" value="' + esc(v.whatsapp) + '"></div>' +
      '<div class="salva-barra"><button class="b1" type="submit">Salva</button></div></form>';
    $('#f-imp').addEventListener('submit', function (e) {
      e.preventDefault();
      var costo = Number($('#i-costo').value.replace(',', '.')), soglia = Number($('#i-soglia').value.replace(',', '.'));
      var wa = $('#i-wa').value.replace(/\D/g, ''); if (/^3\d{8,9}$/.test(wa)) wa = '39' + wa;
      if (!(costo >= 0) || !(soglia >= 0) || wa.length < 10) { toast('Controllate i valori: numeri senza lettere.', true); return; }
      sb.from('deb_settings').upsert([{key: 'spedizione_costo', value: String(costo)}, {key: 'soglia_gratis', value: String(soglia)}, {key: 'whatsapp', value: wa}]).then(ok)
        .then(function () { toast('Salvato: il sito si aggiorna subito'); }).catch(function (e2) { toast(errore(e2), true); });
    });
  }).catch(function (e) { $('#contenuto').innerHTML = '<p class="avviso err">' + esc(errore(e)) + '</p>'; });
};
})();
