import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  signal,
} from '@angular/core';
import { CollectionCardComponent } from '../../components/collection-card/collection-card.component';
import { OurServicesComponent } from '../../components/our-services/our-services.component';
import { ApiService } from '../../services/api/api.service';
import { CategoryDto } from '../../models/category';
import { BasePageComponent } from '../basePageComponent';
import { first } from 'rxjs';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [OurServicesComponent, CollectionCardComponent],
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
          // Temporary image URLs
          categories[0].imageUrl = "https://ecombone.blob.core.windows.net/ecommbone-catalog-images/tshirt-cat.png";
          categories[1].imageUrl = "https://ecombone.blob.core.windows.net/ecommbone-catalog-images/shoes-cat.jpeg";
          categories[2].imageUrl = "https://ecombone.blob.core.windows.net/ecommbone-catalog-images/jacket-cat.png";
          categories[3].imageUrl = "https://ecombone.blob.core.windows.net/ecommbone-catalog-images/short-cat.png";
          this.childCategories.set(categories);
        }
      });
  }
}
