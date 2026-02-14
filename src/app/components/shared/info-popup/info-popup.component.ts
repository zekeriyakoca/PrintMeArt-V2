import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-info-popup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative group"
      [attr.aria-label]="ariaLabel()"
    >
      <ng-content />

      @if (!disabled()) {
      <div
        class="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 z-50 mr-3 w-[26rem] max-w-[85vw] origin-right scale-95 opacity-0 transition-all duration-150 ease-out group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:scale-100 group-focus-within:opacity-100"
        role="tooltip"
      >
        <div
          class="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50"
        >
          <ng-content select="[popup]" />
        </div>
        <span
          class="absolute top-1/2 -right-1.5 -translate-y-1/2 h-3 w-3 rotate-45 border-r border-t border-slate-200 bg-white"
          aria-hidden="true"
        ></span>
      </div>
      }
    </div>
  `,
})
export class InfoPopupComponent {
  readonly ariaLabel = input<string>('More information');
  readonly disabled = input(false);
}
