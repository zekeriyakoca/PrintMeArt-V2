import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ProductMetadata } from '../../models/product';
import { SizeOption } from '../../models/size-option';

@Component({
  selector: 'app-dpi-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
      [attr.aria-label]="ariaLabel()"
      [attr.title]="tooltip()"
    >
      <span class="font-medium">DPI</span>

      @if (dpi() !== null) {
        <span class="tabular-nums">{{ dpi() }}</span>
      } @else {
        <span class="text-slate-500">—</span>
      }

      <span class="sr-only">{{ qualityLabel() }}</span>

      <div class="ml-1 h-1.5 w-16 overflow-hidden rounded bg-slate-200" aria-hidden="true">
        <div class="h-full bg-slate-800" [style.width.%]="fillPercent() * 100"></div>
      </div>
    </div>
  `,
})
export class DpiBarComponent {
  readonly metadata = input.required<ProductMetadata>();

  /** Selected print size in centimeters (val1 x val2). Optional; without it we can't compute DPI. */
  readonly size = input<SizeOption | null>(null);

  readonly dpi = computed<number | null>(() => {
    const meta = this.metadata();
    const selectedSize = this.size();

    if (!selectedSize) return null;

    const pxW = Number(meta.OriginalImageWidth);
    const pxH = Number(meta.OriginalImageHeight);

    if (!Number.isFinite(pxW) || !Number.isFinite(pxH) || pxW <= 0 || pxH <= 0) {
      return null;
    }

    const cmW = Number(selectedSize.val1);
    const cmH = Number(selectedSize.val2);

    if (!Number.isFinite(cmW) || !Number.isFinite(cmH) || cmW <= 0 || cmH <= 0) {
      return null;
    }

    const inW = cmW / 2.54;
    const inH = cmH / 2.54;

    // Allow rotating the print: pick the better-fit orientation.
    const dpiFit1 = Math.min(pxW / inW, pxH / inH);
    const dpiFit2 = Math.min(pxW / inH, pxH / inW);

    const best = Math.max(dpiFit1, dpiFit2);
    if (!Number.isFinite(best) || best <= 0) return null;

    return Math.round(best);
  });

  readonly qualityLabel = computed(() => {
    const value = this.dpi();
    if (value === null) return 'DPI unavailable';
    if (value >= 300) return 'Excellent';
    if (value >= 200) return 'Good';
    if (value >= 150) return 'OK';
    return 'Low';
  });

  readonly fillPercent = computed(() => {
    const value = this.dpi();
    if (value === null) return 0;
    // Cap at 300dpi as "full" for the bar.
    return Math.max(0, Math.min(1, value / 300));
  });

  readonly tooltip = computed(() => {
    const meta = this.metadata();
    const selectedSize = this.size();

    const pxW = Number(meta.OriginalImageWidth);
    const pxH = Number(meta.OriginalImageHeight);

    const sizeText = selectedSize ? `${selectedSize.val1}×${selectedSize.val2} cm` : 'No size selected';

    if (!Number.isFinite(pxW) || !Number.isFinite(pxH)) {
      return `Image: unknown px • Size: ${sizeText}`;
    }

    const value = this.dpi();
    const dpiText = value === null ? '—' : `${value}`;

    return `Image: ${Math.round(pxW)}×${Math.round(pxH)} px • Size: ${sizeText} • DPI: ${dpiText} (${this.qualityLabel()})`;
  });

  readonly ariaLabel = computed(() => {
    const value = this.dpi();
    if (value === null) return 'DPI not available';
    return `DPI ${value}. ${this.qualityLabel()}`;
  });
}
