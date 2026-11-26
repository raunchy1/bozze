#!/usr/bin/env python3
"""Bassa Prua · design "Turchese": genera demo/bassa-prua/it/index.html e en/index.html.

Uso (dalla radice del repo bozze):  python3 tools/bassa-prua-turchese.py
Stili in demo/bassa-prua/css/turchese.css, piccoli script in demo/bassa-prua/assets/turchese.js
(galleria e modulo di prenotazione restano assets/gallery.js e assets/booking.js).
"""
import json
import os
from html import escape as e
from urllib.parse import quote

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'demo', 'bassa-prua')
BASE = 'https://websardegna.xyz/demo/bassa-prua/'
TEL = '+393356241767'
TEL_TXT = '+39 335 624 1767'
MAIL = 'marcellserra@yahoo.it'
WA = 'https://wa.me/393356241767?text='
MAPS = 'https://www.google.com/maps/dir/?api=1&destination=Via+Fonte+Vecchia%2C+07020+Palau+SS%2C+Italia'

GAL = {'r1': 9, 'r2': 9, 'r3': 11}


def gal_list(key):
    return ['../img/g-%s-%d-800.webp' % (key, i) for i in range(GAL[key])]


T = {
 'it': {
  'locale': 'it_IT', 'altro': 'en', 'altro_nome': 'English',
  'title': 'Bassa Prua — casa vacanza sul porto di Palau, Sardegna',
  'desc': 'Casa vacanza a Palau, a 50 metri dal porto e 3 minuti a piedi dalla spiaggia: tre camere con bagno privato, terrazza sul porto e parcheggio privato.',
  'og_alt': 'Il balcone della casa con il tavolo, le piante e la vista sul porto di Palau',
  'skip': 'Vai al contenuto', 'menu': 'Menu', 'chiudi': 'Chiudi',
  'nav': [('camere', 'Camere'), ('casa', 'La casa'), ('palau', 'Palau'), ('prenota', 'Prenota'), ('dove', 'Dove siamo')],
  'cta': 'Verifica le date', 'chiama': 'Chiama',
  'eyebrow': 'Casa vacanza · Palau · Sardegna',
  'h1_sub': 'Una casa vacanza sul porto di Palau',
  'hero_p': 'Il porto davanti, il mare a tre minuti. Tre camere con bagno privato e terrazza sul porto turistico, nel centro del paese.',
  'chips': ['50 m dal porto', '3 min dalla spiaggia', 'Parcheggio gratis'],
  'hero_b2': 'Guarda le camere',
  'hero_alt': 'Il balcone della casa con il tavolo, le piante e la vista sul porto di Palau',
  'mini': [('rail-05', 'La camera turchese'), ('rail-07', 'Piante sul balcone'), ('rail-04', 'Vista dal balcone')],
  'casa_s': 'la casa', 'casa_h': 'La casa sul porto di Palau',
  'casa_p': ['Bassa Prua è una casa per vacanze sul porto di Palau: tre camere indipendenti, curate nei dettagli, con tutto il necessario per un soggiorno comodo.',
             "Le camere sono indipendenti e ognuna ha il suo bagno, la televisione e l'aria condizionata compresa nel prezzo. C'è una cucina in comune per i pasti e per quello che serve.",
             "Quello che ci contraddistingue è la cura dei dettagli e degli arredi, ma soprattutto l'accoglienza: siamo a disposizione per consigli su spiagge, traghetti e ristoranti."],
  'numeri': [('50 m', 'dal porto turistico'), ('3 min', 'a piedi dalla spiaggia'), ('3', 'camere con bagno'), ('Gratis', 'il parcheggio privato')],
  'rail_s': 'in immagini', 'scorri': 'scorri →',
  'rail': [('rail-01', 'Camera matrimoniale'), ('rail-02', 'Camera con balcone'), ('rail-03', 'Il letto a castello'), ('rail-04', 'Vista dal balcone'), ('rail-05', 'La camera turchese'), ('rail-06', 'Parete dipinta'), ('rail-07', 'Piante sul balcone'), ('rail-08', 'La porta finestra'), ('rail-09', 'La camera familiare'), ('rail-10', 'Il porto di Palau')],
  'camere_s': 'le camere', 'camere_h': 'Tre camere, ognuna con il suo bagno',
  'camere_p': "Tutte le camere hanno il bagno privato e una terrazza o un balcone; gli asciugamani sono pronti all'arrivo.",
  'foto': 'foto', 'chiedi': 'Chiedi disponibilità', 'tutte': 'Tutte le foto',
  'camere': [
   ('r1', 'Matrimoniale con terrazza', '2 persone', 'bagno privato · terrazza', 'Pareti chiare, testata in tessuto e un quadro con i velieri sopra la scrivania. Il bagno privato ha doccia, bidet e lavabo.', 'la camera matrimoniale con terrazza'),
   ('r2', 'Matrimoniale con balcone', '2 persone', 'bagno privato · balcone sul porto', 'La camera con la parete dipinta a foglie e il letto matrimoniale. Dal balcone si vedono il porto e il verde della piazza.', 'la camera matrimoniale con balcone'),
   ('r3', 'Familiare con letto a castello', '3–4 persone', 'bagno privato · terrazza', 'Il letto matrimoniale e il castello per i ragazzi, con il bagno privato accanto. È la camera più ampia della casa.', 'la camera familiare'),
  ],
  'wa_base': 'Buongiorno, vorrei chiedere la disponibilità a Bassa Prua, Palau.',
  'wa_camera': 'Buongiorno, vorrei chiedere la disponibilità per %s a Bassa Prua.',
  'wa_righe': '\nDate:\nNumero di persone:',
  'terrazza_q': "Dalla terrazza si vedono il porto turistico e la piazza principale, dove quasi ogni sera ci sono canti e balli sardi. La mattina c'è il mare, la sera la musica.",
  'terrazza_c': 'La terrazza · Palau', 'terrazza_alt': 'Il balcone con i fiori e la vista sul porto di Palau',
  'servizi_s': 'comodità', 'servizi_h': 'Tutto a portata di mano',
  'ogni': 'In ogni camera', 'ogni_l': ['Bagno privato con doccia', 'Aria condizionata compresa nel prezzo', 'Televisione', 'Terrazza o balcone', "Asciugamani pronti all'arrivo"],
  'comune': 'In comune', 'comune_l': ['Cucina a disposizione durante il soggiorno', 'Parcheggio privato senza spese aggiuntive', 'Consigli su spiagge, gite e ristoranti'],
  'letti': 'Le camere', 'letti_l': [('Camera 1', 'matrimoniale · terrazza'), ('Camera 2', 'matrimoniale · balcone'), ('Camera 3', 'matrimoniale + castello')],
  'palau_s': 'palau e le isole', 'palau_h': 'Il porto, la spiaggia e le isole, tutto a piedi',
  'palau_p': "Palau è la porta dell'arcipelago di La Maddalena: dal porto partono le gite guidate con sosta bagno e pranzo a bordo.",
  'gite': [('retreat-1067', 'Gite in barca alle isole', "Dal porto, a 50 metri: gite guidate all'arcipelago con sosta bagno e pranzo a bordo.", 'Il porto di Palau con le barche per le isole', 'Vorrei un consiglio sulle gite in barca alle isole.'),
           ('events-1067', 'Spiaggia e paese a piedi', 'La spiaggia storica a tre minuti, la piazza davanti a casa, i servizi tutti nel centro del paese.', 'La vista dal balcone sul verde della piazza e sul porto', 'Vorrei un consiglio su spiagge e ristoranti a Palau.')],
  'palau_nota': 'La piazza davanti alla casa, quasi ogni sera, ospita canti e balli tipici sardi.',
  'consiglio': 'Scriveteci per un consiglio', 'mail_ogg_info': 'Bassa Prua: informazioni',
  'prenota_s': 'prenota', 'prenota_h': 'Verifica le date e scriveteci',
  'prenota_p': 'Siamo una casa vacanza di tre camere: la disponibilità la confermiamo noi, di persona.',
  'arrivo': 'Arrivo', 'partenza': 'Partenza', 'ospiti': 'Ospiti',
  'chiama_p': 'Chiama per prenotare', 'wa_b': 'Scrivici su WhatsApp', 'mail_b': "Scrivici un'email",
  'mail_ogg': 'Richiesta di disponibilità',
  'prenota_nota': 'Rispondiamo direttamente noi, i proprietari. Nessuna caparra online.',
  'dove_s': 'dove siamo', 'dove_h': 'In centro a Palau, sul porto',
  'dove_p': "La casa è nel centro del paese, davanti al porto turistico e alla piazza principale: l'auto non serve.",
  'indicazioni': 'Indicazioni stradali', 'piedi': 'A piedi da casa',
  'distanze': [('Porto turistico', '50 m'), ('Spiaggia di Palau', '3 min'), ('Piazza principale', '1 min'), ('Imbarco per La Maddalena', '5 min')],
  'p_descr': 'Casa vacanza sul porto di Palau: tre camere indipendenti, terrazza con vista e parcheggio privato.',
  'contatti': 'Contatti', 'tel_wa': 'Telefono e WhatsApp', 'email': 'Email', 'lingue': 'Lingue', 'esplora': 'Esplora',
  'bozza': 'Bozza realizzata da WebSardegna',
  'gal_close': 'Chiudi',
  'faq': [('Che servizi sono compresi?', 'Bagno privato, aria condizionata, TV, cucina in comune e parcheggio privato: tutti compresi nel prezzo.'),
          ('Il parcheggio è compreso?', 'Sì, la casa ha un parcheggio privato senza costi aggiuntivi.')],
 },
 'en': {
  'locale': 'en_GB', 'altro': 'it', 'altro_nome': 'Italiano',
  'title': 'Bassa Prua — a holiday home on the harbour of Palau, Sardinia',
  'desc': "A holiday home in Palau, 50 metres from the harbour and 3 minutes' walk from the beach: three rooms with private bathrooms, a terrace over the marina and private parking.",
  'og_alt': 'The balcony of the house with the table, the plants and the view over Palau harbour',
  'skip': 'Skip to content', 'menu': 'Menu', 'chiudi': 'Close',
  'nav': [('camere', 'Rooms'), ('casa', 'The house'), ('palau', 'Palau'), ('prenota', 'Book'), ('dove', 'Find us')],
  'cta': 'Check your dates', 'chiama': 'Call',
  'eyebrow': 'Holiday home · Palau · Sardinia',
  'h1_sub': 'A holiday home on the harbour of Palau',
  'hero_p': 'The harbour in front, the sea three minutes away. Three rooms with private bathrooms and a terrace over the marina, in the centre of town.',
  'chips': ['50 m from the harbour', '3 min from the beach', 'Free parking'],
  'hero_b2': 'See the rooms',
  'hero_alt': 'The balcony of the house with the table, the plants and the view over Palau harbour',
  'mini': [('rail-05', 'The turquoise room'), ('rail-07', 'Plants on the balcony'), ('rail-04', 'View from the balcony')],
  'casa_s': 'the house', 'casa_h': 'The house on the harbour of Palau',
  'casa_p': ['Bassa Prua is a holiday home on the harbour of Palau: three independent rooms, cared for in every detail, with everything you need for a comfortable stay.',
             'Every room is independent, with its own bathroom, television and air conditioning included in the price. There is a shared kitchen available during your stay.',
             'What sets us apart is the care for details and furnishings, and above all the welcome: we are happy to suggest beaches, ferries and restaurants.'],
  'numeri': [('50 m', 'from the marina'), ('3 min', "walk to the beach"), ('3', 'rooms with bathroom'), ('Free', 'private parking')],
  'rail_s': 'in pictures', 'scorri': 'scroll →',
  'rail': [('rail-01', 'Double room'), ('rail-02', 'Room with balcony'), ('rail-03', 'The bunk bed'), ('rail-04', 'View from the balcony'), ('rail-05', 'The turquoise room'), ('rail-06', 'Painted wall'), ('rail-07', 'Plants on the balcony'), ('rail-08', 'The French window'), ('rail-09', 'The family room'), ('rail-10', 'Palau harbour')],
  'camere_s': 'the rooms', 'camere_h': 'Three rooms, each with its own bathroom',
  'camere_p': 'All rooms have a private bathroom and a terrace or balcony; towels are ready on arrival.',
  'foto': 'photos', 'chiedi': 'Ask about availability', 'tutte': 'All photos',
  'camere': [
   ('r1', 'Double room with terrace', '2 guests', 'private bathroom · terrace', 'Light walls, an upholstered headboard and a painting of sailing boats above the desk. The private bathroom has a shower, bidet and sink.', 'the double room with terrace'),
   ('r2', 'Double room with balcony', '2 guests', 'private bathroom · balcony over the harbour', 'The room with the leaf-painted wall and the double bed. From the balcony you see the marina and the green of the square.', 'the double room with balcony'),
   ('r3', 'Family room with bunk bed', '3–4 guests', 'private bathroom · terrace', 'A double bed and a bunk bed for the children, with the private bathroom next door. It is the largest room in the house.', 'the family room'),
  ],
  'wa_base': 'Hello, I would like to ask about availability at Bassa Prua in Palau.',
  'wa_camera': 'Hello, I would like to ask about availability for %s at Bassa Prua.',
  'wa_righe': '\nDates:\nNumber of guests:',
  'terrazza_q': 'From the terrace you see the marina and the main square of the town, where almost every evening there is Sardinian singing and dancing. In the morning the sea, in the evening the music.',
  'terrazza_c': 'The terrace · Palau', 'terrazza_alt': 'The balcony with flowers and the view over Palau harbour',
  'servizi_s': 'comfort', 'servizi_h': 'Everything close at hand',
  'ogni': 'In every room', 'ogni_l': ['Private bathroom with shower', 'Air conditioning included in the price', 'Television', 'Terrace or balcony', 'Towels ready on arrival'],
  'comune': 'Shared', 'comune_l': ['Kitchen available during your stay', 'Private parking at no extra cost', 'Tips on beaches, boat trips and restaurants'],
  'letti': 'The rooms', 'letti_l': [('Room 1', 'double · terrace'), ('Room 2', 'double · balcony'), ('Room 3', 'double + bunk bed')],
  'palau_s': 'palau and the islands', 'palau_h': 'The harbour, the beach and the islands, all on foot',
  'palau_p': 'Palau is the gateway to the La Maddalena archipelago: guided boat trips leave from the harbour with a swim stop and lunch on board.',
  'gite': [('retreat-1067', 'Boat trips to the islands', 'From the harbour, 50 metres away: guided trips to the archipelago with a swim stop and lunch on board.', 'Palau harbour with the boats to the islands', 'I would like some advice about boat trips to the islands.'),
           ('events-1067', 'Beach and town on foot', 'The historic beach three minutes away, the square in front, all the services in the centre of town.', 'The view from the balcony over the square and the harbour', 'I would like some advice about beaches and restaurants in Palau.')],
  'palau_nota': 'The square in front of the house hosts traditional Sardinian singing and dancing almost every evening.',
  'consiglio': 'Write to us for advice', 'mail_ogg_info': 'Bassa Prua: information',
  'prenota_s': 'book', 'prenota_h': 'Check your dates and write to us',
  'prenota_p': 'We are a three-room holiday home: we confirm availability ourselves, in person.',
  'arrivo': 'Arrival', 'partenza': 'Departure', 'ospiti': 'Guests',
  'chiama_p': 'Call to book', 'wa_b': 'Message us on WhatsApp', 'mail_b': 'Send an email',
  'mail_ogg': 'Availability request',
  'prenota_nota': 'You talk to us, the owners. No online deposit.',
  'dove_s': 'find us', 'dove_h': 'In the centre of Palau, on the harbour',
  'dove_p': 'The house is in the centre of town, facing the marina and the main square: you will not need a car.',
  'indicazioni': 'Get directions', 'piedi': 'On foot from the house',
  'distanze': [('Marina', '50 m'), ('Palau beach', '3 min'), ('Main square', '1 min'), ('Ferry to La Maddalena', '5 min')],
  'p_descr': 'A holiday home on the harbour of Palau: three independent rooms, a terrace with a view and private parking.',
  'contatti': 'Contact', 'tel_wa': 'Phone and WhatsApp', 'email': 'Email', 'lingue': 'Languages', 'esplora': 'Explore',
  'bozza': 'Draft made by WebSardegna',
  'gal_close': 'Close',
  'faq': [('What is included?', 'Private bathroom, air conditioning, TV, shared kitchen and private parking: all included in the price.'),
          ('Is parking included?', 'Yes, the house has private parking at no extra cost.')],
 },
}

