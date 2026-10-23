import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { IconComponent } from '../shared/icon/icon.component';
import { Bootstrap } from '../../services/bootstrap/bootstrap';
import { TranslationService } from '../../services/i18n/translation.service';

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
  private readonly i18n = inject(TranslationService);

  features = computed<PolicyFeature[]>(() => {
    const info = this.bootstrap.shippingInfo();
    if (!info) {
      return [];
    }
    const freeZone = info.zones.find((zone) => zone.freeShippingFrom != null);
    return [
      ...(freeZone
        ? [
            {
              color: 'bg-red-50',
              name: this.i18n.t('policy.freeShipping'),
              desc: this.i18n.t('policy.freeShippingText', { amount: this.currency.transform(freeZone.freeShippingFrom, 'EUR') ?? '', zone: this.i18n.t('name.' + freeZone.name) }),
              svg: `truck`,
            },
          ]
        : []),
      {
        color: 'bg-sky-50',
        name: this.i18n.t('policy.easyReturn'),
        desc: this.i18n.t('policy.easyReturnText'),
        svg: `return`,
      },
      {
        color: 'bg-green-50',
        name: this.i18n.t('policy.netherlands'),
        desc: this.i18n.t('policy.netherlandsText', { days: info.deliveryDays }),
        svg: `world`,
      },
      {
        color: 'bg-amber-50',
        name: this.i18n.t('policy.refunds'),
        desc: this.i18n.t('policy.refundsText', { days: info.returnDays }),
        svg: `refund`,
      },
    ];
  });

}
