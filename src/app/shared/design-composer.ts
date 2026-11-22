/** free: sized like cover, but the artwork can be dragged past the edges */
export type FitMode = 'cover' | 'contain' | 'free';

/** How the artwork sits on the print, as set in Preview & Design. */
export interface DesignLayout {
  fitMode: FitMode;
  /** User zoom on top of the fit */
  scale: number;
  /** User pan as a fraction of the content box's width / height */
  offsetX: number;
  offsetY: number;
  /** White border inside the print, in cm: top / left / right, and bottom */
  borderCm?: number;
  borderBottomCm?: number;
}

/** Width the saved design is rendered at */
export const DESIGN_WIDTH_PX = 1200;

export interface DesignParts {
  image: HTMLImageElement;
  /** Frame mask drawn over the whole artboard */
  frame: HTMLImageElement;
  /** Print size in cm, oriented as printed (width × height) */
  width: number;
  height: number;
  matIncluded: boolean;
  /**
   * Photo of a mat board's surface (tiles seamlessly, MAT_TEXTURE_PX_PER_CM): the mat is then drawn as real board,
   * with its texture, a bevelled opening and the frame's shadow, and the artwork stays inside the opening
   */
  matBoard?: CanvasImageSource & { width: number; height: number };
}

/** Scale of the mat board photo */
const MAT_TEXTURE_PX_PER_CM = 48;
/** Width of the bevel cut around the mat's opening */
const MAT_BEVEL_CM = 0.25;

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

  const pxPerCm = canvasW / parts.width;
  const board = parts.matIncluded ? parts.matBoard : undefined;
  ctx.fillStyle = board ? matBoardPattern(ctx, board, pxPerCm) : '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // 1. Paper area: inset 2% of the width behind the frame on every side (CSS % margins resolve against the artboard width)
  const margin = 0.02 * canvasW;
  const vpX = margin;
  const vpY = margin;
  const vpW = canvasW - 2 * margin;
  const vpH = canvasH - 2 * margin;

  // 2. Content box: padding inside the paper area when a mat is included; without a mat the print sits directly in the frame
  const padPercent = parts.matIncluded ? 10 : 0;
  const pad = (padPercent / 100) * canvasW;
  // White border: blank paper between the mat (or frame) and the artwork, in cm of the print width
  const border = ((layout.borderCm ?? 0) / parts.width) * canvasW;
  const borderBottom = ((layout.borderBottomCm ?? 0) / parts.width) * canvasW;
  const cntX = vpX + pad + border;
  const cntY = vpY + pad + border;
  const cntW = vpW - 2 * pad - 2 * border;
  const cntH = vpH - 2 * pad - border - borderBottom;

  // 3. Clip to the paper area; with a white border the artwork stops at its edge
  ctx.save();
  ctx.beginPath();
  if (border > 0 || board) ctx.rect(cntX, cntY, cntW, cntH);
  else ctx.rect(vpX, vpY, vpW, vpH);
  ctx.clip();

  // 4. Base image size from object-fit within the content box
  const imgRatio = image.naturalWidth / image.naturalHeight;
  const cntRatio = cntW / cntH;
  const fillWidth = layout.fitMode === 'contain' ? imgRatio > cntRatio : imgRatio <= cntRatio;
  const baseW = fillWidth ? cntW : cntH * imgRatio;
  const baseH = fillWidth ? cntW / imgRatio : cntH;

  // 5. User pan and zoom, centred on the content box like the CSS transform
  const finalW = baseW * layout.scale;
  const finalH = baseH * layout.scale;
  const dx = cntX + cntW / 2 + layout.offsetX * cntW - finalW / 2;
  const dy = cntY + cntH / 2 + layout.offsetY * cntH - finalH / 2;
  ctx.drawImage(image, dx, dy, finalW, finalH);
  ctx.restore();

  if (board) {
    drawBevel(ctx, { x: cntX, y: cntY, w: cntW, h: cntH }, MAT_BEVEL_CM * pxPerCm);
    drawFrameShadow(ctx, { x: vpX, y: vpY, w: vpW, h: vpH }, margin + 0.8 * pxPerCm);
  }

  // 6. Frame on top of everything
  ctx.drawImage(frame, 0, 0, canvasW, canvasH);

  return canvas;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The board's photo repeated at its real scale */
function matBoardPattern(ctx: CanvasRenderingContext2D, board: CanvasImageSource & { width: number; height: number }, pxPerCm: number): CanvasPattern {
  const scale = pxPerCm / MAT_TEXTURE_PX_PER_CM;
  const tile = document.createElement('canvas');
  tile.width = Math.max(1, Math.round(board.width * scale));
  tile.height = Math.max(1, Math.round(board.height * scale));
  const tileCtx = tile.getContext('2d')!;
  tileCtx.imageSmoothingQuality = 'high';
  tileCtx.drawImage(board, 0, 0, tile.width, tile.height);
  return ctx.createPattern(tile, 'repeat')!;
}

/**
 * The 45° cut around the opening shows the board's white core: lit where it faces up (bottom edge),
 * in shade where it faces down (top edge), with a thin dark line where the print sits below the board
 */
function drawBevel(ctx: CanvasRenderingContext2D, opening: Box, bevel: number) {
  const { x, y, w, h } = opening;
  const side = (points: number[], fill: string) => {
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };
  const [x0, y0, x1, y1] = [x - bevel, y - bevel, x + w + bevel, y + h + bevel];
  side([x0, y0, x1, y0, x + w, y, x, y], '#e9e7e1');
  side([x0, y0, x, y, x, y + h, x0, y1], '#f1efea');
  side([x1, y0, x1, y1, x + w, y + h, x + w, y], '#f7f6f2');
  side([x0, y1, x, y + h, x + w, y + h, x1, y1], '#fcfbf8');
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.lineWidth = Math.max(1, bevel * 0.15);
  ctx.strokeRect(x, y, w, h);
}

/** The frame's moulding throws a soft shadow onto the mat, deeper at the top and left where the light comes from */
function drawFrameShadow(ctx: CanvasRenderingContext2D, paper: Box, reach: number) {
  const edges: [number, number, number, number, number][] = [
    [paper.x, paper.y, paper.x, paper.y + reach, 0.2],
    [paper.x, paper.y, paper.x + reach, paper.y, 0.14],
    [paper.x + paper.w, paper.y, paper.x + paper.w - reach, paper.y, 0.07],
    [paper.x, paper.y + paper.h, paper.x, paper.y + paper.h - reach, 0.05],
  ];
  for (const [x0, y0, x1, y1, opacity] of edges) {
    const shade = ctx.createLinearGradient(x0, y0, x1, y1);
    shade.addColorStop(0, `rgba(40, 30, 20, ${opacity})`);
    shade.addColorStop(1, 'rgba(40, 30, 20, 0)');
    ctx.fillStyle = shade;
    ctx.fillRect(paper.x, paper.y, paper.w, paper.h);
  }
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
