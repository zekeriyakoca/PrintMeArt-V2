import { afterNextRender, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../services/i18n/translate.pipe';

/** localStorage key holding the visitor's choice: 'granted' or 'denied' */
const CONSENT_KEY = 'cookie-consent-status';

type ConsentDecision = 'granted' | 'denied';

/**
 * Cookie banner, rendered once at the app root.
 * The server never renders it: the choice lives in localStorage, so the browser decides after hydration.
 * Once a choice is stored it is never shown again.
 */
@Component({
  selector: 'app-cookie-consent',
  imports: [TranslatePipe, RouterLink],
  templateUrl: './cookie-consent.component.html',
})
export class CookieConsentComponent {
  readonly visible = signal(false);

  constructor() {
    afterNextRender(() => this.visible.set(readDecision() === null));
  }

  decide(decision: ConsentDecision): void {
    try {
      localStorage.setItem(CONSENT_KEY, decision);
    } catch {
      // Storage blocked: hide for this visit anyway
    }
    this.visible.set(false);
  }
}

function readDecision(): ConsentDecision | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : null;
  } catch {
    return null;
  }
}
