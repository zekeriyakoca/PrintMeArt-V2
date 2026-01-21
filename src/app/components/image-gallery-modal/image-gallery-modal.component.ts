import { Component, computed, input, output, signal } from '@angular/core';
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

  // Zoom state
  isZoomed = signal(false);
  mouseX = signal(50);
  mouseY = signal(50);

  zoomTransform = computed(() => {
    if (!this.isZoomed()) return 'scale(1)';
    const x = this.mouseX();
    const y = this.mouseY();
    return `scale(1.5) translate(${50 - x}%, ${50 - y}%)`;
  });

  toggleZoom(event: MouseEvent) {
    event.stopPropagation();
    if (this.isZoomed()) {
      this.isZoomed.set(false);
    } else {
      this.isZoomed.set(true);
      this.updateMousePosition(event);
    }
  }

  onZoomMouseMove(event: MouseEvent) {
    if (!this.isZoomed()) return;
    this.updateMousePosition(event);
  }

  private updateMousePosition(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.mouseX.set(Math.max(0, Math.min(100, x)));
    this.mouseY.set(Math.max(0, Math.min(100, y)));
  }

  resetZoom() {
    this.isZoomed.set(false);
    this.mouseX.set(50);
    this.mouseY.set(50);
  }

  ngOnChanges() {
    if (this.isShowModal()) {
      this.currentIndex.set(this.startIndex());
      this.resetZoom();
    }
  }

  selectImage(index: number) {
    this.currentIndex.set(index);
    this.resetZoom();
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

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onSelectedImageKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.isZoomed()) {
        this.resetZoom();
      } else {
        this.closeModal();
      }
    } else if (event.key === 'ArrowRight') {
      this.nextSelectedImage();
      this.resetZoom();
    } else if (event.key === 'ArrowLeft') {
      this.prevSelectedImage();
      this.resetZoom();
    }
  }
}
