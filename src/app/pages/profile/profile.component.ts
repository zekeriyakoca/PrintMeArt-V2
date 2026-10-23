import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, computed, inject, signal, OnInit } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { Field, form, required } from '@angular/forms/signals';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { UserService, Address, UserProfile } from '../../services/user/user.service';
import { Bootstrap } from '../../services/bootstrap/bootstrap';
import { IconComponent } from '../../components/shared/icon/icon.component';

const EMPTY_ADDRESS = { name: '', street1: '', zip: '', city: '', country: 'NL', isDefault: false };

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TranslatePipe, Field, RouterLink, IconComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly auth = inject(AuthenticationService);
  private readonly userService = inject(UserService);
  private readonly bootstrap = inject(Bootstrap);
  private readonly router = inject(Router);
  private readonly regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

  user = this.auth.currentUser;
  profile = signal<UserProfile | null>(null);
  isLoading = signal(false);
  activeTab = signal<'profile' | 'addresses'>('profile');

  countries = computed(() => (this.bootstrap.shippingInfo()?.countries ?? []).map((code) => ({ code, name: this.countryName(code) })).sort((a, b) => a.name.localeCompare(b.name)));

  // Profile form
  editMode = signal(false);
  profileModel = signal({ fullName: '', phone: '' });
  profileForm = form(this.profileModel, (path) => {
    required(path.fullName, { message: 'Full name is required' });
  });

  // Address form: undefined when closed, null when adding a new address
  editingAddress = signal<Address | null | undefined>(undefined);
  addressModel = signal({ ...EMPTY_ADDRESS });
  addressForm = form(this.addressModel, (path) => {
    required(path.name, { message: 'Name is required' });
    required(path.street1, { message: 'Street is required' });
    required(path.zip, { message: 'Postal code is required' });
    required(path.city, { message: 'City is required' });
    required(path.country, { message: 'Country is required' });
  });

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getProfile().subscribe((profile) => this.profile.set(profile));
  }

  setActiveTab(tab: 'profile' | 'addresses'): void {
    this.activeTab.set(tab);
  }

  countryName(code: string): string {
    try {
      return this.regionNames.of(code) ?? code;
    } catch {
      return code;
    }
  }

  toggleEditMode(): void {
    this.editMode.update((v) => !v);
    if (this.editMode()) {
      this.profileModel.set({
        fullName: this.profile()?.fullName || this.user()?.name || '',
        phone: this.profile()?.phone ?? '',
      });
    }
  }

  saveProfile(): void {
    const { fullName, phone } = this.profileModel();
    this.save(this.userService.updateProfile({ fullName, phone }), () => this.editMode.set(false));
  }

  openAddressForm(address?: Address): void {
    this.editingAddress.set(address ?? null);
    this.addressModel.set(
      address
        ? { name: address.name, street1: address.street1, zip: address.zip, city: address.city, country: address.country, isDefault: address.isDefault }
        : { ...EMPTY_ADDRESS, name: this.profile()?.fullName || this.user()?.name || '' },
    );
  }

  closeAddressForm(): void {
    this.editingAddress.set(undefined);
  }

  saveAddress(): void {
    const editing = this.editingAddress();
    // Keep the fields the form does not show (street2, phone, ...) when editing
    const request = { type: 'Shipping', state: '', ...editing, ...this.addressModel() };
    this.save(editing ? this.userService.updateAddress(editing.id, request) : this.userService.addAddress(request), () => this.closeAddressForm());
  }

  deleteAddress(id: number): void {
    this.save(this.userService.deleteAddress(id));
  }

  setDefaultAddress(address: Address): void {
    this.save(this.userService.updateAddress(address.id, { ...address, isDefault: true }));
  }

  private save(request: Observable<UserProfile>, onSuccess?: () => void): void {
    this.isLoading.set(true);
    request.subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isLoading.set(false);
        onSuccess?.();
      },
      error: () => this.isLoading.set(false),
    });
  }
}
