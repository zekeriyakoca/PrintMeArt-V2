import { afterNextRender, Directive, effect, ElementRef, HostListener, inject, input, OnDestroy, signal } from '@angular/core';

/**
 * Cycles the close-up of a `.closeup` container through several detail crops.
 * At rest the small loupe swaps to the next crop every few seconds with a soft circular wipe
 * (a `.closeup__img--next` laid over the template's `.closeup__img`, which takes its src afterwards).
 * The rest cycle pauses while hovered, off-screen, in a hidden tab, and never runs with reduced motion.
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
  private restTimer?: ReturnType<typeof setInterval>;
  private index = 0;
  private hovered = false;
  private onScreen = false;
  private observer?: IntersectionObserver;
  private onVisibility = () => this.syncRest();

  constructor() {
    // A new product reuses this element: start again from its first crop
    effect(() => {
      this.crops();
      this.index = 0;
      this.el.querySelectorAll('.closeup__layer, .closeup__img--next').forEach((node) => node.remove());
      if (this.rendered) this.armLater();
    });

    afterNextRender(() => {
      this.rendered = true;
      this.armLater();
      document.addEventListener('visibilitychange', this.onVisibility);
      this.observer = new IntersectionObserver(([entry]) => {
        this.onScreen = entry.isIntersecting;
        this.syncRest();
      }, { threshold: 0.5 });
      this.observer.observe(this.el);
    });
  }

  @HostListener('mouseenter')
  start() {
    this.pointerOver = true;
    if (!this.armed()) return;
    const crops = this.crops();
    if (crops.length < 2 || !matchMedia('(hover: hover)').matches) return;
    this.hovered = true;
    this.syncRest();
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
    this.syncRest();
  }

  ngOnDestroy() {
    clearTimeout(this.armTimer);
    clearInterval(this.hoverTimer);
    clearInterval(this.restTimer);
    this.observer?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
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

  private syncRest() {
    const run =
      this.crops().length > 1 &&
      this.onScreen &&
      !this.hovered &&
      !document.hidden &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (run && !this.restTimer) {
      this.restTimer = setInterval(() => this.restNext(), CloseupCycleDirective.intervalMs);
    } else if (!run && this.restTimer) {
      clearInterval(this.restTimer);
      this.restTimer = undefined;
    }
  }

  /** Wipes the next crop into the resting loupe once it has loaded */
  private restNext() {
    const crops = this.crops();
    const base = this.el.querySelector<HTMLImageElement>('.closeup__img:not(.closeup__img--next)');
    if (!base || this.el.querySelector('.closeup__img--next')) return;
    const index = (this.index + 1) % crops.length;

    const img = new Image();
    img.className = 'closeup__img closeup__img--next';
    img.alt = '';
    img.src = crops[index];
    img.decode().then(
      () => {
        if (this.hovered || crops !== this.crops()) return;
        this.index = index;
        img.addEventListener('animationend', () => this.showInBase(crops[index], () => img.remove()), { once: true });
        base.after(img);
      },
      () => {},
    );
  }

  /** Gives the template's loupe image a crop that is already on screen, then runs `done` once it can paint it */
  private showInBase(url: string, done: () => void) {
    const base = this.el.querySelector<HTMLImageElement>('.closeup__img:not(.closeup__img--next)');
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
