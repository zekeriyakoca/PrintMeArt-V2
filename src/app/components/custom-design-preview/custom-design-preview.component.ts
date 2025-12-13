import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-design-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-design-preview.component.html',
  styleUrl: './custom-design-preview.component.scss',
})
export class CustomDesignPreviewComponent {
  @Input({ required: true }) imageUrl: string | null = null;
  @Input({ required: true }) isMatIncluded: boolean = false;
  @Input({ required: true }) isRolledUp: boolean = false;
  @Input({ required: true }) frameBorderClass: string = '';
}
