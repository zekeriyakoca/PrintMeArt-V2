import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/shared/icon/icon.component';

@Component({
  selector: 'app-not-found',
  imports: [TranslatePipe, RouterLink, IconComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {}
