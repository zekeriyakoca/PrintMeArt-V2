/**
 * Room mockups for the product images: the print framed, hung at real size in the Show in Room photos and drawn
 * by the same renderer. Per product, after the main image:
 *   hover  - the artwork's own ratio, walnut frame, the print centred (product card hover)
 *   room-1 - 5:3, oak frame in an off-white mat (product page)
 *   room-2 - 5:3, walnut frame in a mat
 *   room-3 - 5:3, oak frame
 *
 *   npx tsx generate.ts --ids 933,519 --out ~/Desktop/mockups   render to a folder
 *   npx tsx generate.ts --ids 933,519 --apply                   render and set them on the products
 *   npx tsx generate.ts --missing --apply --limit 40            the first 40 products whose images are not these mockups yet
 *
 * --apply uploads to MOCKUP_BLOB_SAS (a writable SAS URL of the image container) and sets the images through the
 * catalog API at CATALOG_INTERNAL_API (internal only: in the cluster, or through a port-forward).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { createCanvas, loadImage, type Canvas, type Image } from '@napi-rs/canvas';

// The app's renderer creates its scratch canvases through the DOM
(globalThis as { document?: unknown }).document = { createElement: () => createCanvas(1, 1) };

const { ROOM_SCENES } = await import('../../src/app/components/room-view/rooms');
const { RoomRenderer, printFits } = await import('../../src/app/components/room-view/room-renderer');
const { composeDesign, DESIGN_WIDTH_PX } = await import('../../src/app/shared/design-composer');
const { frameMaskFor } = await import('../../src/app/shared/constants');
type RoomScene = (typeof ROOM_SCENES)[number];
type Framing = import('../../src/app/components/room-view/room-renderer').Framing;

const CATALOG_API = 'https://lontray.art/catalog-api/catalog/v1';
/** The catalog picks the shop from the Origin */
const SITE = 'https://printmeart.nl';
/** Frame shapes for the mockups (cm), not tied to the sizes sold: the one nearest the artwork's ratio is hung */
const SHAPES: [number, number][] = [
  [50, 70],
  [70, 50],
  [50, 50],
];
/** A room too tight for a shape gets it this much smaller */
const SMALLER = 0.8;
/** Width of wall shown around the print in the room images */
const ROOM_VIEW_CM = 260;
/** A room photo may be enlarged at most this much to fill an image; the earlier, smaller photos sit out close-ups */
const MAX_UPSCALE = 1.6;
/** Photo of an off-white linen mat board, the artwork is cut to its opening */
const MAT_BOARD = 'https://genstorageaccount3116.blob.core.windows.net/printme-images/mat-linen-v2.png';

const WALNUT = 'Dark Walnut';
const OAK = 'Natural Oak';
/** Folder of the uploaded mockups; a product whose images after the main one are all in it is done */
const MOCKUP_FOLDER = '/mockups/';

export interface Mockup {
  name: string;
  room: string;
  sizeCm: [number, number];
  webp: Buffer;
}

const renderer = new RoomRenderer();
const images = new Map<string, Promise<Image>>();

