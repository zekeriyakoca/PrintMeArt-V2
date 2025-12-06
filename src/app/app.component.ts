import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CartAddedModalComponent } from './components/cart-added-modal/cart-added-modal.component';
import { CartService } from './services/cart/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CartAddedModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'StoreFront';

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.fetchCartItems();
  }
}
