import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public currentUser = signal({} as User);

  constructor(private _httpClient: HttpClient) {}

  public getToken(): string {
    return localStorage.getItem('authToken') ?? '';
  }

  public setToken(token: string) {
    token = token ? 'Bearer ' + token : '';
    localStorage.setItem('authToken', token);
  }

  public isAuthenticated(): boolean {
    // return true; // Temporary change
    const token = this.getToken();
    return token != '';
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
