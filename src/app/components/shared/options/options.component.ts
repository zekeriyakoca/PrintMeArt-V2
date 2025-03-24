import { Component, input, output } from '@angular/core';
import { OptionGroupDto } from '../../../models/product';
import { mapColorToHex } from '../../../shared/utils';

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

  mapColorToHex(color: string): string {
    return mapColorToHex(color);
  }
}
