import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ComplianceFormComponent } from '../../components/compliance-form/compliance-form.component';
import { Bootstrap } from '../../services/bootstrap/bootstrap';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [TranslatePipe, ComplianceFormComponent, CurrencyPipe],
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss'],
})
export class LegalComponent {
  readonly shippingInfo = inject(Bootstrap).shippingInfo;
}
