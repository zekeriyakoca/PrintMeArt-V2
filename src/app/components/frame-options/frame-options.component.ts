import { Component, input, output, signal } from '@angular/core';
import { OptionGroupDto } from '../../models/product';

@Component({
  selector: 'app-frame-options',
  imports: [],
  templateUrl: './frame-options.component.html',
  styleUrl: './frame-options.component.scss',
})
export class FrameOptionsComponent {
  group = input.required<OptionGroupDto>();
  optionSelected = output<number>();
  selectedOption = signal<number>(0);

  selectOption(optionId: number) {
    this.selectedOption.update(() => optionId);
    this.optionSelected.emit(optionId);
  }
}
