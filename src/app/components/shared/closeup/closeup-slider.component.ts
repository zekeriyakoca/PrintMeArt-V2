import { afterNextRender, Component, computed, effect, HostListener, input, OnDestroy, signal } from '@angular/core';

/**
 * The close-up gallery tile: slides through the detail crops on its own every few seconds,
 * and straight to the next one when the pointer comes onto it. Holds still with reduced motion
 * and in a hidden tab.
 */
@Component({
  selector: 'app-closeup-slider',
  template: `
    @for (s of [step()]; track s) {
      @if (s > 0) {
        <img class="slide slide--out" [src]="urlAt(s - 1)" alt="" />
      }
      <img class="slide" [class.slide--in]="s > 0" [src]="urlAt(s)" [alt]="alt()" />
    }
  `,
  styles: `
    :host { position: absolute; inset: 0; overflow: hidden; display: block; }
    .slide { position: absolute; inset: 0; width: 100%; height: 100%; max-width: none; object-fit: cover; }
    .slide--in { animation: slide-in 0.9s cubic-bezier(0.7, 0, 0.3, 1) both; }
    .slide--out { animation: slide-out 0.9s cubic-bezier(0.7, 0, 0.3, 1) both; }
    @keyframes slide-in { from { transform: translateX(100%); } to { transform: none; } }
    @keyframes slide-out { from { transform: none; } to { transform: translateX(-35%); } }
    @media (prefers-reduced-motion: reduce) { .slide--in, .slide--out { animation: none; } }
  `,
})
export class CloseupSliderComponent implements OnDestroy {
  urls = input<string[]>([]);
  alt = input('');

  private static readonly intervalMs = 3500;
  step = signal(0);
  private timer?: ReturnType<typeof setInterval>;
  private busy = false;
  private count = computed(() => this.urls().length);

  constructor() {
    // A new product starts again from its first crop
    effect(() => {
      this.urls();
      this.step.set(0);
    });

    afterNextRender(() => {
      this.urls().forEach((url) => (new Image().src = url));
      this.restart();
    });
  }

  urlAt(step: number) {
    return this.urls()[step % Math.max(this.count(), 1)];
  }

  @HostListener('mouseenter')
  onEnter() {
    this.advance();
    this.restart();
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  private restart() {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.advance(), CloseupSliderComponent.intervalMs);
  }

  /** Moves on once the next crop is decoded, so it never slides in half-drawn */
  private advance() {
    if (this.busy || this.count() < 2 || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.busy = true;
    const next = new Image();
    next.src = this.urlAt(this.step() + 1);
    next.decode().then(
      () => this.step.update((s) => s + 1),
      () => {},
    ).finally(() => (this.busy = false));
  }
}
