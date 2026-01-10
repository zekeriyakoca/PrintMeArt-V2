import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BasePageComponent } from '../basePageComponent';
import { IconComponent } from '../../components/shared/icon/icon.component';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './payment-cancel.component.html',
  styleUrl: './payment-cancel.component.scss',
})
export class PaymentCancelComponent extends BasePageComponent {}
