import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import {
  GoogleLoginProvider,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  Observable,
  of,
  switchMap,
  take,
  catchError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly socialAuth = inject(SocialAuthService, { optional: true });

  private readonly AUTH_TOKEN_KEY = 'authToken';
  private readonly CURRENT_USER_KEY = 'currentUser';
  private readonly TOKEN_EXPIRY_KEY = 'tokenExpiry';

  private readonly token = signal<string>('');
  private refreshInProgress$ = new BehaviorSubject<boolean>(false);
  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  public currentUser = signal<User | null>(null);

  constructor() {
    this.hydrateFromStorage();
    this.setupProactiveRefresh();
  }

  private hydrateFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const token = localStorage.getItem(this.AUTH_TOKEN_KEY) ?? '';
      this.token.set(token);

      const rawUser = localStorage.getItem(this.CURRENT_USER_KEY);
      if (rawUser) {
        this.currentUser.set(JSON.parse(rawUser) as User);
      }
    } catch {
      // Ignore storage/parse errors
    }
  }

  public getToken(): string {
    return this.token();
  }

  public setToken(token: string) {
    const normalized = token
      ? token.startsWith('Bearer ')
        ? token
        : `Bearer ${token}`
      : '';

    this.token.set(normalized);

    if (!isPlatformBrowser(this.platformId)) return;

    try {
      if (!normalized) {
        localStorage.removeItem(this.AUTH_TOKEN_KEY);
        this.clearTokenExpiry();
      } else {
        localStorage.setItem(this.AUTH_TOKEN_KEY, normalized);
        this.setTokenExpiry();
      }
    } catch {
      // Ignore storage errors
    }
  }

  public setCurrentUser(user: User | null): void {
    this.currentUser.set(user);

    if (!isPlatformBrowser(this.platformId)) return;

    try {
      if (!user) {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        return;
      }

      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } catch {
      // Ignore storage errors
    }
  }

  public isAuthenticated(): boolean {
    // return true; // Temporary change
    const token = this.token().trim();
    if (!token) return false;
    return token.startsWith('Bearer ') ? token.length > 'Bearer '.length : true;
  }
  public logout() {
    this.setToken('');
    this.setCurrentUser(null);
    this.clearTokenExpiry();

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.socialAuth?.signOut().catch(() => {
        // Ignore sign-out errors
      });
    }
  }

  /**
   * Silently refresh the Google token.
   * Returns an observable that emits the new token or throws on failure.
   */
  public refreshToken(): Observable<string> {
    if (!isPlatformBrowser(this.platformId) || !this.socialAuth) {
      return of('');
    }

    // If refresh is already in progress, wait for it to complete
    if (this.refreshInProgress$.value) {
      return this.refreshInProgress$.pipe(
        filter((inProgress) => !inProgress),
        take(1),
        switchMap(() => of(this.getToken())),
      );
    }

    this.refreshInProgress$.next(true);

    return new Observable<string>((subscriber) => {
      // Subscribe to authState to get the new user/token
      const authStateSub = this.socialAuth!.authState
        .pipe(
          filter((user) => !!user?.idToken),
          take(1),
        )
        .subscribe({
          next: (user) => {
            const newToken = user.idToken ?? '';
            this.setToken(newToken);
            subscriber.next(this.getToken());
            subscriber.complete();
            this.refreshInProgress$.next(false);
          },
          error: (err) => {
            subscriber.error(err);
            this.refreshInProgress$.next(false);
          },
        });

      // Trigger the refresh
      this.socialAuth!.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID).catch(
        (err) => {
          authStateSub.unsubscribe();
          subscriber.error(err);
          this.refreshInProgress$.next(false);
        },
      );

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!subscriber.closed) {
          authStateSub.unsubscribe();
          subscriber.error(new Error('Token refresh timeout'));
          this.refreshInProgress$.next(false);
        }
      }, 10000);
    });
  }

  /**
   * Attempt to refresh the token, returning the new token or empty string on failure.
   */
  public async tryRefreshToken(): Promise<string> {
    try {
      return await firstValueFrom(
        this.refreshToken().pipe(catchError(() => of(''))),
      );
    } catch {
      return '';
    }
  }

  private setupProactiveRefresh(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check token expiry every minute
    this.refreshInterval = setInterval(() => {
      if (!this.isAuthenticated()) return;

      const expiry = this.getTokenExpiry();
      if (!expiry) return;

      const now = Date.now();
      const timeUntilExpiry = expiry - now;
      const fiveMinutes = 5 * 60 * 1000;

      // Refresh if token expires within 5 minutes
      if (timeUntilExpiry > 0 && timeUntilExpiry < fiveMinutes) {
        this.refreshToken().pipe(take(1)).subscribe();
      }
    }, 60 * 1000);
  }

  private setTokenExpiry(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      // Google ID tokens typically expire in 1 hour
      const expiry = Date.now() + 55 * 60 * 1000; // 55 minutes from now
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
    } catch {
      // Ignore storage errors
    }
  }

  private getTokenExpiry(): number | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    try {
      const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry, 10) : null;
    } catch {
      return null;
    }
  }

  private clearTokenExpiry(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePictureUrl?: string;
}
