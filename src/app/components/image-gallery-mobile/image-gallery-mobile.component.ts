import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { ProductImageDto } from '../../models/product';
import { IconComponent } from '../shared/icon/icon.component';
import { CloseupCycleDirective } from '../shared/closeup/closeup-cycle.directive';

/**
 * The product images on phones: a swipeable full-width carousel with a counter and dots.
 * The first slide shows the print with the auto-cycling close-up loupe; tapping the loupe jumps to the close-ups.
 */
@Component({
  selector: 'app-image-gallery-mobile',
  imports: [TranslatePipe, IconComponent, CloseupCycleDirective],
  templateUrl: './image-gallery-mobile.component.html',
  styleUrl: './image-gallery-mobile.component.scss',
})
export class ImageGalleryMobileComponent {
  images = input<ProductImageDto[]>([]);
  alt = input('');
  crops = input<string[]>([]);
  landscape = input(false);
  /** Opens the full-screen gallery at this image */
  open = output<number>();

  current = signal(0);
  private track = viewChild.required<ElementRef<HTMLElement>>('track');
  private firstCloseup = computed(() => this.images().findIndex((image) => image.isDetail));

  onScroll() {
    const el = this.track().nativeElement;
    this.current.set(Math.round(el.scrollLeft / el.clientWidth));
  }

  goTo(index: number) {
    const el = this.track().nativeElement;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  }

  showCloseups(event: Event) {
    event.stopPropagation();
    const index = this.firstCloseup();
    if (index > 0) this.goTo(index);
    else this.open.emit(0);
  }
}
