import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommentItemComponent } from './comment-item.component';
import {
  mockComment,
  mockCommentByOther,
} from '../../../../../shared/mocks/models/comment-models.mock';

describe('CommentItemComponent', () => {
  let component: CommentItemComponent;
  let fixture: ComponentFixture<CommentItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('comment', mockComment);
    fixture.componentRef.setInput('currentUserEmail', 'owner@test.com');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isOwn', () => {
    it('should return true when comment author email matches current user email', () => {
      fixture.componentRef.setInput('currentUserEmail', mockComment.author_email);
      fixture.detectChanges();

      expect(component.isOwn).toBe(true);
    });

    it('should return false when comment author email does not match current user email', () => {
      fixture.componentRef.setInput('comment', mockCommentByOther);
      fixture.componentRef.setInput('currentUserEmail', 'owner@test.com');
      fixture.detectChanges();

      expect(component.isOwn).toBe(false);
    });
  });

  describe('onDelete', () => {
    it('should emit commentDeleted with comment uuid', () => {
      const spy = vi.fn();
      component.commentDeleted.subscribe(spy);

      component.onDelete();

      expect(spy).toHaveBeenCalledWith(mockComment.uuid);
    });
  });
});
