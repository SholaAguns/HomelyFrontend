import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api-service/api.service';
import {
  ContextOptions,
  UpdateContextOptionsDto,
} from '../../../shared/models/property-list-models';

@Injectable({
  providedIn: 'root',
})
export class ContextOptionsService {
  private apiService = inject(ApiService);
  private readonly baseEndpoint = 'property/property-lists/';

  getByPropertyList(propertyListUuid: string): Observable<ContextOptions> {
    return this.apiService.get<ContextOptions>(
      `${this.baseEndpoint}${propertyListUuid}/context-options/`
    );
  }

  update(propertyListUuid: string, data: UpdateContextOptionsDto): Observable<ContextOptions> {
    return this.apiService.patch<ContextOptions>(
      `${this.baseEndpoint}${propertyListUuid}/context-options/`,
      data
    );
  }
}
