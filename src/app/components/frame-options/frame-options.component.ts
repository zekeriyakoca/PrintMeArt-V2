import { TranslatePipe } from '../../services/i18n/translate.pipe';
import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { OptionGroupDto } from '../../models/product';
import {
  FrameOptionsByValue,
  RolledUpDefaultThumbnailUrl,
} from '../../shared/constants';
import { IconComponent } from '../shared/icon/icon.component';
import { InfoPopupComponent } from '../shared/info-popup/info-popup.component';

interface FrameItem {
  id: number;
  name: string;
  thumbnail: string;
  description: string;
  outOfStock: boolean;
}

@Component({
  selector: 'app-frame-options',
  imports: [TranslatePipe, RouterLink, IconComponent, InfoPopupComponent],
  templateUrl: './frame-options.component.html',
  styleUrl: './frame-options.component.scss',
})
export class FrameOptionsComponent {
  group = input.required<OptionGroupDto>();
  optionSelected = output<number>();

  isOpen = signal(false);
  private el = inject(ElementRef<HTMLElement>);

  items = computed<FrameItem[]>(() =>
    this.group()
      .options.filter((opt) => !FrameOptionsByValue[opt.value]?.hidden)
      .map((opt) => {
        const frame = FrameOptionsByValue[opt.value];
        return {
          id: opt.id,
          name: opt.value,
          thumbnail:
            frame?.thumbnail || opt.imageUrl || RolledUpDefaultThumbnailUrl,
          description: frame?.description || '',
          outOfStock: !!frame?.outOfStock,
        };
      }),
  );

  selectedId = linkedSignal(() => {
    const selectedOptionId = this.group().selectedOptionId;
    const items = this.items();
    if (selectedOptionId && !items.find((i) => i.id === selectedOptionId)?.outOfStock) return selectedOptionId;
    // Default to the first choice in stock (rolled-up while the frame is out of stock)
    const firstId = (items.find((i) => !i.outOfStock) ?? items[0])?.id;
    if (firstId) this.optionSelected.emit(firstId);
    return firstId;
  });

  selectedItem = computed(
    () => this.items().find((i) => i.id === this.selectedId()) ?? null,
  );

  select(id: number): void {
    if (this.items().find((i) => i.id === id)?.outOfStock) return;
    this.selectedId.set(id);
    this.optionSelected.emit(id);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(e: MouseEvent) {
    if (this.isOpen() && !this.el.nativeElement.contains(e.target as Node)) {
      this.isOpen.set(false);
    }
  }
}
