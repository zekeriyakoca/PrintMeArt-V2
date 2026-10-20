import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bootstrap } from '../../services/bootstrap/bootstrap';

@Component({
  selector: 'app-how-we-work',
  imports: [RouterLink],
  templateUrl: './how-we-work.component.html',
  styleUrl: './how-we-work.component.scss',
  standalone: true,
})
export class HowWeWorkComponent {
  readonly shippingInfo = inject(Bootstrap).shippingInfo;
}
