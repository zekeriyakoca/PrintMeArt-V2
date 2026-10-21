import { RoomScene } from './rooms';

/** The finished print as Preview & Design composes it, and its real size. */
export interface PrintOnWall {
  design: CanvasImageSource;
  widthCm: number;
  heightCm: number;
  framed: boolean;
}

// Coarse on purpose: the light map should carry the room's light, not the wall's texture
const LIGHT_MAP_CELLS = 8;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Places a finished print into a room photo at real scale. The room's own light is carried
 * onto it: the wall's brightness behind the print (divided by the wall's reflectance)
 * becomes a light map multiplied over the print and its frame.
 */
export class RoomRenderer {
  private readonly roomCache = new Map<string, ImageData>();

  render(canvas: HTMLCanvasElement, room: RoomScene, roomImage: HTMLImageElement, print: PrintOnWall) {
    canvas.width = roomImage.naturalWidth;
    canvas.height = roomImage.naturalHeight;
    const ctx = canvas.getContext('2d')!;

    const wall = this.wallPixels(room, roomImage);
    ctx.putImageData(wall, 0, 0);

    const pxPerCm = canvas.width / room.widthCm;
    const outer = this.place(room, canvas, print, pxPerCm);

    this.drawShadow(ctx, outer, room, pxPerCm);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(print.design, outer.x, outer.y, outer.w, outer.h);
    if (print.framed) this.drawGlass(ctx, outer);

    this.applyRoomLight(ctx, wall, outer, room);
  }

  /** Room photo with any existing picture painted over, cached per room. */
  private wallPixels(room: RoomScene, image: HTMLImageElement): ImageData {
    const cached = this.roomCache.get(room.id);
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (room.clear) paintOver(data, room.clear);

    this.roomCache.set(room.id, data);
    return data;
  }

  private place(room: RoomScene, canvas: HTMLCanvasElement, print: PrintOnWall, pxPerCm: number): Rect {
    const w = print.widthCm * pxPerCm;
    const h = print.heightCm * pxPerCm;
    const x = room.anchor.x * canvas.width - w / 2;
    const anchorY = room.anchor.y * canvas.height;
    const y = room.anchor.align === 'center' ? anchorY - h / 2 : anchorY - h;
    return { x, y, w, h };
  }

  private drawShadow(ctx: CanvasRenderingContext2D, outer: Rect, room: RoomScene, pxPerCm: number) {
    const { shadow } = room;
    ctx.save();
    // Wide soft shadow from the room light, then a tight contact shadow for depth
    ctx.filter = `blur(${shadow.blur * pxPerCm}px)`;
    ctx.fillStyle = `rgba(0,0,0,${shadow.opacity})`;
    ctx.fillRect(outer.x + shadow.x * pxPerCm, outer.y + shadow.y * pxPerCm, outer.w, outer.h);
    ctx.filter = `blur(${0.5 * pxPerCm}px)`;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(outer.x + Math.sign(shadow.x) * 0.25 * pxPerCm, outer.y + 0.3 * pxPerCm, outer.w, outer.h);
    ctx.restore();
  }

  private drawGlass(ctx: CanvasRenderingContext2D, outer: Rect) {
    const sheen = ctx.createLinearGradient(outer.x, outer.y, outer.x + outer.w, outer.y + outer.h);
    sheen.addColorStop(0, 'rgba(255,255,255,0.10)');
    sheen.addColorStop(0.35, 'rgba(255,255,255,0.02)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = sheen;
    ctx.fillRect(outer.x, outer.y, outer.w, outer.h);
    ctx.restore();
  }

  /** Multiplies the light that falls on the wall behind the piece over the piece itself. */
  private applyRoomLight(ctx: CanvasRenderingContext2D, wall: ImageData, outer: Rect, room: RoomScene) {
    const cells = document.createElement('canvas');
    cells.width = LIGHT_MAP_CELLS;
    cells.height = LIGHT_MAP_CELLS;
    const cellCtx = cells.getContext('2d')!;
    const map = cellCtx.createImageData(LIGHT_MAP_CELLS, LIGHT_MAP_CELLS);
    const [tr, tg, tb] = room.lightTint;

    for (let cy = 0; cy < LIGHT_MAP_CELLS; cy++) {
      for (let cx = 0; cx < LIGHT_MAP_CELLS; cx++) {
        const luminance = medianLuminance(wall, {
          x: outer.x + (cx / LIGHT_MAP_CELLS) * outer.w,
          y: outer.y + (cy / LIGHT_MAP_CELLS) * outer.h,
          w: outer.w / LIGHT_MAP_CELLS,
          h: outer.h / LIGHT_MAP_CELLS,
        });
        const light = Math.min(1, luminance / (255 * room.wallAlbedo));
        const i = (cy * LIGHT_MAP_CELLS + cx) * 4;
        map.data[i] = light * tr;
        map.data[i + 1] = light * tg;
        map.data[i + 2] = light * tb;
        map.data[i + 3] = 255;
      }
    }
    cellCtx.putImageData(map, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(cells, outer.x, outer.y, outer.w, outer.h);
    ctx.restore();
  }
}

/** Median luminance of a region: ignores dark mortar lines and stains on textured walls. */
function medianLuminance(image: ImageData, rect: Rect): number {
  const x0 = Math.max(0, Math.floor(rect.x));
  const y0 = Math.max(0, Math.floor(rect.y));
  const x1 = Math.min(image.width, Math.ceil(rect.x + rect.w));
  const y1 = Math.min(image.height, Math.ceil(rect.y + rect.h));
  const values: number[] = [];
  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = (y * image.width + x) * 4;
      values.push(0.2126 * image.data[i] + 0.7152 * image.data[i + 1] + 0.0722 * image.data[i + 2]);
    }
  }
  if (!values.length) return 255;
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)];
}

