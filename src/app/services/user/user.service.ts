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

export type AddressRequest = Omit<Address, 'id'>;

export interface UserProfile {
  fullName: string;
  phone?: string | null;
  addresses: Address[];
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
}

/**
 * Profile and saved addresses of the signed-in user. Every call returns the updated profile.
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

  addAddress(address: AddressRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.baseUrl}/addresses`, address);
  }

  updateAddress(id: number, address: AddressRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/addresses/${id}`, address);
  }

  deleteAddress(id: number): Observable<UserProfile> {
    return this.http.delete<UserProfile>(`${this.baseUrl}/addresses/${id}`);
  }
}
