export const SizeOptions = [
  { id: 1, name: '13x18', val1: 13, val2: 18 },
  { id: 2, name: '21x30', val1: 21, val2: 30 },
  { id: 3, name: '30x40', val1: 30, val2: 40 },
  { id: 4, name: '40x60', val1: 40, val2: 60 },
  { id: 5, name: '50x70', val1: 50, val2: 70 },
  { id: 6, name: '60x90', val1: 60, val2: 90 },
];

export const RolledUpDefaultThumbnailUrl =
  'https://ecombone.blob.core.windows.net/ecomm-processed-images/victorious-rock-0d8f88603.2.azurestaticapps.net/12/12-small.jpeg';

export const HahnemühleLogoUrl =
  'https://genstorageaccount3116.blob.core.windows.net/printme-images/hahnemuehle.jpg';

export interface DesignFrame {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  mask: string;
  maskWithoutMat: string;
}

export const FrameOptions: DesignFrame[] = [
  {
    id: 1,
    name: 'Black | EDSBRUK',
    description: 'Classic black frame with a clean, timeless look.',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/edsbruk-frame-black-stained__0723741_pe734158_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame8-edsbruk-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame8-edsbruk.png',
  },
  {
    id: 2,
    name: 'White Pine | PLOMMONTRÄD',
    description: 'Warm, light wood effect for natural interiors.',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/plommontrad-frame-white-stained-pine-effect__1202413_pe905936_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame6-plommon-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame6-plommon.png',
  },
  {
    id: 3,
    name: 'White | EDSBRUK',
    description: 'Crisp white frame for a bright, minimal finish.',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/edsbruk-frame-white__0706506_pe725889_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame5-edsbruk-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame5-edsbruk.png',
  },
  {
    id: 4,
    name: 'Brown | RAMSBORG',
    description: 'Traditional brown wood look with a premium feel.',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/ramsborg-frame-brown__0726700_pe735389_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame7-ramsborg-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame7-ramsborg.png',
  },
  {
    id: 5,
    name: 'Black | RÖDALM',
    description: 'Minimal black frame with a sleek profile.',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/rodalm-frame-black__1251233_pe924195_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame1-rodalm-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame1-rodalm.png',
  },
  {
    id: 6,
    name: 'Black | KNOPPÄNG',
    description: 'Bold black frame with clean edges.',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/knoppang-frame-black__0638249_pe698799_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame2-knoppang-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame2-knoppang.png',
  },
  {
    id: 7,
    name: 'Gold | SILVERHÖJDEN',
    description: 'Gold accent frame for a statement look.',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/silverhojden-frame-gold-colour__1179571_pe895993_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame4-silverhojden-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame4-silverhojden.png',
  },
  {
    id: 8,
    name: 'Black | LOMVIKEN',
    description: 'Matte black wide frame for strong contrast.',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/lomviken-frame-black__0386296_pe558681_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame3-lomviken-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame3-lomviken.png',
  },
];

export const FrameOptionsByValue: Record<string, DesignFrame> =
  FrameOptions.reduce(
    (acc, frame) => {
      acc[frame.name] = frame;
      return acc;
    },
    {} as Record<string, DesignFrame>,
  );

export type PaperGrade = 'Museum' | 'Gallery' | 'Studio' | 'Home';
export type PriceTier = '$' | '$$' | '$$$';

export interface Paper {
  id: string;
  category: string;
  name: string;
  weightGsm: number;
  surface: string;
  printType: string;
  lookFeel: string[];
  bestFor: string[];
  notIdealFor: string[];
  uxLabels: string[];
  badgeTitle: string;
  thumbnail: string;
  grade: PaperGrade;
  priceTier: PriceTier;
}

