import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { of } from 'rxjs';
import { CommentService } from './comment.service';
import { ApiService } from '../api-service/api.service';
import { createApiServiceMock } from '../../../shared/mocks/api-service.mock';
import {
  mockComment,
  mockCommentByOther,
  mockCreateCommentDto,
} from '../../../shared/mocks/models/comment-models.mock';

describe('CommentService', () => {
  let commentService: CommentService;
  let apiServiceMock: ReturnType<typeof createApiServiceMock>;

  beforeEach(() => {
    apiServiceMock = createApiServiceMock();

    TestBed.configureTestingModule({
      providers: [CommentService, { provide: ApiService, useValue: apiServiceMock }],
    });

    commentService = TestBed.inject(CommentService);
  });

  it('should be created', () => {
    expect(commentService).toBeTruthy();
  });

  describe('getComments', () => {
    it('should call API get with project uuid filter', async () => {
      apiServiceMock.get.mockReturnValue(of([mockComment, mockCommentByOther]));

      const response = await firstValueFrom(commentService.getComments('project-uuid-1'));

      expect(apiServiceMock.get).toHaveBeenCalledWith('property/comments/?project=project-uuid-1');
      expect(response).toEqual([mockComment, mockCommentByOther]);
    });
  });

  describe('createComment', () => {
    it('should call API post with create comment dto', async () => {
      apiServiceMock.post.mockReturnValue(of(mockComment));

      const response = await firstValueFrom(commentService.createComment(mockCreateCommentDto));

      expect(apiServiceMock.post).toHaveBeenCalledWith('property/comments/', mockCreateCommentDto);
      expect(response).toEqual(mockComment);
    });
  });

  describe('deleteComment', () => {
    it('should call API delete with comment uuid', async () => {
      apiServiceMock.delete.mockReturnValue(of(void 0));

      await firstValueFrom(commentService.deleteComment('comment-uuid-1'));

      expect(apiServiceMock.delete).toHaveBeenCalledWith('property/comments/comment-uuid-1/');
    });
  });
});
