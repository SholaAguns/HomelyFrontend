import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommentFormComponent } from './comment-form.component';

describe('CommentFormComponent', () => {
  let component: CommentFormComponent;
  let fixture: ComponentFixture<CommentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty body', () => {
    expect(component.body).toBe('');
  });

  describe('onSubmit', () => {
    it('should emit submitted with trimmed body and reset body on submit', () => {
      const spy = vi.fn();
      component.submitted.subscribe(spy);
      component.body = '  Great property!  ';

      component.onSubmit();

      expect(spy).toHaveBeenCalledWith('Great property!');
      expect(component.body).toBe('');
    });

    it('should not emit submitted when body is empty', () => {
      const spy = vi.fn();
      component.submitted.subscribe(spy);
      component.body = '   ';

      component.onSubmit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit submitted when body is blank string', () => {
      const spy = vi.fn();
      component.submitted.subscribe(spy);
      component.body = '';

      component.onSubmit();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should emit cancelled and reset body', () => {
      const spy = vi.fn();
      component.cancelled.subscribe(spy);
      component.body = 'Some text';

      component.onCancel();

      expect(spy).toHaveBeenCalled();
      expect(component.body).toBe('');
    });
  });
});
