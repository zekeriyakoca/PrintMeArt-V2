import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GUIDES, guidePath, guideText } from '../../guides/guides';
import { LanguageService } from '../../services/i18n/language.service';
import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { TranslationService } from '../../services/i18n/translation.service';
import { SeoService } from '../../services/seo/seo.service';

/** /nl/gids, /en/guides: the list of guides */
@Component({
  selector: 'app-guides',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './guides.component.html',
  styleUrl: '../guide/guide.component.scss',
})
export class GuidesComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly i18n = inject(TranslationService);
  readonly language = inject(LanguageService).currentLanguageCode();

  readonly guides = GUIDES.map((guide, index) => ({
    number: String(index + 1).padStart(2, '0'),
    minutes: guide.minutes,
    text: guideText(guide, this.language),
    // The router adds the language itself
    link: guidePath(this.language, guideText(guide, this.language).slug),
  }));

  ngOnInit() {
    const path = guidePath(this.language);
    const url = this.seo.absoluteUrl(this.language, path);
    this.seo.setPage({
      title: this.i18n.t('guides.seoTitle'),
      description: this.i18n.t('guides.seoDescription'),
      path,
      paths: { nl: guidePath('nl'), en: guidePath('en') },
      structuredData: [
        {
          '@type': 'CollectionPage',
          name: this.i18n.t('guides.title'),
          url,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: this.guides.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: this.seo.absoluteUrl(this.language, guidePath(this.language, g.text.slug)), name: g.text.title })),
          },
        },
      ],
    });
  }
}
