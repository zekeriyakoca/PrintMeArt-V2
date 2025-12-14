import { Component, DestroyRef, NgZone, inject } from '@angular/core';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { CommonModule } from '@angular/common';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import {
  AuthenticationService,
  User,
} from '../../services/authentication/authentication.service';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  imports: [CommonModule, GoogleSigninButtonModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  user: SocialUser | null = null;
  constructor(
    private authService: SocialAuthService,
    private authenticationService: AuthenticationService,
    private router: Router,
  ) {
    this.authService.authState
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        if (!user) return;

        this.ngZone.run(() => {
          this.authenticationService.setToken(user.idToken);
          this.authenticationService.setCurrentUser({
            id: user.id,
            name: user.name,
            email: user.email,
            role: '',
            profilePictureUrl: user.photoUrl,
          } as User);

          this.router.navigate(['/']);
        });
      });
  }
  signOut(): void {
    this.authService.signOut();
  }
}
