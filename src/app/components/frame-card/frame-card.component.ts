import { Component, input, output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
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
