import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntil } from 'rxjs';
import { Guide, GUIDES, guideBySlug, guidePath, guideText } from '../../guides/guides';
import { LanguageService } from '../../services/i18n/language.service';
import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { TranslationService } from '../../services/i18n/translation.service';
import { SeoService } from '../../services/seo/seo.service';
import { BasePageComponent } from '../basePageComponent';
import { NotFoundComponent } from '../not-found/not-found.component';

/** One guide: /nl/gids/welk-papier-kiezen, /en/guides/which-paper */
@Component({
  selector: 'app-guide',
  imports: [RouterLink, TranslatePipe, NotFoundComponent],
  templateUrl: './guide.component.html',
  styleUrl: './guide.component.scss',
})
export class GuideComponent extends BasePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly i18n = inject(TranslationService);
  readonly language = inject(LanguageService).currentLanguageCode();

  guide = signal<Guide | null>(null);
  text = computed(() => {
    const guide = this.guide();
    return guide ? guideText(guide, this.language) : null;
  });
  toc = computed(() => (this.text()?.blocks ?? []).flatMap((b) => (b.t === 'h2' ? [{ id: b.id, text: b.text }] : [])));
  others = computed(() =>
    GUIDES.filter((g) => g !== this.guide()).map((g) => ({ text: guideText(g, this.language), minutes: g.minutes, link: this.link(guideText(g, this.language).slug) })),
  );
  updated = computed(() => {
    const guide = this.guide();
    return guide ? new Date(guide.updated).toLocaleDateString(this.language === 'nl' ? 'nl-NL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  });
  readonly indexLink = this.link();

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      const guide = guideBySlug(params.get('slug') ?? '') ?? null;
      this.guide.set(guide);
      if (guide) this.describeForSearch(guide);
    });
  }

  link(slug?: string): string {
    return `/${this.language}${guidePath(this.language, slug)}`;
  }

  /** Links inside the article text stay in the app instead of reloading the page */
  follow(event: MouseEvent) {
    const anchor = (event.target as HTMLElement).closest('a');
    const href = anchor?.getAttribute('href');
    if (!href?.startsWith('/') || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    this.router.navigateByUrl(href);
  }

  private describeForSearch(guide: Guide) {
    const text = guideText(guide, this.language);
    const path = guidePath(this.language, text.slug);
    const url = this.seo.absoluteUrl(this.language, path);
    this.seo.setPage({
      title: text.title,
      description: text.description,
      path,
      paths: { nl: guidePath('nl', guide.nl.slug), en: guidePath('en', guide.en.slug) },
      type: 'article',
      structuredData: [
        {
          '@type': 'Article',
          headline: text.title,
          description: text.description,
          url,
          inLanguage: this.language,
          dateModified: guide.updated,
          datePublished: guide.updated,
          author: { '@type': 'Organization', name: 'PrintMeArt', url: this.seo.absoluteUrl(this.language, '/') },
          publisher: { '@type': 'Organization', name: 'PrintMeArt' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'PrintMeArt', item: this.seo.absoluteUrl(this.language, '/') },
            { '@type': 'ListItem', position: 2, name: this.i18n.t('guides.title'), item: this.seo.absoluteUrl(this.language, guidePath(this.language)) },
            { '@type': 'ListItem', position: 3, name: text.title, item: url },
          ],
        },
      ],
    });
  }
}
