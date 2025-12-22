import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="relative inline-flex group cursor-help"
      [attr.tabindex]="tabIndex()"
      [attr.aria-label]="ariaLabel()"
    >
      <ng-content />

      <span
        class="pointer-events-none absolute right-0 bottom-full z-50 mb-3 w-56 origin-bottom-right scale-95 opacity-0 transition-all duration-150 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100"
        role="tooltip"
      >
        <span
          class="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50"
        >
          <ng-content select="[tooltip]" />
        </span>
        <span
          class="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-slate-200 bg-white"
          aria-hidden="true"
        ></span>
      </span>
    </span>
  `,
})
export class TooltipComponent {
  readonly ariaLabel = input<string>('More information');
  readonly tabIndex = input<string | number>(0);
}
