/** The paper pages: one page per paper we print on, in Dutch and English */

/** The product behind Your design; its price table is the one the paper pages show */
export const CUSTOM_PRINT_PRODUCT_ID = 719;

const IMAGES = 'https://genstorageaccount3116.blob.core.windows.net/printme-images';

export interface PaperText {
  /** What the paper is, in a few words, e.g. 'Smooth cotton paper' */
  kind: string;
  /** Its surface, next to the weight in the paper chooser, e.g. 'Smooth, matte' */
  surface: string;
  /** Two or three words that set it apart, as labels in the paper chooser */
  labels: string[];
  /** What it suits best, in a few words each; the chooser's row shows the first */
  idealFor: string[];
  title: string;
  description: string;
  lead: string;
  summary: string[];
  about: string[];
  /** Label and value, e.g. ['Weight', '308 g/m²'] */
  specs: [string, string][];
  bestFor: string[];
  lessFor: string;
}

export interface PaperPage {
  /** The address in both languages: /nl/papier/hahnemuhle-photo-rag, /en/paper/hahnemuhle-photo-rag */
  slug: string;
  brand: string;
  name: string;
  weightGsm: number;
  image?: string;
  /** A second photo, of the paper's surface up close */
  closeup?: string;
  /** The column of the Your design price table this paper is sold at: every fine art paper costs the same */
  price: 'poster' | 'cotton';
  /** We print on it, but it is not in the order menu yet: it is ordered by email */
  onRequest?: boolean;
  /** Not printed on yet */
  soon?: boolean;
  /** Has a page, but no tile in the paper chooser */
  offMenu?: boolean;
  nl: PaperText;
  en: PaperText;
}

/** The paper pages have a translated address: /nl/papier, /en/paper */
export const PAPERS_SEGMENT: Record<string, string> = { nl: 'papier', en: 'paper' };

export function paperPath(language: string, slug?: string): string {
  const segment = PAPERS_SEGMENT[language] ?? PAPERS_SEGMENT['en'];
  return slug ? `/${segment}/${slug}` : `/${segment}`;
}

export function paperText(paper: PaperPage, language: string): PaperText {
  return language === 'nl' ? paper.nl : paper.en;
}

export function paperBySlug(slug: string): PaperPage | undefined {
  return PAPER_PAGES.find((p) => p.slug === slug);
}

/** 'Hahnemühle Photo Rag'; our own Premium Poster has no brand in front. Also the paper's name on the order */
export function paperName(paper: PaperPage | null): string {
  return paper ? [paper.brand, paper.name].filter(Boolean).join(' ') : '';
}

/** A price group: every paper in it costs the same */
export interface PaperTier {
  id: PaperPage['price'];
  /** The backend's paper option the tier is sold as (the option's value); the paper itself travels as the option's name */
  grade: string;
  /** The paper's name on the order when the studio picks it, so the team sees the choice is theirs */
  studioChoiceName: string;
  /** One of its papers up close, in the tier toggle */
  image: string;
}

/** Cheapest first */
export const PAPER_TIERS: PaperTier[] = [
  { id: 'poster', grade: 'Home', studioChoiceName: "Studio's choice: Premium Poster (Fujifilm)", image: `${IMAGES}/paper-fine-art-1.webp` },
  { id: 'cotton', grade: 'Museum', studioChoiceName: "Studio's choice: Fine Art (Hahnemühle)", image: `${IMAGES}/paper-art-1.webp` },
];

/** The tier and, in it, the paper the customer chose; no paper means our studio picks it */
export interface PaperChoice {
  tier: PaperTier;
  paper: PaperPage | null;
}

/** The paper a catalog print opens with */
const CATALOG_PAPER_SLUG = 'hahnemuhle-fineart-baryta';

/**
 * What a page opens with: fine art in both cases. For the customer's own image our studio picks the paper,
 * a print from the catalog opens on FineArt Baryta.
 */
export function defaultPaperChoice(ownImage: boolean): PaperChoice {
  const tier = PAPER_TIERS[PAPER_TIERS.length - 1];
  return { tier, paper: ownImage ? null : (paperBySlug(CATALOG_PAPER_SLUG) ?? null) };
}

