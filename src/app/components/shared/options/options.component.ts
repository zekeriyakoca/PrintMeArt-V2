import { Component, input, output } from '@angular/core';
import { OptionGroupDto } from '../../../models/product';

@Component({
  selector: 'app-options',
  imports: [],
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss',
})
export class OptionsComponent {
  group = input.required<OptionGroupDto>();
  optionSelected = output<number>();

  selectOption(optionId: number) {
    this.optionSelected.emit(optionId);
  }
  mapColorToHex(color: string) {
    switch (color?.toLowerCase()) {
      case 'red':
        return '#ff0000';
      case 'green':
        return '#00ff00';
      case 'blue':
        return '#0000ff';
      case 'white':
        return '#ffffff';
      default:
        return '#000000';
    }
  }
}
