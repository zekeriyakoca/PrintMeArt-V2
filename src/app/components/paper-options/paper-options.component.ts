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
import { PaperOptionsByValue } from '../../shared/constants';
import { IconComponent } from '../shared/icon/icon.component';

interface PaperItem {
  id: number;
  name: string;
  thumbnail: string;
  weightGsm: number;
  surface: string;
  badgeTitle: string;
  uxLabels: string[];
  lookFeel: string[];
  bestFor: string[];
}

@Component({
  selector: 'app-paper-options',
  imports: [RouterLink, IconComponent],
  templateUrl: './paper-options.component.html',
  styleUrl: './paper-options.component.scss',
})
export class PaperOptionsComponent {
  group = input.required<OptionGroupDto>();
  optionSelected = output<number>();

  isOpen = signal(false);
  private el = inject(ElementRef<HTMLElement>);

  items = computed<PaperItem[]>(() =>
    this.group().options.map((opt) => {
      const paper = PaperOptionsByValue[opt.value];
      return {
        id: opt.id,
        name: opt.value,
        thumbnail: paper?.thumbnail || opt.imageUrl,
        weightGsm: paper?.weightGsm || 0,
        surface: paper?.surface || '',
        badgeTitle: paper?.badgeTitle || '',
        uxLabels: paper?.uxLabels || [],
        lookFeel: paper?.lookFeel || [],
        bestFor: paper?.bestFor || [],
      };
    }),
  );

  selectedId = linkedSignal(() => {
    const selectedOptionId = this.group().selectedOptionId;
    if (selectedOptionId) return selectedOptionId;
    const firstId = this.items()[0]?.id;
    if (firstId) this.optionSelected.emit(firstId);
    return firstId;
  });

  selectedItem = computed(
    () => this.items().find((i) => i.id === this.selectedId()) ?? null,
  );

  select(id: number): void {
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
