import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RatingCriteria,
  CreateRatingCriteriaDto,
  UpdateRatingCriteriaDto,
} from '../../shared/models/rating-criteria.models';

@Injectable({
  providedIn: 'root',
})
export class RatingCriteriaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/property/rating-criteria/`;

  getAll(): Observable<RatingCriteria[]> {
    return this.http.get<RatingCriteria[]>(this.apiUrl);
  }

  getById(uuid: string): Observable<RatingCriteria> {
    return this.http.get<RatingCriteria>(`${this.apiUrl}${uuid}/`);
  }

  create(data: CreateRatingCriteriaDto): Observable<RatingCriteria> {
    return this.http.post<RatingCriteria>(`${this.apiUrl}`, data);
  }

  update(uuid: string, data: UpdateRatingCriteriaDto): Observable<RatingCriteria> {
    return this.http.put<RatingCriteria>(`${this.apiUrl}${uuid}/`, data);
  }

  partialUpdate(uuid: string, data: Partial<UpdateRatingCriteriaDto>): Observable<RatingCriteria> {
    return this.http.patch<RatingCriteria>(`${this.apiUrl}${uuid}/`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${uuid}/`);
  }

  copy(uuid: string): Observable<RatingCriteria> {
    return this.http.post<RatingCriteria>(`${this.apiUrl}${uuid}/copy/`, {});
  }
}
