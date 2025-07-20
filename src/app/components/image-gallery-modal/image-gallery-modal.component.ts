import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GalleryImage {
  id: number;
  url: string;
}

@Component({
  selector: 'app-image-gallery-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-gallery-modal.component.html',
  styleUrls: ['./image-gallery-modal.component.scss'],
})
export class ImageGalleryModalComponent {
  @Input() isShowModal = false;
  @Input() images: GalleryImage[] = [];
  @Output() onClose = new EventEmitter<void>();

  selectedImageIndex: number | null = null;

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  closeSelectedImage() {
    this.selectedImageIndex = null;
  }

  prevSelectedImage() {
    if (this.selectedImageIndex !== null && this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    } else if (this.selectedImageIndex !== null) {
      this.selectedImageIndex = this.images.length - 1;
    }
  }

  nextSelectedImage() {
    if (
      this.selectedImageIndex !== null &&
      this.selectedImageIndex < this.images.length - 1
    ) {
      this.selectedImageIndex++;
    } else if (this.selectedImageIndex !== null) {
      this.selectedImageIndex = 0;
    }
  }

  closeModal() {
    this.selectedImageIndex = null;
    this.onClose.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onSelectedImageKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeSelectedImage();
    } else if (event.key === 'ArrowRight') {
      this.nextSelectedImage();
    } else if (event.key === 'ArrowLeft') {
      this.prevSelectedImage();
    }
  }
}
