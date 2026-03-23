import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminStatistics, SystemStatus } from '../models/admin-statistics.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/property/admin`;

  getDashboardStatistics(): Observable<AdminStatistics> {
    return this.httpClient.get<AdminStatistics>(`${this.baseUrl}/dashboard/statistics/`);
  }

  getSystemStatus(): Observable<SystemStatus> {
    return this.httpClient.get<SystemStatus>(`${this.baseUrl}/dashboard/system-status/`);
  }

  retryContextService(contextDataId: number): Observable<{ success: boolean; message: string }> {
    return this.httpClient.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/context-services/${contextDataId}/retry/`,
      {}
    );
  }

  cancelTask(taskUuid: string): Observable<{ success: boolean; message: string }> {
    return this.httpClient.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/tasks/${taskUuid}/cancel/`,
      {}
    );
  }

  bulkDeleteProperties(
    propertyUuids: string[]
  ): Observable<{ success: boolean; deleted_count: number }> {
    return this.httpClient.post<{ success: boolean; deleted_count: number }>(
      `${this.baseUrl}/properties/bulk-delete/`,
      { property_uuids: propertyUuids }
    );
  }

  bulkStageTransition(
    propertyUuids: string[],
    action: 'run_stage2' | 'run_stage3' | 'rerun_services'
  ): Observable<{ success: boolean; processed_count: number; errors: any[] }> {
    return this.httpClient.post<{ success: boolean; processed_count: number; errors: any[] }>(
      `${this.baseUrl}/properties/bulk-transition/`,
      { property_uuids: propertyUuids, action }
    );
  }
}
