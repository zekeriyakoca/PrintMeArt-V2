import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../services/i18n/translate.pipe';

/** Preview & Design's actions: start over and save the design */
@Component({
  imports: [TranslatePipe],
  selector: 'app-design-actions',
  templateUrl: './design-actions.component.html',
  styleUrl: './design-actions.component.scss',
})
export class DesignActionsComponent {
  saving = input(false);
  /** The design shown is the one saved last; Save stays off until it is edited */
  saved = input(false);
  reset = output<void>();
  save = output<void>();
}
