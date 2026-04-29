import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { CommentStore } from './comment.store';
import { CommentService } from '../../../core/services/comment-service/comment.service';
import { NotificationService } from '../../../core/services/notification-service/notification.service';
import { createCommentServiceMock } from '../../../shared/mocks/comment-service.mock';
import { createNotificationServiceMock } from '../../../shared/mocks/notification-service.mock';
import {
  mockComment,
  mockCommentByOther,
  mockCreateCommentDto,
} from '../../../shared/mocks/models/comment-models.mock';

describe('CommentStore', () => {
  let store: InstanceType<typeof CommentStore>;
  let commentServiceMock: ReturnType<typeof createCommentServiceMock>;
  let notificationServiceMock: ReturnType<typeof createNotificationServiceMock>;

  beforeEach(async () => {
    commentServiceMock = createCommentServiceMock();
    notificationServiceMock = createNotificationServiceMock();

    await TestBed.configureTestingModule({
      providers: [
        CommentStore,
        { provide: CommentService, useValue: commentServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    store = TestBed.inject(CommentStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created with initial state', () => {
    expect(store).toBeTruthy();
    expect(store.comments()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  describe('loadForProject', () => {
    it('should load comments and update state on success', async () => {
      commentServiceMock.getComments.mockReturnValue(of([mockComment, mockCommentByOther]));

      store.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.comments()).toEqual([mockComment, mockCommentByOther]);
      expect(commentServiceMock.getComments).toHaveBeenCalledWith('project-uuid-1');
    });

    it('should set error state on load failure', async () => {
      const error = new Error('Network error');
      commentServiceMock.getComments.mockReturnValue(throwError(() => error));

      store.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Network error');
    });
  });

  describe('createComment', () => {
    it('should prepend new comment to state on success', async () => {
      commentServiceMock.getComments.mockReturnValue(of([mockCommentByOther]));
      store.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));

      commentServiceMock.createComment.mockReturnValue(of(mockComment));
      store.createComment(mockCreateCommentDto);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.comments()[0]).toEqual(mockComment);
      expect(store.comments().length).toBe(2);
    });

    it('should show error notification on create comment failure', async () => {
      commentServiceMock.createComment.mockReturnValue(throwError(() => new Error('Failed')));

      store.createComment(mockCreateCommentDto);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(notificationServiceMock.error).toHaveBeenCalledWith('Failed');
    });
  });

  describe('deleteComment', () => {
    beforeEach(async () => {
      commentServiceMock.getComments.mockReturnValue(of([mockComment, mockCommentByOther]));
      store.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('should remove comment from state on success', async () => {
      commentServiceMock.deleteComment.mockReturnValue(of(void 0));

      store.deleteComment(mockComment.uuid);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.comments().find((c) => c.uuid === mockComment.uuid)).toBeUndefined();
      expect(store.comments().length).toBe(1);
    });

    it('should show error notification on delete comment failure', async () => {
      commentServiceMock.deleteComment.mockReturnValue(throwError(() => new Error('Failed')));

      store.deleteComment(mockComment.uuid);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(notificationServiceMock.error).toHaveBeenCalledWith('Failed');
      expect(store.comments().length).toBe(2);
    });
  });

  describe('clearComments', () => {
    it('should reset state to initial values', async () => {
      commentServiceMock.getComments.mockReturnValue(of([mockComment]));
      store.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.comments().length).toBe(1);

      store.clearComments();

      expect(store.comments()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });
  });
});
