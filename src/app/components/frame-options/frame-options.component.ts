import { Component, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OptionGroupDto } from '../../models/product';

@Component({
  selector: 'app-frame-options',
  imports: [RouterLink],
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
