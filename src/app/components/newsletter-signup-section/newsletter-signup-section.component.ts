import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component } from '@angular/core';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-newsletter-signup-section',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './newsletter-signup-section.component.html',
  styleUrl: './newsletter-signup-section.component.scss',
})
export class NewsletterSignupSectionComponent {}
