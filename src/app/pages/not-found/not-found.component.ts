import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, inject, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/shared/icon/icon.component';

@Component({
  selector: 'app-not-found',
  imports: [TranslatePipe, RouterLink, IconComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  constructor() {
    // Rendered on the server, the page answers 404 so search engines drop the address
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 404;
  }
}
