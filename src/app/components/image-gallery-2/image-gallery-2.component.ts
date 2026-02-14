import { Component, computed, input, signal } from '@angular/core';
import { ProductImageDto } from '../../models/product';
import { ImageGalleryModalComponent } from '../image-gallery-modal/image-gallery-modal.component';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-image-gallery-2',
  imports: [ImageGalleryModalComponent, IconComponent],
  templateUrl: './image-gallery-2.component.html',
  styleUrl: './image-gallery-2.component.scss',
})
export class ImageGallery2Component {
  images = input<ProductImageDto[]>([]);
  showGallery = false;
  mainImageIndex = signal(0);
  galleryStartIndex = signal(0);

  sideImageIndices = computed(() => {
    const main = this.mainImageIndex();
    return [0, 1, 2, 3].filter((i) => i !== main);
  });

  setMainImage(index: number) {
    this.mainImageIndex.set(index);
  }

  frameGuideImage = 'https://genstorageaccount3116.blob.core.windows.net/printme-images/frame-guide.avif';
  paperImage = 'https://genstorageaccount3116.blob.core.windows.net/printme-images/paper-art-1.webp';
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
      { id: -1, url: this.paperImage },
      { id: -2, url: this.frameGuideImage },
      ...this.genericImages.map((url, index) => ({
        id: -3 - index,
        url: url,
      })),
    ];
  });

  openGallery(startIndex: number = 0) {
    this.galleryStartIndex.set(startIndex);
    this.showGallery = true;
    // You can set the starting index if needed
  }

  closeGallery() {
    this.showGallery = false;
  }
}
