import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, effect, inject, model, untracked } from '@angular/core';
import { Field, form, required, email, minLength, validate, customError } from '@angular/forms/signals';
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

  /** Messages the backend gave per field when it refused the order; cleared once the details change */
  readonly serverErrors = model<Partial<Record<keyof CheckoutUserInfo, string[]>>>({});

  private readonly bootstrap = inject(Bootstrap);

  countries = this.bootstrap.shippingCountries;

  constructor() {
    effect(() => {
      const isValid = this.userForm().valid();
      this.isFormValid.set(isValid);
    });

    effect(() => {
      this.userDetails();
      untracked(() => this.serverErrors.set({}));
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
    street: '',
    addressDetails: '',
  });

  userForm = form(this.userDetails, (schemaPath) => {
    required(schemaPath.firstName, { message: 'forms.firstNameRequired' });
    required(schemaPath.lastName, { message: 'forms.lastNameRequired' });
    required(schemaPath.email, { message: 'forms.emailAddressRequired' });
    email(schemaPath.email, { message: 'forms.emailValid' });
    required(schemaPath.city, { message: 'forms.cityRequired' });
    minLength(schemaPath.city, 2, { message: 'forms.cityShort' });
    required(schemaPath.country, { message: 'forms.countryRequired' });
    required(schemaPath.postalCode, { message: 'forms.postalRequired' });
    validate(schemaPath.postalCode, ({ value, valueOf }) =>
      !value().trim() || this.bootstrap.isPostcodeValid(valueOf(schemaPath.country), value()) ? undefined : customError({ kind: 'postcode', message: 'forms.postalFormat' }),
    );
    required(schemaPath.street, { message: 'forms.streetRequired' });
    minLength(schemaPath.street, 3, { message: 'forms.streetShort' });
  });

  postcodeExample = () => this.bootstrap.postcodeExample(this.userDetails().country);
}
