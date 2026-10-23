import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, computed, inject } from '@angular/core';
import { Bootstrap } from '../../services/bootstrap/bootstrap';

type OrderJourneyIcon = 'browse' | 'cart' | 'shipping' | 'enjoy';

interface OrderJourneyStep {
  label: string;
  icon: OrderJourneyIcon;
  title: string;
  description: string;
}

@Component({
  selector: 'app-order-journey',
  imports: [TranslatePipe],
  templateUrl: './order-journey.component.html',
  styleUrl: './order-journey.component.scss',
})
export class OrderJourneyComponent {
  private readonly bootstrap = inject(Bootstrap);

  deliveryDays = computed(() => this.bootstrap.shippingInfo()?.deliveryDays ?? 0);

  steps = computed<OrderJourneyStep[]>(() => {
    const info = this.bootstrap.shippingInfo();
    return [
      {
        label: 'Step 1',
        icon: 'browse',
        title: 'journey.browseTitle',
        description: 'journey.browseText',
      },
      {
        label: 'Step 2',
        icon: 'cart',
        title: 'journey.cartTitle',
        description: 'journey.cartText',
      },
      {
        label: 'Step 3',
        icon: 'shipping',
        title: 'journey.shippingTitle',
        description: info ? 'journey.shippingText' : '',
      },
      {
        label: 'Step 4',
        icon: 'enjoy',
        title: 'journey.enjoyTitle',
        description: 'journey.enjoyText',
      },
    ];
  });
}
