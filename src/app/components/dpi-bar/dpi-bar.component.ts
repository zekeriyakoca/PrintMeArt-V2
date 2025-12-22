import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ProductMetadata } from '../../models/product';
import { SizeOption } from '../../models/size-option';
import { IconComponent } from '../shared/icon/icon.component';
import { TooltipComponent } from '../shared/tooltip/tooltip.component';

type DpiQuality = 'unknown' | 'fineart' | 'good' | 'borderline' | 'low';

@Component({
  selector: 'app-dpi-bar',
  standalone: true,
  imports: [IconComponent, TooltipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-tooltip [ariaLabel]="ariaLabel()">
      <div [class]="pillClasses()">
        <span
          class="inline-flex h-4 w-4 items-center justify-center"
          aria-hidden="true"
        >
          @if (showWarningIcon()) {
            <app-icon iconName="warning" class="h-4 w-4"></app-icon>
          } @else {
            <app-icon iconName="check" class="h-4 w-4"></app-icon>
          }
        </span>

        <span class="font-medium">FineArt</span>
        <span class="opacity-40" aria-hidden="true">·</span>
        <span class="font-semibold" [class]="labelClasses()">{{
          qualityText()
        }}</span>

        @if (dpi() !== null) {
          <div
            class="ml-1.5 h-1.5 w-14 overflow-hidden rounded-full bg-black/10"
            aria-hidden="true"
          >
            <div
              class="h-full"
              [class]="barFillClasses()"
              [style.width.%]="fillPercent() * 100"
            ></div>
          </div>
        }

        @if (dpi() !== null) {
          <span class="opacity-40" aria-hidden="true">·</span>
          <span class="tabular-nums font-medium">{{ dpi() }} dpi</span>
        } @else {
          <span class="opacity-60">Select size</span>
        }
      </div>

      <div tooltip>
        <div [class]="tooltipHeaderClasses()" class="px-4 py-3 text-center">
          <div class="text-2xl mb-0.5">{{ tooltipEmoji() }}</div>
          <div class="font-semibold text-sm">{{ tooltipHeadline() }}</div>
        </div>

        <div class="px-4 py-3 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-500">Your image</span>
            <span class="font-medium text-slate-900">{{ imagePxText() }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-500">Print size</span>
            <span class="font-medium text-slate-900">{{ sizeText() }}</span>
          </div>
          <div
            class="flex items-center justify-between text-xs pt-1 border-t border-slate-100"
          >
            <span class="text-slate-500">Print quality</span>
            <span class="font-bold text-slate-900">{{ dpi() ?? '—' }} dpi</span>
          </div>
        </div>

        @if (quality() === 'borderline' || quality() === 'low') {
          <div
            class="px-4 py-2.5 bg-[rgb(252,247,240)] border-t border-[rgba(165,100,45,0.2)] text-xs text-[rgb(165,100,45)] text-center"
          >
            💡 Try a smaller size for sharper prints
          </div>
        }
      </div>
    </app-tooltip>
  `,
})
export class DpiBarComponent {
  readonly metadata = input.required<ProductMetadata>();
  readonly size = input<SizeOption | null>(null);

  readonly dpi = computed<number | null>(() => {
    const meta = this.metadata();
    const selectedSize = this.size();

    if (!selectedSize) return null;

    const pxW = Number(meta.OriginalImageWidth);
    const pxH = Number(meta.OriginalImageHeight);
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
        return 'Ready';
      case 'good':
        return 'Good';
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
    const pxW = Number(meta.OriginalImageWidth);
    const pxH = Number(meta.OriginalImageHeight);
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
