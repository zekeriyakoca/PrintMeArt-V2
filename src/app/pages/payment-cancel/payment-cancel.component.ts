import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BasePageComponent } from '../basePageComponent';
import { IconComponent } from '../../components/shared/icon/icon.component';
import { AnalyticsService } from '../../services/telemetry/analytics.service';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './payment-cancel.component.html',
  styleUrl: './payment-cancel.component.scss',
})
export class PaymentCancelComponent extends BasePageComponent {
  private readonly analytics = inject(AnalyticsService);

  ngOnInit(): void {
    this.analytics.trackPaymentFailed('stripe_checkout_cancelled');
  }
}
