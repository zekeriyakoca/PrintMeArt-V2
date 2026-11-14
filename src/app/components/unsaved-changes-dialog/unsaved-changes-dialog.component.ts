import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { afterNextRender, Component, ElementRef, input, output, viewChild } from '@angular/core';

/** Asks to save an edited design before Preview & Design closes */
@Component({
  imports: [TranslatePipe],
  selector: 'app-unsaved-changes-dialog',
  templateUrl: './unsaved-changes-dialog.component.html',
  styleUrl: './unsaved-changes-dialog.component.scss',
})
export class UnsavedChangesDialogComponent {
  saving = input(false);
  save = output<void>();
  keepEditing = output<void>();
  discard = output<void>();

  private saveButton = viewChild<ElementRef<HTMLButtonElement>>('saveButton');

  constructor() {
    afterNextRender(() => this.saveButton()?.nativeElement.focus());
  }
}
