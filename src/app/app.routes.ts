import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthenticationGuard } from './services/authentication/authentication.guard';

// The home page is in the main bundle; every other page loads the first time it is visited
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'collections', loadComponent: () => import('./pages/collections/collections.component').then((m) => m.CollectionsComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent) },
  {
    path: 'products',
    loadComponent: () => import('./pages/product-list/product-list.component').then((m) => m.ProductListComponent),
  },
  {
    path: 'search',
    redirectTo: 'products',
  },
  {
    path: 'products/:productId',
    loadComponent: () => import('./pages/product-detail/product-detail.component').then((m) => m.ProductDetailComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'frames',
    loadComponent: () => import('./pages/frames-catalog/frames-catalog.component').then((m) => m.FramesCatalogComponent),
  },
  {
    path: 'your-design',
    loadComponent: () => import('./pages/custom-design/custom-design.component').then((m) => m.CustomDesignComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders.component').then((m) => m.OrdersComponent),
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'how-we-work',
    loadComponent: () => import('./pages/how-we-work/how-we-work.component').then((m) => m.HowWeWorkComponent),
  },
  {
    path: 'legal',
    loadComponent: () => import('./pages/legal/legal.component').then((m) => m.LegalComponent),
  },
  {
    path: 'licensing',
    loadComponent: () => import('./pages/licensing/licensing.component').then((m) => m.LicensingComponent),
  },
  {
    path: 'order-confirmation',
    loadComponent: () => import('./pages/order-confirmation/order-confirmation.component').then((m) => m.OrderConfirmationComponent),
  },
  {
    path: 'checkout/success',
    loadComponent: () => import('./pages/payment-success/payment-success.component').then((m) => m.PaymentSuccessComponent),
  },
  {
    path: 'checkout/cancel',
    loadComponent: () => import('./pages/payment-cancel/payment-cancel.component').then((m) => m.PaymentCancelComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
