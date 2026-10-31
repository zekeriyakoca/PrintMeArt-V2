import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, input, output } from '@angular/core';

import { IconComponent } from '../shared/icon/icon.component';

export interface Frame {
  id: number;
  name: string;
  description: string;
  image: string;
  hoverImage: string;
  allImages: string[];
}

@Component({
  selector: 'app-frame-card',
  standalone: true,
  imports: [TranslatePipe, IconComponent],
  templateUrl: './frame-card.component.html',
  styleUrl: './frame-card.component.scss',
})
export class FrameCardComponent {
  frame = input.required<Frame>();
  showPhotos = output<void>();

  onShowPhotos(event: Event) {
    event.stopPropagation();
    this.showPhotos.emit();
  }
}
