import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly defaultOptions = { withCredentials: true };

  get<T>(endpoint: string, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { ...this.defaultOptions, ...options });
  }

  post<T>(endpoint: string, body: unknown, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body, {
      ...this.defaultOptions,
      ...options,
    });
  }

  put<T>(endpoint: string, body: unknown, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body, {
      ...this.defaultOptions,
      ...options,
    });
  }

  patch<T>(endpoint: string, body: unknown, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${endpoint}`, body, {
      ...this.defaultOptions,
      ...options,
    });
  }

  delete<T>(endpoint: string, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, {
      ...this.defaultOptions,
      ...options,
    });
  }
}
