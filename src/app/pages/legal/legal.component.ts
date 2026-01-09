import { Component } from '@angular/core';
import { ComplianceFormComponent } from '../../components/compliance-form/compliance-form.component';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [ComplianceFormComponent],
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss'],
})
export class LegalComponent {}
