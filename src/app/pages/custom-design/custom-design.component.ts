import {
  Component,
  signal,
  computed,
  ElementRef,
  ViewChild,
  inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';
import { SelectedOptionDto } from '../../models/cart-item';
import { BasePageComponent } from '../basePageComponent';

export interface DesignFrame {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  mask: string;
  maskWithoutMat: string;
}

export interface DesignSize {
  id: number;
  name: string;
  multiplier: number;
}

@Component({
  selector: 'app-custom-design',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './custom-design.component.html',
  styleUrl: './custom-design.component.scss',
})
export class CustomDesignComponent
  extends BasePageComponent
  implements OnDestroy
{
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private cartService = inject(CartService);

  // Frame options - using real IKEA frame thumbnails
  frames: DesignFrame[] = [
    {
      id: 0,
      name: 'Rolled-up (No Frame)',
      price: 0,
      thumbnail:
        'https://www.ikea.com/nl/en/images/products/drommare-poster-wild-and-free__1074693_pe855628_s5.jpg?f=xs',
      mask: '',
      maskWithoutMat: '',
    },
    {
      id: 1,
      name: 'Classic Black',
      price: 15,
      thumbnail:
        'https://www.ikea.com/nl/en/images/products/edsbruk-frame-black-stained__0723741_pe734158_s5.jpg?f=xs',
      mask: '/assets/frames/black-mask.png',
      maskWithoutMat: '/assets/frames/black-mask-no-mat.png',
    },
    {
      id: 2,
      name: 'Natural Oak',
      price: 20,
      thumbnail:
        'https://www.ikea.com/nl/en/images/products/plommontrad-frame-white-stained-pine-effect__1202413_pe905936_s5.jpg?f=xs',
      mask: '/assets/frames/oak-mask.png',
      maskWithoutMat: '/assets/frames/oak-mask-no-mat.png',
    },
    {
      id: 3,
      name: 'White Gallery',
      price: 18,
      thumbnail:
        'https://www.ikea.com/nl/en/images/products/edsbruk-frame-white__0706506_pe725889_s5.jpg?f=xs',
      mask: '/assets/frames/white-mask.png',
      maskWithoutMat: '/assets/frames/white-mask-no-mat.png',
    },
    {
      id: 4,
      name: 'Walnut Brown',
      price: 25,
      thumbnail:
        'https://www.ikea.com/nl/en/images/products/ramsborg-frame-brown__0726700_pe735389_s5.jpg?f=xs',
      mask: '/assets/frames/walnut-mask.png',
      maskWithoutMat: '/assets/frames/walnut-mask-no-mat.png',
    },
    {
      id: 5,
      name: 'Modern Black',
      price: 22,
      thumbnail:
        'https://www.ikea.com/nl/en/images/products/rodalm-frame-black__1251233_pe924195_s5.jpg?f=xs',
      mask: '/assets/frames/modern-black-mask.png',
      maskWithoutMat: '/assets/frames/modern-black-mask-no-mat.png',
    },
  ];

  sizes: DesignSize[] = [
    { id: 1, name: '21×30', multiplier: 1 },
    { id: 2, name: '30×40', multiplier: 1.3 },
    { id: 3, name: '50×70', multiplier: 1.8 },
    { id: 4, name: '70×100', multiplier: 2.5 },
  ];

  // Base product
  readonly basePrice = 25;
  readonly productId = 9999; // Custom design product ID
  readonly productName = 'Custom Design Print';

  // State signals
  selectedFile = signal<File | null>(null);
  imageUrl = signal<string | null>(null);
  selectedFrameIndex = signal(0);
  isMatIncluded = signal(false);
  quantity = signal(1);
  sizeSelected = signal(this.sizes[0]);
  isDragging = signal(false);

  // Computed values
  selectedFrame = computed(() => this.frames[this.selectedFrameIndex()]);

  calculatedPrice = computed(() => {
    const sizeIndex = this.sizes.findIndex(
      (s) => s.id === this.sizeSelected().id,
    );
    const properSize = this.isMatIncluded()
      ? this.sizes[Math.min(this.sizes.length - 1, sizeIndex + 1)]
      : this.sizeSelected();
    const price =
      (this.basePrice + this.selectedFrame().price) * properSize.multiplier;
    return Math.floor(price);
  });

  subtotal = computed(() => this.calculatedPrice() * this.quantity());
  taxEstimate = computed(() => this.subtotal() * 0.21);
  total = computed(() => this.subtotal());

  getFrameBorderClass(): string {
    const frame = this.selectedFrame();
    switch (frame.id) {
      case 1:
        return 'border-frame-black';
      case 2:
        return 'border-frame-oak';
      case 3:
        return 'border-frame-white';
      case 4:
        return 'border-frame-walnut';
      case 5:
        return 'border-frame-modern-black';
      default:
        return 'border-slate-800';
    }
  }

  handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.processFile(file);
      }
    }
  }

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  private processFile(file: File): void {
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    this.selectedFile.set(file);
    this.imageUrl.set(URL.createObjectURL(file));
  }

  openFileDialog(): void {
    this.fileInput?.nativeElement?.click();
  }

  selectFrame(index: number): void {
    this.selectedFrameIndex.set(index);
  }

  selectSize(size: DesignSize): void {
    this.sizeSelected.set(size);
  }

  toggleMat(): void {
    this.isMatIncluded.update((v) => !v);
  }

  incrementQty(): void {
    this.quantity.update((q) => q + 1);
  }

  decrementQty(): void {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  addToCart(): void {
    const file = this.selectedFile();
    if (!file) return;

    const selectedOptions: SelectedOptionDto[] = [
      {
        optionId: this.selectedFrame().id,
        optionName: 'Frame',
        spec1: this.selectedFrame().name,
      },
      {
        optionId: this.sizeSelected().id,
        optionName: 'Size',
        spec1: this.sizeSelected().name,
      },
    ];

    if (this.isMatIncluded()) {
      selectedOptions.push({
        optionId: 100,
        optionName: 'Mat',
        spec1: 'Included',
      });
    }

    // Add custom file info
    selectedOptions.push({
      optionId: 999,
      optionName: 'Custom Image',
      spec1: file.name,
    });

    this.cartService.addItemToCart(
      this.productId,
      this.productId, // variant same as product for custom
      this.productName,
      this.basePrice,
      this.calculatedPrice(),
      this.quantity(),
      this.imageUrl() || '',
      selectedOptions,
    );
  }

  clearImage(): void {
    const url = this.imageUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.selectedFile.set(null);
    this.imageUrl.set(null);
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    const url = this.imageUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}
