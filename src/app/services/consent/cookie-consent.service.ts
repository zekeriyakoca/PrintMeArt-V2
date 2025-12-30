import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export const CONSENT_KEY = 'cookie-consent-status';

export type ConsentStatus = 'granted' | 'denied' | 'pending';

@Injectable({
  providedIn: 'root',
})
export class CookieConsentService {
  private consentStatusSubject = new BehaviorSubject<ConsentStatus>('pending');
  public consentStatus$ = this.consentStatusSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.init();
  }

  private init(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'granted' || stored === 'denied') {
      this.consentStatusSubject.next(stored);
    } else {
      this.consentStatusSubject.next('pending');
    }
  }

  public grantConsent(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(CONSENT_KEY, 'granted');
    this.consentStatusSubject.next('granted');
  }

  public denyConsent(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(CONSENT_KEY, 'denied');
    this.consentStatusSubject.next('denied');
  }

  public getStatus(): ConsentStatus {
    return this.consentStatusSubject.value;
  }
}
