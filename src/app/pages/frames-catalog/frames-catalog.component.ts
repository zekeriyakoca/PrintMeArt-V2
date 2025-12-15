import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FrameCardComponent } from '../../components/frame-card/frame-card.component';
import {
  ImageGalleryModalComponent,
  GalleryImage,
} from '../../components/image-gallery-modal/image-gallery-modal.component';

export interface Frame {
  id: number;
  name: string;
  description: string;
  image: string;
  hoverImage: string;
  allImages: string[];
}

@Component({
  selector: 'app-frames-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FrameCardComponent,
    ImageGalleryModalComponent,
  ],
  templateUrl: './frames-catalog.component.html',
  styleUrl: './frames-catalog.component.scss',
})
export class FramesCatalogComponent {
  frames: Frame[] = [
    {
      id: 1,
      name: 'Black | EDSBRUK',
      description:
        'Traditional, sturdy frame with a soft profile; many sizes for picture walls.',
      image:
        'https://www.ikea.com/nl/en/images/products/edsbruk-frame-black-stained__0723741_pe734158_s5.jpg?f=s',
      hoverImage:
        'https://www.ikea.com/nl/en/images/products/edsbruk-frame-black-stained__0723740_pe734159_s5.jpg?f=s',
      allImages: [
        'https://www.ikea.com/nl/en/images/products/edsbruk-frame-black-stained__0723741_pe734158_s5.jpg?f=s',
        'https://www.ikea.com/nl/en/images/products/edsbruk-frame-black-stained__0723740_pe734159_s5.jpg?f=s',
      ],
    },
    {
      id: 3,
      name: 'White | EDSBRUK',
      description:
        'Traditional, sturdy frame with a soft profile; many sizes for picture walls.',
      image:
        'https://www.ikea.com/nl/en/images/products/edsbruk-frame-white__0706506_pe725889_s5.jpg?f=s',
      hoverImage:
        'https://www.ikea.com/nl/en/images/products/edsbruk-frame-white__0706504_pe725890_s5.jpg?f=s',
      allImages: [
        'https://www.ikea.com/nl/en/images/products/edsbruk-frame-white__0706506_pe725889_s5.jpg?f=s',
        'https://www.ikea.com/nl/en/images/products/edsbruk-frame-white__0706504_pe725890_s5.jpg?f=s',
      ],
    },
    {
      id: 4,
      name: 'Brown | RAMSBORG',
      description:
        'Sustainable solid wood—durable, renewable, and ages with character.',
      image:
        'https://www.ikea.com/nl/en/images/products/ramsborg-frame-brown__0726700_pe735389_s5.jpg?f=s',
      hoverImage:
        'https://www.ikea.com/nl/en/images/products/ramsborg-frame-brown__0726699_pe735390_s5.jpg?f=xl',
      allImages: [
        'https://www.ikea.com/nl/en/images/products/ramsborg-frame-brown__0726700_pe735389_s5.jpg?f=s',
        'https://www.ikea.com/nl/en/images/products/ramsborg-frame-brown__0726699_pe735390_s5.jpg?f=xl',
      ],
    },
    {
      id: 5,
      name: 'Black | RÖDALM',
      description:
        'Modern frame design that does justice to your favourite motifs.',
      image:
        'https://www.ikea.com/nl/en/images/products/rodalm-frame-black__1251233_pe924195_s5.jpg?f=s',
      hoverImage:
        'https://www.ikea.com/nl/en/images/products/rodalm-frame-black__1251232_pe924196_s5.jpg?f=s',
      allImages: [
        'https://www.ikea.com/nl/en/images/products/rodalm-frame-black__1251233_pe924195_s5.jpg?f=s',
        'https://www.ikea.com/nl/en/images/products/rodalm-frame-black__1251232_pe924196_s5.jpg?f=s',
      ],
    },
  ];

  isGalleryOpen = signal(false);
  selectedFrameIndex = signal(0);

  get galleryImages(): GalleryImage[] {
    const frame = this.frames[this.selectedFrameIndex()];
    return frame?.allImages.map((url, index) => ({ id: index, url })) || [];
  }

  openGallery(index: number) {
    this.selectedFrameIndex.set(index);
    this.isGalleryOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeGallery() {
    this.isGalleryOpen.set(false);
    document.body.style.overflow = '';
  }
}
