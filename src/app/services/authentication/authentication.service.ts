import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly socialAuth = inject(SocialAuthService, { optional: true });

  private readonly AUTH_TOKEN_KEY = 'authToken';
  private readonly CURRENT_USER_KEY = 'currentUser';

  private readonly token = signal<string>('');

  public currentUser = signal<User | null>(null);

  constructor() {
    this.hydrateFromStorage();
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
      } else {
        localStorage.setItem(this.AUTH_TOKEN_KEY, normalized);
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

    if (isPlatformBrowser(this.platformId)) {
      this.socialAuth?.signOut().catch(() => {
        // Ignore sign-out errors
      });
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
