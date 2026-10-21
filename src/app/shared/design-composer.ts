export type FitMode = 'cover' | 'contain';

/** How the artwork sits on the print, as set in Preview & Design. */
export interface DesignLayout {
  fitMode: FitMode;
  /** User zoom on top of the fit */
  scale: number;
  /** User pan as a fraction of the content box's width / height */
  offsetX: number;
  offsetY: number;
}

/** Width the saved design is rendered at */
export const DESIGN_WIDTH_PX = 1200;

export interface DesignParts {
  image: HTMLImageElement;
  /** Frame mask drawn over the whole artboard; null for an unframed print */
  frame: HTMLImageElement | null;
  /** Print size in cm, oriented as printed (width × height) */
  width: number;
  height: number;
  matIncluded: boolean;
}

/**
 * Renders the print exactly as Preview & Design shows it: white artboard, the artwork
 * placed by fit / zoom / pan inside the paper area, and the frame mask on top.
 */
export function composeDesign(canvasWidth: number, parts: DesignParts, layout: DesignLayout): HTMLCanvasElement {
  const { image, frame } = parts;
  const canvasW = canvasWidth;
  const canvasH = Math.round(canvasW * (parts.height / parts.width));

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // 1. Paper area: inset behind the frame (CSS % margins resolve against the artboard width)
  let vpX = 0,
    vpY = 0,
    vpW = canvasW,
    vpH = canvasH;
  if (frame) {
    const marginX = 0.04 * canvasW;
    const marginY = 0.02 * canvasW;
    vpX = marginX;
    vpY = marginY;
    vpW = canvasW - 2 * marginX;
    vpH = canvasH - 2 * marginY;
  }

  // 2. Content box: padding inside the paper area, wider when a mat is included
  const padPercent = frame ? (parts.matIncluded ? 10 : 3) : 0;
  const pad = (padPercent / 100) * canvasW;
  const cntX = vpX + pad;
  const cntY = vpY + pad;
  const cntW = vpW - 2 * pad;
  const cntH = vpH - 2 * pad;

  // 3. Clip to the paper area
  ctx.save();
  ctx.beginPath();
  ctx.rect(vpX, vpY, vpW, vpH);
  ctx.clip();

  // 4. Base image size from object-fit within the content box
  const imgRatio = image.naturalWidth / image.naturalHeight;
  const cntRatio = cntW / cntH;
  const fillWidth = layout.fitMode === 'cover' ? imgRatio <= cntRatio : imgRatio > cntRatio;
  const baseW = fillWidth ? cntW : cntH * imgRatio;
  const baseH = fillWidth ? cntW / imgRatio : cntH;

  // 5. User pan and zoom, centred on the content box like the CSS transform
  const finalW = baseW * layout.scale;
  const finalH = baseH * layout.scale;
  const dx = cntX + cntW / 2 + layout.offsetX * cntW - finalW / 2;
  const dy = cntY + cntH / 2 + layout.offsetY * cntH - finalH / 2;
  ctx.drawImage(image, dx, dy, finalW, finalH);
  ctx.restore();

  // 6. Frame on top of everything
  if (frame) {
    ctx.drawImage(frame, 0, 0, canvasW, canvasH);
  }

  return canvas;
}

export function loadCorsImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load: ' + url));
    const sep = url.includes('?') ? '&' : '?';
    img.src = url + sep + '_t=' + Date.now();
  });
}

/** The composed design as a PNG file, ready to upload. */
export function designToFile(canvas: HTMLCanvasElement): Promise<File> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(new File([blob], 'preview-design.png', { type: 'image/png' })) : reject(new Error('Empty design'))), 'image/png'),
  );
}
