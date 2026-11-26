import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OptionGroupDto } from '../../models/product';
import { PAPER_TIERS, PaperChoice, PaperPage, PaperTier, paperName, paperPath, paperText, papersOfTier } from '../../papers/papers';
import { LanguageService } from '../../services/i18n/language.service';
import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { RadioTileComponent } from '../shared/radio-tile/radio-tile.component';

let instances = 0;

/** The paper chooser: first the tier, which sets the price, then who picks the paper in it: our studio or the customer */
@Component({
  selector: 'app-paper-options',
  imports: [TranslatePipe, RouterLink, RadioTileComponent],
  templateUrl: './paper-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaperOptionsComponent {
  group = input.required<OptionGroupDto>();
  choice = model.required<PaperChoice>();
  /** The backend option of the chosen tier */
  optionSelected = output<number>();

  private readonly language = inject(LanguageService).currentLanguageCode();
  /** Names its radio groups: a page can show the chooser twice (phone and desktop) */
  readonly id = `paper-options-${instances++}`;

  /** The tiers this product is sold in */
  tiers = computed(() => PAPER_TIERS.filter((tier) => this.optionOf(tier)));
  papers = computed(() =>
    papersOfTier(this.choice().tier).map((paper) => ({ paper, text: paperText(paper, this.language) })),
  );
  /** For those who want detail: the chosen paper's page, or all papers */
  detailLink = computed(() => paperPath(this.language, this.choice().paper?.slug));
  chosenPaperName = computed(() => paperName(this.choice().paper));

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

  /** A new tier starts with the studio's pick: the paper chosen before is not in it */
  selectTier(tier: PaperTier): void {
    if (tier === this.choice().tier && this.group().selectedOptionId != null) return;
    this.choice.set({ tier, paper: null });
    this.emitOption(tier);
  }

  /** null: our studio picks */
  selectPaper(paper: PaperPage | null): void {
    this.choice.update((choice) => ({ ...choice, paper }));
  }

  private optionOf(tier: PaperTier) {
    return this.group().options.find((option) => option.value === tier.grade);
  }

  private emitOption(tier: PaperTier): void {
    const option = this.optionOf(tier);
    if (option) this.optionSelected.emit(option.id);
  }
}
