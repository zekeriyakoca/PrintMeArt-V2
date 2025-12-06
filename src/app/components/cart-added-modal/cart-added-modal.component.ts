import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-cart-added-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-added-modal.component.html',
  styleUrl: './cart-added-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartAddedModalComponent {
  private router = inject(Router);
  private cartService = inject(CartService);

  isVisible = this.cartService.showCartNotification;
  addedItem = this.cartService.lastAddedItem;

  cartItemCount = computed(() => this.cartService.cart().length);
  cartTotal = computed(() =>
    this.cartService
      .cart()
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );

  close(): void {
    this.cartService.hideCartNotification();
  }

  viewCart(): void {
    this.close();
    this.router.navigate(['/cart']);
  }

  continueShopping(): void {
    this.close();
  }
}
