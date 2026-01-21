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

  readonly isZoomed = signal(false);
  readonly zoomScale = signal(1);
  readonly panX = signal(0);
  readonly panY = signal(0);
  readonly isPanning = signal(false);
  private panStartX = 0;
  private panStartY = 0;
  private pointerStartX = 0;
  private pointerStartY = 0;

  readonly imageTransform = computed(() => {
    const scale = this.zoomScale();
    const x = this.panX();
    const y = this.panY();
    return `translate(${x}px, ${y}px) scale(${scale})`;
  });

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
    this.resetZoom();
  }

  nextSelectedImage() {
    const current = this.currentIndex();
    if (current < this.images().length - 1) {
      this.currentIndex.set(current + 1);
    } else {
      this.currentIndex.set(0);
    }
    this.resetZoom();
  }

  closeModal() {
    this.resetZoom();
    this.onClose.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  zoom(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.toggleZoom();
  }

  toggleZoom(event?: MouseEvent) {
    if (event) event.stopPropagation();

    if (!this.isZoomed()) {
      this.isZoomed.set(true);
      this.zoomScale.set(2);
      this.panX.set(0);
      this.panY.set(0);
      return;
    }

    this.resetZoom();
  }

  resetZoom() {
    this.isPanning.set(false);
    this.isZoomed.set(false);
    this.zoomScale.set(1);
    this.panX.set(0);
    this.panY.set(0);
  }

  onImageWheel(event: WheelEvent) {
    if (!this.isZoomed()) return;

    const delta = event.deltaY;
    const direction = delta > 0 ? -1 : 1;
    const current = this.zoomScale();
    const next = Math.min(4, Math.max(1, current + direction * 0.25));
    this.zoomScale.set(next);
    if (next <= 1) {
      this.resetZoom();
    }
  }

  onImagePointerDown(event: PointerEvent) {
    if (!this.isZoomed()) return;
    this.isPanning.set(true);
    this.pointerStartX = event.clientX;
    this.pointerStartY = event.clientY;
    this.panStartX = this.panX();
    this.panStartY = this.panY();
    try {
      (event.currentTarget as HTMLElement | null)?.setPointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  }

  onImagePointerMove(event: PointerEvent) {
    if (!this.isZoomed() || !this.isPanning()) return;
    const dx = event.clientX - this.pointerStartX;
    const dy = event.clientY - this.pointerStartY;
    this.panX.set(this.panStartX + dx);
    this.panY.set(this.panStartY + dy);
  }

  onImagePointerUp() {
    this.isPanning.set(false);
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
    } else if (event.key === 'ArrowLeft') {
      this.prevSelectedImage();
    }
  }
}
