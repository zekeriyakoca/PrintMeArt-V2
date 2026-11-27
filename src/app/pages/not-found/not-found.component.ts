import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, inject, input, OnInit, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/shared/icon/icon.component';

@Component({
  selector: 'app-not-found',
  imports: [TranslatePipe, RouterLink, IconComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent implements OnInit {
  /** The address once existed and was removed for good: answer 410 so search engines drop it sooner */
  readonly gone = input(false);

  private readonly response = inject(RESPONSE_INIT, { optional: true });

  ngOnInit() {
    // Rendered on the server, the page answers 404 (or 410) so search engines drop the address
    if (this.response) this.response.status = this.gone() ? 410 : 404;
  }
}
