import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'app-section-title',
  templateUrl: './section-title.component.html',
  standalone: true,
})
export class SectionTitleComponent {
  label = input('');
  title = input('');
}
