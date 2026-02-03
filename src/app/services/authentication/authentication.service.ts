import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  profilePictureUrl?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

const SESSION_STORAGE_KEY = 'bff_session_id';

/**
 * BFF-style authentication service.
 * - No JWT handling in the browser
 * - Uses HTTP-only session cookies managed by the backend
 * - Falls back to x-sessionid header for cross-domain scenarios
 * - All API calls use withCredentials: true
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  // Auth state using signals for Angular reactivity
  public currentUser = signal<User | null>(null);
  public isLoading = signal<boolean>(true);

  // BehaviorSubject for components that need Observable
  private authState$ = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  private get bffUrl(): string {
    // Use BFF URL - in production this should point to your BFF backend
    return (
      (environment as any).serviceUrls?.['bff'] ||
      (environment as any).apiUrl ||
      ''
    );
  }

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Check for session_id in URL (from OAuth callback redirect)
      this.captureSessionIdFromUrl();
      this.checkAuthState().subscribe();
    } else {
      this.isLoading.set(false);
    }
  }

  /**
   * Captures session_id from URL query params (set by OAuth callback)
   * and stores it in localStorage for cross-domain auth.
   */
  private captureSessionIdFromUrl(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      // Store the session ID
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);

      // Remove session_id from URL (clean up)
      urlParams.delete('session_id');
      const newUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      console.log('[Auth] Session ID captured from OAuth callback');
    }
  }

  /**
   * Gets the stored session ID (for cross-domain scenarios).
   */
  getSessionId(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(SESSION_STORAGE_KEY);
  }

  /**
   * Initiates login by redirecting to BFF's Google OAuth endpoint.
   * The BFF handles the entire OAuth flow and sets the session cookie.
   */
  login(returnUrl: string = '/'): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const loginUrl = `${this.bffUrl}/api/auth/login?returnUrl=${encodeURIComponent(
      window.location.origin + returnUrl,
    )}`;
    window.location.href = loginUrl;
  }

  /**
   * Logs out by calling the BFF logout endpoint.
   * This clears the session cookie server-side.
   */
  logout(): Observable<void> {
    return this.http
      .post<void>(
        `${this.bffUrl}/api/auth/logout`,
        {},
        { withCredentials: true },
      )
      .pipe(
        tap(() => {
          // Clear stored session ID
          localStorage.removeItem(SESSION_STORAGE_KEY);
          this.clearAuthState();
          this.router.navigate(['/login']);
        }),
        catchError((error) => {
          console.error('Logout failed:', error);
          localStorage.removeItem(SESSION_STORAGE_KEY);
          this.clearAuthState();
          this.router.navigate(['/login']);
          return of(undefined);
        }),
      );
  }

  /**
   * Checks current authentication state by calling BFF's /me endpoint.
   * Called on app initialization and after OAuth callback.
   */
  checkAuthState(): Observable<AuthState> {
    if (!isPlatformBrowser(this.platformId)) {
      return of({ isAuthenticated: false, user: null });
    }

    this.isLoading.set(true);

    return this.http
      .get<{
        isAuthenticated: boolean;
        user?: User;
      }>(`${this.bffUrl}/api/auth/me`, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response.isAuthenticated && response.user) {
            this.setAuthState(response.user);
          } else {
            this.clearAuthState();
          }
          this.isLoading.set(false);
        }),
        map((response) => ({
          isAuthenticated: response.isAuthenticated,
          user: response.user || null,
        })),
        catchError((error) => {
          console.error('Auth check failed:', error);
          this.clearAuthState();
          this.isLoading.set(false);
          return of({ isAuthenticated: false, user: null });
        }),
      );
  }

  /**
   * Refreshes the session. Call this periodically to extend session lifetime.
   */
  refreshSession(): Observable<AuthState> {
    if (!isPlatformBrowser(this.platformId)) {
      return of({ isAuthenticated: false, user: null });
    }

    return this.http
      .post<{
        isAuthenticated: boolean;
        user?: User;
      }>(`${this.bffUrl}/api/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response.isAuthenticated && response.user) {
            this.setAuthState(response.user);
          } else {
            this.clearAuthState();
          }
        }),
        map((response) => ({
          isAuthenticated: response.isAuthenticated,
          user: response.user || null,
        })),
        catchError((error) => {
          console.error('Session refresh failed:', error);
          return of({ isAuthenticated: false, user: null });
        }),
      );
  }

  /**
   * Returns the auth state as an Observable for components that need it.
   */
  getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  /**
   * Returns whether user is currently authenticated.
   */
  isAuthenticated(): boolean {
    return this.authState$.value.isAuthenticated;
  }

  private setAuthState(user: User): void {
    // Normalize user data - map 'picture' to 'profilePictureUrl' for consistency
    const normalizedUser: User = {
      ...user,
      profilePictureUrl: user.profilePictureUrl || user.picture,
    };
    this.currentUser.set(normalizedUser);
    this.authState$.next({ isAuthenticated: true, user: normalizedUser });
  }

  private clearAuthState(): void {
    this.currentUser.set(null);
    this.authState$.next({ isAuthenticated: false, user: null });
  }
}
