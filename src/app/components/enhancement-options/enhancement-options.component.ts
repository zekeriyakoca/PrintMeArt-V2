import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, model } from '@angular/core';

@Component({
  imports: [TranslatePipe],
  selector: 'app-enhancement-options',
  templateUrl: './enhancement-options.component.html',
})
export class EnhancementOptionsComponent {
  isIncluded = model<boolean>(false);
  onToggle() {
    this.isIncluded.update((current) => !current);
  }
}
