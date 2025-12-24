import { Component, input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { AccordionItem } from '../../models/accordion-item';

const DEFAULT_DATA: AccordionItem[] = [
  {
    name: 'Print Quality & Care',
    content: `<div class="quality-rows">
      <div class="quality-row">
        <span class="row-icon" aria-hidden="true">></span>
        <span class="row-text">Giclée printed on 200 g/m² fine art paper (matte).</span>
      </div>
      <div class="quality-row">
        <span class="row-icon" aria-hidden="true">></span>
        <span class="row-text">Archival quality for long-lasting color and durability</span>
      </div>
      <div class="quality-row">
        <span class="row-icon" aria-hidden="true">></span>
        <span class="row-text">3.0 cm blank borders for easy framing</span>
      </div>
      <div class="quality-row">
        <span class="row-icon" aria-hidden="true">></span>
        <span class="row-text">Wipe clean with a soft, dry cloth to maintain its pristine condition</span>
      </div>
    </div>`,
  },
  {
    name: 'Customer Care',
    content:
      'We are a family-run business in Den Bosch, dedicated to bringing you the best in art prints. Each piece is printed and framed with love and care, ensuring that you receive a product that is not only beautiful but also crafted with attention to detail. Visit us, enjoy a coffee, and see where the magic happens.',
  },
  {
    name: 'Vibrant Colors & Versatile Sizes',
    content:
      'Our printing process utilizes cutting-edge technology and the Giclée printmaking method for exceptional quality. Colors are independently verified to last over decades. Available in multiple sizes, our prints fit perfectly in any space. Personalize your artwork with various paper types to suit your style and decor needs. Each piece is crafted to meet your specifications, ensuring a unique addition to your home or office.',
  },
  {
    name: 'FAQ',
    content: `
    <ul class="list-disc list-inside leading-7">
    <li><b>Can I return or exchange my order?</b>
      </br>Yes, returns and exchanges are accepted within 30 days of purchase if the item is in its original condition.
    </li>
    <li>
    <b>How long does shipping take?</b>
    </br>Unframed prints ship within 2-4 days. Framed prints require an additional 7-8 days for processing.
    </li>
    <li>
    <b>Do you offer custom prints?</b>
    </br>Yes, we offer custom printing services. Contact us for more details.
    </li>
    <li>
    <b>What kind of frames do you offer?</b>
    </br>We provide a wide selection of wood and polystyrene frames in various styles and finishes.
    </li>
  </ul>
    `,
  },
];

@Component({
  selector: 'app-accordion-info',
  standalone: true,
  imports: [CommonModule],
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
export class AccordionInfoComponent implements OnInit, OnChanges {
  panelClassName = input<string>(
    'p-4 pt-3 last:pb-0 text-slate-700 text-sm leading-6 bg-white border-t border-slate-200',
  );
  data = input<AccordionItem[]>([]);
  openStates: { [key: number]: boolean } = {};
  allData: AccordionItem[] = [];

  ngOnInit() {
    this.setInitialOpenStates();
  }

  ngOnChanges() {
    this.allData = [...DEFAULT_DATA, ...(this.data() ?? [])];
    this.setInitialOpenStates();
  }

  private setInitialOpenStates() {
    this.allData.forEach((_, index) => {
      if (this.openStates[index] === undefined) {
        this.openStates[index] = false;
      }
    });
  }

  toggleAccordion(index: number) {
    this.openStates[index] = !this.openStates[index];
  }

  isOpen(index: number): boolean {
    return this.openStates[index] || false;
  }
}
