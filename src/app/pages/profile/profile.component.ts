import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, computed, inject, signal, OnInit } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { Field, form, required, minLength, validate, customError } from '@angular/forms/signals';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { UserService, UserProfile } from '../../services/user/user.service';
import { Bootstrap } from '../../services/bootstrap/bootstrap';
import { IconComponent } from '../../components/shared/icon/icon.component';
import { validationErrors } from '../../utils/validation-errors';

const EMPTY_ADDRESS = { name: '', street1: '', zip: '', city: '', country: 'NL' };
type AddressFields = typeof EMPTY_ADDRESS;

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

  user = this.auth.currentUser;
  profile = signal<UserProfile | null>(null);
  isLoading = signal(false);
  activeTab = signal<'profile' | 'addresses'>('profile');

  countries = this.bootstrap.shippingCountries;

  // Profile form
  editMode = signal(false);
  profileModel = signal({ fullName: '', phone: '' });
  profileForm = form(this.profileModel, (path) => {
    required(path.fullName, { message: 'Full name is required' });
  });

  // The one saved address
  editingAddress = signal(false);
  addressModel = signal<AddressFields>({ ...EMPTY_ADDRESS });
  addressForm = form(this.addressModel, (path) => {
    required(path.name, { message: 'forms.nameRequired' });
    required(path.street1, { message: 'forms.streetRequired' });
    minLength(path.street1, 3, { message: 'forms.streetShort' });
    required(path.zip, { message: 'forms.postalRequired' });
    validate(path.zip, ({ value, valueOf }) =>
      !value().trim() || this.bootstrap.isPostcodeValid(valueOf(path.country), value()) ? undefined : customError({ kind: 'postcode', message: 'forms.postalFormat' }),
    );
    required(path.city, { message: 'forms.cityRequired' });
    minLength(path.city, 2, { message: 'forms.cityShort' });
    required(path.country, { message: 'forms.countryRequired' });
  });
  postcodeExample = computed(() => this.bootstrap.postcodeExample(this.addressModel().country));
  /** Messages the backend gave per field when it refused the address */
  addressErrors = signal<Partial<Record<keyof AddressFields, string[]>>>({});

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
    return this.countries().find((c) => c.code === code)?.name ?? code;
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

  openAddressForm(): void {
    const address = this.profile()?.defaultAddress;
    this.addressErrors.set({});
    this.editingAddress.set(true);
    this.addressModel.set(
      address
        ? { name: address.name, street1: address.street1, zip: address.zip, city: address.city, country: address.country }
        : { ...EMPTY_ADDRESS, name: this.profile()?.fullName || this.user()?.name || '' },
    );
  }

  closeAddressForm(): void {
    this.editingAddress.set(false);
  }

  saveAddress(): void {
    const saved = this.profile()?.defaultAddress;
    // Keep the fields the form does not show (street2, state, phone)
    const request = { street2: saved?.street2 ?? null, state: saved?.state ?? '', phone: saved?.phone ?? null, ...this.addressModel() };
    this.addressErrors.set({});
    this.save(this.userService.saveAddress(request), () => this.closeAddressForm(), (errors) => this.addressErrors.set(errors));
  }

  private save(request: Observable<UserProfile>, onSuccess?: () => void, onInvalid?: (errors: Record<string, string[]>) => void): void {
    this.isLoading.set(true);
    request.subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isLoading.set(false);
        onSuccess?.();
      },
      error: (err) => {
        this.isLoading.set(false);
        const errors = validationErrors(err);
        if (errors) onInvalid?.(errors);
      },
    });
  }
}
