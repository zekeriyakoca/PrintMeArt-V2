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
        'This traditional, robust frame has a soft profile and comes in many sizes, perfect for a picture wall.',
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
      id: 2,
      name: 'White Pine | PLOMMONTRÄD',
      description:
        'The pattern of PLOMMONTRÄD frame has small variations, making each frame unique – and the slightly wider dimensions...',
      image:
        'https://www.ikea.com/nl/en/images/products/plommontrad-frame-white-stained-pine-effect__1202413_pe905936_s5.jpg?f=s',
      hoverImage:
        'https://www.ikea.com/nl/en/images/products/plommontrad-frame-white-stained-pine-effect__1202411_pe905935_s5.jpg?f=s',
      allImages: [
        'https://www.ikea.com/nl/en/images/products/plommontrad-frame-white-stained-pine-effect__1202413_pe905936_s5.jpg?f=s',
        'https://www.ikea.com/nl/en/images/products/plommontrad-frame-white-stained-pine-effect__1202411_pe905935_s5.jpg?f=s',
      ],
    },
    {
      id: 3,
      name: 'White | EDSBRUK',
      description:
        'This traditional, robust frame has a soft profile and comes in many sizes, perfect for a picture wall.',
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
        'Sustainable beauty from sustainably-sourced solid wood, a durable and renewable material that maintains its genuine character with each passing year.',
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
        'RÖDALM frame has a modern look that does your favourite motifs justice.',
      image:
        'https://www.ikea.com/nl/en/images/products/rodalm-frame-black__1251233_pe924195_s5.jpg?f=s',
      hoverImage:
        'https://www.ikea.com/nl/en/images/products/rodalm-frame-black__1251232_pe924196_s5.jpg?f=s',
      allImages: [
        'https://www.ikea.com/nl/en/images/products/rodalm-frame-black__1251233_pe924195_s5.jpg?f=s',
        'https://www.ikea.com/nl/en/images/products/rodalm-frame-black__1251232_pe924196_s5.jpg?f=s',
      ],
    },
    {
      id: 6,
      name: 'Black | KNOPPÄNG',
      description: 'Decorate with pictures you love.',
      image:
        'https://www.ikea.com/nl/en/images/products/knoppang-frame-black__0638249_pe698799_s5.jpg?f=s',
      hoverImage:
        'https://www.ikea.com/nl/en/images/products/knoppang-frame-black__0902477_pe661084_s5.jpg?f=s',
      allImages: [
        'https://www.ikea.com/nl/en/images/products/knoppang-frame-black__0638249_pe698799_s5.jpg?f=s',
        'https://www.ikea.com/nl/en/images/products/knoppang-frame-black__0902477_pe661084_s5.jpg?f=s',
      ],
    },
    {
      id: 7,
      name: 'Gold | SILVERHÖJDEN',
      description:
        'This frame has a matt metal-like finish and comes in many sizes, perfect for a picture wall.',
      image:
        'https://www.ikea.com/nl/en/images/products/silverhojden-frame-gold-colour__1179571_pe895993_s5.jpg?f=s',
      hoverImage:
        'https://www.ikea.com/nl/en/images/products/silverhojden-frame-gold-colour__1179570_pe895994_s5.jpg?f=s',
      allImages: [
        'https://www.ikea.com/nl/en/images/products/silverhojden-frame-gold-colour__1179571_pe895993_s5.jpg?f=s',
        'https://www.ikea.com/nl/en/images/products/silverhojden-frame-gold-colour__1179570_pe895994_s5.jpg?f=s',
      ],
    },
    {
      id: 8,
      name: 'Gold | LOMVIKEN',
      description: 'Decorate with pictures you love.',
      image:
        'https://www.ikea.com/nl/en/images/products/lomviken-frame-gold-colour__0661072_pe711302_s5.jpg?f=s',
      hoverImage:
        'https://www.ikea.com/nl/en/images/products/lomviken-frame-gold-colour__0661070_pe711317_s5.jpg?f=s',
      allImages: [
        'https://www.ikea.com/nl/en/images/products/lomviken-frame-gold-colour__0661072_pe711302_s5.jpg?f=s',
        'https://www.ikea.com/nl/en/images/products/lomviken-frame-gold-colour__0661070_pe711317_s5.jpg?f=s',
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
