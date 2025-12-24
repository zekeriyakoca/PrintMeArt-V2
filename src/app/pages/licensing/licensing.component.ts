import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';

@Component({
  selector: 'app-licensing',
  standalone: true,
  imports: [CommonModule, ContactFormComponent],
  templateUrl: './licensing.component.html',
  styleUrls: ['./licensing.component.scss'],
})
export class LicensingComponent {}
