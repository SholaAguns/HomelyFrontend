import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ContextData } from '../../../shared/models/context-data.models';

@Injectable({ providedIn: 'root' })
export class ContextDataService {
  private readonly baseUrl = `${environment.apiUrl}/property/properties`;

  constructor(private httpClient: HttpClient) {}

  triggerStage2(propertyId: string, services?: string[]): Observable<{ message: string }> {
    return this.httpClient.post<{ message: string }>(
      `${this.baseUrl}/${propertyId}/run-stage2/`,
      services ? { services } : {}
    );
  }

  getContextData(propertyId: string): Observable<ContextData[]> {
    return this.httpClient.get<ContextData[]>(`${this.baseUrl}/${propertyId}/context-data/`);
  }

  getServiceData(propertyId: string, serviceName: string): Observable<ContextData> {
    return this.httpClient.get<ContextData>(
      `${this.baseUrl}/${propertyId}/context-data/${serviceName}/`
    );
  }

  retryService(propertyId: string, serviceName: string): Observable<{ message: string }> {
    return this.httpClient.post<{ message: string }>(
      `${this.baseUrl}/${propertyId}/retry-service/${serviceName}/`,
      {}
    );
  }
}
