import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout-user-info',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './checkout-user-info.component.html',
  styleUrl: './checkout-user-info.component.scss',
})
export class CheckoutUserInfoComponent {
  userDetails = model<any>({});
}
