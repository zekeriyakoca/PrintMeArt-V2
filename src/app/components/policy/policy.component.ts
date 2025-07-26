import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    desc: 'Just phone number.',
    svg: `return`,
  },
  {
    color: 'bg-green-50',
    name: 'Nationwide Delivery',
    desc: 'Fast delivery nationwide in 2 days.',
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
  imports: [CommonModule, IconComponent],
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss'],
})
export class PolicyComponent {
  features = A_FEATURES;

  t(text: string): string {
    return text;
  }
}
