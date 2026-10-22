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

export const ROOM_SCENES: RoomScene[] = [
  {
    // Scale from the sofa back and the organ against the wall (~3.8 px/cm)
    id: 'living-room',
    name: 'Living room',
    image: '/rooms/living-room.jpg',
    widthCm: 282,
    anchor: { x: 0.556, y: 0.422, align: 'bottom' },
    wallAlbedo: 0.88,
    lightTint: [255, 251, 245],
    shadow: { x: 0.8, y: 1.2, blur: 2.5, opacity: 0.3 },
  },
  {
    // Scale from the planters and the uncropped ceiling height (~5.3 px/cm)
    id: 'white-wall',
    name: 'White wall',
    image: '/rooms/white-wall.jpg',
    widthCm: 283,
    anchor: { x: 0.433, y: 0.338, align: 'center' },
    wallAlbedo: 0.85,
    lightTint: [250, 252, 255],
    shadow: { x: 1.2, y: 1, blur: 2.5, opacity: 0.3 },
  },
  {
    // Scale from the turntable, the window and the ceiling height (~6 px/cm)
    id: 'record-corner',
    name: 'Record corner',
    image: '/rooms/record-corner.jpg',
    widthCm: 222,
    anchor: { x: 0.45, y: 0.44, align: 'bottom' },
    wallAlbedo: 0.85,
    lightTint: [255, 246, 234],
    shadow: { x: 1.2, y: 1.2, blur: 2.5, opacity: 0.3 },
  },
];
