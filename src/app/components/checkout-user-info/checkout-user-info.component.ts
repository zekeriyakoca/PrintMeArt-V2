import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-checkout-user-info',
  imports: [FormsModule, IconComponent],
  standalone: true,
  templateUrl: './checkout-user-info.component.html',
  styleUrl: './checkout-user-info.component.scss',
})
export class CheckoutUserInfoComponent {
  userDetails = model<any>({});
}
