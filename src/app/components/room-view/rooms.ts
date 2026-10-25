/**
 * Room photos the artwork can be previewed in. All positions are fractions of the
 * photo's width/height, so a room can be replaced by another photo by re-measuring.
 */
export interface RoomScene {
  id: string;
  name: string;
  image: string;
  /** Real-world width (cm) the full photo spans at the wall's depth; sets the scale. */
  widthCm: number;
  /** Where the artwork hangs: its centre, or its bottom edge for rooms with furniture below. */
  anchor: { x: number; y: number; align: 'center' | 'bottom' };
  /** Fraction of white light the bare wall reflects; turns wall brightness into light falling on the art. */
  wallAlbedo: number;
  /** Colour of the room's light, multiplied over the artwork. */
  lightTint: [number, number, number];
  /** Cast shadow of the frame, in cm; points away from the light source. */
  shadow: { x: number; y: number; blur: number; opacity: number };
}

const ROOMS_URL = 'https://genstorageaccount3116.blob.core.windows.net/printme-images/rooms/';

export const ROOM_SCENES: RoomScene[] = [
  {
    // Antique sideboard ~80 cm high (300 px) and the ~25 cm jug on it (~3.75 px/cm)
    id: 'ivory-sideboard',
    name: 'Ivory wall',
    image: ROOMS_URL + 'ivory-sideboard.webp',
    widthCm: 410,
    anchor: { x: 0.545, y: 0.525, align: 'bottom' },
    wallAlbedo: 0.8,
    lightTint: [255, 249, 240],
    shadow: { x: 1, y: 1.2, blur: 2.5, opacity: 0.3 },
  },
  {
    // Back cushions ~74 cm wide and ~41 cm high (~7.7 px/cm)
    id: 'linen-sofa',
    name: 'Linen sofa',
    image: ROOMS_URL + 'linen-sofa.webp',
    widthCm: 200,
    anchor: { x: 0.49, y: 0.523, align: 'bottom' },
    wallAlbedo: 0.88,
    lightTint: [255, 252, 247],
    shadow: { x: 1, y: 1, blur: 3, opacity: 0.25 },
  },
  {
    // Three-drawer sideboard ~170 cm wide, 14 cm handles (~8.7 px/cm)
    id: 'oak-sideboard',
    name: 'Oak sideboard',
    image: ROOMS_URL + 'oak-sideboard.webp',
    widthCm: 177,
    anchor: { x: 0.5, y: 0.62, align: 'bottom' },
    wallAlbedo: 0.78,
    lightTint: [255, 246, 232],
    shadow: { x: 1.4, y: 1, blur: 2.5, opacity: 0.32 },
  },
  {
    // Double-bed headboard ~165 cm wide, ~65 cm pillows (~5.1 px/cm)
    id: 'bedroom',
    name: 'Bedroom',
    image: ROOMS_URL + 'bedroom.webp',
    widthCm: 300,
    anchor: { x: 0.554, y: 0.456, align: 'bottom' },
    wallAlbedo: 0.72,
    lightTint: [248, 250, 255],
    shadow: { x: 0.8, y: 1, blur: 3, opacity: 0.25 },
  },
  {
    // Bench seat ~45 cm high, ~50 cm cushion (~5.4 px/cm); sun from the right
    id: 'ochre-hallway',
    name: 'Ochre hallway',
    image: ROOMS_URL + 'ochre-hallway.webp',
    widthCm: 282,
    anchor: { x: 0.574, y: 0.497, align: 'bottom' },
    wallAlbedo: 0.68,
    lightTint: [255, 240, 215],
    shadow: { x: -1.6, y: 1.2, blur: 2, opacity: 0.38 },
  },
  {
    // Low bookcase ~75 cm high, ~24 cm books (~3.3 px/cm); sun from the window on the left
    id: 'sage-reading-room',
    name: 'Reading room',
    image: ROOMS_URL + 'sage-reading-room.webp',
    widthCm: 470,
    anchor: { x: 0.576, y: 0.53, align: 'bottom' },
    wallAlbedo: 0.55,
    lightTint: [255, 245, 228],
    shadow: { x: 1.6, y: 1.2, blur: 2, opacity: 0.36 },
  },
  {
    // ~24 cm books and ~77 cm middle compartment (~6.6 px/cm); sun from the left
    id: 'sage-reading-corner',
    name: 'Bookcase',
    image: ROOMS_URL + 'sage-reading-corner.webp',
    widthCm: 233,
    anchor: { x: 0.5, y: 0.59, align: 'bottom' },
    wallAlbedo: 0.56,
    lightTint: [255, 244, 226],
    shadow: { x: 1.5, y: 1.2, blur: 2, opacity: 0.35 },
  },
  {
    // Two-drawer dresser ~160 cm wide, ~35 cm table lamp (~9.5 px/cm); lamp on the left
    id: 'lamp-dresser',
    name: 'Lamp light',
    image: ROOMS_URL + 'lamp-dresser.webp',
    widthCm: 162,
    anchor: { x: 0.52, y: 0.566, align: 'bottom' },
    wallAlbedo: 0.62,
    lightTint: [255, 234, 206],
    shadow: { x: 1.8, y: 0.3, blur: 2.5, opacity: 0.4 },
  },
  {
    // ~50 cm cushion and ~88 cm back cushions (~5.3 px/cm); low lamp on the left
    id: 'evening-sofa',
    name: 'Evening',
    image: ROOMS_URL + 'evening-sofa.webp',
    widthCm: 242,
    anchor: { x: 0.575, y: 0.53, align: 'bottom' },
    wallAlbedo: 0.56,
    lightTint: [255, 222, 182],
    shadow: { x: 1.8, y: 0, blur: 3, opacity: 0.4 },
  },
];
