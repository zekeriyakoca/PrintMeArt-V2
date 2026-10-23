import { Component, inject, OnInit } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { IconComponent } from '../../components/shared/icon/icon.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly auth = inject(AuthenticationService);
  private readonly router = inject(Router);

  user = this.auth.currentUser;

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }
}
