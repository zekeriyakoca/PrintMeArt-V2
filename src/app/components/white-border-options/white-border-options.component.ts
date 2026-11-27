import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, ElementRef, Injector, afterNextRender, computed, inject, input, model, signal } from '@angular/core';
import {
  WHITE_BORDER_PRESETS,
  WHITE_BORDER_STEP_CM,
  WhiteBorder,
  WhiteBorderPresetId,
  whiteBorderFromCm,
  whiteBorderFromPreset,
  whiteBorderMaxCm,
} from '../../shared/white-border';

@Component({
  imports: [TranslatePipe],
  selector: 'app-white-border-options',
  templateUrl: './white-border-options.component.html',
  styleUrl: './white-border-options.component.scss',
})
export class WhiteBorderOptionsComponent {
  /** Print size in cm, as shown in the preview */
  widthCm = input.required<number>();
  heightCm = input.required<number>();
  border = model.required<WhiteBorder>();

  readonly step = WHITE_BORDER_STEP_CM;

  maxCm = computed(() => whiteBorderMaxCm(this.widthCm(), this.heightCm()));

  fillPercent = computed(() => (this.border().cm / this.maxCm()) * 100);

  valueText = computed(() => formatCm(this.border().cm));

  /** Each tile draws its preset at the real proportion of the chosen size */
  tiles = computed(() => {
    const w = this.widthCm();
    const h = this.heightCm();
    return WHITE_BORDER_PRESETS.map((preset) => {
      const border = whiteBorderFromPreset(preset.id, w, h);
      const side = (border.cm / w) * 100;
      const bottom = (border.bottomCm / w) * 100;
      return { id: preset.id, padding: `${side}% ${side}% ${bottom}%` };
    });
  });

  miniRatio = computed(() => `${this.widthCm()} / ${this.heightCm()}`);

  /** Phones in Preview & Design: the customer asked for a width of their own, so the slider shows */
  customOpen = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  /** Shows the slider and brings it into view, where the sheet is too short to show it */
  openCustom() {
    this.customOpen.set(true);
    afterNextRender(() => this.host.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), { injector: this.injector });
  }

  isCustom = computed(() => this.customOpen() || this.border().presetId === null);

  selectPreset(id: WhiteBorderPresetId) {
    this.customOpen.set(false);
    this.border.set(whiteBorderFromPreset(id, this.widthCm(), this.heightCm()));
  }

  onSlide(event: Event) {
    const cm = parseFloat((event.target as HTMLInputElement).value);
    this.border.set(whiteBorderFromCm(cm, this.widthCm(), this.heightCm()));
  }
}

/** 3, 1.5, 1.25: no trailing zeros */
function formatCm(cm: number): string {
  return `${parseFloat(cm.toFixed(2))}`;
}
