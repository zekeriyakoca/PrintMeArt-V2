import { HttpClient } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  orderNumber?: string;
}

export interface ComplianceFormData {
  name: string;
  email: string;
  issueType: 'Copyright' | 'Trademark' | 'Privacy' | 'Other';
  details: string;
  reportedUrl?: string;
  productId?: string;
}

export interface FormSubmitResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly CATALOG_API_URL = environment.serviceUrls['catalog-api'];
  private readonly API_VERSION = 'v1';
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  submitContactForm(data: ContactFormData): Observable<FormSubmitResponse> {
    if (!this.isBrowser) {
      return of({ success: false, message: 'SSR not supported' });
    }

    return this.http.post<FormSubmitResponse>(
      `${this.CATALOG_API_URL}/catalog/${this.API_VERSION}/storefront/contact`,
      data,
    );
  }

  submitComplianceReport(
    data: ComplianceFormData,
  ): Observable<FormSubmitResponse> {
    if (!this.isBrowser) {
      return of({ success: false, message: 'SSR not supported' });
    }

    return this.http.post<FormSubmitResponse>(
      `${this.CATALOG_API_URL}/catalog/${this.API_VERSION}/storefront/compliance`,
      data,
    );
  }
}
