import { Injectable, signal, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

export type ShippingInfo = {
  currency: string;
  rateNl: number;
  rateBeDe: number;
  rateEu: number;
  freeShippingThresholdNl: number;
  deliveryDays: number;
  returnDays: number;
  countries: string[];
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

  // Mirrors the backend rule; null while shipping info or country is unknown.
  shippingCost(countryCode: string, subtotal: number): number | null {
    const info = this._shippingInfo();
    if (!info) {
      return null;
    }
    if (countryCode === 'NL') {
      return subtotal >= info.freeShippingThresholdNl ? 0 : info.rateNl;
    }
    if (countryCode === 'BE' || countryCode === 'DE') {
      return info.rateBeDe;
    }
    return info.countries.includes(countryCode) ? info.rateEu : null;
  }
}
