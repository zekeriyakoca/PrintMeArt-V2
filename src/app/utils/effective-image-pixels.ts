import { MUSEUMS_SPECIAL } from '../data/museums';
import { ProductMetadata } from '../models/product';
import { DimensionParser } from './dimension-parser';

export type EffectivePixelsMode =
  | 'exact'
  | 'estimated'
  | 'fallback'
  | 'unknown';

export interface EffectiveImagePixels {
  widthPx: number;
  heightPx: number;
  mode: EffectivePixelsMode;
}

export class EffectiveImagePixelsResolver {
  static readonly TRUSTED_SOURCE_PPI = 300;
  static readonly TRUSTED_FALLBACK_LONG_EDGE_PX = 12_000;
  static readonly ASPECT_RATIO_TOLERANCE = 0.08;

  static resolve(
    meta: ProductMetadata | null | undefined,
  ): EffectiveImagePixels {
    const actual = EffectiveImagePixelsResolver.parsePixels(meta);
    const trusted = EffectiveImagePixelsResolver.isTrustedMuseumName(
      meta?.Museum,
    );

    if (!trusted) {
      return actual
        ? { ...actual, mode: 'exact' }
        : EffectiveImagePixelsResolver.unknown();
    }

    const parsed = DimensionParser.parse(meta?.Dimensions ?? '');
    if (
      actual &&
      parsed &&
      EffectiveImagePixelsResolver.isRatioCompatible(
        actual.widthPx,
        actual.heightPx,
        parsed.widthCm,
        parsed.heightCm,
      )
    ) {
      const estimated = EffectiveImagePixelsResolver.estimateFromDimensions(
        actual.widthPx,
        actual.heightPx,
        parsed.widthCm,
        parsed.heightCm,
      );
      const preferred = EffectiveImagePixelsResolver.preferHigherQuality(
        actual,
        estimated,
      );

      return {
        ...preferred,
        mode: preferred === actual ? 'exact' : 'estimated',
      };
    }

    if (actual) {
      const fallback = EffectiveImagePixelsResolver.scaleToLongEdge(
        actual.widthPx,
        actual.heightPx,
        EffectiveImagePixelsResolver.TRUSTED_FALLBACK_LONG_EDGE_PX,
      );
      const preferred = EffectiveImagePixelsResolver.preferHigherQuality(
        actual,
        fallback,
      );

      return {
        ...preferred,
        mode: preferred === actual ? 'exact' : 'fallback',
      };
    }

    if (parsed) {
      return {
        ...EffectiveImagePixelsResolver.estimateFromDimensions(
          parsed.widthCm,
          parsed.heightCm,
          parsed.widthCm,
          parsed.heightCm,
        ),
        mode: 'estimated',
      };
    }

    return EffectiveImagePixelsResolver.unknown();
  }

  static isTrustedMuseumName(
    museumName: string | null | undefined,
  ): boolean {
    const candidate = EffectiveImagePixelsResolver.normalize(museumName);
    if (!candidate) return false;

    for (const museum of MUSEUMS_SPECIAL) {
      const known = EffectiveImagePixelsResolver.normalize(museum);
      if (!known) continue;

      if (candidate === known) return true;
      if (candidate.includes(known)) return true;
      if (known.includes(candidate)) return true;
    }

    return false;
  }

  private static parsePixels(
    meta: ProductMetadata | null | undefined,
  ): Omit<EffectiveImagePixels, 'mode'> | null {
    const widthPx = Number(meta?.OriginalImageWidth);
    const heightPx = Number(meta?.OriginalImageHeight);
    if (
      !Number.isFinite(widthPx) ||
      !Number.isFinite(heightPx) ||
      widthPx <= 0 ||
      heightPx <= 0
    ) {
      return null;
    }

    return { widthPx, heightPx };
  }

  private static estimateFromDimensions(
    referenceWidth: number,
    referenceHeight: number,
    widthCm: number,
    heightCm: number,
  ): Omit<EffectiveImagePixels, 'mode'> {
    const longPx = Math.round(
      (Math.max(widthCm, heightCm) / 2.54) *
        EffectiveImagePixelsResolver.TRUSTED_SOURCE_PPI,
    );
    const shortPx = Math.round(
      (Math.min(widthCm, heightCm) / 2.54) *
        EffectiveImagePixelsResolver.TRUSTED_SOURCE_PPI,
    );

    const isLandscape = referenceWidth >= referenceHeight;
    return isLandscape
      ? { widthPx: longPx, heightPx: shortPx }
      : { widthPx: shortPx, heightPx: longPx };
  }

  private static scaleToLongEdge(
    widthPx: number,
    heightPx: number,
    targetLongEdgePx: number,
  ): Omit<EffectiveImagePixels, 'mode'> {
    const currentLongEdge = Math.max(widthPx, heightPx);
    if (currentLongEdge >= targetLongEdgePx) {
      return { widthPx, heightPx };
    }

    const scale = targetLongEdgePx / currentLongEdge;
    return {
      widthPx: Math.round(widthPx * scale),
      heightPx: Math.round(heightPx * scale),
    };
  }

  private static preferHigherQuality(
    actual: Omit<EffectiveImagePixels, 'mode'>,
    candidate: Omit<EffectiveImagePixels, 'mode'>,
  ): Omit<EffectiveImagePixels, 'mode'> {
    const actualShort = Math.min(actual.widthPx, actual.heightPx);
    const candidateShort = Math.min(candidate.widthPx, candidate.heightPx);
    if (actualShort !== candidateShort) {
      return actualShort > candidateShort ? actual : candidate;
    }

    const actualLong = Math.max(actual.widthPx, actual.heightPx);
    const candidateLong = Math.max(candidate.widthPx, candidate.heightPx);
    return actualLong >= candidateLong ? actual : candidate;
  }

  private static isRatioCompatible(
    widthPx: number,
    heightPx: number,
    widthCm: number,
    heightCm: number,
  ): boolean {
    const pixelRatio =
      Math.max(widthPx, heightPx) / Math.max(1, Math.min(widthPx, heightPx));
    const physicalRatio =
      Math.max(widthCm, heightCm) / Math.max(1, Math.min(widthCm, heightCm));

    return (
      Math.abs(pixelRatio - physicalRatio) <=
      EffectiveImagePixelsResolver.ASPECT_RATIO_TOLERANCE
    );
  }

  private static unknown(): EffectiveImagePixels {
    return { widthPx: NaN, heightPx: NaN, mode: 'unknown' };
  }

  private static normalize(value: string | null | undefined): string {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }
}
