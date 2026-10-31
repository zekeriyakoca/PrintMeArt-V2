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

  // Local, card-cropped (12:11) and compressed images per category slug. The catalog's own
  // category images are tiny uploads, so they turn blurry once a thumbnail fills the card.
  private readonly LOCAL_IMAGES = new Set([
    'landscape',
    'botanical-art',
    'animal-art',
    'still-life',
    'cityscapes-architecture',
    'seascapes',
    'portraits',
    'abstract-art',
  ]);

  // Full card width at each breakpoint (2 columns, 3 from xl inside a 1280px container),
  // so the image is already sharp when the thumbnail expands to the whole card.
  readonly imageSizes = '(min-width: 1280px) 420px, 50vw';

  imageSrc(item: CategoryDto): string {
    return this.LOCAL_IMAGES.has(item.slug)
      ? `/assets/images/categories/${item.slug}-600.webp`
      : item.imageUrl;
  }

  imageSrcset(item: CategoryDto): string | null {
    if (!this.LOCAL_IMAGES.has(item.slug)) return null;
    const base = `/assets/images/categories/${item.slug}`;
    return `${base}-600.webp 600w, ${base}-1200.webp 1200w`;
  }

  encodeURIComponent(value: string): string {
    return encodeURIComponent(value);
  }
}
