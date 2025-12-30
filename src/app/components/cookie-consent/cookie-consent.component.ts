import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieConsentService } from '../../services/consent/cookie-consent.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss'],
})
export class CookieConsentComponent {
  isVisible = false;

  constructor(private cookieConsentService: CookieConsentService) {
    this.cookieConsentService.consentStatus$.subscribe((status) => {
      this.isVisible = status === 'pending';
    });
  }

  accept() {
    this.cookieConsentService.grantConsent();
  }

  reject() {
    this.cookieConsentService.denyConsent();
  }
}
