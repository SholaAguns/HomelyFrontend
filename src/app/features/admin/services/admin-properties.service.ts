import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminProperty, PaginatedResponse, QueryParams } from '../models/property.model';

@Injectable({
  providedIn: 'root',
})
export class AdminPropertiesService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/property/admin/properties`;

  list(params: QueryParams = {}): Observable<PaginatedResponse<AdminProperty>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.httpClient.get<PaginatedResponse<AdminProperty>>(`${this.baseUrl}/`, {
      params: httpParams,
    });
  }

  get(uuid: string): Observable<AdminProperty> {
    return this.httpClient.get<AdminProperty>(`${this.baseUrl}/${uuid}/`);
  }

  create(data: Partial<AdminProperty>): Observable<AdminProperty> {
    return this.httpClient.post<AdminProperty>(`${this.baseUrl}/`, data);
  }

  update(uuid: string, data: Partial<AdminProperty>): Observable<AdminProperty> {
    return this.httpClient.patch<AdminProperty>(`${this.baseUrl}/${uuid}/`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${uuid}/`);
  }

  bulkDelete(uuids: string[]): Observable<{ success: boolean; deleted_count: number }> {
    return this.httpClient.post<{ success: boolean; deleted_count: number }>(
      `${this.baseUrl}/bulk-delete/`,
      { uuids }
    );
  }

  bulkTransition(
    uuids: string[],
    action: 'run_stage2' | 'run_stage3' | 'rerun_services'
  ): Observable<{ success: boolean; processed_count: number; errors: any[] }> {
    return this.httpClient.post<{ success: boolean; processed_count: number; errors: any[] }>(
      `${this.baseUrl}/bulk-transition/`,
      { uuids, action }
    );
  }
}
