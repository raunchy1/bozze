/* Negozio dell'usato DEB — vitrina, borsa e ordine. Dati su Supabase (tabelle deb_*). */
(function () {
'use strict';
var CFG = {
  url: 'https://ntcofaxoxjvzovkqgypy.supabase.co',
  key: 'sb_publishable_tCgLTY5zUUG2M1wsUi0iSw_ErBATyaM',
  wa: '393890434162'
};
var PAGINA = document.body.getAttribute('data-pagina');
var app = document.getElementById('app');
var NB = ' ';

/* ---------- utilità ---------- */
var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); };
var euro = function (v) { v = Number(v || 0); return (v % 1 ? v.toFixed(2).replace('.', ',') : String(v)) + NB + '€'; };
var param = function (k) { return new URLSearchParams(location.search).get(k); };
var foto = function (u) { u = String(u || ''); return u; };
var toast = function (t) {
  document.querySelectorAll('.toast').forEach(function (x) { x.remove(); });
  var d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = t;
  document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2800);
};
var api = function (path, opz) {
  opz = opz || {};
  return fetch(CFG.url + '/rest/v1/' + path, {
    method: opz.method || 'GET',
    headers: {apikey: CFG.key, Authorization: 'Bearer ' + CFG.key, 'Content-Type': 'application/json'},
    body: opz.body ? JSON.stringify(opz.body) : undefined,
    cache: 'no-store'
  }).then(function (r) {
    return r.text().then(function (t) {
      var j = t ? JSON.parse(t) : null;
      if (!r.ok) { var e = new Error((j && (j.message || j.hint)) || ('Errore ' + r.status)); e.dati = j; throw e; }
      return j;
    });
  });
};
var IMPOSTAZIONI = {spedizione_costo: 7, soglia_gratis: 70};
var impostazioni = function () {
  return api('deb_settings?select=key,value').then(function (r) {
    (r || []).forEach(function (x) { if (x.key === 'whatsapp') CFG.wa = x.value.replace(/\D/g, ''); else IMPOSTAZIONI[x.key] = Number(x.value); });
  }).catch(function () {});
};
var categorie = function () { return api('deb_categories?select=id,nome,slug,ordine&attivo=eq.true&order=ordine.asc'); };
var CAMPI = 'id,titolo,descrizione,prezzo,condizione,dettaglio,foto,quantita,stato,categoria_id,ordine,created_at';
var articoli = function (filtro) { return api('deb_products?select=' + CAMPI + (filtro || '') + '&order=stato.asc,created_at.desc,ordine.asc'); };
var disponibile = function (a) { return a.stato === 'disponibile' && a.quantita > 0; };

/* ---------- borsa (sul telefono del cliente) ---------- */
var CHIAVE = 'deb-borsa-v1';
var borsa = function () { try { return JSON.parse(localStorage.getItem(CHIAVE)) || []; } catch (e) { return []; } };
var salvaBorsa = function (b) { localStorage.setItem(CHIAVE, JSON.stringify(b)); aggiornaContatore(); };
var aggiungi = function (id, qty) {
  var b = borsa(); var r = b.filter(function (x) { return x.id === id; })[0];
  if (r) r.qty = Math.min(20, r.qty + (qty || 1)); else b.push({id: id, qty: qty || 1});
  salvaBorsa(b);
};
var aggiornaContatore = function () {
  var n = borsa().reduce(function (s, x) { return s + x.qty; }, 0);
  document.querySelectorAll('[data-contatore]').forEach(function (el) { el.textContent = n; el.classList.toggle('pieno', n > 0); });
};
var spedizione = function (sub, consegna) {
  if (consegna === 'ritiro') return 0;
  return sub >= IMPOSTAZIONI.soglia_gratis ? 0 : IMPOSTAZIONI.spedizione_costo;
};