function image(url: string): Promise<Image> {
  if (!images.has(url)) images.set(url, fetchBuffer(url).then((data) => loadImage(data)));
  return images.get(url)!;
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

/** The product's main image, at the largest size served */
async function productArt(productId: number): Promise<Image> {
  const response = await fetch(`${CATALOG_API}/storefront/products/${productId}`, { headers: { Origin: SITE } });
  if (!response.ok) throw new Error(`Product ${productId}: ${response.status}`);
  const main = (await response.json()).images?.[0];
  if (!main) throw new Error(`Product ${productId} has no image`);
  // Not cached: only rooms, frames and the mat board are shared between products
  return loadImage(await fetchBuffer(main.xLarge || main.large));
}

/**
 * Sizes to hang, in order of preference: the shape nearest the artwork's ratio (the artwork is cut to it), then a
 * smaller one of that shape, then the other shapes, for rooms where it doesn't fit
 */
function sizesFor(art: Image): [number, number][] {
  const off = ([w, h]: [number, number]) => Math.abs(Math.log(w / h / (art.width / art.height)));
  return [...SHAPES]
    .sort((a, b) => off(a) - off(b))
    .flatMap(([w, h]): [number, number][] => [[w, h], [Math.round(w * SMALLER), Math.round(h * SMALLER)]]);
}

/** Rooms in a fixed order per product, so neighbouring cards differ and a re-run gives the same result */
function roomsFor(productId: number): RoomScene[] {
  // mulberry32, seeded with the product id
  let seed = productId;
  const next = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
  return [...ROOM_SCENES].map((room) => ({ room, key: next() })).sort((a, b) => a.key - b.key).map((x) => x.room);
}

/** How much the room photo is enlarged to fill the image */
function upscale(room: RoomScene, photo: Image, widthCm: number, framing: Framing): number {
  const viewPx = Math.min(photo.width, (widthCm * photo.width) / room.widthCm / framing.printShare);
  return framing.widthPx / viewPx;
}

async function render(art: Image, room: RoomScene, sizeCm: [number, number], framing: Framing, frameName: string, mat: boolean): Promise<Buffer> {
  const [widthCm, heightCm] = sizeCm;
  const frame = await image(frameMaskFor(frameName, widthCm, heightCm));
  const design = composeDesign(
    DESIGN_WIDTH_PX,
    { image: art as unknown as HTMLImageElement, frame: frame as unknown as HTMLImageElement, width: widthCm, height: heightCm, matIncluded: mat, matBoard: (await image(MAT_BOARD)) as unknown as HTMLImageElement },
    { fitMode: 'cover', scale: 1, offsetX: 0, offsetY: 0 },
  );
  const canvas = createCanvas(1, 1);
  renderer.render(canvas as unknown as HTMLCanvasElement, room, (await image(room.image)) as unknown as HTMLImageElement, { design, widthCm, heightCm }, framing);
  return (canvas as Canvas).encode('webp', 90);
}

export async function mockupsFor(productId: number): Promise<Mockup[]> {
  const art = await productArt(productId);
  const room = (widthCm: number): Framing => ({ widthPx: 1800, aspect: 5 / 3, printShare: widthCm / ROOM_VIEW_CM, printY: 0.4 });
  const shots: { name: string; frame: string; mat?: boolean; framing: (widthCm: number) => Framing }[] = [
    // The print stays where the artwork was, with the furniture just in view below
    { name: 'hover', frame: WALNUT, framing: () => ({ widthPx: 1200, aspect: art.width / art.height, printShare: 0.5, printY: 0.42 }) },
    // The room around it, about 2.6 m of wall wide whatever the print's size
    { name: 'room-1', frame: OAK, mat: true, framing: room },
    { name: 'room-2', frame: WALNUT, mat: true, framing: room },
    { name: 'room-3', frame: OAK, framing: room },
  ];

  // The preferred size in the first rooms it fits, then the next size down in the remaining rooms
  const mockups: Mockup[] = [];
  const rooms = roomsFor(productId);
  for (const sizeCm of sizesFor(art)) {
    for (const room of [...rooms]) {
      const shot = shots[mockups.length];
      if (!shot) return mockups;
      const photo = await image(room.image);
      const framing = shot.framing(sizeCm[0]);
      if (!printFits(room, photo.width, photo.height, sizeCm[0], sizeCm[1]) || upscale(room, photo, sizeCm[0], framing) > MAX_UPSCALE) continue;
      rooms.splice(rooms.indexOf(room), 1);
      mockups.push({ name: shot.name, room: room.id, sizeCm, webp: await render(art, room, sizeCm, framing, shot.frame, !!shot.mat) });
    }
  }
  return mockups;
}

/** Uploads under a new name each time: the container serves images as immutable */
async function upload(productId: number, m: Mockup): Promise<string> {
  const sas = new URL(process.env['MOCKUP_BLOB_SAS'] ?? '');
  const hash = createHash('sha256').update(m.webp).digest('hex').slice(0, 10);
  const blob = new URL(`${sas.pathname}/mockups/${productId}/${m.name}-${hash}.webp${sas.search}`, sas.origin);
  const response = await fetch(blob, {
    method: 'PUT',
    headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': 'image/webp', 'x-ms-blob-cache-control': 'public, max-age=2592000, immutable' },
    body: new Uint8Array(m.webp),
  });
  if (!response.ok) throw new Error(`Upload ${m.name}: ${response.status}`);
  return `${blob.origin}${blob.pathname}`;
}

const catalogApi = () => process.env['CATALOG_INTERNAL_API'] ?? 'http://localhost:5001/catalog/v1';

async function catalog<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${catalogApi()}${path}`, { ...init, headers: { Origin: SITE, 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) throw new Error(`${init?.method ?? 'GET'} ${path}: ${response.status} ${await response.text()}`);
  return response.status === 204 || !response.headers.get('content-type')?.includes('json') ? (undefined as T) : response.json();
}

async function productImages(productId: number): Promise<string[]> {
  return (await catalog<{ images: { original: string }[] }>(`/products/${productId}`)).images.map((i) => i.original);
}

/** Every shown product whose images after the main one are not mockups from here */
async function productsWithoutMockups(): Promise<number[]> {
  const ids: number[] = [];
  for (let page = 0; ; page++) {
    const { data } = await catalog<{ data: { id: number; isVisible: boolean }[] }>('/products/search', { method: 'POST', body: JSON.stringify({ pageSize: 100, pageIndex: page }) });
    if (!data.length) break;
    ids.push(...data.filter((p) => p.isVisible).map((p) => p.id));
  }
  const missing: number[] = [];
  for (const id of ids) {
    const [, ...rest] = await productImages(id);
    if (!rest.length || !rest.every((url) => url.includes(MOCKUP_FOLDER))) missing.push(id);
  }
  return missing;
}

/** Keeps the main image and puts the mockups after it */
async function apply(productId: number, mockups: Mockup[]) {
  const [main] = await productImages(productId);
  const urls = [main];
  for (const m of mockups) urls.push(await upload(productId, m));
  await catalog(`/products/${productId}/images`, { method: 'PUT', body: JSON.stringify(urls) });
}

async function main() {
  const { values } = parseArgs({ options: { ids: { type: 'string' }, missing: { type: 'boolean' }, limit: { type: 'string' }, out: { type: 'string' }, apply: { type: 'boolean' } } });
  // The renderer's native memory builds up over a long run, so the job does a batch at a time and the next run goes on
  const ids = (values.missing ? await productsWithoutMockups() : (values.ids ?? '').split(',').map(Number).filter(Boolean)).slice(0, Number(values.limit) || undefined);
  if ((!values.missing && !ids.length) || (!values.out && !values.apply)) {
    throw new Error('Usage: generate.ts (--ids 933,519 | --missing) (--out <folder> | --apply)');
  }

  if (values.out) await mkdir(values.out, { recursive: true });
  console.log(`${ids.length} products`);
  let failed = 0;
  for (const id of ids) {
    try {
      const mockups = await mockupsFor(id);
      if (mockups.length < 4) throw new Error(`only ${mockups.length} rooms fit`);
      if (values.out) for (const m of mockups) await writeFile(join(values.out, `${id}-${m.name}.webp`), m.webp);
      if (values.apply) await apply(id, mockups);
      console.log(id, mockups.map((m) => `${m.name}: ${m.room} ${m.sizeCm.join('x')}`).join(' | '));
    } catch (error) {
      failed++;
      console.error(id, 'skipped:', (error as Error).message);
    }
  }
  if (failed) console.error(`${failed} of ${ids.length} skipped`);
}

await main();
