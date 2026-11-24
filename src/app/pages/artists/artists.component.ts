import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArtistSummaryDto } from '../../models/artist';
import { ApiService } from '../../services/api/api.service';
import { LanguageService } from '../../services/i18n/language.service';
import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { TranslationService } from '../../services/i18n/translation.service';
import { SeoService } from '../../services/seo/seo.service';
import { artistPath, MIN_INDEXED_WORKS } from '../../shared/artist-path';
import { environment } from '../../../environments/environment';

/** The masters shown as cards above the list, in this order, when they have prints */
const FEATURED = ['vincent-van-gogh', 'claude-monet', 'winslow-homer', 'hendrick-avercamp', 'j-m-w-turner', 'pierre-auguste-renoir', 'thomas-moran', 'johannes-vermeer'];

/** 'Gogh' for Vincent van Gogh: the first letter that sorts, without accents */
function letterOf(artist: ArtistSummaryDto): string {
  const letter = artist.sortName.normalize('NFKD').replace(/[^A-Za-z]/g, '').charAt(0).toUpperCase();
  return letter || '#';
}

@Component({
  selector: 'app-artists',
  imports: [TranslatePipe, RouterLink],
  templateUrl: './artists.component.html',
  styleUrl: './artists.component.scss',
})
export class ArtistsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  private readonly i18n = inject(TranslationService);
  private readonly language = inject(LanguageService).currentLanguageCode();
  private readonly dutch = this.language === 'nl';

  artists = signal<ArtistSummaryDto[]>([]);
  query = signal('');

  /** Sticky A–Z bar state: stuck to the top, the letter in view, how far down the page we are */
  stuck = signal(false);
  active = signal('');
  progress = signal(0);
  private readonly document = inject(DOCUMENT);
  readonly link = (slug: string) => artistPath(this.language, slug);
  readonly big = MIN_INDEXED_WORKS;

  prints = computed(() => this.artists().reduce((sum, a) => sum + a.productCount, 0));
  featured = computed(() => FEATURED.map((slug) => this.artists().find((a) => a.slug === slug)).filter((a): a is ArtistSummaryDto => !!a));
  heroImage = computed(() => this.featured()[0]?.image?.large);

  letters = computed(() => {
    const q = this.query().trim().toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
    const groups = new Map<string, ArtistSummaryDto[]>();
    for (const artist of this.artists()) {
      if (q && !artist.name.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').includes(q)) continue;
      const letter = letterOf(artist);
      groups.set(letter, [...(groups.get(letter) ?? []), artist]);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([letter, artists]) => ({ letter, artists }));
  });
  shownCount = computed(() => this.letters().reduce((sum, l) => sum + l.artists.length, 0));

  @HostListener('window:scroll')
  onScroll() {
    const bar = this.document.querySelector<HTMLElement>('nav.az');
    if (!bar) return;
    this.stuck.set(bar.getBoundingClientRect().top <= 1);
    let current = '';
    for (const { letter } of this.letters()) {
      const section = this.document.getElementById('l-' + letter);
      if (section && section.getBoundingClientRect().top <= 140) current = letter;
    }
    if (current !== this.active()) {
      this.active.set(current);
      // keep the highlighted item visible when the bar scrolls sideways (phones)
      setTimeout(() => {
        const strip = bar.querySelector<HTMLElement>('.az__letters');
        const item = strip?.querySelector<HTMLElement>('a.on');
        if (strip && item) strip.scrollTo({ left: item.offsetLeft - strip.clientWidth / 2 + item.clientWidth / 2, behavior: 'smooth' });
      });
    }
    const root = this.document.documentElement;
    this.progress.set(Math.min(1, root.scrollTop / Math.max(1, root.scrollHeight - root.clientHeight)));
  }

  years(artist: ArtistSummaryDto): string {
    const { BirthYear: born, DeathYear: died } = artist.facts;
    return born && died ? `${born}–${died}` : '';
  }

  movement(artist: ArtistSummaryDto): string {
    return (this.dutch && artist.facts['Movement_nl']) || artist.facts['Movement'] || '';
  }

  ngOnInit() {
    this.api.getArtists().subscribe((artists) => {
      this.artists.set(artists);
      const path = artistPath(this.language);
      const url = this.seo.absoluteUrl(this.language, path);
      const params = { count: artists.length, prints: this.prints() };
      this.seo.setPage({
        title: this.i18n.t('artists.seo.title'),
        description: this.i18n.t('artists.seo.description', params),
        path,
        paths: { nl: artistPath('nl'), en: artistPath('en') },
        image: this.heroImage(),
        structuredData: [
          {
            '@type': 'CollectionPage',
            url,
            name: this.i18n.t('artists.seo.title'),
            inLanguage: this.language,
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: artists.length,
              itemListElement: artists.map((artist, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: artist.name,
                url: this.seo.absoluteUrl(this.language, artistPath(this.language, artist.slug)),
              })),
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'PrintMeArt', item: `${environment.siteUrl}/${this.language}` },
              { '@type': 'ListItem', position: 2, name: this.i18n.t('artist.index'), item: url },
            ],
          },
        ],
      });
    });
  }
}
