import { Component, signal, HostListener, ElementRef } from '@angular/core';

import {
  LanguageService,
  Language,
} from '../../services/i18n/language.service';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-language-dropdown',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './language-dropdown.component.html',
  styleUrl: './language-dropdown.component.scss',
})
export class LanguageDropdownComponent {
  isOpen = signal(false);

  constructor(
    public languageService: LanguageService,
    private elementRef: ElementRef,
  ) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleDropdown(): void {
    this.isOpen.update((open) => !open);
  }

  selectLanguage(language: Language): void {
    this.languageService.setLanguage(language.code);
    this.isOpen.set(false);
  }
}
