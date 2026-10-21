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
  /** An existing picture in the photo to paint over with the surrounding wall. */
  clear?: { x0: number; y0: number; x1: number; y1: number };
}

export const ROOM_SCENES: RoomScene[] = [
  {
    id: 'elysa',
    name: 'Reading corner',
    image: '/rooms/elysa.jpg',
    widthCm: 235,
    anchor: { x: 0.716, y: 0.208, align: 'center' },
    wallAlbedo: 0.5,
    lightTint: [255, 236, 210],
    shadow: { x: 1.6, y: 1.2, blur: 2.5, opacity: 0.45 },
    clear: { x0: 0.55, y0: 0.058, x1: 0.93, y1: 0.385 },
  },
];
