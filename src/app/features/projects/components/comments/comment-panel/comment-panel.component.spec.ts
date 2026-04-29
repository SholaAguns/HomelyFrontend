import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { CommentPanelComponent } from './comment-panel.component';
import { CommentStore } from '../../../store/comment.store';
import { CommentService } from '../../../../../core/services/comment-service/comment.service';
import { AuthService } from '../../../../../core/services/auth-service/auth.service';
import { NotificationService } from '../../../../../core/services/notification-service/notification.service';
import { createCommentServiceMock } from '../../../../../shared/mocks/comment-service.mock';
import { createNotificationServiceMock } from '../../../../../shared/mocks/notification-service.mock';
import {
  mockComment,
  mockCommentByOther,
} from '../../../../../shared/mocks/models/comment-models.mock';

describe('CommentPanelComponent', () => {
  let component: CommentPanelComponent;
  let fixture: ComponentFixture<CommentPanelComponent>;
  let commentServiceMock: ReturnType<typeof createCommentServiceMock>;
  let notificationServiceMock: ReturnType<typeof createNotificationServiceMock>;

  const authServiceMock = {
    currentUserEmail: signal('owner@test.com'),
  };

  beforeEach(async () => {
    commentServiceMock = createCommentServiceMock();
    notificationServiceMock = createNotificationServiceMock();
    commentServiceMock.getComments.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [CommentPanelComponent],
      providers: [
        CommentStore,
        { provide: CommentService, useValue: commentServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('projectUuid', 'project-uuid-1');
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load comments for the given project uuid on init', () => {
      expect(commentServiceMock.getComments).toHaveBeenCalledWith('project-uuid-1');
    });
  });

  describe('ngOnDestroy', () => {
    it('should clear comments on destroy', async () => {
      commentServiceMock.getComments.mockReturnValue(of([mockComment]));
      component.commentStore.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.commentStore.comments().length).toBe(1);

      fixture.destroy();

      expect(component.commentStore.comments()).toEqual([]);
    });
  });

  describe('currentUserEmail', () => {
    it('should return email from auth service', () => {
      expect(component.currentUserEmail).toBe('owner@test.com');
    });
  });

  describe('onCommentSubmitted', () => {
    it('should call createComment on the store with project uuid and body', () => {
      const createSpy = vi.spyOn(component.commentStore, 'createComment');
      commentServiceMock.createComment.mockReturnValue(of(mockComment));

      component.onCommentSubmitted('Nice property!');

      expect(createSpy).toHaveBeenCalledWith({
        project_uuid: 'project-uuid-1',
        body: 'Nice property!',
      });
    });
  });

  describe('onCommentDeleted', () => {
    it('should call deleteComment on the store with the comment uuid', () => {
      const deleteSpy = vi.spyOn(component.commentStore, 'deleteComment');
      commentServiceMock.deleteComment.mockReturnValue(of(void 0));

      component.onCommentDeleted('comment-uuid-1');

      expect(deleteSpy).toHaveBeenCalledWith('comment-uuid-1');
    });
  });

  describe('store state integration', () => {
    it('should reflect loaded comments in the store', async () => {
      commentServiceMock.getComments.mockReturnValue(of([mockComment, mockCommentByOther]));

      component.commentStore.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.commentStore.comments().length).toBe(2);
    });
  });
});
