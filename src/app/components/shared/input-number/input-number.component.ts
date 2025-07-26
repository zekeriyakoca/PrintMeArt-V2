import { Component, input, Input, model, output } from '@angular/core';

@Component({
  selector: 'app-input-number',
  imports: [],
  templateUrl: './input-number.component.html',
  styleUrl: './input-number.component.scss',
})
export class InputNumberComponent {
  className = input<string>('w-full');
  value = model<number>(1);
  min = input<number>(1);
  max = input<number>(99);
  label = input<string>('');
  desc = input<string>('');

  ngOnInit() {}

  handleClickDecrement() {
    if (this.min >= this.value) return;
    this.value.update((currentValue) => {
      const newValue = currentValue - 1;
      return Math.max(newValue, this.min());
    });
  }

  handleClickIncrement() {
    if (this.max && this.max <= this.value) return;
    this.value.update((currentValue) => {
      const newValue = currentValue + 1;
      return this.max ? Math.min(newValue, this.max()) : newValue;
    });
  }

  get isDecrementDisabled(): boolean {
    return this.min() >= this.value();
  }

  get isIncrementDisabled(): boolean {
    return this.max() ? this.max() <= this.value() : false;
  }
}