/* ---------- pezzi di pagina ---------- */
var scheda = function (a) {
  var esaurito = !disponibile(a);
  var f = (a.foto && a.foto[0]) || '';
  return '<a class="art' + (esaurito ? ' esaurito' : '') + '" href="articolo.html?id=' + a.id + '">' +
    '<div class="ph">' + (f ? '<img src="' + esc(foto(f)) + '" alt="' + esc(a.titolo) + '" loading="lazy" decoding="async" width="600" height="600">' : '') +
    (esaurito ? '<span class="venduto">Venduto</span>' : '') + '</div>' +
    '<div class="t">' + esc(a.titolo) + '</div><div class="p num">' + euro(a.prezzo) + '</div><div class="c">' + esc(a.condizione) + '</div></a>';
};
var errore = function (msg) { app.innerHTML = '<div class="w"><p class="caricamento">' + esc(msg) + '</p></div>'; };
var errRete = 'Non riusciamo a caricare gli articoli. Controllate la connessione e ricaricate la pagina.';

/* ---------- pagine ---------- */
var home = function () {
  Promise.all([categorie(), articoli(), impostazioni()]).then(function (r) {
    var cats = r[0], arts = r[1];
    var conta = {}; arts.forEach(function (a) { if (disponibile(a)) conta[a.categoria_id] = (conta[a.categoria_id] || 0) + 1; });
    var disp = arts.filter(disponibile);
    var mos = disp.slice(0, 4);
    document.getElementById('mosaico').innerHTML = mos.map(function (a) {
      return '<a href="articolo.html?id=' + a.id + '" aria-label="' + esc(a.titolo) + '"><img src="' + esc(foto(a.foto[0])) + '" alt="" width="600" height="600"></a>';
    }).join('');
    document.getElementById('fatti').innerHTML =
      '<div><b class="num">' + euro(IMPOSTAZIONI.spedizione_costo) + '</b><span>Spedizione</span></div>' +
      '<div><b class="num">' + euro(IMPOSTAZIONI.soglia_gratis) + '</b><span>Da qui, è gratis</span></div>' +
      '<div><b>Anela</b><span>Ritiro in negozio</span></div>';
    document.getElementById('reparti').innerHTML = cats.filter(function (c) { return conta[c.id]; }).map(function (c) {
      return '<a href="catalogo.html?c=' + encodeURIComponent(c.slug) + '"><span>' + esc(c.nome) + '</span><span class="mut num">' + conta[c.id] + NB + '›</span></a>';
    }).join('');
    document.getElementById('arrivi').innerHTML = disp.slice(0, 8).map(scheda).join('');
    document.getElementById('n-articoli').textContent = disp.length + ' articoli disponibili';
  }).catch(function () { document.getElementById('arrivi').innerHTML = '<p class="vuoto">' + errRete + '</p>'; });
};

var catalogo = function () {
  var slug = param('c');
  Promise.all([categorie(), articoli()]).then(function (r) {
    var cats = r[0], arts = r[1];
    var cat = cats.filter(function (c) { return c.slug === slug; })[0];
    var lista = cat ? arts.filter(function (a) { return a.categoria_id === cat.id; }) : arts;
    var titolo = cat ? cat.nome : 'Tutti gli articoli';
    document.title = titolo + ' · Negozio dell’usato DEB';
    var conCat = cats.filter(function (c) { return arts.some(function (a) { return a.categoria_id === c.id; }); });
    var nDisp = lista.filter(disponibile).length;
    app.innerHTML = '<div class="w"><div class="briciole"><a href="./">Home</a> › ' + esc(titolo) + '</div>' +
      '<h1 class="tit-pag">' + esc(titolo) + '</h1>' +
      '<div class="filtri"><nav aria-label="Reparti"><a href="catalogo.html"' + (!cat ? ' aria-current="page"' : '') + '>Tutti</a>' +
      conCat.map(function (c) { return '<a href="catalogo.html?c=' + encodeURIComponent(c.slug) + '"' + (cat && c.id === cat.id ? ' aria-current="page"' : '') + '>' + esc(c.nome) + '</a>'; }).join('') +
      '</nav><span class="mut num" style="font-size:14px;white-space:nowrap">' + nDisp + ' disponibili</span></div>' +
      (lista.length ? '<div class="griglia">' + lista.map(scheda).join('') + '</div>' : '<p class="vuoto">In questo reparto per ora non ci sono articoli. Torna a trovarci presto.</p>') + '</div>';
  }).catch(function () { errore(errRete); });
};

