import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api-service/api.service';
import {
  SavedLocation,
  CreateSavedLocationDto,
  UpdateSavedLocationDto,
} from '../../shared/models/saved-location-models';

@Injectable({
  providedIn: 'root',
})
export class SavedLocationService {
  private api = inject(ApiService);
  private readonly endpoint = 'property/saved-locations/';

  getAll(): Observable<SavedLocation[]> {
    return this.api.get<SavedLocation[]>(this.endpoint);
  }

  getByUuid(uuid: string): Observable<SavedLocation> {
    return this.api.get<SavedLocation>(`${this.endpoint}${uuid}`);
  }

  create(data: CreateSavedLocationDto): Observable<SavedLocation> {
    return this.api.post<SavedLocation>(this.endpoint, data);
  }

  update(uuid: string, data: UpdateSavedLocationDto): Observable<SavedLocation> {
    return this.api.patch<SavedLocation>(`${this.endpoint}${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}${uuid}`);
  }
}
