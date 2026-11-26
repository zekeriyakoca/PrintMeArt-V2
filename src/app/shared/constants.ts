export const SizeOptions = [
  { id: 1, name: '13x18', val1: 13, val2: 18 },
  { id: 2, name: '21x30', val1: 21, val2: 30 },
  { id: 3, name: '30x40', val1: 30, val2: 40 },
  { id: 4, name: '40x60', val1: 40, val2: 60 },
  { id: 5, name: '50x70', val1: 50, val2: 70 },
  { id: 6, name: '60x90', val1: 60, val2: 90 },
];

/** Sizes a frame is offered in; the other sizes are sold rolled up only */
export const FramedSizeNames = ['21x30', '30x40', '40x60', '50x70'];

export const RolledUpDefaultThumbnailUrl = 'https://ecombone.blob.core.windows.net/ecomm-processed-images/victorious-rock-0d8f88603.2.azurestaticapps.net/12/12-small.jpeg';

export const HahnemühleLogoUrl = 'https://genstorageaccount3116.blob.core.windows.net/printme-images/hahnemuehle.jpg';

export interface DesignFrame {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  mask: string;
  maskWithoutMat: string;
  /** Not offered on the storefront for now; set to false (or remove) to offer it again */
  hidden?: boolean;
  /** Shown but can't be chosen or ordered ("Out of stock for now"); set to false (or remove) to sell it again */
  outOfStock?: boolean;
  /** Masks made for specific print ratios (short side / long side); the closest one is used */
  masksByRatio?: FrameMask[];
}

export interface FrameMask {
  ratio: number;
  mask: string;
  maskWithoutMat: string;
  /** Same frame turned on its side, for landscape prints */
  maskLandscape: string;
  maskWithoutMatLandscape: string;
}

