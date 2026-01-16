import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
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

interface FrameItem {
  id: number;
  name: string;
  thumbnail: string;
  description: string;
}

@Component({
  selector: 'app-frame-options',
  imports: [RouterLink, IconComponent],
  templateUrl: './frame-options.component.html',
  styleUrl: './frame-options.component.scss',
})
export class FrameOptionsComponent {
  group = input.required<OptionGroupDto>();
  optionSelected = output<number>();

  isOpen = signal(false);
  private el = inject(ElementRef<HTMLElement>);

  items = computed<FrameItem[]>(() =>
    this.group().options.map((opt) => {
      const frame = FrameOptionsByValue[opt.value];
      return {
        id: opt.id,
        name: opt.value,
        thumbnail:
          frame?.thumbnail || opt.imageUrl || RolledUpDefaultThumbnailUrl,
        description: frame?.description || '',
      };
    }),
  );

  selectedId = computed(() => this.group().selectedOptionId ?? 0);

  selectedItem = computed(
    () =>
      this.items().find((i) => i.id === this.selectedId()) ?? this.items()[0],
  );

  select(id: number) {
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
