import { RouterLink } from '@angular/router';
import { LinkPipe } from '../../shared/link.pipe';
import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component } from '@angular/core';

@Component({
  selector: 'app-visit-us',
  imports: [RouterLink, LinkPipe, TranslatePipe],
  templateUrl: './visit-us.component.html',
  styleUrl: './visit-us.component.scss'
})
export class VisitUsComponent {

}
