import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './services/api/api.service';

export const serverRoutes: ServerRoute[] = [
  // Pages that depend on the visitor or on query parameters render in the browser only
  ...['products', 'search', 'login', 'cart', 'checkout', 'profile', 'orders', 'order-confirmation', 'checkout/success', 'checkout/cancel'].map(
    (path): ServerRoute => ({ path, renderMode: RenderMode.Client }),
  ),
  {
    // Every product in the catalog gets its own page at build time
    path: 'products/:productId',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const products = await firstValueFrom(inject(ApiService).getFilteredProducts({ pageSize: 5000, pageIndex: 0 }));
      return products.data.map((product) => ({ productId: String(product.id) }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
