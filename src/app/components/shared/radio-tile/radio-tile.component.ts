import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * One choice of a radio group, drawn as a tile: a real radio button, so the arrow keys move through its group.
 * The tile is a Tailwind group: content marks its chosen state with group-has-checked:…
 */
@Component({
  selector: 'app-radio-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <label
      class="group relative flex h-full cursor-pointer overflow-hidden rounded-[10px] border border-slate-200 bg-white text-slate-700 transition-colors [-webkit-tap-highlight-color:transparent] hover:border-slate-300 hover:bg-[#fafbfc] has-checked:border-[#384f8c] has-checked:bg-[#384f8c]/[0.035] has-checked:shadow-[inset_0_0_0_1px_#384f8c] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[#384f8c]/45"
    >
      <input type="radio" class="sr-only" [name]="name()" [checked]="checked()" (change)="chosen.emit()" />
      <ng-content />
    </label>
  `,
})
export class RadioTileComponent {
  /** The radio group it belongs to; unique on the page */
  readonly name = input.required<string>();
  readonly checked = input.required<boolean>();
  readonly chosen = output<void>();
}