LOGO = '<img src="../img/logo-160.webp" alt="" width="38" height="38">'
ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'


def wa(text):
    return WA + quote(text)


def img(name, alt, w=1067, h=800, lazy=True, cls=''):
    return '<img%s src="../img/%s.webp" alt="%s" width="%d" height="%d"%s decoding="async">' % (
        ' class="%s"' % cls if cls else '', name, e(alt), w, h, ' loading="lazy"' if lazy else ' fetchpriority="high"')


def jsonld(l, t):
    url = BASE + l + '/'
    g = {
        '@type': ['LodgingBusiness', 'VacationRental'], '@id': BASE + '#casa', 'name': 'Bassa Prua',
        'description': t['desc'], 'url': url, 'inLanguage': l,
        'image': [BASE + 'img/hero-1067.webp', BASE + 'img/retreat-1067.webp', BASE + 'img/casa-tall-800.webp'],
        'telephone': TEL, 'email': MAIL,
        'address': {'@type': 'PostalAddress', 'streetAddress': 'Via Fonte Vecchia', 'addressLocality': 'Palau', 'addressRegion': 'SS', 'postalCode': '07020', 'addressCountry': 'IT'},
        'numberOfRooms': 3,
        'amenityFeature': [{'@type': 'LocationFeatureSpecification', 'name': n, 'value': True} for n in ('Parking', 'Air conditioning', 'Kitchen', 'Television')],
        'potentialAction': {'@type': 'ReserveAction', 'target': 'tel:' + TEL},
        'hasMap': MAPS,
    }
    faq = {'@type': 'FAQPage', '@id': url + '#faq', 'inLanguage': l,
           'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in t['faq']]}
    return json.dumps({'@context': 'https://schema.org', '@graph': [g, faq]}, ensure_ascii=False, indent=1).replace('</', '<\\/')


def page(l):
    t = T[l]
    o = t['altro']
    nav = ''.join('<a href="#%s">%s</a>' % (a, e(b)) for a, b in t['nav'])
    lingue = '<a href="../it/" lang="it" hreflang="it"%s>IT</a><a href="../en/" lang="en" hreflang="en"%s>EN</a>' % (
        ' aria-current="page"' if l == 'it' else '', ' aria-current="page"' if l == 'en' else '')
    mailto_book = 'mailto:%s?subject=%s&body=%s' % (MAIL, quote(t['mail_ogg']), quote(t['wa_base']))

    camere = ''
    for i, (k, nome, pers, det, testo, wa_nome) in enumerate(t['camere']):
        camere += '''
      <article class="camera appare">
        <button class="camera__foto" type="button" data-gallery="%(k)s" data-name="%(nome)s" aria-label="%(tutte)s: %(nome)s">
          <img src="../img/g-%(k)s-0-800.webp" alt="%(nome)s" width="800" height="600" loading="lazy" decoding="async">
          <span class="camera__n">0%(n)d</span>
        </button>
        <h3>%(nome)s</h3>
        <div class="pills"><span class="pill pill--corallo">%(pers)s</span><span class="pill">%(det)s</span></div>
        <p>%(testo)s</p>
        <div class="camera__azioni">
          <button class="btn btn--bordo" type="button" data-gallery="%(k)s" data-name="%(nome)s">%(nf)d %(foto)s</button>
          <a class="btn btn--corallo" href="%(wa)s" target="_blank" rel="noopener">%(chiedi)s</a>
        </div>
      </article>''' % dict(k=k, nome=e(nome), tutte=e(t['tutte']), n=i + 1, pers=e(pers), det=e(det), testo=e(testo),
                         nf=GAL[k], foto=e(t['foto']), wa=e(wa(t['wa_camera'] % wa_nome + t['wa_righe'])), chiedi=e(t['chiedi']))

    rail = ''.join('<figure>%s<figcaption>%s</figcaption></figure>' % (img(n, c, 760, 570), e(c)) for n, c in t['rail'])
    mini = ''.join(img(n, c, 200, 200) for n, c in t['mini'])
    numeri = ''.join('<div class="numero"><b>%s</b><span>%s</span></div>' % (e(a), e(b)) for a, b in t['numeri'])
    ogni = ''.join('<li>%s</li>' % e(x) for x in t['ogni_l'])
    comune = ''.join('<li>%s</li>' % e(x) for x in t['comune_l'])
    letti = ''.join('<li><b>%s</b><span>%s</span></li>' % (e(a), e(b)) for a, b in t['letti_l'])
    gite = ''.join('''
      <a class="gita appare" href="mailto:%s?subject=%s&amp;body=%s">
        %s
        <div><h3>%s</h3><p>%s</p></div>
      </a>''' % (MAIL, quote(t['mail_ogg_info']), quote(body), img(n, alt), e(h), e(p)) for n, h, p, alt, body in t['gite'])
    distanze = ''.join('<div class="distanza"><span>%s</span><b>%s</b></div>' % (e(a), e(b)) for a, b in t['distanze'])
    ospiti = ''.join('<option%s>%d</option>' % (' selected' if n == 2 else '', n) for n in range(1, 9))
    gal = {k: gal_list(k) for k in GAL}

    return '''<!doctype html>
<html lang="%(l)s">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>%(title)s</title>
<meta name="description" content="%(desc)s">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="%(base)s%(l)s/">
<link rel="alternate" hreflang="it" href="%(base)sit/">
<link rel="alternate" hreflang="en" href="%(base)sen/">
<link rel="alternate" hreflang="x-default" href="%(base)sit/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Bassa Prua">
<meta property="og:title" content="%(title)s">
<meta property="og:description" content="%(desc)s">
<meta property="og:url" content="%(base)s%(l)s/">
<meta property="og:locale" content="%(locale)s">
<meta property="og:image" content="%(base)simg/share.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="%(og_alt)s">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="../img/apple-touch-icon.png">
<meta name="theme-color" content="#E4F4F2">
<link rel="preload" href="../fonts/Poppins-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../fonts/Pacifico-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="../img/hero-phone-640.webp" imagesrcset="../img/hero-phone-480.webp 480w, ../img/hero-phone-640.webp 640w, ../img/hero-1067.webp 1067w" imagesizes="(min-width: 900px) 480px, 90vw">
<link rel="stylesheet" href="../css/turchese.css?v=%(v)s">
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">
%(ld)s
</script>
</head>
<body>
<a class="skip" href="#top">%(skip)s</a>

<header class="testata">
  <div class="wrap">
    <a class="marchio" href="#top" aria-label="Bassa Prua">%(logo)s<span>Bassa Prua</span></a>
    <nav class="nav" aria-label="Menu">%(nav)s</nav>
    <div class="testata__dx">
      <nav class="lingue" aria-label="%(lingue_t)s">%(lingue)s</nav>
      <a class="btn btn--corallo" href="#prenota">%(cta)s</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" aria-label="%(menu)s" data-chiudi="%(chiudi)s" data-apri="%(menu)s">%(icon)s</button>
    </div>
  </div>
</header>
<nav class="menu" id="menu" aria-label="%(menu)s">%(nav)s<a class="btn btn--corallo" href="#prenota">%(cta)s</a></nav>

<main id="top">
  <section class="hero" aria-labelledby="hero-h">
    <div class="hero__deco1" aria-hidden="true"></div><div class="hero__deco2" aria-hidden="true"></div>
    <div class="wrap">
      <div>
        <p class="eyebrow">%(eyebrow)s</p>
        <h1 id="hero-h">Bassa Prua<small>%(h1_sub)s</small></h1>
        <p class="hero__testo">%(hero_p)s</p>
        <div class="pills">%(chips)s</div>
        <div class="hero__azioni">
          <a class="btn btn--corallo" href="#prenota">%(cta)s</a>
          <a class="btn btn--bordo" href="#camere">%(hero_b2)s</a>
        </div>
      </div>
      <div>
        <div class="hero__foto">
          <img src="../img/hero-phone-640.webp" srcset="../img/hero-phone-480.webp 480w, ../img/hero-phone-640.webp 640w, ../img/hero-1067.webp 1067w" sizes="(min-width: 900px) 480px, 90vw" alt="%(hero_alt)s" width="640" height="640" fetchpriority="high" decoding="async">
        </div>
        <div class="hero__mini">%(mini)s</div>
      </div>
    </div>
  </section>

  <section class="sez" id="casa" aria-labelledby="casa-h">
    <div class="wrap casa">
      <div class="casa__testo appare">
        <span class="script">%(casa_s)s</span>
        <h2 id="casa-h" style="font-size:clamp(28px,4vw,40px);margin:4px 0 18px">%(casa_h)s</h2>
        %(casa_p)s
      </div>
      <div class="numeri appare">%(numeri)s</div>
    </div>
  </section>

  <section class="sez sez--acqua" aria-label="%(rail_s)s" style="padding-bottom:56px">
    <div class="wrap testa-sez" style="margin-bottom:22px"><span class="script">%(rail_s)s</span></div>
    <div class="binario" tabindex="0">%(rail)s</div>
    <p class="scorri" aria-hidden="true">%(scorri)s</p>
  </section>

  <section class="sez" id="camere" aria-labelledby="camere-h">
    <div class="wrap">
      <div class="testa-sez"><span class="script">%(camere_s)s</span><h2 id="camere-h">%(camere_h)s</h2><p>%(camere_p)s</p></div>
      <div class="camere">%(camere)s
      </div>
    </div>
  </section>

  <section class="sez sez--petrolio" aria-label="%(terrazza_c)s">
    <div class="cerchio" style="right:-120px;top:-120px;width:340px;height:340px;background:var(--turchese);opacity:.55" aria-hidden="true"></div>
    <div class="wrap terrazza">
      <div class="appare">%(img_terr)s</div>
      <div class="appare"><blockquote>%(terrazza_q)s</blockquote><cite>%(terrazza_c)s</cite></div>
    </div>
  </section>

  <section class="sez sez--acqua" aria-labelledby="servizi-h">
    <div class="wrap">
      <div class="testa-sez"><span class="script">%(servizi_s)s</span><h2 id="servizi-h">%(servizi_h)s</h2></div>
      <div class="servizi">
        <div class="scheda appare"><h3>%(ogni)s</h3><ul>%(ogni_l)s</ul></div>
        <div class="scheda appare"><h3>%(comune)s</h3><ul>%(comune_l)s</ul></div>
        <div class="scheda appare"><h3>%(letti)s</h3><ul class="righe-camere">%(letti_l)s</ul></div>
      </div>
    </div>
  </section>

  <section class="sez" id="palau" aria-labelledby="palau-h">
    <div class="wrap">
      <div class="testa-sez"><span class="script">%(palau_s)s</span><h2 id="palau-h">%(palau_h)s</h2><p>%(palau_p)s</p></div>
      <div class="gite">%(gite)s
      </div>
      <div class="palau-nota appare"><p>%(palau_nota)s</p><a class="btn btn--bordo" href="mailto:%(mail)s?subject=%(ogg_info)s">%(consiglio)s</a></div>
    </div>
  </section>

  <section class="sez" id="prenota" aria-labelledby="prenota-h" style="padding-top:0">
    <div class="wrap">
      <div class="prenota">
        <div class="cerchio" aria-hidden="true"></div>
        <span class="script">%(prenota_s)s</span>
        <h2 id="prenota-h">%(prenota_h)s</h2>
        <p>%(prenota_p)s</p>
        <form id="book-form" data-mailto="%(mailto_base)s" onsubmit="return false">
          <div class="campi">
            <label class="campo"><span>%(arrivo)s</span><input type="date" id="book-in" name="in"></label>
            <label class="campo"><span>%(partenza)s</span><input type="date" id="book-out" name="out"></label>
            <label class="campo"><span>%(ospiti)s</span><select id="book-g" name="g">%(ospiti_o)s</select></label>
          </div>
          <div class="prenota__azioni">
            <a class="btn btn--chiaro" id="book-wa" href="%(wa_base)s" target="_blank" rel="noopener">%(wa_b)s</a>
            <a class="btn btn--bordo-chiaro" href="tel:%(tel)s">%(chiama_p)s</a>
            <a class="btn btn--bordo-chiaro" id="book-mail" href="%(mailto_book_attr)s">%(mail_b)s</a>
          </div>
        </form>
        <p class="prenota__nota">%(prenota_nota)s</p>
      </div>
    </div>
  </section>

  <section class="sez sez--petrolio" id="dove" aria-labelledby="dove-h">
    <div class="cerchio" style="left:-140px;bottom:-160px;width:360px;height:360px;background:var(--turchese);opacity:.4" aria-hidden="true"></div>
    <div class="wrap dove">
      <div class="appare">
        <span class="script">%(dove_s)s</span>
        <h2 id="dove-h" style="font-size:clamp(28px,4vw,40px)">%(dove_h)s</h2>
        <p style="margin-top:14px">%(dove_p)s</p>
        <p class="dove__indirizzo">Via Fonte Vecchia<br>07020 Palau (SS)</p>
        <a class="btn btn--chiaro" href="%(maps)s" target="_blank" rel="noopener">%(indicazioni)s</a>
      </div>
      <div class="appare">
        <p class="eyebrow" style="color:var(--sabbia);margin-bottom:14px">%(piedi)s</p>
        <div class="distanze">%(distanze)s</div>
      </div>
    </div>
  </section>
</main>

<footer class="piede">
  <div class="wrap">
    <div>
      <a class="marchio" href="#top" aria-label="Bassa Prua">%(logo)s<span>Bassa Prua</span></a>
      <p style="margin-top:14px;max-width:320px">%(p_descr)s</p>
    </div>
    <div><h3>%(contatti)s</h3><p>%(tel_wa)s<br><a href="tel:%(tel)s">%(tel_txt)s</a></p><p style="margin-top:10px">%(email)s<br><a href="mailto:%(mail)s">%(mail)s</a></p></div>
    <div><h3>%(esplora)s</h3><p>%(nav_piede)s</p></div>
    <div><h3>%(lingue_t)s</h3><p><a href="../it/" hreflang="it">Italiano</a><br><a href="../en/" hreflang="en">English</a></p></div>
    <div class="piede__fine"><span>© <span data-anno>2026</span> Bassa Prua · Via Fonte Vecchia, Palau (SS)</span><a href="https://websardegna.xyz" target="_blank" rel="noopener">%(bozza)s</a></div>
  </div>
</footer>

<div class="barra"><a class="btn btn--corallo" href="#prenota">%(cta)s</a><a class="btn btn--chiaro" href="tel:%(tel)s">%(chiama)s</a></div>

<script type="application/json" id="gal-data">%(gal)s</script>
<script type="module" src="../assets/gallery.js?v=%(v)s"></script>
<script type="module" src="../assets/booking.js?v=%(v)s"></script>
<script src="../assets/turchese.js?v=%(v)s" defer></script>
</body>
</html>
''' % dict(
        l=l, base=BASE, v=VERSION, title=e(t['title']), desc=e(t['desc']), locale=t['locale'], og_alt=e(t['og_alt']),
        ld=jsonld(l, t), skip=e(t['skip']), logo=LOGO, nav=nav, lingue=lingue, lingue_t=e(t['lingue']), cta=e(t['cta']),
        menu=e(t['menu']), chiudi=e(t['chiudi']), icon=ICON_MENU, eyebrow=e(t['eyebrow']), h1_sub=e(t['h1_sub']),
        hero_p=e(t['hero_p']), chips=''.join('<span class="pill">%s</span>' % e(c) for c in t['chips']),
        hero_b2=e(t['hero_b2']), hero_alt=e(t['hero_alt']), mini=mini, casa_s=e(t['casa_s']), casa_h=e(t['casa_h']),
        casa_p=''.join('<p>%s</p>' % e(p) for p in t['casa_p']), numeri=numeri, rail_s=e(t['rail_s']), rail=rail,
        scorri=e(t['scorri']), camere_s=e(t['camere_s']), camere_h=e(t['camere_h']), camere_p=e(t['camere_p']),
        camere=camere, img_terr=img('quote', t['terrazza_alt'], 1067, 800), terrazza_q=e(t['terrazza_q']),
        terrazza_c=e(t['terrazza_c']), servizi_s=e(t['servizi_s']), servizi_h=e(t['servizi_h']), ogni=e(t['ogni']),
        ogni_l=ogni, comune=e(t['comune']), comune_l=comune, letti=e(t['letti']), letti_l=letti,
        palau_s=e(t['palau_s']), palau_h=e(t['palau_h']), palau_p=e(t['palau_p']), gite=gite,
        palau_nota=e(t['palau_nota']), mail=MAIL, ogg_info=quote(t['mail_ogg_info']), consiglio=e(t['consiglio']),
        prenota_s=e(t['prenota_s']), prenota_h=e(t['prenota_h']), prenota_p=e(t['prenota_p']),
        mailto_book_attr=e(mailto_book), mailto_base=e('mailto:%s?subject=%s' % (MAIL, quote(t['mail_ogg']))), arrivo=e(t['arrivo']), partenza=e(t['partenza']), ospiti=e(t['ospiti']),
        ospiti_o=ospiti, wa_base=e(wa(t['wa_base'])), wa_b=e(t['wa_b']), tel=TEL, tel_txt=TEL_TXT,
        chiama_p=e(t['chiama_p']), mail_b=e(t['mail_b']), prenota_nota=e(t['prenota_nota']), dove_s=e(t['dove_s']),
        dove_h=e(t['dove_h']), dove_p=e(t['dove_p']), maps=e(MAPS), indicazioni=e(t['indicazioni']), piedi=e(t['piedi']),
        distanze=distanze, p_descr=e(t['p_descr']), contatti=e(t['contatti']), tel_wa=e(t['tel_wa']), email=e(t['email']),
        esplora=e(t['esplora']), nav_piede='<br>'.join('<a href="#%s">%s</a>' % (a, e(b)) for a, b in t['nav']),
        bozza=e(t['bozza']), chiama=e(t['chiama']), gal=json.dumps(gal))


VERSION = '20261126t'

if __name__ == '__main__':
    for l in ('it', 'en'):
        with open(os.path.join(ROOT, l, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(page(l))
        print('scritto', l)
    with open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="robots" content="noindex">'
                '<meta http-equiv="refresh" content="0; url=it/"><link rel="canonical" href="%sit/"><title>Bassa Prua</title></head>'
                '<body><a href="it/">Bassa Prua</a></body></html>\n' % BASE)
    print('scritto index.html (rimanda a it/)')
