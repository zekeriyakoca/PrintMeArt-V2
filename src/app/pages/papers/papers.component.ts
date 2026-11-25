import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PAPER_PAGES, paperPath, paperText } from '../../papers/papers';
import { LanguageService } from '../../services/i18n/language.service';
import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { TranslationService } from '../../services/i18n/translation.service';
import { SeoService } from '../../services/seo/seo.service';
import { fullName } from '../paper/paper.component';

/** /nl/papier, /en/paper: every paper we print on */
@Component({
  selector: 'app-papers',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './papers.component.html',
  styleUrl: '../guide/guide.component.scss',
})
export class PapersComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly i18n = inject(TranslationService);
  readonly language = inject(LanguageService).currentLanguageCode();

  readonly papers = PAPER_PAGES.map((paper, index) => ({
    number: String(index + 1).padStart(2, '0'),
    name: fullName(paper),
    weight: paper.weightGsm,
    orderable: !!paper.price,
    text: paperText(paper, this.language),
    // The router adds the language itself
    link: paperPath(this.language, paper.slug),
  }));

  ngOnInit() {
    const path = paperPath(this.language);
    this.seo.setPage({
      title: this.i18n.t('paperPages.seoTitle'),
      description: this.i18n.t('paperPages.seoDescription'),
      path,
      paths: { nl: paperPath('nl'), en: paperPath('en') },
      structuredData: [
        {
          '@type': 'CollectionPage',
          name: this.i18n.t('paperPages.title'),
          url: this.seo.absoluteUrl(this.language, path),
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: this.papers.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: this.seo.absoluteUrl(this.language, p.link), name: p.name })),
          },
        },
      ],
    });
  }
}
