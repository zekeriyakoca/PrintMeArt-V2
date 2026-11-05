import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Address {
  id: number;
  type: string;
  name: string;
  street1: string;
  street2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
}

export type AddressRequest = Pick<Address, 'name' | 'street1' | 'street2' | 'city' | 'state' | 'zip' | 'country' | 'phone'>;

export interface UserProfile {
  fullName: string;
  /** The account email; it cannot be changed here */
  email: string;
  phone?: string | null;
  /** The one saved address, which checkout starts from; null until saved */
  defaultAddress: Address | null;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
}

/**
 * Profile and saved address of the signed-in user. Every call returns the updated profile.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.serviceUrls['bff']}/bff/v1/ordering/profile`;

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.baseUrl);
  }

  updateProfile(data: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.baseUrl, data);
  }

  /** Creates or replaces the saved address */
  saveAddress(address: AddressRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/address`, address);
  }
}
