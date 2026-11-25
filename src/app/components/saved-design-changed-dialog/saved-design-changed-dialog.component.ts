import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { afterNextRender, Component, ElementRef, HostListener, output, viewChild } from '@angular/core';

/** Asks before a size, frame or mat change drops the design the customer already saved */
@Component({
  imports: [TranslatePipe],
  selector: 'app-saved-design-changed-dialog',
  templateUrl: './saved-design-changed-dialog.component.html',
  styleUrls: ['../unsaved-changes-dialog/unsaved-changes-dialog.component.scss', './saved-design-changed-dialog.component.scss'],
})
export class SavedDesignChangedDialogComponent {
  keepDesign = output<void>();
  change = output<void>();

  private keepButton = viewChild<ElementRef<HTMLButtonElement>>('keepButton');

  constructor() {
    afterNextRender(() => this.keepButton()?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.keepDesign.emit();
  }
}