export const FrameOptions: DesignFrame[] = [
  {
    id: 1,
    name: 'Black | EDSBRUK',
    description: 'Classic black frame with a clean, timeless look.',
    thumbnail: 'https://www.ikea.com/nl/en/images/products/edsbruk-frame-black-stained__0723741_pe734158_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame8-edsbruk-mat.png',
    maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame8-edsbruk.png',
    hidden: true,
  },
  {
    id: 2,
    name: 'White Pine | PLOMMONTRÄD',
    description: 'Warm, light wood effect for natural interiors.',
    thumbnail: 'https://www.ikea.com/nl/en/images/products/plommontrad-frame-white-stained-pine-effect__1202413_pe905936_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame6-plommon-mat.png',
    maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame6-plommon.png',
    hidden: true,
  },
  {
    id: 3,
    name: 'White | EDSBRUK',
    description: 'Crisp white frame for a bright, minimal finish.',
    thumbnail: 'https://www.ikea.com/nl/en/images/products/edsbruk-frame-white__0706506_pe725889_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame5-edsbruk-mat.png',
    maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame5-edsbruk.png',
    hidden: true,
  },
  {
    id: 4,
    name: 'Brown | RAMSBORG',
    description: 'Traditional brown wood look with a premium feel.',
    thumbnail: 'https://www.ikea.com/nl/en/images/products/ramsborg-frame-brown__0726700_pe735389_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame7-ramsborg-mat.png',
    maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame7-ramsborg.png',
  },
  {
    id: 5,
    name: 'Black | RÖDALM',
    description: 'Minimal black frame with a sleek profile.',
    thumbnail: 'https://www.ikea.com/nl/en/images/products/rodalm-frame-black__1251233_pe924195_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame1-rodalm-mat.png',
    maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame1-rodalm.png',
  },
  {
    id: 6,
    name: 'Black | KNOPPÄNG',
    description: 'Bold black frame with clean edges.',
    thumbnail: 'https://www.ikea.com/nl/en/images/products/knoppang-frame-black__0638249_pe698799_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame2-knoppang-mat.png',
    maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame2-knoppang.png',
  },
  {
    id: 7,
    name: 'Gold | SILVERHÖJDEN',
    description: 'Gold accent frame for a statement look.',
    thumbnail: 'https://www.ikea.com/nl/en/images/products/silverhojden-frame-gold-colour__1179571_pe895993_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame4-silverhojden-mat.png',
    maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame4-silverhojden.png',
  },
  {
    id: 8,
    name: 'Black | LOMVIKEN',
    description: 'Matte black wide frame for strong contrast.',
    thumbnail: 'https://www.ikea.com/nl/en/images/products/lomviken-frame-black__0386296_pe558681_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame3-lomviken-mat.png',
    maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame3-lomviken.png',
  },
  {
    id: 9,
    name: 'Natural Oak',
    description: 'Natural oak frame with a warm, visible wood grain.',
    outOfStock: true,
    thumbnail: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame-oak-thumb.webp',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-3x4-mat.png',
    maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-3x4-v2.png',
    masksByRatio: [
      {
        ratio: 2 / 3,
        mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-2x3-mat.png',
        maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-2x3-v2.png',
        maskLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-2x3-landscape-mat.png',
        maskWithoutMatLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-2x3-landscape-v2.png',
      },
      {
        ratio: 0.7,
        mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-7x10-mat.png',
        maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-7x10-v2.png',
        maskLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-7x10-landscape-mat.png',
        maskWithoutMatLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-7x10-landscape-v2.png',
      },
      {
        ratio: 13 / 18,
        mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-13x18-mat.png',
        maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-13x18-v2.png',
        maskLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-13x18-landscape-mat.png',
        maskWithoutMatLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-13x18-landscape-v2.png',
      },
      {
        ratio: 3 / 4,
        mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-3x4-mat.png',
        maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-3x4-v2.png',
        maskLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-3x4-landscape-mat.png',
        maskWithoutMatLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-3x4-landscape-v2.png',
      },
      // Square, for room mockups only (no frame is sold square); there's no matted square mask
      {
        ratio: 1,
        mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-1x1-v2.png',
        maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-1x1-v2.png',
        maskLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-1x1-v2.png',
        maskWithoutMatLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame11-oak-1x1-v2.png',
      },
    ],
  },
  {
    id: 10,
    name: 'Dark Walnut',
    description: 'Dark walnut frame with a fine, straight grain and a flat 1.5 cm deep profile.',
    outOfStock: true,
    thumbnail: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-thumb.webp',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-3x4-mat.png',
    maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-3x4.png',
    masksByRatio: [
      {
        ratio: 2 / 3,
        mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-2x3-mat.png',
        maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-2x3.png',
        maskLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-2x3-landscape-mat.png',
        maskWithoutMatLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-2x3-landscape.png',
      },
      {
        ratio: 0.7,
        mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-7x10-mat.png',
        maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-7x10.png',
        maskLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-7x10-landscape-mat.png',
        maskWithoutMatLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-7x10-landscape.png',
      },
      {
        ratio: 13 / 18,
        mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-13x18-mat.png',
        maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-13x18.png',
        maskLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-13x18-landscape-mat.png',
        maskWithoutMatLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-13x18-landscape.png',
      },
      {
        ratio: 3 / 4,
        mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-3x4-mat.png',
        maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-3x4.png',
        maskLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-3x4-landscape-mat.png',
        maskWithoutMatLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-3x4-landscape.png',
      },
      // Square, for room mockups only (no frame is sold square); there's no matted square mask
      {
        ratio: 1,
        mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-1x1.png',
        maskWithoutMat: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-1x1.png',
        maskLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-1x1.png',
        maskWithoutMatLandscape: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame12-walnut-1x1.png',
      },
    ],
  },
];

export const FrameOptionsByValue: Record<string, DesignFrame> = FrameOptions.reduce(
  (acc, frame) => {
    acc[frame.name] = frame;
    return acc;
  },
  {} as Record<string, DesignFrame>,
);

/** True when a frame of this name is out of stock for now */
export function isFrameOutOfStock(frameName: string | null | undefined): boolean {
  return !!frameName && !!FrameOptionsByValue[frameName]?.outOfStock;
}

/** The frame we sell; a rolled-up print is shown in it too */
const SoldFrame = FrameOptionsByValue['Natural Oak'];

/**
 * The frame mask drawn around a print of this size (cm, as printed) in Preview & Design, the room view
 * and the saved design: the chosen frame, or the sold frame when none is chosen, so a print always shows
 * framed and what is shown is what is saved. Takes the frame's mask for the closest ratio and orientation.
 */
export function frameMaskFor(frameName: string | null, width: number, height: number): string {
  const frame = (frameName && FrameOptionsByValue[frameName]) || SoldFrame;
  const variants = frame.masksByRatio;
  if (!variants?.length || !width || !height) return frame.maskWithoutMat;
  const ratio = Math.min(width, height) / Math.max(width, height);
  const best = variants.reduce((a, v) => (Math.abs(v.ratio - ratio) < Math.abs(a.ratio - ratio) ? v : a));
  return width > height ? best.maskWithoutMatLandscape : best.maskWithoutMat;
}