/** The papers of a tier the customer can pick themselves */
export function papersOfTier(tier: PaperTier): PaperPage[] {
  return PAPER_PAGES.filter((p) => p.price === tier.id && !p.soon && !p.onRequest && !p.offMenu);
}

/** What the order says was chosen */
export function paperChoiceName(choice: PaperChoice): string {
  return choice.paper ? paperName(choice.paper) : choice.tier.studioChoiceName;
}

const GICLEE_NL = 'Giclée, pigmentinkt in twaalf kleuren';
const GICLEE_EN = 'Giclée, twelve pigment inks';

export const PAPER_PAGES: PaperPage[] = [
  {
    slug: 'hahnemuhle-photo-rag',
    brand: 'Hahnemühle',
    name: 'Photo Rag',
    weightGsm: 308,
    image: `${IMAGES}/paper-art-2.webp`,
    closeup: `${IMAGES}/paper-photo-rag-closeup.webp`,
    price: 'cotton',
    nl: {
      kind: 'Glad katoenpapier',
      surface: 'Glad, mat',
      labels: ['Mat', 'Glad', 'Onze favoriet'],
      idealFor: ['Schilderijen / kunstreproducties', 'Illustraties', 'Zachte tinten, galeriestijl'],
      title: 'Hahnemühle Photo Rag 308 g/m²: fine-art print op glad katoenpapier',
      description: 'Hahnemühle Photo Rag: glad, mat papier van 100% katoen, 308 g/m². Waar het voor past, wat het kost per formaat en hoe je je eigen foto erop laat printen.',
      lead: 'Glad, mat katoenpapier van 308 g/m². Het papier dat we het vaakst aanraden: het laat fijn detail en zachte kleurovergangen zien zonder zelf de aandacht te trekken.',
      summary: [
        '100% katoen, 308 g/m², mat en glad met een heel lichte, zachte structuur.',
        'Past bij bijna alles: kunstreproducties, illustraties en foto’s waarbij kleur en detail tellen.',
        'Kost hetzelfde als Museum Etching; 50 × 70 cm staat in de prijstabel hieronder.',
      ],
      about: [
        'Photo Rag is het bekendste fine-art papier van Hahnemühle, de Duitse papiermaker die sinds 1584 papier maakt. Het is gemaakt van 100% katoen, zuur- en ligninevrij, en heeft een wit, mat oppervlak dat glad aanvoelt.',
        'We printen erop als <strong>giclée</strong>: met pigmentinkt in twaalf kleuren. Omdat het oppervlak mat is, zie je geen reflecties, ook niet achter glas of bij licht van opzij.',
      ],
      specs: [
        ['Gewicht', '308 g/m²'],
        ['Materiaal', '100% katoen'],
        ['Kleur', 'Wit'],
        ['Oppervlak', 'Mat, glad'],
        ['Optische witmakers', 'Zeer weinig'],
        ['Bewaring', 'Zuur- en ligninevrij'],
        ['Druk', GICLEE_NL],
      ],
      bestFor: [
        '<strong>Kunstreproducties</strong>: aquarellen, tekeningen, prenten en illustraties.',
        '<strong>Foto’s met fijn detail</strong>: portretten, landschappen en zwart-wit met zachte grijstinten.',
        '<strong>Werk dat je wilt bewaren</strong>: katoenpapier vergeelt niet zoals houthoudend papier.',
      ],
      lessFor: 'Wil je glans en hard contrast, zoals bij een klassieke fotoafdruk? Kijk dan naar <a href="/nl/papier/hahnemuhle-fineart-baryta">FineArt Baryta</a>. Voor een schilderij waarbij je de structuur wilt voelen past <a href="/nl/papier/hahnemuhle-museum-etching">Museum Etching</a> beter.',
    },
    en: {
      kind: 'Smooth cotton paper',
      surface: 'Smooth, matte',
      labels: ['Matte', 'Smooth', 'Signature choice'],
      idealFor: ['Paintings / art reproductions', 'Illustrations', 'Soft tones, gallery style'],
      title: 'Hahnemühle Photo Rag 308 gsm: fine art print on smooth cotton paper',
      description: 'Hahnemühle Photo Rag: smooth, matte 100% cotton paper, 308 gsm. What it suits, what it costs per size and how to have your own photo printed on it.',
      lead: 'Smooth, matte cotton paper at 308 gsm. The paper we recommend most often: it shows fine detail and soft colour transitions without drawing attention to itself.',
      summary: [
        '100% cotton, 308 gsm, matte and smooth with a very light, soft texture.',
        'Suits almost anything: art reproductions, illustrations and photos where colour and detail matter.',
        'Costs the same as Museum Etching; 50 × 70 cm is in the price table below.',
      ],
      about: [
        'Photo Rag is the best-known fine art paper from Hahnemühle, the German mill that has been making paper since 1584. It is made of 100% cotton, acid- and lignin-free, with a white, matte surface that feels smooth.',
        'We print on it as a <strong>giclée</strong>: with twelve pigment inks. Because the surface is matte there are no reflections, not behind glass and not in light from the side.',
      ],
      specs: [
        ['Weight', '308 gsm'],
        ['Material', '100% cotton'],
        ['Tone', 'White'],
        ['Surface', 'Matte, smooth'],
        ['Optical brighteners', 'Very low'],
        ['Archival', 'Acid- and lignin-free'],
        ['Printing', GICLEE_EN],
      ],
      bestFor: [
        '<strong>Art reproductions</strong>: watercolours, drawings, prints and illustrations.',
        '<strong>Photos with fine detail</strong>: portraits, landscapes and black-and-white with soft greys.',
        '<strong>Work you want to keep</strong>: cotton paper does not yellow the way wood-pulp paper does.',
      ],
      lessFor: 'Want gloss and hard contrast, like a classic photographic print? Look at <a href="/en/paper/hahnemuhle-fineart-baryta">FineArt Baryta</a>. For a painting whose texture you want to feel, <a href="/en/paper/hahnemuhle-museum-etching">Museum Etching</a> fits better.',
    },
  },
  {
    slug: 'hahnemuhle-museum-etching',
    brand: 'Hahnemühle',
    name: 'Museum Etching',
    weightGsm: 350,
    image: `${IMAGES}/paper-art-1.webp`,
    price: 'cotton',
    nl: {
      kind: 'Gestructureerd katoenpapier',
      surface: 'Gestructureerd, mat',
      labels: ['Gestructureerd', 'Mat', 'Schilderachtig'],
      idealFor: ['Schilderijen in olie- of acrylstijl', 'Kunstwerken waarbij structuur iets toevoegt'],
      title: 'Hahnemühle Museum Etching 350 g/m²: fine-art print op gestructureerd katoenpapier',
      description: 'Hahnemühle Museum Etching: zwaar katoenpapier van 350 g/m² met een fijne structuur, zonder optische witmakers. Voor schilderijen en werk met textuur. Prijzen per formaat.',
      lead: 'Zwaar katoenpapier van 350 g/m² met een fijne, voelbare structuur. Een schilderij krijgt er de tastbaarheid van het origineel door terug.',
      summary: [
        '100% katoen, 350 g/m², mat met een fijne structuur. Ons zwaarste papier.',
        'Natuurlijk wit, zonder optische witmakers.',
        'Het mooist voor olieverf- en acrylschilderijen; bij een haarscherpe foto kan de structuur afleiden.',
      ],
      about: [
        'Museum Etching is een etspapier: dik, stevig en met een structuur die je ziet en voelt. Het is van 100% katoen, zuur- en ligninevrij, en heeft een natuurlijk witte tint omdat er geen optische witmakers in zitten.',
        'We printen erop als <strong>giclée</strong>, met pigmentinkt in twaalf kleuren. De structuur vangt het licht net anders dan glad papier, waardoor penseelstreken en kleurvlakken diepte krijgen.',
      ],
      specs: [
        ['Gewicht', '350 g/m²'],
        ['Materiaal', '100% katoen'],
        ['Kleur', 'Natuurlijk wit'],
        ['Oppervlak', 'Mat, fijn gestructureerd'],
        ['Optische witmakers', 'Geen'],
        ['Bewaring', 'Zuur- en ligninevrij'],
        ['Druk', GICLEE_NL],
      ],
      bestFor: [
        '<strong>Schilderijen</strong> in olieverf of acryl, van oude meesters tot modern werk.',
        '<strong>Werk waarbij textuur iets toevoegt</strong>: pastel, houtskool, expressieve kleurvlakken.',
        '<strong>Grote formaten</strong>: het zware papier blijft mooi vlak.',
      ],
      lessFor: 'Bij fijne lijntekeningen en haarscherpe foto’s kan de structuur afleiden. Kies dan het gladde <a href="/nl/papier/hahnemuhle-photo-rag">Photo Rag</a>.',
    },
    en: {
      kind: 'Textured cotton paper',
      surface: 'Textured, matte',
      labels: ['Textured', 'Matte', 'Painterly'],
      idealFor: ['Oil/acrylic style paintings', 'Artworks where texture adds value'],
      title: 'Hahnemühle Museum Etching 350 gsm: fine art print on textured cotton paper',
      description: 'Hahnemühle Museum Etching: heavy 350 gsm cotton paper with a fine texture and no optical brighteners. For paintings and textured work. Prices per size.',
      lead: 'Heavy cotton paper at 350 gsm with a fine texture you can feel. It gives a painting back some of the presence of the original.',
      summary: [
        '100% cotton, 350 gsm, matte with a fine texture. Our heaviest paper.',
        'Natural white, without optical brighteners.',
        'At its best with oil and acrylic paintings; on a razor-sharp photo the texture can distract.',
      ],
      about: [
        'Museum Etching is an etching paper: thick, sturdy and with a texture you can see and feel. It is 100% cotton, acid- and lignin-free, and has a natural white tone because it contains no optical brighteners.',
        'We print on it as a <strong>giclée</strong>, with twelve pigment inks. The texture catches the light differently from smooth paper, which gives brushstrokes and colour fields depth.',
      ],
      specs: [
        ['Weight', '350 gsm'],
        ['Material', '100% cotton'],
        ['Tone', 'Natural white'],
        ['Surface', 'Matte, finely textured'],
        ['Optical brighteners', 'None'],
        ['Archival', 'Acid- and lignin-free'],
        ['Printing', GICLEE_EN],
      ],
      bestFor: [
        '<strong>Paintings</strong> in oil or acrylic, from old masters to modern work.',
        '<strong>Work where texture adds something</strong>: pastel, charcoal, expressive colour fields.',
        '<strong>Large sizes</strong>: the heavy paper stays nicely flat.',
      ],
      lessFor: 'On fine line drawings and razor-sharp photos the texture can distract. Choose the smooth <a href="/en/paper/hahnemuhle-photo-rag">Photo Rag</a> instead.',
    },
  },
  {
    slug: 'hahnemuhle-fineart-baryta',
    brand: 'Hahnemühle',
    name: 'FineArt Baryta',
    weightGsm: 325,
    image: `${IMAGES}/paper-baryta-1.webp`,
    price: 'cotton',
    nl: {
      kind: 'Glanzend barietpapier',
      surface: 'Glad, glanzend',
      labels: ['Glans', 'Diep zwart', 'Foto'],
      idealFor: ['Foto’s met veel contrast', 'Zwart-wit'],
      title: 'Hahnemühle FineArt Baryta 325 g/m²: fine-art print met glans en diep zwart',
      description: 'Hahnemühle FineArt Baryta: helderwit, glanzend barietpapier van 325 g/m². Voor zwart-wit en foto’s met veel contrast.',
      lead: 'Helderwit, glanzend papier van 325 g/m² met een barietlaag, zoals het klassieke doka-papier. Het geeft het diepste zwart en het meeste contrast van al onze papieren.',
      summary: [
        '325 g/m², 100% alfacellulose, helderwit en hoogglanzend.',
        'De barietlaag (bariumsulfaat) geeft diep zwart en veel contrast.',
        'Het papier voor zwart-witfotografie.',
      ],
      about: [
        'Barietpapier was tientallen jaren de standaard in de donkere kamer. FineArt Baryta brengt dat karakter naar de giclée: een laag bariumsulfaat onder de coating zorgt voor een helderwit, glanzend oppervlak met een licht voelbare structuur.',
        'Het is gemaakt van 100% alfacellulose, zuur- en ligninevrij, en voldoet aan ISO 9706 voor houdbaarheid. Anders dan onze katoenpapieren bevat het optische witmakers; daar komt het helderwit vandaan.',
      ],
      specs: [
        ['Gewicht', '325 g/m²'],
        ['Materiaal', '100% alfacellulose'],
        ['Kleur', 'Helderwit'],
        ['Oppervlak', 'Hoogglans, lichte structuur'],
        ['Optische witmakers', 'Matig'],
        ['Bewaring', 'Zuur- en ligninevrij, ISO 9706'],
        ['Druk', GICLEE_NL],
      ],
      bestFor: [
        '<strong>Zwart-witfotografie</strong>: diep zwart en een groot toonbereik.',
        '<strong>Foto’s met veel contrast en verzadigde kleur</strong>: architectuur, nachtbeelden, mode.',
        '<strong>Wie de look van een klassieke fotoafdruk wil</strong>, maar dan op fine-art papier.',
      ],
      lessFor: 'Glans geeft reflecties, vooral achter glas of tegenover een raam. Wil je een rustig, mat beeld, kies dan <a href="/nl/papier/hahnemuhle-photo-rag">Photo Rag</a>.',
    },
    en: {
      kind: 'Glossy baryta paper',
      surface: 'Smooth, glossy',
      labels: ['Gloss', 'Deep blacks', 'Photo'],
      idealFor: ['High-contrast photos', 'Black and white'],
      title: 'Hahnemühle FineArt Baryta 325 gsm: fine art print with gloss and deep blacks',
      description: 'Hahnemühle FineArt Baryta: bright white, glossy baryta paper, 325 gsm. For black-and-white and high-contrast photos.',
      lead: 'Bright white, glossy paper at 325 gsm with a baryta layer, like classic darkroom paper. It gives the deepest blacks and the most contrast of all our papers.',
      summary: [
        '325 gsm, 100% alpha-cellulose, bright white and high-gloss.',
        'The baryta layer (barium sulphate) gives deep blacks and strong contrast.',
        'The paper for black-and-white photography.',
      ],
      about: [
        'For decades baryta paper was the standard in the darkroom. FineArt Baryta brings that character to the giclée: a layer of barium sulphate under the coating gives a bright white, glossy surface with a texture you can just feel.',
        'It is made of 100% alpha-cellulose, acid- and lignin-free, and meets ISO 9706 for permanence. Unlike our cotton papers it contains optical brighteners; that is where the bright white comes from.',
      ],
      specs: [
        ['Weight', '325 gsm'],
        ['Material', '100% alpha-cellulose'],
        ['Tone', 'Bright white'],
        ['Surface', 'High-gloss, light texture'],
        ['Optical brighteners', 'Moderate'],
        ['Archival', 'Acid- and lignin-free, ISO 9706'],
        ['Printing', GICLEE_EN],
      ],
      bestFor: [
        '<strong>Black-and-white photography</strong>: deep blacks and a wide tonal range.',
        '<strong>Photos with strong contrast and saturated colour</strong>: architecture, night scenes, fashion.',
        '<strong>Anyone who wants the look of a classic photographic print</strong>, on fine art paper.',
      ],
      lessFor: 'Gloss means reflections, especially behind glass or opposite a window. For a calm, matte image choose <a href="/en/paper/hahnemuhle-photo-rag">Photo Rag</a>.',
    },
  },
  {
    slug: 'canson-rag-photographique',
    brand: 'Canson',
    name: 'Rag Photographique II',
    weightGsm: 310,
    image: `${IMAGES}/paper-photo-1.webp`,
    price: 'cotton',
    offMenu: true,
    nl: {
      kind: 'Glad katoenpapier voor fotografie',
      surface: 'Glad, mat',
      labels: ['Mat', 'Glad', 'Kleurecht'],
      idealFor: ['Kunstreproducties en schilderijen', 'Fotografie met een fine-art uitstraling'],
      title: 'Canson Rag Photographique II 310 g/m²: fine-art print voor fotografie',
      description: 'Canson Infinity Rag Photographique II: glad, mat papier van 100% katoen, 310 g/m², gemaakt voor fotografie.',
      lead: 'Glad, mat katoenpapier van 310 g/m², door Canson gemaakt voor fotografie. Neutraal van kleur, met veel detail en een zachte fine-art uitstraling.',
      summary: [
        '100% katoen, 310 g/m², mat en zeer glad.',
        'Neutrale kleurweergave: gemaakt voor foto’s die er als fine art uit moeten zien.',
      ],
      about: [
        'Canson maakt in Frankrijk al eeuwen papier voor kunstenaars. Rag Photographique is hun katoenpapier voor fotografie: 100% katoen, met een mat oppervlak dat gladder is dan de meeste fine-art papieren.',
        'Door dat gladde oppervlak blijft fijn detail scherp, terwijl het matte papier de foto de rust van een kunstdruk geeft.',
      ],
      specs: [
        ['Gewicht', '310 g/m²'],
        ['Materiaal', '100% katoen'],
        ['Oppervlak', 'Mat, zeer glad'],
        ['Druk', GICLEE_NL],
      ],
      bestFor: [
        '<strong>Fotografie</strong> die er als fine art uit moet zien, zonder glans.',
        '<strong>Kunstreproducties</strong> waarbij neutrale kleur belangrijk is.',
      ],
      lessFor: 'Wil je glans en hard contrast, kies dan <a href="/nl/papier/hahnemuhle-fineart-baryta">FineArt Baryta</a>. Vergelijkbaar glad: <a href="/nl/papier/hahnemuhle-photo-rag">Hahnemühle Photo Rag</a>.',
    },
    en: {
      kind: 'Smooth cotton paper for photography',
      surface: 'Smooth, matte',
      labels: ['Matte', 'Smooth', 'Colour-accurate'],
      idealFor: ['Art reproductions and paintings', 'Photography with a fine art look'],
      title: 'Canson Rag Photographique II 310 gsm: fine art print for photography',
      description: 'Canson Infinity Rag Photographique II: smooth, matte 100% cotton paper, 310 gsm, made for photography.',
      lead: 'Smooth, matte cotton paper at 310 gsm, made by Canson for photography. Neutral in colour, with plenty of detail and a soft fine art look.',
      summary: [
        '100% cotton, 310 gsm, matte and very smooth.',
        'Neutral colour: made for photos that should look like fine art.',
      ],
      about: [
        'Canson has been making paper for artists in France for centuries. Rag Photographique is their cotton paper for photography: 100% cotton, with a matte surface smoother than most fine art papers.',
        'That smooth surface keeps fine detail sharp, while the matte paper gives the photo the calm of an art print.',
      ],
      specs: [
        ['Weight', '310 gsm'],
        ['Material', '100% cotton'],
        ['Surface', 'Matte, very smooth'],
        ['Printing', GICLEE_EN],
      ],
      bestFor: [
        '<strong>Photography</strong> that should look like fine art, without gloss.',
        '<strong>Art reproductions</strong> where neutral colour matters.',
      ],
      lessFor: 'For gloss and hard contrast choose <a href="/en/paper/hahnemuhle-fineart-baryta">FineArt Baryta</a>. Similarly smooth: <a href="/en/paper/hahnemuhle-photo-rag">Hahnemühle Photo Rag</a>.',
    },
  },
  {
    slug: 'premium-poster',
    brand: '',
    name: 'Premium Poster',
    weightGsm: 234,
    image: `${IMAGES}/paper-fine-art-1.webp`,
    price: 'poster',
    nl: {
      kind: 'Mat fotopapier',
      surface: 'Fijn gestructureerd, mat',
      labels: ['Fotopapier', 'Mat'],
      idealFor: ['Kunstprints met de beste prijs-kwaliteit', 'Kunst voor elke dag'],
      title: 'Premium Poster 234 g/m²: fotoafdruk op Fujifilm-papier',
      description: 'Premium Poster: een echte fotoafdruk op mat Fujifilm Crystal Archive-papier, 234 g/m². Levendige kleuren voor de beste prijs. Prijzen per formaat.',
      lead: 'Een echte fotoafdruk op mat Fujifilm-papier van 234 g/m². Levendige kleuren en diep zwart, voor de laagste prijs per formaat.',
      summary: [
        'Fotografische afdruk op Fujifilm Crystal Archive-papier, 234 g/m².',
        'Fijn mat oppervlak: geen schittering en weinig gevoelig voor vingerafdrukken.',
        'Onze voordeligste keuze; geen katoenpapier, dus niet bedoeld voor museale bewaring.',
      ],
      about: [
        'Premium Poster is geen dun posterpapier. Het is een fotografische afdruk, belicht op Fujifilm Crystal Archive-papier, met levendige kleuren en diep zwart.',
        'Het fijne matte oppervlak geeft geen schittering. Het is geen katoenpapier en geen giclée; voor een mooie print aan je muur is het wel de beste prijs-kwaliteit.',
      ],
      specs: [
        ['Gewicht', '234 g/m²'],
        ['Materiaal', 'Fujifilm Crystal Archive fotopapier'],
        ['Oppervlak', 'Mat, fijn gestructureerd'],
        ['Druk', 'Fotografische afdruk'],
      ],
      bestFor: [
        '<strong>Kunst voor elke dag</strong>: een eerste werk aan de muur.',
        '<strong>Kinderkamer, studentenkamer</strong> of iets dat je vaker wisselt.',
        '<strong>Je eigen foto’s</strong> met levendige kleuren tegen een lagere prijs.',
      ],
      lessFor: 'Wil je een print die generaties meegaat, kies dan katoenpapier: <a href="/nl/papier/hahnemuhle-photo-rag">Photo Rag</a> of <a href="/nl/papier/hahnemuhle-museum-etching">Museum Etching</a>.',
    },
    en: {
      kind: 'Matte photo paper',
      surface: 'Fine-textured, matte',
      labels: ['Photo paper', 'Matte'],
      idealFor: ['Best value art prints', 'Everyday art display'],
      title: 'Premium Poster 234 gsm: photographic print on Fujifilm paper',
      description: 'Premium Poster: a real photographic print on matte Fujifilm Crystal Archive paper, 234 gsm. Vivid colours at the best price. Prices per size.',
      lead: 'A real photographic print on matte Fujifilm paper, 234 gsm. Vivid colours and deep blacks, at the lowest price per size.',
      summary: [
        'Photographic print on Fujifilm Crystal Archive paper, 234 gsm.',
        'Fine matte surface: no glare and resistant to fingerprints.',
        'Our best-value choice; not cotton paper, so not meant for museum archiving.',
      ],
      about: [
        'Premium Poster is not thin poster paper. It is a photographic print, exposed on Fujifilm Crystal Archive paper, with vivid colours and deep blacks.',
        'The fine matte surface has no glare. It is not cotton paper and not a giclée; for a beautiful print on your wall it is the best value.',
      ],
      specs: [
        ['Weight', '234 gsm'],
        ['Material', 'Fujifilm Crystal Archive photo paper'],
        ['Surface', 'Matte, finely textured'],
        ['Printing', 'Photographic print'],
      ],
      bestFor: [
        '<strong>Everyday art</strong>: a first artwork on the wall.',
        '<strong>A child’s room, a student room</strong> or anything you change more often.',
        '<strong>Your own photos</strong> in vivid colours at a lower price.',
      ],
      lessFor: 'For a print that lasts generations choose cotton paper: <a href="/en/paper/hahnemuhle-photo-rag">Photo Rag</a> or <a href="/en/paper/hahnemuhle-museum-etching">Museum Etching</a>.',
    },
  },
  {
    slug: 'premium-poster-silk',
    brand: '',
    name: 'Premium Poster Silk',
    weightGsm: 232,
    price: 'poster',
    nl: {
      kind: 'Fotopapier met zijdeglans',
      surface: 'Zijdeglans',
      labels: ['Fotopapier', 'Zijdeglans', 'FSC'],
      idealFor: ['Foto’s in levendige kleuren'],
      title: 'Premium Poster Silk 232 g/m²: fotoafdruk met zijdeglans op Fujifilm-papier',
      description: 'Premium Poster Silk: een echte fotoafdruk op Fujifilm Crystal Archive-papier met zijdeglans, 232 g/m², FSC-gecertificeerd. Prijzen per formaat.',
      lead: 'Een echte fotoafdruk op Fujifilm-papier van 232 g/m² met een zijdeglans. Kleuren krijgen meer diepte dan op mat papier, zonder de spiegeling van hoogglans.',
      summary: [
        'Fotografische afdruk op Fujifilm Crystal Archive-papier, 232 g/m².',
        'Zijdeglans met een fijne structuur: diepe kleuren en weinig spiegeling.',
        'Kost hetzelfde als de matte Premium Poster. Het papier is FSC-gecertificeerd.',
      ],
      about: [
        'Premium Poster Silk is dezelfde fotografische afdruk als onze matte Premium Poster, belicht op Fujifilm Crystal Archive-papier, maar met een zijdeglanzend oppervlak.',
        'De fijne structuur breekt het licht, zodat je minder spiegeling ziet dan bij hoogglans. Kleuren en zwart zijn dieper dan op mat papier. Het is geen katoenpapier en geen giclée.',
      ],
      specs: [
        ['Gewicht', '232 g/m²'],
        ['Materiaal', 'Fujifilm Crystal Archive fotopapier, FSC-gecertificeerd'],
        ['Oppervlak', 'Zijdeglans, fijn gestructureerd'],
        ['Druk', 'Fotografische afdruk'],
      ],
      bestFor: [
        '<strong>Je eigen foto’s</strong>: vakantie, familie en portretten.',
        '<strong>Beelden met veel kleur en contrast</strong> die van een lichte glans beter worden.',
        '<strong>Wie de look van een klassieke fotoafdruk wil</strong> voor een lage prijs.',
      ],
      lessFor: 'Hangt de print tegenover een raam of wil je helemaal geen glans, kies dan de matte <a href="/nl/papier/premium-poster">Premium Poster</a>. Voor een print die generaties meegaat kies je fine-art papier, bijvoorbeeld <a href="/nl/papier/hahnemuhle-photo-rag">Photo Rag</a>.',
    },
    en: {
      kind: 'Photo paper with a silk sheen',
      surface: 'Silk sheen',
      labels: ['Photo paper', 'Silk sheen', 'FSC'],
      idealFor: ['Photos in vivid colours'],
      title: 'Premium Poster Silk 232 gsm: photographic print with a silk sheen on Fujifilm paper',
      description: 'Premium Poster Silk: a real photographic print on Fujifilm Crystal Archive paper with a silk sheen, 232 gsm, FSC-certified. Prices per size.',
      lead: 'A real photographic print on Fujifilm paper, 232 gsm, with a silk sheen. Colours gain more depth than on matte paper, without the reflections of high gloss.',
      summary: [
        'Photographic print on Fujifilm Crystal Archive paper, 232 gsm.',
        'Silk sheen with a fine texture: deep colours and few reflections.',
        'Costs the same as the matte Premium Poster. The paper is FSC-certified.',
      ],
      about: [
        'Premium Poster Silk is the same photographic print as our matte Premium Poster, exposed on Fujifilm Crystal Archive paper, but with a silk surface.',
        'The fine texture breaks up the light, so you see fewer reflections than with high gloss. Colours and blacks are deeper than on matte paper. It is not cotton paper and not a giclée.',
      ],
      specs: [
        ['Weight', '232 gsm'],
        ['Material', 'Fujifilm Crystal Archive photo paper, FSC-certified'],
        ['Surface', 'Silk sheen, finely textured'],
        ['Printing', 'Photographic print'],
      ],
      bestFor: [
        '<strong>Your own photos</strong>: holidays, family and portraits.',
        '<strong>Images with plenty of colour and contrast</strong> that gain from a light sheen.',
        '<strong>Anyone who wants the look of a classic photographic print</strong> at a low price.',
      ],
      lessFor: 'If the print hangs opposite a window, or you want no sheen at all, choose the matte <a href="/en/paper/premium-poster">Premium Poster</a>. For a print that lasts generations choose fine art paper, such as <a href="/en/paper/hahnemuhle-photo-rag">Photo Rag</a>.',
    },
  },
];
