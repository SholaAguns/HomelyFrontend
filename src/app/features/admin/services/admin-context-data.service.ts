import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminContextData, PaginatedResponse, QueryParams } from '../models/property.model';

@Injectable({
  providedIn: 'root',
})
export class AdminContextDataService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/property/admin/context-data`;

  list(params: QueryParams = {}): Observable<PaginatedResponse<AdminContextData>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.httpClient.get<PaginatedResponse<AdminContextData>>(`${this.baseUrl}/`, {
      params: httpParams,
    });
  }

  get(id: number): Observable<AdminContextData> {
    return this.httpClient.get<AdminContextData>(`${this.baseUrl}/${id}/`);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}/`);
  }

  retry(id: number): Observable<{ success: boolean; message: string }> {
    return this.httpClient.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/${id}/retry/`,
      {}
    );
  }

  bulkRetry(ids: number[]): Observable<{ success: boolean; retried_count: number }> {
    return this.httpClient.post<{ success: boolean; retried_count: number }>(
      `${this.baseUrl}/bulk-retry/`,
      { ids }
    );
  }
}
