import { Component, computed, input, signal } from '@angular/core';
import { ProductImageDto } from '../../models/product';
import { ImageGalleryModalComponent } from '../image-gallery-modal/image-gallery-modal.component';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-image-gallery-1',
  imports: [ImageGalleryModalComponent, IconComponent],
  templateUrl: './image-gallery-1.component.html',
  styleUrl: './image-gallery-1.component.scss',
})
export class ImageGallery1Component {
  images = input<ProductImageDto[]>([]);
  showGallery = false;
  galleryStartIndex = signal(0);

  frameGuideImage =
    'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame-guide.avif';
  paperImage =
    'https://genstorageaccount3116.blob.core.windows.net/printme-images/paper.webp';
  genericImages = [
    'https://genstorageaccount3116.blob.core.windows.net/printme-images/generic-image-1 2.png',
    'https://genstorageaccount3116.blob.core.windows.net/printme-images/generic-image-2 2.png',
  ];

  galleryImages = computed(() => {
    return [
      ...this.images().map((item, index) => ({
        id: index,
        url: item.large,
      })),
      { id: -1, url: this.frameGuideImage },
      { id: -2, url: this.paperImage },
      ...this.genericImages.map((url, index) => ({
        id: -3 - index,
        url: url,
      })),
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
