import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { CartService } from '../../services/cart/cart.service';

/**
 * Login component for BFF-style authentication.
 * Renders a login button that triggers backend OAuth flow.
 */
@Component({
  selector: 'app-login',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cartService = inject(CartService);

  currentYear = new Date().getFullYear();
  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.syncCartAndNavigate('/');
      return;
    }

    // Check for OAuth callback (user returned from Google)
    // The BFF redirects back to returnUrl after setting the cookie
    this.authService.checkAuthState().subscribe((state) => {
      if (state.isAuthenticated) {
        // Get the intended destination or default to home
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.syncCartAndNavigate(returnUrl);
      }
    });
  }

  /**
   * Initiates Google OAuth login via BFF.
   * User is redirected to Google, then back to BFF callback,
   * then finally back to Angular app with session cookie set.
   */
  signIn(): void {
    this.isLoading = true;
    this.error = null;

    // Get current URL to return to after login
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

    // Redirect to BFF login endpoint
    this.authService.login(returnUrl);
  }

  /**
   * Syncs cart with backend after login and navigates to target URL.
   */
  private syncCartAndNavigate(targetUrl: string): void {
    this.cartService.syncCartAfterLogin().subscribe({
      next: () => this.router.navigate([targetUrl]),
      error: () => this.router.navigate([targetUrl]), // Navigate even if sync fails
    });
  }
}
