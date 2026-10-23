import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, computed, effect, inject, model } from '@angular/core';
import { Field, form, required, email } from '@angular/forms/signals';
import { IconComponent } from '../shared/icon/icon.component';
import { CheckoutUserInfo } from '../../models/checkout-user-info';
import { Bootstrap } from '../../services/bootstrap/bootstrap';

@Component({
  selector: 'app-checkout-user-info',
  imports: [TranslatePipe, Field, IconComponent],
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
    required(schemaPath.firstName, { message: 'forms.firstNameRequired' });
    required(schemaPath.lastName, { message: 'forms.lastNameRequired' });
    required(schemaPath.email, { message: 'forms.emailAddressRequired' });
    email(schemaPath.email, { message: 'forms.emailValid' });
    required(schemaPath.city, { message: 'forms.cityRequired' });
    required(schemaPath.country, { message: 'forms.countryRequired' });
    required(schemaPath.postalCode, { message: 'forms.postalRequired' });
    required(schemaPath.houseNumber, { message: 'forms.houseNumberRequired' });
  });
}
