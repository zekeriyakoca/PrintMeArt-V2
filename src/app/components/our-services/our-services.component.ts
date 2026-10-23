import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component } from '@angular/core';

@Component({
  selector: 'app-our-services',
  imports: [TranslatePipe],
  templateUrl: './our-services.component.html',
  styleUrl: './our-services.component.scss'
})
export class OurServicesComponent {

}
