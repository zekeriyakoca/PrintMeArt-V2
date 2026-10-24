import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LanguageService } from '../i18n/language.service';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from '../i18n/languages';
import { TranslationService } from '../i18n/translation.service';
import { COMPANY } from '../../shared/company';

const SITE_NAME = 'PrintMeArt';
/** Shared look of the home page and collections: logo, tagline and three framed artworks (1200×630) */
const DEFAULT_IMAGE = `${environment.siteUrl}/share.jpg`;
const OG_LOCALES: Record<string, string> = { nl: 'nl_NL', en: 'en_GB' };

export interface PageSeo {
  title: string;
  description: string;
  /** Path without the language, e.g. '/products/401-the-little-street'; defaults to the current URL */
  path?: string;
  image?: string;
  type?: 'website' | 'product';
  /** Product price in euros, for Pinterest's product pins */
  price?: number;
  /** schema.org objects for this page, besides the site-wide ones */
  structuredData?: object[];
  /** Pages that only make sense to the visitor (cart, account) stay out of search results */
  noindex?: boolean;
}

/** A description cut to what search results show, at a word boundary */
export function summary(text: string, max = 160): string {
  return text.length > max ? `${text.slice(0, text.lastIndexOf(' ', max - 3))}…` : text;
}

/**
 * Title, description, canonical and language links, social sharing tags and structured data of
 * the current page. Static pages describe themselves in their route (`data: { seo: 'about' }`, with
 * texts under `seo.about` in the dictionary); the product and catalog pages call `setPage`.
 */
@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);
  private readonly language = inject(LanguageService).currentLanguageCode();

  init(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const seo = this.deepestRoute(this.router.routerState.snapshot.root).data['seo'] as string | undefined;
      if (!seo) return;
      this.setPage({
        title: this.i18n.t(`seo.${seo}.title`),
        description: this.i18n.t(`seo.${seo}.description`),
        noindex: seo === 'private' || seo === 'notFound',
        structuredData: seo === 'home' ? [this.website()] : [],
      });
    });
  }

  setPage(page: PageSeo): void {
    const path = page.path ?? this.router.url;
    const url = this.absoluteUrl(this.language, path);
    const fullTitle = page.title.includes(SITE_NAME) ? page.title : `${page.title} | ${SITE_NAME}`;
    const image = page.image ?? DEFAULT_IMAGE;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ name: 'robots', content: page.noindex ? 'noindex, follow' : 'index, follow' });

    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:type', content: page.type ?? 'website' });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:locale', content: OG_LOCALES[this.language] });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    if (page.price) {
      this.meta.updateTag({ property: 'product:price:amount', content: page.price.toFixed(2) });
      this.meta.updateTag({ property: 'product:price:currency', content: 'EUR' });
      this.meta.updateTag({ property: 'og:availability', content: 'instock' });
    } else {
      ['product:price:amount', 'product:price:currency', 'og:availability'].forEach((name) => this.meta.removeTag(`property="${name}"`));
    }

    // Canonical and the same page in every language; x-default is the Dutch page
    this.replaceHead('link[data-seo]', [
      { rel: 'canonical', href: url },
      ...AVAILABLE_LANGUAGES.map(({ code }) => ({ rel: 'alternate', hreflang: code, href: this.absoluteUrl(code, path) })),
      { rel: 'alternate', hreflang: 'x-default', href: this.absoluteUrl(DEFAULT_LANGUAGE, path) },
    ]);

    this.document.head.querySelectorAll('script[data-seo]').forEach((script) => script.remove());
    for (const data of [this.organization(), ...(page.structuredData ?? [])]) {
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', '');
      script.textContent = JSON.stringify({ '@context': 'https://schema.org', ...data });
      this.document.head.appendChild(script);
    }
  }

  absoluteUrl(language: string, path: string): string {
    return `${environment.siteUrl}/${language}${path === '/' ? '' : path}`;
  }

  private replaceHead(selector: string, links: Record<string, string>[]): void {
    this.document.head.querySelectorAll(selector).forEach((link) => link.remove());
    for (const attributes of links) {
      const link = this.document.createElement('link');
      Object.entries(attributes).forEach(([name, value]) => link.setAttribute(name, value));
      link.setAttribute('data-seo', '');
      this.document.head.appendChild(link);
    }
  }

  private organization(): object {
    return {
      '@type': 'OnlineStore',
      '@id': `${environment.siteUrl}/#organization`,
      name: SITE_NAME,
      legalName: COMPANY.legalName,
      vatID: COMPANY.vatId,
      identifier: { '@type': 'PropertyValue', propertyID: 'KvK', value: COMPANY.kvk },
      url: environment.siteUrl,
      logo: 'https://genstorageaccount3116.blob.core.windows.net/printme-images/logo.svg',
      image: DEFAULT_IMAGE,
      email: 'support@printmeart.nl',
      address: { '@type': 'PostalAddress', addressLocality: "'s-Hertogenbosch", addressCountry: 'NL' },
      areaServed: 'NL',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@printmeart.nl',
        availableLanguage: ['nl', 'en'],
      },
      description: this.i18n.t('seo.home.description'),
    };
  }

  private website(): object {
    return {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: this.absoluteUrl(this.language, '/'),
      inLanguage: this.language,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.absoluteUrl(this.language, '/products')}?searchTerm={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };
  }

  private deepestRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    return route.firstChild ? this.deepestRoute(route.firstChild) : route;
  }
}
