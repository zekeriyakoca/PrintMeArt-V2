import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  signal,
} from '@angular/core';
// import { CollectionCardComponent } from '../../components/collection-card/collection-card.component';
import { OurServicesComponent } from '../../components/our-services/our-services.component';
import { CategoryGridComponent } from '../../components/category-grid/category-grid.component';
import { ApiService } from '../../services/api/api.service';
import { CategoryDto } from '../../models/category';
import { BasePageComponent } from '../basePageComponent';
import { first } from 'rxjs';
import { OrderJourneyComponent } from '../../components/order-journey/order-journey.component';
import { VisitUsComponent } from '../../components/visit-us/visit-us.component';
import { SectionHeroPlainComponent } from '../../components/section-hero-plain/section-hero-plain.component';
import { FeaturedPrintsComponent } from '../../components/featured-prints/featured-prints.component';
import { BusinessHighlightsComponent } from '../../components/business-highlights/business-highlights.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    OurServicesComponent,
    CategoryGridComponent,
    OrderJourneyComponent,
    VisitUsComponent,
    SectionHeroPlainComponent,
    FeaturedPrintsComponent,
    BusinessHighlightsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent extends BasePageComponent {
  @Input() @HostBinding('class') class: string = '';
  childCategories = signal<CategoryDto[]>([]);

  constructor(private apiService: ApiService) {
    super();
  }

  ngOnInit() {
    this.apiService
      .getCategories()
      .pipe(first())
      .subscribe((cats) => {
        if (cats && cats.length > 0) {
          const categories = cats[0].childCategories ?? [];
          this.childCategories.set(categories);
        }
      });
  }
}