/**
 * Paints a rectangle over with the surrounding wall. The colours on its border are diffused
 * inwards (a harmonic fill solved on a coarse grid), so the patch meets the real wall exactly
 * on every edge; grain at the wall's own noise level is added on top.
 */
function paintOver(image: ImageData, area: { x0: number; y0: number; x1: number; y1: number }) {
  const { width, height, data } = image;
  const cell = 4;
  const x0 = Math.round(area.x0 * width);
  const y0 = Math.round(area.y0 * height);
  const cols = Math.ceil((Math.round(area.x1 * width) - x0) / cell) + 2;
  const rows = Math.ceil((Math.round(area.y1 * height) - y0) / cell) + 2;
  // Grid cell (c, r) covers pixels starting at (gx, gy); the outer ring of cells lies on the wall
  const gx = (c: number) => x0 + (c - 1) * cell;
  const gy = (r: number) => y0 + (r - 1) * cell;

  const grid = [0, 1, 2].map(() => new Float32Array(cols * rows));
  let grainSum = 0;
  let grainCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r > 0 && r < rows - 1 && c > 0 && c < cols - 1) continue;
      const mean = blockMean(image, gx(c), gy(r), cell);
      for (let ch = 0; ch < 3; ch++) grid[ch][r * cols + c] = mean.rgb[ch];
      grainSum += mean.variance;
      grainCount++;
    }
  }
  const grain = Math.sqrt(grainSum / grainCount);

  for (const channel of grid) {
    let border = 0;
    for (let c = 0; c < cols; c++) border += channel[c] + channel[(rows - 1) * cols + c];
    for (let r = 1; r < rows - 1; r++) border += channel[r * cols] + channel[r * cols + cols - 1];
    const start = border / (2 * cols + 2 * (rows - 2));
    for (let r = 1; r < rows - 1; r++) for (let c = 1; c < cols - 1; c++) channel[r * cols + c] = start;
    // Over-relaxed Gauss-Seidel converges in a few hundred sweeps on grids this size
    for (let sweep = 0; sweep < 400; sweep++) {
      for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
          const i = r * cols + c;
          const average = (channel[i - 1] + channel[i + 1] + channel[i - cols] + channel[i + cols]) / 4;
          channel[i] += 1.85 * (average - channel[i]);
        }
      }
    }
  }

  // Bilinear read of the grid at pixel centres, inside the inner cells only
  const sample = (channel: Float32Array, x: number, y: number) => {
    const fc = Math.min(cols - 1.001, Math.max(0, (x - x0) / cell + 0.5));
    const fr = Math.min(rows - 1.001, Math.max(0, (y - y0) / cell + 0.5));
    const c = Math.floor(fc);
    const r = Math.floor(fr);
    const tx = fc - c;
    const ty = fr - r;
    const top = channel[r * cols + c] * (1 - tx) + channel[r * cols + c + 1] * tx;
    const bottom = channel[(r + 1) * cols + c] * (1 - tx) + channel[(r + 1) * cols + c + 1] * tx;
    return top * (1 - ty) + bottom * ty;
  };

  for (let y = Math.max(0, gy(1)); y < Math.min(height, gy(rows - 1)); y++) {
    for (let x = Math.max(0, gx(1)); x < Math.min(width, gx(cols - 1)); x++) {
      const noise = gaussian() * grain;
      const i = (y * width + x) * 4;
      for (let ch = 0; ch < 3; ch++) data[i + ch] = sample(grid[ch], x, y) + noise;
    }
  }
}

/** Mean colour of a square block and the variance of its green channel (the wall's grain). */
function blockMean(image: ImageData, x: number, y: number, size: number) {
  const rgb = [0, 0, 0];
  let sumSq = 0;
  let n = 0;
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const px = Math.min(image.width - 1, Math.max(0, x + dx));
      const py = Math.min(image.height - 1, Math.max(0, y + dy));
      const i = (py * image.width + px) * 4;
      for (let ch = 0; ch < 3; ch++) rgb[ch] += image.data[i + ch];
      sumSq += image.data[i + 1] ** 2;
      n++;
    }
  }
  const mean = rgb.map((v) => v / n);
  return { rgb: mean, variance: Math.max(0, sumSq / n - mean[1] ** 2) };
}

function gaussian(): number {
  return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
}
