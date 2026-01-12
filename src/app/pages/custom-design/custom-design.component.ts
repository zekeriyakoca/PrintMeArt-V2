import { Component, signal, computed, OnDestroy, inject } from '@angular/core';
import { BasePageComponent } from '../basePageComponent';
import { ProductPurchaseSidebarComponent } from '../../components/product-purchase-sidebar/product-purchase-sidebar.component';
import { ProductDto } from '../../models/product';
import { CustomDesignUploadComponent } from '../../components/custom-design-upload/custom-design-upload.component';
import { CustomDesignPreviewComponent } from '../../components/custom-design-preview/custom-design-preview.component';
import { FrameOptions } from '../../shared/constants';
import { CustomDesignCtaComponent } from '../../components/custom-design-cta/custom-design-cta.component';
import { CustomDesignHowItWorksComponent } from '../../components/custom-design-how-it-works/custom-design-how-it-works.component';
import { ToastService } from '../../services/toast/toast.service';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-custom-design',
  standalone: true,
  imports: [
    ProductPurchaseSidebarComponent,
    CustomDesignUploadComponent,
    CustomDesignPreviewComponent,
    CustomDesignCtaComponent,
    CustomDesignHowItWorksComponent,
  ],
  templateUrl: './custom-design.component.html',
  styleUrl: './custom-design.component.scss',
})
export class CustomDesignComponent
  extends BasePageComponent
  implements OnDestroy
{
  private readonly PRODUCT_ID = 719;
  private readonly apiService = inject(ApiService);
  private readonly toastService = inject(ToastService);

  // State
  isMatIncluded = signal(false);
  imageUrl = signal<string | null>(null);
  uploadedImageUrl = signal<string | null>(null);
  customProduct = signal<ProductDto>({} as ProductDto);
  selectedFrameName = signal('Rolled-up');

  // Computed
  isRolledUp = computed(() => this.selectedFrameName() === 'Rolled-up');

  selectedFrameMaskUrl = computed(() => {
    if (this.isRolledUp()) return null;
    const frame = FrameOptions.find((f) => f.name === this.selectedFrameName());
    return frame
      ? this.isMatIncluded()
        ? frame.mask
        : frame.maskWithoutMat
      : null;
  });

  ngOnInit(): void {
    this.apiService
      .getProductById(this.PRODUCT_ID.toString())
      .subscribe((product) => {
        if (product) this.customProduct.set(product);
      });
  }

  onImageUrlSelected(url: string | null): void {
    this.imageUrl.set(url);
    this.uploadedImageUrl.set(null);
    if (url) this.setMetadataFromImage(url);
  }

  onImageUploaded(url: string): void {
    this.uploadedImageUrl.set(url);
  }

  onUploadError(message: string): void {
    this.toastService.error(message);
  }

  onSelectedFrameChanged(frameName: string): void {
    this.selectedFrameName.set(frameName);
  }

  private setMetadataFromImage(url: string): void {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w > 0 && h > 0) {
        this.customProduct.update((p) => ({
          ...p,
          metadata: {
            ...p.metadata,
            OriginalImageWidth: String(w),
            OriginalImageHeight: String(h),
            IsHorizontal: w >= h ? 'true' : 'false',
          },
        }));
      }
    };
    img.src = url;
  }
}
