import {
  Component,
  input,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductSimpleDto } from '../../models/product';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-related-products',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './related-products.component.html',
  styleUrls: ['./related-products.component.scss'],
})
export class RelatedProductsComponent implements AfterViewInit, OnDestroy {
  categoryName = input<string>('');
  excludeProductId = input<string>('');

  products = signal<ProductSimpleDto[]>([]);
  isLoading = signal<boolean>(false);
  hasLoaded = signal<boolean>(false);

  @ViewChild('triggerRef') triggerRef!: ElementRef;
  private observer: IntersectionObserver | null = null;

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.hasLoaded()) {
          this.loadRelatedProducts();
        }
      },
      { rootMargin: '200px' },
    );

    if (this.triggerRef?.nativeElement) {
      this.observer.observe(this.triggerRef.nativeElement);
    }
  }

  private loadRelatedProducts() {
    const category = this.categoryName();
    if (!category || this.hasLoaded()) return;

    this.isLoading.set(true);
    this.hasLoaded.set(true);

    this.apiService
      .getFilteredProducts({
        categoryName: category,
        pageSize: 5,
        pageIndex: 0,
      })
      .subscribe({
        next: (data) => {
          const excludeId = this.excludeProductId();
          const filtered = (data.data || [])
            .filter((p) => String(p.id) !== excludeId)
            .slice(0, 4);
          this.products.set(filtered);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }
}
