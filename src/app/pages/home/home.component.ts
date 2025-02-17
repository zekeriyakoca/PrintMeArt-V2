import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { CatagoryCardComponent } from '../../components/catagory-card/catagory-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, CatagoryCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  @Input() @HostBinding('class') class: string = '';
}
