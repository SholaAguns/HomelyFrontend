import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api-service/api.service';

@Injectable({
  providedIn: 'root',
})
export class ShortlistService {
  private apiService = inject(ApiService);
  private readonly endpoint = 'property/shortlists/';

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
