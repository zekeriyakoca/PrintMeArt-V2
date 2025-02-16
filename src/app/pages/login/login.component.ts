import { Component } from '@angular/core';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { CommonModule } from '@angular/common';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import {
  AuthenticationService,
  User,
} from '../../services/authentication/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, GoogleSigninButtonModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  user: SocialUser | null = null;
  constructor(
    private authService: SocialAuthService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    this.authService.authState.subscribe((user) => {
      if (user) {
        this.authenticationService.setToken(user.idToken.split('Bearer ')[0]);
        this.authenticationService.currentUser.set({
          id: user.id,
          name: user.name,
          email: user.email,
          role: '',
        } as User);
        this.router.navigate(['/']);
      }
    });
  }
  signOut(): void {
    this.authService.signOut();
  }
}
