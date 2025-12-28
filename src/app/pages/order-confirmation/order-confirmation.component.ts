import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/shared/icon/icon.component';
import { BasePageComponent } from '../basePageComponent';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss',
})
export class OrderConfirmationComponent extends BasePageComponent {
  orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000); // Mock order number
}
