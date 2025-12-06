import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';
import { CartItemDto } from '../../models/cart-item';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-sidebar.component.html',
  styleUrl: './cart-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSidebarComponent {
  private router = inject(Router);
  private cartService = inject(CartService);

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
      cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem,
    );

    this.cartService.updateCartOnBackend(updatedCart).subscribe();
  }
}
