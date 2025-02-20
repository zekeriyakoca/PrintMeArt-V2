import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { CatagoryCardComponent } from '../../components/collection-card/collection-card.component';
import { OurServicesComponent } from '../../components/our-services/our-services.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    CatagoryCardComponent,
    OurServicesComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  @Input() @HostBinding('class') class: string = '';
}
