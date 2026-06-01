import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api-service/api.service';
import {
  PropertyList,
  PropertyListDetail,
  CreatePropertyListDto,
  CreateBlankPropertyListDto,
  UpdatePropertyListDto,
} from '../../../shared/models/property-list-models';

@Injectable({
  providedIn: 'root',
})
export class PropertyListService {
  private api = inject(ApiService);
  private readonly endpoint = 'property/property-lists/';

  getAll(projectUuid?: string): Observable<PropertyList[]> {
    const url = projectUuid ? `${this.endpoint}?project=${projectUuid}` : this.endpoint;
    return this.api.get<PropertyList[]>(url);
  }

  getByUuid(uuid: string): Observable<PropertyListDetail> {
    return this.api.get<PropertyListDetail>(`${this.endpoint}${uuid}/`);
  }

  create(data: CreatePropertyListDto): Observable<PropertyList> {
    return this.api.post<PropertyList>(this.endpoint, data);
  }

  createBlank(data: CreateBlankPropertyListDto): Observable<PropertyList> {
    return this.api.post<PropertyList>(`${this.endpoint}create-blank/`, data);
  }

  update(uuid: string, data: UpdatePropertyListDto): Observable<PropertyList> {
    return this.api.patch<PropertyList>(`${this.endpoint}${uuid}/`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}${uuid}/`);
  }
}
