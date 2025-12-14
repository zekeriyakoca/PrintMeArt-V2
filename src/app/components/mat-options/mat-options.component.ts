import { Component, input, model, output } from '@angular/core';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-mat-options',
  imports: [IconComponent],
  templateUrl: './mat-options.component.html',
  styleUrl: './mat-options.component.scss',
})
export class MatOptionsComponent {
  isMatIncluded = model<boolean>(false);
  onMatToggle() {
    this.isMatIncluded.update((current) => !current);
  }
}
