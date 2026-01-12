import { Injectable, signal, Signal } from '@angular/core';
import { environment } from '../../../environments/environment.production';
import { HttpClient } from '@angular/common/http';

export type ShippingInfo = {
  freeShippingThreshold: number;
  shippingFee: number;
};

@Injectable({
  providedIn: 'root',
})
export class Bootstrap {
  private readonly bffUrl = environment.serviceUrls['bff'];
  private readonly _shippingInfo = signal<ShippingInfo>({
    freeShippingThreshold: 50,
    shippingFee: 4.95,
  });

  readonly shippingInfo: Signal<ShippingInfo> = this._shippingInfo.asReadonly();

  constructor(private readonly _httpClient: HttpClient) {}

  fetchShippingInfo() {
    return this._httpClient
      .get<ShippingInfo>(`${this.bffUrl}/bff/v1/ordering/shipping-info`)
      .subscribe((data) => {
        this._shippingInfo.set(data);
      });
  }
}
