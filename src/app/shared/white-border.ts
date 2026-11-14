/** White border: blank paper left around the artwork, inside the print size. */
export type WhiteBorderPresetId = 'none' | 'slim' | 'classic' | 'gallery';

export interface WhiteBorderPreset {
  id: WhiteBorderPresetId;
  /** Border as a share of the print's short side, so a preset looks the same on every size */
  ratio: number;
  /** Extra weight on the bottom edge, as galleries mount prints */
  bottomWeight: number;
}

export interface WhiteBorder {
  /** Preset the border came from; null once the customer drags the slider to a custom width */
  presetId: WhiteBorderPresetId | null;
  /** Top, left and right edge in cm */
  cm: number;
  /** Bottom edge in cm */
  bottomCm: number;
}

export const WHITE_BORDER_PRESETS: readonly WhiteBorderPreset[] = [
  { id: 'none', ratio: 0, bottomWeight: 0 },
  { id: 'slim', ratio: 0.05, bottomWeight: 0 },
  { id: 'classic', ratio: 0.1, bottomWeight: 0 },
  { id: 'gallery', ratio: 0.15, bottomWeight: 0.15 },
];

export const WHITE_BORDER_STEP_CM = 0.25;
const WHITE_BORDER_MAX_RATIO = 0.2;

export const NO_WHITE_BORDER: WhiteBorder = { presetId: 'none', cm: 0, bottomCm: 0 };

const snap = (cm: number) => Math.round(cm / WHITE_BORDER_STEP_CM) * WHITE_BORDER_STEP_CM;

export function whiteBorderMaxCm(widthCm: number, heightCm: number): number {
  return Math.max(WHITE_BORDER_STEP_CM, snap(Math.min(widthCm, heightCm) * WHITE_BORDER_MAX_RATIO));
}

export function whiteBorderFromPreset(id: WhiteBorderPresetId, widthCm: number, heightCm: number): WhiteBorder {
  const preset = WHITE_BORDER_PRESETS.find((p) => p.id === id) ?? WHITE_BORDER_PRESETS[0];
  const cm = Math.min(whiteBorderMaxCm(widthCm, heightCm), snap(Math.min(widthCm, heightCm) * preset.ratio));
  return { presetId: preset.id, cm, bottomCm: snap(cm * (1 + preset.bottomWeight)) };
}

/** Slider value; picks up the preset it lands on, so its tile lights up */
export function whiteBorderFromCm(cm: number, widthCm: number, heightCm: number): WhiteBorder {
  const value = Math.min(whiteBorderMaxCm(widthCm, heightCm), Math.max(0, snap(cm)));
  const match = WHITE_BORDER_PRESETS.find((p) => !p.bottomWeight && whiteBorderFromPreset(p.id, widthCm, heightCm).cm === value);
  return { presetId: match?.id ?? null, cm: value, bottomCm: value };
}

/** Keeps the border right for a new size: presets scale, custom widths stay within the limit */
export function fitWhiteBorder(border: WhiteBorder, widthCm: number, heightCm: number): WhiteBorder {
  if (border.presetId) return whiteBorderFromPreset(border.presetId, widthCm, heightCm);
  return whiteBorderFromCm(border.cm, widthCm, heightCm);
}

export function sameWhiteBorder(a: WhiteBorder, b: WhiteBorder): boolean {
  return a.presetId === b.presetId && a.cm === b.cm && a.bottomCm === b.bottomCm;
}
