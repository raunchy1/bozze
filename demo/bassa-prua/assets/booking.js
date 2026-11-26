// Domu Prexada: secțiunea de rezervare (datele compun mesajul WhatsApp / email)
const form = document.getElementById('book-form');
if (form) {
  const inEl = form.querySelector('#book-in');
  const outEl = form.querySelector('#book-out');
  const gEl = form.querySelector('#book-g');
  const waEl = form.querySelector('#book-wa');
  const mailEl = form.querySelector('#book-mail');
  const mailtoBase = form.getAttribute('data-mailto') || '';
  const rawWa = waEl ? waEl.href : '';

  const fmt = (v) => {
    if (!v) return '—';
    const [y, m, d] = v.split('-');
    return `${d}/${m}/${y}`;
  };

  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  if (inEl) inEl.min = iso(today);
  if (outEl) outEl.min = iso(today);

  if (inEl && outEl) {
    inEl.addEventListener('change', () => {
      if (!inEl.value) return;
      const d = new Date(inEl.value);
      d.setDate(d.getDate() + 1);
      outEl.min = iso(d);
      if (!outEl.value || outEl.value <= inEl.value) outEl.value = iso(d);
      sync();
    });
  }

  function sync() {
    const inV = fmt(inEl && inEl.value);
    const outV = fmt(outEl && outEl.value);
    const g = gEl ? gEl.value : '';
    if (waEl && rawWa) {
      const u = new URL(rawWa);
      const base = decodeURIComponent(u.searchParams.get('text') || '');
      const lines = base.split('\n').filter((l) => !/^(Date|Arrivo|Partenza|Arrival|Departure|Anreise|Abreise|Arrivée|Départ|Numero di persone|Guests|Gäste|Hôtes)/i.test(l));
      const msg = lines.join('\n') + `\nArrivo: ${inV}\nPartenza: ${outV}\nOspiti: ${g}`;
      u.searchParams.set('text', msg);
      waEl.href = u.toString();
    }
    if (mailEl && mailtoBase) {
      const sep = mailtoBase.includes('?') ? '&' : '?';
      mailEl.href = mailtoBase + sep + 'body=' + encodeURIComponent(`Arrivo: ${inV}\nPartenza: ${outV}\nOspiti: ${g}`);
    }
  }

  [inEl, outEl, gEl].forEach((el) => el && el.addEventListener('change', sync));
  sync();
}
