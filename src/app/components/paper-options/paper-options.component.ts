import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OptionGroupDto } from '../../models/product';
import { PAPER_TIERS, PaperPage, PaperChoice, PaperText, PaperTier, paperName, paperPath, paperText, papersOfTier } from '../../papers/papers';
import { LanguageService } from '../../services/i18n/language.service';
import { TranslatePipe } from '../../services/i18n/translate.pipe';

/** A paper as its row and its detail card show it */
interface PaperRow {
  paper: PaperPage;
  name: string;
  text: PaperText;
}

/** What the detail card is about: a paper, or our studio's pick */
type Detail = PaperRow | 'studio';

let instances = 0;

/** The paper chooser: first the tier, which sets the price, then who picks the paper in it: our studio or the customer */
@Component({
  selector: 'app-paper-options',
  imports: [TranslatePipe, RouterLink, NgTemplateOutlet],
  templateUrl: './paper-options.component.html',
  styleUrl: './paper-options.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'close()', '(document:click)': 'closeWhenOutside($event)' },
})
export class PaperOptionsComponent {
  group = input.required<OptionGroupDto>();
  choice = model.required<PaperChoice>();
  /** The backend option of the chosen tier */
  optionSelected = output<number>();

  private readonly language = inject(LanguageService).currentLanguageCode();
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  /** Names its radio groups: a page can show the chooser twice (phone and desktop) */
  readonly id = `paper-options-${instances++}`;

  /** The tiers this product is sold in */
  tiers = computed(() => PAPER_TIERS.filter((tier) => this.optionOf(tier)));
  papers = computed<PaperRow[]>(() =>
    papersOfTier(this.choice().tier).map((paper) => ({ paper, name: paperName(paper), text: paperText(paper, this.language) })),
  );
  /** All papers side by side, for those who want to compare */
  readonly papersLink = paperPath(this.language);

  /** The middle of the chosen tier's card, as a share of the width: where the dropdown lights up */
  tierAt = computed(() => {
    const tiers = this.tiers();
    return ((tiers.indexOf(this.choice().tier) + 0.5) / tiers.length) * 100;
  });

  /** The row of the paper the customer chose; none while our studio picks */
  chosenRow = computed(() => this.papers().find((row) => row.paper === this.choice().paper) ?? null);

  /** The list of step 2 is a dropdown: closed, it shows what is chosen */
  open = signal(false);
  /** The list is being walked with the keyboard */
  byKeys = false;
  /** The detail a phone shows in a sheet; a desktop shows it next to the row on hover */
  sheet = signal<Detail | null>(null);
  /** The paper each tier was left with, so a tier comes back the way the customer left it */
  private readonly leftWith = new Map<PaperTier['id'], PaperPage | null>();
  /** Counts the customer's tier changes: each one lights up the dropdown under the chosen tier */
  private readonly tierChanges = signal(0);
  /** The glow now showing; a new one for every tier change, none before the first */
  glows = computed(() => (this.tierChanges() ? [this.tierChanges()] : []));

  // Like the frame, the tier shown first is the chosen one, so the price includes it; also when another product takes this one's place
  private readonly chooseShownTier = effect(() => {
    const tiers = this.tiers();
    const unpriced = this.group().selectedOptionId == null;
    untracked(() => {
      const tier = this.choice().tier;
      if (!tiers.length) return;
      if (!tiers.includes(tier)) this.selectTier(tiers[0]);
      else if (unpriced) this.emitOption(tier);
    });
  });

  /** A tier comes back as it was left: with the paper chosen in it, or our studio's pick */
  selectTier(tier: PaperTier): void {
    const { tier: left, paper } = this.choice();
    if (tier === left && this.group().selectedOptionId != null) return;
    this.leftWith.set(left.id, paper);
    this.choice.set({ tier, paper: this.leftWith.get(tier.id) ?? null });
    this.emitOption(tier);
  }

  /** The customer's own change of tier, in the toggle */
  switchTier(tier: PaperTier): void {
    this.selectTier(tier);
    this.tierChanges.update((count) => count + 1);
  }

  /** null: our studio picks */
  selectPaper(paper: PaperPage | null): void {
    this.choice.update((choice) => ({ ...choice, paper }));
  }

  /** The sheet's button: take what it shows */
  chooseShown(detail: Detail): void {
    this.selectPaper(detail === 'studio' ? null : detail.paper);
    this.close();
  }

  /** A row of the list: a tap or click takes it and closes the list; the arrow keys walk through it and leave it open */
  pick(paper: PaperPage | null): void {
    this.selectPaper(paper);
    if (!this.byKeys) this.open.set(false);
  }

  close(): void {
    this.open.set(false);
    this.sheet.set(null);
  }

  closeWhenOutside(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }

  paperLink(paper: PaperPage): string {
    return paperPath(this.language, paper.slug);
  }

  private optionOf(tier: PaperTier) {
    return this.group().options.find((option) => option.value === tier.grade);
  }

  private emitOption(tier: PaperTier): void {
    const option = this.optionOf(tier);
    if (option) this.optionSelected.emit(option.id);
  }
}
