export const SizeOptions = [
  { id: 1, name: '13x18', val1: 13, val2: 18 },
  { id: 2, name: '21x30', val1: 21, val2: 30 },
  { id: 3, name: '30x40', val1: 30, val2: 40 },
  { id: 4, name: '40x60', val1: 40, val2: 60 },
  { id: 5, name: '50x70', val1: 50, val2: 70 },
  { id: 6, name: '60x90', val1: 60, val2: 90 },
];

export interface DesignFrame {
  id: number;
  name: string;
  thumbnail: string;
  mask: string;
  maskWithoutMat: string;
}

export const FrameOptions: DesignFrame[] = [
  {
    id: 0,
    name: 'Rolled-up (No Frame)',
    thumbnail:
      'https://genstorageaccount3116.blob.core.windows.net/print-me-product-images/no-frame.png',
    mask: '',
    maskWithoutMat: '',
  },
  {
    id: 1,
    name: 'Black Frame | EDSBRUK',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/edsbruk-frame-black-stained__0723741_pe734158_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame8-edsbruk-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame8-edsbruk.png',
  },
  {
    id: 2,
    name: 'White Stained Pine | PLOMMONTRÄD',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/plommontrad-frame-white-stained-pine-effect__1202413_pe905936_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame6-plommon-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame6-plommon.png',
  },
  {
    id: 3,
    name: 'White Frame | EDSBRUK',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/edsbruk-frame-white__0706506_pe725889_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame5-edsbruk-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame5-edsbruk.png',
  },
  {
    id: 4,
    name: 'Brown Frame | RAMSBORG',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/ramsborg-frame-brown__0726700_pe735389_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame7-ramsborg-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame7-ramsborg.png',
  },
  {
    id: 5,
    name: 'Black Frame | RÖDALM',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/rodalm-frame-black__1251233_pe924195_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame1-rodalm-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame1-rodalm.png',
  },
  {
    id: 6,
    name: 'Black Frame | KNOPPÄNG',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/knoppang-frame-black__0638249_pe698799_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame2-knoppang-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame2-knoppang.png',
  },
  {
    id: 7,
    name: 'Gold Frame | SILVERHÖJDEN',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/silverhojden-frame-gold-colour__1179571_pe895993_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame4-silverhojden-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame4-silverhojden.png',
  },
  {
    id: 8,
    name: 'Black Frame | LOMVIKEN',
    thumbnail:
      'https://www.ikea.com/nl/en/images/products/lomviken-frame-black__0386296_pe558681_s5.jpg?f=xxs',
    mask: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame3-lomviken-mat.png',
    maskWithoutMat:
      'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame3-lomviken.png',
  },
];
