import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api-service/api.service';
import { AreaValidationResponse } from '../../../shared/models/validation-models';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  private api = inject(ApiService);
  private readonly endpoint = 'property/rightmove/validate-area/';

  validateArea(area: string): Observable<AreaValidationResponse> {
    return this.api.get<AreaValidationResponse>(
      `${this.endpoint}?area=${encodeURIComponent(area)}`
    );
  }
}
