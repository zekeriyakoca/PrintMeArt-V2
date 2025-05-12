import { Component } from '@angular/core';
import { NewsletterSignupSectionComponent } from '../../components/newsletter-signup-section/newsletter-signup-section.component';

@Component({
  selector: 'app-about',
  imports: [NewsletterSignupSectionComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {}
