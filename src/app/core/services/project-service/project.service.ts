import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api-service/api.service';
import {
  Project,
  ProjectDetail,
  ProjectStats,
  CreateProjectDto,
  UpdateProjectDto,
  CreateContextOptionsDto,
} from '../../../shared/models/project-models';
import { ContextOptions } from '../../../shared/models/context-options.models';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private api = inject(ApiService);
  private readonly endpoint = 'property/projects/';

  getAll(): Observable<Project[]> {
    return this.api.get<Project[]>(this.endpoint);
  }

  getByUuid(uuid: string): Observable<ProjectDetail> {
    return this.api.get<ProjectDetail>(`${this.endpoint}${uuid}/`);
  }

  create(data: CreateProjectDto): Observable<Project> {
    return this.api.post<Project>(this.endpoint, data);
  }

  update(uuid: string, data: UpdateProjectDto): Observable<Project> {
    return this.api.patch<Project>(`${this.endpoint}${uuid}/`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}${uuid}/`);
  }

  getStats(uuid: string): Observable<ProjectStats> {
    return this.api.get<ProjectStats>(`${this.endpoint}${uuid}/stats/`);
  }

  getContextOptions(uuid: string): Observable<ContextOptions> {
    return this.api.get<ContextOptions>(`${this.endpoint}${uuid}/context-options/`);
  }

  setContextOptions(uuid: string, data: CreateContextOptionsDto): Observable<ContextOptions> {
    return this.api.patch<ContextOptions>(`${this.endpoint}${uuid}/context-options/`, data);
  }
}
