import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component } from '@angular/core';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';
import { SectionTitleComponent } from '../../components/section-title/section-title.component';
import { IconComponent } from '../../components/shared/icon/icon.component';

@Component({
  selector: 'app-about',
  imports: [TranslatePipe, ContactFormComponent, SectionTitleComponent, IconComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  values = [
    {
      icon: 'photo',
      title: 'about.v1Title',
      description: 'about.v1Text',
      color: 'cyan',
    },
    {
      icon: 'frame',
      title: 'about.v2Title',
      description: 'about.v2Text',
      color: 'violet',
    },
    {
      icon: 'lightning',
      title: 'about.v3Title',
      description: 'about.v3Text',
      color: 'amber',
    },
  ];

  fastFacts = [
    {
      icon: 'photo',
      title: 'about.f1Title',
      description: 'about.f1Text',
    },
    {
      icon: 'users',
      title: 'about.f2Title',
      description: 'about.f2Text',
    },
    {
      icon: 'sliders',
      title: 'about.f3Title',
      description: 'about.f3Text',
    },
  ];
}
