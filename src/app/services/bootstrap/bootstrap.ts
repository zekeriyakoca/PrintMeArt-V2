import { computed, Injectable, signal, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

export type ShippingZone = {
  name: string;
  countries: string[];
  rate: number;
  freeShippingFrom: number | null;
};

export type ShippingCountry = {
  code: string;
  name: string;
  /** Tested case-insensitively against the trimmed postcode; null when any postcode is fine */
  postcodePattern: string | null;
  postcodeExample: string | null;
};

export type ShippingInfo = {
  currency: string;
  zones: ShippingZone[];
  countries: string[];
  shippingCountries?: ShippingCountry[];
  deliveryDays: number;
  returnDays: number;
};

@Injectable({
  providedIn: 'root',
})
export class Bootstrap {
  private readonly bffUrl = environment.serviceUrls['bff'];
  private readonly _shippingInfo = signal<ShippingInfo | null>(null);

  readonly shippingInfo: Signal<ShippingInfo | null> = this._shippingInfo.asReadonly();

  /** The countries an address can be in, sorted by name */
  readonly shippingCountries = computed<ShippingCountry[]>(() => {
    const info = this._shippingInfo();
    if (info?.shippingCountries?.length) return info.shippingCountries;
    // Older backends only send the codes
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    return (info?.countries ?? [])
      .map((code) => ({ code, name: names.of(code) ?? code, postcodePattern: null, postcodeExample: null }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  constructor(private readonly _httpClient: HttpClient) {}

  fetchShippingInfo() {
    return this._httpClient
      .get<ShippingInfo>(`${this.bffUrl}/bff/v1/ordering/shipping-info`)
      .subscribe((data) => {
        this._shippingInfo.set(data);
      });
  }

  // Mirrors the backend rule; null while shipping info is unknown or nobody ships to the country.
  shippingCost(countryCode: string, subtotal: number): number | null {
    const zone = this._shippingInfo()?.zones.find((z) => z.countries.includes(countryCode));
    if (!zone) {
      return null;
    }
    return zone.freeShippingFrom != null && subtotal >= zone.freeShippingFrom ? 0 : zone.rate;
  }

  // Mirrors the backend rule: the country's postcode pattern, tested on the trimmed value ignoring case.
  isPostcodeValid(countryCode: string, postcode: string): boolean {
    const pattern = this.shippingCountries().find((c) => c.code === countryCode)?.postcodePattern;
    return !pattern || new RegExp(pattern, 'i').test(postcode.trim());
  }

  postcodeExample(countryCode: string): string {
    return this.shippingCountries().find((c) => c.code === countryCode)?.postcodeExample ?? '';
  }

}
