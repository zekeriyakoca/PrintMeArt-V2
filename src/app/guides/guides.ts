/** The guides: practical articles on paper, sizes and how a print is made, in Dutch and English */

export type GuideBlock =
  | { t: 'p'; html: string }
  | { t: 'h2'; id: string; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'tip'; title: string; html: string };

export interface GuideText {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  lead: string;
  summary: string[];
  blocks: GuideBlock[];
}

export interface Guide {
  id: string;
  minutes: number;
  updated: string;
  cta: 'design' | 'prints';
  nl: GuideText;
  en: GuideText;
}

/** The guides have a translated address: /nl/gids/welk-papier, /en/guides/which-paper */
export const GUIDES_SEGMENT: Record<string, string> = { nl: 'gids', en: 'guides' };

export function guidePath(language: string, slug?: string): string {
  const segment = GUIDES_SEGMENT[language] ?? GUIDES_SEGMENT['en'];
  return slug ? `/${segment}/${slug}` : `/${segment}`;
}

export function guideText(guide: Guide, language: string): GuideText {
  return language === 'nl' ? guide.nl : guide.en;
}

/** The guide with this address in either language */
export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.nl.slug === slug || g.en.slug === slug);
}

export const GUIDES: Guide[] = [
  {
    id: 'paper',
    minutes: 5,
    updated: '2026-11-24',
    cta: 'prints',
    nl: {
      slug: 'welk-papier-kiezen',
      title: 'Welk papier kies je voor een kunstprint?',
      description: 'Hahnemühle Photo Rag, Museum Etching of Premium Poster: wat is het verschil, voor welk werk past welk papier en wat kost het?',
      eyebrow: 'Papier',
      lead: 'Het papier bepaalt meer dan je denkt: hoe diep het zwart is, hoe zacht de kleuren overlopen en hoe een print aanvoelt als je hem in je handen hebt. Dit zijn onze drie papieren, en wanneer je welk kiest.',
      summary: [
        'Twijfel je? Kies Hahnemühle Photo Rag: glad katoenpapier dat bijna alles mooi laat zien.',
        'Schilderijen in olieverf of acryl komen het best uit op Hahnemühle Museum Etching, met een fijne structuur.',
        'Premium Poster is een echte fotoafdruk op Fujifilm-papier: levendig en de voordeligste keuze.',
      ],
      blocks: [
        { t: 'h2', id: 'katoen', text: 'Katoenpapier: museumkwaliteit' },
        { t: 'p', html: 'Onze twee katoenpapieren komen van Hahnemühle, de Duitse papiermaker die al sinds 1584 papier maakt. Ze zijn van 100% katoen, zuurvrij en worden gedrukt als <strong>giclée</strong>: met pigmentinkt in twaalf kleuren, die meer dan honderd jaar kleurvast blijft. Dit is het papier dat musea en galeries gebruiken voor reproducties.' },
        { t: 'table', head: ['Papier', 'Gewicht', 'Oppervlak', 'Het mooist voor'], rows: [
          ['Hahnemühle Photo Rag', '308 g/m²', 'Glad, mat', 'Kunstreproducties, illustraties, foto’s waarbij kleur telt'],
          ['Hahnemühle Museum Etching', '350 g/m²', 'Fijn gestructureerd, mat', 'Olieverf- en acrylschilderijen, werk met textuur'],
          ['Premium Poster', '234 g/m²', 'Fijn mat fotopapier', 'Kunst voor elke dag, een eerste werk aan de muur'],
        ] },
        { t: 'p', html: '<strong>Photo Rag</strong> is glad en laat fijne details zien zonder af te leiden. Het heeft een natuurlijk wit en werkt voor bijna elk werk: van een Hollandse meester tot je eigen foto. <strong>Museum Etching</strong> is dikker en heeft een zachte, voelbare structuur. Bij een schilderij lijkt het daardoor alsof je de penseelstreken ziet; bij een scherpe foto is die structuur juist minder handig.' },
        { t: 'h2', id: 'poster', text: 'Premium Poster: een echte fotoafdruk' },
        { t: 'p', html: 'Premium Poster is geen dun posterpapier. Het is een fotografische afdruk, belicht op Fujifilm Crystal Archive-papier, met levendige kleuren en diep zwart. Het fijne matte oppervlak geeft geen schittering en is minder gevoelig voor vingerafdrukken. Het is geen katoenpapier, dus niet bedoeld voor museale bewaring, maar voor een mooie print aan je muur is het de beste prijs-kwaliteitverhouding.' },
        { t: 'h2', id: 'kiezen', text: 'Zo kies je' },
        { t: 'ul', items: [
          '<strong>Een klassiek schilderij</strong> (olieverf, acryl): Museum Etching. De structuur maakt het werk tastbaar.',
          '<strong>Aquarel, tekening, prent of illustratie</strong>: Photo Rag. Glad papier laat fijne lijnen en zachte overgangen het mooist zien.',
          '<strong>Je eigen foto</strong>: Photo Rag als kleur en detail echt tellen, Premium Poster voor levendige kleuren tegen een lagere prijs.',
          '<strong>Een kinderkamer, studentenkamer of iets dat vaker wisselt</strong>: Premium Poster.',
        ] },
        { t: 'h2', id: 'prijs', text: 'Wat is het prijsverschil?' },
        { t: 'p', html: 'Katoenpapier is iets duurder dan Premium Poster; het verschil wordt groter naarmate de print groter wordt. Photo Rag en Museum Etching kosten hetzelfde. Op <a href="/nl/your-design#prices">onze prijzentabel</a> zie je per formaat wat elk papier kost.' },
      ],
    },
    en: {
      slug: 'which-paper',
      title: 'Which paper should you choose for an art print?',
      description: 'Hahnemühle Photo Rag, Museum Etching or Premium Poster: how they differ, which paper suits which work, and what each costs.',
      eyebrow: 'Paper',
      lead: 'Paper decides more than you might think: how deep the blacks are, how softly the colours blend and how a print feels in your hands. These are our three papers, and when to pick each one.',
      summary: [
        'Not sure? Choose Hahnemühle Photo Rag: a smooth cotton paper that makes almost anything look good.',
        'Oil and acrylic paintings look best on Hahnemühle Museum Etching, with its fine texture.',
        'Premium Poster is a real photographic print on Fujifilm paper: vivid, and the best value.',
      ],
      blocks: [
        { t: 'h2', id: 'cotton', text: 'Cotton paper: museum quality' },
        { t: 'p', html: 'Our two cotton papers come from Hahnemühle, the German paper mill that has been making paper since 1584. They are 100% cotton, acid-free and printed as a <strong>giclée</strong>: with twelve pigment inks that stay true for more than a hundred years. This is the paper museums and galleries use for reproductions.' },
        { t: 'table', head: ['Paper', 'Weight', 'Surface', 'Best for'], rows: [
          ['Hahnemühle Photo Rag', '308 g/m²', 'Smooth, matte', 'Art reproductions, illustrations, colour-critical photos'],
          ['Hahnemühle Museum Etching', '350 g/m²', 'Finely textured, matte', 'Oil and acrylic paintings, textured work'],
          ['Premium Poster', '234 g/m²', 'Fine matte photo paper', 'Everyday art, a first artwork on the wall'],
        ] },
        { t: 'p', html: '<strong>Photo Rag</strong> is smooth and shows fine detail without distraction. It has a natural white and suits almost any work, from a Dutch master to your own photo. <strong>Museum Etching</strong> is heavier, with a soft texture you can feel. On a painting it makes the brushstrokes come alive; on a crisp photo that texture gets in the way.' },
        { t: 'h2', id: 'poster', text: 'Premium Poster: a real photographic print' },
        { t: 'p', html: 'Premium Poster is not thin poster paper. It is a photographic print, exposed on Fujifilm Crystal Archive paper, with vivid colours and deep blacks. The fine matte surface has no glare and resists fingerprints. It is not cotton paper, so it is not meant for museum archiving, but for a beautiful print on your wall it is the best value.' },
        { t: 'h2', id: 'choose', text: 'How to choose' },
        { t: 'ul', items: [
          '<strong>A classic painting</strong> (oil, acrylic): Museum Etching. The texture makes the work feel real.',
          '<strong>Watercolour, drawing, print or illustration</strong>: Photo Rag. Smooth paper shows fine lines and soft transitions best.',
          '<strong>Your own photo</strong>: Photo Rag when colour and detail really matter, Premium Poster for vivid colour at a lower price.',
          '<strong>A child’s room, a student room or art you change often</strong>: Premium Poster.',
        ] },
        { t: 'h2', id: 'price', text: 'What is the price difference?' },
        { t: 'p', html: 'Cotton paper costs a little more than Premium Poster, and the gap grows with the size. Photo Rag and Museum Etching cost the same. <a href="/en/your-design#prices">Our price table</a> shows what each paper costs per size.' },
      ],
    },
  },
  {
    id: 'size',
    minutes: 4,
    updated: '2026-11-24',
    cta: 'design',
    nl: {
      slug: 'foto-formaat-en-resolutie',
      title: 'Hoe groot kun je je foto laten printen?',
      description: 'Hoeveel pixels heeft je foto nodig voor 13×18, 30×40 of 50×70 cm? Een overzicht per formaat, en wat je doet als je foto te klein is.',
      eyebrow: 'Formaat',
      lead: 'Een foto die op je telefoon haarscherp is, kan op 50 × 70 cm toch zacht worden. Hoe groot je kunt printen hangt af van het aantal pixels. Zo reken je het uit.',
      summary: [
        'Wij rekenen met minstens 200 pixels per inch (ppi) op het formaat dat je kiest.',
        'Een gewone telefoonfoto van 12 megapixel is scherp tot 30 × 40 cm.',
        'Is je foto te klein? Dan vergroten en verscherpen we hem eerst (€5).',
      ],
      blocks: [
        { t: 'h2', id: 'ppi', text: 'De regel: 200 pixels per inch' },
        { t: 'p', html: 'Een print is scherp als er genoeg pixels op elke centimeter papier vallen. Wij houden minstens 200 pixels per inch (ppi) aan, ongeveer 79 pixels per centimeter. Vanaf die waarde zie je op normale kijkafstand geen pixels of zachte randen meer. Bij het uploaden op <a href="/nl/your-design">Jouw ontwerp</a> rekenen we dit voor je uit en zie je per formaat meteen hoe goed je foto wordt.' },
        { t: 'h2', id: 'tabel', text: 'Hoeveel pixels per formaat?' },
        { t: 'table', head: ['Formaat', 'Minimaal aantal pixels', 'Megapixels'], rows: [
          ['13 × 18 cm', '1.024 × 1.417', '1,5 MP'],
          ['21 × 30 cm', '1.654 × 2.362', '3,9 MP'],
          ['30 × 40 cm', '2.362 × 3.150', '7,4 MP'],
          ['40 × 60 cm', '3.150 × 4.724', '14,9 MP'],
          ['50 × 70 cm', '3.937 × 5.512', '21,7 MP'],
          ['60 × 90 cm', '4.724 × 7.087', '33,5 MP'],
        ] },
        { t: 'h2', id: 'telefoon', text: 'En je telefoon?' },
        { t: 'p', html: 'De meeste telefoons maken foto’s van 12 megapixel (4.000 × 3.000 pixels). Daarmee print je scherp tot ongeveer 38 × 50 cm, dus <strong>30 × 40 cm</strong> gaat ruim. Nieuwere telefoons met een 48-megapixelstand halen ook 60 × 90 cm, mits je die stand gebruikt. Let op: een foto die je via WhatsApp of sociale media hebt ontvangen is vaak flink verkleind. Gebruik altijd het originele bestand.' },
        { t: 'tip', title: 'Zo vind je het aantal pixels', html: 'Op een iPhone veeg je in de Foto’s-app omhoog over de foto; op Android tik je op het i-icoon. Op een computer zie je het bij de eigenschappen of informatie van het bestand.' },
        { t: 'h2', id: 'te-klein', text: 'Is je foto te klein?' },
        { t: 'p', html: 'Kies dan een kleiner formaat, of laat ons de foto vergroten. Met professionele vergroting (€5) vergroten en verscherpen we je afbeelding vóór het printen. Valt je foto onder de 200 ppi voor het gekozen formaat, dan zetten we dat automatisch voor je aan; je kunt het zelf weer uitzetten.' },
        { t: 'h2', id: 'verhouding', text: 'Let ook op de verhouding' },
        { t: 'p', html: 'Een telefoonfoto is meestal 3:4, een formaat als 21 × 30 cm is net iets langwerpiger. Past je foto niet precies, dan snijden we hem met de hand bij. Valt daardoor iets belangrijks weg, dan sturen we je eerst het ontwerp ter goedkeuring.' },
      ],
    },
    en: {
      slug: 'photo-size-and-resolution',
      title: 'How big can you print your photo?',
      description: 'How many pixels does your photo need for 13×18, 30×40 or 50×70 cm? A size-by-size overview, and what to do if your photo is too small.',
      eyebrow: 'Size',
      lead: 'A photo that looks razor-sharp on your phone can still turn soft at 50 × 70 cm. How big you can print depends on the number of pixels. Here is how to work it out.',
      summary: [
        'We work with at least 200 pixels per inch (ppi) at the size you choose.',
        'An ordinary 12-megapixel phone photo is sharp up to 30 × 40 cm.',
        'Photo too small? We enlarge and sharpen it first (€5).',
      ],
      blocks: [
        { t: 'h2', id: 'ppi', text: 'The rule: 200 pixels per inch' },
        { t: 'p', html: 'A print is sharp when enough pixels land on every centimetre of paper. We work with at least 200 pixels per inch (ppi), about 79 pixels per centimetre. From there on you no longer see pixels or soft edges at a normal viewing distance. When you upload on <a href="/en/your-design">Your design</a>, we work this out for you and show the print quality for every size straight away.' },
        { t: 'h2', id: 'table', text: 'How many pixels per size?' },
        { t: 'table', head: ['Size', 'Minimum pixels', 'Megapixels'], rows: [
          ['13 × 18 cm', '1,024 × 1,417', '1.5 MP'],
          ['21 × 30 cm', '1,654 × 2,362', '3.9 MP'],
          ['30 × 40 cm', '2,362 × 3,150', '7.4 MP'],
          ['40 × 60 cm', '3,150 × 4,724', '14.9 MP'],
          ['50 × 70 cm', '3,937 × 5,512', '21.7 MP'],
          ['60 × 90 cm', '4,724 × 7,087', '33.5 MP'],
        ] },
        { t: 'h2', id: 'phone', text: 'What about your phone?' },
        { t: 'p', html: 'Most phones take 12-megapixel photos (4,000 × 3,000 pixels). That prints sharp up to about 38 × 50 cm, so <strong>30 × 40 cm</strong> is easy. Newer phones with a 48-megapixel mode reach 60 × 90 cm, as long as you use that mode. Note: a photo you received through WhatsApp or social media has often been shrunk a lot. Always use the original file.' },
        { t: 'tip', title: 'How to find the pixel count', html: 'On an iPhone, swipe up on the photo in the Photos app; on Android, tap the i icon. On a computer, look at the file’s properties or info.' },
        { t: 'h2', id: 'too-small', text: 'Photo too small?' },
        { t: 'p', html: 'Choose a smaller size, or let us enlarge it. With professional upscaling (€5) we enlarge and sharpen your image before printing. If your photo falls below 200 ppi for the chosen size, we switch it on for you; you can turn it off yourself.' },
        { t: 'h2', id: 'ratio', text: 'Mind the proportions too' },
        { t: 'p', html: 'A phone photo is usually 3:4, while a size like 21 × 30 cm is slightly longer. If your photo doesn’t fit exactly, we crop it by hand. If that would cut off something important, we send you the design to approve first.' },
      ],
    },
  },
  {
    id: 'giclee',
    minutes: 4,
    updated: '2026-11-24',
    cta: 'prints',
    nl: {
      slug: 'giclee-of-poster',
      title: 'Giclée of poster: wat is het verschil?',
      description: 'Wat is een giclée-print, waarom kost hij meer dan een poster en wanneer is een fotoafdruk de betere keuze? Uitgelegd zonder vakjargon.',
      eyebrow: 'Printtechniek',
      lead: '“Giclée” klinkt als marketing, maar het is een echte techniek, met een echt verschil. Wat er gebeurt als we een kunstprint maken, en wanneer een fotoafdruk net zo goed is.',
      summary: [
        'Een giclée is een inkjetprint op kunstpapier met pigmentinkt in veel kleuren, gemaakt om lang mee te gaan.',
        'Een gewone poster is snel gedrukt op dun papier met minder kleuren; na een paar jaar verbleekt hij.',
        'Onze Premium Poster zit ertussen: een echte fotoafdruk, levendig en betaalbaar.',
      ],
      blocks: [
        { t: 'h2', id: 'wat', text: 'Wat is een giclée?' },
        { t: 'p', html: 'Een giclée (Frans voor “gespoten”) is een print die met een professionele inkjetprinter op kunstpapier wordt gemaakt. Het verschil met een printer thuis zit in drie dingen: <strong>pigmentinkt</strong> in plaats van kleurstofinkt, <strong>meer kleuren</strong> (wij drukken met twaalf) en <strong>katoenpapier</strong> dat zuurvrij is. Samen geven ze vloeiende overgangen, diep zwart en een print die meer dan honderd jaar kleurvast blijft.' },
        { t: 'h2', id: 'poster', text: 'En een gewone poster?' },
        { t: 'p', html: 'De meeste posters worden in grote oplagen gedrukt, op dun, gestreken papier en met vier kleuren. Dat is goedkoop, maar je ziet het: fijne overgangen worden vlekkerig, donkere delen dichtgelopen en na een paar jaar in de zon verkleurt het papier. Voor een kunstwerk dat je jaren wilt houden, is dat zonde.' },
        { t: 'table', head: ['', 'Giclée op katoen', 'Premium Poster', 'Gewone poster'], rows: [
          ['Techniek', 'Pigmentinkt, 12 kleuren', 'Fotografische belichting', 'Offset, 4 kleuren'],
          ['Papier', '100% katoen, 308–350 g/m²', 'Fujifilm fotopapier, 234 g/m²', 'Dun posterpapier'],
          ['Kleurvastheid', 'Meer dan 100 jaar', 'Lang, achter glas langer', 'Enkele jaren'],
          ['Het mooist voor', 'Kunst die je wilt houden', 'Kunst voor elke dag', 'Tijdelijk, goedkoop'],
        ] },
        { t: 'h2', id: 'premium-poster', text: 'Waar past Premium Poster?' },
        { t: 'p', html: 'Onze Premium Poster is geen gewone poster: het is een fotoafdruk, belicht op Fujifilm-fotopapier. Kleuren zijn levendig, het zwart is diep en het matte oppervlak schittert niet. Het is geen katoenpapier, dus minder geschikt voor museale bewaring, maar voor een mooie print aan de muur is het een uitstekende keuze die minder kost.' },
        { t: 'tip', title: 'Onze vuistregel', html: 'Wil je een werk jarenlang houden, of is het een cadeau? Kies een giclée op katoenpapier. Wil je vaker wisselen of meerdere prints combineren? Dan is Premium Poster slim. Meer over de papieren lees je in <a href="/nl/gids/welk-papier-kiezen">Welk papier kies je?</a>' },
      ],
    },
    en: {
      slug: 'giclee-vs-poster',
      title: 'Giclée or poster: what is the difference?',
      description: 'What a giclée print is, why it costs more than a poster, and when a photographic print is the better choice. Explained without jargon.',
      eyebrow: 'Printing',
      lead: '“Giclée” sounds like marketing, but it is a real technique with a real difference. What happens when we make an art print, and when a photographic print is just as good.',
      summary: [
        'A giclée is an inkjet print on art paper with pigment inks in many colours, made to last.',
        'An ordinary poster is printed fast on thin paper with fewer colours; after a few years it fades.',
        'Our Premium Poster sits in between: a real photographic print, vivid and affordable.',
      ],
      blocks: [
        { t: 'h2', id: 'what', text: 'What is a giclée?' },
        { t: 'p', html: 'A giclée (French for “sprayed”) is a print made on art paper with a professional inkjet printer. It differs from a home printer in three ways: <strong>pigment inks</strong> instead of dye inks, <strong>more colours</strong> (we print with twelve) and acid-free <strong>cotton paper</strong>. Together they give smooth transitions, deep blacks and a print that stays true for more than a hundred years.' },
        { t: 'h2', id: 'poster', text: 'And an ordinary poster?' },
        { t: 'p', html: 'Most posters are printed in large runs, on thin coated paper with four colours. That is cheap, but it shows: fine transitions turn blotchy, dark areas fill in and after a few years in the sun the paper discolours. For an artwork you want to keep for years, that is a shame.' },
        { t: 'table', head: ['', 'Giclée on cotton', 'Premium Poster', 'Ordinary poster'], rows: [
          ['Technique', 'Pigment inks, 12 colours', 'Photographic exposure', 'Offset, 4 colours'],
          ['Paper', '100% cotton, 308–350 g/m²', 'Fujifilm photo paper, 234 g/m²', 'Thin poster paper'],
          ['Colour fastness', 'More than 100 years', 'Long, longer behind glass', 'A few years'],
          ['Best for', 'Art you want to keep', 'Everyday art', 'Temporary, cheap'],
        ] },
        { t: 'h2', id: 'premium-poster', text: 'Where does Premium Poster fit?' },
        { t: 'p', html: 'Our Premium Poster is not an ordinary poster: it is a photographic print, exposed on Fujifilm photo paper. Colours are vivid, blacks are deep and the matte surface has no glare. It is not cotton paper, so less suited to museum archiving, but for a beautiful print on the wall it is an excellent choice that costs less.' },
        { t: 'tip', title: 'Our rule of thumb', html: 'Want to keep a work for years, or giving it as a gift? Choose a giclée on cotton paper. Like to change things around or combine several prints? Premium Poster is the smart choice. Read more about the papers in <a href="/en/guides/which-paper">Which paper should you choose?</a>' },
      ],
    },
  },
  {
    id: 'process',
    minutes: 5,
    updated: '2026-11-24',
    cta: 'design',
    nl: {
      slug: 'van-foto-tot-kunstprint',
      title: 'Van je foto tot kunstprint: zo maken wij hem',
      description: 'Wat er gebeurt nadat je je foto uploadt: controle van de resolutie, bijsnijden met de hand, je goedkeuring, printen, controleren en verpakken.',
      eyebrow: 'Ons werk',
      lead: 'Bij ons druk je niet op “print” en komt er een vel uit de machine. Tussen je upload en de koker op je deurmat zitten een paar stappen die het verschil maken. Dit is hoe wij werken.',
      summary: [
        'We controleren elk bestand zelf: scherpte, uitsnede, uitlijning en witte rand.',
        'Moet je foto anders worden bijgesneden, dan krijg je eerst het ontwerp ter goedkeuring.',
        'Elke print wordt na het printen gecontroleerd; wat niet goed is, gaat de deur niet uit.',
      ],
      blocks: [
        { t: 'h2', id: 'upload', text: '1. Je uploadt je foto' },
        { t: 'p', html: 'Op <a href="/nl/your-design">Jouw ontwerp</a> upload je een foto of ontwerp (PNG, JPG of GIF, tot 150 MB). Je kiest het formaat en het papier, en je ziet meteen hoe scherp je foto op elk formaat wordt. Met <strong>Voorbeeld</strong> zie je het resultaat vooraf, ook in een kamer aan de muur.' },
        { t: 'h2', id: 'controle', text: '2. We bekijken je bestand' },
        { t: 'p', html: 'Na je bestelling kijken we naar je bestand zoals een drukker dat doet. Is de resolutie hoog genoeg voor het formaat? Staat de horizon recht? Loopt er niets belangrijks tegen de rand? Is de foto te klein voor het gekozen formaat en heb je professionele vergroting gekozen, dan vergroten en verscherpen we hem eerst.' },
        { t: 'h2', id: 'uitsnede', text: '3. Bijsnijden met de hand, en jouw akkoord' },
        { t: 'p', html: 'Elk formaat heeft een eigen verhouding, en bijna geen foto past er precies in. We snijden je foto daarom met de hand bij, met oog voor wat ertoe doet: geen afgesneden hoofden of half verdwenen bootjes. Moet je afbeelding merkbaar anders worden bijgesneden om te passen, dan sturen we je eerst het definitieve ontwerp ter goedkeuring. Jij hebt het laatste woord.' },
        { t: 'h2', id: 'kleur', text: '4. Afgestemd op je papier' },
        { t: 'p', html: 'Elk papier neemt inkt anders op. Glad katoen, gestructureerd katoen en fotopapier geven met hetzelfde bestand een andere print. Daarom stemmen we de kleuren af op het papier dat je hebt gekozen, zodat de print er op papier uitziet zoals je hem op je scherm bedoelde. Dit zit bij de prijs inbegrepen.' },
        { t: 'h2', id: 'printen', text: '5. Printen en controleren' },
        { t: 'p', html: 'Op katoenpapier drukken we je print als giclée met pigmentinkt; op Premium Poster wordt hij belicht op Fujifilm-fotopapier. Daarna controleren we wat je zelf meteen zou zien: schone randen, gelijkmatige kleuren, geen vlekjes of krassen. Wat niet aan onze standaard voldoet, gaat de deur niet uit.' },
        { t: 'h2', id: 'verzenden', text: '6. Verpakt en verzonden' },
        { t: 'p', html: 'Je print gaat opgerold in een stevige koker, zodat hij zonder knikken aankomt. We verzenden altijd met track-and-trace. Laat de print na het uitpakken een dag plat liggen onder een paar boeken; daarna ligt hij weer mooi vlak.' },
        { t: 'tip', title: 'Je foto’s blijven van jou', html: 'We gebruiken je afbeelding alleen om je print te maken. Je afbeeldingen worden binnen 90 dagen verwijderd, of zodra je bestelling is afgerond.' },
        { t: 'h2', id: 'verzorgen', text: 'Lang plezier van je print' },
        { t: 'ul', items: [
          'Hang je print niet in de volle zon: ook de beste inkt verbleekt sneller in direct zonlicht.',
          'Vermijd vochtige plekken, zoals vlak boven een douche of fornuis.',
          'Achter glas is je print het best beschermd en makkelijk schoon te houden.',
        ] },
      ],
    },
    en: {
      slug: 'from-photo-to-art-print',
      title: 'From your photo to an art print: how we make it',
      description: 'What happens after you upload your photo: checking the resolution, cropping by hand, your approval, printing, checking and packing.',
      eyebrow: 'Our work',
      lead: 'With us you don’t press “print” and get a sheet out of a machine. Between your upload and the tube on your doormat there are a few steps that make the difference. This is how we work.',
      summary: [
        'We check every file ourselves: sharpness, crop, alignment and white border.',
        'If your photo needs a different crop, you approve the design first.',
        'Every print is checked after printing; anything not right doesn’t go out.',
      ],
      blocks: [
        { t: 'h2', id: 'upload', text: '1. You upload your photo' },
        { t: 'p', html: 'On <a href="/en/your-design">Your design</a> you upload a photo or design (PNG, JPG or GIF, up to 150 MB). You choose the size and paper and see straight away how sharp your photo will be at each size. <strong>Preview & Design</strong> shows you the result first, even on a wall in a room.' },
        { t: 'h2', id: 'check', text: '2. We look at your file' },
        { t: 'p', html: 'After you order, we look at your file the way a printer would. Is the resolution high enough for the size? Is the horizon straight? Is anything important running into the edge? If the photo is too small for the chosen size and you chose professional upscaling, we enlarge and sharpen it first.' },
        { t: 'h2', id: 'crop', text: '3. Cropped by hand, with your approval' },
        { t: 'p', html: 'Every size has its own proportions, and hardly any photo fits exactly. So we crop your photo by hand, with an eye for what matters: no cut-off heads or half-vanished boats. If your image needs a noticeably different crop to fit, we send you the final design to approve first. You have the last word.' },
        { t: 'h2', id: 'colour', text: '4. Tuned to your paper' },
        { t: 'p', html: 'Every paper takes ink differently. Smooth cotton, textured cotton and photo paper give a different print from the same file. So we tune the colours to the paper you chose, so the print looks on paper the way you meant it on screen. This is included in the price.' },
        { t: 'h2', id: 'print', text: '5. Printing and checking' },
        { t: 'p', html: 'On cotton paper we print as a giclée with pigment inks; Premium Poster is exposed on Fujifilm photo paper. Then we check what you would notice yourself right away: clean edges, even colours, no specks or scratches. Anything that doesn’t meet our standard doesn’t go out.' },
        { t: 'h2', id: 'shipping', text: '6. Packed and shipped' },
        { t: 'p', html: 'Your print travels rolled up in a sturdy tube, so it arrives without creases. We always ship with tracking. After unpacking, let the print lie flat under a few books for a day; after that it lies nicely flat again.' },
        { t: 'tip', title: 'Your photos stay yours', html: 'We only use your image to make your print. Your images are deleted within 90 days, or once your order is completed.' },
        { t: 'h2', id: 'care', text: 'Enjoying your print for years' },
        { t: 'ul', items: [
          'Don’t hang your print in full sun: even the best ink fades faster in direct sunlight.',
          'Avoid damp spots, such as right above a shower or a stove.',
          'Behind glass your print is best protected and easy to keep clean.',
        ] },
      ],
    },
  },
];
