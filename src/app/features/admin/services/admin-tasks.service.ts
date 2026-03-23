import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminPropertyListTask, PaginatedResponse, QueryParams } from '../models/property.model';

@Injectable({
  providedIn: 'root',
})
export class AdminTasksService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/property/admin/tasks`;

  list(params: QueryParams = {}): Observable<PaginatedResponse<AdminPropertyListTask>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.httpClient.get<PaginatedResponse<AdminPropertyListTask>>(`${this.baseUrl}/`, {
      params: httpParams,
    });
  }

  get(uuid: string): Observable<AdminPropertyListTask> {
    return this.httpClient.get<AdminPropertyListTask>(`${this.baseUrl}/${uuid}/`);
  }

  cancel(uuid: string): Observable<{ success: boolean; message: string }> {
    return this.httpClient.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/${uuid}/cancel/`,
      {}
    );
  }
}
