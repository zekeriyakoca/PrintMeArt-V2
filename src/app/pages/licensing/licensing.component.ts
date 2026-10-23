import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component } from '@angular/core';
@Component({
  selector: 'app-licensing',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './licensing.component.html',
  styleUrls: ['./licensing.component.scss'],
})
export class LicensingComponent {}
