import { Component, computed, input, model } from '@angular/core';
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

  rows = computed(() => {
    const all = this.sizes();
    if (all.length <= 3) return [all];
    const topCount = Math.ceil(all.length / 2);
    return [all.slice(0, topCount), all.slice(topCount)];
  });

  isActive(size: SizeOption): boolean {
    return this.sizeSelected()?.id === size.id;
  }

  selectSize(size: SizeOption): void {
    this.sizeSelected.update(() => size);
  }
}
