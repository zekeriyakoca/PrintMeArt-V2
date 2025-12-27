import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  effect,
} from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { CategoryDto } from '../../models/category';

@Component({
  selector: 'app-category-grid',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './category-grid.component.html',
  styleUrls: ['./category-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryGridComponent {
  categories = input<CategoryDto[]>([]);

  private readonly ICON_NAMES: ('marker' | 'user' | 'trophy' | 'badge')[] = [
    'marker',
    'user',
    'trophy',
    'badge',
  ];

  // Active parent category name
  tabActive = signal<string>('Famous Painters');

  // First four parent categories become tabs (pure)
  tabs = computed(() => {
    const cats = this.categories();
    return cats.slice(0, 4).map((c, idx) => ({
      name: c.name,
      iconName: this.ICON_NAMES[idx % this.ICON_NAMES.length],
    }));
  });

  constructor() {
    effect(() => {
      if (!this.tabActive() && this.tabs().length > 0) {
        this.tabActive.set(this.tabs()[0].name);
      }
    });
  }

  activeParent = computed(() => {
    const cats = this.categories();
    return cats.find((c) => c.name === this.tabActive()) || cats[0];
  });

  childCategories = computed(() => this.activeParent()?.childCategories ?? []);

  setTab(name: string) {
    this.tabActive.set(name);
  }

  productCount(cat: CategoryDto): number {
    // Placeholder logic; adapt if product counts exist separately
    return cat.childCategories?.length || 0;
  }

  encodeURIComponent(value: string): string {
    return encodeURIComponent(value);
  }
}
