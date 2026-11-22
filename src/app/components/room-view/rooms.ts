/**
 * Room photos the artwork can be previewed in. All positions are fractions of the
 * photo's width/height, so a room can be replaced by another photo by re-measuring.
 */
export interface RoomScene {
  /** Also the photo's file name in blob storage */
  id: string;
  name: string;
  image: string;
  /** Small copy of the photo for the room picker */
  thumb: string;
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

const room = (scene: Omit<RoomScene, 'image' | 'thumb'>): RoomScene => ({
  ...scene,
  image: `${ROOMS_URL}${scene.id}.webp`,
  thumb: `${ROOMS_URL}thumbs/${scene.id}.webp`,
});

export const ROOM_SCENES: RoomScene[] = [
  // Generated rooms, 3072 x 2048. Scale from the furniture's usual width; the artwork hangs ~25 cm above it.
  room({
    // Three-seat linen sofa ~240 cm (2455 px); window on the left
    id: 'linen-sofa-morning',
    name: 'Morning sofa',
    widthCm: 300,
    anchor: { x: 0.5, y: 0.378, align: 'bottom' },
    wallAlbedo: 0.8,
    lightTint: [255, 251, 245],
    shadow: { x: 1.4, y: 1.2, blur: 2.5, opacity: 0.3 },
  }),
  room({
    // Mid-century sideboard ~180 cm (1786 px)
    id: 'walnut-sideboard',
    name: 'Walnut sideboard',
    widthCm: 310,
    anchor: { x: 0.5, y: 0.49, align: 'bottom' },
    wallAlbedo: 0.72,
    lightTint: [255, 251, 245],
    shadow: { x: 1, y: 1.2, blur: 2.5, opacity: 0.3 },
  }),
  room({
    // King headboard ~190 cm (2060 px); light from the right
    id: 'sage-bedroom',
    name: 'Sage bedroom',
    widthCm: 284,
    anchor: { x: 0.498, y: 0.418, align: 'bottom' },
    wallAlbedo: 0.49,
    lightTint: [252, 252, 248],
    shadow: { x: -1, y: 1.2, blur: 2.5, opacity: 0.3 },
  }),
  room({
    // Console table ~140 cm (1650 px); low sun from the left
    id: 'terracotta-hallway',
    name: 'Terracotta hall',
    widthCm: 260,
    anchor: { x: 0.52, y: 0.43, align: 'bottom' },
    wallAlbedo: 0.45,
    lightTint: [255, 238, 214],
    shadow: { x: 1.8, y: 1.2, blur: 2, opacity: 0.38 },
  }),
  room({
    // Pedestal desk ~155 cm (2860 px); brass desk lamp on the left
    id: 'dark-green-study',
    name: 'Green study',
    widthCm: 166,
    anchor: { x: 0.49, y: 0.52, align: 'bottom' },
    wallAlbedo: 0.29,
    lightTint: [255, 226, 190],
    shadow: { x: 1.6, y: 0.6, blur: 2.5, opacity: 0.4 },
  }),
  room({
    // Low bench ~180 cm (2132 px); hung higher than the bench, left of the bonsai
    id: 'japandi-bench',
    name: 'Japandi bench',
    widthCm: 260,
    anchor: { x: 0.42, y: 0.509, align: 'bottom' },
    wallAlbedo: 0.78,
    lightTint: [255, 251, 245],
    shadow: { x: 1, y: 1.2, blur: 2.5, opacity: 0.28 },
  }),
  room({
    // Double headboard ~170 cm (1844 px); window on the left
    id: 'navy-bedroom',
    name: 'Navy bedroom',
    widthCm: 283,
    anchor: { x: 0.519, y: 0.361, align: 'bottom' },
    wallAlbedo: 0.25,
    lightTint: [246, 249, 255],
    shadow: { x: 1, y: 1.2, blur: 2.5, opacity: 0.35 },
  }),
  room({
    // Two-and-a-half-seat sofa ~220 cm (2064 px); hung inside the wall panel
    id: 'parisian-mouldings',
    name: 'Parisian salon',
    widthCm: 327,
    anchor: { x: 0.493, y: 0.43, align: 'bottom' },
    wallAlbedo: 0.85,
    lightTint: [255, 252, 248],
    shadow: { x: -1, y: 1.2, blur: 2.5, opacity: 0.25 },
  }),
  room({
    // Long sideboard ~200 cm (2060 px)
    id: 'dining-sideboard',
    name: 'Dining room',
    widthCm: 298,
    anchor: { x: 0.502, y: 0.431, align: 'bottom' },
    wallAlbedo: 0.81,
    lightTint: [255, 249, 240],
    shadow: { x: 1, y: 1.2, blur: 2.5, opacity: 0.28 },
  }),
  room({
    // Three-drawer dresser ~110 cm (1104 px); window on the left; hung above the lamp
    id: 'blush-dresser',
    name: 'Blush dresser',
    widthCm: 307,
    anchor: { x: 0.507, y: 0.38, align: 'bottom' },
    wallAlbedo: 0.8,
    lightTint: [255, 251, 247],
    shadow: { x: 1, y: 1.2, blur: 2.5, opacity: 0.28 },
  }),
  room({
    // Bouclé sofa ~230 cm (2460 px); floor lamp on the left, evening
    id: 'dark-moody-lounge',
    name: 'Evening lounge',
    widthCm: 287,
    anchor: { x: 0.505, y: 0.377, align: 'bottom' },
    wallAlbedo: 0.43,
    lightTint: [255, 222, 184],
    shadow: { x: 1.8, y: 0.3, blur: 3, opacity: 0.4 },
  }),
  room({
    // Antique settle ~200 cm (1870 px); light from the left
    id: 'cottage-kitchen-nook',
    name: 'Cottage bench',
    widthCm: 329,
    anchor: { x: 0.498, y: 0.389, align: 'bottom' },
    wallAlbedo: 0.77,
    lightTint: [255, 250, 242],
    shadow: { x: 1.2, y: 1.2, blur: 2.5, opacity: 0.3 },
  }),
  room({
    // Six-drawer dresser ~150 cm (1595 px)
    id: 'kids-room-calm',
    name: 'Kids room',
    widthCm: 290,
    anchor: { x: 0.5, y: 0.403, align: 'bottom' },
    wallAlbedo: 0.79,
    lightTint: [255, 252, 248],
    shadow: { x: 1, y: 1.2, blur: 2.5, opacity: 0.26 },
  }),
  // Earlier rooms, 1536 px wide
  room({
    // Antique sideboard ~80 cm high (300 px) and the ~25 cm jug on it (~3.75 px/cm)
    id: 'ivory-sideboard',
    name: 'Ivory wall',
    widthCm: 410,
    anchor: { x: 0.545, y: 0.525, align: 'bottom' },
    wallAlbedo: 0.8,
    lightTint: [255, 249, 240],
    shadow: { x: 1, y: 1.2, blur: 2.5, opacity: 0.3 },
  }),
  room({
    // Back cushions ~74 cm wide and ~41 cm high (~7.7 px/cm)
    id: 'linen-sofa',
    name: 'Linen sofa',
    widthCm: 200,
    anchor: { x: 0.49, y: 0.523, align: 'bottom' },
    wallAlbedo: 0.88,
    lightTint: [255, 252, 247],
    shadow: { x: 1, y: 1, blur: 3, opacity: 0.25 },
  }),
  room({
    // Three-drawer sideboard ~170 cm wide, 14 cm handles (~8.7 px/cm)
    id: 'oak-sideboard',
    name: 'Oak sideboard',
    widthCm: 177,
    anchor: { x: 0.5, y: 0.62, align: 'bottom' },
    wallAlbedo: 0.78,
    lightTint: [255, 246, 232],
    shadow: { x: 1.4, y: 1, blur: 2.5, opacity: 0.32 },
  }),
  room({
    // Double-bed headboard ~165 cm wide, ~65 cm pillows (~5.1 px/cm)
    id: 'bedroom',
    name: 'Bedroom',
    widthCm: 300,
    anchor: { x: 0.554, y: 0.456, align: 'bottom' },
    wallAlbedo: 0.72,
    lightTint: [248, 250, 255],
    shadow: { x: 0.8, y: 1, blur: 3, opacity: 0.25 },
  }),
  room({
    // Bench seat ~45 cm high, ~50 cm cushion (~5.4 px/cm); sun from the right
    id: 'ochre-hallway',
    name: 'Ochre hallway',
    widthCm: 282,
    anchor: { x: 0.574, y: 0.497, align: 'bottom' },
    wallAlbedo: 0.68,
    lightTint: [255, 240, 215],
    shadow: { x: -1.6, y: 1.2, blur: 2, opacity: 0.38 },
  }),
  room({
    // Low bookcase ~75 cm high, ~24 cm books (~3.3 px/cm); sun from the window on the left
    id: 'sage-reading-room',
    name: 'Reading room',
    widthCm: 470,
    anchor: { x: 0.576, y: 0.53, align: 'bottom' },
    wallAlbedo: 0.55,
    lightTint: [255, 245, 228],
    shadow: { x: 1.6, y: 1.2, blur: 2, opacity: 0.36 },
  }),
  room({
    // ~24 cm books and ~77 cm middle compartment (~6.6 px/cm); sun from the left
    id: 'sage-reading-corner',
    name: 'Bookcase',
    widthCm: 233,
    anchor: { x: 0.5, y: 0.59, align: 'bottom' },
    wallAlbedo: 0.56,
    lightTint: [255, 244, 226],
    shadow: { x: 1.5, y: 1.2, blur: 2, opacity: 0.35 },
  }),
  room({
    // Two-drawer dresser ~160 cm wide, ~35 cm table lamp (~9.5 px/cm); lamp on the left
    id: 'lamp-dresser',
    name: 'Lamp light',
    widthCm: 162,
    anchor: { x: 0.52, y: 0.566, align: 'bottom' },
    wallAlbedo: 0.62,
    lightTint: [255, 234, 206],
    shadow: { x: 1.8, y: 0.3, blur: 2.5, opacity: 0.4 },
  }),
  room({
    // ~50 cm cushion and ~88 cm back cushions (~5.3 px/cm); low lamp on the left
    id: 'evening-sofa',
    name: 'Evening',
    widthCm: 242,
    anchor: { x: 0.575, y: 0.53, align: 'bottom' },
    wallAlbedo: 0.56,
    lightTint: [255, 222, 182],
    shadow: { x: 1.8, y: 0, blur: 3, opacity: 0.4 },
  }),
];
