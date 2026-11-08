import { Directive, ElementRef, HostListener, inject, input, OnDestroy } from '@angular/core';

/**
 * Cycles the hover close-up of a `.closeup` container through several detail crops.
 * The first crop stays in the template's `.closeup__media`; every few seconds while hovered a new
 * `.closeup__layer` with the next crop is added on top, and its CSS animation reveals it with the same
 * circular ripple from the loupe. A fresh element per switch restarts the animation. Mouse leave resets.
 */
@Directive({ selector: '[appCloseupCycle]' })
export class CloseupCycleDirective implements OnDestroy {
  crops = input<string[]>([], { alias: 'appCloseupCycle' });

  private static readonly intervalMs = 2500;
  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private timer?: ReturnType<typeof setInterval>;
  private index = 0;

  @HostListener('mouseenter')
  start() {
    const crops = this.crops();
    if (crops.length < 2 || !matchMedia('(hover: hover)').matches) return;
    crops.slice(1).forEach((url) => (new Image().src = url));
    this.timer = setInterval(() => this.next(), CloseupCycleDirective.intervalMs);
  }

  @HostListener('mouseleave')
  stop() {
    clearInterval(this.timer);
    this.index = 0;
    this.el.querySelectorAll('.closeup__layer').forEach((layer) => layer.remove());
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  private next() {
    const crops = this.crops();
    this.index = (this.index + 1) % crops.length;
    const layers = this.el.querySelectorAll('.closeup__layer');
    const below = layers[layers.length - 1] ?? this.el.querySelector('.closeup__media');
    if (!below) return;

    const layer = document.createElement('div');
    layer.className = 'closeup__layer';
    const img = document.createElement('img');
    img.src = crops[this.index];
    img.alt = '';
    layer.appendChild(img);
    below.after(layer);
    // Only the layer underneath the new one is still visible during the reveal; older ones can go
    for (let i = 0; i < layers.length - 1; i++) layers[i].remove();
  }
}
