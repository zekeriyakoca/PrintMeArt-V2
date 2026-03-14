import { SizeOption } from '../models/size-option';

export interface ParsedDimensions {
  widthCm: number;
  heightCm: number;
}

export class DimensionParser {
  /**
   * Parses cm dimensions from a metadata Dimensions string.
   *
   * Pattern A: "W x H cm" inline format
   *   e.g. "29 x 36 1/4 in. (73.7 x 92.1 cm)"
   *
   * Pattern B: "height: X cm ... width: Y cm" labeled format
   *   e.g. "height: 35.6 cm (14 in); width: 53.3 cm (21 in)"
   *
   * Returns null if parsing fails.
   */
  static parse(dimensions: string): ParsedDimensions | null {
    if (!dimensions || dimensions.trim().toLowerCase() === 'null') return null;

    // Pattern A: W x H cm/mm or W cm x H cm/mm
    const patternA =
      /(\d+(?:[.,]\d+)?)\s*(cm|mm)?\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(cm|mm)\b/i;
    const matchA = dimensions.match(patternA);
    if (matchA) {
      const unit1 = (matchA[2] || matchA[4] || 'cm').toLowerCase();
      const unit2 = matchA[4].toLowerCase();
      const w = DimensionParser.toCm(matchA[1], unit1);
      const h = DimensionParser.toCm(matchA[3], unit2);
      if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
        return { widthCm: w, heightCm: h };
      }
    }

    // Pattern B: height/width or hoogte/breedte with optional colon in cm/mm
    const heightMatch = dimensions.match(
      /\b(?:height|hoogte)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(cm|mm)\b/i,
    );
    const widthMatch = dimensions.match(
      /\b(?:width|breedte)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(cm|mm)\b/i,
    );
    if (heightMatch && widthMatch) {
      const h = DimensionParser.toCm(heightMatch[1], heightMatch[2]);
      const w = DimensionParser.toCm(widthMatch[1], widthMatch[2]);
      if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
        return { widthCm: w, heightCm: h };
      }
    }

    return null;
  }

  /**
   * Filters size options based on parsed artwork dimensions.
   * Keeps sizes that fit within the original, adds an "Original" size,
   * and includes one extra larger size beyond the original.
   * Returns null if dimensions can't be parsed (caller should fall back to all sizes).
   */
  static filterSizes(
    dimensionString: string,
    allSizes: SizeOption[],
  ): SizeOption[] | null {
    const parsed = DimensionParser.parse(dimensionString);
    if (!parsed) return null;

    const origMin = Math.min(parsed.widthCm, parsed.heightCm);
    const origMax = Math.max(parsed.widthCm, parsed.heightCm);

    const fitting: SizeOption[] = [];
    const exceeding: SizeOption[] = [];

    for (const size of allSizes) {
      const sizeMin = Math.min(size.val1, size.val2);
      const sizeMax = Math.max(size.val1, size.val2);
      if (sizeMin <= origMin && sizeMax <= origMax) {
        fitting.push(size);
      } else {
        exceeding.push(size);
      }
    }

    const roundedMin = Math.round(origMin);
    const roundedMax = Math.round(origMax);
    const originalSize: SizeOption = {
      id: 'original',
      name: `${roundedMin}x${roundedMax}`,
      val1: roundedMin,
      val2: roundedMax,
    };

    const oneExtra = exceeding.length > 0 ? [exceeding[0]] : [];

    return [...fitting, originalSize, ...oneExtra];
  }

  private static toCm(value: string, unit: string): number {
    const numeric = parseFloat(value.replace(',', '.'));
    if (isNaN(numeric)) return NaN;
    return unit.toLowerCase() === 'mm' ? numeric / 10 : numeric;
  }
}
