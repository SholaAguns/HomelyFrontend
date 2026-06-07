import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api-service/api.service';
import {
  Property,
  PropertyDetail,
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyStateTransition,
  CreateFromInputRequest,
  CreateFromInputResponse,
  EnrichPropertyResponse,
} from '../../../shared/models/property-models';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private api = inject(ApiService);
  private readonly endpoint = 'property/properties/';

  getAll(propertyListUuid?: string): Observable<Property[]> {
    const url = propertyListUuid
      ? `${this.endpoint}?property_list=${propertyListUuid}`
      : this.endpoint;
    return this.api.get<Property[]>(url);
  }

  getByUuid(uuid: string): Observable<PropertyDetail> {
    return this.api.get<PropertyDetail>(`${this.endpoint}${uuid}/`);
  }

  create(data: CreatePropertyDto): Observable<Property> {
    return this.api.post<Property>(this.endpoint, data);
  }

  update(uuid: string, data: UpdatePropertyDto): Observable<Property> {
    return this.api.patch<Property>(`${this.endpoint}${uuid}/`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}${uuid}/`);
  }

  runStage2(uuid: string): Observable<PropertyStateTransition> {
    return this.api.post<PropertyStateTransition>(`${this.endpoint}${uuid}/run_stage2/`, {});
  }

  runStage3(uuid: string): Observable<PropertyStateTransition> {
    return this.api.post<PropertyStateTransition>(`${this.endpoint}${uuid}/run_stage3/`, {});
  }

  rerunServices(uuid: string): Observable<PropertyStateTransition> {
    return this.api.post<PropertyStateTransition>(`${this.endpoint}${uuid}/rerun_services/`, {});
  }

  createFromInput(request: CreateFromInputRequest): Observable<CreateFromInputResponse> {
    return this.api.post<CreateFromInputResponse>(`${this.endpoint}create-from-input/`, request);
  }

  enrich(uuid: string): Observable<EnrichPropertyResponse> {
    return this.api.post<EnrichPropertyResponse>(`${this.endpoint}${uuid}/enrich/`, {});
  }

  disqualify(uuid: string, reason: string): Observable<Property> {
    return this.api.post<Property>(`${this.endpoint}${uuid}/disqualify/`, { reason });
  }

  undisqualify(uuid: string): Observable<Property> {
    return this.api.post<Property>(`${this.endpoint}${uuid}/undisqualify/`, {});
  }

  bulkDisqualify(uuids: string[], reason: string): Observable<{ updated: number }> {
    return this.api.post<{ updated: number }>(`${this.endpoint}bulk-disqualify/`, {
      uuids,
      reason,
    });
  }
}