var articolo = function () {
  var id = Number(param('id'));
  Promise.all([api('deb_products?select=' + CAMPI + '&id=eq.' + id), categorie(), impostazioni()]).then(function (r) {
    var a = r[0] && r[0][0];
    if (!a) return errore('Questo articolo non c’è più. Forse è stato venduto: guarda gli altri nel negozio.');
    var cat = r[1].filter(function (c) { return c.id === a.categoria_id; })[0];
    document.title = a.titolo + ' · Negozio dell’usato DEB';
    var md = document.querySelector('meta[name=description]'); if (md) md.content = a.descrizione.slice(0, 155);
    var disp = disponibile(a);
    var fotos = (a.foto || []).filter(Boolean);
    app.innerHTML = '<div class="w"><div class="scheda"><div class="galleria">' +
      '<div class="grande">' + (fotos[0] ? '<img id="foto-grande" src="' + esc(foto(fotos[0])) + '" alt="' + esc(a.titolo) + '" width="900" height="900">' : '') + '</div>' +
      (fotos.length > 1 ? '<div class="miniature">' + fotos.map(function (f, i) {
        return '<button type="button" data-foto="' + esc(foto(f)) + '" aria-pressed="' + (i === 0) + '" aria-label="Foto ' + (i + 1) + '"><img src="' + esc(foto(f)) + '" alt="" width="136" height="136"></button>';
      }).join('') + '</div>' : '') + '</div>' +
      '<div class="info"><div class="mut" style="font-size:14px">' + (cat ? '<a href="catalogo.html?c=' + encodeURIComponent(cat.slug) + '">' + esc(cat.nome) + '</a>' : '') + '</div>' +
      '<h1>' + esc(a.titolo) + '</h1><div class="prezzo num">' + euro(a.prezzo) + '</div>' +
      '<p class="desc">' + esc(a.descrizione) + '</p>' +
      '<div class="righe"><div><span>Condizione</span><span>' + esc(a.condizione) + '</span></div>' +
      (a.dettaglio ? '<div><span>Dettagli</span><span>' + esc(a.dettaglio) + '</span></div>' : '') +
      '<div><span>Spedizione</span><span class="num">' + euro(IMPOSTAZIONI.spedizione_costo) + ', gratis da ' + euro(IMPOSTAZIONI.soglia_gratis) + '</span></div>' +
      '<div><span>Ritiro</span><span>In negozio ad Anela</span></div></div>' +
      '<div class="azioni-art">' + (disp ? '<button type="button" class="b1" id="aggiungi">Aggiungi alla borsa</button>' : '<button type="button" class="b1" disabled>Venduto</button>') +
      '<a class="b2" target="_blank" rel="noopener" href="https://wa.me/' + CFG.wa + '?text=' + encodeURIComponent('Ciao! Mi interessa: ' + a.titolo + ' (' + euro(a.prezzo) + ') — ' + location.href) + '">Chiedi su WhatsApp</a></div>' +
      '<div id="msg"></div></div></div>' +
      '<section class="sez" id="simili"></section></div>';
    document.querySelectorAll('.miniature button').forEach(function (b) {
      b.addEventListener('click', function () {
        document.getElementById('foto-grande').src = b.getAttribute('data-foto');
        document.querySelectorAll('.miniature button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      });
    });
    var bt = document.getElementById('aggiungi');
    if (bt) bt.addEventListener('click', function () {
      var gia = borsa().filter(function (x) { return x.id === a.id; })[0];
      if (gia && gia.qty >= a.quantita) {
        document.getElementById('msg').innerHTML = '<p class="avviso">È già nella tua borsa. <a href="borsa.html">Vai alla borsa</a></p>'; return;
      }
      aggiungi(a.id, 1);
      document.getElementById('msg').innerHTML = '<p class="avviso ok">Aggiunto alla borsa. <a href="borsa.html">Vai alla borsa</a></p>';
    });
    articoli('&categoria_id=eq.' + a.categoria_id + '&id=neq.' + a.id + '&stato=eq.disponibile&limit=4').then(function (s) {
      if (!s.length) return;
      document.getElementById('simili').innerHTML = '<div class="testa-sez"><h2>Dallo stesso reparto</h2></div><div class="griglia">' + s.map(scheda).join('') + '</div>';
    }).catch(function () {});
  }).catch(function () { errore(errRete); });
};

var caricaBorsa = function () {
  var b = borsa();
  if (!b.length) return Promise.resolve([]);
  return api('deb_products?select=' + CAMPI + '&id=in.(' + b.map(function (x) { return x.id; }).join(',') + ')').then(function (arts) {
    var righe = [];
    b.forEach(function (x) {
      var a = arts.filter(function (y) { return y.id === x.id; })[0];
      if (a) righe.push({a: a, qty: Math.min(x.qty, Math.max(1, a.quantita))});
    });
    return righe;
  });
};
var riepilogo = function (righe, consegna) {
  var ok = righe.filter(function (r) { return disponibile(r.a); });
  var sub = ok.reduce(function (s, r) { return s + Number(r.a.prezzo) * r.qty; }, 0);
  var sped = spedizione(sub, consegna);
  var manca = Math.max(0, IMPOSTAZIONI.soglia_gratis - sub);
  var pct = Math.min(100, Math.round(sub / IMPOSTAZIONI.soglia_gratis * 100));
  return {sub: sub, sped: sped, tot: sub + sped, html:
    (consegna === 'ritiro' ? '' : '<div class="barra-sped"><div style="font-weight:600">' + (manca > 0 ? 'Ti mancano ' + euro(manca) + ' per la spedizione gratuita' : 'Spedizione gratuita sbloccata') + '</div>' +
    '<div class="tr"><div style="width:' + pct + '%"></div></div><div class="mut" style="font-size:14px">Sopra i ' + euro(IMPOSTAZIONI.soglia_gratis) + ' la spedizione in Italia è gratis.</div></div>') +
    '<div class="tot"><div><span class="mut">Articoli</span><span class="num">' + euro(sub) + '</span></div>' +
    '<div><span class="mut">' + (consegna === 'ritiro' ? 'Ritiro ad Anela' : 'Spedizione') + '</span><span class="num">' + (sped ? euro(sped) : 'Gratis') + '</span></div>' +
    '<div class="grande"><span>Totale</span><span class="num">' + euro(sub + sped) + '</span></div></div>'};
};

var paginaBorsa = function () {
  Promise.all([caricaBorsa(), impostazioni()]).then(function (r) {
    var righe = r[0];
    if (!righe.length) {
      app.innerHTML = '<div class="w"><h1 class="tit-pag" style="padding-top:22px">La tua borsa</h1><p class="vuoto">La borsa è vuota.</p><a class="b1" href="catalogo.html">Sfoglia gli articoli</a></div>';
      return;
    }
    var rs = riepilogo(righe, 'spedizione');
    var nonDisp = righe.filter(function (x) { return !disponibile(x.a); });
    app.innerHTML = '<div class="w"><h1 class="tit-pag" style="padding-top:22px">La tua borsa</h1><div class="colonne" style="margin-top:12px"><div style="border-top:1px solid var(--line)">' +
      righe.map(function (x) {
        var a = x.a, f = (a.foto && a.foto[0]) || '';
        return '<div class="riga-borsa"><a class="ph" href="articolo.html?id=' + a.id + '">' + (f ? '<img src="' + esc(foto(f)) + '" alt="" width="168" height="168">' : '') + '</a>' +
          '<div><a class="t" href="articolo.html?id=' + a.id + '">' + esc(a.titolo) + '</a><div class="mut" style="font-size:14px;margin-top:4px">' +
          (disponibile(a) ? esc(a.condizione) : '<span style="color:var(--err)">Non più disponibile</span>') + (x.qty > 1 ? ' · ' + x.qty + ' pezzi' : '') + '</div>' +
          '<button type="button" class="link-btn" data-togli="' + a.id + '">Rimuovi</button></div><div class="num" style="font-weight:700">' + euro(Number(a.prezzo) * x.qty) + '</div></div>';
      }).join('') + '</div>' +
      '<div class="riepilogo">' + (nonDisp.length ? '<p class="avviso err">Qualcuno ha appena acquistato ' + (nonDisp.length > 1 ? 'alcuni articoli' : 'un articolo') + ' della tua borsa: rimuovilo per continuare.</p>' : '') +
      rs.html + '<div style="display:grid;gap:10px;margin-top:8px"><a class="b1' + (nonDisp.length ? '" aria-disabled="true" style="opacity:.55;pointer-events:none' : '') + '" href="ordine.html">Procedi all’ordine</a><a class="b2" href="catalogo.html">Continua a guardare</a></div>' +
      '<div class="fid"><div><span>Pagamento</span><span class="mut">Carta, Postepay, PayPal</span></div><div><span>Diritto di recesso</span><span class="mut">14 giorni</span></div><div><span>Domande?</span><a class="mut" href="https://wa.me/' + CFG.wa + '">WhatsApp 389 043 4162</a></div></div></div></div></div>';
    document.querySelectorAll('[data-togli]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = Number(b.getAttribute('data-togli'));
        salvaBorsa(borsa().filter(function (x) { return x.id !== id; })); paginaBorsa();
      });
    });
  }).catch(function () { errore(errRete); });
};

