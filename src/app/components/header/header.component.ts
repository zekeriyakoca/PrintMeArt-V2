import { Component, signal } from '@angular/core';
import { BaseAppComponent } from '../baseAppComponent';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent extends BaseAppComponent {
  totalItemCountInCart = signal<number>(0);
  constructor(
    private router: Router,
    private cartService: CartService,
  ) {
    super();
    toObservable(this.cartService.cart)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((cart) => {
        this.totalItemCountInCart.set(cart.length);
      });
  }

  navigateToCart() {
    this.router.navigate(['/cart']);
  }
}
