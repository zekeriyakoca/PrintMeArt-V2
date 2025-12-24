import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { AboutComponent } from './pages/about/about.component';
import { FramesCatalogComponent } from './pages/frames-catalog/frames-catalog.component';
import { CustomDesignComponent } from './pages/custom-design/custom-design.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { HowWeWorkComponent } from './pages/how-we-work/how-we-work.component';
import { LegalComponent } from './pages/legal/legal.component';
import { LicensingComponent } from './pages/licensing/licensing.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
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
  {
    path: 'frames',
    component: FramesCatalogComponent,
  },
  {
    path: 'your-design',
    component: CustomDesignComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'orders',
    component: OrdersComponent,
  },
  {
    path: 'how-we-print',
    component: HowWeWorkComponent,
  },
  {
    path: 'legal',
    component: LegalComponent,
  },
  {
    path: 'licensing',
    component: LicensingComponent,
  },
];