var paginaOrdine = function () {
  Promise.all([caricaBorsa(), impostazioni()]).then(function (r) {
    var righe = r[0].filter(function (x) { return disponibile(x.a); });
    if (!righe.length) { location.href = 'borsa.html'; return; }
    var form = document.getElementById('f-ordine');
    var box = document.getElementById('riep');
    var aggiorna = function () {
      var cons = form.consegna.value;
      document.getElementById('indirizzo').hidden = cons !== 'spedizione';
      ['indirizzo', 'cap', 'citta'].forEach(function (k) { form[k === 'indirizzo' ? 'indirizzo' : k].required = cons === 'spedizione'; });
      var rs = riepilogo(righe, cons);
      box.innerHTML = '<h2 style="font-size:22px;margin-bottom:10px">Il tuo ordine</h2>' + righe.map(function (x) {
        return '<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--line);font-size:15px"><span>' + esc(x.a.titolo) + (x.qty > 1 ? ' ×' + x.qty : '') + '</span><span class="num">' + euro(Number(x.a.prezzo) * x.qty) + '</span></div>';
      }).join('') + rs.html;
      document.getElementById('b-invia').textContent = 'Conferma ordine · ' + euro(rs.tot);
    };
    form.addEventListener('change', aggiorna); aggiorna();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('msg-ordine'); msg.innerHTML = '';
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var b = document.getElementById('b-invia'); b.disabled = true; var testo = b.textContent; b.textContent = 'Invio dell’ordine…';
      var dati = {
        nome: form.nome.value, telefono: form.telefono.value, email: form.email.value,
        consegna: form.consegna.value, indirizzo: form.indirizzo.value, cap: form.cap.value, citta: form.citta.value, provincia: form.provincia.value,
        note: form.note.value, pagamento: form.pagamento.value,
        articoli: righe.map(function (x) { return {id: x.a.id, qty: x.qty}; })
      };
      api('rpc/deb_crea_ordine', {method: 'POST', body: {p: dati}}).then(function (o) {
        sessionStorage.setItem('deb-ultimo-ordine', JSON.stringify(Object.assign({}, o, {pagamento: dati.pagamento, nome: dati.nome})));
        salvaBorsa([]);
        location.href = 'grazie.html?c=' + encodeURIComponent(o.codice);
      }).catch(function (err) {
        b.disabled = false; b.textContent = testo;
        var m = err.message || '';
        var t = /non_disponibile:(.*)/.test(m) ? '“' + m.split('non_disponibile:')[1] + '” è appena stato venduto. Torna alla borsa e rimuovilo.' :
          /indirizzo/.test(m) ? 'Controlla indirizzo, CAP (5 cifre) e città.' :
          /dati mancanti/.test(m) ? 'Controlla nome e numero di telefono.' :
          /Failed to fetch|NetworkError/.test(m) ? 'Connessione assente: riprova tra poco.' : 'L’ordine non è partito: riprova o scrivici su WhatsApp.';
        msg.innerHTML = '<p class="avviso err" role="alert">' + esc(t) + '</p>';
      });
    });
  }).catch(function () { errore(errRete); });
};

