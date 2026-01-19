import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  PropertyList,
  PropertyListDetail,
  CreatePropertyListDto,
  UpdatePropertyListDto,
} from '../../shared/models/property-list-models';

@Injectable({
  providedIn: 'root',
})
export class PropertyListService {
  private api = inject(ApiService);
  private readonly endpoint = 'property/property-lists/';

  getAll(): Observable<PropertyList[]> {
    return this.api.get<PropertyList[]>(this.endpoint);
  }

  getByUuid(uuid: string): Observable<PropertyListDetail> {
    return this.api.get<PropertyListDetail>(`${this.endpoint}${uuid}/`);
  }

  create(data: CreatePropertyListDto): Observable<PropertyList> {
    return this.api.post<PropertyList>(this.endpoint, data);
  }

  update(uuid: string, data: UpdatePropertyListDto): Observable<PropertyList> {
    return this.api.patch<PropertyList>(`${this.endpoint}${uuid}/`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}${uuid}/`);
  }

  activate(uuid: string): Observable<{ status: string; state: string }> {
    return this.api.post<{ status: string; state: string }>(
      `${this.endpoint}${uuid}/activate/`,
      {}
    );
  }
}
