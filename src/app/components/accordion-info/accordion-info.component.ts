import { Component, computed, inject, input } from '@angular/core';

import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { AccordionItem } from '../../models/accordion-item';
import { Bootstrap, ShippingInfo } from '../../services/bootstrap/bootstrap';
import { TranslationService } from '../../services/i18n/translation.service';

const defaultData = (info: ShippingInfo | null, t: TranslationService['t']): AccordionItem[] => [
  {
    name: t('info.quality.title'),
    content: `<div class="quality-rows">
      ${['info.quality.giclee', 'info.quality.archival', 'info.quality.borders', 'info.quality.care']
        .map((key) => `<div class="quality-row">
        <span class="row-icon" aria-hidden="true">></span>
        <span class="row-text">${t(key)}</span>
      </div>`)
        .join('')}
    </div>`,
  },
  {
    name: t('info.care.title'),
    content: t('info.care.text'),
  },
  {
    name: t('info.colours.title'),
    content: t('info.colours.text'),
  },
  {
    name: t('info.faq.title'),
    content: `
    <ul class="list-disc list-inside leading-7">
    ${info ? `<li><b>${t('info.faq.returnQ')}</b>
      </br>${t('info.faq.returnA', { days: info.returnDays })}
    </li>
    <li>
    <b>${t('info.faq.shippingQ')}</b>
    </br>${t('info.faq.shippingA', { days: info.deliveryDays })}
    </li>` : ''}
    <li>
    <b>${t('info.faq.customQ')}</b>
    </br>${t('info.faq.customA')}
    </li>
    <li>
    <b>${t('info.faq.framesQ')}</b>
    </br>${t('info.faq.framesA')}
    </li>
  </ul>
    `,
  },
];

@Component({
  selector: 'app-accordion-info',
  standalone: true,
  imports: [],
  templateUrl: './accordion-info.component.html',
  styleUrls: ['./accordion-info.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('expanded', style({ height: '*', opacity: 1 })),
      state('collapsed', style({ height: '0', opacity: 0 })),
      transition('expanded <=> collapsed', animate('200ms ease-in-out')),
    ]),
  ],
})
export class AccordionInfoComponent {
  private readonly bootstrap = inject(Bootstrap);
  private readonly i18n = inject(TranslationService);

  panelClassName = input<string>(
    'p-4 pt-3 last:pb-0 text-slate-700 text-sm leading-6 bg-white border-t border-slate-200',
  );
  data = input<AccordionItem[]>([]);
  openStates: { [key: number]: boolean } = {};
  allData = computed(() => [
    ...defaultData(this.bootstrap.shippingInfo(), (key, params) => this.i18n.t(key, params)),
    ...(this.data() ?? []),
  ]);

  toggleAccordion(index: number) {
    this.openStates[index] = !this.openStates[index];
  }

  isOpen(index: number): boolean {
    return this.openStates[index] || false;
  }
}
