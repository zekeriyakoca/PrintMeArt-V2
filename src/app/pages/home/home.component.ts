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
          this.childCategories.set(cats[0].childCategories ?? []);
        }
      });
  }
}
