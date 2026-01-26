import { MUSEUMS } from '../data/museums';
import { ProductMetadata } from '../models/product';

export class MuseumHighRes {
  static readonly OVERRIDE_PX = 10_000;

  static isHighResMuseumName(museumName: string | null | undefined): boolean {
    const candidate = MuseumHighRes.normalize(museumName);
    if (!candidate) return false;

    for (const museum of MUSEUMS) {
      const known = MuseumHighRes.normalize(museum.name);
      if (!known) continue;

      if (candidate === known) return true;
      if (candidate.includes(known)) return true;
      if (known.includes(candidate)) return true;
    }

    return false;
  }

  static getEffectiveImagePixels(meta: ProductMetadata): {
    widthPx: number;
    heightPx: number;
    overridden: boolean;
  } {
    const overridden =
      MuseumHighRes.isHighResMuseumName(meta?.Museum) &&
      MuseumHighRes.OVERRIDE_PX > +meta?.OriginalImageWidth;
    if (overridden) {
      return {
        widthPx: MuseumHighRes.OVERRIDE_PX,
        heightPx: MuseumHighRes.OVERRIDE_PX,
        overridden: true,
      };
    }

    return {
      widthPx: Number(meta?.OriginalImageWidth),
      heightPx: Number(meta?.OriginalImageHeight),
      overridden: false,
    };
  }

  private static normalize(value: string | null | undefined): string {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }
}
