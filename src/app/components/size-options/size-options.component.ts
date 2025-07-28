import { Component, input, model } from '@angular/core';
import { SizeOption } from '../../models/size-option';

@Component({
  selector: 'app-size-options',
  imports: [],
  templateUrl: './size-options.component.html',
  styleUrl: './size-options.component.scss',
})
export class SizeOptionsComponent {
  sizes = input.required<SizeOption[]>();
  sizeSelected = model<SizeOption | null>(null);

  isActive(size: SizeOption): boolean {
    return this.sizeSelected()?.id === size.id;
  }

  selectSize(size: SizeOption): void {
    this.sizeSelected.update(() => size);
  }
}
