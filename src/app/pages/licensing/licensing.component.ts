import { Component } from '@angular/core';

import { ContactFormComponent } from '../../components/contact-form/contact-form.component';

@Component({
  selector: 'app-licensing',
  standalone: true,
  imports: [ContactFormComponent],
  templateUrl: './licensing.component.html',
  styleUrls: ['./licensing.component.scss'],
})
export class LicensingComponent {}
