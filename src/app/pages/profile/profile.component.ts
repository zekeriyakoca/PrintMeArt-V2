import { Component, inject, signal, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { UserService, Address } from '../../services/user/user.service';
import { IconComponent } from '../../components/shared/icon/icon.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly auth = inject(AuthenticationService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  user = this.auth.currentUser;
  addresses = signal<Address[]>([]);
  isLoading = signal(false);
  activeTab = signal<'profile' | 'addresses' | 'preferences'>('profile');

  // Form state
  editMode = signal(false);
  firstName = signal('');
  lastName = signal('');
  phone = signal('');

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadAddresses();
    this.initFormFromUser();
  }

  private initFormFromUser(): void {
    const user = this.user();
    if (user) {
      const nameParts = (user.name || '').split(' ');
      this.firstName.set(nameParts[0] || '');
      this.lastName.set(nameParts.slice(1).join(' ') || '');
    }
  }

  private loadAddresses(): void {
    this.userService.getAddresses().subscribe((addresses) => {
      this.addresses.set(addresses);
    });
  }

  setActiveTab(tab: 'profile' | 'addresses' | 'preferences'): void {
    this.activeTab.set(tab);
  }

  toggleEditMode(): void {
    this.editMode.update((v) => !v);
    if (!this.editMode()) {
      this.initFormFromUser();
    }
  }

  saveProfile(): void {
    this.isLoading.set(true);
    this.userService
      .updateProfile({
        firstName: this.firstName(),
        lastName: this.lastName(),
        phone: this.phone(),
      })
      .subscribe({
        next: () => {
          this.editMode.set(false);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  deleteAddress(id: string): void {
    this.userService.deleteAddress(id).subscribe(() => {
      this.addresses.update((list) => list.filter((a) => a.id !== id));
    });
  }

  setDefaultAddress(id: string): void {
    this.userService.setDefaultAddress(id).subscribe(() => {
      this.addresses.update((list) =>
        list.map((a) => ({ ...a, isDefault: a.id === id })),
      );
    });
  }
}
