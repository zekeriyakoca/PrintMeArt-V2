import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { detailUrls, ProductImageDto } from '../../models/product';
import { ImageGalleryModalComponent } from '../image-gallery-modal/image-gallery-modal.component';
import { IconComponent } from '../shared/icon/icon.component';
import { CloseupCycleDirective } from '../shared/closeup/closeup-cycle.directive';
import { ImageGalleryMobileComponent } from '../image-gallery-mobile/image-gallery-mobile.component';

@Component({
  selector: 'app-image-gallery-1',
  imports: [NgTemplateOutlet, TranslatePipe, ImageGalleryModalComponent, IconComponent, CloseupCycleDirective, ImageGalleryMobileComponent],
  templateUrl: './image-gallery-1.component.html',
  styleUrl: './image-gallery-1.component.scss',
})
export class ImageGallery1Component {
  images = input<ProductImageDto[]>([]);
  /** What the pictures show, for screen readers and image search */
  alt = input('');
  /** Close-up crops of the main image for the hover loupe */
  crops = computed(() => detailUrls(this.images()[0]?.detail));
  showGallery = false;
  galleryStartIndex = signal(0);

  frameGuideImage = 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame-guide.avif';
  paperImage = 'https://genstorageaccount3116.blob.core.windows.net/printme-images/paper-art-1.webp';

  galleryImages = computed(() => {
    return [
      ...this.images().map((item, index) => ({
        id: index,
        url: item.large,
        isDetail: item.isDetail,
      })),
      { id: -1, url: this.paperImage },
      { id: -2, url: this.frameGuideImage },
    ];
  });

  openGallery(startIndex: number = 0) {
    this.showGallery = true;
    this.galleryStartIndex.set(startIndex);
  }

  closeGallery() {
    this.showGallery = false;
  }
}
