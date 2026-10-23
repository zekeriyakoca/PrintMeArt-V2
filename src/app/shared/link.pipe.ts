import { inject, Pipe, PipeTransform } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

/** Turns an app address with a query or fragment ('/products?tags=8') into a target for routerLink. */
@Pipe({ name: 'link' })
export class LinkPipe implements PipeTransform {
  private readonly router = inject(Router);

  transform(url: string): UrlTree {
    return this.router.parseUrl(url);
  }
}
