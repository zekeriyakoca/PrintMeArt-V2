import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  effect,
  OnDestroy,
} from '@angular/core';

import { Router } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';
import { IconComponent } from '../shared/icon/icon.component';
import {
  SelectedOptionDto,
  getDisplayableOptions,
} from '../../models/cart-item';

@Component({
  selector: 'app-cart-added-modal',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './cart-added-modal.component.html',
  styleUrl: './cart-added-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartAddedModalComponent implements OnDestroy {
  private router = inject(Router);
  private cartService = inject(CartService);
  private autoHideTimeout: ReturnType<typeof setTimeout> | null = null;
  private isPaused = false;

  isVisible = this.cartService.showCartNotification;
  addedItem = this.cartService.lastAddedItem;

  cartItemCount = computed(() => this.cartService.cart().length);
  cartTotal = computed(() =>
    this.cartService
      .cart()
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );

  /** Filter out internal options like CustomProductUrl */
  getDisplayOptions(
    options: SelectedOptionDto[] | undefined,
  ): SelectedOptionDto[] {
    return getDisplayableOptions(options);
  }

  constructor() {
    effect(() => {
      if (this.isVisible()) {
        this.startAutoHide();
      } else {
        this.clearAutoHide();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearAutoHide();
  }

  private startAutoHide(): void {
    this.clearAutoHide();
    if (!this.isPaused) {
      this.autoHideTimeout = setTimeout(() => this.close(), 6000);
    }
  }

  private clearAutoHide(): void {
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
      this.autoHideTimeout = null;
    }
  }

  pauseAutoHide(): void {
    this.isPaused = true;
    this.clearAutoHide();
  }

  resumeAutoHide(): void {
    this.isPaused = false;
    if (this.isVisible()) {
      this.startAutoHide();
    }
  }

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
