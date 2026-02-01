import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api-service/api.service';
import {
  CreateFromSearchRequest,
  CreateFromSearchResponse,
  PropertyListTask,
} from '../../../shared/models/property-models';

@Injectable({
  providedIn: 'root',
})
export class PropertyCreationService {
  private apiService = inject(ApiService);

  createFromSearch(
    propertyListUuid: string,
    request: CreateFromSearchRequest
  ): Observable<CreateFromSearchResponse> {
    return this.apiService.post<CreateFromSearchResponse>(
      `property/property-lists/${propertyListUuid}/create-from-search/`,
      request
    );
  }

  getSearchStatus(propertyListUuid: string, taskUuid: string): Observable<PropertyListTask> {
    return this.apiService.get<PropertyListTask>(
      `property/property-lists/${propertyListUuid}/scrape-status/${taskUuid}/`
    );
  }
}
