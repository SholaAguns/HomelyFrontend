import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../api-service/api.service';
import { Property } from '../../../shared/models/property-models';

interface ProjectShortlistedResponse {
  project_id: string;
  project_name: string;
  total_shortlisted: number;
  properties: Property[];
}

@Injectable({
  providedIn: 'root',
})
export class ShortlistService {
  private apiService = inject(ApiService);
  private readonly endpoint = 'property/shortlists/';

  getProjectShortlisted(projectUuid: string): Observable<Property[]> {
    return this.apiService
      .get<ProjectShortlistedResponse>(`property/projects/${projectUuid}/shortlisted/`)
      .pipe(map((response) => response.properties));
  }

  addToShortlist(propertyListUuid: string, propertyUuid: string): Observable<void> {
    return this.apiService.post<void>(this.endpoint, {
      property_uuid: propertyUuid,
      property_list_uuid: propertyListUuid,
    });
  }

  removeFromShortlist(propertyListUuid: string, propertyUuid: string): Observable<void> {
    return this.apiService.delete<void>(
      `${this.endpoint}${propertyUuid}/?property_list=${propertyListUuid}`
    );
  }
}