// Museum grade papers
export const MuseumPapers: Paper[] = [
  {
    id: 'art_photo_rag_308',
    category: 'Art Print',
    name: 'Hahnemühle Photo Rag',
    weightGsm: 308,
    surface: 'Smooth, Matte',
    printType: 'Fine art pigment (giclée class)',
    lookFeel: [
      'Natural colors',
      'Balanced contrast',
      'No glare',
      'Premium cotton feel',
    ],
    bestFor: [
      'Paintings / art reproductions',
      'Illustrations',
      'Soft tones, gallery style',
    ],
    notIdealFor: ['People who want glossy / punchy photo look'],
    uxLabels: ['Museum grade', 'Mat', 'Smooth', 'Signature choice'],
    badgeTitle: 'Museum Smooth',
    thumbnail:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/paper-art-2.webp',
    grade: 'Museum',
    priceTier: '$$$',
  },
  {
    id: 'art_german_etching_310',
    category: 'Art Print',
    name: 'Hahnemühle German Etching',
    weightGsm: 310,
    surface: 'Textured, Matte',
    printType: 'Fine art pigment (giclée class)',
    lookFeel: ['Painterly texture', 'Rich, tactile paper feel', 'No glare'],
    bestFor: [
      'Oil/acrylic style paintings',
      'Artworks where texture adds value',
    ],
    notIdealFor: ['Ultra-fine line art where texture may distract'],
    uxLabels: ['Museum grade', 'Textured', 'Mat', 'Painterly'],
    badgeTitle: 'Museum Textured',
    thumbnail:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/paper-art-1.webp',
    grade: 'Museum',
    priceTier: '$$$',
  },
];

// Gallery grade paper
export const GalleryPapers: Paper[] = [
  {
    id: 'art_canson_rag_photographique_310',
    category: 'Art Print',
    name: 'Canson Infinity Rag Photographique II',
    weightGsm: 310,
    surface: 'Smooth, Matte',
    printType: 'Fine art pigment (giclée class)',
    lookFeel: [
      'Clean, neutral matte finish',
      'High detail with a soft fine-art feel',
      'No glare',
      'Premium rag paper feel',
    ],
    bestFor: [
      'Art reproductions and paintings',
      'Photography that should look "fine art" (not glossy)',
      'Neutral, color-accurate prints',
    ],
    notIdealFor: ['Glossy or ultra-punchy photo look'],
    uxLabels: ['Gallery grade', 'Mat', 'Smooth', 'Color-accurate'],
    badgeTitle: 'Gallery Smooth (Alternative)',
    thumbnail:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/paper-photo-1.webp',
    grade: 'Studio',
    priceTier: '$$',
  },
];

const StudioPapers: Paper[] = [];

// Home grade paper
const HomePapers: Paper[] = [
  {
    id: 'home_fineart_poster',
    category: 'Home',
    name: 'Fine Art Poster',
    weightGsm: 200,
    surface: 'Smooth, Matte',
    printType: 'Giclée 12-color fine art printing',
    lookFeel: [
      'Vivid, accurate colors',
      'Stunning depth',
      'Smooth matte finish',
      'Glare-free display',
    ],
    bestFor: [
      'Best value art prints',
      'Designers',
      'Everyday art display',
      'Budget-conscious buyers',
    ],
    notIdealFor: ['Archival/museum-grade requirements'],
    uxLabels: ['Home grade', 'FSC-certified', 'Mat & Smooth'],
    badgeTitle: 'Home',
    thumbnail:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/paper-fine-art-1.webp',
    grade: 'Home',
    priceTier: '$',
  },
];

// All papers to show in UI (Museum papers + Gallery papers + Home papers)
export const AllPapers: Paper[] = [
  ...HomePapers,
  ...StudioPapers,
  ...MuseumPapers,
  ...GalleryPapers,
];

// Grade badge colors
export const GradeBadgeColors: Record<
  PaperGrade,
  { bg: string; text: string }
> = {
  Museum: { bg: 'bg-[#384f8c]/10', text: 'text-[#db2877]' },
  Gallery: { bg: 'bg-[#384f8c]/10', text: 'text-[#db2877]' },
  Studio: { bg: 'bg-[#384f8c]/10', text: 'text-[#384f8c]' },
  Home: { bg: 'bg-[#384f8c]/10', text: 'text-[#167a92]' },
};

// Price tier colors
export const PriceTierColors: Record<PriceTier, string> = {
  $: 'text-[#167a92]',
  $$: 'text-[#384f8c]',
  $$$: 'text-[#db2877]',
};
