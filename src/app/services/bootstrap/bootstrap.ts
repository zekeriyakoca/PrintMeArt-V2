import { Injectable, signal, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

export type ShippingZone = {
  name: string;
  countries: string[];
  rate: number;
  freeShippingFrom: number | null;
};

export type ShippingInfo = {
  currency: string;
  zones: ShippingZone[];
  countries: string[];
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

}
