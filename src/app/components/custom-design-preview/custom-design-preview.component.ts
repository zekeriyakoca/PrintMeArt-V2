
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-custom-design-preview',
  standalone: true,
  imports: [],
  templateUrl: './custom-design-preview.component.html',
  styleUrl: './custom-design-preview.component.scss',
})
export class CustomDesignPreviewComponent {
  imageUrl = input<string | null>(null);
  isMatIncluded = input(false);
  selectedFrameMaskUrl = input<string | null>(null);
  isRolledUp = input(false);
}
