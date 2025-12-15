import { Component, signal } from '@angular/core';
import { ProductCardComponent } from '../product-card/product-card.component';
import { PaginatedListDto, ProductSimpleDto } from '../../models/product';
import { ApiService } from '../../services/api/api.service';
import { Router } from '@angular/router';
import { SectionTitleComponent } from '../section-title/section-title.component';

@Component({
  selector: 'app-featured-prints',
  imports: [ProductCardComponent, SectionTitleComponent],
  templateUrl: './featured-prints.component.html',
  styleUrls: ['./featured-prints.component.scss'],
})
export class FeaturedPrintsComponent {
  products = signal<PaginatedListDto<ProductSimpleDto>>(
    {} as PaginatedListDto<ProductSimpleDto>,
  );

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.apiService.getFeaturedProducts(4, 0).subscribe((data) => {
      this.products.set(data);
    });
  }

  goToProductListPage() {
    this.router.navigate(['/products']);
  }
}
