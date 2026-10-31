import { RouterLink } from '@angular/router';
import { LinkPipe } from '../../shared/link.pipe';
import { TranslatePipe } from '../../services/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  effect,
} from '@angular/core';

import { IconComponent } from '../shared/icon/icon.component';
import { CategoryDto } from '../../models/category';

@Component({
  selector: 'app-category-grid',
  standalone: true,
  imports: [RouterLink, LinkPipe, TranslatePipe, IconComponent],
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
  tabActive = signal<string>('Art Prints');

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

  // Full card width at each breakpoint (2 columns, 3 from xl inside a 1280px container),
  // so the browser fetches the size needed once the thumbnail expands to the full card.
  readonly imageSizes = '(min-width: 1280px) 400px, 50vw';

  // Widths are the shortest edge of each size: object-cover on the near-square card needs that edge to fill it.
  imageSrcset(item: CategoryDto): string | null {
    const img = item.images?.[0];
    return img ? `${img.small} 320w, ${img.medium} 480w, ${img.large} 700w` : null;
  }

  encodeURIComponent(value: string): string {
    return encodeURIComponent(value);
  }
}
