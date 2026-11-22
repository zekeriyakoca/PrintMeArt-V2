import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, input, output } from '@angular/core';

@Component({
  imports: [TranslatePipe],
  selector: 'app-enhancement-options',
  templateUrl: './enhancement-options.component.html',
})
export class EnhancementOptionsComponent {
  isIncluded = input(false);
  toggle = output<void>();
}
