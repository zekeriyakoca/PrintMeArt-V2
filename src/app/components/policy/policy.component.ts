import { Component } from '@angular/core';

import { IconComponent } from '../shared/icon/icon.component';

interface PolicyFeature {
  color: string;
  name: string;
  desc: string;
  svg: string;
}

const A_FEATURES: PolicyFeature[] = [
  {
    color: 'bg-red-50',
    name: 'Free shipping',
    desc: 'Free shipping on all orders above €50 within the Netherlands.',
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
    desc: 'Fast delivery within the Netherlands in 3 days.',
    svg: `world`,
  },
  {
    color: 'bg-amber-50',
    name: 'Refunds policy',
    desc: '30 days return for any reason',
    svg: `refund`,
  },
];

@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss'],
})
export class PolicyComponent {
  features = A_FEATURES;

  t(text: string): string {
    return text;
  }
}
