import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, computed, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { IconComponent } from '../shared/icon/icon.component';

export interface GalleryImage {
  id: number;
  url: string;
}

@Component({
  selector: 'app-image-gallery-modal',
  standalone: true,
  imports: [IconComponent, TranslatePipe],
  templateUrl: './image-gallery-modal.component.html',
  styleUrls: ['./image-gallery-modal.component.scss'],
})
export class ImageGalleryModalComponent {
  isShowModal = input<boolean>(false);
  images = input<GalleryImage[]>([]);
  startIndex = input<number>(0);
  onClose = output<void>();

  currentIndex = signal(0);
  private thumbs = viewChild<ElementRef<HTMLElement>>('thumbs');
  private touchStart?: { x: number; y: number };

  constructor() {
    // Keep the current thumbnail in view when the strip is wider than the screen
    effect(() => {
      const index = this.currentIndex();
      this.thumbs()?.nativeElement.querySelector(`[data-thumb="${index}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    });
  }

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

  // On touch screens a horizontal swipe changes the image; while zoomed, dragging moves around the image
  onTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    this.touchStart = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : undefined;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isZoomed() || event.touches.length !== 1) return;
    this.updateMousePosition(event.touches[0], event.currentTarget as HTMLElement);
  }

  onTouchEnd(event: TouchEvent) {
    const start = this.touchStart;
    this.touchStart = undefined;
    if (!start || this.isZoomed()) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(touch.clientY - start.y)) return;
    if (dx < 0) this.nextSelectedImage();
    else this.prevSelectedImage();
  }

  private updateMousePosition(event: MouseEvent | Touch, target = (event as MouseEvent).currentTarget as HTMLElement) {
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
