import { Route, Routes, UrlSegment } from '@angular/router';
import { categoryBySlug } from './shared/category-path';
import { HomeComponent } from './pages/home/home.component';
import { AuthenticationGuard } from './services/authentication/authentication.guard';

// The home page is in the main bundle; every other page loads the first time it is visited
export const routes: Routes = [
  { path: '', component: HomeComponent, data: { seo: 'home' } },
  { path: 'collections', loadComponent: () => import('./pages/collections/collections.component').then((m) => m.CollectionsComponent), data: { seo: 'collections' } },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent), data: { seo: 'private' } },
  {
    path: 'products',
    loadComponent: () => import('./pages/product-list/product-list.component').then((m) => m.ProductListComponent),
  },
  // Old address of the catalog, kept so earlier links and bookmarks still work
  {
    path: 'search',
    redirectTo: 'products',
  },
  {
    path: 'products/:productId',
    loadComponent: () => import('./pages/product-detail/product-detail.component').then((m) => m.ProductDetailComponent),
  },
  // A category's own page: /nl/categorie/landschap, /en/category/landscape. An unknown slug falls through to the 404 page;
  // server.ts moves the other language's word or slug to this language's
  ...['categorie', 'category'].map((segment) => ({
    path: `${segment}/:categorySlug`,
    canMatch: [(_route: Route, segments: UrlSegment[]) => !!categoryBySlug(segments[1]?.path ?? '')],
    loadComponent: () => import('./pages/product-list/product-list.component').then((m) => m.ProductListComponent),
  })),
  // The artist pages have a translated address; server.ts moves the other language's word to the right one
  ...['kunstenaars', 'artists'].flatMap((segment) => [
    { path: segment, loadComponent: () => import('./pages/artists/artists.component').then((m) => m.ArtistsComponent) },
    { path: `${segment}/:slug`, loadComponent: () => import('./pages/artist/artist.component').then((m) => m.ArtistComponent) },
  ]),
  // The guides too: /nl/gids, /en/guides
  ...['gids', 'guides'].flatMap((segment) => [
    { path: segment, loadComponent: () => import('./pages/guides/guides.component').then((m) => m.GuidesComponent) },
    { path: `${segment}/:slug`, loadComponent: () => import('./pages/guide/guide.component').then((m) => m.GuideComponent) },
  ]),
  // The papers too: /nl/papier, /en/paper
  ...['papier', 'paper'].flatMap((segment) => [
    { path: segment, loadComponent: () => import('./pages/papers/papers.component').then((m) => m.PapersComponent) },
    { path: `${segment}/:slug`, loadComponent: () => import('./pages/paper/paper.component').then((m) => m.PaperComponent) },
  ]),
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then((m) => m.CartComponent),
    data: { seo: 'private' },
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then((m) => m.CheckoutComponent),
    data: { seo: 'private' },
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
    data: { seo: 'about' },
  },
  {
    path: 'frames',
    loadComponent: () => import('./pages/frames-catalog/frames-catalog.component').then((m) => m.FramesCatalogComponent),
    data: { seo: 'frames' },
  },
  {
    path: 'your-design',
    loadComponent: () => import('./pages/custom-design/custom-design.component').then((m) => m.CustomDesignComponent),
    data: { seo: 'yourDesign' },
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
    data: { seo: 'private' },
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders.component').then((m) => m.OrdersComponent),
    data: { seo: 'private' },
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'how-we-work',
    loadComponent: () => import('./pages/how-we-work/how-we-work.component').then((m) => m.HowWeWorkComponent),
  },
  {
    path: 'legal',
    loadComponent: () => import('./pages/legal/legal.component').then((m) => m.LegalComponent),
    data: { seo: 'legal' },
  },
  {
    path: 'licensing',
    loadComponent: () => import('./pages/licensing/licensing.component').then((m) => m.LicensingComponent),
    data: { seo: 'licensing' },
  },
  {
    path: 'order-confirmation',
    loadComponent: () => import('./pages/order-confirmation/order-confirmation.component').then((m) => m.OrderConfirmationComponent),
    data: { seo: 'private' },
  },
  {
    path: 'checkout/success',
    loadComponent: () => import('./pages/payment-success/payment-success.component').then((m) => m.PaymentSuccessComponent),
    data: { seo: 'private' },
  },
  {
    path: 'checkout/cancel',
    loadComponent: () => import('./pages/payment-cancel/payment-cancel.component').then((m) => m.PaymentCancelComponent),
    data: { seo: 'private' },
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
    data: { seo: 'notFound' },
  },
];
