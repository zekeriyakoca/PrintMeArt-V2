import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bootstrap } from '../../services/bootstrap/bootstrap';
import { TranslationService } from '../../services/i18n/translation.service';
import { SeoService } from '../../services/seo/seo.service';

@Component({
  selector: 'app-how-we-work',
  imports: [TranslatePipe, RouterLink],
  templateUrl: './how-we-work.component.html',
  styleUrl: './how-we-work.component.scss',
  standalone: true,
})
export class HowWeWorkComponent {
  readonly shippingInfo = inject(Bootstrap).shippingInfo;
  private readonly i18n = inject(TranslationService);
  private readonly seo = inject(SeoService);

  // The page's FAQ, also as structured data so search engines and AI assistants can quote it
  private readonly describeForSearch = effect(() => {
    const info = this.shippingInfo();
    const faq = [
      ['how.faqPoster', 'how.faqPosterA'],
      ['how.faqOwn', 'how.faqOwnA'],
      ['how.faqMatte', 'how.faqMatteA'],
      ...(info ? [['info.faq.shippingQ', 'how.faqShippingA']] : []),
    ];
    this.seo.setPage({
      title: this.i18n.t('seo.howWeWork.title'),
      description: this.i18n.t('seo.howWeWork.description'),
      structuredData: [
        {
          '@type': 'FAQPage',
          mainEntity: faq.map(([question, answer]) => ({
            '@type': 'Question',
            name: this.i18n.t(question),
            acceptedAnswer: { '@type': 'Answer', text: this.i18n.t(answer, { days: info?.deliveryDays ?? '' }) },
          })),
        },
      ],
    });
  });
}
