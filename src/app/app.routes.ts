import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { Routes } from '@angular/router';
import { authenticationGuard } from './services/authentication/authentication.guard';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { ProductListComponent } from './pages/product-list/product-list.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authenticationGuard] },
  { path: 'login', component: LoginComponent },
  {
    path: 'products/:category',
    component: ProductListComponent,
    canActivate: [authenticationGuard],
  },
  {
    path: 'products/:category/:product',
    component: ProductDetailComponent,
    canActivate: [authenticationGuard],
  },
];
