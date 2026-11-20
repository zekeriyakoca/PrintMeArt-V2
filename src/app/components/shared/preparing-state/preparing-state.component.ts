import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { TranslatePipe } from '../../../services/i18n/translate.pipe';

export type PreparingIcon = 'frame' | 'room' | 'light' | 'sparkle';

// How long each icon and status line stays before the next one comes in
const STEP_MS = 2200;

/**
 * A short "we're getting it ready" state for work that takes a few seconds: icons that
 * morph into one another, a rotating status line and a soft progress shimmer.
 * `messages` are i18n keys; `icons` pick from the hand-drawn set below.
 */
@Component({
  selector: 'app-preparing-state',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './preparing-state.component.html',
  styleUrl: './preparing-state.component.scss',
  host: {
    role: 'status',
    'aria-live': 'polite',
    '[class.light]': "tone() === 'light'",
  },
})
export class PreparingStateComponent {
  messages = input<string[]>(['preparing.room', 'preparing.hanging', 'preparing.light']);
  icons = input<PreparingIcon[]>(['frame', 'room', 'sparkle']);
  /** 'dark' for use over a dimmed overlay, 'light' on a page background */
  tone = input<'dark' | 'light'>('dark');

  private tick = signal(0);
  iconIndex = computed(() => this.tick() % Math.max(this.icons().length, 1));
  message = computed(() => {
    const messages = this.messages();
    return messages.length ? messages[this.tick() % messages.length] : '';
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const timer = setInterval(() => this.tick.update((t) => t + 1), STEP_MS);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }
}
