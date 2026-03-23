import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminPropertyList, PaginatedResponse, QueryParams } from '../models/property.model';

@Injectable({
  providedIn: 'root',
})
export class AdminListsService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/property/admin/property-lists`;

  list(params: QueryParams = {}): Observable<PaginatedResponse<AdminPropertyList>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.httpClient.get<PaginatedResponse<AdminPropertyList>>(`${this.baseUrl}/`, {
      params: httpParams,
    });
  }

  get(uuid: string): Observable<AdminPropertyList> {
    return this.httpClient.get<AdminPropertyList>(`${this.baseUrl}/${uuid}/`);
  }

  create(data: Partial<AdminPropertyList>): Observable<AdminPropertyList> {
    return this.httpClient.post<AdminPropertyList>(`${this.baseUrl}/`, data);
  }

  update(uuid: string, data: Partial<AdminPropertyList>): Observable<AdminPropertyList> {
    return this.httpClient.patch<AdminPropertyList>(`${this.baseUrl}/${uuid}/`, data);
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
}
