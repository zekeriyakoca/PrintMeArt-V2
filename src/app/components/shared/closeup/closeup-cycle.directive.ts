import { afterNextRender, Directive, effect, ElementRef, HostListener, inject, input, OnDestroy, signal } from '@angular/core';

/**
 * Cycles the close-up of a `.closeup` container through several detail crops. The small loupe stays still.
 * While hovered a new `.closeup__layer` with the next crop is added on top every few seconds, and its CSS
 * animation reveals it with the same circular ripple from the loupe. Mouse leave keeps the current crop.
 * The hover close-up only arms (`.closeup--armed`) a few seconds after a product shows, so the painting
 * itself is seen first; a pointer already resting on the image arms it once it leaves.
 */
@Directive({ selector: '[appCloseupCycle]', host: { '[class.closeup--armed]': 'armed()' } })
export class CloseupCycleDirective implements OnDestroy {
  crops = input<string[]>([], { alias: 'appCloseupCycle' });

  private static readonly intervalMs = 2500;
  private static readonly armDelayMs = 3000;
  armed = signal(false);
  private armTimer?: ReturnType<typeof setTimeout>;
  private pointerOver = false;
  private armOnLeave = false;
  private rendered = false;
  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private hoverTimer?: ReturnType<typeof setInterval>;
  private index = 0;
  private hovered = false;

  constructor() {
    // A new product reuses this element: start again from its first crop
    effect(() => {
      this.crops();
      this.index = 0;
      this.el.querySelectorAll('.closeup__layer').forEach((node) => node.remove());
      if (this.rendered) this.armLater();
    });

    afterNextRender(() => {
      this.rendered = true;
      this.armLater();
    });
  }

  @HostListener('mouseenter')
  start() {
    this.pointerOver = true;
    if (!this.armed()) return;
    const crops = this.crops();
    if (crops.length < 2 || !matchMedia('(hover: hover)').matches) return;
    this.hovered = true;
    crops.forEach((url) => (new Image().src = url));
    this.hoverTimer = setInterval(() => this.next(), CloseupCycleDirective.intervalMs);
  }

  @HostListener('mouseleave')
  stop() {
    this.pointerOver = false;
    if (this.armOnLeave) {
      this.armOnLeave = false;
      this.armed.set(true);
    }
    if (!this.hovered) return;
    this.hovered = false;
    clearInterval(this.hoverTimer);
    // The loupe keeps the crop that was showing: give the base image that crop, then drop the layers
    const layers = this.el.querySelectorAll('.closeup__layer');
    this.showInBase(this.crops()[this.index], () => layers.forEach((layer) => layer.remove()));
  }

  ngOnDestroy() {
    clearTimeout(this.armTimer);
    clearInterval(this.hoverTimer);
  }

  /** Disarms the hover close-up and arms it again after the delay, or on leave if the pointer is still on it */
  private armLater() {
    clearTimeout(this.armTimer);
    this.armed.set(false);
    this.armOnLeave = false;
    this.armTimer = setTimeout(() => {
      if (this.pointerOver) this.armOnLeave = true;
      else this.armed.set(true);
    }, CloseupCycleDirective.armDelayMs);
  }

  /** Gives the template's loupe image a crop that is already on screen, then runs `done` once it can paint it */
  private showInBase(url: string, done: () => void) {
    const base = this.el.querySelector<HTMLImageElement>('.closeup__img');
    if (!base || !url) return done();
    base.src = url;
    base.decode().then(done, done);
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
