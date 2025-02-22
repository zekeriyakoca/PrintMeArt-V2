import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
import { CollectionCardComponent } from '../../components/collection-card/collection-card.component';
import { OurServicesComponent } from '../../components/our-services/our-services.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [OurServicesComponent, CollectionCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  @Input() @HostBinding('class') class: string = '';

  categories = ['Art Prints', 'Nature and Landscapes', 'Posters', 'Abstract'];
}
