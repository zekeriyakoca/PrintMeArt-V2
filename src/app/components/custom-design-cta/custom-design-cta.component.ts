import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component } from '@angular/core';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-custom-design-cta',
  standalone: true,
  imports: [TranslatePipe, IconComponent],
  templateUrl: './custom-design-cta.component.html',
})
export class CustomDesignCtaComponent {}
