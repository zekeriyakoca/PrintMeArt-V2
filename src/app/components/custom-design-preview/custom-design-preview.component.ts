import { CommonModule } from '@angular/common';
import { Component, input, Input, signal } from '@angular/core';
import { DesignFrame } from '../../shared/constants';
import { DesignSize } from '../../pages/custom-design/custom-design.component';

@Component({
  selector: 'app-custom-design-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-design-preview.component.html',
  styleUrl: './custom-design-preview.component.scss',
})
export class CustomDesignPreviewComponent {
  imageUrl = input<string | null>(null);
  isMatIncluded = input(false);
  selectedFrameImageUrl = input<string | null>(null);
  isRolledUp = false;
}
