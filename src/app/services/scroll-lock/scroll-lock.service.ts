import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

/**
 * Stops the page behind an overlay from scrolling. The lock sits on <html>: the global
 * `overflow-x: clip` on html and body keeps a lock on <body> from reaching the viewport.
 * Overlays hand over to each other (Preview & Design to the room view), so the page stays
 * locked until the last holder lets go.
 */
@Injectable({ providedIn: 'root' })
export class ScrollLockService {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly holders = new Set<object>();

  lock(holder: object) {
    if (!this.browser || this.holders.has(holder)) return;
    this.holders.add(holder);
    if (this.holders.size === 1) this.apply(true);
  }

  unlock(holder: object) {
    if (!this.holders.delete(holder) || this.holders.size) return;
    this.apply(false);
  }

  private apply(locked: boolean) {
    const html = this.document.documentElement;
    // Keep the page from shifting sideways where a scrollbar disappears
    const scrollbar = locked ? window.innerWidth - html.clientWidth : 0;
    html.style.overflow = locked ? 'hidden' : '';
    html.style.paddingRight = scrollbar > 0 ? `${scrollbar}px` : '';
  }
}
