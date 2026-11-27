import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, ElementRef, computed, inject, input, model, signal } from '@angular/core';
import { SizeOption } from '../../models/size-option';
import { NgTemplateOutlet } from '@angular/common';
import { TooltipComponent } from '../shared/tooltip/tooltip.component';

@Component({
  selector: 'app-size-options',
  imports: [TranslatePipe, TooltipComponent, NgTemplateOutlet],
  templateUrl: './size-options.component.html',
  styleUrl: './size-options.component.scss',
})
export class SizeOptionsComponent {
  sizes = input.required<SizeOption[]>();
  sizeSelected = model<SizeOption | null>(null);
  moreSizes = input<SizeOption[]>([]);

  showMoreSizes = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Opens or closes More sizes; opened, it is brought into view once it has unfolded */
  toggleMoreSizes() {
    this.showMoreSizes.update((open) => !open);
    if (this.showMoreSizes()) setTimeout(() => this.host.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 260);
  }

  rows = computed(() => {
    const all = this.sizes();
    if (all.length <= 3) return [all];
    const topCount = Math.ceil(all.length / 2);
    return [all.slice(0, topCount), all.slice(topCount)];
  });

  /**
   * Drawn sheet per size, in px: true proportions, and bigger sizes drawn bigger.
   * The smallest still gets a third of the box, so it stays a sheet and not a dot.
   */
  glyphs = computed(() => {
    const GLYPH_PX = 24;
    const all = this.sizes();
    const longest = Math.max(1, ...all.map((s) => Math.max(s.val1, s.val2)));
    const map = new Map<number | string, { w: number; h: number }>();
    for (const size of all) {
      const long = Math.max(size.val1, size.val2) || 1;
      const longPx = GLYPH_PX * (0.35 + 0.65 * (long / longest));
      map.set(size.id, {
        w: Math.round((longPx * size.val1) / long),
        h: Math.round((longPx * size.val2) / long),
      });
    }
    return map;
  });

  selectedMoreSize = computed<SizeOption | null>(() => {
    const current = this.sizeSelected();
    if (!current) return null;
    return this.moreSizes().find((s) => s.val1 === current.val1 && s.val2 === current.val2) ?? null;
  });

  isActive(size: SizeOption): boolean {
    return this.sizeSelected()?.id === size.id;
  }

  selectSize(size: SizeOption): void {
    this.sizeSelected.update(() => size);
  }

  selectMoreSize(size: SizeOption): void {
    this.sizeSelected.set({
      id: 'custom',
      name: size.name,
      val1: size.val1,
      val2: size.val2,
    });
    this.showMoreSizes.set(false);
  }
}
