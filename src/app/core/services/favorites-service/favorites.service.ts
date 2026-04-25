import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../api-service/api.service';
import { Property } from '../../../shared/models/property-models';

export interface AddFavoriteDto {
  property_uuid: string;
}

export interface ProjectFavoritesResponse {
  project_id: string;
  project_name: string;
  total_favorites: number;
  properties: Property[];
}

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private api = inject(ApiService);
  private readonly endpoint = 'property/favorites/';

  getAllFavorites(): Observable<Property[]> {
    return this.api.get<Property[]>(this.endpoint);
  }

  getProjectFavorites(projectUuid: string): Observable<Property[]> {
    return this.api
      .get<ProjectFavoritesResponse>(`property/projects/${projectUuid}/favorites/`)
      .pipe(map((response) => response.properties));
  }

  addFavorite(propertyUuid: string): Observable<void> {
    const data: AddFavoriteDto = { property_uuid: propertyUuid };
    return this.api.post<void>(this.endpoint, data);
  }

  removeFavorite(propertyUuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}${propertyUuid}/`);
  }
}
