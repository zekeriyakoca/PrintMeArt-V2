import { ApiService } from './../../services/api/api.service';
import { Component, signal, OnDestroy } from '@angular/core';
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
  constructor(private apiService: ApiService) {
    super();
  }

  ngOnInit(): void {
    this.apiService
      .getProductById(this.productId.toString())
      .subscribe((product) => {
        if (product) {
          this.customProduct.set(product);
        }
      });
  }

  isMatIncluded = signal<boolean>(false);
  imageUrl = signal<string | null>(null);
  customProduct = signal<ProductDto>({} as ProductDto);
  selectedFrameImageUrl = signal<string | null>(FrameOptions[0].mask);

  // Base product
  readonly basePrice = 25;
  readonly productId = 719; // Custom design product ID
  readonly productName = 'Custom Design Print';

  onImageUrlSelected(url: string | null): void {
    this.imageUrl.set(url);
  }
}
