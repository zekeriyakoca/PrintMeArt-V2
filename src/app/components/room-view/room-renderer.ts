import { RoomScene } from './rooms';

/** The finished print as Preview & Design composes it, and its real size. */
export interface PrintOnWall {
  design: CanvasImageSource;
  widthCm: number;
  heightCm: number;
}

// Coarse on purpose: the light map should carry the room's light, not the wall's texture
const LIGHT_MAP_CELLS = 8;
// Wide-angle rooms are shown at most this much wall wide around the print, so the print keeps a readable size
const MAX_VIEW_WIDTH_CM = 220;
// The stage is drawn this wide and the print is drawn straight onto it, so the print stays sharp on
// high-density screens even where only part of a room photo is shown
const STAGE_WIDTH_PX = 2400;

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
    const photoW = roomImage.naturalWidth;
    const photoH = roomImage.naturalHeight;
    const photoPxPerCm = photoW / room.widthCm;
    // Where the print hangs and which part of the photo is shown, in photo pixels
    const outer = this.place(room, photoW, photoH, print, photoPxPerCm);
    const view = this.view(room, photoW, photoH, photoPxPerCm);

    const scale = STAGE_WIDTH_PX / view.w;
    canvas.width = STAGE_WIDTH_PX;
    canvas.height = Math.round(view.h * scale);
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(roomImage, view.x, view.y, view.w, view.h, 0, 0, canvas.width, canvas.height);

    const onStage: Rect = { x: (outer.x - view.x) * scale, y: (outer.y - view.y) * scale, w: outer.w * scale, h: outer.h * scale };
    this.drawShadow(ctx, onStage, room, photoPxPerCm * scale);
    ctx.drawImage(print.design, onStage.x, onStage.y, onStage.w, onStage.h);
    this.drawGlass(ctx, onStage);

    this.applyRoomLight(ctx, this.wallPixels(room, roomImage), outer, onStage, room);
  }

  /** The part of the photo shown: all of it, or for a wide room a window around the print with the same composition. */
  private view(room: RoomScene, photoW: number, photoH: number, pxPerCm: number): Rect {
    const w = Math.min(photoW, MAX_VIEW_WIDTH_CM * pxPerCm);
    const h = (w * photoH) / photoW;
    const x = clamp(room.anchor.x * (photoW - w), 0, photoW - w);
    const y = clamp(room.anchor.y * (photoH - h), 0, photoH - h);
    return { x, y, w, h };
  }

  /** Room photo pixels, cached per room; the light map reads the wall from them. */
  private wallPixels(room: RoomScene, image: HTMLImageElement): ImageData {
    const cached = this.roomCache.get(room.id);
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.roomCache.set(room.id, data);
    return data;
  }

  private place(room: RoomScene, photoW: number, photoH: number, print: PrintOnWall, pxPerCm: number): Rect {
    const w = print.widthCm * pxPerCm;
    const h = print.heightCm * pxPerCm;
    const x = room.anchor.x * photoW - w / 2;
    const anchorY = room.anchor.y * photoH;
    // A tall print in a tight photo is kept inside it rather than cut off at the top
    const y = Math.max(0.03 * photoH, room.anchor.align === 'center' ? anchorY - h / 2 : anchorY - h);
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

  /** Multiplies the light that falls on the wall behind the piece (read at `outer` in the photo) over the piece (`target` on the stage). */
  private applyRoomLight(ctx: CanvasRenderingContext2D, wall: ImageData, outer: Rect, target: Rect, room: RoomScene) {
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
    ctx.drawImage(cells, target.x, target.y, target.w, target.h);
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
