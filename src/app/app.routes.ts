import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { Routes } from '@angular/router';
import { AuthenticationGuard } from './services/authentication/authentication.guard';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { AboutComponent } from './pages/about/about.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthenticationGuard] },
  { path: 'login', component: LoginComponent },
  {
    path: 'products',
    component: ProductListComponent,
  },
  {
    path: 'search',
    redirectTo: 'products',
  },
  {
    path: 'products/:productId',
    component: ProductDetailComponent,
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
];
