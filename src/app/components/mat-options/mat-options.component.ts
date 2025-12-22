import { Component, model } from '@angular/core';

@Component({
  selector: 'app-mat-options',
  templateUrl: './mat-options.component.html',
  styleUrl: './mat-options.component.scss',
})
export class MatOptionsComponent {
  isMatIncluded = model<boolean>(false);
  onMatToggle() {
    this.isMatIncluded.update((current) => !current);
  }
}
