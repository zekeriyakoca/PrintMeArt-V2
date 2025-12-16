import { Component } from '@angular/core';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';
import { SectionTitleComponent } from '../../components/section-title/section-title.component';

@Component({
  selector: 'app-about',
  imports: [ContactFormComponent, SectionTitleComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {}
