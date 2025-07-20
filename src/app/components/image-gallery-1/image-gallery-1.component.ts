import { Component, computed, input } from '@angular/core';
import { ProductImageDto } from '../../models/product';
import { ImageGalleryModalComponent } from '../image-gallery-modal/image-gallery-modal.component';

@Component({
  selector: 'app-image-gallery-1',
  imports: [ImageGalleryModalComponent],
  templateUrl: './image-gallery-1.component.html',
  styleUrl: './image-gallery-1.component.scss',
})
export class ImageGallery1Component {
  images = input<ProductImageDto[]>([]);
  showGallery = false;

  galleryImages = computed(() => {
    return this.images().map((item, index) => ({
      id: index,
      url: item.original,
    }));
  });

  openGallery(startIndex: number = 0) {
    this.showGallery = true;
    // You can set the starting index if needed
  }

  closeGallery() {
    this.showGallery = false;
  }
}