var paginaGrazie = function () {
  var codice = param('c') || '';
  var o = null; try { o = JSON.parse(sessionStorage.getItem('deb-ultimo-ordine')); } catch (e) {}
  if (!o || o.codice !== codice) o = {codice: codice};
  var righe = (o.articoli || []).map(function (x) { return '• ' + x.titolo + (x.qty > 1 ? ' ×' + x.qty : '') + ' — ' + euro(x.prezzo * x.qty); }).join('\n');
  var testoWa = 'Ciao! Ho fatto l’ordine ' + o.codice + ' sul sito.' + (righe ? '\n' + righe + '\nTotale: ' + euro(o.totale) : '') + (o.consegna === 'ritiro' ? '\nPasso a ritirarlo ad Anela.' : '');
  var pag = o.pagamento === 'carta' ? 'con carta o Postepay' : o.pagamento === 'paypal' ? 'con PayPal' : '';
  app.innerHTML = '<div class="w conferma"><div class="mut">Ordine ricevuto</div><div class="codice">' + esc(o.codice) + '</div>' +
    '<h1 style="font-size:30px;margin-top:12px">Grazie' + (o.nome ? ', ' + esc(o.nome.split(' ')[0]) : '') + '!</h1>' +
    '<p style="margin-top:10px">Abbiamo messo da parte gli articoli per te. ' + (o.totale != null ? 'Totale: <b class="num">' + euro(o.totale) + '</b>' + (o.spedizione ? ' (spedizione inclusa)' : '') + '.' : '') + '</p>' +
    (pag ? '<p class="avviso" style="margin-top:16px">Il pagamento online ' + pag + ' è in attivazione su questo sito. Per ora completa l’ordine su WhatsApp: ti mandiamo noi il link per pagare.</p>' : '') +
    '<div style="display:grid;gap:10px;margin-top:20px;max-width:420px"><a class="b1" target="_blank" rel="noopener" href="https://wa.me/' + CFG.wa + '?text=' + encodeURIComponent(testoWa) + '">Conferma su WhatsApp</a><a class="b2" href="./">Torna al negozio</a></div>' +
    '<p class="mut" style="margin-top:18px;font-size:15px">Conserva il codice ' + esc(o.codice) + ': ti serve se ci scrivi.</p></div>';
};

aggiornaContatore();
({home: home, catalogo: catalogo, articolo: articolo, borsa: paginaBorsa, ordine: paginaOrdine, grazie: paginaGrazie}[PAGINA] || function () {})();
document.querySelectorAll('[data-anno]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
