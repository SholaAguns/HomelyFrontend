import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskListFormComponent } from './task-list-form.component';
import {
  mockTaskList,
  mockUpdateTaskListDto,
} from '../../../../../shared/mocks/models/task-models.mock';

describe('TaskListFormComponent', () => {
  let component: TaskListFormComponent;
  let fixture: ComponentFixture<TaskListFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskListFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('projectUuid', 'project-uuid-1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form in create mode', () => {
    expect(component.form.get('title')?.value).toBe('');
    expect(component.form.get('description')?.value).toBe('');
    expect(component.isEditing).toBe(false);
  });

  describe('form validation', () => {
    it('should require title', () => {
      const titleControl = component.form.get('title');
      titleControl?.setValue('');
      titleControl?.markAsTouched();
      expect(titleControl?.hasError('required')).toBe(true);
    });

    it('should invalidate form when title is empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should validate form when title is provided', () => {
      component.form.patchValue({ title: 'Viewing Checklist' });
      expect(component.form.valid).toBe(true);
    });
  });

  describe('edit mode', () => {
    it('should return true when existingTaskList is set', () => {
      fixture.componentRef.setInput('existingTaskList', mockTaskList);
      fixture.detectChanges();
      expect(component.isEditing).toBe(true);
    });

    it('should populate form fields from existing task list', async () => {
      fixture.componentRef.setInput('existingTaskList', mockTaskList);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.get('title')?.value).toBe(mockTaskList.title);
      expect(component.form.get('description')?.value).toBe(mockTaskList.description);
    });
  });

  describe('onSubmit', () => {
    it('should not emit submitted when form is invalid', () => {
      const submitSpy = vi.fn();
      component.submitted.subscribe(submitSpy);

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('should emit CreateTaskListDto with project_input in create mode', () => {
      const submitSpy = vi.fn();
      component.submitted.subscribe(submitSpy);

      component.form.patchValue({ title: 'New List', description: 'A description' });
      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledWith({
        project_input: 'project-uuid-1',
        title: 'New List',
        description: 'A description',
      });
    });

    it('should emit UpdateTaskListDto without project_input in edit mode', () => {
      fixture.componentRef.setInput('existingTaskList', mockTaskList);
      fixture.detectChanges();

      const submitSpy = vi.fn();
      component.submitted.subscribe(submitSpy);

      component.form.patchValue({ title: 'Updated List', description: 'Updated desc' });
      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledWith({
        title: 'Updated List',
        description: 'Updated desc',
      });
    });
  });

  describe('onCancel', () => {
    it('should emit cancelled event', () => {
      const cancelSpy = vi.fn();
      component.cancelled.subscribe(cancelSpy);

      component.onCancel();

      expect(cancelSpy).toHaveBeenCalled();
    });
  });
});
