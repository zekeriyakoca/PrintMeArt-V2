import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { CategoryDto } from '../../models/category';

@Component({
  selector: 'app-category-grid',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './category-grid.component.html',
  styleUrls: ['./category-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryGridComponent {
  heading = input<string>('Start Exploring');
  categories = input<CategoryDto[]>([]);

  // Local mock data used when `categories()` input is empty.
  private readonly MOCK_CATEGORIES: CategoryDto[] = [
    {
      id: 100,
      name: 'Posters',
      description: 'Poster parent',
      slug: 'posters',
      imageUrl:
        'https://genstorageaccount3116.blob.core.windows.net/printme-images/retro.jpeg',
      childCategories: [
        {
          id: 101,
          name: 'Poster A',
          description: '',
          slug: 'poster-a',
          imageUrl:
            'https://genstorageaccount3116.blob.core.windows.net/printme-images/retro.jpeg',
        },
        {
          id: 102,
          name: 'Poster B',
          description: '',
          slug: 'poster-b',
          imageUrl:
            'https://genstorageaccount3116.blob.core.windows.net/printme-images/retro.jpeg',
        },
      ],
    },
    {
      id: 200,
      name: 'Nature & Landscapes',
      description: 'Nature parent',
      slug: 'nature-landscapes',
      imageUrl: '/assets/img/landscape-a.jpg',
      childCategories: [
        {
          id: 201,
          name: 'Landscape A',
          description: '',
          slug: 'landscape-a',
          imageUrl: '/assets/img/landscape-a.jpg',
        },
        {
          id: 202,
          name: 'Landscape B',
          description: '',
          slug: 'landscape-b',
          imageUrl: '/assets/img/landscape-b.jpg',
        },
      ],
    },
    {
      id: 300,
      name: 'Famous Painters',
      description: 'Painters parent',
      slug: 'famous-painters',
      imageUrl: '/assets/img/painter-a.jpg',
      childCategories: [
        {
          id: 301,
          name: 'Painter A',
          description: '',
          slug: 'painter-a',
          imageUrl: '/assets/img/painter-a.jpg',
        },
        {
          id: 302,
          name: 'Painter B',
          description: '',
          slug: 'painter-b',
          imageUrl: '/assets/img/painter-b.jpg',
        },
      ],
    },
    {
      id: 400,
      name: 'Art Styles',
      description: 'Styles parent',
      slug: 'art-styles',
      imageUrl: '/assets/img/style-a.jpg',
      childCategories: [
        {
          id: 401,
          name: 'Style A',
          description: '',
          slug: 'style-a',
          imageUrl: '/assets/img/style-a.jpg',
        },
        {
          id: 402,
          name: 'Style B',
          description: '',
          slug: 'style-b',
          imageUrl: '/assets/img/style-b.jpg',
        },
      ],
    },
  ];

  private readonly ICON_NAMES: ('marker' | 'user' | 'trophy' | 'badge')[] = [
    'marker',
    'user',
    'trophy',
    'badge',
  ];

  // Unified source: input categories if provided else mock fallback.
  private allCategories = computed<CategoryDto[]>(() => {
    const provided = this.categories();
    return provided && provided.length > 0 ? provided : this.MOCK_CATEGORIES;
  });

  // Active parent category name
  tabActive = signal<string>('');

  // First four parent categories become tabs (pure)
  tabs = computed(() => {
    const cats = this.allCategories();
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
    const cats = this.allCategories();
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
}
