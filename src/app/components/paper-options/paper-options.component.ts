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
  AllPapers,
  GradeBadgeColors,
  PriceTierColors,
  Paper,
} from '../../shared/constants';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-paper-options',
  imports: [RouterLink, IconComponent],
  templateUrl: './paper-options.component.html',
  styleUrl: './paper-options.component.scss',
})
export class PaperOptionsComponent {
  group = input.required<OptionGroupDto>();
  optionSelected = output<number>();
  /** Emits the paper name for display and spec3 */
  paperNameSelected = output<string>();

  isOpen = signal(false);
  private el = inject(ElementRef<HTMLElement>);

  gradeBadgeColors = GradeBadgeColors;
  priceTierColors = PriceTierColors;

  // Frontend paper listesi
  papers = AllPapers;

  // Seçili paper index
  selectedIndex = signal(0);

  // Seçili paper
  selectedPaper = computed(() => this.papers[this.selectedIndex()]);

  // Seçim yapıldığında: paper'ın grade'ine göre backend option'ı bul ve emit et
  select(paper: Paper, index: number): void {
    this.selectedIndex.set(index);

    // Backend option'ını bul (grade'e göre: Museum, Gallery, Studio, Home)
    const backendOption = this.group().options.find(
      (opt) => opt.value === paper.grade,
    );

    if (backendOption) {
      this.optionSelected.emit(backendOption.id);
      this.paperNameSelected.emit(paper.name);
    }

    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(e: MouseEvent) {
    if (this.isOpen() && !this.el.nativeElement.contains(e.target as Node)) {
      this.isOpen.set(false);
    }
  }
}
