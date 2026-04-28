import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api-service/api.service';
import { ProjectComment, CreateCommentDto } from '../../../shared/models/comment-models';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiService = inject(ApiService);
  private readonly commentEndpoint = 'property/comments/';

  getComments(projectUuid: string): Observable<ProjectComment[]> {
    return this.apiService.get<ProjectComment[]>(`${this.commentEndpoint}?project=${projectUuid}`);
  }

  createComment(dto: CreateCommentDto): Observable<ProjectComment> {
    return this.apiService.post<ProjectComment>(this.commentEndpoint, dto);
  }

  deleteComment(uuid: string): Observable<void> {
    return this.apiService.delete<void>(`${this.commentEndpoint}${uuid}/`);
  }
}
