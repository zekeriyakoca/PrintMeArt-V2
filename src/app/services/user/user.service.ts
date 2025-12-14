import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePictureUrl?: string;
  createdAt?: string;
}

export interface Address {
  id: string;
  label?: string;
  fullName: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.serviceUrls['ordering-api'];

  /**
   * Get user profile
   */
  getProfile(): Observable<UserProfile> {
    // TODO: Implement API call
    // return this.http.get<UserProfile>(`${this.baseUrl}/user/profile`);
    return of({} as UserProfile);
  }

  /**
   * Update user profile
   */
  updateProfile(data: UpdateProfileRequest): Observable<UserProfile> {
    // TODO: Implement API call
    // return this.http.put<UserProfile>(`${this.baseUrl}/user/profile`, data);
    return of({} as UserProfile);
  }

  /**
   * Get user addresses
   */
  getAddresses(): Observable<Address[]> {
    // TODO: Implement API call
    // return this.http.get<Address[]>(`${this.baseUrl}/user/addresses`);
    return of([]);
  }

  /**
   * Add new address
   */
  addAddress(address: Omit<Address, 'id'>): Observable<Address> {
    // TODO: Implement API call
    // return this.http.post<Address>(`${this.baseUrl}/user/addresses`, address);
    return of({} as Address);
  }

  /**
   * Update address
   */
  updateAddress(id: string, address: Partial<Address>): Observable<Address> {
    // TODO: Implement API call
    // return this.http.put<Address>(`${this.baseUrl}/user/addresses/${id}`, address);
    return of({} as Address);
  }

  /**
   * Delete address
   */
  deleteAddress(id: string): Observable<void> {
    // TODO: Implement API call
    // return this.http.delete<void>(`${this.baseUrl}/user/addresses/${id}`);
    return of(undefined);
  }

  /**
   * Set default address
   */
  setDefaultAddress(id: string): Observable<void> {
    // TODO: Implement API call
    // return this.http.post<void>(`${this.baseUrl}/user/addresses/${id}/default`, {});
    return of(undefined);
  }
}
