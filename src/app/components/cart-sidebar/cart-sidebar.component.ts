import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';
import { CartItemDto, getDisplayableOptions } from '../../models/cart-item';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './cart-sidebar.component.html',
  styleUrl: './cart-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSidebarComponent {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);

  isOpen = this.cartService.isCartSidebarOpen;
  cartItems = this.cartService.cart;
  cartTotal = computed(() =>
    this.cartItems().reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    ),
  );
  cartItemCount = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0),
  );

  /** Filter out internal options like CustomProductUrl */
  getDisplayOptions = getDisplayableOptions;

  close(): void {
    this.cartService.closeCartSidebar();
  }

  goToCart(): void {
    this.close();
    this.router.navigate(['/cart']);
  }

  goToCheckout(): void {
    this.close();
    this.router.navigate(['/checkout']);
  }

  removeItem(itemId: string): void {
    this.cartService.removeItemFromCart(itemId);
  }

  updateQuantity(item: CartItemDto, delta: number): void {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      this.removeItem(item.id);
      return;
    }

    const updatedCart = this.cartItems().map((cartItem) =>
      cartItem.id === item.id
        ? { ...cartItem, quantity: newQuantity }
        : cartItem,
    );

    this.cartService.updateCartOnBackend(updatedCart).subscribe();
  }
}
