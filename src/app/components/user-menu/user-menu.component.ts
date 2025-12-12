import {
  Component,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-menu.component.html',
})
export class UserMenuComponent {
  private auth = inject(AuthenticationService);
  private router = inject(Router);
  private elementRef = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);

  isOpen = signal(false);

  isAuthenticated = computed(() => this.auth.isAuthenticated());
  user = computed(() => this.auth.currentUser());

  initials = computed(() => {
    const user = this.user();
    const name = user?.name?.trim();
    if (!name) return 'U';

    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? 'U';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return (first + last).toUpperCase();
  });

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  goToLogin(): void {
    this.close();
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.close();
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const target = event.target as Node | null;
    if (!target) return;

    if (!this.elementRef.nativeElement.contains(target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
