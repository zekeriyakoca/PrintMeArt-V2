import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { IconComponent } from '../shared/icon/icon.component';
import { Bootstrap } from '../../services/bootstrap/bootstrap';

interface PolicyFeature {
  color: string;
  name: string;
  desc: string;
  svg: string;
}

@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [IconComponent],
  providers: [CurrencyPipe],
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss'],
})
export class PolicyComponent {
  private readonly bootstrap = inject(Bootstrap);
  private readonly currency = inject(CurrencyPipe);

  features = computed<PolicyFeature[]>(() => {
    const info = this.bootstrap.shippingInfo();
    if (!info) {
      return [];
    }
    return [
      {
        color: 'bg-red-50',
        name: 'Free shipping',
        desc: `Free shipping on all orders above ${this.currency.transform(info.freeShippingThresholdNl, 'EUR')} within the Netherlands.`,
        svg: `truck`,
      },
      {
        color: 'bg-sky-50',
        name: 'Very easy to return',
        desc: 'contact us and we’ll take care of the rest.',
        svg: `return`,
      },
      {
        color: 'bg-green-50',
        name: 'Within the Netherlands',
        desc: `Fast delivery within the Netherlands in ${info.deliveryDays} days.`,
        svg: `world`,
      },
      {
        color: 'bg-amber-50',
        name: 'Refunds policy',
        desc: `${info.returnDays} days return for any reason`,
        svg: `refund`,
      },
    ];
  });

  t(text: string): string {
    return text;
  }
}
