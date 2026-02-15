import { Component, computed, input, model, signal } from '@angular/core';
import { SizeOption } from '../../models/size-option';
import { TooltipComponent } from '../shared/tooltip/tooltip.component';

@Component({
  selector: 'app-size-options',
  imports: [TooltipComponent],
  templateUrl: './size-options.component.html',
  styleUrl: './size-options.component.scss',
})
export class SizeOptionsComponent {
  sizes = input.required<SizeOption[]>();
  sizeSelected = model<SizeOption | null>(null);
  moreSizes = input<SizeOption[]>([]);

  showMoreSizes = signal(false);

  rows = computed(() => {
    const all = this.sizes();
    if (all.length <= 3) return [all];
    const topCount = Math.ceil(all.length / 2);
    return [all.slice(0, topCount), all.slice(topCount)];
  });

  selectedMoreSize = computed<SizeOption | null>(() => {
    const current = this.sizeSelected();
    if (!current) return null;
    return this.moreSizes().find(
      (s) => s.val1 === current.val1 && s.val2 === current.val2,
    ) ?? null;
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
