import { Component, computed, effect, inject, model, output } from '@angular/core';
import { Field, form, required, email } from '@angular/forms/signals';
import { IconComponent } from '../shared/icon/icon.component';
import { CheckoutUserInfo } from '../../models/checkout-user-info';
import { Bootstrap } from '../../services/bootstrap/bootstrap';

@Component({
  selector: 'app-checkout-user-info',
  imports: [Field, IconComponent],
  standalone: true,
  templateUrl: './checkout-user-info.component.html',
  styleUrl: './checkout-user-info.component.scss',
})
export class CheckoutUserInfoComponent {
  readonly isFormValid = model<boolean>();

  private readonly bootstrap = inject(Bootstrap);
  private readonly regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

  countries = computed(() =>
    (this.bootstrap.shippingInfo()?.countries ?? [])
      .map((code) => ({ code, name: this.regionNames.of(code) ?? code }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  );

  constructor() {
    effect(() => {
      const isValid = this.userForm().valid();
      this.isFormValid.set(isValid);
    });

    // Fall back to NL when the prefilled country is not one we ship to.
    effect(() => {
      const countries = this.bootstrap.shippingInfo()?.countries;
      if (countries && !countries.includes(this.userDetails().country)) {
        this.userDetails.update((details) => ({ ...details, country: 'NL' }));
      }
    });
  }

  userDetails = model<CheckoutUserInfo>({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    country: 'NL',
    postalCode: '',
    houseNumber: '',
    addressDetails: '',
  });

  userForm = form(this.userDetails, (schemaPath) => {
    required(schemaPath.firstName, { message: 'First name is required' });
    required(schemaPath.lastName, { message: 'Last name is required' });
    required(schemaPath.email, { message: 'Email address is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    required(schemaPath.city, { message: 'City is required' });
    required(schemaPath.country, { message: 'Country is required' });
    required(schemaPath.postalCode, { message: 'Postal code is required' });
    required(schemaPath.houseNumber, { message: 'House number is required' });
  });
}
