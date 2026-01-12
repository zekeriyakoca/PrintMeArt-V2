import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommonApiService {
  constructor(private _httpClient: HttpClient) {}

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);

    return this._httpClient
      .post<string>(
        `${environment.serviceUrls['catalog-api']}/catalog/v1/images/upload`,
        formData,
      )
      .pipe(
        map((response: any) => {
          return response.url as string;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Upload failed:', error);
          return throwError(() => new Error('Failed to upload image.'));
        }),
      );
  }
}
