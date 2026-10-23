import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component } from '@angular/core';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-custom-design-how-it-works',
  standalone: true,
  imports: [TranslatePipe, IconComponent],
  templateUrl: './custom-design-how-it-works.component.html',
})
export class CustomDesignHowItWorksComponent {}
