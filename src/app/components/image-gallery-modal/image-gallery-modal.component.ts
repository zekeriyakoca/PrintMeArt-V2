import { Component, input, output, signal } from '@angular/core';
import { IconComponent } from '../shared/icon/icon.component';

export interface GalleryImage {
  id: number;
  url: string;
}

@Component({
  selector: 'app-image-gallery-modal',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './image-gallery-modal.component.html',
  styleUrls: ['./image-gallery-modal.component.scss'],
})
export class ImageGalleryModalComponent {
  isShowModal = input<boolean>(false);
  images = input<GalleryImage[]>([]);
  startIndex = input<number>(0);
  onClose = output<void>();

  currentIndex = signal(0);

  ngOnChanges() {
    if (this.isShowModal()) {
      this.currentIndex.set(this.startIndex());
    }
  }

  selectImage(index: number) {
    this.currentIndex.set(index);
  }

  prevSelectedImage() {
    const current = this.currentIndex();
    if (current > 0) {
      this.currentIndex.set(current - 1);
    } else {
      this.currentIndex.set(this.images().length - 1);
    }
  }

  nextSelectedImage() {
    const current = this.currentIndex();
    if (current < this.images().length - 1) {
      this.currentIndex.set(current + 1);
    } else {
      this.currentIndex.set(0);
    }
  }

  closeModal() {
    this.onClose.emit();
  }

  onSelectedImageKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
    } else if (event.key === 'ArrowRight') {
      this.nextSelectedImage();
    } else if (event.key === 'ArrowLeft') {
      this.prevSelectedImage();
    }
  }
}
