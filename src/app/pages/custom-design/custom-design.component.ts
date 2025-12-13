import { ApiService } from './../../services/api/api.service';
import { Component, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasePageComponent } from '../basePageComponent';
import { ProductPurchaseSidebarComponent } from '../../components/product-purchase-sidebar/product-purchase-sidebar.component';
import { ProductDto } from '../../models/product';
import { CustomDesignUploadComponent } from '../../components/custom-design-upload/custom-design-upload.component';
import { CustomDesignPreviewComponent } from '../../components/custom-design-preview/custom-design-preview.component';
import { FrameOptions } from '../../shared/constants';

export interface DesignSize {
  id: number;
  name: string;
  multiplier: number;
}

@Component({
  selector: 'app-custom-design',
  standalone: true,
  imports: [
    CommonModule,
    ProductPurchaseSidebarComponent,
    CustomDesignUploadComponent,
    CustomDesignPreviewComponent,
  ],
  templateUrl: './custom-design.component.html',
  styleUrl: './custom-design.component.scss',
})
export class CustomDesignComponent
  extends BasePageComponent
  implements OnDestroy
{
  readonly PRODUCTID = 719; // Custom design product ID

  constructor(private apiService: ApiService) {
    super();
  }

  ngOnInit(): void {
    this.apiService
      .getProductById(this.PRODUCTID.toString())
      .subscribe((product) => {
        if (product) {
          this.customProduct.set(product);
        }
      });
  }

  isMatIncluded = signal<boolean>(false);
  imageUrl = signal<string | null>(null);
  customProduct = signal<ProductDto>({} as ProductDto);
  selectedFrameName = signal<string>('Rolled-up');

  selectedFrameMaskUrl = computed<string | null>(() => {
    if (this.selectedFrameName() === 'Rolled-up') {
      return null;
    }

    const frame = FrameOptions.find(
      (frame) => frame.name === this.selectedFrameName(),
    )!;

    var url = this.isMatIncluded() ? frame.mask : frame.maskWithoutMat;
    return url;
  });

  isRolledUp = computed(() => this.selectedFrameName() === 'Rolled-up');

  onImageUrlSelected(url: string | null): void {
    this.imageUrl.set(url);
  }

  onSelectedFrameChanged(frameName: string): void {
    this.selectedFrameName.set(frameName);
  }
}
