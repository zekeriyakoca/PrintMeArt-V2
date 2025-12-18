import { Component } from '@angular/core';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';
import { SectionTitleComponent } from '../../components/section-title/section-title.component';
import { IconComponent } from '../../components/shared/icon/icon.component';

@Component({
  selector: 'app-about',
  imports: [ContactFormComponent, SectionTitleComponent, IconComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  values = [
    {
      icon: 'photo',
      title: 'Museum-Quality Prints',
      description:
        "Archival inks on premium paper. Made to last decades, not months. The kind of quality you'd expect in a gallery.",
      color: 'cyan',
    },
    {
      icon: 'frame',
      title: 'Custom Framing Options',
      description:
        'Pick your size, choose your frame, add a mat. Your art, your way—without the custom framing markup.',
      color: 'violet',
    },
    {
      icon: 'lightning',
      title: 'Easy Experience',
      description:
        'Simple ordering, fast shipping, real humans if you need help. No hoops, no surprises, just smooth.',
      color: 'amber',
    },
  ];

  fastFacts = [
    {
      icon: 'photo',
      title: 'High-Quality Prints',
      description: 'Crafted with care and top-notch Giclée technology',
    },
    {
      icon: 'users',
      title: 'Engineers Turned Artists',
      description: 'Family-owned business led by two passionate engineers',
    },
    {
      icon: 'sliders',
      title: 'Custom Options',
      description: 'Choose from a variety of sizes, frames, and finishes',
    },
  ];
}
