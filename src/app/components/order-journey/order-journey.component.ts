import { Component } from '@angular/core';

type OrderJourneyIcon = 'browse' | 'cart' | 'shipping' | 'enjoy';

interface OrderJourneyStep {
  label: string;
  icon: OrderJourneyIcon;
  title: string;
  description: string;
}

@Component({
  selector: 'app-order-journey',
  imports: [],
  templateUrl: './order-journey.component.html',
  styleUrl: './order-journey.component.scss',
})
export class OrderJourneyComponent {
  steps: OrderJourneyStep[] = [
    {
      label: 'Step 1',
      icon: 'browse',
      title: 'Browse & Select',
      description:
        'Easily explore our wide range of art prints and find your perfect piece',
    },
    {
      label: 'Step 2',
      icon: 'cart',
      title: 'Add to Cart',
      description:
        'Choose your print, frame, and paper options, then add to your cart with a click',
    },
    {
      label: 'Step 3',
      icon: 'shipping',
      title: 'Fast Shipping',
      description:
        'We carefully pack and ship your order within two days, ensuring it arrives quickly and safely',
    },
    {
      label: 'Step 4',
      icon: 'enjoy',
      title: 'Enjoy Your Art',
      description:
        'Hang your new artwork and enjoy a beautifully styled space every day',
    },
  ];
}
