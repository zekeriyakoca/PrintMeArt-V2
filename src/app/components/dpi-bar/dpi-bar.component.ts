import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
} from '@angular/core';
import { ProductMetadata } from '../../models/product';
import { SizeOption } from '../../models/size-option';
import { MuseumHighRes } from '../../utils/museum-highres';
import { IconComponent } from '../shared/icon/icon.component';
import { TooltipComponent } from '../shared/tooltip/tooltip.component';

type DpiQuality = 'unknown' | 'fineart' | 'good' | 'borderline' | 'low';

@Component({
  selector: 'app-dpi-bar',
  standalone: true,
  imports: [IconComponent, TooltipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dpi-bar.component.html',
  styleUrls: ['./dpi-bar.component.scss'],
})
export class DpiBarComponent {
  readonly metadata = input.required<ProductMetadata>();
  readonly size = input<SizeOption | null>(null);

  readonly dpi = computed<number | null>(() => {
    const meta = this.metadata();
    const selectedSize = this.size();

    if (!selectedSize) return null;

    const { widthPx: pxW, heightPx: pxH } =
      MuseumHighRes.getEffectiveImagePixels(meta);
    if (
      !Number.isFinite(pxW) ||
      !Number.isFinite(pxH) ||
      pxW <= 0 ||
      pxH <= 0
    ) {
      return null;
    }

    const cmW = Number(selectedSize.val1);
    const cmH = Number(selectedSize.val2);
    if (
      !Number.isFinite(cmW) ||
      !Number.isFinite(cmH) ||
      cmW <= 0 ||
      cmH <= 0
    ) {
      return null;
    }

    const inW = cmW / 2.54;
    const inH = cmH / 2.54;

    // Allow rotating: pick the better-fit orientation.
    const dpiFit1 = Math.min(pxW / inW, pxH / inH);
    const dpiFit2 = Math.min(pxW / inH, pxH / inW);

    const best = Math.max(dpiFit1, dpiFit2);
    if (!Number.isFinite(best) || best <= 0) return null;

    return Math.round(best);
  });

  readonly quality = computed<DpiQuality>(() => {
    const value = this.dpi();
    if (value === null) return 'unknown';
    if (value >= 300) return 'fineart';
    if (value >= 200) return 'good';
    if (value >= 150) return 'borderline';
    return 'low';
  });

  readonly qualityText = computed(() => {
    switch (this.quality()) {
      case 'fineart':
        return 'Excellent';
      case 'good':
        return 'Very Good';
      case 'borderline':
        return 'Borderline';
      case 'low':
        return 'Low';
      default:
        return '—';
    }
  });

  readonly showWarningIcon = computed(() => {
    const q = this.quality();
    return q === 'borderline' || q === 'low';
  });

  readonly pillClasses = computed(() => {
    const prefix =
      'inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs';

    switch (this.quality()) {
      case 'fineart':
        return `${prefix} border-[rgba(22,122,146,0.3)] bg-[rgb(242,248,245)] text-[rgb(22,122,146)]`;
      case 'borderline':
        return `${prefix} border-[rgba(165,100,45,0.3)] bg-[rgb(252,247,240)] text-[rgb(165,100,45)]`;
      case 'low':
        return `${prefix} border-[rgba(195,61,61,0.3)] bg-[rgb(252,242,242)] text-[rgb(195,61,61)]`;
      case 'good':
      default:
        return `${prefix} border-[rgb(204,204,204)] bg-[rgb(247,246,242)] text-[rgb(92,92,95)]`;
    }
  });

  readonly dotClasses = computed(() => {
    switch (this.quality()) {
      case 'fineart':
        return 'bg-[rgb(22,122,146)]';
      case 'good':
        return 'bg-[rgb(92,92,95)]';
      case 'borderline':
        return 'bg-[rgb(165,100,45)]';
      case 'low':
        return 'bg-[rgb(195,61,61)]';
      default:
        return 'bg-[rgb(204,204,204)]';
    }
  });

  readonly labelClasses = computed(() => {
    switch (this.quality()) {
      case 'fineart':
        return 'text-[rgb(22,122,146)]';
      case 'borderline':
        return 'text-[rgb(165,100,45)]';
      case 'low':
        return 'text-[rgb(195,61,61)]';
      default:
        return 'text-[rgb(92,92,95)]';
    }
  });

  readonly fillPercent = computed(() => {
    const value = this.dpi();
    if (value === null) return 0;
    return Math.max(0, Math.min(1, value / 300));
  });

  readonly barFillClasses = computed(() => {
    switch (this.quality()) {
      case 'fineart':
        return 'bg-[rgb(22,122,146)]';
      case 'borderline':
        return 'bg-[rgb(165,100,45)]';
      case 'low':
        return 'bg-[rgb(195,61,61)]';
      default:
        return 'bg-[rgb(38,38,44)]';
    }
  });

  readonly sizeText = computed(() => {
    const selectedSize = this.size();
    if (!selectedSize) return '—';
    return `${selectedSize.val1}x${selectedSize.val2} cm`;
  });

  readonly imagePxText = computed(() => {
    const meta = this.metadata();
    const { widthPx: pxW, heightPx: pxH } =
      MuseumHighRes.getEffectiveImagePixels(meta);
    if (!Number.isFinite(pxW) || !Number.isFinite(pxH)) return '—';
    return `${Math.round(pxW)}x${Math.round(pxH)} px`;
  });

  readonly tooltipEmoji = computed(() => {
    switch (this.quality()) {
      case 'fineart':
        return '✨';
      case 'good':
        return '👍';
      case 'borderline':
        return '⚠️';
      case 'low':
        return '😬';
      default:
        return '🔍';
    }
  });

  readonly tooltipHeadline = computed(() => {
    switch (this.quality()) {
      case 'fineart':
        return 'Perfect for FineArt';
      case 'good':
        return 'Good quality';
      case 'borderline':
        return 'May look soft';
      case 'low':
        return 'Will look pixelated';
      default:
        return 'Select a size';
    }
  });

  readonly tooltipHeaderClasses = computed(() => {
    switch (this.quality()) {
      case 'fineart':
        return 'bg-gradient-to-b from-[rgb(242,248,245)] to-white text-[rgb(22,122,146)]';
      case 'good':
        return 'bg-gradient-to-b from-[rgb(247,246,242)] to-white text-[rgb(38,38,44)]';
      case 'borderline':
        return 'bg-gradient-to-b from-[rgb(252,247,240)] to-white text-[rgb(165,100,45)]';
      case 'low':
        return 'bg-gradient-to-b from-[rgb(252,242,242)] to-white text-[rgb(195,61,61)]';
      default:
        return 'bg-gradient-to-b from-[rgb(247,246,242)] to-white text-[rgb(38,38,44)]';
    }
  });

  readonly ariaLabel = computed(() => {
    const value = this.dpi();
    if (value === null) {
      return 'Print quality unknown. Select a size to estimate DPI.';
    }
    return `Print quality ${this.qualityText()}. Estimated ${value} DPI.`;
  });
}
